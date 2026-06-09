import {
  advisorProfileShareDescription,
  advisorProfileShareTitle,
  platformShareDescription,
  platformShareTitle,
  recommendSubmitShareDescription,
  recommendSubmitShareTitle,
  testimonialSubmitShareDescription,
  testimonialSubmitShareTitle,
  type AdvisorShareMode,
} from "@/lib/social/share-copy";

export type NativeSharePayload = {
  title: string;
  text: string;
  url: string;
};

export function buildAdvisorProfileSharePayload(input: {
  name: string;
  designation: string;
  location?: string;
  verified?: boolean;
  url: string;
  mode?: AdvisorShareMode;
}): NativeSharePayload {
  return {
    title: advisorProfileShareTitle(input.name, input.designation),
    text: advisorProfileShareDescription({
      location: input.location,
      verified: input.verified,
      mode: input.mode,
    }),
    url: input.url,
  };
}

export function buildTestimonialSubmitSharePayload(input: {
  name: string;
  designation: string;
  url: string;
}): NativeSharePayload {
  return {
    title: testimonialSubmitShareTitle(input.name),
    text: testimonialSubmitShareDescription(input.name, input.designation),
    url: input.url,
  };
}

export function buildRecommendSubmitSharePayload(input: {
  name: string;
  designation: string;
  url: string;
}): NativeSharePayload {
  return {
    title: recommendSubmitShareTitle(input.name),
    text: recommendSubmitShareDescription(input.name, input.designation),
    url: input.url,
  };
}

export function buildPlatformHomeSharePayload(url: string): NativeSharePayload {
  return {
    title: platformShareTitle,
    text: platformShareDescription,
    url,
  };
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

/** Uses the Web Share API when available. Throws if unsupported or user cancels. */
export async function invokeNativeShare(payload: NativeSharePayload): Promise<void> {
  if (!canUseNativeShare()) {
    throw new Error("Native share is not available");
  }
  await navigator.share(payload);
}
