/**
 * Lazy-loads character icons via IntersectionObserver. The icon URL
 * lives in `data-icon-url`; once the slot scrolls into view, it gets
 * copied onto `src` and the image loads.
 *
 * Why: setting `src` on thousands of icons up front leaves them all
 * with `.complete === false`, which blocks window.load from firing
 * (and keeps the tab spinner stuck). With this scheme, every img
 * starts out with no src (and thus `.complete === true`), so the
 * page's load event can fire normally.
 */
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const img = entry.target as HTMLImageElement;
      const url = img.dataset.iconUrl;
      if (url) img.src = url;
      observer.unobserve(img);
    }
  },
  { rootMargin: "200px" },
);

export function observeCharIcon(img: HTMLImageElement) {
  observer.observe(img);
}
