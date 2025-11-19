Guide to Verifying Pathfinder 1st Edition Monster Stat Blocks

1.0 Introduction: The Blueprint of a Balanced Encounter

In the Pathfinder Roleplaying Game, a monster's stat block is the mechanical blueprint for an encounter. Its numbers dictate every roll of the dice, turning a simple description into a tangible challenge. A mechanically correct stat block is the foundation for creating encounters that are challenging, fair, and memorable for your players. An error in calculation can transform a fearsome beast into a trivial obstacle or, conversely, an appropriate challenge into an unwinnable slaughter. This guide provides a systematic, step-by-step process for auditing any monster stat block against the core rules of Pathfinder 1st Edition, ensuring its mechanical integrity.

This guide focuses exclusively on verifying the mechanics as presented in official Paizo sourcebooks like the Core Rulebook, Bestiary, and GameMastery Guide. By mastering this process, a Game Master can confidently create, modify, and troubleshoot any creature for their campaign, knowing that the foundation of their encounters is solid. A successful audit begins with a structural understanding of the stat block itself.

2.0 The Anatomy of a Stat Block

Before auditing a stat block, one must first understand its structure. A stat block is a creature's mechanical identity, a dense summary of its capabilities divided into logical sections covering its senses, defenses, offenses, and general statistics. Each line item is a piece of a larger puzzle, derived from a core set of foundational attributes. The following table breaks down the key components of a standard monster stat block, using the Ghoul as a clear example.

Component	Example (from Ghoul)	Core Function
CR, XP	Not provided, but typically at the top	Challenge Rating and the experience points awarded for defeating it.
AC (Touch, Flat-Footed)	14 (Touch 12, Flat-Footed 12)	Armor Class; the number an attacker must meet or exceed to hit.
HP	13	Hit Points; the amount of damage the creature can sustain.
Saves (Fort/Ref/Will)	+2/+2/+5	Saving throw bonuses used to resist spells and special abilities.
Attacks	Bite +3, 2 Claws +3	The creature's primary modes of attack and their associated bonus to hit.
Damage	Bite (1d6+1 plus Ghoul Fever and paralysis); Claws (1d6+1 plus paralysis)	The damage dealt by a successful attack, including any special effects.
Ability Scores	Str 13, Dex 15, Con N/A, Int 13, Wis 14, Cha 14	The six core attributes that determine most other statistics.
Base Atk (BAB)	+1	The creature's base attack bonus, derived from its Hit Dice.
CMB, CMD	CMB: +2, CMD: 14	Combat Maneuver Bonus and Combat Maneuver Defense.
Feats	Weapon Finesse	Special abilities that grant the creature new capabilities or improve existing ones.
Skills	Acrobatics +4, Climb +6, Perception +7, Stealth +7, Swim +3	The creature's trained skills and their total modifiers.

Understanding these components is the first step; the next is to learn the foundational calculations that underpin them.

3.0 The Foundational "Chassis": Racial Hit Dice, Type, and Size

A monster's racial Hit Dice (HD), Type, and Size are its foundational "chassis" upon which almost all other stats are built. These three attributes are the first things you should check, as they directly determine the monster's Base Attack Bonus (BAB), base saving throw bonuses, number of skill ranks, and number of feats. If these are incorrect, a cascade of errors will ripple through the rest of the stat block.

3.1 Monster Type and Racial Hit Dice

Each monster type (e.g., Aberration, Animal, Undead) has an assigned Hit Die size, which dictates its base health and resilience. While some types vary, a few common examples from the Bestiary are consistent:

* Animal: d8
* Humanoid: d8 (though this changes if they have PC class levels, which use their own HD)
* Outsider: d10
* Undead: d8
* Constructs are a special case. They use a d10 for their Hit Dice but, lacking a Constitution score, they gain a set number of bonus hit points based on their size instead.

3.2 Calculating Base Attack Bonus (BAB)

A creature's BAB progression is determined by its type and total HD. There are three progressions: Fast, Medium, and Slow. The Bestiary's "Statistics Summary" table illustrates how these advance.

Progression	HD 1	HD 5	HD 10	HD 15	HD 20	Common Creature Types
Fast (Full)	+1	+5	+10	+15	+20	Creatures with Fighter levels.
Medium (3/4)	+0	+3	+7	+11	+15	Most Animals and Outsiders.
Slow (1/2)	+0	+2	+5	+7	+10	Many Aberrations and Vermin.

Note: Humanoids with class levels use the BAB progression of their class (e.g., a Fighter has a Fast BAB).

3.3 Calculating Base Saving Throws

Similar to BAB, base saving throws follow two progressions: Good and Bad. Each monster type has a specific combination of these progressions for its Fortitude, Reflex, and Will saves. For example, Undead have Good Will saves but Bad Fortitude and Reflex saves.

Progression	HD 1	HD 5	HD 10	HD 15	HD 20
Good	+2	+4	+7	+9	+12
Bad	+0	+1	+3	+5	+6

With this foundational chassis verified, we can now move on to auditing the core defensive numbers that these stats directly influence.

4.0 Auditing Core Defensive Statistics

A monster's survivability in combat is defined by its defensive statistics. Hit Points (HP), Armor Class (AC), and Saving Throws are all derived from the foundational chassis, ability scores, and other bonuses. Verifying these numbers is a crucial step in ensuring the creature can withstand an appropriate amount of punishment.

Designer's Note: Errors in defensive stats can fundamentally break an encounter's design. An inflated HP total turns a skirmish into a slog, draining party resources beyond what the Challenge Rating (CR) anticipates. Conversely, a miscalculated AC can make a creature trivially easy to hit, ending the fight before it can present a meaningful threat. These mistakes violate the implicit contract of the CR system, creating frustrating or unsatisfying gameplay.

4.1 Verifying Hit Points (HP)

Average Hit Points for creatures with only racial HD are calculated using a clear formula. You do not need to roll the dice; simply use the average result for the creature's Hit Die type.

Formula: HP = (Number of HD) * (Average Die Result) + (Constitution Modifier * Number of HD)

The average results for common monster Hit Dice are:

* d8: 4.5
* d10: 5.5
* d12: 6.5

Important: Always round down after multiplying the HD by the average die result. For example, a creature with 3d8 HD would have (3 * 4.5) = 13.5, which rounds down to 13 HP before adding any Constitution bonus. As a reminder, Constructs do not use a Constitution modifier; they gain bonus HP based on their size.

4.2 Verifying Armor Class (AC)

A creature's Armor Class is the sum of numerous bonuses. The complete formula is:

Formula: AC = 10 + Armor Bonus + Shield Bonus + Dexterity Modifier + Size Modifier + Natural Armor Bonus + Other Bonuses (Dodge, Deflection, etc.)

Size is a common factor, providing a bonus or penalty to both AC and attack rolls.

Size	AC/Attack Modifier
Large	-1
Medium	+0
Small	+1

4.3 Verifying Saving Throws

A monster's final saving throw bonus is the sum of its base save (determined by its HD and type, as detailed in Section 3.3) and its relevant ability score modifier, plus any other bonuses from feats or special abilities.

Formula: Total Save = Base Save Bonus + Ability Modifier + Other Bonuses

Once you have confirmed a creature's defensive stats, the next logical step is to audit its offensive capabilities.

5.0 Auditing Core Offensive Statistics

A monster's offensive statistics measure its direct threat level and its ability to impact the flow of combat. To validate a stat block, you must check the core numbers that determine its capacity to hit and deal damage: Attack Bonus, Damage, Combat Maneuver Bonus (CMB), and Combat Maneuver Defense (CMD).

Designer's Note: Offensive statistics define a creature's "teeth." An attack bonus that is too low for its CR means the monster will miss constantly, feeling ineffective and posing no real threat. Damage values that are too high can result in sudden, unexpected PC deaths that feel cheap rather than challenging. Verifying these numbers ensures the monster's damage output is consistent with its intended role in an encounter.

5.1 Verifying Attack Bonus

The formulas for standard melee and ranged attacks are straightforward extensions of the monster's Base Attack Bonus.

* Melee Attack Bonus: BAB + Strength Modifier + Size Modifier + Other Bonuses (e.g., Weapon Focus)
* Ranged Attack Bonus: BAB + Dexterity Modifier + Size Modifier + Other Bonuses (e.g., Weapon Focus)

5.2 Verifying Damage Bonus

A creature's Strength modifier is the primary source of its bonus damage on melee and thrown weapon attacks. The application varies based on how the weapon is used.

* Primary Hand Melee / Thrown: Weapon Damage + STR Modifier
* Two-Handed Melee: Weapon Damage + 1.5 x STR Modifier (rounded down)
* Off-Hand Melee: Weapon Damage + 0.5 x STR Modifier (rounded down)
* Ranged (excluding Thrown): Weapon Damage (Note: Composite bows are a key exception, allowing an archer to add their Strength modifier to damage.)

5.3 Verifying Combat Maneuvers (CMB & CMD)

CMB and CMD determine a creature's ability to perform and resist combat maneuvers like grapple, trip, and bull rush. They use a special size modifier distinct from the one used for AC and attacks.

* CMB: BAB + Strength Modifier + Special Size Modifier
* CMD: 10 + BAB + Strength Modifier + Dexterity Modifier + Special Size Modifier

Size	Special Size Modifier
Large	+1
Medium	+0
Small	-1

After validating these core combat values, the audit turns to the more nuanced elements that give a creature its unique tactical flavor.

6.0 Auditing Feats, Skills, and Special Abilities

Feats, skills, and special abilities are what elevate a monster from a simple collection of combat stats to a unique tactical identity. These elements give a creature its personality on the battlefield. It is crucial to verify that the monster has the correct number of feats and skill ranks for its Hit Dice, and that the save DCs for its special abilities are calculated correctly.

Designer's Note: This is where a monster's unique tactics and flavor are defined. An incorrectly calculated save DC for a key ability can render it useless or make it unfairly potent. An improper number of feats might deny a creature a crucial combo (like Power Attack and Cleave) or give it an unearned advantage. These errors can undermine a creature's intended design, making it a bland brute or a nonsensical puzzle.

6.1 Verifying Feat Allocation

The number of feats a creature possesses is determined solely by its total Hit Dice. The rule is simple and universal for monsters:

Rule: A creature gains one feat at 1 HD and an additional feat for every 2 HD thereafter (at 3 HD, 5 HD, 7 HD, and so on).

* 1 HD: 1 feat
* 3 HD: 2 feats
* 5 HD: 3 feats

Note: Some creatures, particularly those with PC class levels or specific racial traits (like Humans), may gain bonus feats in addition to this standard progression.

6.2 Verifying Skill Ranks

A creature's total skill ranks are determined by its HD, creature type, and Intelligence modifier.

Formula: Total Ranks = (Ranks per HD from Type + Intelligence Modifier) * HD

The number of skill ranks gained per HD varies by type. Common examples include:

* Animal: 2 + Int modifier
* Outsider: 6 + Int modifier
* Undead: 4 + Cha modifier (Undead are an exception and use their Charisma modifier for skill rank calculations)

A creature cannot have more ranks in any single skill than it has Hit Dice.

6.3 Verifying Special Ability DCs

Most extraordinary (Ex), supernatural (Su), and spell-like (Sp) abilities that require a saving throw follow a universal formula to determine their Difficulty Class (DC).

Formula: DC = 10 + 1/2 the creature's HD + the creature's relevant Ability Score Modifier

The ability's description will specify which ability score is used. For example, the Mimic's Adhesive (Ex) ability explicitly states, "The save DC is Strength-based," meaning its DC would be 10 + 1/2 Mimic's HD + Mimic's Strength Modifier.

Now that we have covered all the rules, let's apply them in a practical audit.

7.0 Walkthrough: Auditing the "Spitfire" Stat Block

This section provides a practical, hands-on application of the entire verification process. We will now audit the "Spitfire" stat block from the provided source material to demonstrate these steps in action. By breaking down the creature's statistics and checking them against the rules, we can identify any errors and ensure the creature is mechanically sound for play.

Spitfire CR 2 • XP 600 Male Human Fighter 2 NE Medium Humanoid SENSES: Init +6, Perception +5 DEFENSE: AC: 16, Touch 12, Flat-Footed 14 (+4 armor, +2 Dex) HP 17 SAVES: Fort +4, Ref +2, Will -1 OFFENSE: Longsword +3 (1d8+2, 19/20), Light Crossbow +3 (1d8, 19/20) Special Abilities: Fire Breath (15 foot cone dealing 2d4 fire damage, halved on a DC 13 Reflex Save) STATISTICS: Str 14, Dex 14, Con 12, Int 10, Wis 8, Cha 8 Base Atk +2, CMB: +4, CMD: 16 Feats: Alertness, Toughness, Iron Will, Improved Initiative, Weapon Focus (Longsword)

The following table performs the audit, showing the math for each calculation.

Statistic	Calculation Based on Rules	Verdict
HD/HP	NPCs with PC class levels are often built using PC character generation rules. Calculation: 10 (max 1d10 at 1st level) + 5 (avg 5.5 on 1d10, rounded down) + 2 (Con mod x2 HD) = 17 HP.	Correct, based on PC generation rules. The listed Toughness feat (which should grant +2 HP) was not included in this calculation, which is a build error.
AC	10 + 4 (armor) + 2 (Dex) = 16. Touch = 10 + 2 (Dex) = 12. Flat-Footed = 10 + 4 (armor) = 14.	Correct.
Saves	Fighter 2 has Good Fort, Bad Ref/Will. Fort: +3 (base) + 1 (Con) = +4. Ref: +0 (base) + 2 (Dex) = +2. Will: +0 (base) - 1 (Wis) + 2 (Iron Will feat) = +1.	Incorrect. The listed Will save of -1 omits the +2 bonus from the Iron Will feat. It should be +1.
BAB	A 2nd-level Fighter has a Base Attack Bonus of +2.	Correct.
Melee Attack	Longsword: +2 (BAB) + 2 (Str) + 1 (Weapon Focus) = +5.	Incorrect. The attack bonus is listed as +3 but should be +5.
Melee Damage	Longsword: 1d8 + 2 (Str).	Correct.
Feats	A 2nd-level Human Fighter gets 4 feats: 1 (1st level), +1 (Human), +1 (Fighter 1), +1 (Fighter 2).	Incorrect. The character is listed with 5 feats (Alertness, Toughness, Iron Will, Improved Initiative, Weapon Focus). One must be removed.
CMD	10 + 2 (BAB) + 2 (Str) + 2 (Dex) = 16.	Correct.

This audit reveals that while many of Spitfire's stats are correct, the stat block contains significant build errors. The erroneous melee attack bonus of +3 instead of +5 dramatically reduces Spitfire's threat, making him miss roughly 10% more often against a typical PC's AC and misrepresenting his CR 2 challenge level. Similarly, the incorrect Will save and extra feat allocation demonstrate a clear departure from the core rules. This exercise proves the value of a systematic audit for ensuring a stat block is mechanically sound and functions as intended.

8.0 Advanced Modifications: Applying Class Levels and Templates

The true power of monster customization in Pathfinder comes from applying class levels and templates. These tools allow a GM to transform a standard creature from the Bestiary into a unique and memorable antagonist. Class levels grant the specific, scaling abilities of PC or NPC classes, adding tactical depth. Templates, on the other hand, apply a suite of thematic changes, completely altering a base creature's identity to fit a new concept, such as turning a simple wolf into an undead horror.

8.1 Adding Class Levels

When you add class levels to a base creature (like an Orc), you are effectively multiclassing it. The process involves combining the abilities from the creature's racial Hit Dice with the new abilities from its class levels. You must correctly stack HD, Base Attack Bonus, saving throws, feats, and skills. For base saves and BAB, you determine the progression from the racial HD and the progression from the class levels separately, then add them together. For saves, you always take the better progression between the racial HD and class levels. As noted in the GameMastery Guide, PC classes (like Fighter or Wizard) are significantly more powerful than NPC classes (like Warrior or Expert).

Example: Orc Barbarian

Let's add 1 level of the Barbarian PC class to a standard Orc from the Bestiary.

1. Base Creature (Orc):
  * Total HD: 1 (racial)
  * HD Type: d8
  * BAB: +0 (Medium progression from 1 racial HD)
  * Base Saves: Fort +0 (Bad), Ref +0 (Bad), Will +2 (Good)
2. Added Class (Barbarian 1):
  * Total HD: 1 (class)
  * HD Type: d12
  * BAB: +1 (Fast progression from 1 class level)
  * Base Saves: Fort +2 (Good), Ref +0 (Bad), Will +0 (Bad)
3. Combined Stat Line (Orc Barbarian 1):
  * Total HD: 2 (1 racial + 1 class)
  * HD Type: 1d8 + 1d12
  * BAB: +1 (+0 from Orc racial HD + +1 from Barbarian class level)
  * Base Saves (use better progression for total HD of 2):
    * Fortitude: Barbarian's Good progression (+3 at 2 HD) is better than Orc's Bad (+0). Base Fort save is +3.
    * Reflex: Both are Bad progression (+0 at 2 HD). Base Ref save is +0.
    * Will: Orc's Good progression (+3 at 2 HD) is better than Barbarian's Bad (+0). Base Will save is +3.

8.2 Applying Templates

A template provides a list of modifications to a base creature's statistics, abilities, and even its core identity. The Vampire template, for example, makes numerous changes: it changes the base creature's type to Undead, grants it Damage Reduction (DR), increases its Strength and Charisma, and adds a host of new special attacks and qualities like blood drain and channel resistance. Applying a template is a matter of systematically going through the listed changes and applying each one to the base creature's stat block.

A firm grasp of the rules presented in this guide is the key to unlocking Pathfinder's deep and rewarding monster creation system. By ensuring your creatures are built on a solid mechanical foundation, you empower yourself to create balanced, believable, and unforgettable encounters that will enhance the game for everyone at your table.
