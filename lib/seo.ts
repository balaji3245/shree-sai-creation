import type { Metadata } from 'next';

export function pageMetadata(title: string, description: string, path = '/'): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
  };
}
