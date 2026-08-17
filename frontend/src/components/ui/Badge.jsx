const TONES = {
  success: "bg-success-bg text-success-fg dark:bg-success-fg/15",
  warning: "bg-warning-bg text-warning-fg dark:bg-warning-fg/15",
  danger: "bg-danger-bg text-danger-fg dark:bg-danger-fg/15",
  info: "bg-info-bg text-info-fg dark:bg-info-fg/15",
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  neutral: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const DOT_COLOR = {
  success: "bg-success-fg",
  warning: "bg-warning-fg",
  danger: "bg-danger-fg",
  info: "bg-info-fg",
  teal: "bg-teal-600",
  neutral: "bg-slate-400",
};

export default function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-xs font-bold ${TONES[tone]} ${className}`}
    >
      <span className={`h-[7px] w-[7px] rounded-full ${DOT_COLOR[tone]}`} />
      {children}
    </span>
  );
}

// Count pill used in sidebar nav items (e.g. open complaints / overdue bills)
export function CountPill({ tone = "neutral", children }) {
  const bg = {
    danger: "bg-danger-bg text-danger-fg",
    warning: "bg-warning-fg text-white",
    neutral: "bg-slate-100 text-slate-500",
  }[tone];
  return (
    <span
      className={`inline-flex min-w-[20px] h-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${bg}`}
    >
      {children}
    </span>
  );
}
