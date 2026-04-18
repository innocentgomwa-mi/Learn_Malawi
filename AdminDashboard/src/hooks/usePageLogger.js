import { useEffect, useRef } from "react";
import { apiClient } from "@/api/apiClient";

/**
 * Drop this hook into any page/component to automatically log a visit event.
 * Usage: usePageLogger("page_visited", { resource_title: "Home Page" })
 */
export function usePageLogger(action = "resource_viewed", meta = {}) {
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;

    const run = async () => {
      const user = await apiClient.auth.me().catch(() => null);
      apiClient.entities.ActivityLog.create({
        user_email: user?.email || "anonymous",
        user_name: user?.full_name || "",
        user_role: user?.role || "student",
        action,
        ...meta,
      }).catch(() => {});
    };

    run();
  }, []);
}
