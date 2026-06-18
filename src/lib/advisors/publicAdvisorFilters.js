const PLAN_PRIORITY = {
  gold: 2,
  silver: 1,
  free: 0,
};

function normalizeValue(value) {
  return (value ?? "").trim().toLowerCase();
}

export function compareAdvisors(left, right) {
  const leftPlan =
    PLAN_PRIORITY[String(left?.subscription_plan || "free").toLowerCase()] ?? 0;
  const rightPlan =
    PLAN_PRIORITY[String(right?.subscription_plan || "free").toLowerCase()] ?? 0;

  if (rightPlan !== leftPlan) return rightPlan - leftPlan;

  const scoreDiff = Number(right?.score || 0) - Number(left?.score || 0);
  if (scoreDiff !== 0) return scoreDiff;

  const ratingDiff = Number(right?.avgRating || 0) - Number(left?.avgRating || 0);
  if (ratingDiff !== 0) return ratingDiff;

  return Number(right?.recs || 0) - Number(left?.recs || 0);
}

export function filterAdvisors(advisors, filters = {}) {
  const city = normalizeValue(filters.city);
  const name = normalizeValue(filters.name);
  // `query` is the main search box — matches name, city, AND service (broad search)
  const query = normalizeValue(filters.query);
  const state = normalizeValue(filters.state);
  const service = normalizeValue(filters.service);
  const company = normalizeValue(filters.company);

  return advisors.filter((advisor) => {
    const advisorName = normalizeValue(advisor.name);
    // Check both location and city fields — Supabase card uses location, raw DB may use city
    const advisorCity = normalizeValue(advisor.location || advisor.city);
    const advisorServices = (advisor.serviceTypes ?? []).map(normalizeValue);
    const advisorTitle = normalizeValue(advisor.title);

    // Dedicated city filter (from advanced filters panel)
    const matchesCity = !city || advisorCity.includes(city);

    // Dedicated name filter
    const matchesName = !name || advisorName.includes(name);

    const matchesState =
      !state ||
      normalizeValue(advisor.state).includes(state) ||
      advisorCity.includes(state);

    // Dedicated service filter (dropdown) — partial match so "life" matches "life insurance"
    const matchesService =
      !service ||
      advisorServices.some((s) => s.includes(service) || service.includes(s));

    const matchesCompany =
      !company ||
      (advisor.companies ?? []).some((entry) =>
        normalizeValue(entry).includes(company),
      );

    // Main search box: matches name, city, service type, or title (broad)
    const matchesQuery =
      !query ||
      advisorName.includes(query) ||
      advisorCity.includes(query) ||
      advisorServices.some((s) => s.includes(query)) ||
      advisorTitle.includes(query);

    return (
      matchesQuery && matchesCity && matchesName && matchesState && matchesService && matchesCompany
    );
  });
}
