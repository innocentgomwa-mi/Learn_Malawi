import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const TYPES = [
  { value: "textbook", label: "Textbook" },
  { value: "video", label: "Video" },
  { value: "article", label: "Article" },
  { value: "notes", label: "Notes" },
  { value: "practice_exam", label: "Practice Exam" },
  { value: "other", label: "Other" },
];

/**
 * @typedef {{ name: string; type: string; subject: string; url: string }} ResourceFormData
 * @typedef {{ id?: string } & Partial<ResourceFormData>} ResourceFormBlock
 */

const emptyResource = /** @type {ResourceFormData} */ ({ name: "", type: "textbook", subject: "", url: "" });
const RESOURCE_FIELDS = /** @type {Array<keyof ResourceFormData>} */ (['name', 'type', 'subject', 'url']);

/**
 * @param {Record<string, any>} body
 * @param {Array<keyof ResourceFormData>} allowedFields
 * @returns {Partial<ResourceFormData>}
 */
function pickFields(body, allowedFields) {
  if (typeof body !== 'object' || body === null) return /** @type {Partial<ResourceFormData>} */ ({});
  return allowedFields.reduce((picked, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      picked[field] = body[field];
    }
    return picked;
  }, /** @type {Partial<ResourceFormData>} */ ({}));
}

/**
 * @param {{ open: boolean; onOpenChange: (value: boolean) => void; resource: ResourceFormBlock | null; onSave: (data: ResourceFormData) => void }} props
 */
export default function ResourceForm({ open, onOpenChange, resource, onSave }) {
  const [form, setForm] = useState(/** @type {ResourceFormData} */ (emptyResource));

  useEffect(() => {
    if (resource) {
      setForm({
        name: resource.name ?? '',
        type: resource.type ?? 'textbook',
        subject: resource.subject ?? '',
        url: resource.url ?? '',
      });
    } else {
      setForm(emptyResource);
    }
  }, [resource, open]);

  /** @param {React.FormEvent<HTMLFormElement>} e */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(/** @type {ResourceFormData} */ (pickFields(form, RESOURCE_FIELDS)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading">{resource ? "Edit Resource" : "Add Resource"}</DialogTitle>
          <DialogDescription>
            Provide resource details so you can attach it to study blocks.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              placeholder="e.g. Calculus Textbook Ch. 5"
              value={form.name}
              onChange={/** @param {React.ChangeEvent<HTMLInputElement>} e */ (e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="e.g. Math"
                value={form.subject}
                onChange={/** @param {React.ChangeEvent<HTMLInputElement>} e */ (e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>URL (optional)</Label>
            <Input
              placeholder="https://..."
              value={form.url}
              onChange={/** @param {React.ChangeEvent<HTMLInputElement>} e */ (e) => setForm({ ...form, url: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{resource ? "Update" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}