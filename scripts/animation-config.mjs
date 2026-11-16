import { MODULE_ID } from "./constants.mjs";
import { DEFAULT_ANIMATIONS } from "./animation-defaults.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Settings menu for editing the condition -> animation mapping as JSON.
 */
export class AnimationConfig extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "rwa-hb-animation-config",
    tag: "form",
    classes: ["rwa-hb-animation-config", "standard-form"],
    window: { title: "RWAHB.AnimationConfig.Title", icon: "fas fa-wand-sparkles", resizable: true },
    position: { width: 640, height: 600 },
    form: { handler: AnimationConfig.#onSubmit, closeOnSubmit: true },
    actions: { reset: AnimationConfig.#onReset }
  };

  static PARTS = {
    form: { template: `modules/${MODULE_ID}/templates/animation-config.hbs` },
    footer: { template: "templates/generic/form-footer.hbs" }
  };

  /** @override */
  async _prepareContext(options) {
    const current = game.settings.get(MODULE_ID, "animationMap");
    const sequencer = game.modules.get("sequencer")?.active;
    const jb2a = game.modules.get("JB2A_DnD5e")?.active || game.modules.get("jb2a_patreon")?.active;
    const tmfx = game.modules.get("tokenmagic")?.active;
    return {
      json: JSON.stringify(current ?? DEFAULT_ANIMATIONS, null, 2),
      sequencer, jb2a, tmfx,
      buttons: [
        { type: "button", action: "reset", icon: "fas fa-undo", label: "RWAHB.AnimationConfig.Reset" },
        { type: "submit", icon: "fas fa-save", label: "SETTINGS.Save" }
      ]
    };
  }

  static async #onSubmit(event, form, formData) {
    const raw = formData.object.json ?? "";
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch(err) {
      ui.notifications.error(game.i18n.format("RWAHB.AnimationConfig.InvalidJSON", { error: err.message }));
      throw err;
    }
    if ( foundry.utils.getType(parsed) !== "Object" ) {
      ui.notifications.error(game.i18n.localize("RWAHB.AnimationConfig.NotObject"));
      throw new Error("Animation map must be a JSON object");
    }
    await game.settings.set(MODULE_ID, "animationMap", parsed);
    ui.notifications.info(game.i18n.localize("RWAHB.AnimationConfig.Saved"));
  }

  static async #onReset() {
    const textarea = this.element.querySelector("textarea[name='json']");
    if ( textarea ) textarea.value = JSON.stringify(DEFAULT_ANIMATIONS, null, 2);
  }
}
