"use client";

import { GalleryImageUpload } from "@/components/gallery/gallery-image-upload";

type ServiceCompanyLogoUploadProps = {
  logoUrl: string;
  onLogoUrlChange: (url: string) => void;
  companyName?: string;
};

/** Company logo upload for service add/edit (reuses gallery storage). */
export function ServiceCompanyLogoUpload({
  logoUrl,
  onLogoUrlChange,
  companyName,
}: ServiceCompanyLogoUploadProps) {
  return (
    <GalleryImageUpload
      imageUrl={logoUrl}
      onImageUrlChange={onLogoUrlChange}
      title={companyName ? `${companyName} logo` : "Company logo"}
      showPreview={Boolean(logoUrl)}
    />
  );
}
