const META_MARKER = "\n---YVITY-META---\n";

/** Embed YVITY-Gold-only fields in a DB text column (testimonial content, etc.). */
export function embedGoldMeta(content: string, meta: Record<string, unknown>): string {
  const quote = content.trim();
  if (!Object.keys(meta).length) return quote;
  return `${quote}${META_MARKER}${JSON.stringify(meta)}`;
}

export function parseGoldMeta(raw: string): { text: string; meta: Record<string, unknown> } {
  const idx = raw.indexOf(META_MARKER);
  if (idx === -1) return { text: raw, meta: {} };
  const text = raw.slice(0, idx);
  try {
    const meta = JSON.parse(raw.slice(idx + META_MARKER.length)) as Record<string, unknown>;
    return { text, meta: meta && typeof meta === "object" ? meta : {} };
  } catch {
    return { text: raw, meta: {} };
  }
}

const REC_META_TAG = "__yvity_meta__";

export function tagsWithRecommendationMeta(
  tags: string[],
  meta: { fullName: string; comment?: string },
): string[] {
  return [...tags, `${REC_META_TAG}${JSON.stringify(meta)}`];
}

export function parseRecommendationTags(raw: string[]): {
  tags: string[];
  fullName: string;
  comment?: string;
} {
  const tags: string[] = [];
  let fullName = "Recommender";
  let comment: string | undefined;

  for (const entry of raw) {
    if (entry.startsWith(REC_META_TAG)) {
      try {
        const parsed = JSON.parse(entry.slice(REC_META_TAG.length)) as {
          fullName?: string;
          comment?: string;
        };
        if (parsed.fullName?.trim()) fullName = parsed.fullName.trim();
        if (parsed.comment?.trim()) comment = parsed.comment.trim();
      } catch {
        /* ignore malformed meta tag */
      }
      continue;
    }
    tags.push(entry);
  }

  return { tags, fullName, comment };
}
