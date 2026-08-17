import { useMemo, useState } from "react";

// Generic client-side table sort. `resolvers` maps a column key to a
// function that pulls a comparable value (string/number/Date) off a row —
// needed because table cells are often pre-formatted display strings, not
// the raw sortable value. Falls back to a plain property lookup when a
// column has no resolver.
export function useSort(rows, resolvers = {}, defaultKey = null, defaultDir = "asc") {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortDir, setSortDir] = useState(defaultDir);

  function toggleSort(key) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const resolve = resolvers[sortKey] || ((row) => row[sortKey]);
    const copy = [...rows];
    copy.sort((a, b) => {
      let av = resolve(a);
      let bv = resolve(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sortKey, sortDir]);

  return { sorted, sortKey, sortDir, toggleSort };
}
