/**
 * Built-in condition descriptions following the 2024 rules, adapted from the
 * System Reference Document 5.2.1 (Wizards of the Coast, CC-BY-4.0).
 * Used when the system's own rules journal page is unavailable or when the GM
 * prefers the shorter built-in text.
 */
export const CONDITION_TEXT = {
  blinded: `
<p><strong>Can't See.</strong> You can't see and automatically fail any ability check that requires sight.</p>
<p><strong>Attacks Affected.</strong> Attack rolls against you have Advantage, and your attack rolls have Disadvantage.</p>`,

  charmed: `
<p><strong>Can't Harm the Charmer.</strong> You can't attack the charmer or target the charmer with damaging abilities or magical effects.</p>
<p><strong>Social Advantage.</strong> The charmer has Advantage on any ability check to interact with you socially.</p>`,

  deafened: `
<p><strong>Can't Hear.</strong> You can't hear and automatically fail any ability check that requires hearing.</p>`,

  exhaustion: `
<p><strong>Exhaustion Levels.</strong> This condition is cumulative. Each time you receive it, you gain 1 Exhaustion level. You die if your Exhaustion level reaches 6.</p>
<p><strong>D20 Tests Affected.</strong> When you make a D20 Test, the roll is reduced by 2 times your Exhaustion level.</p>
<p><strong>Speed Reduced.</strong> Your Speed is reduced by a number of feet equal to 5 times your Exhaustion level.</p>
<p><strong>Removing Exhaustion Levels.</strong> Finishing a Long Rest removes 1 of your Exhaustion levels. When your Exhaustion level reaches 0, the condition ends.</p>`,

  frightened: `
<p><strong>Ability Checks and Attacks Affected.</strong> You have Disadvantage on ability checks and attack rolls while the source of fear is within line of sight.</p>
<p><strong>Can't Approach.</strong> You can't willingly move closer to the source of fear.</p>`,

  grappled: `
<p><strong>Speed 0.</strong> Your Speed is 0 and can't increase.</p>
<p><strong>Attacks Affected.</strong> You have Disadvantage on attack rolls against any target other than the grappler.</p>
<p><strong>Movable.</strong> The grappler can drag or carry you when it moves, but every foot of movement costs it 1 extra foot unless you are Tiny or two or more sizes smaller than it.</p>`,

  incapacitated: `
<p><strong>Inactive.</strong> You can't take any action, Bonus Action, or Reaction.</p>
<p><strong>No Concentration.</strong> Your Concentration is broken.</p>
<p><strong>Speechless.</strong> You can't speak.</p>
<p><strong>Surprised.</strong> If you're Incapacitated when you roll Initiative, you have Disadvantage on the roll.</p>`,

  invisible: `
<p><strong>Surprise.</strong> If you're Invisible when you roll Initiative, you have Advantage on the roll.</p>
<p><strong>Concealed.</strong> You aren't affected by any effect that requires its target to be seen unless the effect's creator can somehow see you. Any equipment you are wearing or carrying is also concealed.</p>
<p><strong>Attacks Affected.</strong> Attack rolls against you have Disadvantage, and your attack rolls have Advantage. If a creature can somehow see you, you don't gain this benefit against that creature.</p>`,

  paralyzed: `
<p><strong>Incapacitated.</strong> You have the Incapacitated condition.</p>
<p><strong>Speed 0.</strong> Your Speed is 0 and can't increase.</p>
<p><strong>Saving Throws Affected.</strong> You automatically fail Strength and Dexterity saving throws.</p>
<p><strong>Attacks Affected.</strong> Attack rolls against you have Advantage.</p>
<p><strong>Automatic Critical Hits.</strong> Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.</p>`,

  petrified: `
<p><strong>Turned to Inanimate Substance.</strong> You are transformed, along with any nonmagical objects you are wearing and carrying, into a solid inanimate substance (usually stone). Your weight increases by a factor of ten, and you cease aging.</p>
<p><strong>Incapacitated.</strong> You have the Incapacitated condition.</p>
<p><strong>Speed 0.</strong> Your Speed is 0 and can't increase.</p>
<p><strong>Attacks Affected.</strong> Attack rolls against you have Advantage.</p>
<p><strong>Saving Throws Affected.</strong> You automatically fail Strength and Dexterity saving throws.</p>
<p><strong>Resist Damage.</strong> You have Resistance to all damage.</p>
<p><strong>Poison Immunity.</strong> You have Immunity to the Poisoned condition.</p>`,

  poisoned: `
<p><strong>Ability Checks and Attacks Affected.</strong> You have Disadvantage on attack rolls and ability checks.</p>`,

  prone: `
<p><strong>Restricted Movement.</strong> Your only movement options are to crawl or to spend an amount of movement equal to half your Speed (round down) to right yourself and thereby end the condition. If your Speed is 0, you can't right yourself.</p>
<p><strong>Attacks Affected.</strong> You have Disadvantage on attack rolls. An attack roll against you has Advantage if the attacker is within 5 feet of you. Otherwise, that attack roll has Disadvantage.</p>`,

  restrained: `
<p><strong>Speed 0.</strong> Your Speed is 0 and can't increase.</p>
<p><strong>Attacks Affected.</strong> Attack rolls against you have Advantage, and your attack rolls have Disadvantage.</p>
<p><strong>Saving Throws Affected.</strong> You have Disadvantage on Dexterity saving throws.</p>`,

  stunned: `
<p><strong>Incapacitated.</strong> You have the Incapacitated condition.</p>
<p><strong>Saving Throws Affected.</strong> You automatically fail Strength and Dexterity saving throws.</p>
<p><strong>Attacks Affected.</strong> Attack rolls against you have Advantage.</p>`,

  unconscious: `
<p><strong>Inert.</strong> You have the Incapacitated and Prone conditions, and you drop whatever you're holding. When this condition ends, you remain Prone.</p>
<p><strong>Speed 0.</strong> Your Speed is 0 and can't increase.</p>
<p><strong>Attacks Affected.</strong> Attack rolls against you have Advantage.</p>
<p><strong>Saving Throws Affected.</strong> You automatically fail Strength and Dexterity saving throws.</p>
<p><strong>Automatic Critical Hits.</strong> Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.</p>
<p><strong>Unaware.</strong> You're unaware of your surroundings.</p>`,

  burning: `
<p>A burning creature or object takes 1d4 Fire damage at the start of each of its turns. As an action, you can extinguish fire on yourself by giving yourself the Prone condition and rolling on the ground. The fire also goes out if it is doused, submerged, or suffocated.</p>`,

  suffocation: `
<p>A suffocating creature gains 1 Exhaustion level at the end of each of its turns. When a creature can breathe again, it removes all levels of Exhaustion it gained from suffocating.</p>
<p>A creature can hold its breath for a number of minutes equal to 1 plus its Constitution modifier (minimum of 30 seconds). When it runs out of breath, or if it is choking, it begins suffocating.</p>`,

  falling: `
<p>A creature that falls takes 1d6 Bludgeoning damage at the end of the fall for every 10 feet it fell, to a maximum of 20d6. When the creature lands, it has the Prone condition unless it avoids taking damage from the fall.</p>`,

  surprised: `
<p>If a combatant is surprised by combat starting, that combatant has Disadvantage on their Initiative roll.</p>`,

  bloodied: `
<p>A creature is Bloodied while it has half its Hit Points or fewer remaining.</p>`,

  sleeping: `
<p>You are asleep: you have the Unconscious condition (and therefore the Incapacitated and Prone conditions). You wake if you take damage or if another creature uses an action to shake or slap you awake.</p>
<p><strong>Attacks Affected.</strong> Attack rolls against you have Advantage, and any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.</p>
<p><strong>Saving Throws Affected.</strong> You automatically fail Strength and Dexterity saving throws.</p>`,

  silenced: `
<p>You can't speak and can't cast spells that have a Verbal component. No sound can be created within or pass through the silenced area.</p>`,

  concentrating: `
<p>You are concentrating on a spell or effect. Concentration ends if you cast another spell that requires Concentration, if you have the Incapacitated condition, or if you die.</p>
<p><strong>Damage.</strong> Whenever you take damage, make a Constitution saving throw (DC 10 or half the damage taken, whichever is higher) or lose Concentration.</p>`,

  dodging: `
<p>Until the start of your next turn, any attack roll made against you has Disadvantage if you can see the attacker, and you make Dexterity saving throws with Advantage. You lose this benefit if you have the Incapacitated condition or if your Speed is 0.</p>`,

  hiding: `
<p>You have the Invisible condition while hidden. The condition ends immediately after any of the following: you make a sound louder than a whisper, an enemy finds you, you make an attack roll, or you cast a spell with a Verbal component.</p>`
};

export const CONDITION_TEXT_ATTRIBUTION =
  "Condition text adapted from the System Reference Document 5.2.1 by Wizards of the Coast LLC, licensed under CC-BY-4.0.";
