import { useEffect, useMemo, useState } from "react";
import { Card, Badge, Button, Modal, Select } from "../ui/index.js";
import api from "../../services/api.js";
import { mapTicket } from "../../utils/mappers.js";
import { ROUTING_STATUS, TICKET_PRIORITY } from "../../utils/status.js";

const COLUMNS = [
  { key: "unassigned", title: "Unassigned" },
  { key: "in-progress", title: "In-Progress" },
  { key: "resolved", title: "Resolved" },
];

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "unassigned", label: "Unassigned" },
  { key: "in-progress", label: "In-Progress" },
  { key: "resolved", label: "Resolved" },
  { key: "breached", label: "SLA Breached" },
];

export default function ComplaintRouting() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [filterTab, setFilterTab] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [detailId, setDetailId] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [complaintsRes, staffRes] = await Promise.all([
        api.get("/admin/helpdesk"),
        api.get("/admin/staff"),
      ]);
      setTickets(complaintsRes.data.data.map(mapTicket));
      setStaff(staffRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  }

  const counts = useMemo(
    () => ({
      open: tickets.filter((t) => t.status !== "resolved").length,
      unassigned: tickets.filter((t) => t.status === "unassigned").length,
      inProgress: tickets.filter((t) => t.status === "in-progress").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
      breached: tickets.filter((t) => t.slaBreached).length,
    }),
    [tickets]
  );

  const workload = useMemo(
    () =>
      staff.map((s) => ({
        ...s,
        openTickets: tickets.filter((t) => t.assignedTo === s._id && t.status === "in-progress").length,
      })),
    [staff, tickets]
  );

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (filterTab === "breached") return t.slaBreached;
      if (filterTab !== "all" && t.status !== filterTab) return false;
      return true;
    });
  }, [tickets, filterTab, priorityFilter]);

  const detail = tickets.find((t) => t.id === detailId) ?? null;

  function staffFor(id) {
    return staff.find((s) => s._id === id) ?? null;
  }

  async function assign(ticketId, staffId) {
    if (!staffId) return;
    try {
      await api.patch(`/admin/helpdesk/${ticketId}/assign`, { assigned_to: staffId });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign ticket.");
    }
  }

  async function resolve(ticketId) {
    try {
      await api.patch(`/admin/helpdesk/${ticketId}/status`, { status: "Resolved" });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resolve ticket.");
    }
  }

  async function postNote() {
    if (!detail || !note.trim()) return;
    try {
      await api.patch(`/admin/helpdesk/${detail.id}/status`, {
        status: detail.status === "unassigned" ? "Pending" : detail.status === "resolved" ? "Resolved" : "In-Progress",
        resolution_notes: note.trim(),
      });
      setNote("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post note.");
    }
  }

  if (loading) {
    return <div className="text-body text-slate-500 py-12 text-center">Loading complaints…</div>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1440px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">Complaint Routing</h1>
          <span className="text-body text-slate-500">
            {counts.open} open tickets · {staff.length} staff on roster
          </span>
        </div>
      </div>

      {error && <span className="text-body font-semibold text-danger-fg">{error}</span>}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        <Card className="flex flex-col gap-1.5">
          <span className="text-label uppercase text-slate-500">Open tickets</span>
          <span className="font-heading font-extrabold text-2xl text-slate-800">{counts.open}</span>
        </Card>
        <Card accent="danger" className="flex flex-col gap-1.5">
          <span className="text-label uppercase text-slate-500">Unassigned</span>
          <span className="font-heading font-extrabold text-2xl text-danger-fg">{counts.unassigned}</span>
        </Card>
        <Card className="flex flex-col gap-1.5">
          <span className="text-label uppercase text-slate-500">In-Progress</span>
          <span className="font-heading font-extrabold text-2xl text-brand-600">{counts.inProgress}</span>
        </Card>
        <Card accent="danger" className="flex flex-col gap-1.5">
          <span className="text-label uppercase text-slate-500">SLA breaches</span>
          <span className="font-heading font-extrabold text-2xl text-danger-fg">{counts.breached}</span>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map((tabItem) => {
            const active = filterTab === tabItem.key;
            const n = { all: tickets.length, unassigned: counts.unassigned, "in-progress": counts.inProgress, resolved: counts.resolved, breached: counts.breached }[tabItem.key];
            return (
              <button
                key={tabItem.key}
                onClick={() => setFilterTab(tabItem.key)}
                className={`h-[34px] px-3.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                  active
                    ? tabItem.key === "breached"
                      ? "bg-danger-bg border-danger-fg text-danger-fg"
                      : "bg-brand-500 border-brand-500 text-white"
                    : "bg-white border-slate-200 text-slate-500"
                }`}
              >
                {tabItem.label} <span className={active ? "opacity-80" : "text-slate-400"}>{n}</span>
              </button>
            );
          })}
        </div>
        <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="!w-[150px] !h-[38px]">
          <option value="all">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
      </div>

      {/* Board + staff rail */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4 items-start">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {COLUMNS.map((col) => {
            const colTickets = filtered.filter((t) => t.status === col.key);
            const s = ROUTING_STATUS[col.key];
            return (
              <div key={col.key} className="bg-slate-100 border border-slate-200 rounded-panel p-3 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2 px-1">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dotClass(s.tone)}`} />
                    <span className="font-heading font-bold text-sm">{col.title}</span>
                  </span>
                  <Badge tone={s.tone}>{colTickets.length}</Badge>
                </div>

                {colTickets.map((t) => (
                  <TicketCard
                    key={t.id}
                    ticket={t}
                    staff={staff}
                    onOpen={() => setDetailId(t.id)}
                    onAssign={(staffId) => assign(t.id, staffId)}
                    onResolve={() => resolve(t.id)}
                  />
                ))}
                {colTickets.length === 0 && (
                  <span className="text-xs text-slate-400 px-2 py-3 text-center">No tickets here.</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-0.5">
              <span className="font-heading font-semibold text-body-lg">Staff workload</span>
              <span className="text-xs text-slate-400">Open tickets per person</span>
            </div>
            <div className="flex flex-col gap-3">
              {workload.map((s) => (
                <div key={s._id} className="flex items-center gap-2">
                  <span className="w-[26px] h-[26px] rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-heading font-bold text-[10px] flex-shrink-0">
                    {initialsOf(s.name || s.username)}
                  </span>
                  <span className="flex-1 min-w-0 flex flex-col">
                    <span className="text-xs font-semibold truncate">{s.name}</span>
                    <span className="text-[10px] text-slate-400 truncate">{s.role}</span>
                  </span>
                  <span className="font-heading font-bold text-sm text-slate-700">{s.openTickets}</span>
                </div>
              ))}
              {workload.length === 0 && <span className="text-xs text-slate-400">No staff on roster.</span>}
            </div>
          </Card>

          <Card className="flex flex-col gap-2.5">
            <span className="font-heading font-semibold text-body-lg">SLA policy</span>
            <SlaRow label="Urgent" value="4 hours" />
            <SlaRow label="High" value="24 hours" />
            <SlaRow label="Medium" value="48 hours" />
            <SlaRow label="Low" value="5 days" />
          </Card>
        </div>
      </div>

      {/* Ticket detail modal */}
      <Modal open={!!detail} onClose={() => setDetailId(null)} maxWidth="520px">
        {detail && (
          <TicketDetail
            ticket={detail}
            staff={staff}
            onAssign={(staffId) => assign(detail.id, staffId)}
            onResolve={() => resolve(detail.id)}
            note={note}
            setNote={setNote}
            onPostNote={postNote}
          />
        )}
      </Modal>
    </div>
  );
}

function TicketCard({ ticket, staff, onOpen, onAssign, onResolve }) {
  const p = TICKET_PRIORITY[ticket.priority];
  const assignedStaff = staff.find((s) => s._id === ticket.assignedTo);
  return (
    <div
      className={`bg-white rounded-lg p-3 flex flex-col gap-2 shadow-sm cursor-pointer border ${
        ticket.slaBreached ? "border-l-[3px] border-l-danger-fg" : "border-slate-200 hover:border-brand-200"
      }`}
      onClick={onOpen}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] text-slate-400">{ticket.createdAt}</span>
        <Badge tone={p.tone}>{p.label}</Badge>
      </div>
      <span className="text-body font-semibold leading-tight">{ticket.title}</span>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">{ticket.category}</span>
        <span className="text-[11px] text-slate-400">{ticket.resident} · {ticket.flat}</span>
      </div>

      {ticket.slaBreached ? (
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-danger-bg">
          <span className="w-1.5 h-1.5 rounded-full bg-danger-fg flex-shrink-0" />
          <span className="text-[11px] font-bold text-danger-fg">{ticket.slaText}</span>
        </div>
      ) : (
        <span className="text-[11px] text-slate-500">{ticket.slaText}</span>
      )}

      {ticket.status === "unassigned" && (
        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
          <select
            defaultValue=""
            onChange={(e) => onAssign(e.target.value)}
            className="flex-1 h-[30px] rounded-md border border-slate-200 text-xs px-1.5 outline-none"
          >
            <option value="" disabled>Assign to…</option>
            {staff.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {ticket.status === "in-progress" && (
        <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-heading font-bold text-[9px] flex-shrink-0">
              {assignedStaff ? initialsOf(assignedStaff.name) : "?"}
            </span>
            <span className="text-[11px] font-semibold truncate">{assignedStaff?.name ?? "Unassigned"}</span>
          </span>
          <button onClick={onResolve} className="text-[11px] font-bold text-success-fg flex-shrink-0">Resolve</button>
        </div>
      )}

      {ticket.status === "resolved" && (
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-heading font-bold text-[9px] flex-shrink-0">
              {assignedStaff ? initialsOf(assignedStaff.name) : "?"}
            </span>
            <span className="text-[11px] font-semibold truncate text-slate-500">{assignedStaff?.name ?? "—"}</span>
          </span>
        </div>
      )}
    </div>
  );
}

function TicketDetail({ ticket, staff, onAssign, onResolve, note, setNote, onPostNote }) {
  const p = TICKET_PRIORITY[ticket.priority];
  const assignedStaff = staff.find((s) => s._id === ticket.assignedTo);

  return (
    <div className="flex flex-col gap-4 -mt-1">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone={p.tone}>{p.label}</Badge>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">{ticket.category}</span>
        </div>
        <span className="font-heading font-bold text-h3">{ticket.title}</span>
        <span className="text-xs text-slate-500">{ticket.resident} · {ticket.flat} · raised {ticket.createdAt}</span>
      </div>

      {ticket.slaBreached && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-danger-bg border-l-[3px] border-danger-fg">
          <span className="text-sm font-bold text-danger-fg">{ticket.slaText}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-label uppercase text-slate-500">Resident description</span>
        <p className="text-body leading-relaxed text-slate-700 m-0">{ticket.description}</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-label uppercase text-slate-500">Assigned to</span>
        <Select value={ticket.assignedTo ?? ""} onChange={(e) => onAssign(e.target.value)}>
          <option value="" disabled>Choose staff…</option>
          {staff.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
        <span className="text-label uppercase text-slate-500">Internal notes</span>
        <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto">
          {ticket.updates.length === 0 && <span className="text-body text-slate-400">No notes yet.</span>}
          {ticket.updates.map((u, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-slate-50 flex flex-col gap-0.5">
              <span className="text-xs font-bold">{u.by}</span>
              <span className="text-body text-slate-700">{u.text}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add an internal note…"
            className="flex-1 min-w-0 h-[42px] px-3 border border-slate-300 rounded-lg text-body outline-none"
          />
          <Button size="sm" onClick={onPostNote}>Post</Button>
        </div>
      </div>

      <div className="flex gap-2.5 pt-1">
        {ticket.status !== "resolved" && (
          <Button className="flex-1 !bg-success-fg hover:!bg-success-fg" onClick={onResolve}>Mark resolved</Button>
        )}
      </div>
    </div>
  );
}

function SlaRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="font-mono text-xs font-semibold">{value}</span>
    </div>
  );
}

function dotClass(tone) {
  return { danger: "bg-danger-fg", info: "bg-brand-500", success: "bg-success-fg" }[tone] ?? "bg-slate-400";
}

function initialsOf(name) {
  return (name || "").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}
