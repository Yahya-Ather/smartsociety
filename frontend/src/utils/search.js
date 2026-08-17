import api from "../services/api.js";
import {
  mapBill,
  mapComplaint,
  mapVisitorPass,
  mapNotice,
  mapResidentRow,
  mapAdminBill,
  mapTicket,
  mapVisitorLog,
  mapExpectedPass,
  mapInsideVisitor,
} from "./mappers.js";
import { formatINR } from "./status.js";

async function residentIndex() {
  const [billsRes, complaintsRes, passesRes, noticesRes] = await Promise.all([
    api.get("/resident/bills"),
    api.get("/resident/complaints"),
    api.get("/resident/visitor-passes"),
    api.get("/resident/notices"),
  ]);
  const bills = billsRes.data.data.map(mapBill);
  const complaints = complaintsRes.data.data.map(mapComplaint);
  const passes = passesRes.data.data.map(mapVisitorPass);
  const notices = noticesRes.data.data.map(mapNotice);

  return [
    ...bills.map((b) => ({
      id: `bill-${b.id}`,
      title: b.period,
      subtitle: `${formatINR(b.amount)} · ${b.status}`,
      group: "Maintenance Bills",
      path: "/resident/bills",
    })),
    ...complaints.map((c) => ({
      id: `tkt-${c.id}`,
      title: c.title,
      subtitle: `${c.status} · ${c.category}`,
      group: "Complaints",
      path: "/resident/complaints",
    })),
    ...passes.map((p) => ({
      id: `pass-${p._id}`,
      title: p.name,
      subtitle: `Code ${p.id} · ${p.status}`,
      group: "Visitor Passes",
      path: "/resident/visitor-pass",
    })),
    ...notices.map((n) => ({
      id: `notice-${n.id}`,
      title: n.title,
      subtitle: `Notice · ${n.category}`,
      group: "Notices",
      path: "/resident/notices",
    })),
  ];
}

async function adminIndex() {
  const [residentsRes, billingRes, complaintsRes, visitorsRes] = await Promise.all([
    api.get("/admin/residents"),
    api.get("/admin/billing"),
    api.get("/admin/helpdesk"),
    api.get("/security/visitors"),
  ]);
  const residents = residentsRes.data.data.map(mapResidentRow);
  const bills = billingRes.data.data.map(mapAdminBill);
  const tickets = complaintsRes.data.data.map(mapTicket);
  const logs = visitorsRes.data.data.map(mapVisitorLog);

  return [
    ...residents.map((r) => ({
      id: `res-${r.id}`,
      title: r.name,
      subtitle: `${r.flat} · ${r.email}`,
      group: "Residents",
      path: "/admin/residents",
    })),
    ...bills.map((b) => ({
      id: `bill-${b.id}`,
      title: b.flat,
      subtitle: `${b.period} · ${formatINR(b.amount)}`,
      group: "Bills",
      path: "/admin/billing",
    })),
    ...tickets.map((t) => ({
      id: `tkt-${t.id}`,
      title: t.title,
      subtitle: `${t.flat} · ${t.resident}`,
      group: "Complaints",
      path: "/admin/complaints",
    })),
    ...logs.map((l) => ({
      id: `log-${l.id}`,
      title: l.visitor,
      subtitle: `${l.flat} · ${l.status}`,
      group: "Security Logs",
      path: "/admin/security-logs",
    })),
  ];
}

async function guardIndex() {
  const [visitorsRes, activeRes] = await Promise.all([
    api.get("/security/visitors"),
    api.get("/security/active-visitors"),
  ]);
  const expected = visitorsRes.data.data.filter((v) => v.status === "Pre-Approved").map(mapExpectedPass);
  const inside = activeRes.data.data.map(mapInsideVisitor);

  return [
    ...expected.map((v) => ({
      id: `exp-${v._id}`,
      title: v.name,
      subtitle: `Expected · ${v.flat} · ${v.window}`,
      group: "Expected Passes",
      path: "/guard",
    })),
    ...inside.map((v) => ({
      id: `in-${v.id}`,
      title: v.name,
      subtitle: `Inside · ${v.flat} · ${v.elapsed}`,
      group: "Currently Inside",
      path: "/guard",
    })),
  ];
}

const BUILDERS = { resident: residentIndex, admin: adminIndex, guard: guardIndex };

// Pulls a role's real records from the backend once (Navbar caches the
// result) so every keystroke afterwards is a fast client-side filter
// instead of a fresh API round-trip.
export async function buildSearchIndex(role) {
  if (!BUILDERS[role]) return [];
  try {
    return await BUILDERS[role]();
  } catch {
    return [];
  }
}

export function filterIndex(index, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return index
    .filter((item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q))
    .slice(0, 8);
}
