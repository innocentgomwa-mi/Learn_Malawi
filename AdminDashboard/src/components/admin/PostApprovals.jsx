import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, FileText, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const TYPE_LABELS = {
  study_notes: "Study Notes",
  past_paper: "Past Paper",
  tutorial: "Tutorial",
  quiz: "Quiz",
  career_resource: "Career Resource",
};

export default function PostApprovals() {
  const [filterType, setFilterType] = useState("all");
  const [selectedPost, setSelectedPost] = useState(null);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["published-resources"],
    queryFn: () => apiClient.entities.TeacherPost.filter({ status: "approved" }),
  });

  const filtered = filterType === "all"
    ? resources
    : resources.filter((resource) => resource.content_type === filterType);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Published Resources</h2>
          <p className="text-sm text-gray-500 mt-0.5">All approved resources published by teachers, with author attribution.</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              <SelectItem value="study_notes">Study Notes</SelectItem>
              <SelectItem value="past_paper">Past Papers</SelectItem>
              <SelectItem value="tutorial">Tutorials</SelectItem>
              <SelectItem value="quiz">Quizzes</SelectItem>
              <SelectItem value="career_resource">Career Resources</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Count chips */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs px-3 py-1 rounded-full font-medium border border-slate-200 bg-slate-50 text-slate-700">
          {resources.length} published resource{resources.length === 1 ? '' : 's'}
        </span>
        <span className="text-xs px-3 py-1 rounded-full font-medium border border-slate-200 bg-slate-50 text-slate-700">
          {Array.from(new Set(resources.map((post) => post.author_email || post.teacher_email))).length} teachers
        </span>
      </div>

      {/* Posts list */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading published resources...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No published resources found for this filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => (
            <Card key={post.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-sm">{post.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium border border-emerald-200 bg-emerald-100 text-emerald-700">
                        Published
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">{post.subject}</Badge>
                      <Badge variant="outline" className="text-xs">{post.level}</Badge>
                      <Badge variant="outline" className="text-xs">{TYPE_LABELS[post.content_type] || post.content_type}</Badge>
                      {post.form_standard && <Badge variant="outline" className="text-xs">{post.form_standard}</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Published by <span className="font-medium">{post.author_name || post.teacher_name || post.author_email || post.teacher_email || 'Unknown'}</span></p>
                    {(post.author_email || post.teacher_email) && (
                      <p className="text-xs text-gray-500">{post.author_email || post.teacher_email}</p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => setSelectedPost(post)}>
                      <Eye className="w-3.5 h-3.5 mr-1" /> View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Subject:</span> <span className="font-medium">{selectedPost.subject}</span></div>
                <div><span className="text-gray-500">Level:</span> <span className="font-medium">{selectedPost.level}</span></div>
                <div><span className="text-gray-500">Type:</span> <span className="font-medium">{TYPE_LABELS[selectedPost.content_type]}</span></div>
                <div><span className="text-gray-500">Form/Standard:</span> <span className="font-medium">{selectedPost.form_standard || "N/A"}</span></div>
                <div><span className="text-gray-500">Teacher:</span> <span className="font-medium">{selectedPost.teacher_name || "N/A"}</span></div>
                <div><span className="text-gray-500">Status:</span>
                  <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-medium border ${STATUS_COLORS[selectedPost.status]}`}>
                    {selectedPost.status}
                  </span>
                </div>
              </div>
              {selectedPost.content && (
                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedPost.content}
                </div>
              )}
              {selectedPost.file_url && (
                <a href={selectedPost.file_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 text-sm hover:underline">
                  <FileText className="w-4 h-4" /> View attached file
                </a>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedPost(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
