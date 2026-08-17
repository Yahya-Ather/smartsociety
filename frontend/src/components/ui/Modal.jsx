export default function Modal({ open, onClose, title, subtitle, children, footer, maxWidth = "480px" }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-800/40 dark:bg-slate-950/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full rounded-panel bg-white dark:bg-slate-800 shadow-lg overflow-hidden"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-[22px]">
            <div className="flex flex-col gap-1.5">
              {title && <h3 className="m-0 font-heading font-semibold text-h3 text-slate-800 dark:text-slate-100">{title}</h3>}
              {subtitle && <span className="text-body text-slate-500 dark:text-slate-400">{subtitle}</span>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex-shrink-0 h-8 w-8 rounded-control bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        )}
        <div className="px-6 py-[18px] flex flex-col gap-3.5">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900 flex justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
