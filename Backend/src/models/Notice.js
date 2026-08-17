import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["General", "Maintenance", "Security", "Event", "Billing"],
      default: "General",
    },
    urgent: { type: Boolean, default: false },
    event_date: { type: Date, default: null },
    event_time: { type: String, default: "" },
    event_location: { type: String, default: "" },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export default mongoose.model("Notice", noticeSchema);
