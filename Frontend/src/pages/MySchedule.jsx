import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Plus, GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklyTimetable from "@/components/schedule/WeeklyTimetable";
import StudyBlockForm from "@/components/schedule/StudyBlockForm";
import ResourceList from "@/components/schedule/ResourceList";
import ResourceForm from "@/components/schedule/ResourceForm";
import ExamTracker from "@/components/schedule/ExamTracker";
import ExamForm from "@/components/schedule/ExamForm";
import {
  fetchStudyBlocks,
  createStudyBlock,
  updateStudyBlock,
  deleteStudyBlock,
  fetchResources,
  createResource,
  updateResource,
  deleteResource,
  fetchExams,
  createExam,
  updateExam,
  deleteExam,
} from '@/api';

/**
 * @typedef {{ id?: string; title?: string; day_of_week?: string; start_time?: string; end_time?: string; subject?: string; color?: string; resource_ids?: string[]; notes?: string }} StudyBlockDraft
 * @typedef {{ id?: string; name?: string; description?: string }} ResourceDraft
 * @typedef {{ id?: string; title?: string; subject?: string; exam_date?: string; location?: string; notify_days_before?: number[]; notes?: string; color?: string }} ExamDraft
 */

export default function MySchedule() {
  const queryClient = useQueryClient();

  // Dialog states
  const [blockFormOpen, setBlockFormOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(/** @type {StudyBlockDraft | null} */ (null));
  const [defaultDay, setDefaultDay] = useState("Monday");
  const defaultDraftBlock = useMemo(() => ({ day_of_week: defaultDay }), [defaultDay]);

  const [resourceFormOpen, setResourceFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(/** @type {ResourceDraft | null} */ (null));

  const [examFormOpen, setExamFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(/** @type {ExamDraft | null} */ (null));

  // Data queries
  const { data: blocks = [], isLoading: loadingBlocks } = useQuery({
    queryKey: ["studyBlocks"],
    queryFn: fetchStudyBlocks,
  });

  const { data: resources = [], isLoading: loadingResources } = useQuery({
    queryKey: ["resources"],
    queryFn: fetchResources,
  });

  const { data: exams = [], isLoading: loadingExams } = useQuery({
    queryKey: ["exams"],
    queryFn: fetchExams,
  });

  // Mutations
  const blockMutation = useMutation({
    mutationFn: /** @param {{ id?: string; data: any }} params */ ({ id, data }) =>
      id ? updateStudyBlock(id, data) : createStudyBlock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studyBlocks"] });
      setBlockFormOpen(false);
      setEditingBlock(null);
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: /** @param {string} id */ (id) => deleteStudyBlock(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studyBlocks"] }),
  });

  const resourceMutation = useMutation({
    mutationFn: /** @param {{ id?: string; data: any }} params */ ({ id, data }) =>
      id ? updateResource(id, data) : createResource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setResourceFormOpen(false);
      setEditingResource(null);
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: /** @param {string} id */ (id) => deleteResource(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resources"] }),
  });

  const examMutation = useMutation({
    mutationFn: /** @param {{ id?: string; data: any }} params */ ({ id, data }) =>
      id ? updateExam(id, data) : createExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      setExamFormOpen(false);
      setEditingExam(null);
    },
  });

  const deleteExamMutation = useMutation({
    mutationFn: /** @param {string} id */ (id) => deleteExam(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });

  // Handlers
  /** @param {string} day */
  const handleAddBlock = (day) => {
    setDefaultDay(day);
    setEditingBlock(null);
    setBlockFormOpen(true);
  };

  /** @param {StudyBlockDraft} block */
  const handleEditBlock = (block) => {
    setEditingBlock(block);
    setBlockFormOpen(true);
  };

  /** @param {any} data */
  const handleSaveBlock = (data) => {
    blockMutation.mutate({ id: editingBlock?.id, data });
  };

  /** @param {any} data */
  const handleSaveResource = (data) => {
    resourceMutation.mutate({ id: editingResource?.id, data });
  };

  /** @param {any} data */
  const handleSaveExam = (data) => {
    examMutation.mutate({ id: editingExam?.id, data });
  };

  const isLoading = loadingBlocks || loadingResources || loadingExams;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold">My Schedule</h1>
              <p className="text-xs text-muted-foreground">Plan your study week</p>
            </div>
          </div>
          <Button onClick={() => handleAddBlock("Monday")} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Block
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 py-6">
        <Tabs defaultValue="timetable" className="space-y-6">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="timetable" className="font-heading text-xs">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              Weekly Timetable
            </TabsTrigger>
            <TabsTrigger value="exams" className="font-heading text-xs">
              <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
              Exams & Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timetable">
            <WeeklyTimetable
              blocks={blocks}
              resources={resources}
              onAddBlock={handleAddBlock}
              onEditBlock={handleEditBlock}
              onDeleteBlock={/** @param {string} id */ (id) => deleteBlockMutation.mutate(id)}
            />
          </TabsContent>

          <TabsContent value="exams">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExamTracker
                exams={exams}
                onAdd={() => { setEditingExam(null); setExamFormOpen(true); }}
                onEdit={/** @param {ExamDraft} exam */ (exam) => { setEditingExam(exam); setExamFormOpen(true); }}
                onDelete={/** @param {string} id */ (id) => deleteExamMutation.mutate(id)}
              />
              <ResourceList
                resources={resources}
                onAdd={() => { setEditingResource(null); setResourceFormOpen(true); }}
                onEdit={/** @param {ResourceDraft} r */ (r) => { setEditingResource(r); setResourceFormOpen(true); }}
                onDelete={/** @param {string} id */ (id) => deleteResourceMutation.mutate(id)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <StudyBlockForm
        open={blockFormOpen}
        onOpenChange={setBlockFormOpen}
        block={editingBlock || (blockFormOpen ? defaultDraftBlock : null)}
        resources={resources}
        onSave={handleSaveBlock}
      />
      <ResourceForm
        open={resourceFormOpen}
        onOpenChange={setResourceFormOpen}
        resource={editingResource}
        onSave={handleSaveResource}
      />
      <ExamForm
        open={examFormOpen}
        onOpenChange={setExamFormOpen}
        exam={editingExam}
        onSave={handleSaveExam}
      />
    </div>
  );
}