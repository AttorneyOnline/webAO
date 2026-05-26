import { client } from "../client";
import { AO_HOST } from "../client/aoHost";
import { resolveAndPreloadImage } from "../utils/assetCache";

const PREVIEW_OFFSET = 16;
const HOVER_DELAY_MS = 400;

let previewEl: HTMLDivElement | null = null;
let previewImg: HTMLImageElement | null = null;
let previewLabel: HTMLDivElement | null = null;
let activeButton: HTMLElement | null = null;
let activeToken = 0;
let openTimer: number | null = null;

function buildIdleUrls(charactername: string, emotename: string): string[] {
  const characterFolder = `${AO_HOST}characters/`;
  const urls: string[] = [];
  for (const extension of client.emote_extensions) {
    if (extension === ".png") {
      urls.push(`${characterFolder}${encodeURI(charactername)}/${encodeURI(emotename)}${extension}`);
    } else if (extension === ".webp.static") {
      urls.push(`${characterFolder}${encodeURI(charactername)}/${encodeURI(emotename)}.webp`);
    } else {
      urls.push(`${characterFolder}${encodeURI(charactername)}/(a)${encodeURI(emotename)}${extension}`);
    }
  }
  return urls;
}

function ensurePreviewEl(): { root: HTMLDivElement; img: HTMLImageElement; label: HTMLDivElement } {
  if (previewEl && previewImg && previewLabel) {
    return { root: previewEl, img: previewImg, label: previewLabel };
  }
  const root = document.createElement("div");
  root.id = "sprite_preview";
  root.style.display = "none";
  const img = document.createElement("img");
  img.className = "sprite_preview_img";
  const label = document.createElement("div");
  label.className = "sprite_preview_label";
  root.appendChild(img);
  root.appendChild(label);
  document.body.appendChild(root);
  previewEl = root;
  previewImg = img;
  previewLabel = label;
  return { root, img, label };
}

function positionPreview(event: MouseEvent) {
  if (!previewEl || previewEl.style.display === "none") return;
  const width = previewEl.offsetWidth || 192;
  const height = previewEl.offsetHeight || 192;
  let x = event.clientX + PREVIEW_OFFSET;
  let y = event.clientY + PREVIEW_OFFSET;
  if (x + width > window.innerWidth) x = event.clientX - width - PREVIEW_OFFSET;
  if (y + height > window.innerHeight) y = event.clientY - height - PREVIEW_OFFSET;
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  previewEl.style.left = `${x}px`;
  previewEl.style.top = `${y}px`;
}

function clearOpenTimer() {
  if (openTimer !== null) {
    clearTimeout(openTimer);
    openTimer = null;
  }
}

function hidePreview() {
  activeButton = null;
  activeToken++;
  clearOpenTimer();
  if (previewEl) {
    previewEl.style.display = "none";
    if (previewImg) previewImg.removeAttribute("src");
  }
}

export function attachSpritePreview(
  button: HTMLElement,
  charactername: string,
  emotename: string,
  desc: string,
) {
  let lastEvent: MouseEvent | null = null;

  button.addEventListener("mouseenter", (event) => {
    activeButton = button;
    lastEvent = event as MouseEvent;
    const token = ++activeToken;
    clearOpenTimer();
    openTimer = window.setTimeout(async () => {
      if (token !== activeToken || activeButton !== button) return;
      const url = await resolveAndPreloadImage(buildIdleUrls(charactername, emotename));
      if (token !== activeToken || activeButton !== button) return;
      const { img, label } = ensurePreviewEl();
      img.src = url;
      label.textContent = desc;
      previewEl!.style.display = "";
      if (lastEvent) positionPreview(lastEvent);
    }, HOVER_DELAY_MS);
  });

  button.addEventListener("mousemove", (event) => {
    lastEvent = event as MouseEvent;
    positionPreview(event as MouseEvent);
  });

  button.addEventListener("mouseleave", () => {
    if (activeButton === button) hidePreview();
  });
}
