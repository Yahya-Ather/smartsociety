import mongoose from "mongoose";

const amenitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["Clubhouse", "Swimming Pool", "Sports Courts", "Party Hall", "Gym", "Yoga Studio"],
      required: true,
    },
    description: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    location: { type: String, required: true },
    availability: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Amenity", amenitySchema);
