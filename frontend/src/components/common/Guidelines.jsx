import { useState } from "react";
import { Card } from "../ui/index.js";
import { IconNotices } from "./icons.jsx";
import { GUIDELINES } from "../../data/residentMockData.js";

export default function Guidelines() {
  const [open, setOpen] = useState(0);

  return (
    <div className="flex flex-col gap-5 max-w-[820px]">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">Society Guidelines</h1>
        <span className="text-body text-slate-500">Parking, pets, noise timings and other community rules.</span>
      </div>

      <Card padded={false} className="overflow-hidden">
        {GUIDELINES.map((g, i) => (
          <div key={g.title} className={i !== 0 ? "border-t border-slate-100" : ""}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span className="flex items-center gap-3">
                <IconNotices size={16} color="#5B6779" />
                <span className="font-semibold text-body-lg">{g.title}</span>
              </span>
              <span className={`text-slate-400 transition-transform ${open === i ? "rotate-180" : ""}`}>⌄</span>
            </button>
            {open === i && (
              <div className="px-5 pb-4 -mt-1 pl-[52px]">
                <span className="text-body text-slate-600">{g.body}</span>
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}
