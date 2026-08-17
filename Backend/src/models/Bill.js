import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    flat_id: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    billing_month: { type: String, required: true },
    base_amount: { type: Number, required: true },
    charges_breakdown: {
      maintenance: { type: Number, default: 0 },
      water: { type: Number, default: 0 },
      security: { type: Number, default: 0 },
      repairs: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    amount_due: { type: Number, required: true },
    penalty_amount: { type: Number, default: 0 },
    total_due: { type: Number, required: true },
    due_date: { type: Date, required: true },
    payment_status: { type: String, enum: ["Pending", "Paid", "Overdue", "Partial"], default: "Pending" },
    payment_date: { type: Date, default: null },
    payment_method: {
      type: String,
      enum: ["Online", "Cheque", "Bank Transfer", "Cash", "Pending"],
      default: "Pending",
    },
    transaction_id: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("Bill", billSchema);
