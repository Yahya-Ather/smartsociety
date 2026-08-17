import { useEffect, useState } from "react";
import { Card, Badge, Button, Modal, FormField, TextInput, Select, Table, Thead, Th, Tr, Td } from "../ui/index.js";
import { IconAmenity } from "../common/icons.jsx";
import api from "../../services/api.js";
import { useSort } from "../../utils/useSort.js";

const BOOKING_SORT_RESOLVERS = {
  amenity: (b) => b.amenity_id?.name,
  resident: (b) => b.resident_id?.name || b.resident_id?.username,
  flat: (b) => (b.flat_id ? `${b.flat_id.block_name}-${b.flat_id.flat_number}` : ""),
  date: (b) => (b.booking_date ? new Date(b.booking_date) : null),
  guests: (b) => b.number_of_guests,
  status: (b) => b.booking_status,
};

const AMENITY_NAMES = ["Clubhouse", "Swimming Pool", "Sports Courts", "Party Hall", "Gym", "Yoga Studio"];

const BOOKING_STATUS = {
  Pending: { tone: "warning", label: "Pending" },
  Confirmed: { tone: "success", label: "Confirmed" },
  Cancelled: { tone: "neutral", label: "Cancelled" },
  Completed: { tone: "info", label: "Completed" },
};

const EMPTY_FORM = { name: AMENITY_NAMES[0], description: "", capacity: 20, location: "" };

export default function AmenitiesManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [amenitiesRes, bookingsRes] = await Promise.all([
        api.get("/amenities/list"),
        api.get("/amenities/admin/all-bookings"),
      ]);
      setAmenities(amenitiesRes.data.data);
      setBookings(bookingsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load amenities.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.description.trim() || !form.location.trim() || !form.capacity) {
      setFormError("All fields are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/amenities/admin/create", {
        name: form.name,
        description: form.description.trim(),
        capacity: Number(form.capacity),
        location: form.location.trim(),
      });
      setCreateOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create amenity.");
    } finally {
      setSubmitting(false);
    }
  }

  async function approveBooking(id) {
    try {
      await api.patch(`/amenities/admin/booking/${id}/approve`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve booking.");
    }
  }

  const pendingBookings = bookings.filter((b) => b.booking_status === "Pending");
  const { sorted, sortKey, sortDir, toggleSort } = useSort(bookings, BOOKING_SORT_RESOLVERS);

  if (loading) {
    return <div className="text-body text-slate-500 py-12 text-center">Loading amenities…</div>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1440px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">Amenities Management</h1>
          <span className="text-body text-slate-500">
            {amenities.length} amenities listed · {pendingBookings.length} bookings awaiting approval
          </span>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>+ Add Amenity</Button>
      </div>

      {error && <span className="text-body font-semibold text-danger-fg">{error}</span>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {amenities.map((a) => (
          <Card key={a._id} className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
              <IconAmenity size={18} color="#0B4FA0" />
            </div>
            <span className="font-heading font-bold text-body-lg">{a.name}</span>
            <span className="text-xs text-slate-500">{a.description}</span>
            <span className="text-xs text-slate-400">Up to {a.capacity} guests · {a.location}</span>
          </Card>
        ))}
        {amenities.length === 0 && (
          <Card className="col-span-full flex flex-col items-center justify-center gap-2 py-10 text-center">
            <span className="font-heading font-bold text-h3">No amenities yet</span>
            <span className="text-body text-slate-500">Add one so residents can start booking.</span>
          </Card>
        )}
      </div>

      <Card padded={false}>
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="font-heading font-semibold text-h3 m-0">Bookings</h3>
        </div>
        <Table minWidth="700px">
          <Thead>
            <Th sortKey="amenity" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Amenity</Th>
            <Th sortKey="resident" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Resident</Th>
            <Th sortKey="flat" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Flat</Th>
            <Th sortKey="date" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Date</Th>
            <Th>Window</Th>
            <Th align="right" sortKey="guests" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Guests</Th>
            <Th sortKey="status" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Status</Th>
            <Th align="right">Actions</Th>
          </Thead>
          <tbody>
            {sorted.map((b) => {
              const s = BOOKING_STATUS[b.booking_status] || BOOKING_STATUS.Pending;
              return (
                <Tr key={b._id}>
                  <Td className="font-semibold">{b.amenity_id?.name}</Td>
                  <Td>{b.resident_id?.name || b.resident_id?.username || "—"}</Td>
                  <Td mono>{b.flat_id ? `${b.flat_id.block_name?.replace(/^Tower\s*/i, "")}-${b.flat_id.flat_number}` : "—"}</Td>
                  <Td className="text-slate-500">{b.booking_date ? new Date(b.booking_date).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : ""}</Td>
                  <Td className="text-slate-500">{b.time_from}–{b.time_to}</Td>
                  <Td align="right" mono>{b.number_of_guests}</Td>
                  <Td><Badge tone={s.tone}>{s.label}</Badge></Td>
                  <Td align="right">
                    {b.booking_status === "Pending" ? (
                      <button onClick={() => approveBooking(b._id)} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                        Approve
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </Td>
                </Tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-body text-slate-400">No bookings yet.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add amenity"
        maxWidth="440px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>{submitting ? "Creating…" : "Create Amenity"}</Button>
          </>
        }
      >
        <FormField label="Name">
          <Select value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}>
            {AMENITY_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
        </FormField>
        <FormField label="Description" required>
          <TextInput value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Community clubhouse for events" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Capacity" required>
            <TextInput type="number" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} />
          </FormField>
          <FormField label="Location" required>
            <TextInput value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Tower A ground floor" />
          </FormField>
        </div>
        {formError && <span className="text-xs font-semibold text-danger-fg">{formError}</span>}
      </Modal>
    </div>
  );
}
