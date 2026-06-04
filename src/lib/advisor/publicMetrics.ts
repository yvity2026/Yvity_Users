const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_YEAR = 365.2425;

function parseServiceDate(value: unknown) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function mergeExperienceRanges(services: Array<{ from_year?: string; to_year?: string }> = []) {
  const today = new Date();
  const todayUtc = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  const ranges = services
    .map((service) => {
      const start = parseServiceDate(service?.from_year);
      const end = service?.to_year ? parseServiceDate(service.to_year) : todayUtc;
      if (!start || !end || end < start) return null;
      return { start, end };
    })
    .filter(Boolean)
    .sort((a, b) => a!.start.getTime() - b!.start.getTime()) as Array<{
    start: Date;
    end: Date;
  }>;

  const merged: Array<{ start: Date; end: Date }> = [];

  for (const range of ranges) {
    const previous = merged[merged.length - 1];
    if (!previous) {
      merged.push({ ...range });
      continue;
    }
    if (range.start <= previous.end) {
      if (range.end > previous.end) previous.end = range.end;
      continue;
    }
    merged.push({ ...range });
  }

  return merged;
}

export function calculateTotalExperienceYears(
  services: Array<{ from_year?: string; to_year?: string }> = [],
) {
  const totalDays = mergeExperienceRanges(services).reduce((sum, range) => {
    return sum + Math.max(0, (range.end.getTime() - range.start.getTime()) / MS_PER_DAY);
  }, 0);

  return String(Math.max(0, Math.round(totalDays / DAYS_PER_YEAR)));
}

export function calculateTotalClients(
  services: Array<{ no_of_clients?: number | string }> = [],
) {
  const total = services.reduce((sum, service) => {
    const value = Number(service?.no_of_clients ?? 0);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  return String(total);
}
