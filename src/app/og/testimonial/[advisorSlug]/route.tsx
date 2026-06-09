import { ImageResponse } from "next/og";
import { COMPANY_LOGO_PATH } from "@/lib/brand";
import { ADVISOR_ACTION_OG_IMAGE_SIZE } from "@/lib/social/advisor-og-share";
import { loadAdvisorOgShareContext } from "@/lib/social/advisor-og-share.server";
import {
  TestimonialSubmitOgImage,
  TestimonialSubmitOgImageFallback,
} from "@/lib/social/testimonial-submit-og-image";
import { getSiteOrigin, toAbsoluteUrl } from "@/lib/social/site-origin";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ advisorSlug: string }> },
) {
  const { advisorSlug } = await context.params;
  const origin = getSiteOrigin();
  const logoSrc = toAbsoluteUrl(origin, COMPANY_LOGO_PATH);
  const advisor = await loadAdvisorOgShareContext(decodeURIComponent(advisorSlug));

  if (!advisor) {
    return new ImageResponse(<TestimonialSubmitOgImageFallback logoSrc={logoSrc} />, {
      ...ADVISOR_ACTION_OG_IMAGE_SIZE,
    });
  }

  return new ImageResponse(
    (
      <TestimonialSubmitOgImage
        name={advisor.name}
        designation={advisor.designation}
        verified={advisor.verified}
        photoSrc={advisor.photoSrc}
        logoSrc={advisor.logoSrc}
        initials={advisor.initials}
      />
    ),
    { ...ADVISOR_ACTION_OG_IMAGE_SIZE },
  );
}
