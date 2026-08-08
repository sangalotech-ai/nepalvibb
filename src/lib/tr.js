// Localized content picker.
// Returns the EN field when locale is 'en' and it has a non-empty value,
// otherwise falls back to the base (Norwegian) field, then to fallback.
export const tr = (obj, field, locale, fallback = '') => {
  if (locale === 'en') {
    const en = obj?.[`${field}En`];
    if (en !== undefined && en !== null && en !== '') return en;
  }
  const base = obj?.[field];
  return base !== undefined && base !== null && base !== '' ? base : fallback;
};

// Localized picker for sub-documents that carry their own En fields
// (e.g. itinerary items with titleEn/detailsEn).
export const trItem = (obj, field, locale) => {
  if (!obj) return undefined;
  if (locale === 'en') {
    const en = obj[`${field}En`];
    if (en !== undefined && en !== null && en !== '') return en;
  }
  return obj[field];
};
