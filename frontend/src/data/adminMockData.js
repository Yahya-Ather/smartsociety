// Mock data for the Society Admin screens (Dashboard, Resident Management, Billing Engine,
// Complaint Routing, Security Logs). Everything below is internally consistent: complaint
// tickets, bills and gate logs reference flats that exist in RESIDENTS.

export const SOCIETY = {
  name: "Green Valley Residents' Welfare Association",
  shortName: "Green Valley",
  totalFlats: 412,
  gates: 3,
  towers: ["Tower A", "Tower B", "Tower C", "Tower D"],
};

// ---------------------------------------------------------------------------
// Residents
// ---------------------------------------------------------------------------
export const RESIDENTS = [
  {
    id: "R-001",
    name: "Aarav Mehta",
    email: "aarav.mehta@gmail.com",
    phone: "98204 41207",
    block: "Tower B",
    flat: "B-204",
    occupancyType: "owner",
    status: "active",
    moveInDate: "12 Mar 2021",
    vehicles: ["MH-02 KJ 8841", "MH-02 BC 1190"],
    emergencyContact: "Sneha Mehta · 98204 41208",
    householdCount: 3,
    duesOutstanding: 4250,
    duesOverdueDays: 6,
    complaintsOpen: 1,
    complaintsResolvedYtd: 9,
  },
  {
    id: "R-002",
    name: "Neha Bhatt",
    email: "neha.bhatt@outlook.com",
    phone: "99872 30114",
    block: "Tower A",
    flat: "A-0703",
    occupancyType: "tenant",
    status: "active",
    moveInDate: "01 Feb 2025",
    vehicles: [],
    emergencyContact: "Rakesh Bhatt · 99872 30115",
    householdCount: 2,
    duesOutstanding: 8400,
    duesOverdueDays: 34,
    complaintsOpen: 1,
    complaintsResolvedYtd: 3,
  },
  {
    id: "R-003",
    name: "Imran Sheikh",
    email: "imran.sheikh@gmail.com",
    phone: "98330 77219",
    block: "Tower C",
    flat: "C-1102",
    occupancyType: "owner",
    status: "active",
    moveInDate: "18 Aug 2019",
    vehicles: ["MH-12 GG 4471"],
    emergencyContact: "Farida Sheikh · 98330 77220",
    householdCount: 4,
    duesOutstanding: 0,
    duesOverdueDays: 0,
    complaintsOpen: 0,
    complaintsResolvedYtd: 6,
  },
  {
    id: "R-004",
    name: "Kavya Rao",
    email: "kavya.rao@gmail.com",
    phone: "70210 88431",
    block: "Tower D",
    flat: "D-0201",
    occupancyType: "tenant",
    status: "kyc-pending",
    moveInDate: "05 Jun 2026",
    vehicles: [],
    emergencyContact: "Meera Rao · 98211 30078",
    householdCount: 1,
    duesOutstanding: 4100,
    duesOverdueDays: 0,
    complaintsOpen: 1,
    complaintsResolvedYtd: 0,
  },
  {
    id: "R-005",
    name: "Priya Nair",
    email: "priya.nair@gmail.com",
    phone: "—",
    block: "Tower A",
    flat: "A-0902",
    occupancyType: "tenant",
    status: "offboarded",
    moveInDate: "14 Jan 2023",
    vehicles: [],
    emergencyContact: "—",
    householdCount: 0,
    duesOutstanding: 0,
    duesOverdueDays: 0,
    complaintsOpen: 0,
    complaintsResolvedYtd: 2,
  },
  {
    id: "R-006",
    name: "Rohit Deshpande",
    email: "rohit.d@gmail.com",
    phone: "98195 20034",
    block: "Tower B",
    flat: "B-1104",
    occupancyType: "owner",
    status: "active",
    moveInDate: "22 Nov 2022",
    vehicles: ["MH-02 DQ 7741"],
    emergencyContact: "Anjali Deshpande · 98195 20035",
    householdCount: 3,
    duesOutstanding: 0,
    duesOverdueDays: 0,
    complaintsOpen: 0,
    complaintsResolvedYtd: 4,
  },
  {
    id: "R-007",
    name: "Sameer Joshi",
    email: "sameer.joshi@gmail.com",
    phone: "90210 44112",
    block: "Tower B",
    flat: "B-1104",
    occupancyType: "tenant",
    status: "active",
    moveInDate: "10 Feb 2024",
    vehicles: [],
    emergencyContact: "Ritu Joshi · 90210 44113",
    householdCount: 2,
    duesOutstanding: 0,
    duesOverdueDays: 0,
    complaintsOpen: 0,
    complaintsResolvedYtd: 1,
  },
  {
    id: "R-008",
    name: "Ananya Kulkarni",
    email: "ananya.k@gmail.com",
    phone: "98921 33210",
    block: "Tower C",
    flat: "C-0410",
    occupancyType: "owner",
    status: "active",
    moveInDate: "03 May 2020",
    vehicles: ["MH-02 BJ 4417"],
    emergencyContact: "Ajay Kulkarni · 98921 33211",
    householdCount: 4,
    duesOutstanding: 0,
    duesOverdueDays: 0,
    complaintsOpen: 0,
    complaintsResolvedYtd: 5,
  },
  {
    id: "R-009",
    name: "Vikram Singh",
    email: "vikram.singh@gmail.com",
    phone: "99001 22887",
    block: "Tower D",
    flat: "D-0805",
    occupancyType: "owner",
    status: "active",
    moveInDate: "27 Jul 2018",
    vehicles: ["MH-02 XY 5521"],
    emergencyContact: "Pooja Singh · 99001 22888",
    householdCount: 3,
    duesOutstanding: 0,
    duesOverdueDays: 0,
    complaintsOpen: 0,
    complaintsResolvedYtd: 8,
  },
  {
    id: "R-010",
    name: "Meera Iyer",
    email: "meera.iyer@outlook.com",
    phone: "98450 11238",
    block: "Tower A",
    flat: "A-0410",
    occupancyType: "tenant",
    status: "active",
    moveInDate: "19 Sep 2023",
    vehicles: [],
    emergencyContact: "Suresh Iyer · 98450 11239",
    householdCount: 1,
    duesOutstanding: 2850,
    duesOverdueDays: 2,
    complaintsOpen: 0,
    complaintsResolvedYtd: 2,
  },
  {
    id: "R-011",
    name: "Farhan Ansari",
    email: "farhan.ansari@gmail.com",
    phone: "97024 88651",
    block: "Tower C",
    flat: "C-0705",
    occupancyType: "owner",
    status: "active",
    moveInDate: "08 Dec 2021",
    vehicles: ["MH-02 KL 9021"],
    emergencyContact: "Zoya Ansari · 97024 88652",
    householdCount: 2,
    duesOutstanding: 0,
    duesOverdueDays: 0,
    complaintsOpen: 0,
    complaintsResolvedYtd: 3,
  },
  {
    id: "R-012",
    name: "Divya Menon",
    email: "divya.menon@gmail.com",
    phone: "96543 22190",
    block: "Tower D",
    flat: "D-1108",
    occupancyType: "tenant",
    status: "active",
    moveInDate: "02 Apr 2025",
    vehicles: [],
    emergencyContact: "Ramesh Menon · 96543 22191",
    householdCount: 1,
    duesOutstanding: 0,
    duesOverdueDays: 0,
    complaintsOpen: 0,
    complaintsResolvedYtd: 0,
  },
];

// ---------------------------------------------------------------------------
// Maintenance bills (extends the shape from residentMockData's BILL_HISTORY)
// ---------------------------------------------------------------------------
export const ADMIN_BILLS = [
  { id: "BILL-24081-A0703", flat: "A-0703", resident: "Neha Bhatt", period: "Aug 2026", amount: 8400, dueDate: "8 Jul 2026", penalty: 420, status: "overdue", overdueDays: 34 },
  { id: "BILL-24081-B0204", flat: "B-204", resident: "Aarav Mehta", period: "Aug 2026", amount: 4250, dueDate: "8 Aug 2026", penalty: 150, status: "overdue", overdueDays: 6 },
  { id: "BILL-24081-C1102", flat: "C-1102", resident: "Imran Sheikh", period: "Aug 2026", amount: 4100, dueDate: "8 Aug 2026", penalty: 0, status: "pending", overdueDays: 0 },
  { id: "BILL-24081-D0201", flat: "D-0201", resident: "Kavya Rao", period: "Aug 2026", amount: 4100, dueDate: "8 Aug 2026", penalty: 0, status: "paid", overdueDays: 0 },
  { id: "BILL-24081-B1104", flat: "B-1104", resident: "Rohit Deshpande", period: "Aug 2026", amount: 4380, dueDate: "8 Aug 2026", penalty: 0, status: "paid", overdueDays: 0 },
  { id: "BILL-24081-A0902", flat: "A-0902", resident: "Vacant · owner billed", period: "Aug 2026", amount: 2850, dueDate: "8 Aug 2026", penalty: 0, status: "pending", overdueDays: 0 },
  { id: "BILL-24081-C0410", flat: "C-0410", resident: "Ananya Kulkarni", period: "Aug 2026", amount: 4100, dueDate: "8 Aug 2026", penalty: 0, status: "paid", overdueDays: 0 },
  { id: "BILL-24081-D0805", flat: "D-0805", resident: "Vikram Singh", period: "Aug 2026", amount: 4380, dueDate: "8 Aug 2026", penalty: 0, status: "paid", overdueDays: 0 },
  { id: "BILL-24081-A0410", flat: "A-0410", resident: "Meera Iyer", period: "Aug 2026", amount: 2850, dueDate: "8 Aug 2026", penalty: 40, status: "overdue", overdueDays: 2 },
  { id: "BILL-24081-C0705", flat: "C-0705", resident: "Farhan Ansari", period: "Aug 2026", amount: 4100, dueDate: "8 Aug 2026", penalty: 0, status: "paid", overdueDays: 0 },
  { id: "BILL-24081-D1108", flat: "D-1108", resident: "Divya Menon", period: "Aug 2026", amount: 4100, dueDate: "8 Aug 2026", penalty: 0, status: "pending", overdueDays: 0 },
  { id: "BILL-24081-B1104T", flat: "B-1104", resident: "Sameer Joshi", period: "Aug 2026", amount: 3950, dueDate: "8 Aug 2026", penalty: 0, status: "pending", overdueDays: 0 },
];

// 8-month collection trend (percent of collected/outstanding, in Lakhs) — used for the bar chart
export const COLLECTION_TREND = [
  { month: "Jan", collectedPct: 70, outstandingPct: 16 },
  { month: "Feb", collectedPct: 76, outstandingPct: 12 },
  { month: "Mar", collectedPct: 72, outstandingPct: 14 },
  { month: "Apr", collectedPct: 79, outstandingPct: 11 },
  { month: "May", collectedPct: 68, outstandingPct: 22 },
  { month: "Jun", collectedPct: 85, outstandingPct: 9 },
  { month: "Jul", collectedPct: 88, outstandingPct: 7 },
  { month: "Aug", collectedPct: 74, outstandingPct: 17, current: true },
];

export const BILLING_SUMMARY = {
  totalBilled: 1730000,
  invoiceCount: 412,
  avgPerFlat: 4199,
  totalCollected: 1420000,
  collectedPct: 82,
  flatsPaid: 384,
  totalOutstanding: 190000,
  penaltiesAccrued: 8400,
  overdueAccounts: 28,
  overdue30Days: 9,
  sixMonthAvgCollected: 1510000,
  recoveryRate: 94,
  penaltiesYtd: 41250,
  worstMonth: "May · 22% outstanding",
};

export const CHARGE_COMPONENTS = [
  { id: "water", label: "Water charges", helper: "Per flat, metered average", amount: 520, enabled: true },
  { id: "security", label: "Security", helper: "3 gates · 14 guards on roster", amount: 1150, enabled: true },
  { id: "repairs", label: "Repairs & maintenance", helper: "Sinking fund contribution included", amount: 1780, enabled: true },
  { id: "amenities", label: "Amenities", helper: "Clubhouse, pool, courts upkeep", amount: 650, enabled: true },
  { id: "festival", label: "Festival fund (one-off)", helper: "Excluded this cycle", amount: 300, enabled: false },
];

// ---------------------------------------------------------------------------
// Maintenance staff (assignment dropdowns)
// ---------------------------------------------------------------------------
export const STAFF = [
  { id: "S-1", name: "Suresh Patil", initials: "SP", specialty: "Plumbing", openTickets: 2, capacityPct: 25 },
  { id: "S-2", name: "Vinod Kamble", initials: "VK", specialty: "Electrical", openTickets: 5, capacityPct: 63 },
  { id: "S-3", name: "Anil Jadhav", initials: "AJ", specialty: "General · vendor", openTickets: 1, capacityPct: 13 },
  { id: "S-4", name: "Manoj Gupta", initials: "MG", specialty: "Carpentry", openTickets: 8, capacityPct: 100 },
  { id: "S-5", name: "OTIS", initials: "OT", specialty: "Elevator AMC", openTickets: 0, capacityPct: 0 },
  { id: "S-6", name: "Ramesh Naik", initials: "RN", specialty: "Pest Control", openTickets: 1, capacityPct: 20 },
];

// ---------------------------------------------------------------------------
// Complaint tickets (flat numbers exist in RESIDENTS)
// ---------------------------------------------------------------------------
export const COMPLAINT_TICKETS = [
  {
    id: "TCK-4474",
    title: "Lift C stuck between floors 8–9",
    category: "Elevator",
    priority: "urgent",
    status: "unassigned",
    resident: "Kavya Rao",
    flat: "C-1102",
    createdAt: "13 Aug, 20:10",
    slaText: "SLA breached · 14h over",
    slaBreached: true,
    assignedTo: null,
    description: "Lift C in Tower C stopped between the 8th and 9th floor with two passengers inside. Emergency alarm was used; passengers were freed by the fire team after 20 minutes but the lift is still out of service.",
    photos: 2,
    updates: [{ at: "13 Aug, 20:10", by: "Kavya Rao", text: "Ticket raised via app." }],
  },
  {
    id: "TCK-4472",
    title: "Balcony light flickering after 9 PM",
    category: "Electrical",
    priority: "medium",
    status: "unassigned",
    resident: "Aarav Mehta",
    flat: "B-204",
    createdAt: "14 Aug, 08:14",
    slaText: "SLA target in 22h · raised today 08:14",
    slaBreached: false,
    assignedTo: null,
    description: "The balcony tube light flickers on and off intermittently, worse in the evening after 9 PM.",
    photos: 1,
    updates: [{ at: "14 Aug, 08:14", by: "Aarav Mehta", text: "Ticket raised via app." }],
  },
  {
    id: "TCK-4471",
    title: "Corridor tap leaking, floor 4",
    category: "Plumbing",
    priority: "high",
    status: "unassigned",
    resident: "Common area",
    flat: "A-0400",
    createdAt: "14 Aug, 06:40",
    slaText: "SLA target in 18h",
    slaBreached: false,
    assignedTo: null,
    description: "Common corridor tap on floor 4, Tower A is leaking continuously and pooling water near the fire exit.",
    photos: 1,
    updates: [{ at: "14 Aug, 06:40", by: "Security guard", text: "Reported during morning rounds." }],
  },
  {
    id: "TCK-4470",
    title: "Pest control follow-up for kitchen",
    category: "Pest Control",
    priority: "low",
    status: "unassigned",
    resident: "Rohit Deshpande",
    flat: "B-1104",
    createdAt: "13 Aug, 16:02",
    slaText: "SLA target in 3d · vendor slot needed",
    slaBreached: false,
    assignedTo: null,
    description: "Follow-up treatment requested after the last pest control visit; cockroaches still seen near the kitchen sink.",
    photos: 0,
    updates: [],
  },
  {
    id: "TCK-4468",
    title: "Kitchen leak under the sink",
    category: "Plumbing",
    priority: "high",
    status: "in-progress",
    resident: "Aarav Mehta",
    flat: "B-204",
    createdAt: "12 Aug, 18:40",
    slaText: "SLA 6h left",
    slaBreached: false,
    assignedTo: "S-1",
    description: "Water has been slowly pooling under the kitchen sink since yesterday evening. Cabinet base is swelling.",
    photos: 2,
    updates: [
      { at: "13 Aug, 09:10", by: "Suresh P.", text: "Plumber assigned, visiting today between 2–4 PM." },
      { at: "12 Aug, 18:40", by: "Admin", text: "Ticket received and routed to plumbing team." },
    ],
  },
  {
    id: "TCK-4465",
    title: "Seepage on bedroom ceiling",
    category: "Structural",
    priority: "urgent",
    status: "in-progress",
    resident: "Neha Bhatt",
    flat: "A-0703",
    createdAt: "11 Aug, 19:40",
    slaText: "SLA breached · 5h over",
    slaBreached: true,
    assignedTo: "S-2",
    description: "Damp patch on the bedroom ceiling has spread since the rain on Sunday and paint is peeling near the corner. The flat above says their bathroom floor feels wet too.",
    photos: 3,
    updates: [
      { at: "12 Aug, 08:05", by: "Vinod K.", text: "Site inspected; waterproofing vendor quote requested." },
      { at: "11 Aug, 19:40", by: "Neha Bhatt", text: "Ticket raised via app." },
    ],
  },
  {
    id: "TCK-4463",
    title: "Basement ramp light out",
    category: "Electrical",
    priority: "medium",
    status: "in-progress",
    resident: "Common area",
    flat: "C-0000",
    createdAt: "12 Aug, 07:20",
    slaText: "SLA 1d 4h left",
    slaBreached: false,
    assignedTo: "S-2",
    description: "The basement ramp light near the Tower C entrance has been out for two nights, making the ramp hard to see.",
    photos: 1,
    updates: [{ at: "12 Aug, 09:00", by: "Vinod K.", text: "Bulb ordered, fitting scheduled." }],
  },
  {
    id: "TCK-4459",
    title: "Gym treadmill belt slipping",
    category: "Amenities",
    priority: "low",
    status: "in-progress",
    resident: "Ananya Kulkarni",
    flat: "C-0410",
    createdAt: "10 Aug, 11:15",
    slaText: "SLA target Aug 15",
    slaBreached: false,
    assignedTo: "S-4",
    description: "Treadmill #2 in the gym has a slipping belt that makes a grinding noise at higher speeds.",
    photos: 0,
    updates: [{ at: "10 Aug, 15:00", by: "Manoj G.", text: "Vendor visit booked for Aug 15." }],
  },
  {
    id: "TCK-4460",
    title: "Elevator B making noise",
    category: "Elevator",
    priority: "medium",
    status: "resolved",
    resident: "Imran Sheikh",
    flat: "C-1102",
    createdAt: "02 Aug, 09:30",
    slaText: "Closed Aug 4",
    slaBreached: false,
    assignedTo: "S-5",
    description: "Grinding noise when elevator B passes floor 8.",
    photos: 0,
    updates: [{ at: "4 Aug, 11:00", by: "OTIS", text: "Motor belt replaced, tested for 2 days — resolved." }],
  },
  {
    id: "TCK-4452",
    title: "Main gate boom barrier slow to respond",
    category: "General",
    priority: "low",
    status: "resolved",
    resident: "Common area",
    flat: "Gate 1",
    createdAt: "28 Jul, 07:00",
    slaText: "Closed Jul 30",
    slaBreached: false,
    assignedTo: "S-3",
    description: "Boom barrier at the main gate takes 8-10 seconds to lift after RFID scan, causing queueing at peak hours.",
    photos: 0,
    updates: [{ at: "30 Jul, 10:00", by: "Anil J.", text: "Sensor recalibrated — response time back to 2s." }],
  },
];

// ---------------------------------------------------------------------------
// Security / gate logs
// ---------------------------------------------------------------------------
export const SECURITY_LOGS = [
  { id: "GL-9101", visitor: "Ajay Kulkarni", type: "vendor", flat: "C-1102", vehicle: "MH-02 BJ 4417", entry: "09:05", exit: null, gate: "Gate 1", guard: "G. Thapa", durationMin: 337, overstay: true, overstayBy: "3h 12m past window" },
  { id: "GL-9098", visitor: "Sameer Joshi", type: "guest", flat: "B-1104", vehicle: null, entry: "11:20", exit: null, gate: "Gate 1", guard: "G. Thapa", durationMin: 202, overstay: true, overstayBy: "48m past window" },
  { id: "GL-9114", visitor: "Rahul V. · Zepto", type: "delivery", flat: "B-204", vehicle: "MH-02 KL 9021", entry: "14:42", exit: null, gate: "Gate 1", guard: "G. Thapa", durationMin: 6, overstay: false },
  { id: "GL-9113", visitor: "Meera Rao", type: "guest", flat: "D-0201", vehicle: null, entry: "14:39", exit: null, gate: "Gate 1", guard: "G. Thapa", durationMin: 9, overstay: false },
  { id: "GL-9112", visitor: "Lata Devi", type: "staff", flat: "B-204", vehicle: null, entry: "14:36", exit: null, gate: "Gate 2", guard: "R. Yadav", durationMin: 12, overstay: false },
  { id: "GL-9111", visitor: "Uber · Salman K.", type: "cab", flat: "A-0703", vehicle: "MH-02 DQ 7741", entry: "14:31", exit: null, gate: "Gate 3", guard: "P. Singh", durationMin: 17, overstay: false },
  { id: "GL-9105", visitor: "Painter crew ×3", type: "vendor", flat: "A-0703", vehicle: null, entry: "07:02", exit: null, gate: "Gate 1", guard: "G. Thapa", durationMin: 260, overstay: false },
  { id: "GL-9099", visitor: "Urban Company · service", type: "vendor", flat: "B-1104", vehicle: null, entry: "10:31", exit: null, gate: "Gate 2", guard: "R. Yadav", durationMin: 131, overstay: false },
  { id: "GL-9096", visitor: "Blinkit delivery", type: "delivery", flat: "D-0201", vehicle: "MH-02 XY 5521", entry: "10:52", exit: "11:04", gate: "Gate 3", guard: "P. Singh", durationMin: 12, overstay: false },
  { id: "GL-9092", visitor: "Priya Nair · guest", type: "guest", flat: "A-0902", vehicle: null, entry: "09:55", exit: "10:20", gate: "Gate 1", guard: "G. Thapa", durationMin: 25, overstay: false },
  { id: "GL-9088", visitor: "Swiggy delivery", type: "delivery", flat: "C-0410", vehicle: "MH-02 KJ 8841", entry: "09:30", exit: "09:41", gate: "Gate 2", guard: "R. Yadav", durationMin: 11, overstay: false },
  { id: "GL-9084", visitor: "Cab MH-02 KJ 8841", type: "cab", flat: "B-204", vehicle: "MH-02 KJ 8841", entry: "08:12", exit: "08:35", gate: "Gate 1", guard: "G. Thapa", durationMin: 23, overstay: false },
  { id: "GL-9080", visitor: "Ramesh Kumar · guest", type: "guest", flat: "B-204", vehicle: null, entry: "07:48", exit: "08:50", gate: "Gate 2", guard: "R. Yadav", durationMin: 62, overstay: false },
  { id: "GL-9075", visitor: "Amazon delivery", type: "delivery", flat: "D-0805", vehicle: "MH-02 BC 1190", entry: "07:15", exit: "07:22", gate: "Gate 3", guard: "P. Singh", durationMin: 7, overstay: false },
];

export const SECURITY_SUMMARY = {
  totalToday: 184,
  deliveries: 96,
  guests: 51,
  staff: 37,
  currentlyInside: 23,
  overstayAlerts: 2,
  longestOverstay: "3h 12m past window",
  gatesActive: 3,
  gatesTotal: 3,
  guardsOnShift: 4,
};

// Live gate activity strip on the Dashboard (most recent entries)
export const LIVE_GATE_ACTIVITY = SECURITY_LOGS.slice(2, 6);

// ---------------------------------------------------------------------------
// Occupancy map — a deterministic grid of flats per tower, with real residents
// overlaid onto their actual flat so map tiles stay clickable to a real profile.
// ---------------------------------------------------------------------------
function buildOccupancyMap() {
  const towers = { "Tower A": [], "Tower B": [], "Tower C": [], "Tower D": [] };
  const floors = 6;
  const unitsPerFloor = 4;

  for (const towerName of Object.keys(towers)) {
    const letter = towerName.split(" ")[1];
    for (let floor = floors; floor >= 1; floor--) {
      for (let unit = 1; unit <= unitsPerFloor; unit++) {
        const flatNum = `${floor}${String(unit).padStart(2, "0")}`;
        const flatId = `${letter}-${flatNum}`;
        const seed = (floor * 7 + unit * 13 + letter.charCodeAt(0)) % 10;
        const status = seed === 0 ? "vacant" : seed === 1 ? "attention" : seed % 2 === 0 ? "owner" : "tenant";
        towers[towerName].push({ flat: flatId, floor, status, residentId: null });
      }
    }
  }

  RESIDENTS.forEach((r) => {
    const list = towers[r.block];
    if (!list) return;
    const tile = list.find((t) => t.flat === r.flat);
    if (tile) {
      tile.status = r.status === "offboarded" ? "vacant" : r.status === "kyc-pending" ? "attention" : r.occupancyType;
      tile.residentId = r.id;
    }
  });

  return towers;
}

export const OCCUPANCY_MAP = buildOccupancyMap();
