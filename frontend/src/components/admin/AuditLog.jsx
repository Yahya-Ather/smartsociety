import { useEffect, useMemo, useState } from "react";
import { Card, Badge, Table, Thead, Th, Tr, Td, Select, Modal, Button } from "../ui/index.js";
import { IconSearch, IconAudit } from "../common/icons.jsx";
import api from "../../services/api.js";
import { mapAuditLog } from "../../utils/mappers.js";
import { AUDIT_ENTITY_TYPE } from "../../utils/status.js";
import { useSort } from "../../utils/useSort.js";

const ENTITY_TYPES = ["GateEntry", "Complaint", "Bill"];

const AUDIT_SORT_RESOLVERS = {
  at: (l) => l.at,
  entityType: (l) => l.entityType,
  action: (l) => l.action,
  description: (l) => l.description,
  actor: (l) => l.actor,
};

export default function AuditLog() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/audit-logs", { params: { limit: 200 } });
      setLogs(res.data.data.map(mapAuditLog));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load audit trail.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((l) => {
      if (typeFilter !== "all" && l.entityType !== typeFilter) return false;
      if (q && !`${l.description} ${l.actor} ${l.action}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [logs, search, typeFilter]);

  const { sorted, sortKey, sortDir, toggleSort } = useSort(filtered, AUDIT_SORT_RESOLVERS, "at", "desc");

  const counts = useMemo(() => {
    const c = { GateEntry: 0, Complaint: 0, Bill: 0 };
    logs.forEach((l) => {
      if (c[l.entityType] !== undefined) c[l.entityType] += 1;
    });
    return c;
  }, [logs]);

  if (loading) {
    return <div className="text-body text-slate-500 py-12 text-center">Loading audit trail…</div>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1440px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">Audit Log</h1>
          <span className="text-body text-slate-500">
            Immutable record of every gate entry, complaint status change and financial edit.
          </span>
        </div>
        <Badge tone="success">Write-once · DB-enforced</Badge>
      </div>

      {error && <span className="text-body font-semibold text-danger-fg">{error}</span>}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="flex flex-col gap-1.5">
          <span className="text-label uppercase text-slate-500">Total records</span>
          <span className="font-heading font-extrabold text-2xl text-slate-800">{logs.length}</span>
        </Card>
        <Card className="flex flex-col gap-1.5">
          <span className="text-label uppercase text-slate-500">Gate entries</span>
          <span className="font-heading font-extrabold text-2xl text-brand-600">{counts.GateEntry}</span>
        </Card>
        <Card className="flex flex-col gap-1.5">
          <span className="text-label uppercase text-slate-500">Complaint changes</span>
          <span className="font-heading font-extrabold text-2xl text-slate-800">{counts.Complaint}</span>
        </Card>
        <Card className="flex flex-col gap-1.5">
          <span className="text-label uppercase text-slate-500">Financial edits</span>
          <span className="font-heading font-extrabold text-2xl text-slate-800">{counts.Bill}</span>
        </Card>
      </div>

      {/* Filter bar */}
      <Card className="flex flex-wrap items-center justify-between gap-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-[280px] h-10 px-3 border border-slate-300 rounded-lg bg-white">
            <IconSearch />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Description, actor or action"
              className="flex-1 min-w-0 outline-none text-body placeholder:text-slate-400"
            />
          </div>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="!w-[160px] !h-10">
            <option value="all">All entities</option>
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>{AUDIT_ENTITY_TYPE[t].label}</option>
            ))}
          </Select>
        </div>
        <span className="text-xs text-slate-400">{filtered.length} records</span>
      </Card>

      {/* Trail table */}
      <Card padded={false}>
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-200 flex-wrap">
          <h3 className="font-heading font-semibold text-h3 m-0 inline-flex items-center gap-2">
            <IconAudit size={18} /> Audit trail
          </h3>
          <span className="text-xs text-slate-400">Newest first</span>
        </div>
        <Table minWidth="900px">
          <Thead>
            <Th sortKey="at" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Time</Th>
            <Th sortKey="entityType" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Entity</Th>
            <Th sortKey="action" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Action</Th>
            <Th sortKey="description" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Description</Th>
            <Th sortKey="actor" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Performed by</Th>
            <Th align="right">Details</Th>
          </Thead>
          <tbody>
            {sorted.map((l) => {
              const entity = AUDIT_ENTITY_TYPE[l.entityType] || { tone: "neutral", label: l.entityType };
              return (
                <Tr key={l.id}>
                  <Td className="text-xs text-slate-500 whitespace-nowrap">
                    {l.at
                      ? l.at.toLocaleString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false })
                      : "—"}
                  </Td>
                  <Td><Badge tone={entity.tone}>{entity.label} #{l.entityId}</Badge></Td>
                  <Td className="font-semibold text-slate-700">{l.action.replace(/_/g, " ")}</Td>
                  <Td className="max-w-[360px] truncate" title={l.description}>{l.description}</Td>
                  <Td>
                    <span className="flex flex-col">
                      <span className="font-semibold">{l.actor}</span>
                      {l.role && <span className="text-xs text-slate-400">{l.role}</span>}
                    </span>
                  </Td>
                  <Td align="right">
                    <button
                      onClick={() => setSelected(l)}
                      className="text-body font-semibold text-brand-600 hover:underline"
                    >
                      View diff
                    </button>
                  </Td>
                </Tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-body text-slate-400">No audit records match these filters.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `${(AUDIT_ENTITY_TYPE[selected.entityType] || {}).label || selected.entityType} #${selected.entityId}` : ""}
        subtitle={selected?.description}
        maxWidth="560px"
        footer={<Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>}
      >
        {selected && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-label uppercase text-slate-500">Before</span>
              <pre className="text-xs bg-slate-50 rounded-lg p-3 overflow-auto whitespace-pre-wrap break-words">
                {selected.before ? JSON.stringify(selected.before, null, 2) : "—"}
              </pre>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-label uppercase text-slate-500">After</span>
              <pre className="text-xs bg-slate-50 rounded-lg p-3 overflow-auto whitespace-pre-wrap break-words">
                {selected.after ? JSON.stringify(selected.after, null, 2) : "—"}
              </pre>
            </div>
            <div className="col-span-2 flex flex-col gap-1 pt-1 border-t border-slate-200 text-xs text-slate-500">
              <span>Performed by <span className="font-semibold text-slate-700">{selected.actor}</span> ({selected.role || "—"})</span>
              <span>{selected.at ? selected.at.toLocaleString("en-PK") : ""}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
