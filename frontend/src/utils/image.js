/**
 * Utility helper to format image URLs safely.
 * Prepends backend origin to relative /uploads paths if needed.
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  if (typeof url === 'string' && url.startsWith('/uploads')) {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const domain = apiBase.replace(/\/api\/v1\/?$/, '');
    return `${domain}${url}`;
  }
  return url;
};
