import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Badge,
  Button,
  Modal,
  Table,
  Thead,
  Th,
  Tr,
  Td,
  Select,
  TextInput,
  FormField,
} from "../ui/index.js";
import { IconSearch } from "../common/icons.jsx";
import api from "../../services/api.js";
import { mapAdminBill } from "../../utils/mappers.js";
import { BILL_STATUS, formatINR } from "../../utils/status.js";
import { useSort } from "../../utils/useSort.js";

const BILL_SORT_RESOLVERS = {
  flat: (b) => b.flat,
  period: (b) => b.period,
  amount: (b) => b.amount,
  dueDate: (b) => (b.raw?.due_date ? new Date(b.raw.due_date) : null),
  penalty: (b) => b.penalty,
  status: (b) => b.status,
};

const TABS = [
  { key: "all", label: "All" },
  { key: "paid", label: "Paid" },
  { key: "pending", label: "Pending" },
  { key: "overdue", label: "Overdue" },
];

const CHARGE_FIELDS = [
  { id: "maintenance", label: "Maintenance", helper: "Core upkeep charge" },
  { id: "water", label: "Water charges", helper: "Per flat, metered average" },
  { id: "security", label: "Security", helper: "Gates & guard roster" },
  { id: "repairs", label: "Repairs & maintenance", helper: "Sinking fund contribution" },
  { id: "other", label: "Other charges", helper: "Amenities, misc." },
];

function defaultCharges() {
  return { maintenance: 2500, water: 520, security: 1150, repairs: 780, other: 250 };
}

export default function BillingEngine() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState("all");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [charges, setCharges] = useState(defaultCharges());
  const [billingMonth, setBillingMonth] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [generating, setGenerating] = useState(false);
  const [penaltyTarget, setPenaltyTarget] = useState(null);
  const [penaltyAmount, setPenaltyAmount] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/billing");
      setSummary(data.summary);
      setBills(data.data.map(mapAdminBill));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load billing data.");
    } finally {
      setLoading(false);
    }
  }

  const blocks = useMemo(() => [...new Set(bills.map((b) => b.flat.split("-")[0]))], [bills]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bills.filter((b) => {
      if (tab !== "all" && b.status !== tab) return false;
      if (blockFilter !== "all" && !b.flat.startsWith(blockFilter)) return false;
      if (q && !b.flat.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [bills, tab, search, blockFilter]);

  const { sorted, sortKey, sortDir, toggleSort } = useSort(filtered, BILL_SORT_RESOLVERS);

  const perFlatTotal = Object.values(charges).reduce((sum, v) => sum + Number(v || 0), 0);

  async function markPaid(id) {
    try {
      await api.patch(`/admin/billing/${id}/paid`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark bill as paid.");
    }
  }

  async function submitPenalty() {
    if (!penaltyTarget || !penaltyAmount) return;
    try {
      await api.patch(`/admin/billing/${penaltyTarget.id}/penalty`, { penalty_amount: Number(penaltyAmount) });
      setPenaltyTarget(null);
      setPenaltyAmount("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply penalty.");
    }
  }

  async function handleGenerate(e) {
    e.preventDefault();
    if (!billingMonth.trim() || !dueDate) return;
    setGenerating(true);
    setError("");
    try {
      await api.post("/admin/bills", {
        billing_month: billingMonth.trim(),
        amount_due: perFlatTotal,
        due_date: new Date(dueDate).toISOString(),
        charges_breakdown: charges,
      });
      setGenerateOpen(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate bills.");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return <div className="text-body text-slate-500 py-12 text-center">Loading billing…</div>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1440px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">Billing Engine</h1>
          <span className="text-body text-slate-500">{bills.length} invoices on record</span>
        </div>
        <Button size="sm" onClick={() => setGenerateOpen(true)}>Generate Monthly Bills</Button>
      </div>

      {error && <span className="text-body font-semibold text-danger-fg">{error}</span>}

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Card className="flex flex-col gap-2">
            <span className="text-label uppercase text-slate-500">Total bills</span>
            <span className="font-heading font-extrabold text-[28px] text-slate-800">{summary.total_bills}</span>
            <span className="text-xs text-slate-500">{summary.paid_bills} paid</span>
          </Card>
          <Card className="flex flex-col gap-2">
            <span className="text-label uppercase text-slate-500">Total collected</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading font-extrabold text-[28px] text-slate-800">{formatINR(summary.total_collected)}</span>
              <span className="text-xs font-bold text-success-fg">{summary.collection_percentage}%</span>
            </div>
            <div className="h-[5px] rounded-full bg-slate-100 overflow-hidden">
              <span className="block h-full bg-success-fg" style={{ width: `${summary.collection_percentage}%` }} />
            </div>
          </Card>
          <Card accent="danger" className="flex flex-col gap-2">
            <span className="text-label uppercase text-slate-500">Total outstanding</span>
            <span className="font-heading font-extrabold text-[28px] text-danger-fg">{formatINR(summary.total_pending)}</span>
            <span className="text-xs text-slate-500">{summary.pending_bills} pending</span>
          </Card>
          <Card accent="danger" className="flex flex-col gap-2">
            <span className="text-label uppercase text-slate-500">Overdue accounts</span>
            <span className="font-heading font-extrabold text-[28px] text-danger-fg">{summary.overdue_bills}</span>
            <span className="text-xs text-slate-500">of {summary.total_bills} bills</span>
          </Card>
        </div>
      )}

      <Card padded={false}>
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200 flex-wrap">
          <h3 className="font-heading font-semibold text-h3 m-0">Bills</h3>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 w-[220px] h-9 px-3 border border-slate-300 rounded-lg bg-white">
              <IconSearch />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Flat number"
                className="flex-1 min-w-0 outline-none text-body placeholder:text-slate-400 text-sm"
              />
            </div>
            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`h-8 px-3 rounded-control text-xs font-semibold ${tab === t.key ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <Select value={blockFilter} onChange={(e) => setBlockFilter(e.target.value)} className="!w-[124px] !h-9 !text-sm">
              <option value="all">All blocks</option>
              {blocks.map((b) => <option key={b} value={b}>{b}</option>)}
            </Select>
          </div>
        </div>
        <Table minWidth="720px">
          <Thead>
            <Th sortKey="flat" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Flat</Th>
            <Th sortKey="period" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Period</Th>
            <Th align="right" sortKey="amount" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Amount due</Th>
            <Th sortKey="dueDate" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Due date</Th>
            <Th align="right" sortKey="penalty" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Penalty</Th>
            <Th sortKey="status" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Status</Th>
            <Th align="right">Actions</Th>
          </Thead>
          <tbody>
            {sorted.map((b) => {
              const s = BILL_STATUS[b.status];
              return (
                <Tr key={b.id}>
                  <Td mono className="font-semibold">{b.flat}</Td>
                  <Td className="text-slate-500">{b.period}</Td>
                  <Td align="right" mono>{formatINR(b.amount)}</Td>
                  <Td className="text-slate-500">{b.dueDate}</Td>
                  <Td align="right" mono className={b.penalty ? "text-danger-fg" : "text-slate-400"}>
                    {b.penalty ? formatINR(b.penalty) : "—"}
                  </Td>
                  <Td>
                    <Badge tone={s.tone}>{b.status === "overdue" ? `Overdue ${b.overdueDays}d` : s.label}</Badge>
                  </Td>
                  <Td align="right">
                    {b.status === "paid" ? (
                      <span className="text-xs text-slate-400">—</span>
                    ) : (
                      <span className="inline-flex items-center gap-3 justify-end">
                        <button
                          onClick={() => { setPenaltyTarget(b); setPenaltyAmount(""); }}
                          className="text-xs font-semibold text-warning-fg"
                        >
                          Apply penalty
                        </button>
                        <button onClick={() => markPaid(b.id)} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                          Mark paid
                        </button>
                      </span>
                    )}
                  </Td>
                </Tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-body text-slate-400">No bills match these filters.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* Generate monthly bills modal */}
      <Modal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        title="Generate monthly bills"
        subtitle="Invoices are issued to every flat on record."
        maxWidth="520px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setGenerateOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? "Generating…" : "Confirm & Generate"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Billing month" required>
            <TextInput placeholder="September 2026" value={billingMonth} onChange={(e) => setBillingMonth(e.target.value)} />
          </FormField>
          <FormField label="Due date" required>
            <TextInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </FormField>
        </div>

        <div className="p-4 rounded-lg bg-brand-100 flex flex-col gap-1.5">
          <span className="text-label uppercase text-brand-600">Preview</span>
          <span className="text-body-lg text-brand-700 leading-relaxed">
            This will generate one bill per flat on record, each totalling{" "}
            <strong className="font-mono">{formatINR(perFlatTotal)}</strong>.
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-label uppercase text-slate-500">Charge components</span>
          {CHARGE_FIELDS.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3.5 border border-slate-200 rounded-lg">
              <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-body-lg font-semibold">{c.label}</span>
                <span className="text-xs text-slate-400">{c.helper}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 flex-shrink-0">
                <span className="text-body text-slate-500">Rs </span>
                <input
                  value={charges[c.id]}
                  onChange={(e) => setCharges((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  className="w-[84px] h-9 px-2 border border-slate-300 rounded-lg font-mono text-right outline-none"
                />
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-100">
            <span className="text-body-lg font-bold">Per-flat total</span>
            <span className="font-mono text-body-lg font-semibold">{formatINR(perFlatTotal)}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-warning-bg">
          <span className="w-2 h-2 rounded-full bg-warning-fg mt-1.5 flex-shrink-0" />
          <span className="text-xs text-warning-fg leading-relaxed">
            Generation creates a new bill for every flat and cannot be undone from here.
          </span>
        </div>
      </Modal>

      {/* Apply penalty modal */}
      <Modal
        open={!!penaltyTarget}
        onClose={() => setPenaltyTarget(null)}
        title="Apply penalty"
        subtitle={penaltyTarget ? `${penaltyTarget.flat} · ${penaltyTarget.period}` : undefined}
        maxWidth="360px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPenaltyTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={submitPenalty}>Apply</Button>
          </>
        }
      >
        <FormField label="Penalty amount (Rs)" required>
          <TextInput type="number" value={penaltyAmount} onChange={(e) => setPenaltyAmount(e.target.value)} placeholder="150" />
        </FormField>
      </Modal>
    </div>
  );
}
