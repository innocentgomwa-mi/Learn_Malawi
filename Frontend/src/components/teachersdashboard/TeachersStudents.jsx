import { Users } from 'lucide-react';

export default function TeacherStudents() {
  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <p className="text-muted-foreground text-sm mt-1">View and track student progress</p>
      </div>
      <div className="text-center py-24 text-muted-foreground">
        <Users className="w-14 h-14 mx-auto mb-4 opacity-25" />
        <p className="font-medium">No students enrolled yet</p>
        <p className="text-sm mt-1">Students will appear here once they enroll in your courses</p>
      </div>
    </div>
  );
}