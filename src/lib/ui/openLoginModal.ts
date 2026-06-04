export const OPEN_LOGIN_MODAL_EVENT = "yvity:open-login";

export function openLoginModal() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_LOGIN_MODAL_EVENT));
}
