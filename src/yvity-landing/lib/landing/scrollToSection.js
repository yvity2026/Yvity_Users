function getTopBarOffset() {
  if (typeof window === "undefined") return 72;
  return window.matchMedia("(min-width: 1024px)").matches ? 76 : 68;
}

export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const top =
    el.getBoundingClientRect().top + window.scrollY - getTopBarOffset();

  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}
