import mongoose from "mongoose";

// Immutable trail for SRS-required accountability: security gate entries,
// complaint status changes, and admin financial edits. Rows are write-once —
// no controller ever updates or deletes one, and the hooks below reject any
// attempt to do so at the Mongoose layer (query middleware AND document
// middleware, so both `Model.updateOne(...)` and `doc.save()` on an existing
// record are blocked). This is an ODM-level guarantee, not a database-level
// one — unlike MySQL's BEFORE UPDATE/DELETE triggers, it does not hold against
// a raw MongoDB driver call or a `mongosh` command that bypasses Mongoose
// entirely. A production deployment wanting the stronger guarantee would add
// collection-level permissions or a capped/append-only collection.
const UPDATE_BLOCKED = "audit_logs records are immutable and cannot be updated";
const DELETE_BLOCKED = "audit_logs records are immutable and cannot be deleted";

const auditLogSchema = new mongoose.Schema(
  {
    entity_type: { type: String, enum: ["GateEntry", "Complaint", "Bill"], required: true },
    entity_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    action: { type: String, required: true },
    performed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    performed_by_name: { type: String, default: null },
    performed_by_role: { type: String, default: null },
    before_value: { type: mongoose.Schema.Types.Mixed, default: null },
    after_value: { type: mongoose.Schema.Types.Mixed, default: null },
    description: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.pre("save", function (next) {
  if (!this.isNew) return next(new Error(UPDATE_BLOCKED));
  next();
});
auditLogSchema.pre(["updateOne", "updateMany", "findOneAndUpdate"], { document: false, query: true }, function (next) {
  next(new Error(UPDATE_BLOCKED));
});
auditLogSchema.pre("deleteOne", { document: true, query: false }, function (next) {
  next(new Error(DELETE_BLOCKED));
});
auditLogSchema.pre(["deleteOne", "deleteMany", "findOneAndDelete"], { document: false, query: true }, function (next) {
  next(new Error(DELETE_BLOCKED));
});

export default mongoose.model("AuditLog", auditLogSchema);
