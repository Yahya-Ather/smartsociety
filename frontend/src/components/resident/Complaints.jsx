import { useEffect, useRef, useState } from "react";
import { Card, Badge, Button, Modal, FormField, Textarea } from "../ui/index.js";
import { IconComplaints } from "../common/icons.jsx";
import api from "../../services/api.js";
import { mapComplaint } from "../../utils/mappers.js";
import { COMPLAINT_STATUS } from "../../utils/status.js";
import { useAuth } from "../../context/AuthContext.jsx";

const CATEGORIES = ["Plumbing", "Electrical", "Elevator", "Cleaning", "Maintenance", "Security", "Other"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const STEPS = ["pending", "in-progress", "resolved"];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "in-progress", label: "In-Progress" },
  { id: "resolved", label: "Resolved" },
];

const EMPTY_FORM = { category: "Plumbing", description: "", priority: "Medium" };

export default function Complaints() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photo, setPhoto] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/resident/complaints");
      setComplaints(data.data.map(mapComplaint));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  }

  const counts = {
    all: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    "in-progress": complaints.filter((c) => c.status === "in-progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  const filtered = filter === "all" ? complaints : complaints.filter((c) => c.status === filter);

  function openRaise() {
    setForm(EMPTY_FORM);
    setPhoto(null);
    setFormError("");
    setRaiseOpen(true);
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (file) setPhoto(file);
  }

  async function submitComplaint() {
    if (!form.description.trim()) {
      setFormError("Please describe the issue.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const body = new FormData();
      body.append("category", form.category);
      body.append("description", form.description.trim());
      body.append("priority", form.priority);
      if (photo) body.append("photo", photo);
      await api.post("/resident/complaints", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRaiseOpen(false);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit complaint.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1280px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">Complaints</h1>
          <span className="text-body text-slate-500">
            {user?.block}, Flat {user?.flat?.split("-")[1]} &middot; routed by category
          </span>
        </div>
        <Button onClick={openRaise} className="self-start md:self-auto">
          <IconComplaints size={16} color="currentColor" /> Raise New Complaint
        </Button>
      </div>

      {error && <span className="text-body font-semibold text-danger-fg">{error}</span>}

      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg self-start flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`h-9 px-3.5 rounded-md text-sm font-bold flex items-center gap-2 ${
              filter === f.id ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"
            }`}
          >
            {f.label}
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center">
              {counts[f.id]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-body text-slate-500 py-12 text-center">Loading complaints…</div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-14 text-center">
          <span className="font-heading font-bold text-h3">No complaints here</span>
          <span className="text-body text-slate-500">Nothing matches this filter right now.</span>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => {
            const s = COMPLAINT_STATUS[c.status] ?? COMPLAINT_STATUS.pending;
            return (
              <Card
                key={c.id}
                as="button"
                onClick={() => setDetail(c)}
                className="flex flex-col gap-3 text-left cursor-pointer hover:border-brand-500 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-heading font-bold text-body-lg">{c.title}</span>
                  <Badge tone={s.tone}>{s.label}</Badge>
                </div>
                <span className="text-body text-slate-500 line-clamp-2">{c.description}</span>
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
                  <span className="font-mono text-[11px] text-slate-500">{c.createdAt} &middot; {c.category}</span>
                  <span className="text-xs font-semibold text-slate-500 capitalize">{c.priority} &middot; {c.sla}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Raise complaint modal */}
      <Modal
        open={raiseOpen}
        onClose={() => setRaiseOpen(false)}
        title="Raise new complaint"
        subtitle="Your Society Admin routes it and assigns an SLA."
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRaiseOpen(false)}>Cancel</Button>
            <Button onClick={submitComplaint} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Complaint"}
            </Button>
          </>
        }
      >
        <FormField label="Category">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm((f) => ({ ...f, category: cat }))}
                className={`h-10 px-3.5 rounded-full border text-sm font-bold ${
                  form.category === cat
                    ? "border-brand-500 bg-brand-100 text-brand-600"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Description" required helper="Mention the room and how long it's been happening.">
          <Textarea
            rows={4}
            placeholder="Describe the issue…"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </FormField>

        <FormField label="Photo" helper="Optional — JPG/PNG up to 8 MB.">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          <div className="flex items-center gap-2">
            {photo ? (
              <div className="h-[76px] w-[76px] rounded-lg border border-slate-200 bg-slate-50 relative flex items-end p-1.5">
                <span className="font-mono text-[8px] text-slate-500 truncate">{photo.name}</span>
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-800/70 text-white text-[10px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-[76px] w-[76px] rounded-lg border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-1 text-slate-500 hover:border-brand-500 hover:bg-brand-50"
              >
                <span className="text-lg leading-none">+</span>
                <span className="text-[11px] font-semibold">Add</span>
              </button>
            )}
          </div>
        </FormField>

        <FormField label="Priority" helper="High and Urgent tickets page the on-duty supervisor immediately.">
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm((f) => ({ ...f, priority: p }))}
                className={`h-10 rounded-md text-xs font-bold ${
                  form.priority === p ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </FormField>

        {formError && <span className="text-xs font-semibold text-danger-fg">{formError}</span>}
      </Modal>

      {/* Detail modal */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.title}
        subtitle={detail ? `${detail.category} · ${detail.priority}` : undefined}
        maxWidth="520px"
        footer={<Button variant="secondary" onClick={() => setDetail(null)}>Close</Button>}
      >
        {detail && (
          <>
            <div className="flex items-start justify-between gap-3">
              <span className="font-heading font-bold text-h3">{detail.title}</span>
              <Badge tone={(COMPLAINT_STATUS[detail.status] ?? COMPLAINT_STATUS.pending).tone}>
                {(COMPLAINT_STATUS[detail.status] ?? COMPLAINT_STATUS.pending).label}
              </Badge>
            </div>
            <p className="text-body text-slate-700 m-0">{detail.description}</p>
            {detail.photoUrl && (
              <img
                src={`${(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api").replace(/\/api$/, "")}${detail.photoUrl}`}
                alt="Complaint attachment"
                className="w-full max-h-64 object-cover rounded-lg border border-slate-200"
              />
            )}

            <div className="flex flex-col gap-1 pt-2">
              <span className="text-label uppercase text-slate-500">Progress</span>
              <div className="flex flex-col">
                {STEPS.map((step, i) => {
                  const currentIdx = STEPS.indexOf(detail.status);
                  const isCurrent = i === currentIdx;
                  const isComplete = i < currentIdx || (isCurrent && step === "resolved");
                  const label = { pending: "Pending", "in-progress": "In-Progress", resolved: "Resolved" }[step];
                  return (
                    <div key={step} className="flex gap-3">
                      <div className="flex flex-col items-center w-[22px] flex-shrink-0">
                        <span
                          className={`w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 ${
                            isComplete ? "bg-success-fg" : isCurrent ? "bg-brand-500" : "border-2 border-slate-200 bg-white"
                          }`}
                        >
                          {isComplete && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                              <path d="M2.5 6.2l2.2 2.3 4.8-5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                          )}
                        </span>
                        {i < STEPS.length - 1 && (
                          <span className={`flex-1 w-0.5 min-h-[28px] ${i < currentIdx ? "bg-success-fg" : "bg-slate-200"}`} />
                        )}
                      </div>
                      <div className="pb-4 flex flex-col gap-0.5">
                        <span className={`text-body font-bold ${i > currentIdx ? "text-slate-400" : ""}`}>{label}</span>
                        {i <= currentIdx && <span className="text-xs text-slate-500">{detail.sla}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <span className="text-label uppercase text-slate-500">Updates</span>
              {detail.updates.length === 0 && (
                <span className="text-body text-slate-400">No updates yet.</span>
              )}
              {detail.updates.map((u, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                    {u.by.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 p-3 rounded-lg bg-slate-50 flex flex-col gap-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold">{u.by}</span>
                      <span className="text-xs text-slate-400">{u.at}</span>
                    </div>
                    <span className="text-sm text-slate-700">{u.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
