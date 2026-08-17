import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { NAV_CONFIG } from "./navConfig.js";
import { CountPill } from "../ui/Badge.jsx";
import api from "../../services/api.js";

function useNavCounts(role) {
  const [counts, setCounts] = useState({});
  const [overstay, setOverstay] = useState(0);

  useEffect(() => {
    if (!role) return;
    let cancelled = false;

    async function load() {
      try {
        if (role === "resident") {
          const [billsRes, complaintsRes] = await Promise.all([
            api.get("/resident/bills"),
            api.get("/resident/complaints"),
          ]);
          if (cancelled) return;
          setCounts({
            overdueBills: billsRes.data.data.filter((b) => b.payment_status === "Overdue").length,
            openComplaints: complaintsRes.data.data.filter((c) => c.status === "Pending" || c.status === "In-Progress").length,
          });
        } else if (role === "admin") {
          const { data } = await api.get("/admin/billing");
          if (cancelled) return;
          setCounts({ pendingBills: data.summary.pending_bills });
        } else if (role === "guard") {
          const { data } = await api.get("/security/active-visitors");
          if (cancelled) return;
          const overstaying = data.data.filter((v) => {
            if (!v.entry_timestamp) return false;
            return Date.now() - new Date(v.entry_timestamp).getTime() > 4 * 60 * 60 * 1000;
          });
          setOverstay(overstaying.length);
        }
      } catch {
        // Sidebar badges are non-critical — silently skip on failure.
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [role]);

  return { counts, overstay };
}

const ROLE_STYLE = {
  resident: {
    container: "bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800",
    groupLabel: "text-slate-400 dark:text-slate-500",
    itemDefault: "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800",
    itemActive: "bg-teal-100 text-teal-700 font-semibold dark:bg-teal-500/15 dark:text-teal-300",
    itemHeight: "h-11",
    accentBar: "bg-teal-500",
  },
  admin: {
    container: "bg-brand-700",
    groupLabel: "text-white/55",
    itemDefault: "text-white/80 hover:bg-white/10 hover:text-white",
    itemActive: "bg-white/[0.14] text-white font-semibold",
    itemHeight: "h-11",
    accentBar: null,
  },
  guard: {
    container: "bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800",
    groupLabel: "text-slate-400 dark:text-slate-500",
    itemDefault: "text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800",
    itemActive: "bg-teal-100 text-teal-700 font-bold dark:bg-teal-500/15 dark:text-teal-300",
    itemHeight: "h-[52px] text-[15px]",
    accentBar: "bg-teal-500",
  },
};

function iconColor(role, isActive) {
  if (role === "admin") return isActive ? "#FFFFFF" : "#AFC6DE";
  if (role === "guard") return isActive ? "#0B5C56" : "#64748B";
  return isActive ? "#0B5C56" : "#64748B";
}

function SidebarContent({ role, counts, overstay }) {
  const config = NAV_CONFIG[role];
  const style = ROLE_STYLE[role];

  return (
    <div className={`w-[248px] h-full rounded-panel p-3 flex flex-col gap-1 ${style.container}`}>
      {config.groupLabel && (
        <div className={`px-2.5 pt-1.5 pb-3 text-[11px] font-semibold uppercase tracking-wider ${style.groupLabel}`}>
          {config.groupLabel}
        </div>
      )}
      {config.items.map(({ label, path, icon: Icon, countKey }) => {
        const count = countKey ? counts[countKey] : null;
        return (
          <NavLink
            key={path}
            to={path}
            end={path === `/${role}`}
            className={({ isActive }) =>
              `relative flex items-center justify-between gap-3 ${style.itemHeight} px-3 rounded-lg cursor-pointer transition-colors ${
                isActive ? style.itemActive : style.itemDefault
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && style.accentBar && (
                  <span className={`absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full ${style.accentBar}`} />
                )}
                <span className="flex items-center gap-3">
                  <Icon color={iconColor(role, isActive)} size={role === "guard" ? 20 : 18} />
                  {label}
                </span>
                {count > 0 && (
                  <CountPill tone={countKey === "overdueBills" ? "danger" : countKey === "pendingBills" ? "warning" : "neutral"}>
                    {count}
                  </CountPill>
                )}
              </>
            )}
          </NavLink>
        );
      })}

      {role === "resident" && (
        <div className="mt-3 p-3.5 rounded-card bg-teal-100 dark:bg-teal-500/15 flex flex-col gap-2">
          <span className="font-heading font-semibold text-[13px] text-teal-700 dark:text-teal-300">Expecting a guest?</span>
          <NavLink
            to="/resident/visitor-pass"
            className="h-10 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-body font-semibold flex items-center justify-center"
          >
            Create gate pass
          </NavLink>
        </div>
      )}

      {role === "guard" && overstay > 0 && (
        <div className="mt-3 p-3.5 rounded-card bg-danger-bg dark:bg-danger-fg/15 flex flex-col gap-1.5">
          <span className="font-heading font-semibold text-[13px] text-danger-text dark:text-red-300">
            {overstay} visitor{overstay > 1 ? "s" : ""} overstaying
          </span>
          <span className="text-xs leading-snug text-danger-text dark:text-red-300">Check the gate dashboard for details.</span>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { role } = useAuth();
  const { counts, overstay } = useNavCounts(role);
  if (!role) return null;

  return (
    <>
      {/* Desktop — persistent left column, full height down to the viewport
          bottom (not just as tall as its own nav items), pinned below the
          navbar while the main content scrolls beside it. */}
      <aside className="hidden md:block flex-shrink-0 sticky top-16 h-[calc(100vh-4rem-6rem)] overflow-y-auto p-3">
        <SidebarContent role={role} counts={counts} overstay={overstay} />
      </aside>

      {/* Mobile — off-canvas drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-800/40 dark:bg-slate-950/60" onClick={onCloseMobile} />
          <div className="absolute left-0 top-0 bottom-0 p-3 overflow-y-auto flex flex-col gap-2">
            <button
              onClick={onCloseMobile}
              aria-label="Close menu"
              className="self-end w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 text-lg dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
            >
              ✕
            </button>
            <SidebarContent role={role} counts={counts} overstay={overstay} />
          </div>
        </div>
      )}
    </>
  );
}

// Bottom tab bar for Resident/Guard on mobile — replaces the sidebar under 768px.
export function MobileBottomNav() {
  const { role } = useAuth();
  if (!role || role === "admin") return null;

  const items = NAV_CONFIG[role].items.slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-white border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex items-stretch pb-[env(safe-area-inset-bottom)]">
      {items.map(({ label, shortLabel, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === `/${role}`}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium ${
              isActive ? "text-teal-600 dark:text-teal-300" : "text-slate-500 dark:text-slate-400"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} color={isActive ? "#0B5C56" : "#94A3B8"} />
              <span className="truncate max-w-[64px]">{shortLabel ?? label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
