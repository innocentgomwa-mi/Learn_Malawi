import { apiClient } from "@/api/apiClient";

/**
 * Central audit logger — records every admin action with before/after snapshots.
 */
export async function auditLog({ action, entity_type, entity_id = "", before = null, after = null, notes = "" }) {
  const user = await apiClient.auth.me().catch(() => null);
  apiClient.entities.DataChangeHistory.create({
    entity_type,
    entity_id,
    action,
    performed_by_email: user?.email || "unknown",
    performed_by_name: user?.full_name || "",
    before_data: before ? JSON.stringify(before) : "",
    after_data: after ? JSON.stringify(after) : "",
    notes,
  }).catch(() => {});

  // Also log to ActivityLog
  apiClient.entities.ActivityLog.create({
    user_email: user?.email || "unknown",
    user_name: user?.full_name || "",
    user_role: "admin",
    action: "login", // reuse as generic admin_action
    resource_title: `${action} on ${entity_type}`,
    metadata: JSON.stringify({ entity_id, notes }),
  }).catch(() => {});
}
