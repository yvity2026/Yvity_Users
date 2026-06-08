function isSupabaseBucketUrl(url: string, bucket: string): boolean {
  return url.trim().includes(`/storage/v1/object/public/${bucket}/`);
}

export function isHostedGalleryUrl(url: string): boolean {
  const trimmed = url.trim();
  return trimmed.startsWith("/api/gallery/uploads/") || isSupabaseBucketUrl(trimmed, "gallery");
}

export function isHostedIntroVideoUrl(url: string): boolean {
  const trimmed = url.trim();
  return trimmed.startsWith("/api/intro-video/") || isSupabaseBucketUrl(trimmed, "intro-video");
}

export function isHostedSelfieUrl(url: string): boolean {
  const trimmed = url.trim();
  return trimmed.startsWith("/api/auth/selfie/") || isSupabaseBucketUrl(trimmed, "selfies");
}

export function isHostedTestimonialMediaUrl(url: string): boolean {
  const trimmed = url.trim();
  return trimmed.startsWith("/api/testimonials/media/") || isSupabaseBucketUrl(trimmed, "testimonials");
}
