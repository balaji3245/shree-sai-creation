import type { Metadata } from 'next';

/** Reusable metadata factory; replace the site URL and image once brand assets are final. */
export function pageMetadata(title: string, description: string, path = '/'): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    // Add a final brand Open Graph image here when marketing assets are available.
    openGraph: { title, description, url: path },
  };
}
