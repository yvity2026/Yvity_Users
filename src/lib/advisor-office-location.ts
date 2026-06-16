/** Advisor office / business location for public “Get Directions” CTA. */
export type OfficeLocation = {
  /** Display label shown on the profile (full address or city/state fallback) */
  label: string;
  /** Direct Google Maps share link — used as href when set, bypasses search query */
  mapsLink?: string;
  latitude?: number;
  longitude?: number;
};

export function hasOfficeLocation(location?: OfficeLocation | null): boolean {
  return Boolean(location?.label?.trim() || location?.mapsLink?.trim());
}

export function googleMapsDirectionsUrl(location: OfficeLocation): string {
  // Prefer explicit Maps link — most precise, set by the advisor
  if (location.mapsLink?.trim()) return location.mapsLink.trim();

  const label = location.label.trim();
  if (
    location.latitude != null &&
    location.longitude != null &&
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude)
  ) {
    return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`;
}
