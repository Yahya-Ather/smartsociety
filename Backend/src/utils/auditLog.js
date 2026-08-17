import AuditLog from "../models/AuditLog.js";

// Writes one immutable audit row. `actor` is the decoded JWT payload
// (req.user: {id, username, role}) — never null in practice since every
// audited action requires authMiddleware, but System-triggered writes (none
// yet) could pass null.
export async function recordAudit({ entityType, entityId, action, actor, before, after, description }) {
  await AuditLog.create({
    entity_type: entityType,
    entity_id: entityId,
    action,
    performed_by: actor?.id ?? null,
    performed_by_name: actor?.username ?? "System",
    performed_by_role: actor?.role ?? null,
    before_value: before ?? null,
    after_value: after ?? null,
    description,
  });
}
