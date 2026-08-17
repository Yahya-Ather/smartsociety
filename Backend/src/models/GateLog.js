import mongoose from "mongoose";

const gateLogSchema = new mongoose.Schema(
  {
    visitor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor", default: null },
    visitor_name: { type: String, required: true },
    visitor_type: {
      type: String,
      enum: ["Guest", "Delivery Partner", "Service Provider", "Staff", "Other"],
      default: "Guest",
    },
    vehicle_number: { type: String, default: "" },
    flat_id: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    flat_number: { type: String, required: true },
    phone_number: { type: String, required: true },
    gate_id: { type: String, default: "Main Gate" },
    entry_time: { type: Date, required: true },
    exit_time: { type: Date, default: null },
    entry_pass_code: { type: String, default: null },
    logged_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("GateLog", gateLogSchema);
