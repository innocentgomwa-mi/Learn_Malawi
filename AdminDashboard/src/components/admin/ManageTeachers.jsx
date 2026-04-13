import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Plus, Search, CheckCircle, Ban, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const STATUS_COLORS = {
  active: "bg-green-100 text-green-700",
  suspended: "bg-red-100 text-red-700",
  pending_verification: "bg-amber-100 text-amber-700",
};

const SUBJECTS = ["Mathematics", "English", "Science", "Social Studies", "Chichewa", "Biology", "Chemistry", "Physics", "History", "Geography", "Agriculture", "Computer Studies", "Religious Education"];

export default function ManageTeachers() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", school: "", district: "", status: "active" });
  const qc = useQueryClient();

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => apiClient.entities.Teacher.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.entities.Teacher.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teachers"] }); setShowAdd(false); setForm({ full_name: "", email: "", school: "", district: "", status: "active" }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.entities.Teacher.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.entities.Teacher.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });

  const filtered = teachers.filter(t =>
    t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.school?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Teachers</h2>
          <p className="text-sm text-gray-500 mt-0.5">{teachers.length} registered teachers</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-blue-700 hover:bg-blue-800">
          <Plus className="w-4 h-4 mr-1" /> Add Teacher
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search teachers by name, email or school..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading teachers...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No teachers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(teacher => (
            <Card key={teacher.id} className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{teacher.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{teacher.email}</p>
                      {teacher.school && <p className="text-xs text-gray-400">{teacher.school}{teacher.district ? `, ${teacher.district}` : ""}</p>}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[teacher.status]}`}>
                    {teacher.status === "pending_verification" ? "Pending" : teacher.status}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>{teacher.posts_submitted || 0} submitted</span>
                    <span>{teacher.posts_approved || 0} approved</span>
                  </div>
                  <div className="flex gap-1">
                    {teacher.status !== "active" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => updateMutation.mutate({ id: teacher.id, data: { status: "active" } })}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Activate
                      </Button>
                    )}
                    {teacher.status === "active" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
                        onClick={() => updateMutation.mutate({ id: teacher.id, data: { status: "suspended" } })}>
                        <Ban className="w-3 h-3 mr-1" /> Suspend
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => deleteMutation.mutate(teacher.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Teacher Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[["Full Name", "full_name", "text"], ["Email", "email", "email"], ["School", "school", "text"], ["District", "district", "text"]].map(([label, key, type]) => (
              <div key={key}>
                <Label className="text-sm">{label}</Label>
                <Input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="mt-1" />
              </div>
            ))}
            <div>
              <Label className="text-sm">Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending_verification">Pending Verification</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button className="bg-blue-700 hover:bg-blue-800" onClick={() => createMutation.mutate(form)} disabled={!form.full_name || !form.email}>
              Add Teacher
            </Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
