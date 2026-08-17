// Mock data for the Guard (gate terminal) screens: dashboard, visitor entry, pass verification.
// Shapes echo residentMockData.js's VISITOR_PASSES pattern so the same status.js tones apply.

export const SHIFT_STATS = {
  entriesThisShift: 96,
  currentlyInside: 23,
};

// Today's expected visitors, drawn from pre-approved resident passes.
export const EXPECTED_VISITORS = [
  {
    id: "GP-8851",
    name: "Blinkit · Sunil M.",
    type: "delivery",
    flat: "B-204",
    resident: "Aarav Mehta",
    window: "15:00 – 16:00",
    eta: "In 18m",
    status: "upcoming",
  },
  {
    id: "GP-8848",
    name: "Priya & Anand Iyer",
    type: "guest",
    flat: "D-0704",
    resident: "Priya Iyer",
    window: "18:00 – 22:00",
    eta: "Evening",
    status: "upcoming",
  },
  {
    id: "GP-8846",
    name: "Ola · MH-02 FT 1180",
    type: "cab",
    flat: "A-0703",
    resident: "Karan Shah",
    window: "16:30 – 17:00",
    eta: "In 1h 48m",
    status: "upcoming",
  },
  {
    id: "GP-8844",
    name: "Sparkle Deep Clean · 2 staff",
    type: "vendor",
    flat: "C-0905",
    resident: "Neha Verma",
    window: "17:00 – 20:00",
    eta: "In 2h 18m",
    status: "upcoming",
  },
];

// Visitors currently inside the society. `overstay: true` rows are highlighted danger-tone
// with a "Mark Exit" action; the guard dashboard shows a banner when any are overstaying.
export const CURRENTLY_INSIDE = [
  {
    id: "in-1",
    name: "Ajay Kulkarni",
    type: "vendor",
    flat: "C-1102",
    checkedInAt: "09:05",
    elapsed: "5h 37m",
    overstay: true,
    overstayBy: "3h 12m over",
  },
  {
    id: "in-2",
    name: "Sameer Joshi",
    type: "guest",
    flat: "B-1104",
    checkedInAt: "11:20",
    elapsed: "3h 22m",
    overstay: true,
    overstayBy: "48m over",
  },
  {
    id: "in-3",
    name: "Rahul V. · Zepto",
    type: "delivery",
    flat: "B-204",
    checkedInAt: "14:42",
    elapsed: "6m",
    overstay: false,
  },
  {
    id: "in-4",
    name: "Lata Devi",
    type: "staff",
    flat: "B-204",
    checkedInAt: "14:36",
    elapsed: "12m",
    overstay: false,
  },
];

// Flats the guard can look up while logging a walk-in visitor.
export const FLATS = [
  { flat: "B-204", resident: "Aarav Mehta", role: "Owner", phone: "98204 41207" },
  { flat: "D-0704", resident: "Priya Iyer", role: "Owner", phone: "98211 33021" },
  { flat: "A-0703", resident: "Karan Shah", role: "Tenant", phone: "99001 22110" },
  { flat: "C-0905", resident: "Neha Verma", role: "Owner", phone: "98450 11290" },
  { flat: "B-1104", resident: "Rohit Deshpande", role: "Owner", phone: "98195 20034" },
  { flat: "C-1102", resident: "Sunita Kulkarni", role: "Owner", phone: "98230 44521" },
  { flat: "D-0201", resident: "Meera Rao", role: "Tenant", phone: "97620 88123" },
];

export const PURPOSE_CHIPS = ["Personal visit", "Delivery", "Service / repair"];

// Gate pass codes the Pass Verification screen "looks up" when the guard types a code
// (or the simulated QR scan resolves). Keyed by the 4-digit code the guard enters.
export const PASS_CODES = {
  8842: {
    code: "GP-8842",
    status: "valid",
    name: "Ramesh Kumar",
    type: "guest",
    flat: "B-204",
    resident: "Aarav Mehta",
    residentRole: "Owner",
    residentPhone: "98204 41207",
    window: "Today 16:00 – 20:00",
    vehicle: null,
  },
  1111: {
    code: "GP-1111",
    status: "expired",
    name: "Sameer Joshi",
    type: "guest",
    flat: "B-1104",
    resident: "Rohit Deshpande",
    residentRole: "Owner",
    residentPhone: "98195 20034",
    window: "11 Aug, 18:00 – 21:00",
    vehicle: null,
  },
  2222: {
    code: "GP-2222",
    status: "used",
    name: "Kiran T. · Amazon",
    type: "delivery",
    flat: "B-1104",
    resident: "Rohit Deshpande",
    residentRole: "Owner",
    residentPhone: "98195 20034",
    window: "Today 12:00 – 13:00",
    vehicle: null,
    usedAt: "12:04 today · scanned by R. Yadav, Gate 2",
  },
  8851: {
    code: "GP-8851",
    status: "valid",
    name: "Sunil Mane",
    type: "delivery",
    flat: "B-204",
    resident: "Aarav Mehta",
    residentRole: "Owner",
    residentPhone: "98204 41207",
    window: "Today 15:00 – 16:00",
    vehicle: "MH-02 KL 9021",
  },
  0: { status: "not_found" },
};

// Recent verification lookups, newest first — seeds the "Recent Verifications" strip.
export const RECENT_VERIFICATIONS = [
  { id: "v1", name: "Rahul V. · Zepto", flat: "B-204", code: "GP-8842", status: "valid", time: "14:42" },
  { id: "v2", name: "Meera Rao", flat: "D-0201", code: "GP-8839", status: "valid", time: "14:39" },
  { id: "v3", name: "Unknown code · manual entry", flat: null, code: "GP-8106", status: "expired", time: "14:21" },
  { id: "v4", name: "Kiran T. · Amazon", flat: "B-1104", code: "GP-8824", status: "valid", time: "13:58" },
];
