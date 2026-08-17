import Visitor from "../models/Visitor.js";
import SecurityAlert from "../models/SecurityAlert.js";

// Matches the 4-hour threshold every frontend dashboard already uses to show
// a live "overstay" banner (mapVisitorLog/mapInsideVisitor in
// frontend/src/utils/mappers.js). Previously that banner was purely a
// client-side recalculation on every page load — nothing was ever created or
// persisted server-side, so there was no record of an overstay unless
// someone happened to be looking at the screen. This job turns it into a
// real, persisted event.
const OVERSTAY_THRESHOLD_MS = 4 * 60 * 60 * 1000;

export async function checkOverstays() {
  const cutoff = new Date(Date.now() - OVERSTAY_THRESHOLD_MS);

  const overstaying = await Visitor.find({
    status: "Entered",
    entry_timestamp: { $lt: cutoff },
  });

  for (const visitor of overstaying) {
    const existing = await SecurityAlert.findOne({
      visitor_id: visitor._id,
      alert_type: "Overstay",
      alert_status: "Active",
    });
    if (existing) continue;

    const durationHrs = ((Date.now() - new Date(visitor.entry_timestamp).getTime()) / 3600000).toFixed(1);

    await SecurityAlert.create({
      visitor_id: visitor._id,
      alert_type: "Overstay",
      description: `${visitor.visitor_name} has been on premises for ${durationHrs}h (flat #${visitor.flat_id})`,
      alert_status: "Active",
      flat_id: visitor.flat_id,
      trigger_time: new Date(),
    });
  }
}

export function startOverstayMonitor(intervalMs = 5 * 60 * 1000) {
  checkOverstays().catch((err) => console.error("Overstay monitor error:", err.message));
  return setInterval(() => {
    checkOverstays().catch((err) => console.error("Overstay monitor error:", err.message));
  }, intervalMs);
}
