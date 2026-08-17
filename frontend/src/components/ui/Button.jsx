const VARIANTS = {
  primary:
    "bg-teal-500 text-white hover:bg-teal-600 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500",
  secondary:
    "bg-white text-slate-800 border border-slate-300 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50/40 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:border-teal-400 dark:hover:text-teal-300",
  ghost: "bg-transparent text-teal-600 hover:bg-teal-100 dark:text-teal-300 dark:hover:bg-slate-800",
  danger: "bg-danger-fg text-white hover:bg-danger-hover",
  guard: "bg-teal-500 text-white hover:bg-teal-600",
  emergency: "bg-emergency text-white hover:bg-emergency-dark animate-siren",
};

const SIZES = {
  sm: "h-9 px-3.5 text-body rounded-control",
  md: "h-11 px-5 text-body-lg rounded-lg",
  lg: "h-[52px] px-6 text-lg rounded-card",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`focus-ring inline-flex items-center justify-center gap-2.5 font-semibold cursor-pointer transition-colors duration-150 disabled:cursor-not-allowed whitespace-nowrap ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
