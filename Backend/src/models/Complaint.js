import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    resident_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    flat_id: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    category: {
      type: String,
      enum: ["Plumbing", "Electrical", "Elevator", "Cleaning", "Maintenance", "Security", "Other"],
      required: true,
    },
    description: { type: String, required: true },
    priority: { type: String, enum: ["Low", "Medium", "High", "Urgent"], default: "Medium" },
    photo_url: { type: String, default: "" },
    status: { type: String, enum: ["Pending", "In-Progress", "Resolved", "Closed"], default: "Pending" },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    sla_due_date: { type: Date, default: null },
    resolution_date: { type: Date, default: null },
    resolution_notes: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, default: null },
    feedback: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("Complaint", complaintSchema);
