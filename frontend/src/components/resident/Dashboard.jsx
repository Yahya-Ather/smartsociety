import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Card, Badge, Button } from "../ui/index.js";
import {
  IconVisitorPass,
  IconComplaints,
  IconBills,
  IconAmenity,
} from "../common/icons.jsx";
import api from "../../services/api.js";
import { mapBill, mapComplaint, mapVisitorPass, mapAmenityBooking, mapNotice, mapPoll } from "../../utils/mappers.js";
import { BILL_STATUS, PASS_STATUS, COMPLAINT_STATUS, BOOKING_STATUS, formatINR } from "../../utils/status.js";

export default function ResidentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bill, setBill] = useState(null);
  const [passes, setPasses] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notices, setNotices] = useState([]);
  const [openPoll, setOpenPoll] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [dashboardRes, bookingsRes, pollsRes] = await Promise.all([
          api.get("/resident/dashboard"),
          api.get("/amenities/my-bookings"),
          api.get("/polls"),
        ]);
        if (cancelled) return;
        const d = dashboardRes.data.data;
        setBill(mapBill(d.recent_bills[0]));
        setPasses(d.recent_passes.map(mapVisitorPass));
        setComplaints(d.recent_complaints.map(mapComplaint));
        setNotices(d.recent_notices.map(mapNotice));
        setBookings(bookingsRes.data.data.map(mapAmenityBooking));
        const polls = pollsRes.data.data.map(mapPoll);
        setOpenPoll(polls.find((p) => p.status === "open") || null);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Failed to load dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const complaintCounts = {
    pending: complaints.filter((c) => c.status === "pending").length,
    "in-progress": complaints.filter((c) => c.status === "in-progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  if (loading) {
    return <div className="text-body text-slate-500 py-12 text-center">Loading dashboard…</div>;
  }
  if (error) {
    return <div className="text-body text-danger-fg py-12 text-center">{error}</div>;
  }

  const billStatus = bill ? BILL_STATUS[bill.status] : BILL_STATUS.pending;

  return (
    <div className="flex flex-col gap-5 max-w-[1280px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <span className="text-body text-slate-500">
            {user?.block}, Flat {user?.flat?.split("-")[1]} · {user?.occupancyType || "Resident"}
          </span>
        </div>
        <div className="flex gap-2.5">
          <Link to="/resident/complaints">
            <Button variant="secondary">Raise complaint</Button>
          </Link>
          <Link to="/resident/visitor-pass">
            <Button variant="guard">Generate pass</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Maintenance dues */}
        <Card accent={bill?.status === "overdue" ? "danger" : "brand"} className="lg:col-span-5 flex flex-col gap-4">
          {bill ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="text-label uppercase text-slate-500">Maintenance dues · {bill.period}</span>
                <Badge tone={billStatus.tone}>{billStatus.label}</Badge>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="font-heading font-extrabold text-display text-slate-800">
                  {formatINR(bill.amount)}
                </span>
                {bill.status === "overdue" && (
                  <span className="text-body text-slate-500">Overdue by {bill.overdueDays} days</span>
                )}
              </div>
              <div className="flex flex-col gap-2 p-3.5 rounded-lg bg-slate-50">
                {bill.breakdown.map((row) => (
                  <div
                    key={row.label}
                    className={`flex justify-between text-body ${row.isPenalty ? "text-danger-fg font-semibold" : "text-slate-500"}`}
                  >
                    <span>{row.label}</span>
                    <span className="font-mono">{formatINR(row.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2.5">
                <Link to="/resident/bills" className="flex-1">
                  <Button className="w-full">Pay Now</Button>
                </Link>
                <Link to="/resident/bills">
                  <Button variant="secondary">View Bill</Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <span className="font-heading font-bold text-h3">No pending bills</span>
              <span className="text-body text-slate-500">You're all caught up.</span>
            </div>
          )}
        </Card>

        {/* Active visitor passes */}
        <Card accent="teal" className="lg:col-span-7 flex flex-col gap-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h3 className="font-heading font-semibold text-h3 m-0">Active visitor passes</h3>
              <span className="font-mono text-[11px] text-teal-700 bg-teal-100 rounded-full px-2 py-1">
                {passes.filter((p) => p.status === "valid").length} LIVE ·{" "}
                {passes.filter((p) => p.status === "upcoming").length} UPCOMING
              </span>
            </div>
            <Link to="/resident/visitor-pass">
              <Button variant="guard">Generate New Pass</Button>
            </Link>
          </div>

          {passes.length === 0 ? (
            <span className="text-body text-slate-500 py-4">No active passes right now.</span>
          ) : (
            <>
              <div className="hidden sm:grid grid-cols-[1.6fr_1.2fr_0.9fr_0.9fr] px-3 py-2.5 rounded-lg bg-slate-100 text-label uppercase text-slate-500">
                <span>Guest</span>
                <span>Valid window</span>
                <span>Pass</span>
                <span className="text-right">Status</span>
              </div>
              {passes.map((pass) => {
                const s = PASS_STATUS[pass.status];
                return (
                  <div
                    key={pass._id}
                    className="grid grid-cols-2 sm:grid-cols-[1.6fr_1.2fr_0.9fr_0.9fr] items-center gap-y-1 px-3 pb-3 border-b border-slate-100 text-body last:border-0 last:pb-0"
                  >
                    <span className="font-semibold col-span-2 sm:col-span-1">
                      {pass.name} <span className="text-slate-400 font-normal">· {pass.type}</span>
                    </span>
                    <span className="text-slate-500">{pass.window}</span>
                    <span className="font-mono text-mono-amt hidden sm:inline">{pass.id}</span>
                    <span className="justify-self-end sm:justify-self-end">
                      <Badge tone={s.tone}>{s.label}</Badge>
                    </span>
                  </div>
                );
              })}
            </>
          )}

          <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-100 mt-1">
            <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
              <IconVisitorPass size={22} color="#0A5C59" />
            </div>
            <span className="text-body text-teal-700">
              Share the QR or the code with your guest — the gate accepts either. Codes expire at the end of
              the window.
            </span>
          </div>
        </Card>

        {/* Complaints */}
        <Card className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-heading font-semibold text-h3 m-0">Complaints</h3>
            <Link to="/resident/complaints" className="text-sm">View all</Link>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <StatChip value={complaintCounts.pending} label="Pending" tone="warning" />
            <StatChip value={complaintCounts["in-progress"]} label="In-Progress" tone="info" />
            <StatChip value={complaintCounts.resolved} label="Resolved" tone="success" />
          </div>
          {complaints.filter((c) => c.status !== "resolved").length === 0 && (
            <span className="text-body text-slate-500">No open complaints.</span>
          )}
          {complaints.filter((c) => c.status !== "resolved").map((c) => {
            const s = COMPLAINT_STATUS[c.status];
            return (
              <div key={c.id} className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="min-w-0 flex flex-col gap-0.5">
                  <span className="text-body font-semibold truncate">{c.title}</span>
                  <span className="font-mono text-[11px] text-slate-500">{c.createdAt}</span>
                </div>
                <Badge tone={s.tone}>{s.label}</Badge>
              </div>
            );
          })}
          <Link to="/resident/complaints" className="mt-auto">
            <Button variant="secondary" className="w-full">
              <IconComplaints size={16} color="currentColor" /> Raise a complaint
            </Button>
          </Link>
        </Card>

        {/* Amenity bookings */}
        <Card className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-heading font-semibold text-h3 m-0">Amenity bookings</h3>
            <Link to="/resident/amenities" className="text-sm">Calendar</Link>
          </div>
          {bookings.length === 0 && <span className="text-body text-slate-500">No bookings yet.</span>}
          {bookings.slice(0, 1).map((b) => (
            <div key={b.id} className="flex items-center gap-3.5 p-4 rounded-lg bg-teal-100">
              <DateChip dateStr={b.date} />
              <div className="min-w-0 flex flex-col gap-1">
                <span className="font-heading font-semibold text-body-lg text-teal-700">{b.amenity}</span>
                <span className="text-body text-teal-700">{b.window} · {b.guests} guests</span>
                <span className="font-mono text-[11px] text-teal-600">{b.status.toUpperCase()}</span>
              </div>
            </div>
          ))}
          {bookings.slice(1).map((b) => {
            const s = BOOKING_STATUS[b.status];
            return (
              <div key={b.id} className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-body font-semibold">{b.amenity}</span>
                  <span className="text-xs text-slate-400">{b.date} · {b.window}</span>
                </div>
                <Badge tone={s.tone}>{s.label}</Badge>
              </div>
            );
          })}
          <Link to="/resident/amenities" className="mt-auto">
            <Button variant="secondary" className="w-full">
              <IconAmenity size={16} color="currentColor" /> Book New
            </Button>
          </Link>
        </Card>

        {/* Notices */}
        <Card className="lg:col-span-4 flex flex-col gap-3.5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-heading font-semibold text-h3 m-0">Notices &amp; announcements</h3>
            <Link to="/resident/notices" className="text-sm">All</Link>
          </div>
          {openPoll && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg bg-brand-100">
              <div className="min-w-0 flex flex-col gap-1">
                <span className="text-body font-bold text-brand-700 truncate">{openPoll.question}</span>
                <span className="text-xs text-brand-600">
                  {openPoll.closesIn} · {openPoll.votes} of {openPoll.total} voted
                </span>
              </div>
              <Link to="/resident/notices" className="flex-shrink-0">
                <Button>Vote</Button>
              </Link>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {notices.length === 0 && <span className="text-body text-slate-500">No notices yet.</span>}
            {notices.map((n) => (
              <div key={n.id} className="flex gap-3 items-start">
                <span className={`w-[7px] h-[7px] rounded-full mt-1.5 flex-shrink-0 ${n.urgent ? "bg-danger-fg" : "bg-slate-300"}`} />
                <div className="min-w-0 flex flex-col gap-0.5">
                  <span className="text-body font-semibold truncate">{n.title}</span>
                  <span className="text-xs text-slate-400">{n.postedAt} · {n.category}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatChip({ value, label, tone }) {
  const bg = { warning: "bg-warning-bg", info: "bg-info-bg", success: "bg-success-bg" }[tone];
  const fg = { warning: "text-warning-fg", info: "text-info-fg", success: "text-success-fg" }[tone];
  return (
    <div className={`p-3.5 rounded-lg flex flex-col gap-1 ${bg}`}>
      <span className={`font-heading font-extrabold text-2xl leading-none ${fg}`}>{value}</span>
      <span className={`text-[11px] font-bold ${fg}`}>{label}</span>
    </div>
  );
}

function DateChip({ dateStr }) {
  const [month, day] = dateStr.split(" ");
  return (
    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-white flex-shrink-0">
      <span className="font-mono text-[10px] text-teal-600 uppercase">{month}</span>
      <span className="font-heading font-extrabold text-xl text-teal-700 leading-tight">{day?.replace(",", "")}</span>
    </div>
  );
}
