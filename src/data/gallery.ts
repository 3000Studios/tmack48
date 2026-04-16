import { videos } from "./videos";

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  caption: string;
  href?: string;
}

// Until real shoots are uploaded, use curated video thumbnails as a premium gallery
// (each links to the track). Swap for real images in /public/images and update this module.
export const gallery: GalleryItem[] = videos.slice(0, 12).map((v) => ({
  id: v.id,
  src: v.thumbnailMaxUrl,
  alt: `${v.title} — TMACK48 visual moment`,
  caption: v.title,
  href: v.watchUrl,
}));
