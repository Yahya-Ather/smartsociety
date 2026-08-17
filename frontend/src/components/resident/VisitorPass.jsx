import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Card, Badge, Button, Modal, FormField, TextInput } from "../ui/index.js";
import { IconVisitorPass } from "../common/icons.jsx";
import api from "../../services/api.js";
import { mapVisitorPass, VISITOR_TYPE_TO_BACKEND } from "../../utils/mappers.js";
import { PASS_STATUS } from "../../utils/status.js";

const VISITOR_TYPES = [
  { id: "guest", label: "Guest" },
  { id: "delivery", label: "Delivery" },
  { id: "cab", label: "Cab" },
  { id: "vendor", label: "Vendor" },
];

// Real, scannable QR, rendered to a <canvas> (not <svg>) so it can be read
// back out as a bitmap to compose into the shareable card — encodes the same
// gate_pass_code the gate's Pass Verification screen looks up via
// POST /api/security/verify-pass. Rendered well above its display size (CSS
// scales it back down) so the bitmap stays crisp when it's drawn larger into
// the composite share image below.
const QR_RENDER_SIZE = 240;
function PassQR({ code, canvasRef, boxSize = 76, className = "" }) {
  const padding = 6;
  const displaySize = boxSize - padding * 2;
  return (
    <div
      className={`bg-white border border-slate-200 rounded-md flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: boxSize, height: boxSize, padding }}
    >
      <QRCodeCanvas
        ref={canvasRef}
        value={code}
        size={QR_RENDER_SIZE}
        style={{ width: displaySize, height: displaySize }}
        bgColor="#FFFFFF"
        fgColor="#1B2434"
        level="M"
      />
    </div>
  );
}

// Bakes the QR and the pass details into one PNG so all of it travels
// together as a single image — clipboard "paste" and chat apps only ever
// keep one representation of what's copied, so info as separate plain text
// next to the image gets dropped by the receiving app more often than not.
function buildShareCard(qrCanvas, pass) {
  const width = 480;
  const qrSize = 260;
  const padding = 28;
  const headerH = 60;
  const qrTop = headerH + padding;
  const qrLeft = (width - qrSize) / 2;
  const infoTop = qrTop + qrSize + padding;
  const lineGap = 30;
  const infoLines = [
    { text: pass.name, font: "bold 22px system-ui, -apple-system, sans-serif", color: "#1B2434" },
    { text: `${pass.type.toUpperCase()} · CODE ${pass.id}`, font: "600 16px ui-monospace, Menlo, monospace", color: "#3D4B5F" },
    { text: `VALID ${(pass.window || "").toUpperCase()}`, font: "600 14px system-ui, -apple-system, sans-serif", color: "#0A7A76" },
  ];
  const footerText = "Show this QR or the code above at the gate";
  const height = infoTop + infoLines.length * lineGap + 46;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  const grad = ctx.createLinearGradient(0, 0, width, 0);
  grad.addColorStop(0, "#0A3D7A");
  grad.addColorStop(1, "#0E9A94");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, headerH);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 19px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SmartSociety · Visitor Gate Pass", width / 2, headerH / 2);

  if (qrCanvas) {
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 1;
    ctx.strokeRect(qrLeft - 1, qrTop - 1, qrSize + 2, qrSize + 2);
    ctx.drawImage(qrCanvas, qrLeft, qrTop, qrSize, qrSize);
  }

  let y = infoTop + lineGap / 2;
  ctx.textAlign = "center";
  for (const line of infoLines) {
    ctx.font = line.font;
    ctx.fillStyle = line.color;
    ctx.fillText(line.text, width / 2, y);
    y += lineGap;
  }

  ctx.font = "13px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#8A94A3";
  ctx.fillText(footerText, width / 2, y + 4);

  return canvas;
}

function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultForm() {
  const from = new Date();
  const until = new Date(from.getTime() + 2 * 60 * 60 * 1000); // +2h default window
  return { name: "", phone: "", type: "guest", vehicle: "", from: toLocalInputValue(from), until: toLocalInputValue(until) };
}

// Fallback for browsers/contexts where the async Clipboard API is blocked
// (denied permission, insecure context) — the old select+execCommand path.
function legacyCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

export default function VisitorPass() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passes, setPasses] = useState([]);
  const [tab, setTab] = useState("active");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm());
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedKind, setCopiedKind] = useState(null);
  const [sharingId, setSharingId] = useState(null);
  const qrCanvases = useRef({});

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/resident/visitor-passes");
      setPasses(data.data.map(mapVisitorPass).sort((a, b) => new Date(b.raw.createdAt) - new Date(a.raw.createdAt)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load visitor passes.");
    } finally {
      setLoading(false);
    }
  }

  const active = passes.filter((p) => p.bucket === "active");
  const history = passes.filter((p) => p.bucket === "history");

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function openModal() {
    setForm(defaultForm());
    setFormError("");
    setModalOpen(true);
  }

  async function handleGenerate() {
    if (!form.name.trim() || !form.phone.trim()) {
      setFormError("Visitor name and phone are required.");
      return;
    }
    if (!form.from || !form.until) {
      setFormError("Please set both valid-from and valid-until.");
      return;
    }
    if (new Date(form.until).getTime() <= new Date(form.from).getTime()) {
      setFormError("Valid-until must be after valid-from — the pass needs a real window.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/resident/visitor-pass", {
        visitor_name: form.name.trim(),
        phone: form.phone.trim(),
        vehicle_number: form.vehicle.trim(),
        visitor_type: VISITOR_TYPE_TO_BACKEND[form.type] || "Guest",
        valid_from: new Date(form.from).toISOString(),
        valid_till: new Date(form.until).toISOString(),
      });
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to generate pass.");
    } finally {
      setSubmitting(false);
    }
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return legacyCopy(text);
    }
  }

  // Copies the composite share-card image straight to the clipboard so it
  // can be pasted directly into WhatsApp Web/Desktop, email, etc. with
  // Ctrl+V — no download step, and the info rides along baked into the
  // picture rather than as a separate clipboard format that pasting apps
  // are free to ignore. Falls back to plain text, then to nothing (shows
  // the code on screen) if the browser blocks clipboard image writes.
  async function copyPassToClipboard(blob, text) {
    if (blob && window.ClipboardItem && navigator.clipboard?.write) {
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        return "image";
      } catch {
        // Clipboard image writes blocked — fall through to text-only copy.
      }
    }
    return (await copyText(text)) ? "text" : "none";
  }

  async function sharePass(pass) {
    setError("");
    setSharingId(pass._id);
    const text = `SmartSociety gate pass for ${pass.name}\nCode: ${pass.id}\nValid: ${pass.window}\nShow this QR (or read the code) at the gate.`;
    const qrCanvas = qrCanvases.current[pass._id];

    try {
      const shareCanvas = qrCanvas ? buildShareCard(qrCanvas, pass) : null;
      const blob = shareCanvas ? await canvasToBlob(shareCanvas) : null;
      const file = blob ? new File([blob], `gate-pass-${pass.id}.png`, { type: "image/png" }) : null;

      // Mobile with Web Share Level 2 — one tap straight into WhatsApp/SMS
      // with the full card (QR + info) attached as one image.
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ title: "SmartSociety Gate Pass", text, files: [file] });
        } catch {
          // Share sheet dismissed — not an error.
        }
        return;
      }

      const result = await copyPassToClipboard(blob, text);
      if (result === "none") {
        setError(`Couldn't copy automatically — here's the code to share by hand: ${pass.id}`);
        return;
      }
      setCopiedId(pass._id);
      setCopiedKind(result);
      setTimeout(() => setCopiedId((c) => (c === pass._id ? null : c)), 2500);
    } finally {
      setSharingId(null);
    }
  }

  if (loading) {
    return <div className="text-body text-slate-500 py-12 text-center">Loading visitor passes…</div>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1280px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">Visitor Passes</h1>
          <span className="text-body text-slate-500">
            Pre-approve guests, deliveries, cabs and vendors. The gate accepts the QR or the code.
          </span>
        </div>
        <Button variant="guard" onClick={openModal} className="self-start md:self-auto">
          + Generate New Pass
        </Button>
      </div>

      {error && <span className="text-body font-semibold text-danger-fg">{error}</span>}

      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg self-start">
        <button
          onClick={() => setTab("active")}
          className={`h-9 px-4 rounded-md text-sm font-bold flex items-center gap-2 ${
            tab === "active" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"
          }`}
        >
          Active
          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand-100 text-[11px] font-bold flex items-center justify-center">
            {active.length}
          </span>
        </button>
        <button
          onClick={() => setTab("history")}
          className={`h-9 px-4 rounded-md text-sm font-semibold ${
            tab === "history" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"
          }`}
        >
          History
        </button>
      </div>

      {tab === "active" && (
        active.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="w-28 h-28 rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
              <IconVisitorPass size={36} color="#8A94A3" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-heading font-bold text-h3">No active passes</span>
              <span className="text-body text-slate-500 max-w-xs">
                Generate one for your next guest, delivery or cab &mdash; it takes about 20 seconds.
              </span>
            </div>
            <Button variant="guard" onClick={openModal}>+ Generate New Pass</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((pass) => {
              const s = PASS_STATUS[pass.status] ?? PASS_STATUS.valid;
              return (
                <Card key={pass._id} className="flex gap-4">
                  <PassQR code={pass.id} canvasRef={(el) => { qrCanvases.current[pass._id] = el; }} boxSize={76} />
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-body-lg truncate">{pass.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold uppercase">
                        {pass.type}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">
                      {pass.window?.toUpperCase()} &middot; CODE {pass.id}
                    </span>
                    <div className="flex items-center gap-3">
                      <Badge tone={s.tone}>{s.label}</Badge>
                      <button
                        onClick={() => sharePass(pass)}
                        disabled={sharingId === pass._id}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-800 disabled:opacity-50"
                      >
                        {sharingId === pass._id
                          ? "Copying…"
                          : copiedId === pass._id
                          ? copiedKind === "text"
                            ? "Info copied (QR not supported here)"
                            : "Copied — paste into WhatsApp"
                          : "Share with guest"}
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}

      {tab === "history" && (
        <Card padded={false} className="overflow-hidden">
          {history.length === 0 ? (
            <div className="p-8 text-center text-body text-slate-500">No past passes yet.</div>
          ) : (
            history.map((pass, i) => {
              const s = PASS_STATUS[pass.status] ?? PASS_STATUS.used;
              return (
                <div
                  key={pass._id}
                  className={`flex items-center justify-between gap-3 px-5 py-3.5 ${i !== 0 ? "border-t border-slate-100" : ""}`}
                >
                  <div className="min-w-0 flex flex-col gap-0.5">
                    <span className="text-body font-semibold truncate">{pass.name}</span>
                    <span className="text-xs text-slate-400">{pass.window}</span>
                  </div>
                  <Badge tone={s.tone}>{s.label}</Badge>
                </div>
              );
            })
          )}
        </Card>
      )}

      <div className="flex items-center gap-3 p-3.5 rounded-lg bg-teal-100">
        <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
          <IconVisitorPass size={22} color="#0A5C59" />
        </div>
        <span className="text-body text-teal-700">
          Share the QR or the code with your guest &mdash; the gate accepts either. Codes expire at the end of the window.
        </span>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Generate new pass"
        subtitle="The gate logs every scan against your flat."
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="guard" onClick={handleGenerate} disabled={submitting}>
              {submitting ? "Generating…" : "Generate Pass"}
            </Button>
          </>
        }
      >
        <FormField label="Visitor type">
          <div className="grid grid-cols-4 gap-1.5">
            {VISITOR_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t.id }))}
                className={`h-[52px] rounded-lg border text-xs font-bold flex items-center justify-center ${
                  form.type === t.id
                    ? "border-teal-500 bg-teal-100 text-teal-700"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Visitor name" required>
          <TextInput value={form.name} onChange={setField("name")} placeholder="Ramesh Kumar" />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Phone" required>
            <TextInput value={form.phone} onChange={setField("phone")} placeholder="98204 71120" className="font-mono" />
          </FormField>
          <FormField label="Vehicle" helper="optional">
            <TextInput value={form.vehicle} onChange={setField("vehicle")} placeholder="MH-02 ..." className="font-mono" />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Valid from" required>
            <TextInput type="datetime-local" value={form.from} onChange={setField("from")} />
          </FormField>
          <FormField label="Valid until" required>
            <TextInput type="datetime-local" value={form.until} min={form.from} onChange={setField("until")} />
          </FormField>
        </div>

        {formError && <span className="text-xs font-semibold text-danger-fg">{formError}</span>}
      </Modal>
    </div>
  );
}
