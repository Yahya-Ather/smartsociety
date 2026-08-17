import Card from "./Card.jsx";

export default function StatCard({ label, value, badge, hint, className = "" }) {
  return (
    <Card className={`flex flex-col gap-2 ${className}`}>
      <span className="text-label uppercase text-slate-500">{label}</span>
      <span className="font-heading font-extrabold text-[28px] md:text-display leading-none tracking-tight text-slate-800">
        {value}
      </span>
      {badge}
      {hint && <span className="text-body text-slate-500">{hint}</span>}
    </Card>
  );
}
