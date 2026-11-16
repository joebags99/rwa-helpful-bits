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
  blinded: {
    sequencer: { file: "jb2a.darkness.black", scale: 1.15, opacity: 0.65 },
    tmfx: [{ filterType: "adjustment", brightness: 0.35, saturate: 0.4 }]
  },
  charmed: {
    sequencer: { file: "jb2a.markers.heart.pink.02", scale: 0.55, offsetY: -0.55 },
    tmfx: [{ filterType: "glow", color: 0xff69b4, outerStrength: 3, padding: 10, quality: 0.5 }]
  },
  deafened: {
    sequencer: { file: "jb2a.markers.mute.dark_red.01", scale: 0.55, offsetY: -0.55 }
  },
  silenced: {
    sequencer: { file: "jb2a.markers.mute.dark_red.02", scale: 0.55, offsetY: -0.55 }
  },
  exhaustion: {
    sequencer: { file: "jb2a.markers.skull.dark_orange.03", scale: 0.5, offsetY: -0.55, opacity: 0.85 }
  },
  frightened: {
    sequencer: { file: "jb2a.markers.fear.dark_purple.02", scale: 0.55, offsetY: -0.55 },
    tmfx: [{ filterType: "glow", color: 0x6a0dad, outerStrength: 3, padding: 10, quality: 0.5 }]
  },
  grappled: {
    sequencer: { file: "jb2a.markers.chain.standard.loop.02.red", scale: 1.05 }
  },
  restrained: {
    sequencer: { file: "jb2a.markers.chain.spectral_standard.loop.02.blue", scale: 1.05 }
  },
  incapacitated: {
    sequencer: { file: "jb2a.markers.horror.purple.02", scale: 0.55, offsetY: -0.55 }
  },
  stunned: {
    sequencer: { file: "jb2a.dizzy_stars.200px.blueorange", scale: 0.9, offsetY: -0.35 }
  },
  paralyzed: {
    sequencer: { file: "jb2a.icon.stun.purple", scale: 0.55, offsetY: -0.55 },
    tmfx: [{ filterType: "electric", color: 0xb0e0ff, time: 0, blend: 1, intensity: 4,
      animated: { time: { active: true, speed: 0.002, animType: "move" } } }]
  },
  petrified: {
    tmfx: [{ filterType: "adjustment", saturate: 0, brightness: 0.8, contrast: 1.2 }]
  },
  poisoned: {
    sequencer: { file: "jb2a.markers.poison.dark_green.02", scale: 0.55, offsetY: -0.55 },
    tmfx: [{ filterType: "glow", color: 0x3fa34d, outerStrength: 3, padding: 10, quality: 0.5 }]
  },
  diseased: {
    sequencer: { file: "jb2a.markers.poison.dark_green.03", scale: 0.55, offsetY: -0.55 }
  },
  unconscious: {
    sequencer: { file: "jb2a.sleep.symbol.pink", scale: 0.6, offsetY: -0.5 }
  },
  sleeping: {
    sequencer: { file: "jb2a.sleep.symbol.pink", scale: 0.6, offsetY: -0.5 }
  },
  burning: {
    sequencer: { file: "jb2a.flames.02.orange", scale: 1.1, opacity: 0.9 },
    tmfx: [{ filterType: "fire", intensity: 1, color: 0xffa500, amplitude: 1, time: 0, blend: 2, fireBlend: 1,
      animated: { time: { active: true, speed: -0.0024, animType: "move" } } }]
  },
  bleeding: {
    sequencer: { file: "jb2a.markers.drop.red.02", scale: 0.5, offsetY: -0.55 }
  },
  cursed: {
    sequencer: { file: "jb2a.markers.runes.dark_orange.02", scale: 0.55, offsetY: -0.55 }
  },
  concentrating: null,
  invisible: null,
  prone: null,
  dead: null,
  surprised: null
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
