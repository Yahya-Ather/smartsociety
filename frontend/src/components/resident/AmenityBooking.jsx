import { useEffect, useState } from "react";
import { Card, Badge, Button, Table, Thead, Th, Tr, Td } from "../ui/index.js";
import { IconAmenity } from "../common/icons.jsx";
import api from "../../services/api.js";
import { mapAmenityBooking } from "../../utils/mappers.js";
import { BOOKING_STATUS } from "../../utils/status.js";
import { useSort } from "../../utils/useSort.js";

const MY_BOOKING_SORT_RESOLVERS = {
  amenity: (b) => b.amenity,
  date: (b) => (b.raw?.booking_date ? new Date(b.raw.booking_date) : b.date),
  guests: (b) => b.guests,
  status: (b) => b.status,
};

const SLOTS = [
  "09:00–10:00",
  "10:00–11:00",
  "11:00–12:00",
  "12:00–13:00",
  "14:00–15:00",
  "15:00–16:00",
  "16:00–17:00",
  "17:00–18:00",
];

function nextDays(n) {
  const base = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d;
  });
}

const DAYS = nextDays(7);

export default function AmenityBooking() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [amenityId, setAmenityId] = useState(null);
  const [dateIdx, setDateIdx] = useState(0);
  const [slot, setSlot] = useState(null);
  const [guests, setGuests] = useState(2);
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
        api.get("/amenities/my-bookings"),
      ]);
      const amenityList = amenitiesRes.data.data;
      setAmenities(amenityList);
      setAmenityId((prev) => prev ?? amenityList[0]?._id ?? null);
      setBookings(bookingsRes.data.data.map(mapAmenityBooking));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load amenities.");
    } finally {
      setLoading(false);
    }
  }

  const { sorted, sortKey, sortDir, toggleSort } = useSort(bookings, MY_BOOKING_SORT_RESOLVERS);

  const amenity = amenities.find((a) => a._id === amenityId) ?? amenities[0];
  const maxGuests = amenity?.capacity ?? 20;
  const selectedDate = DAYS[dateIdx];

  function selectAmenity(id) {
    setAmenityId(id);
    setSlot(null);
    setGuests(2);
  }

  function selectDate(i) {
    setDateIdx(i);
    setSlot(null);
  }

  async function confirmBooking() {
    if (slot === null || !amenity) return;
    setSubmitting(true);
    setError("");
    const [time_from, time_to] = SLOTS[slot].split("–");
    try {
      await api.post("/amenities/book", {
        amenity_id: amenity._id,
        booking_date: selectedDate.toISOString(),
        time_from,
        time_to,
        number_of_guests: guests,
      });
      setSlot(null);
      setGuests(2);
      const { data } = await api.get("/amenities/my-bookings");
      setBookings(data.data.map(mapAmenityBooking));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book amenity.");
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelBooking(id) {
    try {
      await api.patch(`/amenities/booking/${id}/cancel`);
      setBookings((b) => b.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel booking.");
    }
  }

  if (loading) {
    return <div className="text-body text-slate-500 py-12 text-center">Loading amenities…</div>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1280px] pb-24">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">Amenity Booking</h1>
        <span className="text-body text-slate-500">Pick an amenity, a date and an open slot to reserve it.</span>
      </div>

      {error && <span className="text-body font-semibold text-danger-fg">{error}</span>}

      {amenities.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-2 py-14 text-center">
          <span className="font-heading font-bold text-h3">No amenities available</span>
          <span className="text-body text-slate-500">Your Society Admin hasn't listed any amenities yet.</span>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {amenities.map((a) => (
              <Card
                key={a._id}
                as="button"
                onClick={() => selectAmenity(a._id)}
                className={`flex flex-col gap-2 text-left cursor-pointer transition-colors ${
                  a._id === amenityId ? "border-brand-500 bg-brand-50" : "hover:border-brand-500"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  <IconAmenity size={18} color={a._id === amenityId ? "#0B4FA0" : "#5B6779"} />
                </div>
                <span className="font-heading font-bold text-body-lg">{a.name}</span>
                <span className="text-xs text-slate-500">Up to {a.capacity} guests</span>
                <span className="text-xs text-slate-400">{a.location}</span>
              </Card>
            ))}
          </div>

          <Card className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-label uppercase text-slate-500">Date</span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {DAYS.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => selectDate(i)}
                    className={`flex flex-col items-center justify-center flex-shrink-0 w-14 h-16 rounded-lg border text-sm ${
                      i === dateIdx ? "border-brand-500 bg-brand-100 text-brand-600" : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase">{d.toLocaleDateString("en-PK", { weekday: "short" })}</span>
                    <span className="font-heading font-extrabold text-lg leading-tight">{d.getDate()}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-label uppercase text-slate-500">
                {selectedDate.toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long" })} &middot; time slots
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SLOTS.map((s, i) => {
                  const isSelected = slot === i;
                  return (
                    <button
                      key={s}
                      onClick={() => setSlot(i)}
                      className={`h-11 rounded-lg text-sm font-semibold border ${
                        isSelected
                          ? "bg-brand-500 text-white border-brand-500"
                          : "bg-white text-slate-700 border-slate-200 hover:border-brand-500"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {slot !== null && amenity && (
            <Card accent="brand" className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-heading font-bold text-h3">{amenity.name} &middot; {SLOTS[slot]}</span>
                <span className="text-body text-slate-500">
                  {selectedDate.toLocaleDateString("en-PK", { day: "numeric", month: "short" })} &middot; max {maxGuests} guests
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-label uppercase text-slate-500">Guests</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      className="w-8 h-8 rounded-md border border-slate-300 flex items-center justify-center font-bold text-slate-600"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-mono text-body-lg">{guests}</span>
                    <button
                      onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
                      className="w-8 h-8 rounded-md border border-slate-300 flex items-center justify-center font-bold text-slate-600"
                    >
                      +
                    </button>
                  </div>
                </div>
                <Button onClick={confirmBooking} disabled={submitting}>
                  {submitting ? "Booking…" : "Confirm Booking"}
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      <Card padded={false} className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="font-heading font-semibold text-h3 m-0">My Bookings</h3>
        </div>
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-body text-slate-500">No bookings yet — reserve an amenity above.</div>
        ) : (
          <Table>
            <Thead>
              <Th sortKey="amenity" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Amenity</Th>
              <Th sortKey="date" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Date</Th>
              <Th>Window</Th>
              <Th align="right" sortKey="guests" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Guests</Th>
              <Th sortKey="status" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Status</Th>
              <Th align="right">Action</Th>
            </Thead>
            <tbody>
              {sorted.map((b) => {
                const s = BOOKING_STATUS[b.status] ?? BOOKING_STATUS.awaiting;
                return (
                  <Tr key={b.id}>
                    <Td className="font-semibold">{b.amenity}</Td>
                    <Td>{b.date}</Td>
                    <Td>{b.window}</Td>
                    <Td align="right" mono>{b.guests}</Td>
                    <Td><Badge tone={s.tone}>{s.label}</Badge></Td>
                    <Td align="right">
                      {b.status !== "cancelled" ? (
                        <button onClick={() => cancelBooking(b.id)} className="text-xs font-semibold text-danger-fg">
                          Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">&mdash;</span>
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
