import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function QuizModal({ open, onClose, onSave, initial = {} }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    subject: initial.subject || '',
    level: initial.level || 'JCE',
    description: initial.description || '',
    teacher_email: initial.teacher_email || '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title || !form.subject) return;
    onSave({ ...initial, ...form });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial.id ? 'Edit Quiz' : 'New Quiz'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1">
            <Label>Title</Label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Quiz title" />
          </div>
          <div className="grid gap-1">
            <Label>Subject</Label>
            <Input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="e.g. Mathematics" />
          </div>
          <div className="grid gap-1">
            <Label>Level</Label>
            <Select value={form.level} onValueChange={v => set('level', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PSLC">PSLC</SelectItem>
                <SelectItem value="JCE">JCE</SelectItem>
                <SelectItem value="MSCE">MSCE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label>Description</Label>
            <Input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional description" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
