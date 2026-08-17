import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    resident_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    flat_id: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    vehicle_number: { type: String, required: true, unique: true, uppercase: true },
    vehicle_type: { type: String, enum: ["Car", "Bike", "Scooter", "Auto", "Truck"], required: true },
    vehicle_model: { type: String, required: true },
    color: { type: String, default: "" },
    registration_date: { type: Date, default: Date.now },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Vehicle", vehicleSchema);
