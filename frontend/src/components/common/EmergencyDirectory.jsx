import { useEffect, useState } from "react";
import { Card, Badge } from "../ui/index.js";
import api from "../../services/api.js";

const NATIONAL_NUMBERS = [
  { label: "Police", number: "15", note: "Pakistan Police helpline" },
  { label: "Fire Brigade", number: "16", note: "Fire emergency" },
  { label: "Rescue 1122", number: "1122", note: "Emergency medical & rescue services" },
  { label: "Edhi Ambulance", number: "115", note: "Ambulance service" },
];

export default function EmergencyDirectory() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({ guards: [], admins: [], service_staff: [] });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/directory/emergency");
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load the emergency directory.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-body text-slate-500 py-12 text-center">Loading emergency directory…</div>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-[900px]">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">Emergency Contact Directory</h1>
        <span className="text-body text-slate-500">Who to call, on-site or nationwide, in an emergency.</span>
      </div>

      {error && <span className="text-body font-semibold text-danger-fg">{error}</span>}

      <Card className="flex flex-col gap-3.5 !border-l-[3px] !border-l-danger-fg">
        <span className="font-heading font-bold text-body-lg">National emergency numbers</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {NATIONAL_NUMBERS.map((n) => (
            <div key={n.label} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-danger-bg">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-body">{n.label}</span>
                <span className="text-xs text-slate-500">{n.note}</span>
              </div>
              <span className="font-mono font-extrabold text-lg text-danger-fg">{n.number}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-3.5">
        <span className="font-heading font-bold text-body-lg">Security gates</span>
        <div className="flex flex-col gap-2.5">
          {data.guards.map((g) => (
            <ContactRow key={g._id} name={g.name} sub={g.gate || "Gate duty"} phone={g.phone_number} tone="teal" />
          ))}
          {data.guards.length === 0 && <span className="text-body text-slate-400">No active guards on roster.</span>}
        </div>
      </Card>

      <Card className="flex flex-col gap-3.5">
        <span className="font-heading font-bold text-body-lg">Facility & maintenance staff</span>
        <div className="flex flex-col gap-2.5">
          {data.service_staff.map((s) => (
            <ContactRow key={s._id} name={s.name} sub={s.service_type} phone={s.phone_number} tone="info" />
          ))}
          {data.service_staff.length === 0 && <span className="text-body text-slate-400">No service staff on roster yet.</span>}
        </div>
      </Card>

      <Card className="flex flex-col gap-3.5">
        <span className="font-heading font-bold text-body-lg">Society management office</span>
        <div className="flex flex-col gap-2.5">
          {data.admins.map((a) => (
            <ContactRow key={a._id} name={a.name} sub={a.email} phone={a.phone_number} tone="neutral" />
          ))}
          {data.admins.length === 0 && <span className="text-body text-slate-400">No active admins on roster.</span>}
        </div>
      </Card>
    </div>
  );
}

function ContactRow({ name, sub, phone, tone }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-xs flex-shrink-0 bg-white border border-slate-200 text-slate-600">
          {initialsOf(name)}
        </span>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-semibold text-body truncate">{name}</span>
          {sub && <Badge tone={tone}>{sub}</Badge>}
        </div>
      </div>
      <span className="font-mono font-semibold text-body flex-shrink-0">{phone || "—"}</span>
    </div>
  );
}

function initialsOf(name) {
  return (name || "").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}
