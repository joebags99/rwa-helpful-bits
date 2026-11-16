import { MODULE_ID, loc, statusEffectList } from "./constants.mjs";
import * as settings from "./settings.mjs";

/**
 * Sort CONFIG.statusEffects alphabetically by localized name, and stamp each entry's `order`
 * so that Foundry's own HUD sorting (v14) agrees with the DOM ordering we apply on render.
 * Entries listed in the "pinned" setting stay at the top in the order given.
 */
export function applyStatusEffectOrder() {
  if ( !settings.get(settings.SETTINGS.alphabetizeHud) ) return;

  const pinned = String(settings.get(settings.SETTINGS.hudPinned) ?? "")
    .split(/[\s,;]+/).map(s => s.trim()).filter(Boolean);
  const pinIndex = id => {
    const i = pinned.indexOf(id);
    return i === -1 ? Infinity : i;
  };

  const list = statusEffectList();
  const sorted = list.slice().sort((a, b) => {
    const pa = pinIndex(a.id);
    const pb = pinIndex(b.id);
    if ( pa !== pb ) return pa - pb;
    return loc(a.name).localeCompare(loc(b.name), game.i18n.lang, { sensitivity: "base" });
  });
  sorted.forEach((e, i) => e.order = i + 1);

  // Rewrite the container in place so that other modules holding a reference still see the change.
  const effects = CONFIG.statusEffects;
  if ( Array.isArray(effects) ) effects.splice(0, effects.length, ...sorted);
  else {
    for ( const key of Object.keys(effects) ) delete effects[key];
    for ( const e of sorted ) effects[e.id] = e;
  }
}

/* -------------------------------------------- */

/**
 * Work out a display label for a status control element.
 * @param {HTMLElement} control
 * @returns {string}
 */
function labelFor(control) {
  const id = control.dataset.statusId;
  const fromConfig = id ? statusEffectList().find(e => e.id === id)?.name : null;
  const raw = fromConfig
    ?? control.dataset.tooltipText
    ?? control.dataset.tooltip
    ?? control.getAttribute("aria-label")
    ?? control.title
    ?? control.alt
    ?? control.querySelector?.("img")?.alt
    ?? id
    ?? "";
  // Strip any HTML that a tooltip enricher may have put in the attribute.
  const text = loc(raw).replace(/<[^>]*>/g, "").trim();
  return text;
}

/**
 * Decorate the Token HUD status palette: alphabetize the controls and add visible names.
 * Works with Foundry v13 (bare <img class="effect-control">) and v14 (<button data-action="effect">).
 * @param {Application|ApplicationV2} app
 * @param {HTMLElement|jQuery} html
 */
export function onRenderTokenHUD(app, html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  if ( !root ) return;
  const palette = root.querySelector(".status-effects");
  if ( !palette ) return;

  const alphabetize = settings.get(settings.SETTINGS.alphabetizeHud);
  const showLabels = settings.get(settings.SETTINGS.hudLabels);
  if ( !alphabetize && !showLabels ) return;

  // Collect the clickable controls. Only consider direct children so we don't grab nested images.
  const controls = Array.from(palette.children).filter(el => {
    if ( el.classList.contains("rwa-hb-label") ) return false;
    return el.matches(".effect-control, [data-action='effect'], [data-status-id]");
  });
  if ( !controls.length ) return;

  const entries = controls.map(control => ({ control, label: labelFor(control) }));

  if ( alphabetize ) {
    const pinned = String(settings.get(settings.SETTINGS.hudPinned) ?? "")
      .split(/[\s,;]+/).map(s => s.trim()).filter(Boolean);
    const pinIndex = id => {
      const i = pinned.indexOf(id);
      return i === -1 ? Infinity : i;
    };
    entries.sort((a, b) => {
      const pa = pinIndex(a.control.dataset.statusId);
      const pb = pinIndex(b.control.dataset.statusId);
      if ( pa !== pb ) return pa - pb;
      return a.label.localeCompare(b.label, game.i18n.lang, { sensitivity: "base" });
    });
  }

  // Remove any labels from a previous render of this same element.
  palette.querySelectorAll(".rwa-hb-label").forEach(el => el.remove());

  const legacy = entries.some(({ control }) => control.tagName === "IMG");
  palette.classList.toggle("rwa-hb-labeled", showLabels);
  palette.classList.toggle("rwa-hb-legacy", showLabels && legacy);
  palette.style.setProperty("--rwa-hb-cols", String(settings.get(settings.SETTINGS.hudColumns) || 2));

  for ( const { control, label } of entries ) {
    palette.appendChild(control);
    if ( !showLabels ) continue;

    const span = document.createElement("span");
    span.classList.add("rwa-hb-label");
    span.textContent = label;

    if ( control.tagName === "IMG" ) {
      // v13: the image itself is the control. Put the label beside it and forward clicks.
      control.after(span);
      span.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        control.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
      });
      span.addEventListener("contextmenu", event => {
        event.preventDefault();
        event.stopPropagation();
        control.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: 2 }));
      });
    } else {
      // v14: the control is a button; text inside it bubbles clicks to the action handler.
      control.appendChild(span);
    }
    control.classList.add("rwa-hb-control");
    if ( control.classList.contains("active") ) span.classList.add("active");
  }
}
