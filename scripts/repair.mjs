import { MODULE_ID, warn, log, loc, staticID } from "./constants.mjs";
import * as settings from "./settings.mjs";

/**
 * Foundry v14 keeps CONFIG.statusEffects as an object keyed by status id. Some modules written for
 * earlier versions turn it back into an array (and drop entries while doing so), after which core can
 * no longer look conditions up by id: the Token HUD shows only part of the list and
 * ActiveEffect.fromStatusEffect throws "Invalid status ID". This rebuilds the object, keeping every
 * entry that survived (array elements and stray named properties) and restoring any dnd5e condition
 * that went missing.
 * @returns {string[]|null}  Ids restored, or null if nothing needed doing.
 */
export function repairStatusEffects() {
  const container = CONFIG.statusEffects;
  const v14 = typeof foundry.utils.iterateValues === "function";
  if ( !v14 || !Array.isArray(container) ) return null;

  const rebuilt = {};
  const add = effect => {
    if ( effect?.id && !(effect.id in rebuilt) ) rebuilt[effect.id] = effect;
  };
  for ( const effect of container ) add(effect);
  for ( const key of Object.keys(container) ) {
    if ( Number.isInteger(Number(key)) ) continue;
    add(container[key]);
  }

  // Restore dnd5e's own statuses if they were dropped.
  const restored = [];
  const dnd = CONFIG.DND5E;
  if ( dnd ) {
    const groups = [
      [dnd.statusEffects ?? {}, {}],
      [dnd.conditionTypes ?? {}, {}],
      [dnd.encumbrance?.effects ?? {}, { hud: false }]
    ];
    for ( const [group, extra] of groups ) {
      for ( const [id, data] of Object.entries(group) ) {
        if ( id in rebuilt ) continue;
        const { special, ...rest } = foundry.utils.deepClone(data);
        const effect = { id, ...rest, ...extra, _id: staticID(`dnd5e${id}`) };
        effect.name = loc(effect.name);
        effect.order ??= Infinity;
        rebuilt[id] = effect;
        restored.push(id);
      }
    }
  }

  CONFIG.statusEffects = rebuilt;
  log(`Another module had turned CONFIG.statusEffects into an array; rebuilt it as an object with ${Object.keys(rebuilt).length} entries.`
    + (restored.length ? ` Restored: ${restored.join(", ")}` : ""));
  return restored;
}

/** Run the repair if enabled. Safe to call repeatedly. */
export function maybeRepair() {
  if ( !settings.get(settings.SETTINGS.repairStatusEffects) ) return null;
  try {
    return repairStatusEffects();
  } catch(err) {
    warn("Status effect repair failed", err);
    return null;
  }
}
