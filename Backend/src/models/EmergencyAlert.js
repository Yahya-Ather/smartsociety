import mongoose from "mongoose";

// Site-wide SOS event triggered by any resident/admin/guard via the footer's
// hold-to-confirm siren button. Distinct from SecurityAlert (which is always
// tied to a specific visitor) — this is a general "something's wrong, right
// now" broadcast meant to reach every connected user in real time, not just
// security staff.
const emergencyAlertSchema = new mongoose.Schema(
  {
    triggered_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    triggered_by_name: { type: String, required: true },
    triggered_by_role: { type: String, required: true },
    flat_id: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", default: null },
    location_label: { type: String, default: null },
    status: { type: String, enum: ["Active", "Resolved"], default: "Active" },
    triggered_at: { type: Date, default: Date.now },
    resolved_at: { type: Date, default: null },
    resolved_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    resolved_by_name: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default mongoose.model("EmergencyAlert", emergencyAlertSchema);
