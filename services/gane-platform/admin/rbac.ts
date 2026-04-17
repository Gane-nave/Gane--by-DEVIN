export type Role = "viewer" | "operator" | "admin" | "sre" | "super_admin";

const rolePermissions: Record<Role, readonly string[]> = {
  viewer: ["read"],
  operator: ["read", "execute"],
  admin: ["read", "execute", "write"],
  sre: ["read", "execute", "write", "deploy"],
  super_admin: ["*"],
};

export function checkPermission(role: Role, action: string): boolean {
  if (role === "super_admin") return true;
  return rolePermissions[role].includes(action);
}
