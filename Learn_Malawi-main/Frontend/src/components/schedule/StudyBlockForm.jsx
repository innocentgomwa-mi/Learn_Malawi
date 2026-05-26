import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen } from "lucide-react";

/**
 * @typedef {{ title: string; day_of_week: string; start_time: string; end_time: string; subject: string; color: string; resource_ids: string[]; notes: string }} StudyBlockFormData
 * @typedef {{ id?: string } & Partial<StudyBlockFormData>} StudyBlockFormBlock
 * @typedef {{ id: string; name: string; type?: string }} StudyResource
 */

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const COLORS = [
  { value: "indigo", label: "Indigo", class: "bg-[hsl(245,58%,51%)]" },
  { value: "teal", label: "Teal", class: "bg-[hsl(172,50%,45%)]" },
  { value: "amber", label: "Amber", class: "bg-[hsl(34,80%,55%)]" },
  { value: "rose", label: "Rose", class: "bg-[hsl(330,65%,55%)]" },
  { value: "sky", label: "Sky", class: "bg-[hsl(200,70%,50%)]" },
];

const emptyBlock = /** @type {StudyBlockFormData} */ ({
  title: "",
  day_of_week: "Monday",
  start_time: "09:00",
  end_time: "10:00",
  subject: "",
  color: "indigo",
  resource_ids: [],
  notes: "",
});

const STUDY_BLOCK_FIELDS = /** @type {Array<keyof StudyBlockFormData>} */ (['title', 'day_of_week', 'start_time', 'end_time', 'subject', 'color', 'resource_ids', 'notes']);

/**
 * @param {Record<string, any>} body
 * @param {Array<keyof StudyBlockFormData>} allowedFields
 * @returns {Partial<StudyBlockFormData>}
 */
function pickFields(body, allowedFields) {
  if (typeof body !== 'object' || body === null) return /** @type {Partial<StudyBlockFormData>} */ ({});
  return allowedFields.reduce((picked, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      picked[field] = body[field];
    }
    return picked;
  }, /** @type {Partial<StudyBlockFormData>} */ ({}));
}

/**
 * @param {{ open: boolean; onOpenChange: (value: boolean) => void; block: StudyBlockFormBlock | null; resources: StudyResource[]; onSave: (formData: StudyBlockFormData) => void }} props
 */
export default function StudyBlockForm({ open, onOpenChange, block, resources, onSave }) {
  const [form, setForm] = useState(/** @type {StudyBlockFormData} */ (emptyBlock));

  useEffect(() => {
    if (block) {
      setForm({
        title: block.title ?? '',
        day_of_week: block.day_of_week ?? 'Monday',
        start_time: block.start_time ?? '09:00',
        end_time: block.end_time ?? '10:00',
        subject: block.subject ?? '',
        color: block.color ?? 'indigo',
        resource_ids: Array.isArray(block.resource_ids) ? block.resource_ids : [],
        notes: block.notes ?? '',
      });
    } else {
      setForm(emptyBlock);
    }
  }, [block, open]);

  /** @param {React.FormEvent<HTMLFormElement>} e */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(/** @type {StudyBlockFormData} */ (pickFields(form, STUDY_BLOCK_FIELDS)));
  };

  /** @param {string} resourceId */
  const toggleResource = (resourceId) => {
    setForm((prev) => ({
      ...prev,
      resource_ids: prev.resource_ids?.includes(resourceId)
        ? prev.resource_ids.filter((id) => id !== resourceId)
        : [...(prev.resource_ids || []), resourceId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{block ? "Edit Study Block" : "New Study Block"}</DialogTitle>
          <DialogDescription>
            Add or update a study block with time, subject, and linked resources.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="e.g. Math Review"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Day</Label>
              <Select value={form.day_of_week} onValueChange={v => setForm({ ...form, day_of_week: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="e.g. Mathematics"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm({ ...form, color: c.value })}
                  className={`w-8 h-8 rounded-full ${c.class} transition-all ${form.color === c.value ? "ring-2 ring-offset-2 ring-ring scale-110" : "opacity-60 hover:opacity-100"}`}
                />
              ))}
            </div>
          </div>

          {resources?.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Assign Resources
              </Label>
              <ScrollArea className="max-h-32 rounded-md border p-2">
                <div className="space-y-2">
                  {resources.map(r => (
                    <label key={r.id} className="flex items-center gap-2 cursor-pointer text-sm">
                      <Checkbox
                        checked={form.resource_ids?.includes(r.id)}
                        onCheckedChange={() => toggleResource(r.id)}
                      />
                      <span>{r.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{r.type?.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Any additional notes..."
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="h-16"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{block ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}