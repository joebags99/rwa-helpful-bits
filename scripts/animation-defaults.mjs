/**
 * Default animation mapping: status id -> animation spec.
 *
 * Each spec may provide:
 *   sequencer: {
 *     file:        Sequencer database path or a direct file path (JB2A free paths used by default).
 *     fallback:    Alternative database path tried when `file` is missing.
 *     scale:       Scale relative to the token size (scaleToObject). Default 1.
 *     offsetY:     Vertical offset in grid units (negative = above the token). Default 0.
 *     opacity:     0..1. Default 1.
 *     tint:        Hex colour string, e.g. "#ff0000".
 *     hue:         Hue rotation in degrees applied through a ColorMatrix filter.
 *     belowToken:  Render under the token instead of over it.
 *     playbackRate: Speed multiplier.
 *     randomRotation: Rotate the sprite randomly on play.
 *   }
 *   tmfx: [ ...Token Magic FX filter parameter objects... ]   (filterId is assigned automatically)
 *
 * Sequencer is used when it and the file are available; Token Magic FX is used otherwise.
 * Set a status to null (or delete it) to disable its animation.
 */
export const DEFAULT_ANIMATIONS = {
  /* ---- Core 2024 conditions ---- */
  blinded: {
    sequencer: { file: "jb2a.darkness.black", scale: 1.15, opacity: 0.65 },
    tmfx: [{ filterType: "adjustment", brightness: 0.35, saturate: 0.4 }]
  },
  charmed: {
    sequencer: { file: "jb2a.markers.heart.pink.02", scale: 0.55, offsetY: -0.55 },
    tmfx: [{ filterType: "glow", color: 0xff69b4, outerStrength: 3, padding: 10, quality: 0.5 }]
  },
  deafened: {
    sequencer: { file: "jb2a.markers.mute.blue.01", fallback: "jb2a.markers.mute.dark_red.01", scale: 0.55, offsetY: -0.55 }
  },
  exhaustion: {
    sequencer: { file: "jb2a.markers.skull.dark_orange.03", scale: 0.5, offsetY: -0.55, opacity: 0.85 }
  },
  frightened: {
    sequencer: { file: "jb2a.markers.fear.dark_purple.02", scale: 0.55, offsetY: -0.55 },
    tmfx: [{ filterType: "glow", color: 0x6a0dad, outerStrength: 3, padding: 10, quality: 0.5 }]
  },
  grappled: {
    sequencer: { file: "jb2a.markers.chain.spike.loop.02.red", fallback: "jb2a.markers.chain.standard.loop.02.red", scale: 1.05 }
  },
  incapacitated: {
    sequencer: { file: "jb2a.markers.horror.purple.02", scale: 0.55, offsetY: -0.55 }
  },
  invisible: {
    sequencer: { file: "jb2a.shimmer.01.blue", scale: 1.1, opacity: 0.6 },
    tmfx: [{ filterType: "distortion", maskPath: "modules/tokenmagic/fx/assets/waves-2.png", maskSpriteScaleX: 7, maskSpriteScaleY: 7, padding: 20,
      animated: { maskSpriteX: { active: true, speed: 0.05, animType: "move" }, maskSpriteY: { active: true, speed: 0.07, animType: "move" } } }]
  },
  paralyzed: {
    sequencer: { file: "jb2a.static_electricity.03.blue", scale: 1.1, opacity: 0.85 },
    tmfx: [{ filterType: "electric", color: 0xb0e0ff, time: 0, blend: 1, intensity: 4,
      animated: { time: { active: true, speed: 0.002, animType: "move" } } }]
  },
  petrified: {
    sequencer: { file: "jb2a.impact.ground_crack.still_frame.01", scale: 1.3, opacity: 0.8, belowToken: true },
    tmfx: [{ filterType: "adjustment", saturate: 0, brightness: 0.8, contrast: 1.2 }]
  },
  poisoned: {
    sequencer: { file: "jb2a.markers.poison.dark_green.02", scale: 0.55, offsetY: -0.55 },
    tmfx: [{ filterType: "glow", color: 0x3fa34d, outerStrength: 3, padding: 10, quality: 0.5 }]
  },
  prone: {
    sequencer: { file: "jb2a.drop_shadow.dark_black", scale: 1.1, opacity: 0.7, belowToken: true }
  },
  restrained: {
    sequencer: { file: "jb2a.web.01", scale: 1.1, opacity: 0.85 }
  },
  stunned: {
    sequencer: { file: "jb2a.dizzy_stars.200px.yellow", fallback: "jb2a.dizzy_stars.200px.blueorange", scale: 0.9, offsetY: -0.35 }
  },
  unconscious: {
    sequencer: { file: "jb2a.sleep.cloud.01.pink", scale: 0.55, offsetY: -0.55 }
  },

  /* ---- dnd5e extra conditions ---- */
  bleeding: {
    sequencer: { file: "jb2a.markers.drop.red.02", scale: 0.5, offsetY: -0.55 }
  },
  burning: {
    sequencer: { file: "jb2a.flames.02.orange", scale: 1.1, opacity: 0.9 },
    tmfx: [{ filterType: "fire", intensity: 1, color: 0xffa500, amplitude: 1, time: 0, blend: 2, fireBlend: 1,
      animated: { time: { active: true, speed: -0.0024, animType: "move" } } }]
  },
  cursed: {
    sequencer: { file: "jb2a.markers.runes.dark_red.02", fallback: "jb2a.markers.runes.dark_orange.02", scale: 0.55, offsetY: -0.55 }
  },
  dehydration: {
    sequencer: { file: "jb2a.fumes.steam.white", scale: 1.0, opacity: 0.6 }
  },
  diseased: {
    sequencer: { file: "jb2a.markers.poison.purple.02", fallback: "jb2a.markers.poison.dark_green.03", scale: 0.55, offsetY: -0.55 }
  },
  falling: {
    sequencer: { file: "jb2a.wind_stream.white", scale: 1.2, opacity: 0.7 }
  },
  inaudible: {
    sequencer: { file: "jb2a.markers.mute.purple.01", fallback: "jb2a.markers.mute.dark_red.03", scale: 0.55, offsetY: -0.55 }
  },
  malnutrition: {
    sequencer: { file: "jb2a.markers.skull.dark_green.02", fallback: "jb2a.markers.skull.purple.02", scale: 0.5, offsetY: -0.55, opacity: 0.85 }
  },
  silenced: {
    sequencer: { file: "jb2a.markers.mute.dark_red.02", scale: 0.55, offsetY: -0.55 }
  },
  suffocation: {
    sequencer: { file: "jb2a.markers.bubble.loop.blue", scale: 0.55, offsetY: -0.55 }
  },
  surprised: {
    sequencer: { file: "jb2a.ui.indicator.yellow.01.01", scale: 0.5, offsetY: -0.6 }
  },
  transformed: {
    sequencer: { file: "jb2a.swirling_sparkles.01.blue", scale: 1.1, opacity: 0.8 }
  },

  /* ---- dnd5e statuses ---- */
  bloodied: {
    sequencer: { file: "jb2a.ui.heartbeat.01.green", scale: 0.5, offsetY: -0.6, tint: "#ff3333" }
  },
  burrowing: {
    sequencer: { file: "jb2a.smoke.plumes_loop.01.grey", scale: 1.1, opacity: 0.7, belowToken: true }
  },
  concentrating: {
    sequencer: { file: "jb2a.markers.light.loop.blue", scale: 0.4, offsetY: -0.6, opacity: 0.8 }
  },
  coverHalf: {
    sequencer: { file: "jb2a.markers.shield.yellow.01", fallback: "jb2a.markers.shield.green.01", scale: 0.5, offsetY: -0.55, opacity: 0.8 }
  },
  coverThreeQuarters: {
    sequencer: { file: "jb2a.markers.shield.blue.02", fallback: "jb2a.markers.shield.green.02", scale: 0.5, offsetY: -0.55, opacity: 0.9 }
  },
  coverTotal: {
    sequencer: { file: "jb2a.shield.01.loop.blue", scale: 1.15, opacity: 0.7 }
  },
  dead: {
    sequencer: { file: "jb2a.toll_the_dead.green.skull_smoke", scale: 1.0, opacity: 0.7 }
  },
  dodging: {
    sequencer: { file: "jb2a.token_border.circle.static.blue.001", scale: 1.1, opacity: 0.8 }
  },
  ethereal: {
    sequencer: { file: "jb2a.energy_field.02.above.purple", fallback: "jb2a.energy_field.02.above.blue", scale: 1.1, opacity: 0.5 }
  },
  flying: {
    sequencer: { file: "jb2a.wind_lines.01.01.white", scale: 1.3, opacity: 0.6, belowToken: true }
  },
  hiding: {
    sequencer: { file: "jb2a.eyes.01.dark_green.single", scale: 0.5, offsetY: -0.55, opacity: 0.85 }
  },
  hovering: {
    sequencer: { file: "jb2a.whirlwind.bluegrey", scale: 1.1, opacity: 0.45, belowToken: true }
  },
  marked: {
    sequencer: { file: "jb2a.markers.01.blueyellow", scale: 1.0, opacity: 0.9 }
  },
  sleeping: {
    sequencer: { file: "jb2a.sleep.cloud.02.pink", scale: 0.55, offsetY: -0.55 }
  },
  stable: {
    sequencer: { file: "jb2a.ui.heartbeat.02.green", scale: 0.5, offsetY: -0.6 }
  }
};

/**
 * Animation used for the Hunter's Mark status effects. `{color}` is replaced with the mark's colour
 * so that Patreon JB2A colour variants are used when they exist; otherwise the free green loop is
 * hue-shifted to match.
 */
export const MARK_ANIMATION = {
  sequencer: { file: "jb2a.hunters_mark.loop.01.{color}", fallback: "jb2a.hunters_mark.loop.01.green", scale: 1.0, opacity: 0.9 },
  tmfx: [{ filterType: "glow", color: 0xff0000, outerStrength: 4, padding: 12, quality: 0.5,
    animated: { outerStrength: { active: true, loopDuration: 1500, animType: "syncCosOscillation", val1: 2, val2: 5 } } }]
};

/** Colours available for Hunter's Mark icons, with the hue rotation needed to recolour the green JB2A loop. */
export const MARK_COLORS = {
  red:    { hex: "#d32f2f", hue: 240 },
  orange: { hex: "#ef6c00", hue: 270 },
  yellow: { hex: "#fbc02d", hue: 300 },
  green:  { hex: "#2e7d32", hue: 0 },
  blue:   { hex: "#1976d2", hue: 95 },
  purple: { hex: "#7b1fa2", hue: 160 },
  pink:   { hex: "#e91e63", hue: 210 },
  white:  { hex: "#eeeeee", hue: 0, desaturate: true }
};
