import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/**
 * @typedef {{ title: string; subject: string; exam_date: string; location: string; notify_days_before: number[]; notes: string; color: string }} ExamFormData
 * @typedef {{ id?: string } & Partial<ExamFormData>} ExamFormBlock
 */

const NOTIFY_OPTIONS = [
  { value: 1, label: "1 day before" },
  { value: 3, label: "3 days before" },
  { value: 7, label: "1 week before" },
  { value: 14, label: "2 weeks before" },
];

const COLORS = [
  { value: "indigo", class: "bg-[hsl(245,58%,51%)]" },
  { value: "teal", class: "bg-[hsl(172,50%,45%)]" },
  { value: "amber", class: "bg-[hsl(34,80%,55%)]" },
  { value: "rose", class: "bg-[hsl(330,65%,55%)]" },
  { value: "sky", class: "bg-[hsl(200,70%,50%)]" },
];

const emptyExam = /** @type {ExamFormData} */ ({
  title: "",
  subject: "",
  exam_date: "",
  location: "",
  notify_days_before: [1, 7],
  notes: "",
  color: "rose",
});

/**
 * @param {{ open: boolean; onOpenChange: (value: boolean) => void; exam: ExamFormBlock | null; onSave: (examData: ExamFormData) => void }} props
 */
export default function ExamForm({ open, onOpenChange, exam, onSave }) {
  const [form, setForm] = useState(/** @type {ExamFormData} */ (emptyExam));

  useEffect(() => {
    if (exam) {
      setForm({
        title: exam.title ?? '',
        subject: exam.subject ?? '',
        location: exam.location ?? '',
        exam_date: exam.exam_date ? new Date(exam.exam_date).toISOString().slice(0, 16) : '',
        notify_days_before: Array.isArray(exam.notify_days_before) ? exam.notify_days_before : [1, 7],
        notes: exam.notes ?? '',
        color: exam.color ?? 'rose',
      });
    } else {
      setForm(emptyExam);
    }
  }, [exam, open]);

  /** @param {number} days */
  const toggleNotify = (days) => {
    setForm((prev) => ({
      ...prev,
      notify_days_before: prev.notify_days_before?.includes(days)
        ? prev.notify_days_before.filter((d) => d !== days)
        : [...(prev.notify_days_before || []), days],
    }));
  };

  /** @param {React.FormEvent<HTMLFormElement>} e */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(/** @type {ExamFormData} */ ({ ...form, exam_date: new Date(form.exam_date).toISOString() }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{exam ? "Edit Exam" : "Add Exam"}</DialogTitle>
          <DialogDescription>
            Schedule an exam reminder and optional notes for your study plan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Exam Title</Label>
            <Input
              placeholder="e.g. Final Exam - Calculus II"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="e.g. Mathematics"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="e.g. Room 301"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Date & Time</Label>
            <Input
              type="datetime-local"
              value={form.exam_date}
              onChange={e => setForm({ ...form, exam_date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm({ ...form, color: c.value })}
                  className={`w-7 h-7 rounded-full ${c.class} transition-all ${form.color === c.value ? "ring-2 ring-offset-2 ring-ring scale-110" : "opacity-60 hover:opacity-100"}`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notify Me</Label>
            <div className="flex flex-wrap gap-3">
              {NOTIFY_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <Checkbox
                    checked={form.notify_days_before?.includes(opt.value)}
                    onCheckedChange={() => toggleNotify(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Topics to review, etc."
              value={form.notes}
              onChange={/** @param {React.ChangeEvent<HTMLTextAreaElement>} e */ (e) => setForm({ ...form, notes: e.target.value })}
              className="h-16"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{exam ? "Update" : "Add Exam"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}