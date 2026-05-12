import React from "react";
import { format, differenceInDays, isPast } from "date-fns";
import { CalendarDays, MapPin, Bell, Pencil, Trash2, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

const colorDots = {
  indigo: "bg-[hsl(245,58%,51%)]",
  teal: "bg-[hsl(172,50%,45%)]",
  amber: "bg-[hsl(34,80%,55%)]",
  rose: "bg-[hsl(330,65%,55%)]",
  sky: "bg-[hsl(200,70%,50%)]",
};

export default function ExamTracker({ exams, onAdd, onEdit, onDelete }) {
  const sortedExams = [...(exams || [])].sort(
    (a, b) => new Date(a.exam_date) - new Date(b.exam_date)
  );

  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Upcoming Exams
        </h3>
        <Button size="sm" variant="outline" onClick={onAdd} className="h-7 text-xs">
          <Plus className="h-3 w-3 mr-1" /> Add
        </Button>
      </div>
      <ScrollArea className="max-h-[340px]">
        {sortedExams.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No exams scheduled yet.</p>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {sortedExams.map(exam => {
                const examDate = new Date(exam.exam_date);
                const daysUntil = differenceInDays(examDate, new Date());
                const isExamPast = isPast(examDate);
                const isUrgent = !isExamPast && daysUntil <= 3;

                return (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`relative p-3 rounded-lg border transition-all group hover:shadow-sm ${isExamPast ? "opacity-50" : ""} ${isUrgent ? "border-destructive/40 bg-destructive/5" : "hover:bg-muted/30"}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${colorDots[exam.color] || colorDots.rose}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm font-heading">{exam.title}</p>
                            <p className="text-xs text-muted-foreground">{exam.subject}</p>
                          </div>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(exam)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onDelete(exam.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 flex items-center gap-1">
                            <CalendarDays className="h-2.5 w-2.5" />
                            {format(examDate, "MMM d, yyyy · h:mm a")}
                          </Badge>
                          {exam.location && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex items-center gap-1">
                              <MapPin className="h-2.5 w-2.5" />
                              {exam.location}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {isExamPast ? (
                            <span className="text-[10px] text-muted-foreground">Exam passed</span>
                          ) : (
                            <>
                              {isUrgent && <AlertTriangle className="h-3 w-3 text-destructive" />}
                              <span className={`text-xs font-medium ${isUrgent ? "text-destructive" : "text-muted-foreground"}`}>
                                {daysUntil === 0 ? "Today!" : `${daysUntil} day${daysUntil === 1 ? "" : "s"} left`}
                              </span>
                            </>
                          )}
                          {exam.notify_days_before?.length > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex items-center gap-1">
                              <Bell className="h-2.5 w-2.5" />
                              {exam.notify_days_before.sort((a, b) => a - b).join(", ")}d
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </ScrollArea>
    </div>
  );
}