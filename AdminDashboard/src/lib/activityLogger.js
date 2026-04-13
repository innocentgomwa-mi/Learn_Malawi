import { apiClient } from "@/api/apiClient";

/**
 * Central activity logger for Learn Malawi.
 * Call this throughout the app to track important user actions.
 */
export async function logActivity({
  action,
  user_email,
  user_name = "",
  user_role = "student",
  resource_id = "",
  resource_title = "",
  subject = "",
  level = "",
  score = null,
  metadata = null,
}) {
  const record = {
    user_email,
    user_name,
    user_role,
    action,
    resource_id,
    resource_title,
    subject,
    level,
    ...(score !== null && { score }),
    ...(metadata && { metadata: JSON.stringify(metadata) }),
  };

  // Fire-and-forget — don't block UI
  apiClient.entities.ActivityLog.create(record).catch(() => {});
}
