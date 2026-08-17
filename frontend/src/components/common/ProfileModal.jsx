import { useEffect, useState } from "react";
import { Modal, Button, FormField, TextInput, Select, Badge } from "../ui/index.js";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const ROLE_LABEL = { resident: "Resident", admin: "Society Admin", guard: "Security Guard" };
const RELATIONSHIPS = ["Spouse", "Child", "Parent", "Sibling", "Tenant", "Domestic Help", "Other"];
const EMPTY_MEMBER = { name: "", relationship: "Spouse", age: "", phone_number: "" };

export default function ProfileModal({ open, onClose }) {
  const { role, updateUser } = useAuth();
  const [tab, setTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone_number: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [family, setFamily] = useState([]);
  const [familyLoading, setFamilyLoading] = useState(true);
  const [memberForm, setMemberForm] = useState(EMPTY_MEMBER);
  const [addingMember, setAddingMember] = useState(false);
  const [familyError, setFamilyError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTab("profile");
    setError("");
    setSaved(false);
    setLoading(true);
    api
      .get("/profile")
      .then(({ data }) => {
        setProfile(data.data);
        setForm({ name: data.data.name || "", email: data.data.email || "", phone_number: data.data.phone_number || "" });
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load profile."))
      .finally(() => setLoading(false));

    if (role === "resident") loadFamily();
  }, [open]);

  async function loadFamily() {
    setFamilyLoading(true);
    setFamilyError("");
    try {
      const { data } = await api.get("/family");
      setFamily(data.data);
    } catch (err) {
      setFamilyError(err.response?.data?.message || "Failed to load family details.");
    } finally {
      setFamilyLoading(false);
    }
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.put("/profile", form);
      updateUser({ name: form.name.trim(), email: form.email.trim(), phone: form.phone_number.trim() });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function addMember(e) {
    e.preventDefault();
    if (!memberForm.name.trim()) {
      setFamilyError("Name is required.");
      return;
    }
    setAddingMember(true);
    setFamilyError("");
    try {
      await api.post("/family/add", {
        ...memberForm,
        age: memberForm.age ? Number(memberForm.age) : undefined,
      });
      setMemberForm(EMPTY_MEMBER);
      await loadFamily();
    } catch (err) {
      setFamilyError(err.response?.data?.message || "Failed to add.");
    } finally {
      setAddingMember(false);
    }
  }

  async function removeMember(id) {
    try {
      await api.delete(`/family/${id}`);
      setFamily((f) => f.filter((m) => m._id !== id));
    } catch (err) {
      setFamilyError(err.response?.data?.message || "Failed to remove.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="My profile"
      subtitle={profile ? `${profile.username} · ${ROLE_LABEL[profile.role.toLowerCase()] || profile.role}` : undefined}
      maxWidth="460px"
      footer={
        tab === "profile" ? (
          <>
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button onClick={handleSave} disabled={saving || loading}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onClose}>Close</Button>
        )
      }
    >
      {role === "resident" && (
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setTab("profile")}
            className={`h-9 px-4 rounded-md text-sm font-bold ${tab === "profile" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"}`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => setTab("family")}
            className={`h-9 px-4 rounded-md text-sm font-bold ${tab === "family" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"}`}
          >
            Family & Tenants
          </button>
        </div>
      )}

      {tab === "profile" ? (
        loading ? (
          <div className="text-body text-slate-500 py-6 text-center">Loading…</div>
        ) : (
          <>
            <FormField label="Full name" required>
              <TextInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </FormField>
            <FormField label="Email" required>
              <TextInput type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </FormField>
            <FormField label="Phone">
              <TextInput
                className="font-mono"
                value={form.phone_number}
                onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
              />
            </FormField>

            {profile?.flat && (
              <div className="p-3 rounded-lg bg-slate-50 text-body text-slate-600">
                <strong className="font-mono">
                  {profile.flat.block_name}-{profile.flat.flat_number}
                </strong>{" "}
                · {profile.flat.occupancy_type}
              </div>
            )}
            {profile?.gate && (
              <div className="p-3 rounded-lg bg-slate-50 text-body text-slate-600">Assigned gate: <strong>{profile.gate}</strong></div>
            )}

            {error && <span className="text-xs font-semibold text-danger-fg">{error}</span>}
            {saved && !error && <span className="text-xs font-semibold text-success-fg">Saved.</span>}
          </>
        )
      ) : (
        <>
          {familyLoading ? (
            <div className="text-body text-slate-500 py-6 text-center">Loading…</div>
          ) : (
            <>
              <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto">
                {family.length === 0 && <span className="text-body text-slate-500">No family members or tenants added yet.</span>}
                {family.map((m) => (
                  <div key={m._id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50">
                    <div className="flex flex-col">
                      <span className="font-semibold flex items-center gap-2">
                        {m.name}
                        <Badge tone={m.relationship === "Tenant" ? "teal" : "info"}>{m.relationship}</Badge>
                      </span>
                      <span className="text-xs text-slate-500">
                        {m.age ? `${m.age} yrs` : ""}{m.age && m.phone_number ? " · " : ""}{m.phone_number}
                      </span>
                    </div>
                    <button type="button" onClick={() => removeMember(m._id)} className="text-xs font-semibold text-danger-fg">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={addMember} className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2.5">
                  <FormField label="Name">
                    <TextInput
                      value={memberForm.name}
                      onChange={(e) => setMemberForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Priya Mehta"
                    />
                  </FormField>
                  <FormField label="Relationship">
                    <Select value={memberForm.relationship} onChange={(e) => setMemberForm((f) => ({ ...f, relationship: e.target.value }))}>
                      {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </Select>
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <FormField label="Age" helper="optional">
                    <TextInput
                      type="number"
                      value={memberForm.age}
                      onChange={(e) => setMemberForm((f) => ({ ...f, age: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Phone" helper="optional">
                    <TextInput
                      className="font-mono"
                      value={memberForm.phone_number}
                      onChange={(e) => setMemberForm((f) => ({ ...f, phone_number: e.target.value }))}
                    />
                  </FormField>
                </div>
                {familyError && <span className="text-xs font-semibold text-danger-fg">{familyError}</span>}
                <Button type="submit" size="sm" disabled={addingMember}>
                  {addingMember ? "Adding…" : "+ Add member"}
                </Button>
              </form>
            </>
          )}
        </>
      )}
    </Modal>
  );
}
