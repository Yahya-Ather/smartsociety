import mongoose from "mongoose";

// Satisfies the SRS's "family/tenant details" requirement — people living in
// the flat besides the resident account holder, whether a family member or a
// tenant. Managed entirely by the resident themselves (see familyController).
const familyMemberSchema = new mongoose.Schema(
  {
    resident_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    flat_id: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    name: { type: String, required: true },
    relationship: {
      type: String,
      enum: ["Spouse", "Child", "Parent", "Sibling", "Tenant", "Domestic Help", "Other"],
      required: true,
    },
    age: { type: Number, default: null },
    phone_number: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("FamilyMember", familyMemberSchema);
