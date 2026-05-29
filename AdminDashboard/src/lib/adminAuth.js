/** @param {{ role?: string } | null | undefined} user */
export function isAdminUser(user) {
  return String(user?.role ?? "").trim().toLowerCase() === "admin";
}
