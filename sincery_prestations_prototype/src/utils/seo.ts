import { useEffect } from 'react';

/**
 * Sets the document title and meta description for the current page.
 * Mirrors the SEO requirements of the specification (title + meta description per page).
 */
export function useSeo(title: string, description: string): void {
  useEffect(() => {
    document.title = title;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', description);
  }, [title, description]);
}