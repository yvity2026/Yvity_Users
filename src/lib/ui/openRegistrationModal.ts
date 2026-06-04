export const OPEN_REGISTRATION_MODAL_EVENT = "yvity:open-registration";

export function openRegistrationModal() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_REGISTRATION_MODAL_EVENT));
}
