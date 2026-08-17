import { useEffect, useState } from "react";
import { Modal, Button, FormField, TextInput, Select, Badge } from "../ui/index.js";
import api from "../../services/api.js";

const VEHICLE_TYPES = ["Car", "Bike", "Scooter", "Auto", "Truck"];
const RELATIONSHIPS = ["Spouse", "Child", "Parent", "Sibling", "Friend", "Other"];

const EMPTY_VEHICLE = { vehicle_number: "", vehicle_type: "Car", vehicle_model: "", color: "" };
const EMPTY_CONTACT = { contact_name: "", relationship: "Spouse", phone_number: "", email: "" };

export default function VehiclesContactsModal({ open, onClose }) {
  const [tab, setTab] = useState("vehicles");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [vehicleForm, setVehicleForm] = useState(EMPTY_VEHICLE);
  const [contactForm, setContactForm] = useState(EMPTY_CONTACT);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    load();
  }, [open]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [vehiclesRes, contactsRes] = await Promise.all([api.get("/vehicles"), api.get("/emergency-contacts")]);
      setVehicles(vehiclesRes.data.data);
      setContacts(contactsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  async function addVehicle(e) {
    e.preventDefault();
    if (!vehicleForm.vehicle_number.trim() || !vehicleForm.vehicle_model.trim()) {
      setError("Vehicle number and model are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/vehicles/register", vehicleForm);
      setVehicleForm(EMPTY_VEHICLE);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add vehicle.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeVehicle(id) {
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles((v) => v.filter((x) => x._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove vehicle.");
    }
  }

  async function addContact(e) {
    e.preventDefault();
    if (!contactForm.contact_name.trim() || !contactForm.phone_number.trim()) {
      setError("Name and phone are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/emergency-contacts/add", contactForm);
      setContactForm(EMPTY_CONTACT);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add contact.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeContact(id) {
    try {
      await api.delete(`/emergency-contacts/${id}`);
      setContacts((c) => c.filter((x) => x._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove contact.");
    }
  }

  async function setPrimary(id) {
    try {
      await api.patch(`/emergency-contacts/${id}/set-primary`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Vehicles & emergency contacts"
      maxWidth="520px"
      footer={<Button variant="secondary" onClick={onClose}>Close</Button>}
    >
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg self-start">
        <button
          type="button"
          onClick={() => setTab("vehicles")}
          className={`h-9 px-4 rounded-md text-sm font-bold ${tab === "vehicles" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"}`}
        >
          Vehicles
        </button>
        <button
          type="button"
          onClick={() => setTab("contacts")}
          className={`h-9 px-4 rounded-md text-sm font-bold ${tab === "contacts" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"}`}
        >
          Emergency Contacts
        </button>
      </div>

      {error && <span className="text-xs font-semibold text-danger-fg">{error}</span>}

      {loading ? (
        <div className="text-body text-slate-500 py-6 text-center">Loading…</div>
      ) : tab === "vehicles" ? (
        <>
          <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto">
            {vehicles.length === 0 && <span className="text-body text-slate-500">No vehicles registered.</span>}
            {vehicles.map((v) => (
              <div key={v._id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50">
                <div className="flex flex-col">
                  <span className="font-mono font-semibold">{v.vehicle_number}</span>
                  <span className="text-xs text-slate-500">{v.vehicle_type} · {v.vehicle_model} {v.color && `· ${v.color}`}</span>
                </div>
                <button type="button" onClick={() => removeVehicle(v._id)} className="text-xs font-semibold text-danger-fg">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <form onSubmit={addVehicle} className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2.5">
              <FormField label="Vehicle number">
                <TextInput
                  className="font-mono"
                  value={vehicleForm.vehicle_number}
                  onChange={(e) => setVehicleForm((f) => ({ ...f, vehicle_number: e.target.value }))}
                  placeholder="MH-02 AB 1234"
                />
              </FormField>
              <FormField label="Type">
                <Select value={vehicleForm.vehicle_type} onChange={(e) => setVehicleForm((f) => ({ ...f, vehicle_type: e.target.value }))}>
                  {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <FormField label="Model">
                <TextInput
                  value={vehicleForm.vehicle_model}
                  onChange={(e) => setVehicleForm((f) => ({ ...f, vehicle_model: e.target.value }))}
                  placeholder="Honda City"
                />
              </FormField>
              <FormField label="Color" helper="optional">
                <TextInput value={vehicleForm.color} onChange={(e) => setVehicleForm((f) => ({ ...f, color: e.target.value }))} />
              </FormField>
            </div>
            <Button type="submit" size="sm" disabled={submitting}>{submitting ? "Adding…" : "+ Add vehicle"}</Button>
          </form>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto">
            {contacts.length === 0 && <span className="text-body text-slate-500">No emergency contacts saved.</span>}
            {contacts.map((c) => (
              <div key={c._id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50">
                <div className="flex flex-col">
                  <span className="font-semibold flex items-center gap-2">
                    {c.contact_name}
                    {c.is_primary && <Badge tone="success">Primary</Badge>}
                  </span>
                  <span className="text-xs text-slate-500">{c.relationship} · {c.phone_number}</span>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  {!c.is_primary && (
                    <button type="button" onClick={() => setPrimary(c._id)} className="text-xs font-semibold text-brand-600">
                      Make primary
                    </button>
                  )}
                  <button type="button" onClick={() => removeContact(c._id)} className="text-xs font-semibold text-danger-fg">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={addContact} className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2.5">
              <FormField label="Name">
                <TextInput
                  value={contactForm.contact_name}
                  onChange={(e) => setContactForm((f) => ({ ...f, contact_name: e.target.value }))}
                  placeholder="Sneha Mehta"
                />
              </FormField>
              <FormField label="Relationship">
                <Select value={contactForm.relationship} onChange={(e) => setContactForm((f) => ({ ...f, relationship: e.target.value }))}>
                  {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
                </Select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <FormField label="Phone">
                <TextInput
                  className="font-mono"
                  value={contactForm.phone_number}
                  onChange={(e) => setContactForm((f) => ({ ...f, phone_number: e.target.value }))}
                  placeholder="98204 71120"
                />
              </FormField>
              <FormField label="Email" helper="optional">
                <TextInput
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                />
              </FormField>
            </div>
            <Button type="submit" size="sm" disabled={submitting}>{submitting ? "Adding…" : "+ Add contact"}</Button>
          </form>
        </>
      )}
    </Modal>
  );
}
