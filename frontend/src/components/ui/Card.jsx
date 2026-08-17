export default function Card({
  as: Tag = "div",
  padded = true,
  accent,
  className = "",
  children,
  ...props
}) {
  const accentBorder = accent ? `border-l-[3px]` : "";
  const accentColor = {
    brand: "border-l-brand-500",
    teal: "border-l-teal-500",
    danger: "border-l-danger-fg",
  }[accent];

  return (
    <Tag
      className={`bg-white border border-slate-200 rounded-card shadow-sm ${
        padded ? "p-lg md:p-xl" : ""
      } ${accentBorder} ${accentColor ?? ""} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, action, className = "" }) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="flex flex-col gap-1">
        <h3 className="font-heading font-semibold text-h3 text-slate-800 m-0">{title}</h3>
        {subtitle && <span className="text-body text-slate-500">{subtitle}</span>}
      </div>
      {action}
    </div>
  );
}
