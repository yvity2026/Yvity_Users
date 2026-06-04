const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_YEAR = 365.2425;

function parseServiceDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function mergeExperienceRanges(services = []) {
  const today = new Date();
  const todayUtc = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  const ranges = services
    .map((service) => {
      const start = parseServiceDate(service?.from_year);
      const end = service?.to_year ? parseServiceDate(service.to_year) : todayUtc;

      if (!start || !end || end < start) {
        return null;
      }

      return { start, end };
    })
    .filter(Boolean)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const merged = [];

  for (const range of ranges) {
    const previous = merged[merged.length - 1];

    if (!previous) {
      merged.push({ ...range });
      continue;
    }

    if (range.start <= previous.end) {
      if (range.end > previous.end) {
        previous.end = range.end;
      }
      continue;
    }

    merged.push({ ...range });
  }

  return merged;
}

export function calculateTotalExperienceYears(services = []) {
  const totalDays = mergeExperienceRanges(services).reduce((sum, range) => {
    return (
      sum + Math.max(0, (range.end.getTime() - range.start.getTime()) / MS_PER_DAY)
    );
  }, 0);

  return (totalDays / DAYS_PER_YEAR).toFixed(1);
}

export function formatExperienceDisplay(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "0";
  }

  if (numericValue < 1) {
    return `${numericValue.toFixed(1)}yrs`;
  }

  return `${Math.floor(numericValue)}+yrs`;
}

export function calculateTotalClients(services = []) {
  return services.reduce((sum, service) => {
    const clients = Number(service?.no_of_clients ?? 0);
    return sum + (Number.isFinite(clients) && clients > 0 ? clients : 0);
  }, 0);
}

export function formatAverageRating(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "—";
  }

  return numeric.toFixed(1);
}
