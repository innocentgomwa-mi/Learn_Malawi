import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const PRIORITY_COLORS = { low: "bg-gray-100 text-gray-600", normal: "bg-blue-100 text-blue-700", high: "bg-red-100 text-red-700" };
const AUDIENCE_COLORS = { all: "bg-purple-100 text-purple-700", students: "bg-green-100 text-green-700", teachers: "bg-amber-100 text-amber-700" };

export default function ManageAnnouncements() {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", target_audience: "all", priority: "normal", is_published: false });
  const qc = useQueryClient();

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => apiClient.entities.Announcement.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.entities.Announcement.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["announcements"] }); setShowAdd(false); setForm({ title: "", message: "", target_audience: "all", priority: "normal", is_published: false }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.entities.Announcement.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.entities.Announcement.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });

  const published = announcements.filter(a => a.is_published);
  const drafts = announcements.filter(a => !a.is_published);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
          <p className="text-sm text-gray-500 mt-0.5">{published.length} published · {drafts.length} drafts</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-blue-700 hover:bg-blue-800">
          <Plus className="w-4 h-4 mr-1" /> New Announcement
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(ann => (
            <Card key={ann.id} className={`border shadow-sm ${ann.is_published ? "border-slate-200 bg-slate-50/30" : "border-gray-200"}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-sm">{ann.title}</h3>
                      {ann.is_published ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Published</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">Draft</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ann.message}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${AUDIENCE_COLORS[ann.target_audience]}`}>
                        {ann.target_audience}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[ann.priority]}`}>
                        {ann.priority} priority
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="outline" className="h-8"
                      onClick={() => updateMutation.mutate({ id: ann.id, data: { is_published: !ann.is_published } })}>
                      {ann.is_published ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
                      {ann.is_published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:bg-red-50"
                      onClick={() => deleteMutation.mutate(ann.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Announcement Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Announcement</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1" placeholder="Announcement title..." />
            </div>
            <div>
              <Label className="text-sm">Message</Label>
              <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="mt-1" rows={4} placeholder="Write your announcement..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Target Audience</Label>
                <Select value={form.target_audience} onValueChange={v => setForm(f => ({ ...f, target_audience: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="teachers">Teachers Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="publish-now"
                checked={form.is_published}
                onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="publish-now" className="text-sm cursor-pointer">Publish immediately</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button className="bg-blue-700 hover:bg-blue-800" onClick={() => createMutation.mutate(form)} disabled={!form.title || !form.message}>
              {form.is_published ? "Publish" : "Save as Draft"}
            </Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
