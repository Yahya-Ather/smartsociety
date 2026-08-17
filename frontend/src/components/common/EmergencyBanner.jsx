import { useEffect, useState } from "react";
import api from "../../services/api.js";
import socket from "../../services/socket.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function EmergencyBanner() {
  const { role } = useAuth();
  const [alerts, setAlerts] = useState([]);

  // Fallback for anyone who loads the app after the trigger — the socket
  // push only reaches clients already connected at that moment.
  useEffect(() => {
    api
      .get("/emergency/active")
      .then((res) => setAlerts(res.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onTriggered(alert) {
      setAlerts((prev) => (prev.some((a) => a.id === alert.id) ? prev : [alert, ...prev]));
    }
    function onResolved(alert) {
      setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
    }

    socket.on("emergency:triggered", onTriggered);
    socket.on("emergency:resolved", onResolved);

    return () => {
      socket.off("emergency:triggered", onTriggered);
      socket.off("emergency:resolved", onResolved);
    };
  }, []);

  async function resolve(id) {
    try {
      await api.patch(`/emergency/${id}/resolve`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // socket 'emergency:resolved' will still catch it if another admin resolved it first
    }
  }

  if (alerts.length === 0) return null;

  const canResolve = role === "admin" || role === "guard";

  return (
    <div className="sticky top-0 z-50 flex flex-col gap-1.5 bg-emergency text-white px-4 md:px-6 py-2.5">
      {alerts.map((a) => (
        <div key={a.id} className="flex items-center justify-between gap-3 flex-wrap">
          <span className="flex items-center gap-2 text-body font-semibold">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse flex-shrink-0" />
            Emergency siren — {a.triggeredByName} ({a.triggeredByRole})
            {a.flat ? ` · ${a.flat}` : a.locationLabel ? ` · ${a.locationLabel}` : ""}
            {" · "}
            {new Date(a.triggeredAt).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: false })}
          </span>
          {canResolve && (
            <button
              onClick={() => resolve(a.id)}
              className="text-xs font-bold bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-control flex-shrink-0"
            >
              Mark resolved
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
