import { useEffect, useState } from "react";
import { Card, Badge } from "../ui/index.js";
import { IconNotices } from "../common/icons.jsx";
import { GUIDELINES } from "../../data/residentMockData.js";
import api from "../../services/api.js";
import { mapNotice, mapPoll } from "../../utils/mappers.js";

const TABS = [
  { id: "announcements", label: "Announcements" },
  { id: "events", label: "Events" },
  { id: "polls", label: "Polls" },
  { id: "guidelines", label: "Guidelines" },
];

export default function Notices() {
  const [tab, setTab] = useState("announcements");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notices, setNotices] = useState([]);
  const [polls, setPolls] = useState([]);
  const [openGuideline, setOpenGuideline] = useState(0);
  const [votingId, setVotingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [noticesRes, pollsRes] = await Promise.all([
        api.get("/resident/notices"),
        api.get("/polls"),
      ]);
      setNotices(noticesRes.data.data.map(mapNotice));
      const pollList = pollsRes.data.data;
      const detailed = await Promise.all(
        pollList.map((p) => api.get(`/polls/${p._id}`).then((r) => r.data.data).catch(() => p)),
      );
      setPolls(detailed.map(mapPoll));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notices.");
    } finally {
      setLoading(false);
    }
  }

  const openPollCount = polls.filter((p) => p.status === "open" && !p.userVoted).length;
  const events = notices.filter((n) => n.category === "Event");
  const announcements = notices.filter((n) => n.category !== "Event");

  async function vote(pollId, optionLabel) {
    setVotingId(pollId);
    try {
      await api.post(`/polls/${pollId}/vote`, { selected_option: optionLabel });
      const { data } = await api.get(`/polls/${pollId}`);
      setPolls((ps) => ps.map((p) => (p.id === pollId ? mapPoll(data.data) : p)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record vote.");
    } finally {
      setVotingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1280px]">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading font-extrabold text-[26px] md:text-h1 tracking-tight m-0">Notice Board</h1>
        <span className="text-body text-slate-500">Announcements, events, polls and society guidelines in one place.</span>
      </div>

      {error && <span className="text-body font-semibold text-danger-fg">{error}</span>}

      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg self-start flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`h-9 px-4 rounded-md text-sm font-bold flex items-center gap-2 ${
              tab === t.id ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"
            }`}
          >
            {t.label}
            {t.id === "polls" && openPollCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-brand-100 text-brand-600 text-[10px] font-bold flex items-center justify-center">
                {openPollCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && <div className="text-body text-slate-500 py-12 text-center">Loading…</div>}

      {!loading && tab === "announcements" && (
        <div className="flex flex-col gap-3">
          {announcements.length === 0 && <span className="text-body text-slate-500">No announcements yet.</span>}
          {announcements.map((n) => (
            <Card key={n.id} accent={n.urgent ? "danger" : undefined} className="flex gap-3 items-start">
              <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${n.urgent ? "bg-danger-fg" : "bg-slate-300"}`} />
              <div className="min-w-0 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-heading font-bold text-body-lg">{n.title}</span>
                  {n.urgent && <Badge tone="danger">Urgent</Badge>}
                </div>
                <span className="text-body text-slate-600">{n.body}</span>
                <span className="text-xs text-slate-400">{n.postedAt} &middot; {n.category}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && tab === "events" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.length === 0 && <span className="text-body text-slate-500">No upcoming events.</span>}
          {events.map((e) => {
            const d = e.eventDate ? new Date(e.eventDate) : null;
            return (
              <Card key={e.id} className="flex gap-4">
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-brand-100 flex-shrink-0">
                  <span className="font-mono text-[10px] text-brand-600 uppercase">
                    {d ? d.toLocaleDateString("en-PK", { month: "short" }) : ""}
                  </span>
                  <span className="font-heading font-extrabold text-lg text-brand-700 leading-tight">
                    {d ? d.getDate() : "—"}
                  </span>
                </div>
                <div className="min-w-0 flex flex-col gap-1">
                  <span className="font-heading font-bold text-body-lg">{e.title}</span>
                  <span className="text-body text-slate-500">{e.eventTime} &middot; {e.eventLocation}</span>
                  <span className="text-xs text-slate-400">{e.body}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && tab === "polls" && (
        <div className="flex flex-col gap-4">
          {polls.length === 0 && <span className="text-body text-slate-500">No polls right now.</span>}
          {polls.map((p) => {
            const isClosed = p.status === "closed";
            const showResults = isClosed || p.userVoted;
            const winnerPct = Math.max(...p.options.map((o) => o.pct), 0);
            return (
              <Card key={p.id} className="flex flex-col gap-3.5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <span className="font-heading font-bold text-body-lg">{p.question}</span>
                  <Badge tone={isClosed ? "neutral" : "info"}>{isClosed ? "Closed" : "Open"}</Badge>
                </div>
                <span className="text-xs text-slate-400">
                  {p.closesIn} &middot; {p.votes} of {p.total} voted
                </span>

                {showResults ? (
                  <div className="flex flex-col gap-2.5">
                    {p.options.map((o) => (
                      <div key={o.label} className="flex flex-col gap-1">
                        <div className="flex justify-between text-sm">
                          <span className={`font-semibold ${o.pct === winnerPct ? "text-brand-600" : "text-slate-700"}`}>
                            {o.label}
                            {p.userVotedOption === o.label && !isClosed && " · your vote"}
                          </span>
                          <span className="font-mono text-xs">{o.pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${o.pct === winnerPct ? "bg-brand-500" : "bg-slate-300"}`}
                            style={{ width: `${o.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {p.options.map((o) => (
                      <button
                        key={o.label}
                        disabled={votingId === p.id}
                        onClick={() => vote(p.id, o.label)}
                        className="h-11 px-4 rounded-lg border border-slate-200 bg-white text-left text-body-lg font-semibold text-slate-700 hover:border-brand-500 hover:bg-brand-50 disabled:opacity-50"
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {!loading && tab === "guidelines" && (
        <Card padded={false} className="overflow-hidden">
          {GUIDELINES.map((g, i) => (
            <div key={g.title} className={i !== 0 ? "border-t border-slate-100" : ""}>
              <button
                onClick={() => setOpenGuideline(openGuideline === i ? -1 : i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <span className="flex items-center gap-3">
                  <IconNotices size={16} color="#5B6779" />
                  <span className="font-semibold text-body-lg">{g.title}</span>
                </span>
                <span className={`text-slate-400 transition-transform ${openGuideline === i ? "rotate-180" : ""}`}>⌄</span>
              </button>
              {openGuideline === i && (
                <div className="px-5 pb-4 -mt-1 pl-[52px]">
                  <span className="text-body text-slate-600">{g.body}</span>
                </div>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
