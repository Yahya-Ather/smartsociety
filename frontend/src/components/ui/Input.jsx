export function FormField({ label, helper, error, required, children, className = "" }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <span className="text-label uppercase text-slate-500 dark:text-slate-400">
          {label}
          {required && <span className="text-danger-fg"> *</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="text-xs font-semibold text-danger-fg">{error}</span>
      ) : helper ? (
        <span className="text-xs text-slate-400 dark:text-slate-500">{helper}</span>
      ) : null}
    </label>
  );
}

const baseControl =
  "focus-ring h-11 w-full rounded-lg border bg-white px-3 text-body-lg text-slate-800 outline-none transition-colors placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-900 dark:disabled:text-slate-600";

export function TextInput({ error, className = "", ...props }) {
  return (
    <input
      className={`${baseControl} ${error ? "border-danger-fg" : "border-slate-300 dark:border-slate-600"} ${className}`}
      {...props}
    />
  );
}

export function Select({ error, className = "", children, ...props }) {
  return (
    <select
      className={`${baseControl} ${error ? "border-danger-fg" : "border-slate-300 dark:border-slate-600"} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ error, rows = 3, className = "", ...props }) {
  return (
    <textarea
      rows={rows}
      className={`focus-ring w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-body-lg text-slate-800 outline-none transition-colors placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 ${
        error ? "border-danger-fg" : "border-slate-300 dark:border-slate-600"
      } ${className}`}
      {...props}
    />
  );
}
