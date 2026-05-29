import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { apiClient } from "@/api/apiClient";

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

const RESOURCE_DELETE_MAP = {
  study_notes: ({ id }) => apiClient.entities.StudyNote.delete(id),
  tutorial: ({ id }) => apiClient.entities.Tutorial.delete(id),
  past_paper: ({ id }) => apiClient.entities.PastPaper.delete(id),
  quiz: ({ id }) => apiClient.entities.Quiz.delete(id),
  career_resource: ({ id }) => apiClient.entities.CareerResource.delete(id),
};

const normalizeResource = (item, type) => ({
  id: `${type}-${item.id}`,
  originalId: item.id,
  title: item.title || item.name || `${TYPE_LABELS[type] || type} resource`,
  subject: item.subject || 'General',
  level: item.level || item.class || item.grade || 'All levels',
  author: item.teacher_name || item.teacherEmail || item.teacher_email || item.author_name || item.author_email || 'Teacher',
  teacherEmail: item.teacherEmail || item.teacher_email || item.author_email || item.authorEmail || null,
  resourceType: type,
  typeLabel: TYPE_LABELS[type] || type,
  description: item.description || item.summary || item.content || '',
  resourceUrl: item.videoUrl || item.paperUrl || item.fileUrl || item.video_url || item.file_url || '',
  publishedAt: item.createdAt || item.created_date || item.createdDate || null,
});

export default function PostApprovals() {
  const [filterType, setFilterType] = useState("all");
  const [selectedPost, setSelectedPost] = useState(null);
  const queryClient = useQueryClient();

  const deleteResourceMutation = useMutation({
    mutationFn: async (resource) => {
      const deleteFn = RESOURCE_DELETE_MAP[resource.resourceType];
      if (!deleteFn) {
        throw new Error(`Delete not supported for resource type: ${resource.resourceType}`);
      }
      return deleteFn({ id: resource.originalId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["published-resources"]);
      toast({
        title: "Resource deleted",
        description: "The published resource has been removed successfully.",
        duration: 5000,
      });
      setSelectedPost(null);
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error?.message || 'Unable to delete this resource.',
      });
    },
  });

  const confirmResourceDeletion = (resource) => {
    if (!resource) return;

    const confirmToast = toast({
      title: "Confirm deletion",
      description: `Delete \"${resource.title}\" permanently?`,
      duration: 0,
      action: (
        <ToastAction
          className="bg-white text-sky-700 hover:bg-slate-100"
          onClick={() => {
            deleteResourceMutation.mutate(resource);
            confirmToast.dismiss();
          }}
        >
          Confirm
        </ToastAction>
      ),
    });
  };

  const { data: allResources = {}, isLoading } = useQuery({
    queryKey: ["published-resources"],
    queryFn: async () => {
      const [studyNotes, tutorials, pastPapers, quizzes, careerResources] = await Promise.all([
        apiClient.entities.StudyNote.list(),
        apiClient.entities.Tutorial.list(),
        apiClient.entities.PastPaper.list(),
        apiClient.entities.Quiz.list(),
        apiClient.entities.CareerResource.list(),
      ]);
      return { studyNotes, tutorials, pastPapers, quizzes, careerResources };
    },
  });

  const resources = [
    ...(Array.isArray(allResources.studyNotes) ? allResources.studyNotes.map((item) => normalizeResource(item, 'study_notes')) : []),
    ...(Array.isArray(allResources.tutorials) ? allResources.tutorials.map((item) => normalizeResource(item, 'tutorial')) : []),
    ...(Array.isArray(allResources.pastPapers) ? allResources.pastPapers.map((item) => normalizeResource(item, 'past_paper')) : []),
    ...(Array.isArray(allResources.quizzes) ? allResources.quizzes.map((item) => normalizeResource(item, 'quiz')) : []),
    ...(Array.isArray(allResources.careerResources) ? allResources.careerResources.map((item) => normalizeResource(item, 'career_resource')) : []),
  ];

  const filtered = filterType === "all"
    ? resources
    : resources.filter((resource) => resource.resourceType === filterType);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Published Resources</h2>
          <p className="text-sm text-gray-500 mt-0.5">All published teacher resources across study notes, tutorials, quizzes, past papers and career content.</p>
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
          {Array.from(new Set(resources.map((resource) => resource.teacherEmail).filter(Boolean))).length} teachers
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
          {filtered.map((resource) => (
            <Card key={resource.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-sm">{resource.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium border border-emerald-200 bg-emerald-100 text-emerald-700">
                        Published
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">{resource.subject}</Badge>
                      <Badge variant="outline" className="text-xs">{resource.level}</Badge>
                      <Badge variant="outline" className="text-xs">{resource.typeLabel}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Published by <span className="font-medium">{resource.author}</span></p>
                    {resource.teacherEmail && (
                      <p className="text-xs text-gray-500">{resource.teacherEmail}</p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => setSelectedPost(resource)}>
                      <Eye className="w-3.5 h-3.5 mr-1" /> View
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => confirmResourceDeletion(resource)}
                      disabled={deleteResourceMutation.isLoading}
                    >
                      Delete
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
                <div><span className="text-gray-500">Type:</span> <span className="font-medium">{selectedPost.typeLabel}</span></div>
                <div><span className="text-gray-500">Teacher:</span> <span className="font-medium">{selectedPost.author}</span></div>
                {selectedPost.publishedAt && (
                  <div><span className="text-gray-500">Published:</span> <span className="font-medium">{new Date(selectedPost.publishedAt).toLocaleDateString()}</span></div>
                )}
                {selectedPost.teacherEmail && (
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedPost.teacherEmail}</span></div>
                )}
              </div>
              {(selectedPost.description || selectedPost.resourceUrl) && (
                <div className="space-y-3">
                  {selectedPost.description && (
                    <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedPost.description}
                    </div>
                  )}
                  {selectedPost.resourceUrl && (
                    <a href={selectedPost.resourceUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 text-sm hover:underline">
                      <FileText className="w-4 h-4" /> Open resource
                    </a>
                  )}
                </div>
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
