import { MODULE_ID, warn } from "./constants.mjs";
import * as settings from "./settings.mjs";
import { DEFAULT_ANIMATIONS } from "./animation-defaults.mjs";

/* -------------------------------------------- */
/*  Availability                                */
/* -------------------------------------------- */

export function hasSequencer() {
  return !!(game.modules.get("sequencer")?.active && globalThis.Sequence && globalThis.Sequencer);
}

export function hasTokenMagic() {
  return !!(game.modules.get("tokenmagic")?.active && globalThis.TokenMagic);
}

/**
 * Resolve a Sequencer database path or file path to something playable.
 * @param {string} file
 * @returns {string|null}
 */
function resolveSequencerFile(file) {
  if ( !file ) return null;
  if ( /\.(webm|webp|mp4|png|gif|svg|jpg)$/i.test(file) ) return file;  // direct file path
  try {
    return Sequencer.Database.entryExists(file) ? file : null;
  } catch(err) {
    return null;
  }
}

/* -------------------------------------------- */
/*  Configuration                               */
/* -------------------------------------------- */

/**
 * The effective animation map: saved settings merged over the defaults.
 * @returns {object}
 */
export function getAnimationMap() {
  let saved = settings.get(settings.SETTINGS.animationMap);
  if ( typeof saved === "string" ) {
    try { saved = JSON.parse(saved); }
    catch(err) { saved = {}; }
  }
  return foundry.utils.mergeObject(foundry.utils.deepClone(DEFAULT_ANIMATIONS), saved ?? {}, { inplace: false });
}

export function getAnimationSpec(statusId) {
  return getAnimationMap()[statusId] ?? null;
}

/* -------------------------------------------- */
/*  Naming                                      */
/* -------------------------------------------- */

const effectName = (statusId) => `${MODULE_ID}.${statusId}`;
const filterId = (statusId, index) => `${MODULE_ID}-${statusId}-${index}`;

/* -------------------------------------------- */
/*  Playing & stopping                          */
/* -------------------------------------------- */

/**
 * Play the animation configured for a status on a token.
 * @param {TokenDocument} tokenDoc
 * @param {string} statusId
 * @param {object} [spec]     Override spec (used for Hunter's Marks). Defaults to the configured map entry.
 * @returns {Promise<boolean>}  Whether anything was played.
 */
export async function playStatusAnimation(tokenDoc, statusId, spec) {
  if ( !settings.get(settings.SETTINGS.animationsEnabled) ) return false;
  spec ??= getAnimationSpec(statusId);
  if ( !spec || !tokenDoc ) return false;

  // Sequencer first.
  if ( hasSequencer() && spec.sequencer ) {
    const s = spec.sequencer;
    const file = resolveSequencerFile(s.file) ?? resolveSequencerFile(s.fallback);
    if ( file ) {
      const target = tokenDoc.object ?? tokenDoc;
      try {
        const seq = new Sequence(MODULE_ID).effect()
          .file(file)
          .attachTo(target, { bindAlpha: false, bindVisibility: true })
          .scaleToObject(s.scale ?? 1)
          .persist()
          .name(effectName(statusId))
          .fadeIn(s.fadeIn ?? 400)
          .fadeOut(s.fadeOut ?? 400);
        if ( s.offsetY || s.offsetX ) seq.spriteOffset({ x: s.offsetX ?? 0, y: s.offsetY ?? 0 }, { gridUnits: true });
        if ( s.opacity !== undefined ) seq.opacity(s.opacity);
        if ( s.tint ) seq.tint(s.tint);
        if ( s.hue || s.desaturate ) {
          const matrix = {};
          if ( s.hue ) matrix.hue = s.hue;
          if ( s.desaturate ) matrix.saturate = -1;
          seq.filter("ColorMatrix", matrix);
        }
        if ( s.belowToken ) seq.belowTokens();
        if ( s.playbackRate ) seq.playbackRate(s.playbackRate);
        if ( s.randomRotation ) seq.randomRotation();
        await seq.play();
        return true;
      } catch(err) {
        warn(`Sequencer failed to play ${file} for ${statusId}`, err);
      }
    }
  }

  // Token Magic FX fallback.
  if ( hasTokenMagic() && Array.isArray(spec.tmfx) && spec.tmfx.length ) {
    const token = tokenDoc.object;
    if ( !token ) return false;
    try {
      const params = spec.tmfx.map((p, i) => ({ ...foundry.utils.deepClone(p), filterId: filterId(statusId, i) }));
      await TokenMagic.addUpdateFilters(token, params);
      return true;
    } catch(err) {
      warn(`Token Magic FX failed for ${statusId}`, err);
    }
  }
  return false;
}

/**
 * Stop the animation for a status on a token.
 * @param {TokenDocument} tokenDoc
 * @param {string} statusId
 */
export async function stopStatusAnimation(tokenDoc, statusId) {
  if ( !tokenDoc ) return;
  if ( hasSequencer() ) {
    try {
      await Sequencer.EffectManager.endEffects({ name: effectName(statusId), object: tokenDoc.object ?? tokenDoc });
    } catch(err) {
      warn(`Sequencer failed to end ${statusId}`, err);
    }
  }
  if ( hasTokenMagic() && tokenDoc.object ) {
    try {
      const prefix = `${MODULE_ID}-${statusId}-`;
      for ( const id of tmfxFilterIds(tokenDoc) ) {
        if ( id.startsWith(prefix) ) await TokenMagic.deleteFilters(tokenDoc.object, id);
      }
    } catch(err) {
      warn(`Token Magic FX failed to remove ${statusId}`, err);
    }
  }
}

/**
 * The Token Magic FX filter ids currently stored on a token (TMFX keeps them in a token flag).
 * @param {TokenDocument} tokenDoc
 * @returns {string[]}
 */
function tmfxFilterIds(tokenDoc) {
  const flags = tokenDoc.flags?.tokenmagic?.filters ?? [];
  return flags.map(f => f?.tmFilters?.tmFilterId ?? f?.filterId).filter(id => typeof id === "string");
}

/**
 * Remove every animation this module put on a token, then re-apply the ones its current statuses call for.
 * @param {TokenDocument} tokenDoc
 * @param {Function} [specFor]  Optional resolver (statusId) => spec, used so marks can supply their own spec.
 */
export async function refreshTokenAnimations(tokenDoc, specFor = getAnimationSpec) {
  if ( !tokenDoc?.actor ) return;
  const statuses = Array.from(tokenDoc.actor.statuses ?? []);
  if ( hasSequencer() ) {
    try {
      const running = Sequencer.EffectManager.getEffects({ object: tokenDoc.object ?? tokenDoc }) ?? [];
      for ( const e of running ) {
        const name = e.data?.name ?? "";
        if ( name.startsWith(`${MODULE_ID}.`) ) await Sequencer.EffectManager.endEffects({ name, object: tokenDoc.object ?? tokenDoc });
      }
    } catch(err) { warn("Failed to clear Sequencer effects", err); }
  }
  if ( hasTokenMagic() && tokenDoc.object ) {
    try {
      for ( const id of tmfxFilterIds(tokenDoc) ) {
        if ( id.startsWith(`${MODULE_ID}-`) ) await TokenMagic.deleteFilters(tokenDoc.object, id);
      }
    } catch(err) { warn("Failed to clear Token Magic filters", err); }
  }
  for ( const statusId of statuses ) {
    const spec = specFor(statusId);
    if ( spec ) await playStatusAnimation(tokenDoc, statusId, spec);
  }
}
