# Roll With Advantage: Helpful Bits

A grab-bag module of quality-of-life tweaks for running **D&D 5e (2024 rules)** in Foundry VTT.
Rather than installing six small modules, everything the Roll With Advantage table finds handy lives here,
and each bit can be switched off independently in the module settings.

Built for **Foundry VTT v13/v14** and the **dnd5e** system 5.x/6.x.

## What it does

### 1. A readable condition picker
The status effect palette on the Token HUD is **alphabetized** and every icon gets its **name** next to it.
- *Pin these conditions first* keeps chosen statuses (default: `dead`) at the top.
- Column count and labels are per-user settings, so each player can pick what suits their screen.

### 2. Condition rules in chat
Whenever a dnd5e condition (Blinded, Grappled, Prone, ...) is applied to a creature, a chat card is posted that
explains what the condition does, so nobody has to look it up. A short line is posted when the condition ends.
- The text comes from the system's own 2024 rules pages when available, with a built-in SRD 5.2 summary as fallback
  (or the other way round, your choice).
- Cards are public by default; a setting whispers them to the GM instead.
- Works however the condition is applied: Token HUD, the sheet, a spell's effect, or another module.
- Conditions already granted by another active effect are not re-announced, and rider conditions
  (Unconscious adding Prone) are quiet unless you turn them on.

### 3. Condition animations
While a token has a condition, a looping animation plays on it.
- Uses **Sequencer + JB2A** (the free JB2A pack is enough) when installed; falls back to **Token Magic FX** filters
  for a few conditions when that is installed instead. With neither, nothing happens.
- Every status in the dnd5e picker has a default. Each one names a Patreon JB2A file first and a free-pack fallback, so it works with either collection.
- If another module turns Foundry v14's status list back into an array (which hides conditions from the HUD and makes core unable to apply them), the module rebuilds it and restores any dnd5e conditions that were lost. A console warning says when this happened; it can be switched off in settings.
  Petrified (TMFX), Poisoned, Restrained, Stunned, Unconscious/Sleeping, Burning, Bleeding, Cursed, Diseased and
- *Configure animations* in the module settings opens a JSON editor. Each status maps to:
  ```json
  "poisoned": {
    "sequencer": { "file": "jb2a.markers.poison.dark_green.02", "scale": 0.55, "offsetY": -0.55 },
    "tmfx": [{ "filterType": "glow", "color": 4170573, "outerStrength": 3 }]
  }
  ```
  `file` is a Sequencer database path or a direct file path; `offsetY` is in grid units (negative is above the token);
  `tint`, `hue`, `opacity`, `belowToken` and `playbackRate` are also accepted. Set an entry to `null` to disable it.

### 4. Hunter's Marks for your players
The *Hunter's Marks* setting (default `Xanthe|red` and `Marik|green`, one per line as `Name|color`) adds a
**"Xanthe's Mark"** / **"Marik's Mark"** status effect to the Token HUD with its own coloured icon.
- Applying a mark posts "Xanthe marks Frost Giant as their quarry." and plays the JB2A Hunter's Mark loop, recoloured
  to match the icon (Patreon colour variants are used when present).
- *One mark per hunter* (on by default) removes the same mark from every other creature on the scene, because
  Hunter's Mark only ever has one quarry.
- Colours: red, orange, yellow, green, blue, purple, pink, white. Reload after editing the list.

## Macros
Everything is exposed on `game.modules.get("rwa-helpful-bits").api`. A one-line macro per hunter is the usual setup;
it toggles the mark on the targeted tokens (or the selected ones if nothing is targeted):

```js
game.modules.get("rwa-helpful-bits").api.toggleMark("Xanthe");
```

Other handy calls:

```js
const api = game.modules.get("rwa-helpful-bits").api;
api.toggleMark("Marik", canvas.tokens.controlled, { active: false }); // force off
api.clearMark("Xanthe");                                                // remove from the whole scene
api.postCondition(actor, "grappled");                                   // post a condition card by hand
api.refreshTokenAnimations(token);                                      // rebuild animations from current statuses
```

## Installation
Paste the manifest URL into Foundry's *Install Module* dialog:

```
https://raw.githubusercontent.com/joebags99/rwa-helpful-bits/main/module.json
```

Optional companions: [Sequencer](https://foundryvtt.com/packages/sequencer), [JB2A (free)](https://foundryvtt.com/packages/JB2A_DnD5e),
[Token Magic FX](https://foundryvtt.com/packages/tokenmagic).

## Licence
MIT. The built-in condition summaries are adapted from the SRD 5.2.1 by Wizards of the Coast LLC under CC-BY-4.0.
