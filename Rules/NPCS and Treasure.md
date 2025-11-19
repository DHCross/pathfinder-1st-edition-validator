Pathfinder 1E Rules Validator's Guide: NPCs and Treasure

Introduction: The Logic of the Stat Block

Welcome to the Rules Validator's Guide. This document serves as a technical blueprint for software developers tasked with creating a rules validation engine for the Pathfinder 1st Edition roleplaying game. Its purpose is to deconstruct the complex components of Non-Player Characters (NPCs) and their associated treasure into a logical, systematic framework that can be translated into programmable logic and data structures.

This guide is grounded exclusively in the provided source materials to ensure strict adherence to core game mechanics. By breaking down the hierarchical structure of a creature—from its foundational type to the intricate calculations within its stat block and the rules governing its advancement and equipment—we provide a clear pathway for validating the integrity of any NPC. The following sections will systematically dissect these elements, offering a definitive reference for building a robust and accurate validation system.


--------------------------------------------------------------------------------


1. Foundational NPC Concepts: The Core Building Blocks

Before a single calculation can be validated, the system must understand the strategic importance of an NPC's foundational mechanics. These core concepts—Creature Type, Subtype, and core physical and sensory statistics—form the base template upon which all character variations are built. Validating these fundamentals is the first and most critical step in ensuring a rules-compliant character, as they dictate hit points, attack progression, skills, and special abilities.

1.1. Creature Types

Every creature belongs to a primary type, which defines its fundamental strengths and weaknesses. A validation engine must begin by referencing the core mechanical attributes associated with each type. The following table outlines these attributes as defined in the game's core bestiary.

Creature Type	Hit Die (HD)	Base Attack Bonus (BAB) Progression	Good Saving Throws	Skill Points per HD	Core Traits (Representative List)
Aberration	d8	Medium	Will	4 + Int modifier	- Darkvision 60 ft.
Animal	d8	Medium	Fortitude, Reflex	2 + Int modifier	- Low-light vision.<br>- Intelligence score of 1 or 2.
Construct	d10	Fast	None	2 + Int modifier	- Low-light vision, Darkvision 60 ft.<br>- Immunity to bleed, disease, death effects, necromancy, paralysis, poison, sleep, and stunning.<br>- Cannot heal damage on its own.
Humanoid	d8	Medium	One good save, usually Reflex	2 + Int modifier	- Proficient with all simple weapons, or by class.<br>- Proficient with any armor mentioned in its entry.<br>- Must breathe, eat, and sleep.
Outsider	d10	Fast	Reflex, Will	6 + Int modifier	- Darkvision 60 ft.<br>- Proficient with all simple and martial weapons.<br>- Does not need to eat or sleep (but can).
Undead	d8	Medium	Will	4 + Int modifier	- Darkvision 60 ft.<br>- Immunity to all mind-affecting effects, bleed, death effects, disease, paralysis, poison, sleep, and stunning.<br>- Not subject to nonlethal damage, ability drain, or energy drain.<br>- Uses Charisma modifier for Constitution-based checks.

The BAB Progression (Fast, Medium, Slow) is a critical variable in calculating an NPC's combat effectiveness. A validator must map these descriptors to their numerical formulas (e.g., Fast = +1 per HD, Medium = +0.75 per HD, Slow = +0.5 per HD) to correctly compute the Base Attack Bonus property.

1.2. Creature Subtypes

Subtypes are modular rule packages, analogous to mixins or decorators, that apply a consistent set of modifications to a base creature object. A validator must be able to parse these subtypes and apply their effects to the creature's stat block.

* Lawful Subtype: Typically applied to outsiders from lawfully aligned planes. This subtype makes a creature's natural weapons and wielded weapons lawfully aligned for the purpose of overcoming Damage Reduction. The creature is affected by alignment-based effects as if it were lawful, regardless of its actual alignment.
* Shapechanger Subtype: This subtype is for creatures that can dramatically alter their physical form. A key trait is proficiency with its natural weapons, simple weapons, and any other weapons mentioned in its description.
* Swarm Subtype: A swarm is a collection of Fine, Diminutive, or Tiny creatures acting as a single entity. It has a single pool of Hit Dice and hit points, a single initiative, and a single AC. Swarms are immune to any spell or effect that targets a specific number of creatures and are immune to weapon damage.
* Elemental Subtype: Applied to outsiders composed of one of the four classical elements. Elementals have traits specific to their element, such as an Air Elemental's Air Mastery, which imposes a penalty on airborne creatures attacking it.

1.3. Core Statistics and Modifiers

These fundamental statistics define a creature's physical and sensory capabilities. A validator must confirm that these base values correctly inform the derived statistics throughout the stat block.

* Size: A creature's size category (e.g., Medium, Large) determines its fundamental combat profile.
  * It applies a modifier to Armor Class (AC) and attack rolls.
  * It is a key component in calculating Combat Maneuver Bonus (CMB) and Combat Maneuver Defense (CMD).
  * It impacts skill checks, most notably applying a penalty to Stealth checks as size increases.
* Ability Scores: The six core ability scores represent a creature's raw potential.
  * Strength (Str): Influences melee attack rolls, melee and thrown weapon damage, and Climb and Swim checks.
  * Dexterity (Dex): Impacts AC, Reflex saves, and checks for skills like Acrobatics and Stealth.
  * Constitution (Con): Determines hit points and Fortitude saving throws.
  * Intelligence (Int): Governs the number of skill points a creature gains per level.
  * Wisdom (Wis): Affects Will saving throws and Perception checks.
  * Charisma (Cha): Key for skills like Bluff and Diplomacy; used in place of Constitution for many Undead calculations.
* Speed: This defines a creature's movement capabilities, specified in feet per round.
  * Land: The creature's base walking speed.
  * Fly, Burrow, Swim, Climb: Alternative movement modes. Burrow and climb speeds are often half the base land speed, while fly speeds are often double.
* Senses: These abilities define how a creature perceives its environment.
  * Darkvision: The ability to see in total darkness up to a specified range (typically 60 ft.), perceiving only in black and white.
  * Low-Light Vision: The ability to see twice as far as a human in conditions of dim light.
  * Scent: The ability to detect creatures by smell within a certain range.
  * Tremorsense: The ability to pinpoint the location of anything in contact with the ground within a specified range.

With these foundational concepts established, we can now deconstruct the standardized format used to present them: the NPC stat block.


--------------------------------------------------------------------------------


2. The NPC Stat Block: A Coder's Blueprint

The NPC stat block is a standardized data object, akin to a well-defined class or struct, where each block (Header, Defense, etc.) represents a group of related properties and methods. For a rules validator, each section represents a distinct category of data with its own internal logic and dependencies. A compliant stat block is one where all sections are correctly calculated and cross-referenced, forming a cohesive and logical whole.

2.1. Header Data

The header provides the creature's top-level classification and threat assessment. Validation in this section ensures the core identity of the NPC is correctly defined.

* Name: The creature's unique identifier.
* Challenge Rating (CR) & Experience Points (XP): CR is the measure of the creature's relative threat level. The XP value is directly correlated with the CR, as defined in standard progression tables. A validator should confirm this relationship.
* Alignment, Size, Type, and Subtypes: These are the core classifications that determine many subsequent abilities, statistics, and vulnerabilities. They are the foundational tags upon which the rest of the stat block is built.

2.2. Defense Block

This section details the NPC's survivability. These statistics are derived from a combination of base stats, creature type, class features, feats, and equipment.

* Armor Class (AC): The target number for an opponent's attack roll. The formula must be validated against its components: AC = 10 + armor bonus + shield bonus + Dexterity modifier + size modifier + other modifiers (natural armor, deflection, etc.).
* Hit Points (hp): A measure of the creature's health. The formula is: hp = (Number of HD × Average Die Value) + (Number of HD × Constitution modifier).
* Saving Throws (Fortitude, Reflex, Will): The NPC's ability to resist adverse effects. Each save is calculated from a base value determined by the creature's type and class levels, plus the relevant ability score modifier (Constitution for Fortitude, Dexterity for Reflex, Wisdom for Will).
* Defensive Abilities (DR, Immune, Resist, SR): These are special qualities that mitigate or negate specific types of harm. Their notation must be parsed correctly:
  * Damage Reduction (DR): Indicates the amount of physical damage a creature ignores from most attacks. The notation specifies what bypasses this reduction. For example, DR 10/cold iron or evil means the creature ignores the first 10 points of damage unless the weapon is made of cold iron OR is magically evil-aligned. A validator must parse these conditions correctly.
  * Immunity (Immune): The creature takes no damage or effect from a specified source (e.g., Immune electricity, petrification).
  * Resistance (Resist): The creature ignores a set amount of damage from an energy source (e.g., Resist fire 10).
  * Spell Resistance (SR): The creature has a chance to ignore spells that are subject to SR.

2.3. Offense Block

This section details the NPC's capacity for action and aggression.

* Speed: The creature's movement rates, as defined in its core statistics.
* Melee and Ranged Attacks: Attack entries follow a standard format: Attack Name +AttackBonus (Damage/Critical). The validator must confirm:
  * Attack Bonus: BAB + Ability Modifier (Str for Melee, Dex for Ranged) + Size Modifier + Other Bonuses (feats, weapon enhancement, etc.).
  * Damage: Weapon Damage + Ability Modifier (Str for Melee, 1.5x Str for two-handed melee, potentially Str for some ranged weapons).
* Space & Reach: The area a creature occupies and the distance at which it can make melee attacks, determined by its size.
* Special Attacks & Spell-Like Abilities (SLAs): Active abilities available to the creature, such as a Chimera's Breath Weapon or a Bralani's whirlwind blast. For SLAs, the Caster Level (CL) is a critical value that determines the ability's power and must be validated.

2.4. Statistics & Ecology Blocks

These final sections contain the foundational scores and contextual information.

* Statistics: This block lists the raw data from which many other values are derived.
  * Ability Scores: The six core scores (Str, Dex, Con, Int, Wis, Cha).
  * Base Attack Bonus (BAB): Determined by creature type and class levels.
  * Combat Maneuver Bonus (CMB): CMB = BAB + Strength Modifier + Special Size Modifier.
  * Combat Maneuver Defense (CMD): CMD = 10 + BAB + Strength Modifier + Dexterity Modifier + Special Size Modifier.
  * Feats, Skills, Languages, Special Qualities (SQ): Lists of additional learned abilities, proficiencies, and inherent traits.
* Ecology: This section provides narrative context (Environment, Organization) but also contains the critical Treasure code. This code is the primary input for validating the creature's gear and carried wealth.

The Statistics block contains the system's foundational variables. The validator's logic must begin here, as the six Ability Scores, BAB, and Feats are inputs for nearly every calculation in the Defense and Offense blocks. A change to Strength, for instance, must trigger a recalculation of CMB, melee attack bonuses, and melee damage.

A static, validated stat block is the baseline. However, the true complexity of the rules engine comes from applying the dynamic rules of character modification.


--------------------------------------------------------------------------------


3. NPC Modification and Advancement

Base creatures are rarely used as-is; they are typically modified with templates that grant new powers or class levels that add new skills and abilities. A robust validator must be able to parse these modifications as functions that take a base creature object as input and return a new, modified creature object with recalculated stats. This requires a clear order of operations, ensuring that all dependencies and stacking rules are honored.

3.1. Applying Creature Templates

Templates are sets of rules that are applied over a creature's base statistics to create a new, modified creature. They are a primary method of creating powerful or unique NPCs.

* Inherited Templates: These templates are part of a creature from the moment of its creation or birth. A validator must treat them as integral to the base creature.
  * Example (half-fiend / half-celestial): These templates grant a suite of abilities including Damage Reduction (e.g., DR 5/magic), Spell Resistance, elemental resistances (acid, cold, electricity, fire), and powerful special attacks like Smite Good/Evil.
* Acquired Templates: These are added to a creature later in its existence, often as the result of a magical transformation or curse. Conceptual examples include a powerful wizard becoming a lich or a mortal spirit rising as a ghost.
* Simple Templates: These are designed for quick, on-the-fly application to modify a creature's threat level with minimal effort. They provide two methods of application:
  * Quick Rules: Offers a fast way to modify die rolls during gameplay without altering the stat block, ideal for summoned creatures.
  * Rebuild Rules: Provides exact changes to apply to a monster's stat block when time allows for a full recalculation.

3.2. Adding Class Levels

Adding PC or NPC class levels to a monster is a common way to increase its CR and customize its capabilities. A validator must be able to systematically apply these changes.

1. Core Stacking Rule: The abilities, feats, and features granted by a class level stack with the base creature's existing abilities.
2. Statistic Updates: The following statistics must be recalculated:
  * Hit Dice: The new Hit Dice from the added class are added to the creature's existing HD total. Total hit points must be recalculated accordingly.
  * BAB & Saves: The base attack bonus and base save bonuses from the new class level are added directly to the creature's existing base bonuses.
  * Skills: New skill points are calculated for the new class levels (Ranks per level + Int modifier). These are added to the creature's existing skill ranks. If the class grants a new class skill that the monster already has ranks in, the creature gains a +3 bonus for having ranks in a class skill.
  * Feats: New feats are gained at the appropriate character levels, adding to the creature's existing feat list.

For example, adding a level of Fighter grants a d10 HD, a +1 BAB (fast progression), and a +2 Fortitude save (good progression). Adding a level of Wizard grants a d6 HD, a +0 BAB (slow progression), and a +2 Will save (good progression). NPC classes like Expert or Warrior provide similar but generally less powerful progressions.

These modifications add layers of complexity that a validator must systematically parse. This leads into the final validation check: ensuring the NPC's gear and wealth are appropriate for its final, modified Challenge Rating.


--------------------------------------------------------------------------------


4. Treasure Generation and Validation

Treasure allocation for NPCs is not a random process. It is governed by a set of rules based on the creature's final Challenge Rating and its designated treasure type. Validating an NPC's equipment requires checking the total value of its gear against these established guidelines to ensure game balance.

4.1. Foundational Treasure Rules

A validator must check three core principles of treasure assignment.

* Treasure Codes: Monster stat blocks typically include a treasure code that dictates the general amount of wealth it possesses.

Treasure Code	Description
None	The creature possesses no treasure, aside from its own hide, teeth, or other valueless biological components.
Incidental	The creature carries a small amount of coins or a few minor, often mundane, items.
Standard	The creature possesses an amount of treasure appropriate for its Challenge Rating, as listed in the value tables.
Double	The creature possesses twice the standard amount of treasure for its CR.
Triple	The creature possesses three times the standard amount of treasure for its CR.

* Treasure Value by CR: The primary benchmark for treasure validation is the target GP value for an encounter of a given CR. This value varies based on the campaign's expected wealth progression (Slow, Medium, or Fast).

CR	Slow GP	Medium GP	Fast GP
1	170 gp	260 gp	400 gp
2	350 gp	550 gp	800 gp
3	550 gp	800 gp	1,200 gp
4	750 gp	1,150 gp	1,700 gp
5	1,000 gp	1,550 gp	2,300 gp
6	1,350 gp	2,000 gp	3,000 gp
7	1,750 gp	2,600 gp	3,900 gp
8	2,200 gp	3,350 gp	5,000 gp
9	2,850 gp	4,250 gp	6,400 gp
10	3,650 gp	5,450 gp	8,200 gp
(Table abbreviated for brevity)			

* Treasure for NPCs with Class Levels: This is a critical exception. A monster with class levels does not use its standard treasure code. Instead, its treasure is determined by its final CR, and its total gear value should be equal to that of a heroic NPC of that level. This rule overrides the standard monster treasure guidelines and directs the validator to a different wealth table (found on page 454 of the Core Rulebook).

4.2. Item Catalogs for Validation

To validate an NPC's treasure, the system must reference an internal database of items with their correct costs. This database serves as the ultimate source of truth for summing the value of an NPC's gear. The following lists provide a representative schema for such a catalog.

* Mundane Equipment
  * Weapons: Longsword, Greataxe, Heavy Crossbow, Dagger, Spear
  * Armor: Chainmail, Full Plate, Leather Armor, Heavy Steel Shield
  * Alchemical Items: Antitoxin, Holy Water, Everburning Torch
  * Special Materials:
    * Adamantine: An ultrahard metal used to bypass hardness in objects and provide Damage Reduction when made into armor.
    * Cold Iron: A type of iron that is effective against fey and certain outsiders.
    * Silver (Alchemical): A coating that allows a weapon to bypass the DR of creatures like lycanthropes.
* Magic Items
  * Armor & Shields: Magic armor and shields provide an enhancement bonus to AC.
    * Example: Celestial Armor (a +3 chainmail that allows flight once per day) - 22,400 gp
  * Weapons: Magic weapons provide an enhancement bonus to attack and damage rolls. The formula is Cost = (Enhancement Bonus^2 * 2,000 gp) + Base Masterwork Item Cost.
    * Example: +2 Longsword - 8,315 gp
    * Example: Hero's Blade (a +2 longsword that holds hero points) - 17,315 gp
  * Rings: Magical rings worn on the finger that provide a variety of constant or activated effects.
    * Example: Ring of Spell Storing, Minor (stores up to 3 levels of spells) - 18,000 gp
  * Rods: Scepter-like devices with unique magical powers that do not fall into other categories.
    * Example: Rod of Wonder (produces random, unpredictable effects) - 12,000 gp
  * Wondrous Items: A broad category of magical items that includes clothing, jewelry, and other miscellaneous objects.
    * Example: Belt of Giant Strength +2 (grants a +2 enhancement bonus to Strength) - 4,000 gp
    * Example: Boots of Elvenkind (grants a +5 competence bonus on Acrobatics checks) - 2,500 gp
    * Example: Lantern of Revealing (reveals invisible creatures and objects) - 30,000 gp

A comprehensive database of items, built on these principles and expanded to include the full breadth of available equipment, is essential for a functional rules validator capable of ensuring both mechanical and economic balance in the game.
