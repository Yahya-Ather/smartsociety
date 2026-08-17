import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { IconSearch, IconBell, IconChevronDown, IconMenu } from "./icons.jsx";
import { buildSearchIndex, filterIndex } from "../../utils/search.js";
import api from "../../services/api.js";
import { formatINR } from "../../utils/status.js";
import ProfileModal from "./ProfileModal.jsx";
import VehiclesContactsModal from "./VehiclesContactsModal.jsx";
import logo from "../../assets/images/logo.png";

const ROLE_LABEL = { resident: "Resident", admin: "Society Admin", guard: "Security Guard" };

const SEARCH_PLACEHOLDER = {
  resident: "Search passes, bills, complaints…",
  admin: "Search flats, residents, bills…",
  guard: "Search visitors, pass codes…",
};

async function loadResidentAlerts() {
  const [billsRes, complaintsRes] = await Promise.all([
    api.get("/resident/bills"),
    api.get("/resident/complaints"),
  ]);
  const alerts = [];
  billsRes.data.data
    .filter((b) => b.payment_status === "Overdue")
    .forEach((b) =>
      alerts.push({
        id: `bill-${b._id}`,
        title: "Maintenance bill overdue",
        subtitle: `${b.billing_month} · ${formatINR(b.total_due)}`,
        tone: "danger",
        path: "/resident/bills",
      })
    );
  complaintsRes.data.data
    .filter((c) => c.resolution_notes && c.status !== "Resolved" && c.status !== "Closed")
    .forEach((c) =>
      alerts.push({
        id: `tkt-${c._id}`,
        title: `Update on your ${c.category} complaint`,
        subtitle: c.resolution_notes.slice(0, 60),
        tone: "info",
        path: "/resident/complaints",
      })
    );
  return alerts;
}

async function loadAdminAlerts() {
  const [residentsRes, bookingsRes, complaintsRes] = await Promise.all([
    api.get("/admin/residents"),
    api.get("/amenities/admin/all-bookings"),
    api.get("/admin/helpdesk"),
  ]);
  const alerts = [];
  residentsRes.data.data
    .filter((r) => !r.is_active)
    .forEach((r) =>
      alerts.push({
        id: `res-${r._id}`,
        title: `${r.name} awaiting verification`,
        subtitle: "New resident registration",
        tone: "warning",
        path: "/admin/residents",
      })
    );
  bookingsRes.data.data
    .filter((b) => b.booking_status === "Pending")
    .forEach((b) =>
      alerts.push({
        id: `book-${b._id}`,
        title: `${b.amenity_id?.name || "Amenity"} booking pending`,
        subtitle: `${b.number_of_guests} guests · needs approval`,
        tone: "warning",
        path: "/admin/amenities",
      })
    );
  complaintsRes.data.data
    .filter((c) => !c.assigned_to)
    .forEach((c) =>
      alerts.push({
        id: `tkt-${c._id}`,
        title: `Unassigned ${c.category} complaint`,
        subtitle: c.description?.slice(0, 60) || "",
        tone: "danger",
        path: "/admin/complaints",
      })
    );
  return alerts;
}

async function loadGuardAlerts() {
  const { data } = await api.get("/security/active-visitors");
  return data.data
    .filter((v) => v.entry_timestamp && Date.now() - new Date(v.entry_timestamp).getTime() > 4 * 60 * 60 * 1000)
    .map((v) => {
      const flat = v.flat_id && typeof v.flat_id === "object" ? v.flat_id : null;
      return {
        id: `over-${v._id}`,
        title: `${v.visitor_name} is overstaying`,
        subtitle: flat ? `${flat.block_name.replace(/^Tower\s*/i, "")}-${flat.flat_number}` : "",
        tone: "danger",
        path: "/guard",
      };
    });
}

const ALERT_LOADERS = { resident: loadResidentAlerts, admin: loadAdminAlerts, guard: loadGuardAlerts };

const ALERT_DOT = { danger: "bg-danger-fg", warning: "bg-warning-fg", info: "bg-brand-500" };

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);
  const [searchIndex, setSearchIndex] = useState([]);
  const results = filterIndex(searchIndex, query);

  const [notifOpen, setNotifOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const notifRef = useRef(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [vehiclesOpen, setVehiclesOpen] = useState(false);

  useEffect(() => {
    if (!user?.role) return;
    let cancelled = false;
    buildSearchIndex(user.role).then((index) => {
      if (!cancelled) setSearchIndex(index);
    });
    const loader = ALERT_LOADERS[user.role];
    if (loader) {
      loader()
        .then((list) => {
          if (!cancelled) setAlerts(list);
        })
        .catch(() => {
          if (!cancelled) setAlerts([]);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setQuery("");
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function goToResult(item) {
    navigate(item.path);
    setQuery("");
  }

  function goToAlert(item) {
    navigate(item.path);
    setNotifOpen(false);
  }

  function handleSearchKeyDown(e) {
    if (e.key === "Escape") setQuery("");
    if (e.key === "Enter" && results[0]) goToResult(results[0]);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const meta =
    user?.role === "resident"
      ? `${user.flat} · ${user.block}`
      : user?.role === "guard"
      ? user.gate
      : "Society Admin";

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between gap-6 px-4 md:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-1 flex-shrink-0"
          aria-label="Toggle menu"
        >
          <IconMenu />
        </button>
        <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
          <img src={logo} alt="" className="w-full h-full object-contain p-1" />
        </div>
        <span className="font-heading font-bold text-[17px] tracking-tight text-slate-800 dark:text-slate-100 hidden sm:inline">
          SmartSociety
        </span>
        {user?.society && (
          <span className="font-mono text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 rounded-full px-2 py-1 hidden lg:inline">
            {user.society.toUpperCase()} · {(user.block ?? user.gate ?? "ADMIN").toUpperCase()}
          </span>
        )}
      </div>

      <div className="hidden md:block relative flex-1 max-w-[380px]" ref={searchRef}>
        <div className="flex items-center gap-2 h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 focus-within:border-sky-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_#BAE6FD] transition-colors dark:bg-slate-800 dark:border-slate-700 dark:focus-within:bg-slate-800">
          <IconSearch />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={SEARCH_PLACEHOLDER[user?.role] ?? "Search…"}
            className="flex-1 min-w-0 bg-transparent text-body text-slate-800 placeholder:text-slate-400 outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        {query.trim() && (
          <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-card shadow-md overflow-hidden max-h-80 overflow-y-auto z-50 dark:bg-slate-900 dark:border-slate-700">
            {results.length === 0 ? (
              <div className="px-4 py-3.5 text-body text-slate-400">No matches for "{query}"</div>
            ) : (
              results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => goToResult(item)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <span className="min-w-0 flex flex-col">
                    <span className="text-body font-semibold text-slate-800 dark:text-slate-100 truncate">{item.title}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.subtitle}</span>
                  </span>
                  <span className="flex-shrink-0 text-[11px] font-semibold text-teal-600 bg-teal-100 dark:bg-teal-500/15 dark:text-teal-300 rounded-full px-2 py-1">
                    {item.group}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3.5 flex-shrink-0">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative h-10 w-10 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 flex items-center justify-center"
            aria-label="Notifications"
          >
            <IconBell />
            {alerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-fg border-2 border-white dark:border-slate-900" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-[320px] bg-white border border-slate-200 rounded-card shadow-md overflow-hidden dark:bg-slate-900 dark:border-slate-700">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-body font-bold dark:text-slate-100">Notifications</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="px-4 py-6 text-body text-slate-400 text-center">Nothing needs your attention.</div>
                ) : (
                  alerts.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => goToAlert(a)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start gap-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ALERT_DOT[a.tone] || "bg-slate-300"}`} />
                      <span className="min-w-0 flex flex-col gap-0.5">
                        <span className="text-body font-semibold text-slate-800 dark:text-slate-100">{a.title}</span>
                        {a.subtitle && <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{a.subtitle}</span>}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="w-px h-7 bg-slate-200 dark:bg-slate-700 hidden sm:block" />
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 py-[5px] pl-[5px] pr-2 rounded-[10px] hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="w-[34px] h-[34px] rounded-full bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300 flex items-center justify-center font-heading font-bold text-[13px]">
              {user?.initials}
            </div>
            <div className="hidden sm:flex flex-col items-start gap-0.5">
              <span className="text-body font-semibold leading-none text-slate-800 dark:text-slate-100">{user?.name}</span>
              <span className="text-[11px] leading-none text-slate-500 dark:text-slate-400">{ROLE_LABEL[user?.role]}</span>
            </div>
            <IconChevronDown />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-[248px] bg-white border border-slate-200 rounded-card shadow-md overflow-hidden dark:bg-slate-900 dark:border-slate-700">
              <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-0.5">
                <span className="text-body font-bold dark:text-slate-100">{user?.name}</span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{meta}</span>
              </div>
              <div className="p-1.5">
                <MenuItem onClick={() => { setProfileOpen(true); setMenuOpen(false); }}>My profile &amp; family</MenuItem>
                {user?.role === "resident" && (
                  <MenuItem onClick={() => { setVehiclesOpen(true); setMenuOpen(false); }}>
                    Vehicles &amp; emergency contacts
                  </MenuItem>
                )}
              </div>
              <div className="p-1.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 rounded-control text-body font-semibold text-danger-fg hover:bg-danger-bg dark:hover:bg-danger-fg/15"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      {user?.role === "resident" && (
        <VehiclesContactsModal open={vehiclesOpen} onClose={() => setVehiclesOpen(false)} />
      )}
    </header>
  );
}

function MenuItem({ children, onClick }) {
  return (
    <div
      onClick={onClick}
      className="px-3 py-2.5 rounded-control text-body text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
    >
      {children}
    </div>
  );
}
