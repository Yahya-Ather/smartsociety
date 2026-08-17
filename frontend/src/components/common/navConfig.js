import {
  IconDashboard,
  IconVisitorPass,
  IconBills,
  IconComplaints,
  IconAmenity,
  IconNotices,
  IconResidents,
  IconBillingEngine,
  IconRouting,
  IconSecurity,
  IconGuardEntry,
  IconPassVerify,
  IconAudit,
  IconStaff,
} from "./icons.jsx";

// Nav items render strictly from the signed-in role — nothing outside the
// role is shown, even disabled (per Design System §05).
export const NAV_CONFIG = {
  resident: {
    groupLabel: "My home",
    items: [
      { label: "Dashboard", shortLabel: "Home", path: "/resident", icon: IconDashboard },
      { label: "Visitor Pass", shortLabel: "Passes", path: "/resident/visitor-pass", icon: IconVisitorPass },
      {
        label: "Maintenance Bills",
        shortLabel: "Bills",
        path: "/resident/bills",
        icon: IconBills,
        countKey: "overdueBills",
      },
      {
        label: "Complaints",
        shortLabel: "Tickets",
        path: "/resident/complaints",
        icon: IconComplaints,
        countKey: "openComplaints",
      },
      { label: "Amenity Booking", shortLabel: "Book", path: "/resident/amenities", icon: IconAmenity },
      { label: "Notices", shortLabel: "Notices", path: "/resident/notices", icon: IconNotices },
    ],
  },
  admin: {
    groupLabel: "Administration",
    items: [
      { label: "Dashboard", path: "/admin", icon: IconDashboard },
      { label: "Resident Management", path: "/admin/residents", icon: IconResidents },
      { label: "Staff Management", path: "/admin/staff", icon: IconStaff },
      { label: "Billing Engine", path: "/admin/billing", icon: IconBillingEngine, countKey: "pendingBills" },
      { label: "Complaint Routing", path: "/admin/complaints", icon: IconRouting },
      { label: "Security Logs", path: "/admin/security-logs", icon: IconSecurity },
      { label: "Amenities", path: "/admin/amenities", icon: IconAmenity },
      { label: "Audit Log", path: "/admin/audit-log", icon: IconAudit },
    ],
  },
  guard: {
    groupLabel: null,
    items: [
      { label: "Dashboard", shortLabel: "Home", path: "/guard", icon: IconDashboard },
      { label: "Visitor Entry", shortLabel: "Entry", path: "/guard/visitor-entry", icon: IconGuardEntry },
      { label: "Pass Verification", shortLabel: "Verify", path: "/guard/verify-pass", icon: IconPassVerify },
    ],
  },
};
