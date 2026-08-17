export const CURRENT_BILL = {
  period: "August 2026",
  amount: 4250,
  status: "overdue", // paid | pending | overdue
  dueDate: "2026-08-10",
  overdueDays: 6,
  breakdown: [
    { label: "Maintenance & security", amount: 3400 },
    { label: "Water & repairs", amount: 700 },
    { label: "Late penalty (6 days)", amount: 150, isPenalty: true },
  ],
  lastPaid: { amount: 4100, date: "2026-07-08" },
};

export const BILL_HISTORY = [
  { id: "BILL-24081", period: "Aug 2026", amount: 4250, status: "overdue" },
  { id: "BILL-24072", period: "Jul 2026", amount: 4100, status: "paid" },
  { id: "BILL-24063", period: "Jun 2026", amount: 4100, status: "paid" },
  { id: "BILL-24054", period: "May 2026", amount: 4100, status: "paid" },
  { id: "BILL-24045", period: "Apr 2026", amount: 3950, status: "paid" },
];

export const VISITOR_PASSES = [
  {
    id: "8842",
    name: "Ramesh Kumar",
    type: "guest",
    window: "Today 16:00–20:00",
    status: "valid",
  },
  {
    id: "9107",
    name: "Urban Company",
    type: "service",
    window: "Tomorrow 11:00–13:00",
    status: "upcoming",
  },
  {
    id: "9210",
    name: "Cab MH-02 KJ 8841",
    type: "pickup",
    window: "Sat 07:30–08:00",
    status: "upcoming",
  },
];

export const PAST_PASSES = [
  { id: "8710", name: "Swiggy Delivery", type: "delivery", window: "Aug 10, 20:15–20:30", status: "used" },
  { id: "8654", name: "Ramesh Kumar", type: "guest", window: "Aug 6, 18:00–22:00", status: "expired" },
  { id: "8590", name: "Cab MH-02 KJ 8841", type: "pickup", window: "Aug 3, 09:00–09:30", status: "cancelled" },
];

export const COMPLAINTS = [
  {
    id: "TCK-4468",
    title: "Kitchen leak under sink",
    category: "Plumbing",
    status: "in-progress",
    priority: "High",
    createdAt: "2026-08-12",
    sla: "6h left",
    description: "Water has been slowly pooling under the kitchen sink since yesterday evening. Cabinet base is swelling.",
    photos: 2,
    updates: [
      { at: "Aug 13, 09:10", by: "Maintenance", text: "Plumber assigned, visiting today between 2–4 PM." },
      { at: "Aug 12, 18:40", by: "Admin", text: "Ticket received and routed to plumbing team." },
    ],
  },
  {
    id: "TCK-4472",
    title: "Balcony light flickering",
    category: "Electrical",
    status: "pending",
    priority: "Low",
    createdAt: "2026-08-14",
    sla: "Raised today",
    description: "The balcony tube light flickers on and off intermittently, worse in the evening.",
    photos: 1,
    updates: [],
  },
  {
    id: "TCK-4390",
    title: "Elevator B making noise",
    category: "Elevator fault",
    status: "resolved",
    priority: "Medium",
    createdAt: "2026-08-02",
    sla: "Closed Aug 4",
    description: "Grinding noise when elevator B passes floor 8.",
    photos: 0,
    updates: [
      { at: "Aug 4, 11:00", by: "Maintenance", text: "Motor belt replaced, tested for 2 days — resolved." },
    ],
  },
];

export const AMENITIES = [
  { id: "clubhouse", name: "Clubhouse", capacity: "Max 60 guests", hours: "9 AM – 10 PM" },
  { id: "pool", name: "Swimming Pool", capacity: "Max 20", hours: "6 AM – 8 PM" },
  { id: "tennis", name: "Tennis Court", capacity: "Max 4", hours: "6 AM – 9 PM" },
  { id: "party-hall", name: "Party Hall", capacity: "Max 100 guests", hours: "10 AM – 11 PM" },
];

export const MY_BOOKINGS = [
  {
    id: "AM-2291",
    amenity: "Clubhouse",
    date: "Aug 20, 2026",
    window: "6:00–8:00 PM",
    guests: 40,
    status: "confirmed",
  },
  { id: "AM-2304", amenity: "Tennis Court", date: "Aug 24, 2026", window: "7:00–8:00 AM", guests: 2, status: "awaiting" },
];

export const NOTICES = [
  {
    id: "n1",
    title: "Water shutdown, Tower B — Aug 16, 10 AM–4 PM",
    category: "Maintenance",
    postedAt: "2 days ago",
    urgent: true,
    body: "Scheduled maintenance on the main water line will cause a shutdown for Tower B residents. Please store water in advance.",
  },
  {
    id: "n2",
    title: "Independence Day flag hoisting, 8 AM",
    category: "Events",
    postedAt: "3 days ago",
    urgent: false,
    body: "All residents are invited to the flag hoisting ceremony at the central lawn, followed by breakfast.",
  },
  {
    id: "n3",
    title: "Revised visitor parking rules",
    category: "Guidelines",
    postedAt: "6 days ago",
    urgent: false,
    body: "Visitor parking is now limited to 4 hours in the front lot. Overstaying vehicles may be reported to security.",
  },
];

export const POLLS = [
  {
    id: "p1",
    question: "Poll: new gym equipment budget",
    status: "open",
    closesIn: "Closes in 2 days",
    votes: 184,
    total: 412,
    options: [
      { label: "Approve Rs 3.2L budget", pct: 61 },
      { label: "Reduce to Rs 2L budget", pct: 27 },
      { label: "Reject for now", pct: 12 },
    ],
  },
  {
    id: "p2",
    question: "Preferred date for annual society day",
    status: "closed",
    closesIn: "Closed Aug 5",
    votes: 398,
    total: 412,
    options: [
      { label: "Oct 4 (Saturday)", pct: 54 },
      { label: "Oct 11 (Saturday)", pct: 46 },
    ],
  },
];

export const EVENTS = [
  {
    id: "e1",
    title: "Independence Day flag hoisting",
    date: "Aug 15, 2026",
    time: "8:00 AM",
    location: "Central lawn",
    description: "Flag hoisting ceremony followed by breakfast for all residents.",
  },
  {
    id: "e2",
    title: "Society Day celebrations",
    date: "Oct 4, 2026",
    time: "6:00 PM",
    location: "Clubhouse",
    description: "Annual society day with cultural performances and dinner.",
  },
  {
    id: "e3",
    title: "Weekend yoga session",
    date: "Aug 22, 2026",
    time: "7:00 AM",
    location: "Party Hall lawn",
    description: "Free guided yoga session open to all residents, mats provided.",
  },
];

export const GUIDELINES = [
  { title: "Parking Rules", body: "Visitor parking capped at 4 hours. Residents must display parking stickers." },
  { title: "Pet Policy", body: "Pets must be leashed in common areas. Waste must be cleaned up immediately." },
  { title: "Noise Timings", body: "Quiet hours are 10 PM – 7 AM. Renovation work only permitted 9 AM – 6 PM on weekdays." },
];
