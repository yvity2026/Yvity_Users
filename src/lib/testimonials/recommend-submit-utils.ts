export function getRecommendSubmitShortPath(advisorSlug: string): string {
  const slug = advisorSlug.trim();
  if (!slug) return "/testimonials/recommend";
  return `/testimonials/recommend?advisor=${encodeURIComponent(slug)}`;
}

export function getRecommendSubmitUrl(origin: string, advisorSlug: string): string {
  return `${origin.replace(/\/$/, "")}${getRecommendSubmitShortPath(advisorSlug)}`;
}

export type RecommendShareAdvisor = {
  name: string;
  title: string;
};

/** Prefilled message when advisor shares recommend link via WhatsApp. */
export function buildWhatsAppRecommendShareMessage(
  link: string,
  advisor: RecommendShareAdvisor,
): string {
  return `Hello,

This is ${advisor.name}, ${advisor.title}.

If you've had a good experience, I'd appreciate a quick recommendation on YVITY:

${link}

Thank you for your support.`;
}

export function whatsAppShareTextUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
