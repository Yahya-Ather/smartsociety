// Central status → {tone, label} maps so every screen renders badges identically.

export const BILL_STATUS = {
  paid: { tone: "success", label: "Paid" },
  pending: { tone: "warning", label: "Pending" },
  overdue: { tone: "danger", label: "Overdue" },
};

export const COMPLAINT_STATUS = {
  pending: { tone: "warning", label: "Pending" },
  "in-progress": { tone: "info", label: "In-Progress" },
  resolved: { tone: "success", label: "Resolved" },
};

export const PASS_STATUS = {
  valid: { tone: "teal", label: "Valid" },
  upcoming: { tone: "info", label: "Upcoming" },
  used: { tone: "neutral", label: "Checked Out" },
  expired: { tone: "danger", label: "Expired" },
  cancelled: { tone: "neutral", label: "Cancelled" },
};

export const BOOKING_STATUS = {
  confirmed: { tone: "success", label: "Confirmed" },
  awaiting: { tone: "warning", label: "Awaiting" },
  cancelled: { tone: "neutral", label: "Cancelled" },
};

// Guard · pass verification lookup result tones.
export const VERIFICATION_STATUS = {
  valid: { tone: "success", label: "Valid" },
  expired: { tone: "danger", label: "Expired" },
  used: { tone: "warning", label: "Already Used" },
  not_found: { tone: "danger", label: "Invalid Code" },
};

// ---- Admin-specific status maps ----

export const RESIDENT_STATUS = {
  active: { tone: "success", label: "Active" },
  "kyc-pending": { tone: "warning", label: "KYC Pending" },
  offboarded: { tone: "neutral", label: "Offboarded" },
};

export const OCCUPANCY_TYPE = {
  owner: { tone: "info", label: "Owner" },
  tenant: { tone: "teal", label: "Tenant" },
};

export const TICKET_PRIORITY = {
  urgent: { tone: "danger", label: "Urgent" },
  high: { tone: "warning", label: "High" },
  medium: { tone: "info", label: "Medium" },
  low: { tone: "neutral", label: "Low" },
};

// Kanban column status for the Complaint Routing board (distinct from resident-facing COMPLAINT_STATUS)
export const ROUTING_STATUS = {
  unassigned: { tone: "danger", label: "Unassigned" },
  "in-progress": { tone: "info", label: "In-Progress" },
  resolved: { tone: "success", label: "Resolved" },
};

export const VISITOR_TYPE = {
  delivery: { tone: "info", label: "Delivery" },
  guest: { tone: "teal", label: "Guest" },
  staff: { tone: "neutral", label: "Staff" },
  cab: { tone: "warning", label: "Cab" },
  vendor: { tone: "neutral", label: "Vendor" },
};

export const GATE_LOG_STATUS = {
  inside: { tone: "info", label: "Inside" },
  "checked-out": { tone: "neutral", label: "Checked Out" },
  overstay: { tone: "danger", label: "Overstay" },
};

// Occupancy map tile status
export const FLAT_STATUS = {
  owner: { tone: "info", label: "Occupied · Owner" },
  tenant: { tone: "teal", label: "Occupied · Tenant" },
  vacant: { tone: "neutral", label: "Vacant" },
  attention: { tone: "warning", label: "Attention" },
};

export const STAFF_STATUS = {
  active: { tone: "success", label: "Active" },
  inactive: { tone: "neutral", label: "Inactive" },
};

export const STAFF_ROLE = {
  Admin: { tone: "info", label: "Admin" },
  Guard: { tone: "teal", label: "Guard" },
};

export const SERVICE_TYPE_TONE = {
  Plumber: "info",
  Electrician: "warning",
  Carpenter: "neutral",
  Housekeeping: "teal",
  "Facility Manager": "success",
  Gardener: "teal",
  Painter: "neutral",
  "Pest Control": "danger",
  Other: "neutral",
};

export const AUDIT_ENTITY_TYPE = {
  GateEntry: { tone: "teal", label: "Gate Entry" },
  Complaint: { tone: "info", label: "Complaint" },
  Bill: { tone: "warning", label: "Bill" },
};

export function formatINR(amount) {
  return `Rs ${amount.toLocaleString("en-PK")}`;
}
