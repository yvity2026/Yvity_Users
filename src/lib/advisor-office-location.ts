/** Advisor office / business location for public “Get Directions” CTA. */
export type OfficeLocation = {
  /** Display label, e.g. "Hyderabad, Telangana" */
  label: string;
  latitude?: number;
  longitude?: number;
};

export function hasOfficeLocation(location?: OfficeLocation | null): boolean {
  return Boolean(location?.label?.trim());
}

export function googleMapsDirectionsUrl(location: OfficeLocation): string {
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
