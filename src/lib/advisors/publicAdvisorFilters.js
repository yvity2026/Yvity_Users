const PLAN_PRIORITY = {
  gold: 2,
  silver: 1,
  free: 0,
};

function normalizeValue(value) {
  return (value ?? "").trim().toLowerCase();
}

export function compareAdvisors(left, right) {
  const leftPlanPriority =
    PLAN_PRIORITY[String(left?.subscription_plan || "free").toLowerCase()] ?? 0;
  const rightPlanPriority =
    PLAN_PRIORITY[String(right?.subscription_plan || "free").toLowerCase()] ?? 0;

  if (rightPlanPriority !== leftPlanPriority) {
    return rightPlanPriority - leftPlanPriority;
  }

  return Number(right?.score || 0) - Number(left?.score || 0);
}

export function filterAdvisors(advisors, filters = {}) {
  const city = normalizeValue(filters.city);
  const name = normalizeValue(filters.name);
  const state = normalizeValue(filters.state);
  const service = normalizeValue(filters.service);
  const company = normalizeValue(filters.company);

  return advisors.filter((advisor) => {
    const matchesCity =
      !city || normalizeValue(advisor.location).includes(city);
    const matchesName = !name || normalizeValue(advisor.name).includes(name);
    const matchesState =
      !state ||
      normalizeValue(advisor.state).includes(state) ||
      normalizeValue(advisor.location).includes(state);
    const matchesService =
      !service ||
      (advisor.serviceTypes ?? []).some(
        (serviceType) => normalizeValue(serviceType) === service,
      );
    const matchesCompany =
      !company ||
      (advisor.companies ?? []).some((entry) =>
        normalizeValue(entry).includes(company),
      );

    return (
      matchesCity && matchesName && matchesState && matchesService && matchesCompany
    );
  });
}
