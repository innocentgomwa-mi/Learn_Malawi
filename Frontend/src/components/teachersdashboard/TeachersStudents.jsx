import { useState, useEffect } from 'react';
import { Users, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { fetchStudyGroups, updateStudyGroup, createAnnouncement } from '@/api';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function TeacherStudents() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [dialog, setDialog] = useState(null);

  const loadStudents = async () => {
    if (!user?.email) {
      setGroups([]);
      setStudents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetchStudyGroups({ teacherEmail: user.email });
      const items = Array.isArray(response) ? response : response?.data ?? [];
      const myGroups = items.filter((group) => group.mentor_email === user.email);
      setGroups(myGroups);

      const map = new Map();

      myGroups.forEach((group) => {
        const bannedMembers = group.banned_members || [];
        const memberEmails = group.members || [];

        bannedMembers.forEach((email) => {
          if (!email) return;
          const student = map.get(email) ?? { email, groups: [], bannedGroups: [] };
          if (!student.bannedGroups.some((entry) => entry.groupId === group.id)) {
            student.bannedGroups.push({ groupId: group.id, groupName: group.name });
          }
          map.set(email, student);
        });

        memberEmails.forEach((email) => {
          if (!email || bannedMembers.includes(email)) return;
          const student = map.get(email) ?? { email, groups: [], bannedGroups: [] };
          if (!student.groups.some((entry) => entry.groupId === group.id)) {
            student.groups.push({ groupId: group.id, groupName: group.name });
          }
          map.set(email, student);
        });
      });

      setStudents(Array.from(map.values()));
    } catch (error) {
      console.error(error);
      setGroups([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    if (!active) return;
    loadStudents();
    return () => {
      active = false;
    };
  }, [user?.email]);

  const handleRemoveStudent = (groupId, studentEmail, groupName) => {
    setDialog({
      title: 'Remove student',
      message: `Remove ${studentEmail} from ${groupName}? They will be banned from rejoining.`,
      confirmLabel: 'Remove',
      danger: true,
      onConfirm: async () => {
        setProcessing(true);
        try {
          const group = groups.find((item) => item.id === groupId);
          if (!group) return;
          const updatedMembers = (group.members || []).filter((email) => email !== studentEmail);
          const updatedBanned = Array.from(new Set([...(group.banned_members || []), studentEmail]));
          await updateStudyGroup(groupId, { members: updatedMembers, banned_members: updatedBanned });
          await createAnnouncement({
            title: `Removed from ${group.name}`,
            body: `${studentEmail} has been removed from the study group "${group.name}".`,
            targetAudience: 'students',
            isPublished: true,
          });
        } catch (error) {
          console.error(error);
          alert('Unable to remove student. Please try again.');
        } finally {
          setProcessing(false);
          await loadStudents();
        }
      },
    });
  };

  return (
    <>
      <div className="w-full px-6 py-8 animate-fade-in">
      <div className="w-full space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-muted-foreground text-sm mt-1">Students registered in your study groups appear below.</p>
        </div>

      {loading ? (
        <div className="text-center py-24 text-muted-foreground">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
          <p>Loading students…</p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <Users className="w-14 h-14 mx-auto mb-4 opacity-25" />
          <p className="font-medium">No students enrolled yet</p>
          <p className="text-sm mt-1">Students will appear here after they join one of your study groups.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {students.map((student) => (
            <div key={student.email} className="border border-border rounded-[1.75rem] p-6 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">{student.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {student.groups.length} active group{student.groups.length === 1 ? '' : 's'}
                    {student.bannedGroups.length > 0 && ` · ${student.bannedGroups.length} banned`}
                  </p>
                </div>
                <div className="text-xs uppercase tracking-wide text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                  Active
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                {student.groups.map((group) => (
                  <div key={`${student.email}-${group.groupId}`} className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3 py-2 text-sm text-foreground">
                    <span>{group.groupName}</span>
                    <button
                      type="button"
                      disabled={processing}
                      onClick={() => handleRemoveStudent(group.groupId, student.email, group.groupName)}
                      className="inline-flex items-center gap-2 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                ))}

                {student.bannedGroups.map((group) => (
                  <div key={`${student.email}-banned-${group.groupId}`} className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    Removed from {group.groupName}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
    <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />
    </>
  );
}
