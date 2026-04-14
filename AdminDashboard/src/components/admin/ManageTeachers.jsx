import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Plus, Search, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { apiClient } from "@/api/apiClient";

const LEVEL_COLORS = {
  PSLC: "bg-blue-100 text-blue-700",
  JCE: "bg-purple-100 text-purple-700",
  MSCE: "bg-green-100 text-green-700",
};

const getTeacherName = (teacher) =>
  teacher.full_name || [teacher.firstName, teacher.lastName].filter(Boolean).join(' ') || teacher.email;

export default function ManageTeachers() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", school: "", level: "JCE", password: "" });
  const qc = useQueryClient();

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => apiClient.entities.Teacher.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.entities.Teacher.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers"] });
      setShowAdd(false);
      setForm({ firstName: "", lastName: "", email: "", school: "", level: "JCE", password: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.entities.Teacher.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });

  const filtered = teachers.filter((teacher) => {
    const name = getTeacherName(teacher).toLowerCase();
    return (
      name.includes(search.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(search.toLowerCase()) ||
      teacher.school?.toLowerCase().includes(search.toLowerCase())
    );
  });

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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search teachers by name, email or school..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
          {filtered.map((teacher) => (
            <Card key={teacher.id} className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{getTeacherName(teacher)}</p>
                      <p className="text-xs text-gray-500 truncate">{teacher.email}</p>
                      {teacher.school && (
                        <p className="text-xs text-gray-400">
                          {teacher.school}{teacher.level ? ` · ${teacher.level}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-slate-100 text-slate-700">
                    Teacher
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>{teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : "Joined"}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${LEVEL_COLORS[teacher.level] || "bg-slate-100 text-slate-600"}`}>
                      {teacher.level || "Level not set"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => deleteMutation.mutate(teacher.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[
              ["First Name", "firstName", "text"],
              ["Last Name", "lastName", "text"],
              ["Email", "email", "email"],
              ["Password", "password", "password"],
              ["School", "school", "text"],
            ].map(([label, key, type]) => (
              <div key={key}>
                <Label className="text-sm">{label}</Label>
                <Input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="mt-1"
                />
              </div>
            ))}
            <div>
              <Label className="text-sm">Level</Label>
              <Select value={form.level} onValueChange={(v) => setForm((f) => ({ ...f, level: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PSLC">PSLC</SelectItem>
                  <SelectItem value="JCE">JCE</SelectItem>
                  <SelectItem value="MSCE">MSCE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              className="bg-blue-700 hover:bg-blue-800"
              onClick={() => createMutation.mutate(form)}
              disabled={!form.firstName || !form.lastName || !form.email || !form.password}
            >
              Add Teacher
            </Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
