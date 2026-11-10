import { useEffect } from 'react';

const STAGGER_MS = 60;

/**
 * Adds `.is-visible` to `.reveal` elements as they scroll into view. Elements that enter
 * together get a 60 ms stagger via the --reveal-delay custom property.
 */
export function useReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.is-visible)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .forEach((e, i) => {
            e.target.style.setProperty('--reveal-delay', `${Math.min(i, 8) * STAGGER_MS}ms`);
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
