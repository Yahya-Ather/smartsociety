import mongoose from "mongoose";

const emergencyContactSchema = new mongoose.Schema(
  {
    resident_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    flat_id: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    contact_name: { type: String, required: true },
    relationship: {
      type: String,
      enum: ["Spouse", "Child", "Parent", "Sibling", "Friend", "Other"],
      required: true,
    },
    phone_number: { type: String, required: true },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    is_primary: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("EmergencyContact", emergencyContactSchema);
