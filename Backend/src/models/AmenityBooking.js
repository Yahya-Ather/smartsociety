import mongoose from "mongoose";

const amenityBookingSchema = new mongoose.Schema(
  {
    amenity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Amenity", required: true },
    resident_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    flat_id: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    booking_date: { type: Date, required: true },
    time_from: { type: String, required: true },
    time_to: { type: String, required: true },
    number_of_guests: { type: Number, required: true, min: 1 },
    booking_status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },
    special_requirements: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("AmenityBooking", amenityBookingSchema);
