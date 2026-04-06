import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { createPastPaper, updatePastPaper, createStudyNote, updateStudyNote, createTutorial, updateTutorial } from '@/api';

/**
 * @typedef {object} ResourceModalProps
 * @property {boolean} open
 * @property {() => void} onClose
 * @property {() => void} onSaved
 * @property {'studynote'|'tutorial'|'pastpaper'} type
 * @property {StudyNote|Tutorial|PastPaper|undefined} [existing]
 */

/**
 * @typedef {{
 *   id?: string;
 *   title: string;
 *   subject: string;
 *   level: string;
 *   grade?: string;
 *   fileUrl?: string;
 *   file_url?: string;
 *   class?: string;
 *   description?: string;
 *   videoUrl?: string;
 *   video_url?: string;
 *   year?: number;
 *   paperUrl?: string;
 *   paper_url?: string;
 *   markingSchemeUrl?: string;
 *   marking_scheme_url?: string;
 * }} StudyNote
 */
/**
 * @typedef {{
 *   id?: string;
 *   title: string;
 *   subject: string;
 *   level: string;
 *   grade?: string;
 *   fileUrl?: string;
 *   file_url?: string;
 *   class?: string;
 *   description?: string;
 *   videoUrl?: string;
 *   video_url?: string;
 *   year?: number;
 *   paperUrl?: string;
 *   paper_url?: string;
 *   markingSchemeUrl?: string;
 *   marking_scheme_url?: string;
 * }} PastPaper
 */
/**
 * @typedef {{
 *   id?: string;
 *   title: string;
 *   subject: string;
 *   level: string;
 *   grade?: string;
 *   fileUrl?: string;
 *   file_url?: string;
 *   class?: string;
 *   description?: string;
 *   videoUrl?: string;
 *   video_url?: string;
 *   year?: number;
 *   paperUrl?: string;
 *   paper_url?: string;
 *   markingSchemeUrl?: string;
 *   marking_scheme_url?: string;
 * }} Tutorial
 */
/**
 * @typedef {StudyNote|Tutorial|PastPaper} Resource
 */

const examLevelOptions = [
  { value: 'PSLC', label: 'PSLC' },
  { value: 'JCE', label: 'JCE' },
  { value: 'MSCE', label: 'MSCE' },
];

const tutorialLevelOptions = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
];

const initialStudyNote = {
  title: '',
  subject: '',
  level: 'PSLC',
  grade: '',
  fileUrl: '',
};

const initialPastPaper = {
  title: '',
  subject: '',
  year: new Date().getFullYear(),
  level: 'PSLC',
  paperUrl: '',
  markingSchemeUrl: '',
};

const initialTutorial = {
  title: '',
  subject: '',
  level: 'primary',
  class: '',
  description: '',
  videoUrl: '',
};

/**
 * @param {ResourceModalProps} props
 */
export default function ResourceModal({ open, onClose, onSaved, type, existing }) {
  const [loading, setLoading] = useState(false);
  const [resource, setResource] = useState(
    /** @type {Resource} */(type === 'studynote' ? initialStudyNote : type === 'tutorial' ? initialTutorial : initialPastPaper)
  );

  useEffect(() => {
    if (existing) {
      if (type === 'studynote') {
        setResource({
          title: existing.title || '',
          subject: existing.subject || '',
          level: existing.level || 'PSLC',
          grade: existing.grade || '',
          fileUrl: existing.fileUrl || existing.file_url || '',
        });
      } else if (type === 'tutorial') {
        setResource({
          title: existing.title || '',
          subject: existing.subject || '',
          level: existing.level || 'primary',
          class: existing.class || '',
          description: existing.description || '',
          videoUrl: existing.videoUrl || existing.video_url || '',
        });
      } else {
        setResource({
          title: existing.title || '',
          subject: existing.subject || '',
          year: existing.year || new Date().getFullYear(),
          level: existing.level || 'PSLC',
          paperUrl: existing.paperUrl || existing.paper_url || '',
          markingSchemeUrl: existing.markingSchemeUrl || existing.marking_scheme_url || '',
        });
      }
    } else {
      setResource(type === 'studynote' ? initialStudyNote : type === 'tutorial' ? initialTutorial : initialPastPaper);
    }
  }, [existing, open, type]);

  /**
   * @param {string} field
   * @returns {(event: import('react').ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void}
   */
  const handleChange = (field) => {
    return /** @param {import('react').ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} event */ (event) => {
      setResource((prev) => ({ ...prev, [field]: event.target.value }));
    };
  };

  /**
   * @param {import('react').FormEvent<HTMLFormElement>} event
   */
  const handleSave = async (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      if (type === 'studynote') {
        const payload = {
          title: studyNote.title,
          subject: studyNote.subject,
          level: studyNote.level,
          grade: studyNote.grade || undefined,
          fileUrl: studyNote.fileUrl || undefined,
        };

        if (existing?.id) {
          await updateStudyNote(existing.id, payload);
        } else {
          await createStudyNote(payload);
        }
      } else if (type === 'tutorial') {
        const payload = {
          title: tutorial.title,
          subject: tutorial.subject,
          level: tutorial.level,
          class: tutorial.class,
          description: tutorial.description,
          videoUrl: tutorial.videoUrl,
        };

        if (existing?.id) {
          await updateTutorial(existing.id, payload);
        } else {
          await createTutorial(payload);
        }
      } else {
        const payload = {
          title: pastPaper.title,
          subject: pastPaper.subject,
          year: Number(pastPaper.year),
          level: pastPaper.level,
          paperUrl: pastPaper.paperUrl,
          markingSchemeUrl: pastPaper.markingSchemeUrl,
        };

        if (existing?.id) {
          await updatePastPaper(existing.id, payload);
        } else {
          await createPastPaper(payload);
        }
      }

      onSaved();
    } catch (error) {
      console.error(error);
      onSaved();
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const isStudyNote = type === 'studynote';
  const isTutorial = type === 'tutorial';
  const studyNote = /** @type {StudyNote} */ (resource);
  const tutorial = /** @type {Tutorial} */ (resource);
  const pastPaper = /** @type {PastPaper} */ (resource);

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogTitle>{existing ? `Edit ${isStudyNote ? 'Study Note' : isTutorial ? 'Tutorial' : 'Past Paper'}` : `Upload ${isStudyNote ? 'Study Note' : isTutorial ? 'Tutorial' : 'Past Paper'}`}</DialogTitle>
        <DialogDescription>
          {isStudyNote
            ? 'Add or update a study note that students can use for revision.'
            : isTutorial
              ? 'Add or update a tutorial that students can use for revision.'
              : 'Add or update a past paper that students can use for revision.'}
        </DialogDescription>

        <form className="space-y-4 mt-6" onSubmit={handleSave}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span>Title</span>
              <input
                type="text"
                value={resource.title}
                onChange={handleChange('title')}
                required
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Subject</span>
              <input
                type="text"
                value={resource.subject}
                onChange={handleChange('subject')}
                required
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span>{isStudyNote ? 'Grade' : isTutorial ? 'Class' : 'Year'}</span>
              {isStudyNote ? (
                <input
                  type="text"
                  value={studyNote.grade}
                  onChange={handleChange('grade')}
                  placeholder="Grade 8"
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              ) : isTutorial ? (
                <input
                  type="text"
                  value={tutorial.class}
                  onChange={handleChange('class')}
                  placeholder="Form 4"
                  required
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              ) : (
                <input
                  type="number"
                  value={pastPaper.year}
                  onChange={handleChange('year')}
                  required
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              )}
            </label>
            <label className="space-y-2 text-sm">
              <span>{isTutorial ? 'Education Level' : 'Exam Level'}</span>
              <select
                value={resource.level}
                onChange={handleChange('level')}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                {(isTutorial ? tutorialLevelOptions : examLevelOptions).map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span>{isStudyNote ? 'File URL' : isTutorial ? 'Video URL' : 'Paper URL'}</span>
              <input
                type="text"
                value={isStudyNote ? studyNote.fileUrl : isTutorial ? tutorial.videoUrl : pastPaper.paperUrl}
                onChange={handleChange(isStudyNote ? 'fileUrl' : isTutorial ? 'videoUrl' : 'paperUrl')}
                placeholder="https://..."
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
            {isStudyNote ? null : isTutorial ? null : (
              <label className="space-y-2 text-sm">
                <span>Marking Scheme URL</span>
                <input
                  type="text"
                  value={pastPaper.markingSchemeUrl}
                  onChange={handleChange('markingSchemeUrl')}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
            )}
          </div>

          {isTutorial && (
            <label className="space-y-2 text-sm">
              <span>Description</span>
              <textarea
                value={tutorial.description}
                onChange={handleChange('description')}
                rows={4}
                required
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {isStudyNote
                ? 'Provide a PDF URL so students can download the note.'
                : isTutorial
                  ? 'Provide a video URL and a short description for the tutorial.'
                  : 'Provide a PDF URL and optional marking scheme link.'}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
