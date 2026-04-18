import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Eye, FileText, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selectedPost, setSelectedPost] = useState(null);
  const [rejectDialogPost, setRejectDialogPost] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const qc = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => apiClient.entities.TeacherPost.list("-created_date", 100),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.entities.TeacherPost.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });

  const handleApprove = (post) => {
    updateMutation.mutate({ id: post.id, data: { status: "approved" } });
  };

  const handleReject = () => {
    if (!rejectDialogPost) return;
    updateMutation.mutate({
      id: rejectDialogPost.id,
      data: { status: "rejected", rejection_reason: rejectionReason },
    });
    setRejectDialogPost(null);
    setRejectionReason("");
  };

  const filtered = filterStatus === "all" ? posts : posts.filter(p => p.status === filterStatus);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Post Approvals</h2>
          <p className="text-sm text-gray-500 mt-0.5">Review and approve teacher-submitted content</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Count chips */}
      <div className="flex gap-2 flex-wrap">
        {["pending", "approved", "rejected"].map(s => (
          <span key={s} className={`text-xs px-3 py-1 rounded-full font-medium border ${STATUS_COLORS[s]}`}>
            {posts.filter(p => p.status === s).length} {s}
          </span>
        ))}
      </div>

      {/* Posts list */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading submissions...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No {filterStatus} posts found</p>
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
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${STATUS_COLORS[post.status]}`}>
                        {post.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">{post.subject}</Badge>
                      <Badge variant="outline" className="text-xs">{post.level}</Badge>
                      <Badge variant="outline" className="text-xs">{TYPE_LABELS[post.content_type] || post.content_type}</Badge>
                      {post.form_standard && <Badge variant="outline" className="text-xs">{post.form_standard}</Badge>}
                    </div>
                    {post.teacher_name && (
                      <p className="text-xs text-gray-500 mt-2">By: <span className="font-medium">{post.teacher_name}</span> · {post.teacher_email}</p>
                    )}
                    {post.rejection_reason && (
                      <p className="text-xs text-red-500 mt-1">Reason: {post.rejection_reason}</p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => setSelectedPost(post)}>
                      <Eye className="w-3.5 h-3.5 mr-1" /> View
                    </Button>
                    {post.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(post)}
                          disabled={updateMutation.isPending}
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setRejectDialogPost(post)}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      </>
                    )}
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
            {selectedPost?.status === "pending" && (
              <>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => { handleApprove(selectedPost); setSelectedPost(null); }}>
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button variant="destructive" onClick={() => { setRejectDialogPost(selectedPost); setSelectedPost(null); }}>
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setSelectedPost(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialogPost} onOpenChange={() => setRejectDialogPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Post</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Please provide a reason for rejecting <strong>{rejectDialogPost?.title}</strong>.</p>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            rows={3}
          />
          <DialogFooter className="gap-2">
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()}>
              Confirm Rejection
            </Button>
            <Button variant="outline" onClick={() => setRejectDialogPost(null)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
