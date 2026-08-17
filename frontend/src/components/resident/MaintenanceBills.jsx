import { useEffect, useState } from "react";
import { Card, Badge, Button, StatCard, Modal, Table, Thead, Th, Tr, Td } from "../ui/index.js";
import { IconBills } from "../common/icons.jsx";
import api from "../../services/api.js";
import { mapBill } from "../../utils/mappers.js";
import { BILL_STATUS, formatINR } from "../../utils/status.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSort } from "../../utils/useSort.js";
import { downloadBillReceipt } from "../../utils/receipt.js";

const BILL_HISTORY_SORT_RESOLVERS = {
  period: (b) => (b.raw?.due_date ? new Date(b.raw.due_date) : b.period),
  amount: (b) => b.amount,
  status: (b) => b.status,
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "overdue", label: "Overdue" },
];

export default function MaintenanceBills() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bills, setBills] = useState([]);
  const [filter, setFilter] = useState("all");
  const [payOpen, setPayOpen] = useState(false);
  const [payStep, setPayStep] = useState("select");
  const [method, setMethod] = useState("card");
  const [payTarget, setPayTarget] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/resident/bills");
      setBills(data.data.map(mapBill).sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bills.");
    } finally {
      setLoading(false);
    }
  }

  const currentBill = bills.find((b) => b.status !== "paid") || bills[0];
  const totalPaid = bills.filter((b) => b.status === "paid").reduce((sum, b) => sum + b.amount, 0);
  const outstanding = bills.filter((b) => b.status !== "paid").reduce((sum, b) => sum + b.amount, 0);
  const paidCount = bills.filter((b) => b.status === "paid").length;

  const filteredHistory = filter === "all" ? bills : bills.filter((b) => b.status === filter);
  const { sorted, sortKey, sortDir, toggleSort } = useSort(filteredHistory, BILL_HISTORY_SORT_RESOLVERS);

  function openPay() {
    setPayTarget(currentBill);
    setPayStep("select");
    setMethod("card");
    setPayOpen(true);
  }

  async function confirmPay() {
    if (!payTarget) return;
    setPaying(true);
    try {
      await api.post(`/resident/bills/${payTarget.id}/pay`);
      setBills((h) => h.map((b) => (b.id === payTarget.id ? { ...b, status: "paid", overdueDays: 0 } : b)));
      setPayStep("success");
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed.");
      setPayOpen(false);
    } finally {
      setPaying(false);
    }
  }

  function downloadReceipt(bill, overrides) {
    downloadBillReceipt(bill, user, overrides);
  }

  if (loading) {
    return <div className="text-body text-slate-500 py-12 text-center">Loading bills…</div>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1280px]">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">Maintenance Bills</h1>
        <span className="text-body text-slate-500">
          {user?.block}, Flat {user?.flat?.split("-")[1]} &middot; billing cycle closes on the 8th
        </span>
      </div>

      {error && <span className="text-body font-semibold text-danger-fg">{error}</span>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card accent={currentBill?.status === "overdue" ? "danger" : "brand"} className="lg:col-span-8 flex flex-col gap-4">
          {currentBill ? (
            <>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-2">
                  <span className="text-label uppercase text-slate-500">
                    Current bill &middot; {currentBill.period}
                  </span>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-heading font-extrabold text-display text-slate-800">{formatINR(currentBill.amount)}</span>
                    <Badge tone={BILL_STATUS[currentBill.status].tone}>{BILL_STATUS[currentBill.status].label}</Badge>
                  </div>
                  {currentBill.status === "overdue" && (
                    <span className="text-body font-semibold text-danger-fg">Overdue by {currentBill.overdueDays} days</span>
                  )}
                  {currentBill.status === "paid" && (
                    <span className="text-body font-semibold text-success-fg">Paid &mdash; thank you!</span>
                  )}
                </div>
                <div className="flex flex-col gap-2.5 min-w-[180px]">
                  <Button onClick={openPay} disabled={currentBill.status === "paid"}>
                    {currentBill.status === "paid" ? "Paid" : "Pay Now"}
                  </Button>
                  <Button variant="secondary" onClick={() => downloadReceipt(currentBill)}>
                    <IconBills size={16} color="currentColor" /> Download Receipt
                  </Button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_140px] px-4 py-2.5 bg-slate-100 text-label uppercase text-slate-500">
                  <span>Charge</span>
                  <span className="text-right">Amount</span>
                </div>
                {currentBill.breakdown.map((row) => (
                  <div
                    key={row.label}
                    className={`grid grid-cols-[1fr_140px] px-4 py-3 border-t border-slate-200 text-body ${
                      row.isPenalty ? "text-danger-fg font-semibold" : "text-slate-700"
                    }`}
                  >
                    <span>{row.label}</span>
                    <span className="text-right font-mono">{formatINR(row.amount)}</span>
                  </div>
                ))}
                <div className="grid grid-cols-[1fr_140px] px-4 py-3.5 border-t border-slate-200 bg-slate-50 text-body-lg font-bold">
                  <span>Total due</span>
                  <span className="text-right font-mono">{formatINR(currentBill.amount)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <span className="font-heading font-bold text-h3">No bills yet</span>
              <span className="text-body text-slate-500">Your society admin hasn't generated any bills.</span>
            </div>
          )}
        </Card>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <StatCard
            label="Total paid this year"
            value={formatINR(totalPaid)}
            hint={`${paidCount} of ${bills.length} bills cleared`}
          />
          <StatCard
            label="Outstanding balance"
            value={<span className={outstanding > 0 ? "text-danger-fg" : ""}>{formatINR(outstanding)}</span>}
            hint={outstanding > 0 ? "incl. late penalty" : "You're all caught up"}
          />
        </div>
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 flex-wrap px-5 py-4 border-b border-slate-200">
          <h3 className="font-heading font-semibold text-h3 m-0">Billing history</h3>
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`h-8 px-3.5 rounded-md text-xs font-bold ${
                  filter === f.id ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <Table>
          <Thead>
            <Th sortKey="period" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Month</Th>
            <Th align="right" sortKey="amount" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Amount</Th>
            <Th sortKey="status" activeKey={sortKey} direction={sortDir} onSort={toggleSort}>Status</Th>
            <Th align="right">Receipt</Th>
          </Thead>
          <tbody>
            {sorted.map((b) => {
              const s = BILL_STATUS[b.status] ?? BILL_STATUS.pending;
              return (
                <Tr key={b.id}>
                  <Td className="font-semibold">{b.period}</Td>
                  <Td align="right" mono>{formatINR(b.amount)}</Td>
                  <Td><Badge tone={s.tone}>{s.label}</Badge></Td>
                  <Td align="right">
                    {b.status === "paid" ? (
                      <button
                        onClick={() => downloadReceipt(b)}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                      >
                        Download
                      </button>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </Td>
                </Tr>
              );
            })}
            {filteredHistory.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-body text-slate-500">
                  No bills match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title={payStep === "select" ? "Confirm payment" : "Payment successful"}
        subtitle={payStep === "select" && payTarget ? payTarget.period : undefined}
        maxWidth="440px"
        footer={
          payStep === "select" ? (
            <>
              <Button variant="secondary" onClick={() => setPayOpen(false)}>Cancel</Button>
              <Button onClick={confirmPay} disabled={paying}>
                {paying ? "Processing…" : `Confirm Payment · ${formatINR(payTarget?.amount ?? 0)}`}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() =>
                  downloadReceipt(payTarget, {
                    paymentDate: new Date(),
                    paymentMethod: method === "card" ? "HDFC •••• 4471" : "Bank transfer (NEFT)",
                  })
                }
              >
                Download Receipt
              </Button>
              <Button onClick={() => setPayOpen(false)}>Back to bills</Button>
            </>
          )
        }
      >
        {payStep === "select" ? (
          <>
            <div className="p-4 rounded-lg bg-slate-50 flex flex-col gap-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-body text-slate-500">{payTarget?.period}</span>
                <span className="font-heading font-extrabold text-h2">{formatINR(payTarget?.amount ?? 0)}</span>
              </div>
              <span className="text-xs text-slate-400">Payment is simulated for this prototype.</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-label uppercase text-slate-500">Payment method</span>
              {[
                { id: "card", label: "Card · HDFC •••• 4471", hint: "Instant · receipt in 2 minutes" },
                { id: "bank", label: "Bank transfer · NEFT", hint: "Reflects in up to 24 hours" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center gap-3 p-3.5 rounded-lg border text-left ${
                    method === m.id ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex-shrink-0 border ${
                      method === m.id ? "border-[6px] border-brand-500 bg-white" : "border-slate-300 bg-white"
                    }`}
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-body-lg font-semibold">{m.label}</span>
                    <span className="text-xs text-slate-500">{m.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center">
              <svg width="30" height="30" viewBox="0 0 34 34" fill="none" aria-hidden="true">
                <path d="M9 17.5l5.5 5.5L25 12.5" stroke="#0F8B54" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-heading font-bold text-h3">Payment successful</span>
              <span className="text-body text-slate-500">
                {formatINR(payTarget?.amount ?? 0)} received for {payTarget?.period}. Your bill is now marked paid.
              </span>
            </div>
            <div className="w-full p-3.5 rounded-lg bg-slate-50 flex flex-col gap-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Method</span>
                <span className="font-semibold">{method === "card" ? "HDFC •••• 4471" : "Bank transfer"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Status</span>
                <Badge tone="success">Paid</Badge>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
