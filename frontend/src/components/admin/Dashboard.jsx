import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Card, Badge, Button, Modal, Table, Thead, Th, Tr, Td, TextInput, FormField, Textarea, Select } from "../ui/index.js";
import {
  IconResidents,
  IconBillingEngine,
  IconRouting,
  IconSecurity,
} from "../common/icons.jsx";
import api from "../../services/api.js";
import { mapTicket, mapVisitorLog } from "../../utils/mappers.js";
import { COMPLAINT_STATUS, GATE_LOG_STATUS, formatINR } from "../../utils/status.js";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [liveActivity, setLiveActivity] = useState([]);
  const [pendingResidents, setPendingResidents] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [noticeForm, setNoticeForm] = useState(emptyNoticeForm());
  const [noticeError, setNoticeError] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [dashRes, activeRes, residentsRes, bookingsRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/security/active-visitors"),
        api.get("/admin/residents"),
        api.get("/amenities/admin/all-bookings"),
      ]);
      setSummary(dashRes.data.data.summary);
      setRecentComplaints(dashRes.data.data.recent_complaints.map(mapTicket));
      setLiveActivity(activeRes.data.data.slice(0, 4).map(mapVisitorLog));
      setPendingResidents(residentsRes.data.data.filter((r) => !r.is_active));
      setPendingBookings(bookingsRes.data.data.filter((b) => b.booking_status === "Pending"));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBroadcast(e) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setBroadcasting(true);
    try {
      await api.post("/admin/notice", { title: subject.trim(), description: message.trim(), urgent: true });
      setBroadcastOpen(false);
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to broadcast notice.");
    } finally {
      setBroadcasting(false);
    }
  }

  async function handlePostNotice(e) {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.description.trim()) return;
    setPosting(true);
    setNoticeError("");
    try {
      await api.post("/admin/notice", {
        title: noticeForm.title.trim(),
        description: noticeForm.description.trim(),
        category: noticeForm.category,
        urgent: false,
        event_date: noticeForm.category === "Event" ? noticeForm.eventDate : undefined,
        event_time: noticeForm.category === "Event" ? noticeForm.eventTime : undefined,
        event_location: noticeForm.category === "Event" ? noticeForm.eventLocation : undefined,
      });
      setNoticeOpen(false);
      setNoticeForm(emptyNoticeForm());
    } catch (err) {
      setNoticeError(err.response?.data?.message || "Failed to post notice.");
    } finally {
      setPosting(false);
    }
  }

  if (loading) {
    return <div className="text-body text-slate-500 py-12 text-center">Loading dashboard…</div>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1440px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">Admin Dashboard</h1>
          <span className="text-body text-slate-500">{user?.society || "Green Valley"} RWA</span>
        </div>
        <div className="flex gap-2.5">
          <Button variant="secondary" size="sm" onClick={() => setNoticeOpen(true)}>
            Post Notice
          </Button>
          <Button variant="danger" size="sm" onClick={() => setBroadcastOpen(true)}>
            <span className="w-2 h-2 rounded-full bg-white" />
            Broadcast Emergency Notice
          </Button>
        </div>
      </div>

      {error && <span className="text-body font-semibold text-danger-fg">{error}</span>}

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Card className="flex flex-col gap-2">
          <span className="text-label uppercase text-slate-500">Occupancy</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-extrabold text-[28px] text-slate-800">{100 - summary.vacancy_rate}%</span>
            <span className="font-mono text-xs text-slate-500">{summary.occupied_flats}/{summary.total_flats}</span>
          </div>
          <div className="h-[5px] rounded-full bg-slate-100 overflow-hidden">
            <span className="block h-full bg-brand-500" style={{ width: `${100 - summary.vacancy_rate}%` }} />
          </div>
          <span className="text-xs text-slate-500">{summary.total_flats - summary.occupied_flats} vacant flats</span>
        </Card>

        <Card className="flex flex-col gap-2">
          <span className="text-label uppercase text-slate-500">Dues collected</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-extrabold text-[28px] text-slate-800">{formatINR(summary.collected_dues)}</span>
            <span className="text-xs font-bold text-success-fg">{summary.collection_percentage}%</span>
          </div>
          <div className="h-[5px] rounded-full bg-slate-100 overflow-hidden">
            <span className="block h-full bg-success-fg" style={{ width: `${summary.collection_percentage}%` }} />
          </div>
          <span className="text-xs font-semibold text-danger-fg">{formatINR(summary.pending_dues)} outstanding</span>
        </Card>

        <Card className="flex flex-col gap-2">
          <span className="text-label uppercase text-slate-500">Open complaints</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-extrabold text-[28px] text-slate-800">{summary.open_complaints}</span>
            <span className="text-xs text-slate-500">of {summary.total_complaints} total</span>
          </div>
        </Card>

        <Card className="flex flex-col gap-2">
          <span className="text-label uppercase text-slate-500">Gate entries today</span>
          <span className="font-heading font-extrabold text-[28px] text-slate-800">{summary.today_gate_entries}</span>
          <span className="text-xs text-slate-500">{liveActivity.length} currently inside</span>
        </Card>

        <Card className="flex flex-col gap-2">
          <span className="text-label uppercase text-slate-500">Pending bookings</span>
          <span className="font-heading font-extrabold text-[28px] text-slate-800">{pendingBookings.length}</span>
          <span className="text-xs text-slate-500">awaiting approval</span>
        </Card>
      </div>

      {/* Recent complaints + Security activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card padded={false} className="lg:col-span-6 flex flex-col">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200">
            <h3 className="font-heading font-semibold text-h3 m-0">Recent complaints</h3>
            <Link to="/admin/complaints" className="text-sm">Complaint routing</Link>
          </div>
          <Table minWidth="480px">
            <Thead>
              <Th>Resident</Th>
              <Th>Category</Th>
              <Th>Status</Th>
            </Thead>
            <tbody>
              {recentComplaints.map((c) => {
                const s = COMPLAINT_STATUS[c.status === "unassigned" ? "pending" : c.status === "resolved" ? "resolved" : "in-progress"];
                return (
                  <Tr key={c.id}>
                    <Td>
                      <span className="flex flex-col gap-0.5">
                        <span className="font-semibold">{c.resident}</span>
                        <span className="font-mono text-[10px] text-slate-400">{c.flat}</span>
                      </span>
                    </Td>
                    <Td className="text-slate-500">{c.category}</Td>
                    <Td><Badge tone={s.tone}>{s.label}</Badge></Td>
                  </Tr>
                );
              })}
              {recentComplaints.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-body text-slate-500">No open complaints.</td></tr>
              )}
            </tbody>
          </Table>
        </Card>

        <Card padded={false} className="lg:col-span-6 flex flex-col">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <h3 className="font-heading font-semibold text-h3 m-0">Security activity</h3>
              <Badge tone="teal">Live</Badge>
            </div>
            <Link to="/admin/security-logs" className="text-sm">Full gate log</Link>
          </div>
          <Table minWidth="480px">
            <Thead>
              <Th>Visitor</Th>
              <Th>Flat</Th>
              <Th>Entry</Th>
              <Th align="right">Status</Th>
            </Thead>
            <tbody>
              {liveActivity.map((g) => {
                const s = GATE_LOG_STATUS[g.overstay ? "overstay" : "inside"];
                return (
                  <Tr key={g.id}>
                    <Td className="font-semibold">{g.visitor}</Td>
                    <Td mono>{g.flat}</Td>
                    <Td className="font-mono text-mono-amt text-slate-500">{g.entry}</Td>
                    <Td align="right"><Badge tone={s.tone}>{s.label}</Badge></Td>
                  </Tr>
                );
              })}
              {liveActivity.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-body text-slate-500">No one inside right now.</td></tr>
              )}
            </tbody>
          </Table>
        </Card>
      </div>

      {/* Quick actions + Needs your decision */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-6 flex flex-col gap-3.5">
          <h3 className="font-heading font-semibold text-h3 m-0">Quick actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction to="/admin/residents" icon={<IconResidents size={19} color="#0B4FA0" />} label="Onboard Resident" />
            <QuickAction to="/admin/billing" icon={<IconBillingEngine size={19} color="#0B4FA0" />} label="Generate Bills" />
            <QuickAction to="/admin/complaints" icon={<IconRouting size={19} color="#0B4FA0" />} label="Assign Ticket" />
            <QuickAction to="/admin/security-logs" icon={<IconSecurity size={19} color="#0A7A76" />} label="Security Logs" teal />
          </div>
        </Card>

        <Card className="lg:col-span-6 flex flex-col gap-3.5">
          <h3 className="font-heading font-semibold text-h3 m-0">Needs your decision</h3>
          {pendingBookings.slice(0, 2).map((b) => (
            <div key={b._id} className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="min-w-0 flex flex-col gap-0.5">
                <span className="text-body font-semibold truncate">{b.amenity_id?.name} booking</span>
                <span className="font-mono text-[11px] text-slate-500">{b.number_of_guests} GUESTS · AWAITING APPROVAL</span>
              </div>
              <Link to="/admin/residents" className="flex-shrink-0">
                <Button size="sm" className="!h-[30px] !px-3 !text-xs">Review</Button>
              </Link>
            </div>
          ))}
          {pendingResidents.slice(0, 2).map((r) => (
            <div key={r._id} className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="min-w-0 flex flex-col gap-0.5">
                <span className="text-body font-semibold truncate">{r.name}</span>
                <span className="font-mono text-[11px] text-slate-500">AWAITING VERIFICATION</span>
              </div>
              <Link to="/admin/residents" className="flex-shrink-0">
                <Button size="sm" className="!h-[30px] !px-3 !text-xs">Review</Button>
              </Link>
            </div>
          ))}
          {pendingBookings.length === 0 && pendingResidents.length === 0 && (
            <span className="text-body text-slate-500">Nothing pending — you're all caught up.</span>
          )}
        </Card>
      </div>

      <Modal
        open={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        title="Broadcast Emergency Notice"
        subtitle="Posts an urgent notice to every resident's notice board."
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBroadcastOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleBroadcast} disabled={broadcasting}>
              {broadcasting ? "Broadcasting…" : "Broadcast"}
            </Button>
          </>
        }
      >
        <FormField label="Subject" required>
          <TextInput
            placeholder="e.g. Fire drill in Tower B at 6 PM"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </FormField>
        <FormField label="Message" helper="Posted immediately to the resident notice board.">
          <Textarea
            placeholder="Describe the emergency and any action residents should take…"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </FormField>
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-danger-bg">
          <span className="w-2 h-2 rounded-full bg-danger-fg mt-1.5 flex-shrink-0" />
          <span className="text-xs text-danger-fg leading-relaxed">
            This notice is sent immediately and cannot be recalled. Use only for genuine emergencies affecting resident safety.
          </span>
        </div>
      </Modal>

      <Modal
        open={noticeOpen}
        onClose={() => setNoticeOpen(false)}
        title="Post notice"
        subtitle="Posted to the resident notice board immediately."
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNoticeOpen(false)}>Cancel</Button>
            <Button onClick={handlePostNotice} disabled={posting}>{posting ? "Posting…" : "Post"}</Button>
          </>
        }
      >
        <FormField label="Category">
          <Select value={noticeForm.category} onChange={(e) => setNoticeForm((f) => ({ ...f, category: e.target.value }))}>
            {["General", "Maintenance", "Security", "Event", "Billing"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Title" required>
          <TextInput
            placeholder="e.g. Diwali get-together on the terrace"
            value={noticeForm.title}
            onChange={(e) => setNoticeForm((f) => ({ ...f, title: e.target.value }))}
          />
        </FormField>
        <FormField label="Description" required>
          <Textarea
            rows={3}
            placeholder="Details for residents…"
            value={noticeForm.description}
            onChange={(e) => setNoticeForm((f) => ({ ...f, description: e.target.value }))}
          />
        </FormField>
        {noticeForm.category === "Event" && (
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Event date">
              <TextInput type="date" value={noticeForm.eventDate} onChange={(e) => setNoticeForm((f) => ({ ...f, eventDate: e.target.value }))} />
            </FormField>
            <FormField label="Time">
              <TextInput placeholder="6:00 PM" value={noticeForm.eventTime} onChange={(e) => setNoticeForm((f) => ({ ...f, eventTime: e.target.value }))} />
            </FormField>
            <FormField label="Location" className="col-span-2">
              <TextInput placeholder="Clubhouse terrace" value={noticeForm.eventLocation} onChange={(e) => setNoticeForm((f) => ({ ...f, eventLocation: e.target.value }))} />
            </FormField>
          </div>
        )}
        {noticeError && <span className="text-xs font-semibold text-danger-fg">{noticeError}</span>}
      </Modal>
    </div>
  );
}

function emptyNoticeForm() {
  return { category: "General", title: "", description: "", eventDate: "", eventTime: "", eventLocation: "" };
}

function QuickAction({ to, icon, label, teal }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-3.5 rounded-lg border border-slate-200 hover:bg-brand-50 hover:border-brand-500 transition-colors ${teal ? "hover:bg-teal-100 hover:border-teal-500" : ""}`}
    >
      <div className={`w-[38px] h-[38px] rounded-lg flex items-center justify-center flex-shrink-0 ${teal ? "bg-teal-100" : "bg-brand-100"}`}>
        {icon}
      </div>
      <span className="text-body font-semibold leading-tight text-slate-800">{label}</span>
    </Link>
  );
}
