// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInsights } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, ClipboardList, Clock, AlertTriangle, TrendingUp, BookOpen } from "lucide-react";
import StatsCard from "@/components/Insights/StatsCard";
import StudentDetailModal from "@/components/Insights/StudentDetailModal";
import StrugglingStudents from "@/components/teacher/StrugglingStudents";
import WeakTopics from "@/components/teacher/WeakTopic";
import ClassProgressTable from "@/components/teacher/ClassProgressTable";
import SubjectInsights from "@/components/teacher/SubjectInsight";
import QuizPerformanceTable from "@/components/Insights/QuizPerformanceTable";

export default function Insight() {
  const [levelFilter, setLevelFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data = {} } = useQuery({
    queryKey: ["insights", levelFilter, subjectFilter],
    queryFn: () => fetchInsights({
      limit: 300,
      level: levelFilter !== "all" ? levelFilter : undefined,
      subject: subjectFilter !== "all" ? subjectFilter : undefined,
    }),
    staleTime: 1000 * 60,
    retry: 1,
  });

  const activities = data.activities || [];
  const quizAttempts = data.quizAttempts || [];
  const allSubjects = data.subjects || [];
  const summary = data.summary || {};
  const uniqueStudents = summary.uniqueStudents || 0;
  const totalAttempts = summary.totalAttempts || 0;
  const avgScore = summary.avgScore || 0;
  const passRate = summary.passRate || 0;
  const atRiskCount = summary.atRiskCount || 0;
  const totalTimeMin = summary.totalTimeMin || 0;

  const openStudentModal = (email) => {
    setSelectedStudent(email);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div />
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-36 text-sm">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="PSLC">PSLC</SelectItem>
                <SelectItem value="JCE">JCE</SelectItem>
                <SelectItem value="MSCE">MSCE</SelectItem>
                <SelectItem value="Standard 1-8">Standard 1-8</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-40 text-sm">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {allSubjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 py-6 space-y-6">

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatsCard title="Students Tracked" value={uniqueStudents} icon={Users} color="blue" />
          <StatsCard title="Quiz Attempts" value={totalAttempts} icon={ClipboardList} color="purple" />
          <StatsCard title="Class Avg Score" value={`${avgScore}%`} icon={TrendingUp} color="green" subtitle="across all quizzes" />
          <StatsCard title="Pass Rate" value={`${passRate}%`} icon={BookOpen} color="green" />
          <StatsCard title="At-Risk Students" value={atRiskCount} icon={AlertTriangle} color="red" subtitle="avg score < 50%" />
          <StatsCard title="Learning Time" value={`${totalTimeMin}m`} icon={Clock} color="orange" subtitle="total platform time" />
        </div>

        {/* Attention Banner */}
        {atRiskCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              <span className="font-bold">{atRiskCount} student{atRiskCount !== 1 ? "s" : ""}</span> are at risk with an average score below 50%. Click their name in the table below for details.
            </p>
          </div>
        )}

        {/* Key Insights Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StrugglingStudents quizAttempts={quizAttempts} onSelectStudent={openStudentModal} />
          <WeakTopics quizAttempts={quizAttempts} />
        </div>

        {/* Subject Insights */}
        <SubjectInsights quizAttempts={quizAttempts} />

        {/* Tabs: Class Progress & Quiz Log */}
        <Tabs defaultValue="progress">
          <TabsList className="bg-white border">
            <TabsTrigger value="progress">Class Progress</TabsTrigger>
            <TabsTrigger value="quizlog">Quiz Log</TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                  All Students — Learning Progress
                  <Badge variant="secondary">{uniqueStudents} students</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ClassProgressTable
                  quizAttempts={quizAttempts}
                  activities={activities}
                  onSelectStudent={openStudentModal}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizlog">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Quiz Attempt Log ({quizAttempts.length} attempts)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuizPerformanceTable attempts={quizAttempts} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <StudentDetailModal
        student={selectedStudent}
        activities={activities.filter((a) => a.user_email === selectedStudent)}
        quizAttempts={quizAttempts.filter((q) => q.user_email === selectedStudent)}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}