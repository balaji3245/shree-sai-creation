export function slugify(input) {
  if (!input || typeof input !== 'string') return '';

  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function ensureUniqueSlug(base, existingSlugs = []) {
  const set = new Set(existingSlugs);
  if (!set.has(base)) return base;

  let i = 2;
  while (set.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}
