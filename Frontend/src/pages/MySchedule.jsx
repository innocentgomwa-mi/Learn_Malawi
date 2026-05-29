import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Plus, Bell, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklyTimetable from "@/components/schedule/WeeklyTimetable";
import StudyBlockForm from "@/components/schedule/StudyBlockForm";
import ResourceList from "@/components/schedule/ResourceList";
import ResourceForm from "@/components/schedule/ResourceForm";
import ExamTracker from "@/components/schedule/ExamTracker";
import ExamForm from "@/components/schedule/ExamForm";
import ResourcePageHero from "@/components/ResourcePageHero";
import {
  PAGE_WRAP,
  SPINNER_CLASS,
  YELLOW_BUTTON_MD,
  CARD_CLASS,
} from "@/lib/resourcePageStyles";
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
} from "@/api";

/**
 * @typedef {{ id?: string; title?: string; day_of_week?: string; start_time?: string; end_time?: string; subject?: string; color?: string; resource_ids?: string[]; notes?: string }} StudyBlockDraft
 * @typedef {{ id?: string; name?: string; description?: string }} ResourceDraft
 * @typedef {{ id?: string; title?: string; subject?: string; exam_date?: string; location?: string; notify_days_before?: number[]; notes?: string; color?: string }} ExamDraft
 */

export default function MySchedule() {
  const queryClient = useQueryClient();
  const [blockFormOpen, setBlockFormOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(/** @type {StudyBlockDraft | null} */ (null));
  const [defaultDay, setDefaultDay] = useState("Monday");
  const [saveNotice, setSaveNotice] = useState("");
  const defaultDraftBlock = useMemo(() => ({ day_of_week: defaultDay }), [defaultDay]);

  const [resourceFormOpen, setResourceFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(/** @type {ResourceDraft | null} */ (null));

  const [examFormOpen, setExamFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(/** @type {ExamDraft | null} */ (null));

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

  const showNotice = (message) => {
    setSaveNotice(message);
    setTimeout(() => setSaveNotice(""), 5000);
  };

  const blockMutation = useMutation({
    mutationFn: /** @param {{ id?: string; data: any }} params */ ({ id, data }) =>
      id ? updateStudyBlock(id, data) : createStudyBlock(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["studyBlocks"] });
      setBlockFormOpen(false);
      setEditingBlock(null);
      if (!variables.id) {
        showNotice("Study block saved. Check your email and Notifications for confirmation.");
      }
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      setExamFormOpen(false);
      setEditingExam(null);
      showNotice(
        variables.id
          ? "Exam updated. Reminder emails will follow your notify settings."
          : "Exam scheduled. Email reminders are enabled — see Notifications.",
      );
    },
  });

  const deleteExamMutation = useMutation({
    mutationFn: /** @param {string} id */ (id) => deleteExam(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });

  const handleAddBlock = (day) => {
    setDefaultDay(day);
    setEditingBlock(null);
    setBlockFormOpen(true);
  };

  const handleEditBlock = (block) => {
    setEditingBlock(block);
    setBlockFormOpen(true);
  };

  const handleSaveBlock = (data) => {
    blockMutation.mutate({ id: editingBlock?.id, data });
  };

  const handleSaveResource = (data) => {
    resourceMutation.mutate({ id: editingResource?.id, data });
  };

  const handleSaveExam = (data) => {
    examMutation.mutate({ id: editingExam?.id, data });
  };

  const isLoading = loadingBlocks || loadingResources || loadingExams;
  const upcomingExams = (exams || []).filter((e) => e.exam_date && new Date(e.exam_date) >= new Date()).length;

  if (isLoading) {
    return (
      <div className={`${PAGE_WRAP} flex justify-center py-24`}>
        <div className={SPINNER_CLASS} />
      </div>
    );
  }

  return (
    <div className={PAGE_WRAP}>
      <ResourcePageHero
        icon={CalendarDays}
        title="My Schedule"
        subtitle="Plan your study week, track exams, and get email plus in-app reminders before important dates."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-sm font-medium text-blue-950">
          {blocks.length} study blocks
        </span>
        <span className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-900">
          {upcomingExams} upcoming exams
        </span>
        <Link
          to="/notifications"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          <Bell className="h-4 w-4" />
          View notifications
        </Link>
      </div>

      <div className={`${CARD_CLASS} mb-6 flex flex-col gap-3 border-yellow-200/80 bg-gradient-to-r from-blue-50/80 to-yellow-50/50 p-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-blue-950">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-950">Email & in-app reminders</p>
            <p className="text-xs text-blue-900/70">
              Exams send reminder emails on the days you choose (e.g. 1 and 7 days before). Study blocks and exams
              also appear on your Notifications page.
            </p>
          </div>
        </div>
        <button type="button" onClick={() => handleAddBlock("Monday")} className={YELLOW_BUTTON_MD}>
          <Plus className="h-4 w-4" />
          Add study block
        </button>
      </div>

      {saveNotice && (
        <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm font-medium text-blue-950">
          {saveNotice}
        </div>
      )}

      <Tabs defaultValue="timetable" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl border border-blue-200 bg-blue-50/50 p-1">
          <TabsTrigger
            value="timetable"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-yellow-400 data-[state=active]:text-blue-950"
          >
            <CalendarDays className="mr-1.5 inline h-3.5 w-3.5" />
            Weekly timetable
          </TabsTrigger>
          <TabsTrigger
            value="exams"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-yellow-400 data-[state=active]:text-blue-950"
          >
            Exams & resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timetable">
          <WeeklyTimetable
            blocks={blocks}
            resources={resources}
            onAddBlock={handleAddBlock}
            onEditBlock={handleEditBlock}
            onDeleteBlock={(id) => deleteBlockMutation.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="exams">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ExamTracker
              exams={exams}
              onAdd={() => {
                setEditingExam(null);
                setExamFormOpen(true);
              }}
              onEdit={(exam) => {
                setEditingExam(exam);
                setExamFormOpen(true);
              }}
              onDelete={(id) => deleteExamMutation.mutate(id)}
            />
            <ResourceList
              resources={resources}
              onAdd={() => {
                setEditingResource(null);
                setResourceFormOpen(true);
              }}
              onEdit={(r) => {
                setEditingResource(r);
                setResourceFormOpen(true);
              }}
              onDelete={(id) => deleteResourceMutation.mutate(id)}
            />
          </div>
        </TabsContent>
      </Tabs>

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
