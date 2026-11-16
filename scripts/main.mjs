import { MODULE_ID, log, isResponsibleClient } from "./constants.mjs";
import { registerSettings } from "./settings.mjs";
import { applyStatusEffectOrder, onRenderTokenHUD } from "./hud.mjs";
import * as conditions from "./conditions.mjs";
import * as animations from "./animations.mjs";
import * as marks from "./marks.mjs";
import { DEFAULT_ANIMATIONS } from "./animation-defaults.mjs";
import { CONDITION_TEXT } from "./condition-text.mjs";

Hooks.once("init", () => {
  registerSettings();
  log("Initialized");
});

// dnd5e builds CONFIG.statusEffects during i18nInit; setup runs after every system/module init.
Hooks.once("setup", () => {
  marks.registerMarkStatusEffects();
  applyStatusEffectOrder();
});

Hooks.once("ready", () => {
  const module = game.modules.get(MODULE_ID);
  module.api = {
    // Hunter's Marks
    toggleMark: marks.toggleMark,
    clearMark: marks.clearMark,
    getMarks: marks.getMarks,
    // Conditions
    postCondition: conditions.postConditionCard,
    getConditionDescription: conditions.getConditionDescription,
    conditionText: CONDITION_TEXT,
    // Animations
    playStatusAnimation: animations.playStatusAnimation,
    stopStatusAnimation: animations.stopStatusAnimation,
    refreshTokenAnimations: tokenDoc => animations.refreshTokenAnimations(
      tokenDoc?.document ?? tokenDoc, id => marks.specForStatus(id, animations.getAnimationSpec)),
    getAnimationMap: animations.getAnimationMap,
    defaultAnimations: DEFAULT_ANIMATIONS
  };
  log("Ready", { sequencer: animations.hasSequencer(), tokenMagic: animations.hasTokenMagic() });
});

/* -------------------------------------------- */
/*  Token HUD                                   */
/* -------------------------------------------- */

Hooks.on("renderTokenHUD", onRenderTokenHUD);

/* -------------------------------------------- */
/*  Active effect lifecycle                     */
/* -------------------------------------------- */

Hooks.on("createActiveEffect", async (effect, options, userId) => {
  if ( !isResponsibleClient(userId) ) return;
  if ( !(effect.parent instanceof Actor) ) return;
  await marks.handleMarkEffect(effect, true);
  await conditions.onEffectApplied(effect);
});

Hooks.on("deleteActiveEffect", async (effect, options, userId) => {
  if ( !isResponsibleClient(userId) ) return;
  if ( !(effect.parent instanceof Actor) ) return;
  await marks.handleMarkEffect(effect, false);
  await conditions.onEffectRemoved(effect);
});

Hooks.on("updateActiveEffect", async (effect, changes, options, userId) => {
  if ( !isResponsibleClient(userId) ) return;
  if ( !(effect.parent instanceof Actor) ) return;
  if ( !("disabled" in changes) ) return;
  await marks.handleMarkEffect(effect, !changes.disabled);
  await conditions.onEffectToggled(effect, changes);
});
