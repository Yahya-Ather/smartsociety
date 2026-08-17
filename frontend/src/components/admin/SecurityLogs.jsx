import { useEffect, useMemo, useState } from "react";
import { Card, Badge, Button, Table, Thead, Th, Tr, Td, Select } from "../ui/index.js";
import { IconSearch } from "../common/icons.jsx";
import api from "../../services/api.js";
import { mapVisitorLog, mapSecurityAlert } from "../../utils/mappers.js";
import { GATE_LOG_STATUS, VISITOR_TYPE } from "../../utils/status.js";
import { useSort } from "../../utils/useSort.js";

const TYPES = ["guest", "delivery", "cab", "vendor"];

const GATE_LOG_SORT_RESOLVERS = {
  visitor: (g) => g.visitor,
  type: (g) => g.type,
  flat: (g) => g.flat,
  vehicle: (g) => g.vehicle,
  entry: (g) => (g.raw?.entry_timestamp ? new Date(g.raw.entry_timestamp) : null),
  exit: (g) => (g.raw?.exit_timestamp ? new Date(g.raw.exit_timestamp) : null),
  duration: (g) => g.durationMin,
};

export default function SecurityLogs() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);
  const [active, setActive] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [insideOnly, setInsideOnly] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [visitorsRes, activeRes, alertsRes] = await Promise.all([
        api.get("/security/visitors"),
        api.get("/security/active-visitors"),
        api.get("/security/alerts"),
      ]);
      setLogs(visitorsRes.data.data.map(mapVisitorLog));
      setActive(activeRes.data.data.map(mapVisitorLog));
      setAlerts(alertsRes.data.data.map(mapSecurityAlert));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load security logs.");
    } finally {
      setLoading(false);
    }
  }

  async function acknowledgeAlert(id) {
    try {
      await api.patch(`/security/alert/${id}/acknowledge`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to acknowledge alert.");
    }
  }

  async function resolveAlert(id) {
    try {
      await api.patch(`/security/alert/${id}/resolve`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resolve alert.");
    }
  }

  const liveActivity = active.slice(0, 4);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((g) => {
      if (typeFilter !== "all" && g.type !== typeFilter) return false;
      if (insideOnly && g.exit) return false;
      if (q && !`${g.visitor} ${g.flat} ${g.vehicle ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [logs, search, typeFilter, insideOnly]);

  const { sorted, sortKey, sortDir, toggleSort } = useSort(filtered, GATE_LOG_SORT_RESOLVERS);

  const overstayCount = active.filter((g) => g.overstay).length;

  if (loading) {
    return <div className="text-body text-slate-500 py-12 text-center">Loading security logs…</div>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1440px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">Security Logs</h1>
          <span className="text-body text-slate-500">Read-only audit view of every gate pass and walk-in visitor.</span>
        </div>
        <Badge tone="success">Live</Badge>
      </div>

      {error && <span className="text-body font-semibold text-danger-fg">{error}</span>}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5">
        <Card className="flex flex-col gap-1.5">
          <span className="text-label uppercase text-slate-500">Total visitor records</span>
          <span className="font-heading font-extrabold text-2xl text-slate-800">{logs.length}</span>
        </Card>
        <Card className="flex flex-col gap-1.5">
          <span className="text-label uppercase text-slate-500">Currently inside</span>
          <span className="font-heading font-extrabold text-2xl text-brand-600">{active.length}</span>
          <span className="text-xs text-slate-500">not yet checked out</span>
        </Card>
        <Card accent="danger" className="flex flex-col gap-1.5">
          <span className="text-label uppercase text-slate-500">Overstay alerts</span>
          <span className="font-heading font-extrabold text-2xl text-danger-fg">{overstayCount}</span>
          <span className="text-xs font-semibold text-danger-fg">inside over 4 hours</span>
        </Card>
      </div>

      {/* Persisted alerts */}
      <Card className="flex flex-col gap-3.5 !border-l-[3px] !border-l-danger-fg">
        <div className="flex items-center justify-between gap-3">
          <span className="font-heading font-bold text-body-lg">Active alerts</span>
          <span className="text-xs text-slate-400">Recorded automatically — checked every 5 minutes</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {alerts.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-danger-bg flex-wrap">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="flex items-center gap-2 flex-wrap">
                  <Badge tone="danger">{a.type}</Badge>
                  {a.flat && <span className="text-xs text-slate-500">{a.flat}</span>}
                  <span className="text-xs text-slate-400">
                    {a.triggeredAt ? a.triggeredAt.toLocaleString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }) : ""}
                  </span>
                </span>
                <span className="text-body font-semibold text-slate-700 truncate">{a.description}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => acknowledgeAlert(a.id)} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  Acknowledge
                </button>
                <button onClick={() => resolveAlert(a.id)} className="text-xs font-semibold text-success-fg hover:text-success-fg">
                  Resolve
                </button>
              </div>
            </div>
          ))}
          {alerts.length === 0 && <span className="text-body text-slate-400">No active alerts right now.</span>}
        </div>
      </Card>

      {/* Filter bar */}
      <Card className="flex flex-wrap items-center justify-between gap-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-[260px] h-10 px-3 border border-slate-300 rounded-lg bg-white">
            <IconSearch />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, flat or vehicle number"
              className="flex-1 min-w-0 outline-none text-body placeholder:text-slate-400"
            />
          </div>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="!w-[134px] !h-10">
            <option value="all">All types</option>
            {TYPES.map((t) => <option key={t} value={t}>{VISITOR_TYPE[t].label}</option>)}
          </Select>
          <button
            onClick={() => setInsideOnly((v) => !v)}
            className={`inline-flex items-center gap-2.5 h-10 px-3 rounded-lg border ${insideOnly ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-white"}`}
          >
            <span className={`w-[34px] h-5 rounded-full flex items-center px-0.5 transition-colors ${insideOnly ? "bg-brand-500 justify-end" : "bg-slate-300 justify-start"}`}>
              <span className="w-4 h-4 rounded-full bg-white" />
            </span>
            <span className={`text-body font-semibold ${insideOnly ? "text-brand-600" : "text-slate-600"}`}>Currently inside only</span>
          </button>
        </div>
        <span className="text-xs text-slate-400">{filtered.length} records</span>
      </Card>

      {/* Live strip */}
      <Card className="flex flex-col gap-3 !border-l-[3px] !border-l-success-fg">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success-fg" />
            <span className="font-heading font-bold text-body-lg">Live gate activity</span>
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {liveActivity.map((g) => {
            const type = VISITOR_TYPE[g.type];
            return (
              <div key={g.id} className="p-3 rounded-lg bg-slate-50 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-semibold text-success-fg">{g.entry}</span>
                  <Badge tone={type.tone}>{type.label}</Badge>
                </div>
                <span className="text-body font-semibold truncate">{g.visitor}</span>
                <span className="text-xs text-slate-500 truncate">{g.flat}</span>
              </div>
            );
          })}
          {liveActivity.length === 0 && <span className="text-body text-slate-500 col-span-full">No one is inside right now.</span>}
        </div>
      </Card>

      {/* Logs table */}
      <Card padded={false}>
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-200 flex-wrap">
          <h3 className="font-heading font-semibold text-h3 m-0">Gate log</h3>
          <span className="text-xs text-slate-400">Newest first · {logs.length} records total</span>
        </div>
        <Table minWidth="800px">
          <Thead>
            <Th sortKey="visitor" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Visitor</Th>
            <Th sortKey="type" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Type</Th>
            <Th sortKey="flat" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Flat</Th>
            <Th sortKey="vehicle" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Vehicle</Th>
            <Th sortKey="entry" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Entry</Th>
            <Th sortKey="exit" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Exit</Th>
            <Th align="right" sortKey="duration" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Duration</Th>
          </Thead>
          <tbody>
            {sorted.map((g) => {
              const type = VISITOR_TYPE[g.type];
              const status = GATE_LOG_STATUS[g.overstay ? "overstay" : g.exit ? "checked-out" : "inside"];
              return (
                <Tr key={g.id} className={g.overstay ? "!bg-danger-bg border-l-[3px] border-l-danger-fg" : ""}>
                  <Td>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-bold">{g.visitor}</span>
                      {g.overstay && <span className="text-[11px] font-semibold text-danger-fg">Overstay · {g.overstayBy}</span>}
                    </span>
                  </Td>
                  <Td><Badge tone={type.tone}>{type.label}</Badge></Td>
                  <Td mono>{g.flat}</Td>
                  <Td className={g.vehicle ? "font-mono text-mono-amt text-slate-500" : "text-slate-300"}>{g.vehicle ?? "—"}</Td>
                  <Td className="font-mono text-mono-amt">{g.entry}</Td>
                  <Td>
                    {g.exit ? (
                      <span className="font-mono text-mono-amt">{g.exit}</span>
                    ) : (
                      <Badge tone={status.tone}>Still inside</Badge>
                    )}
                  </Td>
                  <Td align="right" mono className={g.overstay ? "text-danger-fg font-semibold" : ""}>
                    {formatDuration(g.durationMin)}
                  </Td>
                </Tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-body text-slate-400">No entries match these filters.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

function formatDuration(min) {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
