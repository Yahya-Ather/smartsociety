import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    poll_id: { type: mongoose.Schema.Types.ObjectId, ref: "Poll", required: true },
    resident_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    flat_id: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    selected_option: { type: String, required: true },
    voted_at: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

voteSchema.index({ poll_id: 1, resident_id: 1 }, { unique: true });

export default mongoose.model("Vote", voteSchema);
