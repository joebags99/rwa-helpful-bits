import { MODULE_ID, loc, enrich, getStatusEffect, tokensForActor } from "./constants.mjs";
import * as settings from "./settings.mjs";
import { CONDITION_TEXT } from "./condition-text.mjs";
import { playStatusAnimation, stopStatusAnimation } from "./animations.mjs";
import { MARK_PREFIX } from "./marks.mjs";

/* -------------------------------------------- */
/*  Descriptions                                */
/* -------------------------------------------- */

/**
 * Fetch the rules text for a status from the system's rules journal, if it has one.
 * @param {string} statusId
 * @returns {Promise<string|null>}
 */
async function systemDescription(statusId) {
  const reference = getStatusEffect(statusId)?.reference ?? CONFIG.DND5E?.conditionTypes?.[statusId]?.reference;
  if ( !reference ) return null;
  try {
    const page = await fromUuid(reference);
    const content = page?.text?.content;
    return content ? content : null;
  } catch(err) {
    return null;
  }
}

/**
 * Get the HTML description for a status effect, honouring the text source setting.
 * @param {string} statusId
 * @param {ActiveEffect} [effect]  The effect being applied, used as a last-resort description source.
 * @returns {Promise<string>}
 */
export async function getConditionDescription(statusId, effect) {
  const source = settings.get(settings.SETTINGS.conditionTextSource);
  const builtin = CONDITION_TEXT[statusId] ?? null;
  let html = null;
  if ( source === "builtin" ) html = builtin ?? await systemDescription(statusId);
  else html = await systemDescription(statusId) ?? builtin;
  html ??= effect?.description || "";
  return html;
}

/* -------------------------------------------- */
/*  Helpers                                     */
/* -------------------------------------------- */

/**
 * Which statuses on an effect should be announced. When an effect was created from a status
 * (its id matches the configured static id) only that status is announced, so that e.g.
 * "Sleeping" doesn't also announce its Incapacitated and Unconscious sub-statuses.
 * @param {ActiveEffect} effect
 * @returns {string[]}
 */
export function announcedStatuses(effect) {
  const statuses = Array.from(effect.statuses ?? []).filter(id => getStatusEffect(id) && !id.startsWith(MARK_PREFIX));
  if ( !statuses.length ) return [];
  const primary = statuses.find(id => getStatusEffect(id)?._id === effect.id);
  return primary ? [primary] : statuses;
}

/**
 * Does another active effect on the actor also grant this status?
 * @param {Actor} actor
 * @param {ActiveEffect} effect
 * @param {string} statusId
 * @returns {boolean}
 */
export function otherEffectGrants(actor, effect, statusId) {
  for ( const other of actor.allApplicableEffects?.() ?? actor.effects ) {
    if ( other.id === effect.id ) continue;
    if ( other.disabled || other.isSuppressed ) continue;
    if ( other.statuses?.has(statusId) ) return true;
  }
  return false;
}

/**
 * Rider tracking: remember recently announced statuses per actor so that rider effects
 * (e.g. Prone riding on Unconscious) can be skipped when the GM prefers.
 */
const recent = new Map();
function rememberAnnounced(actorUuid, statusId) {
  const key = `${actorUuid}|${statusId}`;
  recent.set(key, Date.now());
  setTimeout(() => recent.delete(key), 2000);
}
function isRider(actorUuid, statusId) {
  const now = Date.now();
  for ( const [key, time] of recent ) {
    if ( now - time > 2000 ) continue;
    const [uuid, parent] = key.split("|");
    if ( uuid !== actorUuid ) continue;
    const riders = getStatusEffect(parent)?.riders ?? [];
    if ( riders.includes(statusId) ) return true;
  }
  return false;
}

/**
 * The speaker and name for a status change on an actor.
 */
function subject(actor) {
  const tokenDoc = tokensForActor(actor)[0] ?? null;
  const speaker = ChatMessage.implementation.getSpeaker({ actor, token: tokenDoc });
  return { tokenDoc, speaker, name: tokenDoc?.name ?? actor.name };
}

function whisperTargets() {
  if ( settings.get(settings.SETTINGS.chatVisibility) === "gm" ) return game.users.filter(u => u.isGM).map(u => u.id);
  return [];
}

/* -------------------------------------------- */
/*  Chat cards                                  */
/* -------------------------------------------- */

/**
 * Post a chat card describing a condition that was just applied.
 * @param {Actor} actor
 * @param {string} statusId
 * @param {ActiveEffect} [effect]
 */
export async function postConditionCard(actor, statusId, effect) {
  const config = getStatusEffect(statusId);
  if ( !config ) return;
  const { speaker, name } = subject(actor);
  const label = loc(config.name);
  const description = await enrich(await getConditionDescription(statusId, effect), { relativeTo: actor });

  const content = `
<div class="rwa-hb-card dnd5e2">
  <header class="rwa-hb-header">
    <img src="${config.img}" alt="${label}">
    <h3>${label}</h3>
  </header>
  <p class="rwa-hb-subject">${game.i18n.format("RWAHB.Chat.Applied", { name: `<strong>${name}</strong>`, condition: label })}</p>
  <div class="rwa-hb-body">${description}</div>
</div>`;

  await ChatMessage.implementation.create({
    content, speaker, whisper: whisperTargets(),
    flags: { [MODULE_ID]: { type: "condition", statusId, applied: true } }
  });
}

/**
 * Post a short line noting that a condition ended.
 */
export async function postConditionRemoved(actor, statusId) {
  const config = getStatusEffect(statusId);
  if ( !config ) return;
  const { speaker, name } = subject(actor);
  const label = loc(config.name);
  const content = `
<div class="rwa-hb-card rwa-hb-removed dnd5e2">
  <p class="rwa-hb-subject"><img src="${config.img}" alt="${label}">
  ${game.i18n.format("RWAHB.Chat.Removed", { name: `<strong>${name}</strong>`, condition: label })}</p>
</div>`;
  await ChatMessage.implementation.create({
    content, speaker, whisper: whisperTargets(),
    flags: { [MODULE_ID]: { type: "condition", statusId, applied: false } }
  });
}

/* -------------------------------------------- */
/*  Hook handlers                               */
/* -------------------------------------------- */

/**
 * Handle a newly created effect: announce and animate each status it adds.
 * @param {ActiveEffect} effect
 */
export async function onEffectApplied(effect) {
  const actor = effect.parent;
  if ( !(actor instanceof Actor) ) return;
  if ( effect.disabled ) return;
  const statuses = announcedStatuses(effect);
  for ( const statusId of statuses ) {
    if ( otherEffectGrants(actor, effect, statusId) ) continue;   // already shown by another effect
    const rider = isRider(actor.uuid, statusId);
    rememberAnnounced(actor.uuid, statusId);

    if ( settings.get(settings.SETTINGS.postConditions) && (!rider || settings.get(settings.SETTINGS.postRiders)) ) {
      await postConditionCard(actor, statusId, effect);
    }
    for ( const tokenDoc of tokensForActor(actor) ) await playStatusAnimation(tokenDoc, statusId);
  }
}

/**
 * Handle a deleted effect: announce removal and stop animations for statuses nothing else grants.
 * @param {ActiveEffect} effect
 */
export async function onEffectRemoved(effect) {
  const actor = effect.parent;
  if ( !(actor instanceof Actor) ) return;
  const statuses = announcedStatuses(effect);
  for ( const statusId of statuses ) {
    if ( otherEffectGrants(actor, effect, statusId) ) continue;
    if ( settings.get(settings.SETTINGS.postConditions) && settings.get(settings.SETTINGS.postRemovals) ) {
      await postConditionRemoved(actor, statusId);
    }
    for ( const tokenDoc of tokensForActor(actor) ) await stopStatusAnimation(tokenDoc, statusId);
  }
}

/**
 * Handle an effect being enabled or disabled in place.
 * @param {ActiveEffect} effect
 * @param {object} changes
 */
export async function onEffectToggled(effect, changes) {
  if ( !("disabled" in changes) ) return;
  if ( changes.disabled ) return onEffectRemoved(effect);
  return onEffectApplied(effect);
}
