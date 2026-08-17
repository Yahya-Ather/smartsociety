export function Table({ children, minWidth = "620px" }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-body" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export function Thead({ children }) {
  return (
    <thead>
      <tr className="bg-slate-100">{children}</tr>
    </thead>
  );
}

// Pass sortKey + activeKey/direction/onSort to make a header clickable with a
// direction indicator; omit them and it renders exactly as a plain header.
export function Th({ align = "left", children, sortKey, activeKey, direction, onSort }) {
  const sortable = Boolean(sortKey && onSort);
  const active = sortable && activeKey === sortKey;

  return (
    <th
      className={`px-4 py-[11px] first:px-6 last:px-6 text-label uppercase text-slate-500 ${sortable ? "cursor-pointer select-none hover:text-slate-700" : ""}`}
      style={{ textAlign: align }}
      onClick={sortable ? () => onSort(sortKey) : undefined}
    >
      <span className={`inline-flex items-center gap-1 ${align === "right" ? "flex-row-reverse" : ""}`}>
        {children}
        {sortable && (
          <span className={`text-[9px] leading-none ${active ? "text-brand-600" : "text-slate-300"}`}>
            {active ? (direction === "asc" ? "▲" : "▼") : "⇅"}
          </span>
        )}
      </span>
    </th>
  );
}

export function Tr({ children, className = "", ...props }) {
  return (
    <tr className={`border-t border-slate-200 hover:bg-slate-50 ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function Td({ align = "left", mono = false, children, className = "" }) {
  return (
    <td
      className={`px-4 py-3.5 first:px-6 last:px-6 ${mono ? "font-mono text-mono-amt" : ""} ${className}`}
      style={{ textAlign: align }}
    >
      {children}
    </td>
  );
}
