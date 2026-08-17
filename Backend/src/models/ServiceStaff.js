import mongoose from "mongoose";

// Facility/maintenance personnel (plumber, electrician, etc.) — distinct from
// User: they never log into the portal, so there's no username/password/role
// here, just a roster the Admin maintains for the Staff Management screen and
// the Emergency Contact Directory.
const serviceStaffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone_number: { type: String, required: true },
    service_type: {
      type: String,
      enum: [
        "Plumber",
        "Electrician",
        "Carpenter",
        "Housekeeping",
        "Facility Manager",
        "Gardener",
        "Painter",
        "Pest Control",
        "Other",
      ],
      required: true,
    },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("ServiceStaff", serviceStaffSchema);
