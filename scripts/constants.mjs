export const MODULE_ID = "rwa-helpful-bits";
export const LOG_PREFIX = "RWA Helpful Bits |";

export function log(...args) {
  console.log(LOG_PREFIX, ...args);
}

export function warn(...args) {
  console.warn(LOG_PREFIX, ...args);
}

/**
 * Localize a string that may be a localization key or already-localized text.
 * @param {string} value
 * @returns {string}
 */
export function loc(value) {
  if ( !value ) return "";
  return game.i18n.has(value) ? game.i18n.localize(value) : value;
}

/**
 * Iterate CONFIG.statusEffects regardless of whether it is an array (Foundry v13)
 * or an object keyed by id (Foundry v14).
 * @returns {object[]}
 */
export function statusEffectList() {
  const effects = CONFIG.statusEffects ?? [];
  return Array.isArray(effects) ? effects : Object.values(effects);
}

/**
 * Look up a status effect configuration by id.
 * @param {string} id
 * @returns {object|undefined}
 */
export function getStatusEffect(id) {
  const effects = CONFIG.statusEffects ?? [];
  if ( Array.isArray(effects) ) return effects.find(e => e.id === id);
  return effects[id];
}

/**
 * Register (or replace) a status effect in CONFIG.statusEffects for either data shape.
 * @param {object} data  Must include `id`.
 */
export function setStatusEffect(data) {
  const effects = CONFIG.statusEffects;
  if ( Array.isArray(effects) ) {
    const idx = effects.findIndex(e => e.id === data.id);
    if ( idx >= 0 ) effects[idx] = data;
    else effects.push(data);
  } else {
    effects[data.id] = data;
  }
}

/**
 * Produce a 16-character static document id from a seed, the same way dnd5e does.
 * @param {string} seed
 * @returns {string}
 */
export function staticID(seed) {
  if ( globalThis.dnd5e?.utils?.staticID ) return dnd5e.utils.staticID(seed);
  const clean = seed.replace(/[^A-Za-z0-9]/g, "");
  if ( clean.length >= 16 ) return clean.substring(0, 16);
  return clean.padEnd(16, "0");
}

/**
 * Decide whether this client should act on a document event. The active GM handles it if
 * one is connected; otherwise the user who triggered the change does.
 * @param {string} userId  The id of the user who made the change.
 * @returns {boolean}
 */
export function isResponsibleClient(userId) {
  const gm = game.users.activeGM;
  if ( gm ) return gm.isSelf;
  return game.user.id === userId;
}

/**
 * Find the token document(s) that represent an actor on the active scene.
 * @param {Actor} actor
 * @returns {TokenDocument[]}
 */
export function tokensForActor(actor) {
  if ( !actor ) return [];
  if ( actor.isToken && actor.token ) return [actor.token];
  const tokens = actor.getActiveTokens(true, true);
  return tokens.length ? tokens : [];
}

/**
 * The HTML enricher for the running Foundry version.
 * @param {string} html
 * @param {object} [options]
 * @returns {Promise<string>}
 */
export async function enrich(html, options={}) {
  const TE = foundry.applications?.ux?.TextEditor?.implementation ?? globalThis.TextEditor;
  return TE.enrichHTML(html, { async: true, secrets: false, ...options });
}
