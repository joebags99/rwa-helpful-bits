import { MODULE_ID, log, isResponsibleClient } from "./constants.mjs";
import { registerSettings } from "./settings.mjs";
import { applyStatusEffectOrder, onRenderTokenHUD, debugHud } from "./hud.mjs";
import * as conditions from "./conditions.mjs";
import * as animations from "./animations.mjs";
import * as marks from "./marks.mjs";
import { DEFAULT_ANIMATIONS } from "./animation-defaults.mjs";
import { maybeRepair, repairStatusEffects } from "./repair.mjs";
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
  // Other modules may have rewritten the status list during setup/ready; check now and once more after
  // every ready hook has had its turn.
  repairAndReapply();
  setTimeout(repairAndReapply, 0);
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
    defaultAnimations: DEFAULT_ANIMATIONS,
    debugHud,
    repairStatusEffects
  };
  log("Ready", { sequencer: animations.hasSequencer(), tokenMagic: animations.hasTokenMagic() });
});

/* -------------------------------------------- */
/*  Token HUD                                   */
/* -------------------------------------------- */

// A late conversion of the status list to an array would still break lookups; re-check whenever a token is
// selected, which always happens before its HUD can open.
Hooks.on("controlToken", (token, controlled) => { if ( controlled ) repairAndReapply(); });
Hooks.on("renderTokenHUD", onRenderTokenHUD);

/** Repair the status list if another module broke it, then put our marks and ordering back. */
function repairAndReapply() {
  if ( maybeRepair() === null ) return;
  marks.registerMarkStatusEffects();
  applyStatusEffectOrder();
}

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
