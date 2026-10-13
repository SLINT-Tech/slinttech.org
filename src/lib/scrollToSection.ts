/**
 * Scroll an in-page section into view and move keyboard focus to it.
 *
 * In-page links that call preventDefault lose the browser's built-in focus
 * move, so without this the next Tab returns to the link that was activated.
 */
export const scrollToSection = (id: string): void => {
  const target = document.getElementById(id);
  if (!target) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });

  // sections are not focusable by default; -1 lets script focus them without adding a Tab stop
  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
  }
  target.focus({ preventScroll: true });
};
