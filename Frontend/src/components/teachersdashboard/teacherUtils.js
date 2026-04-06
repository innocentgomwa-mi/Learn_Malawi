/**
 * @typedef {{ [key: string]: any; createdAt?: string | number; updatedAt?: string | number }} TeacherItem
 */

export const teacherKeys = [
  'teacher_email',
  'teacherEmail',
  'created_by',
  'createdBy',
  'creatorEmail',
  'author_email',
  'authorEmail',
];

/**
 * @param {TeacherItem} item
 * @param {string | undefined} email
 */
export function matchesTeacher(item, email) {
  if (!email || !item || typeof item !== 'object') return false;
  return teacherKeys.some((key) => item[key] === email);
}

/**
 * @param {TeacherItem} item
 */
export function hasTeacherField(item) {
  if (!item || typeof item !== 'object') return false;
  return teacherKeys.some((key) => key in item);
}

/**
 * @template T
 * @param {T[] | any} data
 * @param {string | undefined} email
 * @returns {T[]}
 */
export function filterByTeacher(data, email) {
  const normalized = Array.isArray(data) ? data : /** @type {T[]} */ ([]);
  return normalized.filter((item) => {
    if (!email) return true;
    if (matchesTeacher(item, email)) return true;
    return !normalized.some((innerItem) => hasTeacherField(innerItem));
  });
}

/**
 * @template T
 * @param {T[] | any} data
 * @returns {T[]}
 */
export function sortByLatest(data) {
  const normalized = Array.isArray(data) ? data : [];
  return [...normalized].sort((a, b) => {
    const aTime = new Date(a.createdAt || a.updatedAt || 0).getTime();
    const bTime = new Date(b.createdAt || b.updatedAt || 0).getTime();
    return bTime - aTime;
  });
}
