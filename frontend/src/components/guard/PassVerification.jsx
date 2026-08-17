import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import jsQR from "jsqr";
import { Card, Badge, Button, FormField } from "../ui/index.js";
import api from "../../services/api.js";
import { VERIFICATION_STATUS } from "../../utils/status.js";
import { VISITOR_TYPE_FROM_BACKEND } from "../../utils/mappers.js";
import { useAuth } from "../../context/AuthContext.jsx";

function CheckIcon({ color = "#0F8B54", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6.2l2.2 2.3 4.8-5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function XIcon({ color = "#C0392F", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3.2 3.2l5.6 5.6M8.8 3.2l-5.6 5.6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function BackspaceIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 5.5h11v13H9L3 12l6-6.5Z" stroke="#2E3A4D" strokeWidth="1.9" />
      <path d="M11.5 9.5l5 5M16.5 9.5l-5 5" stroke="#2E3A4D" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

const CODE_LENGTH = 6;

function resultCopy(result) {
  if (result.status === "used") {
    return {
      title: "ALREADY USED",
      message: "This pass has already been used and the visitor is on the premises.",
    };
  }
  if (result.status === "expired") {
    return {
      title: "PASS EXPIRED",
      message: "This pass has already been used and the visitor has exited.",
    };
  }
  return {
    title: "INVALID CODE",
    message: `No pass exists for code ${result.enteredCode}. Check the digits or scan the QR again.`,
  };
}

export default function PassVerification() {
  const { user } = useAuth();
  const gateNumber = user?.gate?.match(/\d+/)?.[0] ?? "1";
  const [mode, setMode] = useState("manual");
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [recent, setRecent] = useState([]);
  const [now, setNow] = useState(new Date());
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const scanCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }

  function scanLoop() {
    const video = videoRef.current;
    const canvas = scanCanvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const decoded = jsQR(imageData.data, imageData.width, imageData.height);
    if (decoded && decoded.data) {
      stopCamera();
      runVerify(decoded.data.trim());
      return;
    }
    rafRef.current = requestAnimationFrame(scanLoop);
  }

  async function startCamera() {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("This browser can't access the camera. Use manual entry instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
      rafRef.current = requestAnimationFrame(scanLoop);
    } catch (err) {
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera access was denied. Allow camera permission for this site, or use manual entry."
          : "Couldn't access a camera on this device. Use manual entry instead."
      );
    }
  }

  useEffect(() => {
    if (mode === "scan" && !result) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, result]);

  const timeStr = now.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  async function runVerify(digits) {
    if (!digits || digits.length === 0) return;
    setVerifying(true);
    const time = now.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: false });
    try {
      const { data } = await api.post("/security/verify-pass", { gate_pass_code: digits });
      const v = data.data;
      const flat = v.flat_id && typeof v.flat_id === "object" ? v.flat_id : null;
      const record = {
        status: "valid",
        enteredCode: digits,
        code: v.gate_pass_code,
        name: v.visitor_name,
        type: VISITOR_TYPE_FROM_BACKEND[v.visitor_type] || "guest",
        flat: flat ? `${flat.block_name.replace(/^Tower\s*/i, "")}-${flat.flat_number}` : "—",
        resident: flat?.owner_name || "",
        residentRole: flat?.occupancy_type || "",
        vehicle: v.vehicle_number || "",
        window: v.valid_till ? `until ${new Date(v.valid_till).toLocaleString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : "",
        time,
      };
      setResult(record);
      setRecent((list) => [{ id: `v-${Date.now()}`, name: record.name, flat: record.flat, code: record.code, status: "valid", time }, ...list].slice(0, 6));
    } catch (err) {
      const message = err.response?.data?.message || "";
      const status = message.includes("already been used") || message.includes("currently on premises")
        ? "used"
        : message.includes("expired") || message.includes("exited")
        ? "expired"
        : "not_found";
      const record = { status, enteredCode: digits, code: digits, time };
      setResult(record);
      setRecent((list) => [{ id: `v-${Date.now()}`, name: "Unknown / rejected code", flat: null, code: digits, status, time }, ...list].slice(0, 6));
    } finally {
      setVerifying(false);
    }
  }

  function pressDigit(d) {
    if (code.length >= CODE_LENGTH) return;
    setCode((c) => c + d);
  }
  function backspace() {
    setCode((c) => c.slice(0, -1));
  }
  function clearAll() {
    setCode("");
  }
  function scanAgain() {
    setResult(null);
    setCode("");
  }
  function switchMode(next) {
    setMode(next);
    setResult(null);
  }

  return (
    <div className="flex flex-col gap-5 max-w-[860px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">Verify Pass</h1>
          <span className="text-body text-slate-500">Resident-generated QR or 6-digit gate code</span>
        </div>
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-success-bg border border-success-fg self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-success-fg animate-pulse" />
          <span className="font-mono text-body font-semibold text-success-fg">Scanner online · {timeStr}</span>
        </div>
      </div>

      {/* Segmented mode control */}
      <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-200 rounded-xl max-w-md">
        <button
          type="button"
          onClick={() => switchMode("scan")}
          className={`h-14 rounded-lg text-body-lg font-bold flex items-center justify-center gap-2 transition-colors ${
            mode === "scan" ? "bg-brand-700 text-white" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          Scan QR
        </button>
        <button
          type="button"
          onClick={() => switchMode("manual")}
          className={`h-14 rounded-lg text-body-lg font-bold flex items-center justify-center gap-2 transition-colors ${
            mode === "manual" ? "bg-brand-700 text-white" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          Enter Code Manually
        </button>
      </div>

      {/* Result state takes over the frame */}
      {result && result.status === "valid" && (
        <div className="rounded-panel bg-success-fg p-6 md:p-8 flex flex-col items-center gap-5 text-center">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <svg width="48" height="48" viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <path d="M9 17.5l5.5 5.5L25 12.5" stroke="#0F8B54" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="font-heading font-extrabold text-3xl md:text-4xl text-white tracking-tight">
              PASS VALID
            </span>
            <span className="text-body-lg text-white/85">Verified at {result.time} · allow entry</span>
          </div>

          <div className="w-full max-w-lg bg-white rounded-panel p-5 flex flex-col gap-3 text-left">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-heading font-extrabold text-xl">{result.name}</span>
              <Badge tone="teal">{capitalize(result.type)}</Badge>
              <span className="font-mono text-xs text-slate-500">{result.code}</span>
            </div>
            <div className="flex flex-col gap-1.5 text-body text-slate-700">
              <span>
                <strong className="font-mono">{result.flat}</strong> · {result.resident} · {result.residentRole}
              </span>
              {result.window && (
                <span>
                  Valid <strong>{result.window}</strong>
                </span>
              )}
              {result.vehicle && <span className="font-mono">{result.vehicle}</span>}
            </div>
          </div>

          <div className="w-full max-w-lg flex gap-3">
            <Link to="/guard" className="flex-1">
              <button
                type="button"
                className="w-full h-16 rounded-xl bg-white text-success-fg font-heading font-extrabold text-lg hover:bg-success-bg transition-colors"
              >
                Confirm Entry
              </button>
            </Link>
            <button
              type="button"
              onClick={scanAgain}
              className="h-16 px-6 rounded-xl border-2 border-white/55 text-white font-bold text-body-lg hover:bg-white/15 transition-colors flex-shrink-0"
            >
              Scan next
            </button>
          </div>
        </div>
      )}

      {result && result.status !== "valid" && (
        <div className="rounded-panel bg-danger-fg p-6 md:p-8 flex flex-col items-center gap-5 text-center">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <svg width="44" height="44" viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <path d="M10 10l14 14M24 10L10 24" stroke="#C0392F" strokeWidth="4.2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="font-heading font-extrabold text-3xl md:text-4xl text-white tracking-tight">
              {resultCopy(result).title}
            </span>
            <span className="text-body-lg text-white/90 max-w-md">{resultCopy(result).message}</span>
          </div>

          <div className="w-full max-w-lg flex gap-3">
            <Link to="/guard/visitor-entry" className="flex-1">
              <button
                type="button"
                className="w-full h-16 rounded-xl bg-white text-danger-fg font-heading font-extrabold text-lg hover:bg-danger-bg transition-colors"
              >
                Log as Walk-in Instead
              </button>
            </Link>
            <button
              type="button"
              onClick={scanAgain}
              className="h-16 px-6 rounded-xl border-2 border-white/55 text-white font-bold text-body-lg hover:bg-white/15 transition-colors flex-shrink-0"
            >
              Scan again
            </button>
          </div>
        </div>
      )}

      {/* Scan mode body — live camera feed decoded in-browser with jsQR. */}
      {!result && mode === "scan" && (
        <div className="rounded-panel bg-[#0E1420] p-6 md:p-8 flex flex-col items-center gap-5">
          <div className="relative w-full max-w-[320px] aspect-square rounded-xl bg-slate-800 overflow-hidden">
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover ${cameraReady ? "opacity-100" : "opacity-0"}`}
              muted
              playsInline
            />
            <canvas ref={scanCanvasRef} className="hidden" />
            <span className="absolute top-3 left-3 w-10 h-10 border-t-4 border-l-4 border-teal-300 rounded-tl-lg" />
            <span className="absolute top-3 right-3 w-10 h-10 border-t-4 border-r-4 border-teal-300 rounded-tr-lg" />
            <span className="absolute bottom-3 left-3 w-10 h-10 border-b-4 border-l-4 border-teal-300 rounded-bl-lg" />
            <span className="absolute bottom-3 right-3 w-10 h-10 border-b-4 border-r-4 border-teal-300 rounded-br-lg" />
            {cameraReady && (
              <span className="absolute left-8 right-8 top-1/2 h-1 rounded bg-teal-300 shadow-[0_0_16px_3px_rgba(110,207,201,0.6)] animate-pulse" />
            )}
            <span className="absolute left-0 right-0 bottom-0 px-4 py-2.5 bg-black/50 font-mono text-[10px] text-teal-200 text-center">
              GATE {gateNumber} CAM {cameraReady ? "· LIVE" : ""}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="font-heading font-bold text-lg text-white">
              {cameraError ? "Camera unavailable" : "Align QR code within the frame"}
            </span>
            <span className="text-body text-teal-200 max-w-sm">
              {cameraError || (cameraReady ? "Verifies automatically · usually under 2 seconds" : "Requesting camera access…")}
            </span>
          </div>
          <Button variant="guard" size="lg" onClick={() => switchMode("manual")}>
            Enter Code Manually
          </Button>
        </div>
      )}

      {/* Manual entry mode body */}
      {!result && mode === "manual" && (
        <Card className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <FormField label={`Gate pass code · ${CODE_LENGTH} digits`} helper="The resident's app shows this code beneath the QR.">
              <div className="grid grid-cols-6 gap-2 max-w-sm">
                {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-16 sm:h-20 rounded-lg border-2 flex items-center justify-center font-mono text-2xl font-semibold ${
                      code.length === i ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-white"
                    }`}
                  >
                    {code[i] ?? ""}
                  </div>
                ))}
              </div>
            </FormField>
            <Button
              variant="guard"
              size="lg"
              className="w-full sm:w-auto"
              disabled={code.length !== CODE_LENGTH || verifying}
              onClick={() => runVerify(code)}
            >
              {verifying ? "Verifying…" : "Verify"}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full sm:w-[260px] flex-shrink-0">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => pressDigit(d)}
                className="h-16 rounded-lg border-2 border-slate-300 bg-white font-mono text-2xl font-semibold hover:border-brand-500 hover:bg-brand-50 transition-colors"
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="h-16 rounded-lg border-2 border-slate-200 bg-slate-100 text-body font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => pressDigit("0")}
              className="h-16 rounded-lg border-2 border-slate-300 bg-white font-mono text-2xl font-semibold hover:border-brand-500 hover:bg-brand-50 transition-colors"
            >
              0
            </button>
            <button
              type="button"
              onClick={backspace}
              className="h-16 rounded-lg border-2 border-slate-300 bg-white flex items-center justify-center hover:border-brand-500 hover:bg-brand-50 transition-colors"
              aria-label="Backspace"
            >
              <BackspaceIcon />
            </button>
          </div>
        </Card>
      )}

      {/* Recent verifications */}
      <Card padded={false} className="flex flex-col">
        <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3.5 border-b border-slate-200">
          <h3 className="font-heading font-semibold text-h3 m-0">Recent verifications</h3>
        </div>
        <div className="flex flex-col">
          {recent.length === 0 && (
            <div className="px-4 md:px-5 py-5 text-body text-slate-400 text-center">No verifications yet this shift.</div>
          )}
          {recent.map((r) => {
            const s = VERIFICATION_STATUS[r.status] ?? VERIFICATION_STATUS.not_found;
            return (
              <div
                key={r.id}
                className="flex items-center gap-3 px-4 md:px-5 py-2.5 border-b border-slate-100 last:border-0"
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    r.status === "valid" ? "bg-success-bg" : "bg-danger-bg"
                  }`}
                >
                  {r.status === "valid" ? <CheckIcon /> : <XIcon />}
                </span>
                <span className="flex-1 min-w-0 text-body font-semibold truncate">
                  {r.name}
                  {r.flat && <span className="font-normal text-slate-500"> → {r.flat}</span>}
                </span>
                <span className="font-mono text-xs text-slate-500 flex-shrink-0 hidden sm:inline">{r.code}</span>
                <Badge tone={s.tone} className="flex-shrink-0">
                  {s.label}
                </Badge>
                <span className="font-mono text-xs text-slate-400 flex-shrink-0">{r.time}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
