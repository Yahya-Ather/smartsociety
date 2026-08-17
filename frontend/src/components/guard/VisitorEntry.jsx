import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Card, Badge, Button, FormField, TextInput } from "../ui/index.js";
import api from "../../services/api.js";
import { VISITOR_TYPE_TO_BACKEND } from "../../utils/mappers.js";

function GuestIcon({ color }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.6" stroke={color} strokeWidth="1.9" />
      <path d="M5 20c0-3.6 3.1-5.8 7-5.8s7 2.2 7 5.8" stroke={color} strokeWidth="1.9" />
    </svg>
  );
}
function DeliveryIcon({ color }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="14" height="9" rx="2" stroke={color} strokeWidth="1.9" />
      <path d="M17 10h2.5l1.5 2.5V16H17v-6Z" stroke={color} strokeWidth="1.9" />
      <circle cx="7.5" cy="17.5" r="1.7" stroke={color} strokeWidth="1.6" />
      <circle cx="16.5" cy="17.5" r="1.7" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}
function CabIcon({ color }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 17V9.5l3-4h10l3 4V17" stroke={color} strokeWidth="1.9" />
      <circle cx="7.5" cy="17.5" r="1.7" stroke={color} strokeWidth="1.7" />
      <circle cx="16.5" cy="17.5" r="1.7" stroke={color} strokeWidth="1.7" />
    </svg>
  );
}
function VendorIcon({ color }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14.5 4.5l5 5-3 3-5-5 3-3Z" stroke={color} strokeWidth="1.9" />
      <path d="M11.5 7.5L4 15v5h5l7.5-7.5" stroke={color} strokeWidth="1.9" />
    </svg>
  );
}
function OtherIcon({ color }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3v1.4" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1" fill={color} />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5A2 2 0 0 1 5.5 6.5h2l1.2-2h6.6l1.2 2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-8Z"
        stroke="#FFFFFF"
        strokeWidth="1.9"
      />
      <circle cx="12" cy="12.5" r="3.4" stroke="#FFFFFF" strokeWidth="1.9" />
    </svg>
  );
}
function CheckIcon({ color = "#0F8B54", size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6.2l2.2 2.3 4.8-5" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

const VISITOR_TYPES = [
  { key: "guest", label: "Guest", Icon: GuestIcon },
  { key: "delivery", label: "Delivery", Icon: DeliveryIcon },
  { key: "cab", label: "Cab", Icon: CabIcon },
  { key: "vendor", label: "Vendor", Icon: VendorIcon },
  { key: "other", label: "Other", Icon: OtherIcon },
];

const EMPTY_FORM = {
  visitorType: null,
  name: "",
  phone: "",
  flatQuery: "",
  selectedFlat: null,
  vehicle: "",
};

export default function VisitorEntry() {
  const { user } = useAuth();
  const [flats, setFlats] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    api.get("/security/flats").then(({ data }) => setFlats(data.data)).catch(() => setFlats([]));
  }, []);

  useEffect(() => stopCamera, []);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  async function openCamera() {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("This browser can't access the camera.");
      return;
    }
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera access was denied. Allow camera permission for this site."
          : "Couldn't access a camera on this device."
      );
    }
  }

  function closeCamera() {
    stopCamera();
    setCameraOpen(false);
    setCameraError("");
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || video.readyState < video.HAVE_CURRENT_DATA) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
      setPhotoBlob(blob);
      setPhotoPreviewUrl(URL.createObjectURL(blob));
      closeCamera();
    }, "image/jpeg", 0.9);
  }

  function retakePhoto() {
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoBlob(null);
    setPhotoPreviewUrl(null);
    openCamera();
  }

  const flatMatches =
    form.flatQuery && !form.selectedFlat
      ? flats
          .filter(
            (f) =>
              `${f.block_name}-${f.flat_number}`.toLowerCase().includes(form.flatQuery.toLowerCase()) ||
              (f.owner_name || "").toLowerCase().includes(form.flatQuery.toLowerCase())
          )
          .slice(0, 5)
      : [];

  const canSubmit = form.visitorType && form.name.trim() && form.phone.trim() && form.selectedFlat;

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function pickFlat(f) {
    update({ selectedFlat: f, flatQuery: `${f.block_name}-${f.flat_number}` });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const body = new FormData();
      body.append("visitor_name", form.name.trim());
      body.append("phone", form.phone.trim());
      body.append("vehicle_number", form.vehicle.trim());
      body.append("visitor_type", VISITOR_TYPE_TO_BACKEND[form.visitorType] || "Guest");
      body.append("flat_id", form.selectedFlat._id);
      if (photoBlob) body.append("photo", photoBlob, "visitor.jpg");
      const { data } = await api.post("/security/walk-in", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const time = new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: false });
      setSubmitted({
        id: String(data.data._id).padStart(6, "0"),
        name: form.name.trim(),
        type: form.visitorType,
        flat: form.selectedFlat,
        time,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to log visitor entry.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSubmitted(null);
    setForm(EMPTY_FORM);
    setError("");
    closeCamera();
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoBlob(null);
    setPhotoPreviewUrl(null);
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 text-center py-4">
        <div className="w-28 h-28 rounded-full bg-success-bg border-4 border-success-fg flex items-center justify-center">
          <svg width="52" height="52" viewBox="0 0 34 34" fill="none" aria-hidden="true">
            <path d="M9 17.5l5.5 5.5L25 12.5" stroke="#0F8B54" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading font-extrabold text-h1 m-0">Visitor Logged</h1>
          <p className="text-body-lg text-slate-600 m-0 max-w-md">
            {submitted.name} has been recorded as entering at <strong>{submitted.time}</strong>.
          </p>
        </div>

        <Card padded={false} className="w-full text-left overflow-hidden">
          <div className="px-5 py-4 bg-brand-700 flex items-center justify-between gap-4">
            <span className="text-label uppercase text-brand-100">Entry reference</span>
            <span className="font-mono text-xl text-white tracking-wide">ENT-{submitted.id}</span>
          </div>
          <div className="p-5 flex flex-col gap-2.5">
            {photoPreviewUrl && (
              <img src={photoPreviewUrl} alt="Visitor" className="w-16 h-16 rounded-lg object-cover mb-1" />
            )}
            <SummaryRow label="Visitor" value={submitted.name} />
            <SummaryRow label="Type" value={<Badge tone="teal">{capitalize(submitted.type)}</Badge>} />
            <SummaryRow label="Flat" value={`${submitted.flat.block_name}-${submitted.flat.flat_number}`} />
            <SummaryRow label="Entry time" value={submitted.time} mono />
            <SummaryRow label="Logged by" value={user?.name ?? "Guard"} />
          </div>
        </Card>

        <div className="w-full flex flex-col gap-3">
          <Button size="lg" className="w-full h-16 text-lg" onClick={resetForm}>
            Log Another Visitor
          </Button>
          <div className="flex gap-3">
            <Link to="/guard" className="flex-1">
              <Button variant="secondary" size="lg" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
            <Link to="/guard/verify-pass" className="flex-1">
              <Button variant="secondary" size="lg" className="w-full">
                Verify a Pass
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-[900px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">Log Visitor Entry</h1>
          <span className="text-body text-slate-500">Walk-in · no pre-approved pass</span>
        </div>
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-success-bg border border-success-fg self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-success-fg animate-pulse" />
          <span className="text-body font-semibold text-success-fg">Entry time recorded automatically</span>
        </div>
      </div>

      {error && <span className="text-body font-semibold text-danger-fg">{error}</span>}

      <Card className="flex flex-col gap-5">
        {/* Photo capture — real device camera via getUserMedia, captured to a JPEG
            and uploaded with the entry (falls back to local disk if Cloudinary
            isn't configured — see Backend/src/config/cloudinary.js). */}
        <div className="flex flex-col sm:flex-row gap-4">
          {cameraOpen ? (
            <div className="flex-1 min-h-[220px] rounded-panel overflow-hidden bg-[#0E1420] flex flex-col items-center justify-center gap-3 p-4 relative">
              {cameraError ? (
                <div className="flex flex-col items-center gap-3 text-center py-6">
                  <span className="text-white font-heading font-bold">{cameraError}</span>
                  <Button type="button" variant="secondary" size="sm" onClick={closeCamera}>
                    Close
                  </Button>
                </div>
              ) : (
                <>
                  <video ref={videoRef} className="w-full max-w-xs aspect-square object-cover rounded-xl" muted playsInline />
                  <div className="flex gap-2.5">
                    <Button type="button" variant="secondary" size="sm" onClick={closeCamera}>
                      Cancel
                    </Button>
                    <Button type="button" variant="guard" size="sm" onClick={capturePhoto}>
                      Capture
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : photoPreviewUrl ? (
            <div className="flex-1 min-h-[170px] rounded-panel border-[3px] border-success-fg bg-success-bg flex flex-col sm:flex-row items-center gap-4 p-4">
              <img src={photoPreviewUrl} alt="Captured visitor" className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
              <div className="flex flex-col items-center sm:items-start gap-1.5">
                <span className="font-heading font-extrabold text-lg text-success-fg">Photo Captured</span>
                <span className="text-body text-success-fg">Attached to this entry</span>
                <button type="button" onClick={retakePhoto} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                  Retake
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={openCamera}
              className="flex-1 min-h-[170px] rounded-panel border-[3px] border-dashed border-brand-500 bg-brand-100 hover:bg-brand-200 flex flex-col items-center justify-center gap-3 transition-colors"
            >
              <span className="w-16 h-16 rounded-xl flex items-center justify-center bg-brand-500">
                <CameraIcon />
              </span>
              <span className="flex flex-col items-center gap-1">
                <span className="font-heading font-extrabold text-lg text-brand-700">Tap to Capture Photo</span>
                <span className="text-body text-brand-600">Gate camera · optional</span>
              </span>
            </button>
          )}
        </div>

        {/* Visitor type */}
        <div className="flex flex-col gap-2.5">
          <span className="text-label uppercase text-slate-600">Visitor type · one tap</span>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
            {VISITOR_TYPES.map(({ key, label, Icon }) => {
              const active = form.visitorType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => update({ visitorType: key })}
                  className={`min-h-[88px] rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-colors ${
                    active
                      ? "border-teal-600 bg-teal-100"
                      : "border-slate-300 bg-white hover:border-brand-500 hover:bg-brand-50"
                  }`}
                >
                  <Icon color={active ? "#06403E" : "#2E3A4D"} />
                  <span className={`text-body-lg font-bold ${active ? "text-teal-700" : "text-slate-800"}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Name + phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Visitor name" required>
            <TextInput
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Full name"
            />
          </FormField>
          <FormField label="Phone" required helper="numeric keypad">
            <TextInput
              value={form.phone}
              onChange={(e) => update({ phone: e.target.value.replace(/[^\d ]/g, "") })}
              inputMode="numeric"
              placeholder="98xxx xxxxx"
              className="font-mono"
            />
          </FormField>
        </div>

        {/* Flat lookup */}
        <FormField
          label="Target flat · type to search"
          required
          helper="Read the resident's name back to the visitor before allowing entry."
        >
          <div className="relative">
            <TextInput
              value={form.flatQuery}
              onChange={(e) => update({ flatQuery: e.target.value, selectedFlat: null })}
              placeholder="e.g. B-204 or resident name"
              className={form.selectedFlat ? "border-success-fg" : ""}
            />
            {flatMatches.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden">
                {flatMatches.map((f) => (
                  <button
                    key={f._id}
                    type="button"
                    onClick={() => pickFlat(f)}
                    className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-brand-50 text-left border-b border-slate-100 last:border-0"
                  >
                    <span className="font-mono font-semibold text-body-lg text-slate-800 w-20 flex-shrink-0">
                      {f.block_name}-{f.flat_number}
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="text-body font-semibold truncate">{f.owner_name || "—"}</span>
                      <span className="text-xs text-slate-400">
                        {f.occupancy_type} · {f.owner_phone || "—"}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {form.selectedFlat && (
            <div className="flex items-center gap-3 mt-2 p-3 rounded-lg bg-success-bg border border-success-fg">
              <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-heading font-bold text-xs flex-shrink-0">
                {initialsOf(form.selectedFlat.owner_name || "?")}
              </div>
              <span className="flex-1 min-w-0 text-body">
                <strong>{form.selectedFlat.owner_name || "Resident"}</strong> · {form.selectedFlat.occupancy_type} ·{" "}
                {form.selectedFlat.owner_phone || "—"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-success-fg text-xs font-bold flex-shrink-0">
                <CheckIcon /> Matched
              </span>
            </div>
          )}
        </FormField>

        {/* Vehicle */}
        <FormField label="Vehicle number" helper="optional">
          <TextInput
            value={form.vehicle}
            onChange={(e) => update({ vehicle: e.target.value })}
            placeholder="MH-02 ·· ····"
            className="font-mono max-w-xs"
          />
        </FormField>
      </Card>

      {/* Sticky confirm bar */}
      <div className="sticky bottom-0 z-10 bg-white border-t-2 border-slate-200 shadow-lg rounded-panel px-4 md:px-5 py-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 min-w-0 flex flex-col gap-0.5 text-center sm:text-left">
          <span className="text-body-lg font-bold truncate">
            {form.name || "New visitor"} · {form.visitorType ? capitalize(form.visitorType) : "Select type"}
            {form.selectedFlat ? ` → ${form.selectedFlat.block_name}-${form.selectedFlat.flat_number}` : ""}
          </span>
          <span className="font-mono text-xs text-slate-500">GATE ENTRY</span>
        </div>
        <Button type="button" variant="secondary" size="lg" onClick={resetForm} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={!canSubmit || submitting} className="w-full sm:w-auto">
          {submitting ? "Confirming…" : "Confirm Entry"}
        </Button>
      </div>
    </form>
  );
}

function SummaryRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-3 text-body">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function initialsOf(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
