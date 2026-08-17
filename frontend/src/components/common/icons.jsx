// Lightweight inline icon set matching the Design System's stroke-icon style.
// Every icon accepts `size` and `color` so nav items can recolor on active/hover state.

const base = (size) => ({ width: size, height: size, viewBox: "0 0 18 18", fill: "none" });

export const IconDashboard = ({ size = 18, color = "#5B6779" }) => (
  <svg {...base(size)} aria-hidden="true">
    <rect x="2" y="2" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.5" />
    <rect x="10" y="2" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.5" />
    <rect x="2" y="10" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.5" />
    <rect x="10" y="10" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.5" />
  </svg>
);

export const IconVisitorPass = ({ size = 18, color = "#5B6779" }) => (
  <svg {...base(size)} aria-hidden="true">
    <rect x="2.5" y="4" width="13" height="10" rx="2" stroke={color} strokeWidth="1.5" />
    <rect x="5.5" y="7" width="4" height="4" rx="0.5" stroke={color} strokeWidth="1.3" />
  </svg>
);

export const IconBills = ({ size = 18, color = "#5B6779" }) => (
  <svg {...base(size)} aria-hidden="true">
    <path d="M4 2.5h10v13l-2-1.5-3 1.5-3-1.5L4 15.5v-13Z" stroke={color} strokeWidth="1.5" />
    <line x1="6.5" y1="6.5" x2="11.5" y2="6.5" stroke={color} strokeWidth="1.3" />
    <line x1="6.5" y1="9.5" x2="10" y2="9.5" stroke={color} strokeWidth="1.3" />
  </svg>
);

export const IconComplaints = ({ size = 18, color = "#5B6779" }) => (
  <svg {...base(size)} aria-hidden="true">
    <path
      d="M2.5 4.5A2 2 0 0 1 4.5 2.5h9a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H7l-4.5 3.5v-10.5Z"
      stroke={color}
      strokeWidth="1.5"
    />
  </svg>
);

export const IconAmenity = ({ size = 18, color = "#5B6779" }) => (
  <svg {...base(size)} aria-hidden="true">
    <rect x="2.5" y="3.5" width="13" height="12" rx="2" stroke={color} strokeWidth="1.5" />
    <line x1="2.5" y1="7" x2="15.5" y2="7" stroke={color} strokeWidth="1.5" />
    <rect x="5" y="9.5" width="3" height="3" rx="0.5" fill={color} />
  </svg>
);

export const IconNotices = ({ size = 18, color = "#5B6779" }) => (
  <svg {...base(size)} aria-hidden="true">
    <rect x="2.5" y="3" width="13" height="12" rx="2" stroke={color} strokeWidth="1.5" />
    <line x1="5.5" y1="6.5" x2="12.5" y2="6.5" stroke={color} strokeWidth="1.3" />
    <line x1="5.5" y1="9.5" x2="12.5" y2="9.5" stroke={color} strokeWidth="1.3" />
    <line x1="5.5" y1="12" x2="9.5" y2="12" stroke={color} strokeWidth="1.3" />
  </svg>
);

export const IconResidents = ({ size = 18, color = "#5B6779" }) => (
  <svg {...base(size)} aria-hidden="true">
    <circle cx="7" cy="6.5" r="2.5" stroke={color} strokeWidth="1.5" />
    <path d="M2.5 15c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke={color} strokeWidth="1.5" />
    <circle cx="13" cy="6.5" r="1.8" stroke={color} strokeWidth="1.3" />
  </svg>
);

export const IconBillingEngine = ({ size = 18, color = "#5B6779" }) => (
  <svg {...base(size)} aria-hidden="true">
    <rect x="2.5" y="4.5" width="13" height="9" rx="2" stroke={color} strokeWidth="1.5" />
    <line x1="2.5" y1="8" x2="15.5" y2="8" stroke={color} strokeWidth="1.5" />
    <rect x="11" y="10" width="3" height="2" rx="0.5" fill={color} />
  </svg>
);

export const IconRouting = ({ size = 18, color = "#5B6779" }) => (
  <svg {...base(size)} aria-hidden="true">
    <circle cx="4.5" cy="9" r="2" stroke={color} strokeWidth="1.5" />
    <circle cx="13.5" cy="4.5" r="2" stroke={color} strokeWidth="1.5" />
    <circle cx="13.5" cy="13.5" r="2" stroke={color} strokeWidth="1.5" />
    <path d="M6.5 8l5-3M6.5 10l5 3" stroke={color} strokeWidth="1.3" />
  </svg>
);

export const IconSecurity = ({ size = 18, color = "#5B6779" }) => (
  <svg {...base(size)} aria-hidden="true">
    <path d="M9 2.5l5 2v4.5c0 3-2.2 5.3-5 6.5-2.8-1.2-5-3.5-5-6.5V4.5l5-2Z" stroke={color} strokeWidth="1.5" />
  </svg>
);

export const IconGuardEntry = ({ size = 18, color = "#5B6779" }) => (
  <svg {...base(size)} aria-hidden="true">
    <circle cx="9" cy="6" r="2.8" stroke={color} strokeWidth="1.5" />
    <path d="M3.5 15.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke={color} strokeWidth="1.5" />
  </svg>
);

export const IconPassVerify = ({ size = 18, color = "#5B6779" }) => (
  <svg {...base(size)} aria-hidden="true">
    <rect x="2.5" y="2.5" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5" />
    <rect x="10.5" y="2.5" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5" />
    <rect x="2.5" y="10.5" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5" />
    <line x1="10.5" y1="13" x2="15.5" y2="13" stroke={color} strokeWidth="1.5" />
  </svg>
);

export const IconStaff = ({ size = 18, color = "#5B6779" }) => (
  <svg {...base(size)} aria-hidden="true">
    <rect x="3" y="3" width="12" height="12" rx="2" stroke={color} strokeWidth="1.5" />
    <circle cx="9" cy="7.3" r="2" stroke={color} strokeWidth="1.3" />
    <path d="M5.3 13c0-1.7 1.7-3 3.7-3s3.7 1.3 3.7 3" stroke={color} strokeWidth="1.3" />
  </svg>
);

export const IconSearch = ({ size = 16, color = "#8A94A3" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="4.5" stroke={color} strokeWidth="1.5" />
    <line x1="10.5" y1="10.5" x2="14" y2="14" stroke={color} strokeWidth="1.5" />
  </svg>
);

export const IconBell = ({ size = 18, color = "#5B6779" }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M4.5 7.5a4.5 4.5 0 0 1 9 0v3l1.5 2.5H3l1.5-2.5v-3Z" stroke={color} strokeWidth="1.4" />
    <circle cx="9" cy="15" r="1.4" fill={color} />
  </svg>
);

export const IconChevronDown = ({ size = 12, color = "#5B6779" }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M3 5l3 3 3-3" stroke={color} strokeWidth="1.5" />
  </svg>
);

export const IconMenu = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <line x1="0" y1="2" x2="16" y2="2" stroke="#2E3A4D" strokeWidth="2" strokeLinecap="round" />
    <line x1="0" y1="8" x2="16" y2="8" stroke="#2E3A4D" strokeWidth="2" strokeLinecap="round" />
    <line x1="0" y1="14" x2="16" y2="14" stroke="#2E3A4D" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconLock = ({ size = 20, color = "#1265C8" }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <rect x="3.5" y="8" width="11" height="7.5" rx="2" stroke={color} strokeWidth="1.5" />
    <path d="M5.5 8V5.5a3.5 3.5 0 0 1 7 0V8" stroke={color} strokeWidth="1.5" />
    <circle cx="9" cy="11.5" r="1.1" fill={color} />
  </svg>
);

export const IconAudit = ({ size = 20, color = "#1265C8" }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M4 2.5h10v13l-2-1.5-3 1.5-3-1.5L4 15.5v-13Z" stroke={color} strokeWidth="1.5" />
    <path d="M6.5 6.5h5M6.5 9h5M6.5 11.5h3" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export const IconMonitor = ({ size = 20, color = "#1265C8" }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="9" cy="9" r="6.5" stroke={color} strokeWidth="1.5" />
    <path d="M9 5.5V9l2.5 1.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconCheckShield = ({ size = 20, color = "#1265C8" }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M9 2.5l5.5 2v4.5c0 3.2-2.3 5.6-5.5 6.9-3.2-1.3-5.5-3.7-5.5-6.9V4.5l5.5-2Z" stroke={color} strokeWidth="1.5" />
    <path d="M6.3 9.1l1.9 1.9 3.5-3.9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconArrowRight = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M3 9h12M10.5 4.5L15 9l-4.5 4.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconPlay = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M4 2.5l8 4.5-8 4.5v-9Z" fill={color} />
  </svg>
);
