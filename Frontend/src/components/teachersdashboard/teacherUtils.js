export const teacherKeys = [
  'teacher_email',
  'teacherEmail',
  'created_by',
  'createdBy',
  'creatorEmail',
  'author_email',
  'authorEmail',
];

export function matchesTeacher(item, email) {
  if (!email || !item || typeof item !== 'object') return false;
  return teacherKeys.some((key) => item[key] === email);
}

export function hasTeacherField(item) {
  if (!item || typeof item !== 'object') return false;
  return teacherKeys.some((key) => key in item);
}

export function filterByTeacher(data, email) {
  const normalized = Array.isArray(data) ? data : [];
  return normalized.filter((item) => {
    if (!email) return true;
    if (matchesTeacher(item, email)) return true;
    return !normalized.some(hasTeacherField);
  });
}

export function sortByLatest(data) {
  const normalized = Array.isArray(data) ? data : [];
  return [...normalized].sort((a, b) => {
    const aTime = new Date(a.createdAt || a.updatedAt || 0).getTime();
    const bTime = new Date(b.createdAt || b.updatedAt || 0).getTime();
    return bTime - aTime;
  });
}
