import { Link } from "react-router-dom";

const SECTIONS = [
  {
    title: "Public",
    links: [
      { label: "Home", path: "/" },
      { label: "Sitemap", path: "/sitemap" },
      { label: "Log In", path: "/login" },
      { label: "Register", path: "/register" },
    ],
  },
  {
    title: "Resident",
    links: [
      { label: "Dashboard", path: "/resident" },
      { label: "Visitor Pass", path: "/resident/visitor-pass" },
      { label: "Maintenance Bills", path: "/resident/bills" },
      { label: "Complaints", path: "/resident/complaints" },
      { label: "Amenity Booking", path: "/resident/amenities" },
      { label: "Notices", path: "/resident/notices" },
    ],
  },
  {
    title: "Society Admin",
    links: [
      { label: "Dashboard", path: "/admin" },
      { label: "Resident Management", path: "/admin/residents" },
      { label: "Billing Engine", path: "/admin/billing" },
      { label: "Complaint Routing", path: "/admin/complaints" },
      { label: "Security Logs", path: "/admin/security-logs" },
    ],
  },
  {
    title: "Security Guard",
    links: [
      { label: "Dashboard", path: "/guard" },
      { label: "Visitor Entry", path: "/guard/visitor-entry" },
      { label: "Pass Verification", path: "/guard/verify-pass" },
    ],
  },
];

export default function Sitemap() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 md:px-12 py-12">
      <div className="max-w-[960px] mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Link to="/" className="text-sm font-semibold">← Back to Home</Link>
          <h1 className="font-heading font-extrabold text-h1 m-0">Sitemap</h1>
          <p className="text-body-lg text-slate-500 m-0">
            Every page in SmartSociety, grouped by role. Resident, Admin and Guard pages require signing in with
            the matching role.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {SECTIONS.map((section) => (
            <div key={section.title} className="bg-white border border-slate-200 rounded-card p-5 flex flex-col gap-3">
              <h2 className="font-heading font-semibold text-h3 m-0 text-brand-600">{section.title}</h2>
              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                {section.links.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-body font-semibold">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
