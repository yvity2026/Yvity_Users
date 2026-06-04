/** Per-advisor JSON filenames under `.data/`. */

export function careerFileForUser(userId: string) {
  return `career-${userId}.json`;
}

export function galleryFileForUser(userId: string) {
  return `gallery-${userId}.json`;
}

export function achievementsFileForUser(userId: string) {
  return `achievements-${userId}.json`;
}

export function testimonialsFileForUser(userId: string) {
  return `testimonials-${userId}.json`;
}

export function settingsFileForUser(userId: string) {
  return `advisor-settings-${userId}.json`;
}
