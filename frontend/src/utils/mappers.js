// Translates raw backend documents into the shapes the existing UI components
// were built against (see data/*MockData.js for the original shapes).

const CHARGE_LABELS = {
  maintenance: "Maintenance",
  water: "Water",
  security: "Security",
  repairs: "Repairs",
  other: "Other charges",
};

export function mapBill(bill) {
  if (!bill) return null;
  const status = { Paid: "paid", Pending: "pending", Overdue: "overdue", Partial: "pending" }[
    bill.payment_status
  ] || "pending";
  const overdueDays =
    status === "overdue"
      ? Math.max(0, Math.floor((Date.now() - new Date(bill.due_date).getTime()) / 86400000))
      : 0;

  const breakdown = [];
  const cb = bill.charges_breakdown || {};
  Object.entries(CHARGE_LABELS).forEach(([key, label]) => {
    if (cb[key]) breakdown.push({ label, amount: cb[key] });
  });
  if (breakdown.length === 0) {
    breakdown.push({ label: "Base maintenance", amount: bill.base_amount });
  }
  if (bill.penalty_amount > 0) {
    breakdown.push({ label: "Late penalty", amount: bill.penalty_amount, isPenalty: true });
  }

  return {
    id: bill._id,
    period: bill.billing_month,
    amount: bill.total_due,
    status,
    dueDate: bill.due_date,
    overdueDays,
    breakdown,
    raw: bill,
  };
}

const COMPLAINT_STATUS_MAP = {
  Pending: "pending",
  "In-Progress": "in-progress",
  Resolved: "resolved",
  Closed: "resolved",
};

export function mapComplaint(c) {
  if (!c) return null;
  const status = COMPLAINT_STATUS_MAP[c.status] || "pending";
  const updates = [];
  if (c.resolution_notes) {
    updates.push({
      at: c.resolution_date ? new Date(c.resolution_date).toLocaleDateString("en-PK", { day: "numeric", month: "short" }) : "",
      by: "Society Admin",
      text: c.resolution_notes,
    });
  }
  return {
    id: c._id,
    title: c.category,
    category: c.category,
    status,
    priority: (c.priority || "Medium").toLowerCase(),
    createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" }) : "",
    sla: c.sla_due_date
      ? `SLA · ${new Date(c.sla_due_date).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}`
      : status === "resolved"
      ? "Resolved"
      : "Awaiting assignment",
    description: c.description,
    photos: c.photo_url ? 1 : 0,
    photoUrl: c.photo_url,
    updates,
    raw: c,
  };
}

export const VISITOR_TYPE_TO_BACKEND = {
  guest: "Guest",
  delivery: "Delivery Partner",
  cab: "Cab Operator",
  vendor: "Service Provider",
};

export const VISITOR_TYPE_FROM_BACKEND = {
  Guest: "guest",
  "Delivery Partner": "delivery",
  "Service Provider": "vendor",
  "Cab Operator": "cab",
  Other: "vendor",
};

export function formatPassWindow(from, until) {
  if (!from || !until) return "";
  try {
    const f = new Date(from);
    const u = new Date(until);
    const dateStr = f.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
    const fTime = f.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: false });
    const uTime = u.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: false });
    return `${dateStr}, ${fTime}–${uTime}`;
  } catch {
    return "";
  }
}

// Splits passes into { active, history } the way VisitorPass.jsx's two tabs expect.
export function mapVisitorPass(v) {
  if (!v) return null;
  const now = Date.now();
  const validTill = v.valid_till ? new Date(v.valid_till).getTime() : null;
  const validFrom = v.valid_from ? new Date(v.valid_from).getTime() : null;

  let status;
  let bucket;
  if (v.status === "Exited") {
    status = "used";
    bucket = "history";
  } else if (v.status === "Entered") {
    status = "valid";
    bucket = "active";
  } else if (validTill && validTill < now) {
    status = "expired";
    bucket = "history";
  } else if (validFrom && validFrom > now) {
    status = "upcoming";
    bucket = "active";
  } else {
    status = "valid";
    bucket = "active";
  }

  return {
    id: v.gate_pass_code || v._id,
    _id: v._id,
    name: v.visitor_name + (v.vehicle_number ? ` · ${v.vehicle_number}` : ""),
    type: VISITOR_TYPE_FROM_BACKEND[v.visitor_type] || "guest",
    window: formatPassWindow(v.valid_from, v.valid_till),
    status,
    bucket,
    raw: v,
  };
}

export function mapAmenityBooking(b) {
  if (!b) return null;
  const statusMap = { Pending: "awaiting", Confirmed: "confirmed", Cancelled: "cancelled", Completed: "confirmed" };
  const amenity = b.amenity_id && typeof b.amenity_id === "object" ? b.amenity_id : null;
  return {
    id: b._id,
    amenity: amenity ? amenity.name : "Amenity",
    date: b.booking_date ? new Date(b.booking_date).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" }) : "",
    window: `${b.time_from}–${b.time_to}`,
    guests: b.number_of_guests,
    status: statusMap[b.booking_status] || "awaiting",
    raw: b,
  };
}

export function mapNotice(n) {
  if (!n) return null;
  return {
    id: n._id,
    title: n.title,
    category: n.category || "General",
    urgent: Boolean(n.urgent),
    postedAt: n.createdAt ? new Date(n.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" }) : "",
    body: n.description,
    eventDate: n.event_date || null,
    eventTime: n.event_time || "",
    eventLocation: n.event_location || "",
    raw: n,
  };
}

export function mapAdminBill(bill) {
  const status = { Paid: "paid", Pending: "pending", Overdue: "overdue", Partial: "pending" }[
    bill.payment_status
  ] || "pending";
  const flat = bill.flat_id && typeof bill.flat_id === "object" ? bill.flat_id : null;
  const overdueDays =
    status !== "paid" && bill.due_date && new Date(bill.due_date) < Date.now()
      ? Math.max(0, Math.floor((Date.now() - new Date(bill.due_date).getTime()) / 86400000))
      : 0;
  return {
    id: bill._id,
    flat: flat ? `${flat.block_name.replace(/^Tower\s*/i, "")}-${flat.flat_number}` : "—",
    period: bill.billing_month,
    amount: bill.total_due,
    dueDate: bill.due_date ? new Date(bill.due_date).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "",
    penalty: bill.penalty_amount || 0,
    status: overdueDays > 0 && status !== "paid" ? "overdue" : status,
    overdueDays,
    raw: bill,
  };
}

const TICKET_PRIORITY_MAP = { Low: "low", Medium: "medium", High: "high", Urgent: "urgent" };

export function mapTicket(c) {
  const flat = c.flat_id && typeof c.flat_id === "object" ? c.flat_id : null;
  const resident = c.resident_id && typeof c.resident_id === "object" ? c.resident_id : null;
  const assignee = c.assigned_to && typeof c.assigned_to === "object" ? c.assigned_to : null;
  const isResolved = c.status === "Resolved" || c.status === "Closed";
  const status = !c.assigned_to ? "unassigned" : isResolved ? "resolved" : "in-progress";
  const slaBreached = Boolean(c.sla_due_date) && new Date(c.sla_due_date) < Date.now() && !isResolved;
  return {
    id: c._id,
    title: c.category,
    category: c.category,
    priority: TICKET_PRIORITY_MAP[c.priority] || "medium",
    status,
    resident: resident?.name || resident?.username || "Resident",
    flat: flat ? `${flat.block_name.replace(/^Tower\s*/i, "")}-${flat.flat_number}` : "—",
    createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "",
    slaText: c.sla_due_date
      ? slaBreached
        ? "SLA breached"
        : `SLA target ${new Date(c.sla_due_date).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}`
      : isResolved
      ? "Resolved"
      : "No SLA set",
    slaBreached,
    assignedTo: assignee?._id || null,
    assignedName: assignee?.name || assignee?.username || null,
    description: c.description,
    photos: c.photo_url ? 1 : 0,
    updates: c.resolution_notes ? [{ at: "", by: "Admin", text: c.resolution_notes }] : [],
    raw: c,
  };
}

export function mapResidentRow(u) {
  const flat = u.flat_id && typeof u.flat_id === "object" ? u.flat_id : null;
  return {
    id: u._id,
    username: u.username,
    name: u.name,
    email: u.email,
    phone: u.phone_number || "—",
    block: flat?.block_name || "—",
    flat: flat ? `${flat.block_name.replace(/^Tower\s*/i, "")}-${flat.flat_number}` : "—",
    flatId: flat?._id || null,
    occupancyType: (flat?.occupancy_type || "Owner").toLowerCase(),
    status: u.is_active ? "active" : "kyc-pending",
    isActive: u.is_active,
    raw: u,
  };
}

export function mapVisitorLog(v) {
  const flat = v.flat_id && typeof v.flat_id === "object" ? v.flat_id : null;
  const typeMap = { Guest: "guest", "Delivery Partner": "delivery", "Service Provider": "vendor", "Cab Operator": "cab", Other: "vendor" };
  const entry = v.entry_timestamp ? new Date(v.entry_timestamp) : null;
  const exit = v.exit_timestamp ? new Date(v.exit_timestamp) : null;
  const durationMin = entry ? Math.round(((exit || new Date()) - entry) / 60000) : 0;
  const overstay = !exit && entry && durationMin > 240;
  return {
    id: v._id,
    visitor: v.visitor_name,
    type: typeMap[v.visitor_type] || "guest",
    flat: flat ? `${flat.block_name.replace(/^Tower\s*/i, "")}-${flat.flat_number}` : "—",
    vehicle: v.vehicle_number || null,
    entry: entry ? entry.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: false }) : "—",
    exit: exit ? exit.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: false }) : null,
    gate: "Main Gate",
    guard: "",
    durationMin,
    overstay,
    overstayBy: overstay ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}m` : null,
    status: v.status,
    raw: v,
  };
}

export function mapExpectedPass(v) {
  const flat = v.flat_id && typeof v.flat_id === "object" ? v.flat_id : null;
  return {
    id: v.gate_pass_code,
    _id: v._id,
    name: v.visitor_name,
    type: VISITOR_TYPE_FROM_BACKEND[v.visitor_type] || "guest",
    flat: flat ? `${flat.block_name.replace(/^Tower\s*/i, "")}-${flat.flat_number}` : "—",
    resident: flat?.owner_name || "",
    window: formatPassWindow(v.valid_from, v.valid_till),
    eta: v.valid_from ? new Date(v.valid_from).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: false }) : "",
    raw: v,
  };
}

export function mapInsideVisitor(v) {
  const flat = v.flat_id && typeof v.flat_id === "object" ? v.flat_id : null;
  const entry = v.entry_timestamp ? new Date(v.entry_timestamp) : null;
  const elapsedMin = entry ? Math.round((Date.now() - entry.getTime()) / 60000) : 0;
  const overstay = elapsedMin > 240;
  const h = Math.floor(elapsedMin / 60);
  const m = elapsedMin % 60;
  const elapsed = h > 0 ? `${h}h ${m}m` : `${m}m`;
  return {
    id: v._id,
    name: v.visitor_name,
    type: VISITOR_TYPE_FROM_BACKEND[v.visitor_type] || "guest",
    flat: flat ? `${flat.block_name.replace(/^Tower\s*/i, "")}-${flat.flat_number}` : "—",
    checkedInAt: entry ? entry.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: false }) : "",
    elapsed,
    overstay,
    overstayBy: overstay ? `${elapsed} over` : null,
    raw: v,
  };
}

export function mapStaffRow(u) {
  return {
    id: u._id,
    name: u.name,
    username: u.username,
    email: u.email,
    phone: u.phone_number || "—",
    role: u.role,
    gate: u.gate || "",
    status: u.is_active ? "active" : "inactive",
    isActive: u.is_active,
    raw: u,
  };
}

export function mapServiceStaffRow(s) {
  return {
    id: s._id,
    name: s.name,
    phone: s.phone_number,
    serviceType: s.service_type,
    status: s.is_active ? "active" : "inactive",
    isActive: s.is_active,
    raw: s,
  };
}

export function mapSecurityAlert(a) {
  const visitor = a.visitor_id && typeof a.visitor_id === "object" ? a.visitor_id : null;
  const flat = a.flat_id && typeof a.flat_id === "object" ? a.flat_id : null;
  return {
    id: a._id,
    type: a.alert_type,
    description: a.description,
    status: a.alert_status,
    visitorName: visitor?.visitor_name || null,
    flat: flat ? `${flat.block_name.replace(/^Tower\s*/i, "")}-${flat.flat_number}` : null,
    triggeredAt: a.trigger_time ? new Date(a.trigger_time) : null,
    raw: a,
  };
}

export function mapAuditLog(a) {
  return {
    id: a._id,
    entityType: a.entity_type,
    entityId: a.entity_id,
    action: a.action,
    actor: a.performed_by_name || "System",
    role: a.performed_by_role || "",
    description: a.description,
    before: a.before_value,
    after: a.after_value,
    at: a.createdAt ? new Date(a.createdAt) : null,
    raw: a,
  };
}

export function mapPoll(p) {
  if (!p) return null;
  const total = p.options.reduce((sum, o) => sum + (o.vote_count || 0), 0);
  return {
    id: p._id,
    question: p.question,
    status: p.poll_status === "Active" ? "open" : "closed",
    closesIn: p.end_date ? `Closes ${new Date(p.end_date).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}` : "",
    votes: total,
    total,
    userVoted: Boolean(p.userVoted),
    userVotedOption: p.userVotedOption || null,
    options: p.options.map((o) => ({
      label: o.option_text,
      pct: total > 0 ? Math.round((o.vote_count / total) * 100) : 0,
    })),
    raw: p,
  };
}
