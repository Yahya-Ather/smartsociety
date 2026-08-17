import mongoose from "mongoose";

const flatSchema = new mongoose.Schema(
  {
    block_name: { type: String, required: true },
    flat_number: { type: String, required: true },
    occupancy_type: { type: String, enum: ["Owner", "Tenant"], required: true },
    owner_name: { type: String, default: "" },
    owner_phone: { type: String, default: "" },
    carpet_area: { type: Number, default: 0 },
    is_occupied: { type: Boolean, default: false },
    number_of_members: { type: Number, default: 0 },
    registered_vehicles: { type: Number, default: 0 },
  },
  { timestamps: true },
);

flatSchema.index({ block_name: 1, flat_number: 1 }, { unique: true });

export default mongoose.model("Flat", flatSchema);
