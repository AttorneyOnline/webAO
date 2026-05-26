import { AO_HOST } from "../client/aoHost";

const getFavKey = () => `favourites_${AO_HOST}`;

export const getFavourites = (): Set<number> => {
  try {
    const raw = localStorage.getItem(getFavKey());
    if (raw) return new Set(JSON.parse(raw) as number[]);
  } catch {
    // ignore parse errors
  }
  return new Set();
};

const saveFavourites = (favs: Set<number>) => {
  localStorage.setItem(getFavKey(), JSON.stringify([...favs]));
};

/**
 * Re-orders the character grid so that favourited characters appear first.
 */
export const sortFavourites = () => {
  const favs = getFavourites();
  const chartable = document.getElementById("client_chartable");
  if (!chartable) return;

  const slots = Array.from(
    chartable.querySelectorAll<HTMLDivElement>(".char-slot"),
  );

  slots.sort((a, b) => {
    const aid = Number(a.dataset.charid);
    const bid = Number(b.dataset.charid);
    const afav = favs.has(aid) ? 0 : 1;
    const bfav = favs.has(bid) ? 0 : 1;
    return afav - bfav;
  });

  const fragment = document.createDocumentFragment();
  slots.forEach((slot) => fragment.appendChild(slot));
  chartable.appendChild(fragment);
};

/**
 * Marks the star buttons for all saved favourites and sorts the grid.
 * Call this after the character grid has been built.
 */
export const applyFavourites = () => {
  const favs = getFavourites();
  favs.forEach((charid) => {
    const btn = document.querySelector<HTMLButtonElement>(
      `[data-charid="${charid}"] .fav-btn`,
    );
    if (btn) btn.classList.add("active");
  });
  sortFavourites();
};

/**
 * Toggles a character's favourite status.
 * @param charid  The character's slot index
 * @param event   The click event (propagation is stopped so pickChar is not called)
 */
export function toggleFavourite(charid: number, event: Event) {
  event.stopPropagation();
  const favs = getFavourites();
  const btn = document.querySelector<HTMLButtonElement>(
    `[data-charid="${charid}"] .fav-btn`,
  );

  if (favs.has(charid)) {
    favs.delete(charid);
    if (btn) btn.classList.remove("active");
  } else {
    favs.add(charid);
    if (btn) btn.classList.add("active");
  }

  saveFavourites(favs);
  sortFavourites();
}
window.toggleFavourite = toggleFavourite;
