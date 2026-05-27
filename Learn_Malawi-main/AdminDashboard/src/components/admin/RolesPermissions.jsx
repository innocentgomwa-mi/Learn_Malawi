import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Crown, User, GraduationCap, AlertTriangle, CheckCircle } from "lucide-react";
import { apiClient } from "@/api/apiClient";
import { auditLog } from "@/lib/auditLogger";

const ROLE_INFO = {
  Admin: { icon: Crown, color: "bg-purple-100 text-purple-700 border-purple-200", label: "Administrator", perms: ["Full platform access", "Approve/reject posts", "Manage users", "View audit logs", "System settings", "Maintenance mode"] },
  Teacher: { icon: GraduationCap, color: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Teacher", perms: ["Submit resources", "View own posts", "View approved content"] },
  Student: { icon: User, color: "bg-slate-100 text-slate-700 border-slate-200", label: "Student", perms: ["Browse resources", "Take quizzes", "View progress", "Rate resources"] },
};

export default function RolesPermissions() {
  const qc = useQueryClient();
  const [pendingChange, setPendingChange] = useState(null); // { userId, newRole }
  const [confirmed, setConfirmed] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ["all-users-roles"],
    queryFn: () => apiClient.entities.User.list(),
  });

  const changeRole = useMutation({
    mutationFn: async ({ userId, newRole, oldRole, userEmail }) => {
      await apiClient.entities.User.update(userId, { role: newRole });
      await auditLog({ action: "role_change", entity_type: "User", entity_id: userId, before: { role: oldRole }, after: { role: newRole }, notes: `Role changed for ${userEmail}` });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["all-users-roles"] }); setPendingChange(null); setConfirmed(false); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Roles & Permissions</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage what each role can do and assign roles to users</p>
      </div>

      {/* Role matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(ROLE_INFO).map(([role, { icon: Icon, color, label, perms }]) => (
          <Card key={role} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${color}`}><Icon className="w-4 h-4" /></div>
                <Badge variant="outline" className={color}>{label}</Badge>
              </div>
              <ul className="space-y-1.5">
                {perms.map(p => (
                  <li key={p} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User role assignments */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" /> User Role Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No users found</p>
          ) : (
            <div className="space-y-2">
              {users.map(user => {
                const roleInfo = ROLE_INFO[user.role] || ROLE_INFO.Student;
                const Icon = roleInfo.icon;
                return (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${roleInfo.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user.full_name || user.email}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={roleInfo.color}>{user.role || "Student"}</Badge>
                      <select
                        className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white"
                        value={user.role || "Student"}
                        onChange={e => setPendingChange({ userId: user.id, newRole: e.target.value, oldRole: user.role, userEmail: user.email })}
                      >
                        <option value="Student">Student</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation modal for role change */}
      {pendingChange && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Confirm Role Change</p>
                  <p className="text-xs text-gray-500">This action will be recorded in the audit log</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Change role for <strong>{pendingChange.userEmail}</strong> from <Badge variant="outline">{pendingChange.oldRole || "Student"}</Badge> to <Badge variant="outline">{pendingChange.newRole}</Badge>?
              </p>
              <label className="flex items-center gap-2 text-sm text-gray-600 mb-4 cursor-pointer">
                <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="rounded" />
                I confirm this role change is authorised
              </label>
              <div className="flex gap-2">
                <Button onClick={() => changeRole.mutate(pendingChange)} disabled={!confirmed || changeRole.isPending} className="flex-1">
                  {changeRole.isPending ? "Applying..." : "Apply Change"}
                </Button>
                <Button variant="outline" onClick={() => { setPendingChange(null); setConfirmed(false); }} className="flex-1">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
