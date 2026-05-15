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
 * @property {StudyNote|Tutorial|PastPaper|null|undefined} [existing]
 */

/**
 * @typedef {{
 *   id?: string;
 *   title: string;
 *   subject: string;
 *   level: string;
 *   grade?: string;
 *   topic?: string;
 *   summary?: string;
 *   content?: string;
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
  topic: '',
  summary: '',
  content: '',
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
  const [file, setFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [paperFile, setPaperFile] = useState(null);
  const [markingSchemeFile, setMarkingSchemeFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [resource, setResource] = useState(
    /** @type {Resource} */(type === 'studynote' ? initialStudyNote : type === 'tutorial' ? initialTutorial : initialPastPaper)
  );

  useEffect(() => {
    setFile(null);
    setImageFile(null);
    setPaperFile(null);
    setMarkingSchemeFile(null);
    setVideoFile(null);
    if (existing) {
      if (type === 'studynote') {
        setResource({
          title: existing.title || '',
          subject: existing.subject || '',
          level: existing.level || 'PSLC',
          grade: existing.grade || '',
          topic: existing.topic || '',
          summary: existing.summary || '',
          content: existing.content || '',
          fileUrl: existing.fileUrl || existing.file_url || '',
          imageUrl: existing.imageUrl || existing.image_url || '',
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
        setVideoFile(null);
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

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    if (selectedFile) {
      setResource((prev) => ({ ...prev, fileUrl: '' }));
    }
  };

  const handleImageChange = (event) => {
    const selectedImage = event.target.files?.[0] ?? null;
    setImageFile(selectedImage);
    if (selectedImage) {
      setResource((prev) => ({ ...prev, imageUrl: '' }));
    }
  };

  const handlePaperFileChange = (event) => {
    const selectedPaper = event.target.files?.[0] ?? null;
    setPaperFile(selectedPaper);
    if (selectedPaper) {
      setResource((prev) => ({ ...prev, paperUrl: '' }));
    }
  };

  const handleVideoFileChange = (event) => {
    const selectedVideo = event.target.files?.[0] ?? null;
    setVideoFile(selectedVideo);
    if (selectedVideo) {
      setResource((prev) => ({ ...prev, videoUrl: '' }));
    }
  };

  const handleMarkingSchemeFileChange = (event) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setMarkingSchemeFile(selectedFile);
    if (selectedFile) {
      setResource((prev) => ({ ...prev, markingSchemeUrl: '' }));
    }
  };

  /**
   * @param {import('react').FormEvent<HTMLFormElement>} event
   */
  const isStudyNote = type === 'studynote';
  const isTutorial = type === 'tutorial';
  const studyNote = /** @type {StudyNote} */ (resource);
  const tutorial = /** @type {Tutorial} */ (resource);
  const pastPaper = /** @type {PastPaper} */ (resource);

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
          topic: studyNote.topic || undefined,
          content: studyNote.content || undefined,
          summary: studyNote.summary || undefined,
          imageUrl: studyNote.imageUrl || undefined,
        };

        if (file || imageFile) {
          const formData = new FormData();
          Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              formData.append(key, String(value));
            }
          });
          if (file) formData.append('file', file);
          if (imageFile) formData.append('image', imageFile);

          if (existing?.id) {
            await updateStudyNote(existing.id, formData);
          } else {
            await createStudyNote(formData);
          }
        } else {
          if (studyNote.fileUrl) {
            payload.fileUrl = studyNote.fileUrl;
          }
          if (studyNote.imageUrl) {
            payload.imageUrl = studyNote.imageUrl;
          }

          if (existing?.id) {
            await updateStudyNote(existing.id, payload);
          } else {
            await createStudyNote(payload);
          }
        }
      } else if (type === 'tutorial') {
        const videoUrl = tutorial.videoUrl?.trim() || undefined;
        const payload = {
          title: tutorial.title,
          subject: tutorial.subject,
          level: tutorial.level,
          class: tutorial.class,
          description: tutorial.description,
          videoUrl,
        };

        if (videoFile) {
          const formData = new FormData();
          Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              formData.append(key, String(value));
            }
          });
          formData.append('video', videoFile);

          if (existing?.id) {
            await updateTutorial(existing.id, formData);
          } else {
            await createTutorial(formData);
          }
        } else {
          if (existing?.id) {
            await updateTutorial(existing.id, payload);
          } else {
            await createTutorial(payload);
          }
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

        if (paperFile || markingSchemeFile) {
          const formData = new FormData();
          Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              formData.append(key, String(value));
            }
          });
          if (paperFile) formData.append('paper', paperFile);
          if (markingSchemeFile) formData.append('markingScheme', markingSchemeFile);

          if (existing?.id) {
            await updatePastPaper(existing.id, formData);
          } else {
            await createPastPaper(formData);
          }
        } else {
          if (existing?.id) {
            await updatePastPaper(existing.id, payload);
          } else {
            await createPastPaper(payload);
          }
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
              <span>{isStudyNote ? 'File URL or upload file' : isTutorial ? 'Video URL' : 'Paper URL'}</span>
              {isStudyNote ? (
                <>
                  <input
                    type="text"
                    value={studyNote.fileUrl}
                    onChange={handleChange('fileUrl')}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="mt-2 w-full text-sm text-slate-700"
                  />
                  {file ? (
                    <div className="text-xs text-slate-500">Selected file: {file.name}</div>
                  ) : null}
                </>
              ) : isTutorial ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={tutorial.videoUrl}
                      onChange={handleChange('videoUrl')}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="w-full text-sm text-slate-700"
                    />
                    {videoFile ? (
                      <div className="text-xs text-slate-500">Selected file: {videoFile.name}</div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={pastPaper.paperUrl}
                      onChange={handleChange('paperUrl')}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePaperFileChange}
                      className="w-full text-sm text-slate-700"
                    />
                    {paperFile ? (
                      <div className="text-xs text-slate-500">Selected file: {paperFile.name}</div>
                    ) : null}
                  </div>
                </div>
              )}
            </label>
            {isStudyNote ? (
              <label className="space-y-2 text-sm">
                <span>Card Image URL or upload image</span>
                <input
                  type="text"
                  value={studyNote.imageUrl}
                  onChange={handleChange('imageUrl')}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  className="mt-2 w-full text-sm text-slate-700"
                />
                {imageFile ? (
                  <div className="text-xs text-slate-500">Selected image: {imageFile.name}</div>
                ) : null}
              </label>
            ) : isTutorial ? null : (
              <label className="space-y-2 text-sm">
                <span>Marking Scheme URL or upload PDF</span>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={pastPaper.markingSchemeUrl}
                      onChange={handleChange('markingSchemeUrl')}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleMarkingSchemeFileChange}
                      className="w-full text-sm text-slate-700"
                    />
                    {markingSchemeFile ? (
                      <div className="text-xs text-slate-500">Selected file: {markingSchemeFile.name}</div>
                    ) : null}
                  </div>
                </div>
              </label>
            )}
          </div>

          {isStudyNote && (
            <>
              <label className="space-y-2 text-sm">
                <span>Full Notes</span>
                <textarea
                  value={studyNote.content}
                  onChange={handleChange('content')}
                  rows={6}
                  placeholder="Add the full study note content that students will read when they open the card."
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Summary</span>
                <textarea
                  value={studyNote.summary}
                  onChange={handleChange('summary')}
                  rows={4}
                  placeholder="Add a short summary that students will see in the study notes list."
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
            </>
          )}
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
