import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Card, Badge, Button } from "../ui/index.js";
import api from "../../services/api.js";
import { mapExpectedPass, mapInsideVisitor } from "../../utils/mappers.js";

export default function GuardDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expected, setExpected] = useState([]);
  const [inside, setInside] = useState([]);
  const [entriesToday, setEntriesToday] = useState(0);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [visitorsRes, activeRes] = await Promise.all([
        api.get("/security/visitors"),
        api.get("/security/active-visitors"),
      ]);
      const allVisitors = visitorsRes.data.data;
      setExpected(
        allVisitors
          .filter((v) => v.status === "Pre-Approved")
          .map(mapExpectedPass)
      );
      setInside(activeRes.data.data.map(mapInsideVisitor));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setEntriesToday(
        allVisitors.filter((v) => v.entry_timestamp && new Date(v.entry_timestamp) >= today).length
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load gate dashboard.");
    } finally {
      setLoading(false);
    }
  }

  const overstays = inside.filter((v) => v.overstay);

  async function markExit(id) {
    try {
      await api.patch(`/security/visitor/${id}/exit`);
      setInside((list) => list.filter((v) => v.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark exit.");
    }
  }

  const timeStr = now.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const dateStr = now
    .toLocaleDateString("en-PK", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();

  if (loading) {
    return <div className="text-body text-slate-500 py-12 text-center">Loading gate dashboard…</div>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1280px]">
      {/* Page header + live clock */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">Gate Dashboard</h1>
          <span className="text-body text-slate-500">
            {user?.gate ?? "Main Gate"} · {user?.name ?? "Guard"} on duty · {entriesToday} entries this shift
          </span>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white border border-slate-200 self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-success-fg animate-pulse" />
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xl text-slate-800 leading-none">{timeStr}</span>
            <span className="font-mono text-[10px] text-slate-400 leading-none">{dateStr}</span>
          </div>
        </div>
      </div>

      {error && <span className="text-body font-semibold text-danger-fg">{error}</span>}

      {/* Overstay alert banner */}
      {overstays.length > 0 && (
        <div className="rounded-panel bg-[#8E2119] border-2 border-danger-fg p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <span className="w-12 h-12 rounded-xl bg-danger-fg flex items-center justify-center flex-shrink-0">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 4l8.5 15H3.5L12 4Z" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
                <path d="M12 9.5v4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16.2" r="1.1" fill="#FFFFFF" />
              </svg>
            </span>
            <div className="min-w-0 flex flex-col gap-1">
              <span className="font-heading font-extrabold text-lg text-white">
                {overstays.length} visitor{overstays.length > 1 ? "s" : ""} overstaying
              </span>
              <span className="text-body text-[#FFE3E0]">
                {overstays.map((v) => `${v.name} (${v.type}, ${v.flat}) is ${v.overstayBy}`).join(" · ")}
              </span>
            </div>
          </div>
          <a
            href="#currently-inside"
            className="flex-shrink-0 h-[52px] px-6 rounded-lg bg-white text-[#8E2119] font-extrabold text-body-lg flex items-center justify-center hover:bg-[#FFE3E0]"
          >
            Review
          </a>
        </div>
      )}

      {/* Two oversized primary action tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/guard/visitor-entry"
          className="flex flex-col justify-between gap-5 rounded-panel bg-brand-500 hover:bg-brand-600 text-white p-5 md:p-6 min-h-[150px] md:min-h-[128px] shadow-md transition-colors"
        >
          <span className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="10" cy="8" r="3.6" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M3.5 20c0-3.6 3-5.8 6.5-5.8 1.4 0 2.7.35 3.8.98" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              <path d="M17.5 14v6M14.5 17h6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="flex flex-col gap-1">
            <span className="font-heading font-extrabold text-xl md:text-2xl tracking-tight">Log Walk-in Visitor</span>
            <span className="text-body text-white/85">No pass · capture photo, call the flat</span>
          </span>
        </Link>
        <Link
          to="/guard/verify-pass"
          className="flex flex-col justify-between gap-5 rounded-panel bg-teal-600 hover:bg-teal-700 text-white p-5 md:p-6 min-h-[150px] md:min-h-[128px] shadow-md transition-colors"
        >
          <span className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3.5 8V5.5A2 2 0 0 1 5.5 3.5H8M16 3.5h2.5a2 2 0 0 1 2 2V8M20.5 16v2.5a2 2 0 0 1-2 2H16M8 20.5H5.5a2 2 0 0 1-2-2V16"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path d="M3.5 12h17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="flex flex-col gap-1">
            <span className="font-heading font-extrabold text-xl md:text-2xl tracking-tight">Verify Pass / Scan QR</span>
            <span className="text-body text-white/85">Scanner ready · or type the code</span>
          </span>
        </Link>
      </div>

      {/* Shift stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Entries this shift" value={entriesToday} />
        <StatTile label="Currently inside" value={inside.length} valueClass="text-brand-600" />
        <StatTile label="Overstaying" value={overstays.length} danger={overstays.length > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Expected today */}
        <Card padded={false} className="flex flex-col">
          <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3.5 border-b border-slate-200">
            <h3 className="font-heading font-semibold text-h3 m-0">Expected passes</h3>
            <span className="font-mono text-[11px] text-slate-600 bg-slate-100 rounded-full px-2.5 py-1.5">
              {expected.length} PASSES
            </span>
          </div>
          <div className="flex flex-col">
            {expected.map((v) => (
              <div
                key={v._id}
                className="flex items-center gap-3 md:gap-3.5 px-4 md:px-5 py-3 border-b border-slate-100 last:border-0"
              >
                <TypeAvatar type={v.type} />
                <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                  <span className="font-semibold text-body-lg truncate">{v.name}</span>
                  <span className="text-body text-slate-600 truncate">
                    {v.flat} · {v.window} · <span className="font-mono">{v.id}</span>
                  </span>
                </div>
                <Link to="/guard/verify-pass" className="flex-shrink-0">
                  <Button variant="guard" size="lg">
                    Verify
                  </Button>
                </Link>
              </div>
            ))}
            {expected.length === 0 && (
              <div className="px-4 md:px-5 py-6 text-center text-body text-slate-400">No pre-approved passes right now.</div>
            )}
          </div>
        </Card>

        {/* Currently inside */}
        <Card padded={false} className="flex flex-col" id="currently-inside">
          <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3.5 border-b border-slate-200">
            <span className="inline-flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-success-fg animate-pulse" />
              <h3 className="font-heading font-semibold text-h3 m-0">Currently inside</h3>
            </span>
            <span className="font-mono text-[11px] text-slate-600 bg-slate-100 rounded-full px-2.5 py-1.5">
              {inside.length} PEOPLE
            </span>
          </div>
          <div className="flex flex-col">
            {inside.map((v) => (
              <div
                key={v.id}
                className={`flex items-center gap-3 md:gap-3.5 px-4 md:px-5 py-3 border-b last:border-0 ${
                  v.overstay ? "bg-danger-bg border-l-4 border-l-danger-fg border-b-danger-bg" : "border-slate-100"
                }`}
              >
                <TypeAvatar type={v.type} danger={v.overstay} />
                <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                  <span className="font-semibold text-body-lg truncate">{v.name}</span>
                  <span className={`text-body truncate ${v.overstay ? "text-danger-fg font-semibold" : "text-slate-600"}`}>
                    {capitalize(v.type)} · {v.flat} · in at {v.checkedInAt}
                    {v.overstay ? ` · ${v.overstayBy}` : ""}
                  </span>
                </div>
                <Badge tone={v.overstay ? "danger" : "info"} className="hidden sm:inline-flex flex-shrink-0">
                  {v.elapsed}
                </Badge>
                <Button
                  variant={v.overstay ? "danger" : "secondary"}
                  size="lg"
                  onClick={() => markExit(v.id)}
                  className="flex-shrink-0"
                >
                  Mark Exit
                </Button>
              </div>
            ))}
            {inside.length === 0 && (
              <div className="px-4 md:px-5 py-6 text-center text-body text-slate-400">No one currently inside.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatTile({ label, value, valueClass = "text-slate-800", danger }) {
  return (
    <div
      className={`bg-white rounded-lg p-3.5 flex flex-col gap-1 border ${
        danger ? "border-2 border-danger-fg" : "border-slate-300"
      }`}
    >
      <span className={`text-label uppercase ${danger ? "text-danger-fg" : "text-slate-600"}`}>{label}</span>
      <span className={`font-heading font-extrabold text-2xl leading-none ${danger ? "text-danger-fg" : valueClass}`}>
        {value}
      </span>
    </div>
  );
}

const TYPE_STYLES = {
  guest: { initials: "GU", className: "bg-teal-100 text-teal-700" },
  delivery: { initials: "DL", className: "bg-brand-100 text-brand-600" },
  cab: { initials: "CB", className: "bg-slate-100 text-slate-600" },
  vendor: { initials: "VN", className: "bg-slate-100 text-slate-600" },
};

function TypeAvatar({ type, danger }) {
  const style = TYPE_STYLES[type] ?? { initials: "VS", className: "bg-slate-100 text-slate-600" };
  return (
    <div
      className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 font-heading font-bold text-xs ${
        danger ? "bg-danger-bg text-danger-fg" : style.className
      }`}
    >
      {style.initials}
    </div>
  );
}

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
