import { Shield, Users, GraduationCap, BookOpen } from "lucide-react";

const roles = [
  { name: "Admin", icon: Shield, color: "text-red-500", permissions: ["Full platform access", "Manage all users", "System settings", "View all logs", "Approve/reject content"] },
  { name: "Teacher", icon: BookOpen, color: "text-blue-500", permissions: ["Create/edit study resources", "Manage own students", "Create quizzes & learning paths", "View class analytics", "Post announcements"] },
  { name: "Student", icon: GraduationCap, color: "text-green-500", permissions: ["View all resources", "Take quizzes", "Join study groups", "Track own progress", "Participate in discussions"] },
];

export default function RolesPermissions() {
  return (
    <div className="p-6 max-w-4xl">
      <h2 className="text-xl font-semibold mb-2">Roles & Permissions</h2>
      <p className="text-sm text-muted-foreground mb-6">Overview of what each role can do on the platform.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map(({ name, icon: Icon, color, permissions }) => (
          <div key={name} className="border rounded-lg p-5 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Icon className={`w-5 h-5 ${color}`} />
              <h3 className="font-semibold text-lg">{name}</h3>
            </div>
            <ul className="space-y-2">
              {permissions.map(p => (
                <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-0.5 text-green-500">✓</span>{p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
