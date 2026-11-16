import { MODULE_ID } from "./constants.mjs";
import { DEFAULT_ANIMATIONS } from "./animation-defaults.mjs";
import { AnimationConfig } from "./animation-config.mjs";

export const SETTINGS = {
  alphabetizeHud: "alphabetizeHud",
  hudLabels: "hudLabels",
  hudColumns: "hudColumns",
  hudPinned: "hudPinned",
  postConditions: "postConditions",
  postRemovals: "postRemovals",
  postRiders: "postRiders",
  conditionTextSource: "conditionTextSource",
  chatVisibility: "chatVisibility",
  animationsEnabled: "animationsEnabled",
  animationMap: "animationMap",
  marks: "marks",
  marksExclusive: "marksExclusive",
  marksPostChat: "marksPostChat",
  marksAnimate: "marksAnimate",
  repairStatusEffects: "repairStatusEffects"
};

export function get(key) {
  return game.settings.get(MODULE_ID, key);
}

export function set(key, value) {
  return game.settings.set(MODULE_ID, key, value);
}

export function registerSettings() {
  const register = (key, data) => game.settings.register(MODULE_ID, key, {
    name: `RWAHB.Settings.${key}.Name`,
    hint: `RWAHB.Settings.${key}.Hint`,
    ...data
  });

  /* ---------------- Token HUD ---------------- */

  register(SETTINGS.repairStatusEffects, {
    scope: "world", config: true, type: Boolean, default: true
  });

  register(SETTINGS.alphabetizeHud, {
    scope: "world", config: true, type: Boolean, default: true, requiresReload: true
  });

  register(SETTINGS.hudPinned, {
    scope: "world", config: true, type: String, default: "dead", requiresReload: true
  });

  register(SETTINGS.hudLabels, {
    scope: "client", config: true, type: Boolean, default: true
  });

  register(SETTINGS.hudColumns, {
    scope: "client", config: true, type: Number, default: 2,
    range: { min: 1, max: 4, step: 1 }
  });

  /* ---------------- Condition chat ---------------- */

  register(SETTINGS.postConditions, {
    scope: "world", config: true, type: Boolean, default: true
  });

  register(SETTINGS.postRemovals, {
    scope: "world", config: true, type: Boolean, default: true
  });

  register(SETTINGS.postRiders, {
    scope: "world", config: true, type: Boolean, default: false
  });

  register(SETTINGS.conditionTextSource, {
    scope: "world", config: true, type: String, default: "system",
    choices: {
      system: "RWAHB.Settings.conditionTextSource.System",
      builtin: "RWAHB.Settings.conditionTextSource.Builtin"
    }
  });

  register(SETTINGS.chatVisibility, {
    scope: "world", config: true, type: String, default: "public",
    choices: {
      public: "RWAHB.Settings.chatVisibility.Public",
      gm: "RWAHB.Settings.chatVisibility.GM"
    }
  });

  /* ---------------- Animations ---------------- */

  register(SETTINGS.animationsEnabled, {
    scope: "world", config: true, type: Boolean, default: true
  });

  game.settings.registerMenu(MODULE_ID, "animationConfig", {
    name: "RWAHB.Settings.animationConfig.Name",
    label: "RWAHB.Settings.animationConfig.Label",
    hint: "RWAHB.Settings.animationConfig.Hint",
    icon: "fas fa-wand-sparkles",
    type: AnimationConfig,
    restricted: true
  });

  register(SETTINGS.animationMap, {
    scope: "world", config: false, type: Object, default: foundry.utils.deepClone(DEFAULT_ANIMATIONS)
  });

  /* ---------------- Hunter's Marks ---------------- */

  register(SETTINGS.marks, {
    scope: "world", config: true, type: String, default: "Xanthe|purple|jb2a.energy_strands.02.marker.bluepurple\nMarik|green|jb2a.energy_strands.02.marker.green",
    requiresReload: true
  });

  register(SETTINGS.marksExclusive, {
    scope: "world", config: true, type: Boolean, default: true
  });

  register(SETTINGS.marksPostChat, {
    scope: "world", config: true, type: Boolean, default: true
  });

  register(SETTINGS.marksAnimate, {
    scope: "world", config: true, type: Boolean, default: true
  });
}
