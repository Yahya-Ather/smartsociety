import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    visitor_name: { type: String, required: true },
    phone: { type: String, required: true },
    visitor_type: {
      type: String,
      enum: ["Guest", "Delivery Partner", "Service Provider", "Cab Operator", "Other"],
      default: "Guest",
    },
    vehicle_number: { type: String, default: "" },
    vehicle_type: { type: String, enum: ["", "Car", "Bike", "Scooter", "Auto", "Truck"], default: "" },
    flat_id: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    gate_pass_code: { type: String, default: null },
    qr_code: { type: String, default: null },
    entry_timestamp: { type: Date, default: null },
    exit_timestamp: { type: Date, default: null },
    status: { type: String, enum: ["Pre-Approved", "Entered", "Exited"], default: "Pre-Approved" },
    approval_date: { type: Date, default: Date.now },
    valid_from: { type: Date, default: Date.now },
    valid_till: { type: Date, required: true },
    remarks: { type: String, default: "" },
    photo_url: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("Visitor", visitorSchema);
