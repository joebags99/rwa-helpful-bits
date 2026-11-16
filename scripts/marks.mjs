import { MODULE_ID, loc, warn, getStatusEffect, setStatusEffect, staticID, tokensForActor, isResponsibleClient } from "./constants.mjs";
import * as settings from "./settings.mjs";
import { MARK_ANIMATION, MARK_COLORS } from "./animation-defaults.mjs";
import { playStatusAnimation, stopStatusAnimation } from "./animations.mjs";

export const MARK_PREFIX = "rwa-mark-";

/* -------------------------------------------- */
/*  Configuration                               */
/* -------------------------------------------- */

function slugify(name) {
  return name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "mark";
}

/**
 * Parse the marks setting. One mark per line: `Name|color` or `Name|color|sequencer path`.
 * @returns {{id: string, name: string, owner: string, color: string, hex: string, img: string, file: string|null}[]}
 */
export function getMarks() {
  const raw = String(settings.get(settings.SETTINGS.marks) ?? "");
  const marks = [];
  const seen = new Set();
  for ( const line of raw.split(/\r?\n/) ) {
    const trimmed = line.trim();
    if ( !trimmed || trimmed.startsWith("#") ) continue;
    const [namePart, colorPart, filePart] = trimmed.split("|").map(s => s.trim());
    if ( !namePart ) continue;
    const color = MARK_COLORS[(colorPart ?? "").toLowerCase()] ? colorPart.toLowerCase() : "red";
    const slug = slugify(namePart);
    if ( seen.has(slug) ) continue;
    seen.add(slug);
    marks.push({
      id: `${MARK_PREFIX}${slug}`,
      owner: namePart,
      name: game.i18n.format("RWAHB.Marks.Name", { name: namePart }),
      color,
      hex: MARK_COLORS[color].hex,
      img: `modules/${MODULE_ID}/assets/marks/mark-${color}.svg`,
      file: filePart || null
    });
  }
  return marks;
}

export function isMarkStatus(statusId) {
  return typeof statusId === "string" && statusId.startsWith(MARK_PREFIX);
}

export function getMark(statusId) {
  return getMarks().find(m => m.id === statusId) ?? null;
}

/**
 * Find a mark by its owner's name (case-insensitive) or by status id.
 * @param {string} nameOrId
 */
export function findMark(nameOrId) {
  const needle = String(nameOrId ?? "").trim().toLowerCase();
  return getMarks().find(m => m.id === needle || m.owner.toLowerCase() === needle || m.id === `${MARK_PREFIX}${slugify(needle)}`) ?? null;
}

/**
 * Register one status effect per configured mark so they show up in the Token HUD.
 */
export function registerMarkStatusEffects() {
  for ( const mark of getMarks() ) {
    const existing = getStatusEffect(mark.id);
    setStatusEffect({
      ...(existing ?? {}),
      id: mark.id,
      _id: staticID(`rwahb${slugify(mark.owner)}`),
      name: mark.name,
      img: mark.img,
      hud: true,
      description: game.i18n.format("RWAHB.Marks.Description", { name: mark.owner })
    });
  }
}

/* -------------------------------------------- */
/*  Animation                                   */
/* -------------------------------------------- */

/**
 * Build the animation spec for a mark, colouring the JB2A loop to match.
 * @param {object} mark
 */
export function markAnimationSpec(mark) {
  const spec = foundry.utils.deepClone(MARK_ANIMATION);
  const colorInfo = MARK_COLORS[mark.color];
  if ( spec.sequencer && mark.file ) {
    // An explicit animation chosen for this hunter: play it as-is, no recolouring.
    spec.sequencer.file = mark.file;
    spec.sequencer.fallback = MARK_ANIMATION.sequencer.fallback;
  } else if ( spec.sequencer ) {
    spec.sequencer.file = spec.sequencer.file.replace("{color}", mark.color);
    // When the colour variant doesn't exist (free JB2A only ships green) the fallback green loop is
    // hue-shifted to the right colour by playStatusAnimation.
    const exists = globalThis.Sequencer?.Database?.entryExists?.(spec.sequencer.file);
    if ( !exists ) {
      if ( colorInfo.hue ) spec.sequencer.hue = colorInfo.hue;
      if ( colorInfo.desaturate ) spec.sequencer.desaturate = true;
    }
  }
  if ( Array.isArray(spec.tmfx) ) {
    const hex = Number.parseInt(mark.hex.replace("#", ""), 16);
    for ( const f of spec.tmfx ) if ( "color" in f ) f.color = hex;
  }
  return spec;
}

/** Spec resolver that covers both regular conditions and marks (for refreshTokenAnimations). */
export function specForStatus(statusId, fallback) {
  const mark = isMarkStatus(statusId) ? getMark(statusId) : null;
  if ( mark ) return settings.get(settings.SETTINGS.marksAnimate) ? markAnimationSpec(mark) : null;
  return fallback(statusId);
}

/* -------------------------------------------- */
/*  Chat                                        */
/* -------------------------------------------- */

async function postMarkMessage(actor, mark, applied) {
  if ( !settings.get(settings.SETTINGS.marksPostChat) ) return;
  const tokenDoc = tokensForActor(actor)[0] ?? null;
  const targetName = tokenDoc?.name ?? actor.name;
  const key = applied ? "RWAHB.Marks.Applied" : "RWAHB.Marks.Removed";
  const text = game.i18n.format(key, { owner: `<strong>${mark.owner}</strong>`, target: `<strong>${targetName}</strong>` });
  const content = `
<div class="rwa-hb-card rwa-hb-mark dnd5e2" style="--rwa-hb-mark-color: ${mark.hex}">
  <p class="rwa-hb-subject"><img src="${mark.img}" alt="${mark.name}"> ${text}</p>
</div>`;
  const whisper = settings.get(settings.SETTINGS.chatVisibility) === "gm" ? game.users.filter(u => u.isGM).map(u => u.id) : [];
  await ChatMessage.implementation.create({
    content, whisper,
    speaker: ChatMessage.implementation.getSpeaker({ alias: mark.owner }),
    flags: { [MODULE_ID]: { type: "mark", statusId: mark.id, applied } }
  });
}

/* -------------------------------------------- */
/*  Applying & removing                         */
/* -------------------------------------------- */

/**
 * Remove a mark from every other actor on the active scene (Hunter's Mark only marks one creature).
 * @param {object} mark
 * @param {Actor} keep   The actor that should keep the mark.
 */
async function clearMarkElsewhere(mark, keep) {
  const scene = canvas?.scene;
  if ( !scene ) return;
  const handled = new Set();
  for ( const tokenDoc of scene.tokens ) {
    const actor = tokenDoc.actor;
    if ( !actor || actor === keep || actor.uuid === keep?.uuid || handled.has(actor.uuid) ) continue;
    handled.add(actor.uuid);
    const effects = actor.effects.filter(e => e.statuses?.has(mark.id));
    if ( effects.length ) await actor.deleteEmbeddedDocuments("ActiveEffect", effects.map(e => e.id));
  }
}

/**
 * React to a mark effect being created.
 * @param {ActiveEffect} effect
 * @param {string} statusId
 */
export async function onMarkApplied(effect, statusId) {
  const mark = getMark(statusId);
  const actor = effect.parent;
  if ( !mark || !(actor instanceof Actor) ) return;
  if ( settings.get(settings.SETTINGS.marksExclusive) ) await clearMarkElsewhere(mark, actor);
  await postMarkMessage(actor, mark, true);
  if ( settings.get(settings.SETTINGS.marksAnimate) ) {
    for ( const tokenDoc of tokensForActor(actor) ) await playStatusAnimation(tokenDoc, statusId, markAnimationSpec(mark));
  }
}

/**
 * React to a mark effect being removed.
 */
export async function onMarkRemoved(effect, statusId) {
  const mark = getMark(statusId);
  const actor = effect.parent;
  if ( !mark || !(actor instanceof Actor) ) return;
  const stillMarked = actor.effects.some(e => e.id !== effect.id && !e.disabled && e.statuses?.has(statusId));
  if ( stillMarked ) return;
  await postMarkMessage(actor, mark, false);
  for ( const tokenDoc of tokensForActor(actor) ) await stopStatusAnimation(tokenDoc, statusId);
}

/**
 * Route created/deleted effects that carry a mark status. Returns the mark statuses handled.
 * @param {ActiveEffect} effect
 * @param {boolean} applied
 */
export async function handleMarkEffect(effect, applied) {
  const ids = Array.from(effect.statuses ?? []).filter(isMarkStatus);
  for ( const id of ids ) {
    if ( applied ) await onMarkApplied(effect, id);
    else await onMarkRemoved(effect, id);
  }
  return ids;
}

/* -------------------------------------------- */
/*  Macro-facing API                            */
/* -------------------------------------------- */

/**
 * Resolve the tokens a macro should act on: explicit tokens, then the user's targets, then controlled tokens.
 * @param {Token[]|TokenDocument[]} [tokens]
 * @returns {TokenDocument[]}
 */
function resolveTokens(tokens) {
  let list = tokens?.length ? Array.from(tokens)
    : game.user.targets.size ? Array.from(game.user.targets)
    : canvas?.tokens?.controlled ?? [];
  return list.map(t => t.document ?? t).filter(t => t?.actor);
}

/**
 * Toggle a character's Hunter's Mark on the targeted (or selected) tokens.
 * @param {string} ownerName          e.g. "Xanthe"
 * @param {Token[]} [tokens]          Tokens to toggle. Defaults to targets, then controlled tokens.
 * @param {object} [options]
 * @param {boolean} [options.active]  Force on (true) or off (false) instead of toggling.
 * @returns {Promise<boolean>}        Whether anything happened.
 */
export async function toggleMark(ownerName, tokens, { active } = {}) {
  const mark = findMark(ownerName);
  if ( !mark ) {
    ui.notifications.warn(game.i18n.format("RWAHB.Marks.Unknown", { name: ownerName }));
    return false;
  }
  if ( !getStatusEffect(mark.id) ) registerMarkStatusEffects();
  const docs = resolveTokens(tokens);
  if ( !docs.length ) {
    ui.notifications.warn(game.i18n.localize("RWAHB.Marks.NoTarget"));
    return false;
  }
  for ( const doc of docs ) {
    const actor = doc.actor;
    if ( !actor.isOwner ) {
      ui.notifications.warn(game.i18n.format("RWAHB.Marks.NoPermission", { name: doc.name }));
      continue;
    }
    await actor.toggleStatusEffect(mark.id, { active });
  }
  return true;
}

/** Remove a character's mark from every token on the scene. */
export async function clearMark(ownerName) {
  const mark = findMark(ownerName);
  if ( !mark ) return false;
  await clearMarkElsewhere(mark, null);
  return true;
}
