import mongoose from "mongoose";

const pollOptionSchema = new mongoose.Schema(
  {
    option_text: { type: String, required: true },
    vote_count: { type: Number, default: 0 },
  },
  { _id: true },
);

const pollSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    description: { type: String, default: "" },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    poll_status: { type: String, enum: ["Active", "Closed"], default: "Active" },
    total_votes: { type: Number, default: 0 },
    start_date: { type: Date, default: Date.now },
    end_date: { type: Date, required: true },
    options: [pollOptionSchema],
  },
  { timestamps: true },
);

export default mongoose.model("Poll", pollSchema);
