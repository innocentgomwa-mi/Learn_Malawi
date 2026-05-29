import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, Plus, Trash2, Ban, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { apiClient } from "@/api/apiClient";

export default function ManageStudents() {
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", level: "JCE", school: "", district: "" });
  const [deleteStudent, setDeleteStudent] = useState(null);
  const qc = useQueryClient();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: () => apiClient.entities.Student.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.entities.Student.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["students"] }); setShowAdd(false); setForm({ firstName: "", lastName: "", email: "", password: "", level: "JCE", school: "", district: "" }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.entities.Student.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.entities.Student.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: "Student deleted",
        description: "The student and their associated progress records have been removed.",
      });
      setDeleteStudent(null);
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error?.message || "Unable to delete this student.",
      });
    },
  });

  const filtered = students.filter(s => {
    const studentName = s.full_name || [s.firstName, s.lastName].filter(Boolean).join(' ');
    const matchSearch = studentName?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.school?.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel === "all" || s.level === filterLevel;
    return matchSearch && matchLevel;
  });

  const levelColor = { PSLC: "bg-blue-100 text-blue-700", JCE: "bg-purple-100 text-purple-700", MSCE: "bg-green-100 text-green-700" };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Students</h2>
          <p className="text-sm text-gray-500 mt-0.5">{students.length} registered students</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-blue-700 hover:bg-blue-800">
          <Plus className="w-4 h-4 mr-1" /> Add Student
        </Button>
      </div>

      {/* Level summary */}
      <div className="flex gap-2 flex-wrap">
        {["PSLC", "JCE", "MSCE"].map(lvl => (
          <span key={lvl} className={`text-xs px-3 py-1 rounded-full font-medium ${levelColor[lvl]}`}>
            {lvl}: {students.filter(s => s.level === lvl).length}
          </span>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search students..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterLevel} onValueChange={setFilterLevel}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="PSLC">PSLC</SelectItem>
            <SelectItem value="JCE">JCE</SelectItem>
            <SelectItem value="MSCE">MSCE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading students...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No students found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Level</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">School</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(student => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{student.full_name || [student.firstName, student.lastName].filter(Boolean).join(' ') || student.email}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{student.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${levelColor[student.level] || "bg-gray-100 text-gray-600"}`}>
                      {student.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{student.school || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${student.is_active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {student.is_active !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-amber-500"
                        onClick={() => updateMutation.mutate({ id: student.id, data: { is_active: !student.is_active } })}>
                        {student.is_active !== false ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                        onClick={() => setDeleteStudent(student)}
                        disabled={deleteMutation.isLoading}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Student Dialog */}
      <Dialog open={!!deleteStudent} onOpenChange={() => setDeleteStudent(null)}>
        <DialogContent className="max-w-lg rounded-3xl bg-sky-600 text-white shadow-2xl ring-1 ring-sky-500/30">
          <DialogHeader>
            <DialogTitle>Confirm student deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3 text-sm">
            <p>
              Are you sure you want to delete <span className="font-semibold">{deleteStudent?.full_name || [deleteStudent?.firstName, deleteStudent?.lastName].filter(Boolean).join(' ') || deleteStudent?.email}</span>?
            </p>
            <p className="text-sky-100/90">
              Deleting a student will remove their account, progress records, schedule data, and any associated learning history permanently.
            </p>
          </div>
          <DialogDescription className="text-sm text-sky-100/80">
            This action cannot be undone. The student will lose access to the admin dashboard and progress data will be permanently removed.
          </DialogDescription>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-white/40 text-white hover:border-white hover:bg-white/10" onClick={() => setDeleteStudent(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-white text-sky-700 hover:bg-slate-100"
              onClick={() => deleteStudent && deleteMutation.mutate(deleteStudent.id)}
              disabled={deleteMutation.isLoading}
            >
              Delete student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[["First Name", "firstName", "text"], ["Last Name", "lastName", "text"], ["Email", "email", "email"], ["Password", "password", "password"], ["School", "school", "text"], ["District", "district", "text"]].map(([label, key, type]) => (
              <div key={key}>
                <Label className="text-sm">{label}</Label>
                <Input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="mt-1" />
              </div>
            ))}
            <div>
              <Label className="text-sm">Level</Label>
              <Select value={form.level} onValueChange={v => setForm(f => ({ ...f, level: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PSLC">PSLC</SelectItem>
                  <SelectItem value="JCE">JCE</SelectItem>
                  <SelectItem value="MSCE">MSCE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogDescription className="text-sm text-slate-500">
            Create a new student account with a temporary password, then ask the student to update it after signing in.
          </DialogDescription>
          <DialogFooter className="gap-2">
            <Button className="bg-blue-700 hover:bg-blue-800" onClick={() => createMutation.mutate(form)} disabled={!form.firstName || !form.lastName || !form.email || !form.password}>
              Add Student
            </Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
