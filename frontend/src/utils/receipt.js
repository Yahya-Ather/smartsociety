import jsPDF from "jspdf";

// Real PDF generation, entirely client-side — the bill/breakdown data is
// already loaded in the resident's browser, so there's no need for a backend
// round-trip just to lay it out on a page.
export function downloadBillReceipt(bill, user, overrides = {}) {
  if (!bill) return;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let y = 56;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("SmartSociety", marginX, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text("Green Valley Residents' Welfare Association", marginX, y + 16);
  doc.setTextColor(0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Payment Receipt", pageWidth - marginX, y, { align: "right" });

  y += 36;
  doc.setDrawColor(210);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 26;

  const paymentDate = overrides.paymentDate || (bill.raw?.payment_date ? new Date(bill.raw.payment_date) : null);
  const paymentMethod = overrides.paymentMethod || bill.raw?.payment_method || null;

  const rows = [
    ["Resident", user?.name || "—"],
    ["Flat", user?.flat ? `${user.flat}${user.block ? ` · ${user.block}` : ""}` : "—"],
    ["Billing period", bill.period],
    [
      "Due date",
      bill.dueDate
        ? new Date(bill.dueDate).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })
        : "—",
    ],
    ["Status", bill.status.charAt(0).toUpperCase() + bill.status.slice(1)],
  ];
  if (bill.status === "paid" || paymentDate) {
    rows.push([
      "Payment date",
      paymentDate ? paymentDate.toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" }) : "—",
    ]);
    rows.push(["Payment method", paymentMethod || "—"]);
    if (bill.raw?.transaction_id) rows.push(["Transaction ID", bill.raw.transaction_id]);
  }

  doc.setFontSize(10.5);
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}`, marginX, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), marginX + 140, y);
    y += 20;
  });

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Charge breakdown", marginX, y);
  y += 10;
  doc.setDrawColor(210);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  (bill.breakdown || []).forEach((row) => {
    if (row.isPenalty) doc.setTextColor(200, 40, 40);
    doc.text(row.label, marginX, y);
    doc.text(`Rs ${row.amount.toLocaleString("en-PK")}`, pageWidth - marginX, y, { align: "right" });
    doc.setTextColor(0);
    y += 20;
  });

  y += 4;
  doc.setDrawColor(180);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 26;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Total", marginX, y);
  doc.text(`Rs ${bill.amount.toLocaleString("en-PK")}`, pageWidth - marginX, y, { align: "right" });

  y += 60;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(130);
  doc.text(
    `Generated on ${new Date().toLocaleString("en-PK")} — system-generated receipt, no signature required.`,
    marginX,
    y,
  );

  const fileSafePeriod = bill.period.replace(/[^\w]+/g, "-");
  doc.save(`SmartSociety-Receipt-${fileSafePeriod}-${bill.id}.pdf`);
}
