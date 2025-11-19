A Coder's Guide to Pathfinder 1e Treasure and XP Validation

This document serves as a technical guide for software developers tasked with creating a rules validation engine for the Pathfinder 1e system. It provides a structured analysis of the rules governing Experience Points (XP) and Treasure, derived exclusively from the provided source texts. This guide will define the core relationships between Challenge Rating (CR), XP, and Treasure; detail the data structures of various treasure types; and highlight critical inconsistencies that a validation engine must be programmed to account for. The goal is to provide a clear, actionable blueprint for implementing accurate validation logic based on the documented data.


--------------------------------------------------------------------------------


1. The Core Relationship: CR, XP, and Treasure

Challenge Rating (CR) is the fundamental statistic from which both Experience Point (XP) awards and Treasure values are derived. This section deconstructs the direct and indirect relationships between these three core data points, providing the foundational logic essential for any rules validation system. Understanding this hierarchy is the first step toward building a robust parser and validator.

1.1. Defining Challenge Rating (CR)

Challenge Rating (CR) is a numerical value representing the relative threat level of a creature or NPC. It is the primary key used to determine the rewards for overcoming an encounter. The provided stat blocks demonstrate its application across a wide range of entities.

* Examples from Source Data:
  * Torval "Cutty-Eye" Dorst: CR 1/2
  * "One-Eyed" Bess: CR 2
  * Milo Chance: CR 3
  * Maggot of Mahori: CR 5
  * Babau: CR 6

1.2. The CR-to-XP Conversion Principle

The primary rule for awarding experience is that a creature's XP value is a direct function of its Challenge Rating. The higher the CR, the greater the XP award. The following table provides several examples of this CR-to-XP mapping:

Entity Name	CR	XP Value
"One-Eyed" Bess	2	600
Milo Chance	3	450
Galia Thorow	4	600
Maggot of Mahori	5	1,600
Babau	6	2,400

While this relationship is the primary rule, the source data reveals significant inconsistencies that will be analyzed in Section 2.

1.3. The CR-to-Treasure Link

Treasure allocation is also directly linked to CR. The source text from 'Bestiary 1' specifies that for "Standard" treasure, "...the total value of the creature’s treasure is that of a CR equal to the average party level, as listed on Table 12–5 on page 399 in the Pathfinder RPG Core Rulebook." This rule establishes a direct link between a creature's CR and the total value of its expected treasure, providing a key metric for validating loot drops even when specific items are variable.

With the foundational link between CR, XP, and Treasure established, the following sections will now perform a deep-dive analysis of the specific data and validation rules for XP and Treasure individually.


--------------------------------------------------------------------------------


2. Parsing Experience Point (XP) Data

This section focuses on the specific data points and validation logic for Experience Points (XP). It will present the raw data available in the source text and, more importantly, analyze the inconsistencies and edge cases that a rules validator must be programmed to handle. Successfully validating XP awards requires a system capable of managing these documented variations.

2.1. Documented XP Values by CR

The following table, 'Observed CR and XP Values,' compiles the CR and XP values as observed directly in the source stat blocks. This data forms the basis for any validation checks.

Entity Name	CR	XP Value
Torval “Cutty-Eye” Dorst	1/2	75
Benvida	1/2	150
“One-Eyed” Bess	2	600
Crimson Coin Crew Pickpocket	2	300
Milo Chance	3	450
Galia Thorow	4	600
Maggot of Mahori	5	1,600
Babau	6	2,400

2.2. Critical Validation Point: XP Award Inconsistencies

A direct analysis of the data presented above reveals critical inconsistencies that pose a significant challenge for a validation engine. A robust validator must be designed to handle these documented variants to avoid generating false negatives.

* CR 1/2 Discrepancy: Entities with a CR of 1/2 are documented with two different XP values: 75 (Torval “Cutty-Eye” Dorst) and 150 (Benvida). A validator must recognize both values as potentially valid for this CR.
* CR 2 Discrepancy: Similarly, CR 2 entities are shown with XP awards of both 300 (Crimson Coin Crew Pickpocket) and 600 (“One-Eyed” Bess). Both should be considered valid data points.
* CR 4 Anomaly: Galia Thorow, a CR 4 entity, has a documented XP value of 600. This is identical to the XP value of “One-Eyed” Bess, a CR 2 entity. This overlap is a critical data point for the validation logic.

The validator should be designed to either flag these discrepancies as potential errors requiring manual review or, more practically, accept them as valid alternative values based on the provided source data.

Having analyzed the complexities of XP validation, the focus will now shift to the multifaceted structure of Treasure.


--------------------------------------------------------------------------------


3. Deconstructing Treasure Data

Accurately parsing and validating treasure data is of strategic importance. Unlike the single integer value of XP, "Treasure" is a complex data object composed of multiple types and categories. This section provides a systematic breakdown of treasure, from high-level value classifications to the specific attributes of individual items, creating a clear data model for developers.

3.1. Treasure Value Tiers

The 'Bestiary 1' source text defines a set of standard tiers that classify the total value of a creature's treasure. These tiers must be recognized by the parser.

Tier	Definition
Standard	The total value of the creature’s treasure is that of a CR equal to the average party level, as listed on Table 12–5 on page 399 in the Pathfinder RPG Core Rulebook.
Double	The creature has double this standard value.
Triple	The creature has triple this standard value.
Incidental	The creature has half this standard value, and then only within the confines of its lair.
None	The creature normally has no treasure.
NPC gear	The monster has treasure as normal for an NPC of a level equal to the monster’s CR (see page 454 of the Pathfinder RPG Core Rulebook).

These tiers are applied directly in creature stat blocks, providing the high-level classification for validation.

* Examples from Source Data:
  * Solar: Treasure Double
  * Doppelganger: Treasure NPC Gear
  * Duergar: Treasure NPC Gear
  * Maggot of Mahori: Treasure Incidental
  * Babau: Treasure None (implied by its absence in the stat block, a useful note for a parser)

3.2. A Data Model for Treasure Components

A creature's treasure is composed of various components that must be parsed. The following subsections outline a potential schema for a comprehensive treasure object.

3.2.1. Currency and Valuables

The simplest treasure components are currency and non-magical items with an explicit value. The parser must recognize standard currency denominations (gp, sp, cp) and valued goods.

* Examples: Benvida's Loot includes "35gp, 25sp, Crimson Coin (3sp)". Torval's Loot includes a "Small Rag Doll (2sp)".

3.2.2. Gear and Consumables

Treasure often includes non-magical equipment and consumable items. The data model should differentiate between items explicitly listed as Combat Gear and those found in general Loot.

* Combat Gear Example: Potion of Invisibility
* General Loot Examples: Thieves' Tools, Dagger, Bolts (10)

3.2.3. Magic Items

Magic items are complex objects with multiple attributes that require validation. The data for these items can be modeled as a structured object with discrete fields.

Item Name	Aura	CL	Slot	Price	Weight
Poncho of Acid Protection	faint abjuration	2nd	shoulders	600 gp	1 lb.
Ring of Dustbone Binding	faint necromancy	5th	ring	8,000 gp	—
Sinder’s Eye	strong necromancy	10th	–	10,000 gp	5 lbs.

Additional Validation Fields Beyond the core statistics, the data structure for a magic item must also account for text-based fields that are essential to its definition:

* DESCRIPTION: A text block detailing the item's appearance and nature.
* CONSTRUCTION REQUIREMENTS: A text block outlining the feats and costs required to create the item.

With the core components of XP and Treasure deconstructed, the guide will now synthesize this information into a set of core principles for building the validation engine.


--------------------------------------------------------------------------------


4. Core Validation Logic and Implementation

This final section consolidates the findings from the previous sections into a set of actionable principles for the developer. It provides high-level guidance on structuring the validation logic, handling the observed data anomalies, and defining a schema for critical data objects. This serves as the strategic summary for implementing the validator.

4.1. Key Validation Principles

The foundational rules for the validation engine can be summarized as follows:

1. CR is Primary: All validation logic for XP and Treasure must begin by parsing the entity's Challenge Rating (CR). It is the root of all subsequent checks.
2. XP is CR-Dependent: A primary check must validate that the XP value corresponds to a known, documented value for the given CR. This check must account for the documented variants to function correctly.
3. Treasure is CR-Driven: The Treasure type (e.g., Standard, Incidental, NPC Gear) must be validated against the list of official tiers. The total value of all listed items should then be checked to ensure it corresponds to the value dictated by the creature's CR according to the treasure value tables in the Core Rulebook.

4.2. Recommended Logic for Handling Data Discrepancies

To effectively manage the XP inconsistencies identified in Section 2, the following logic is recommended:

* Recommendation 1: Create a CR-to-XP Map. Implement a data structure, such as a dictionary or hash map, that maps a single CR to an array of possible valid XP values. For example, CR 2 would map to [300, 600], and CR 1/2 would map to [75, 150]. This allows the validator to confirm an observed XP value is among the known valid options for its CR.
* Recommendation 2: Implement Warning Flags. The validator should successfully pass on any of the documented XP values for a given CR. However, it should be programmed to raise a non-critical "warning" flag indicating that a known variant value was used. This provides useful feedback to the user without causing a hard validation failure.

4.3. Validating the "NPC Gear" Treasure Type

The "NPC gear" treasure type requires a distinct validation path. As defined in the Bestiary excerpt, this type indicates the creature has "treasure as normal for an NPC of a level equal to the monster’s CR."

The validator must therefore perform a separate check. It needs to confirm that the total value of the gear listed in the stat block aligns with the official treasure value guidelines for an NPC whose character level is equal to the creature's CR. This logic path will require referencing external data, specifically the guidelines mentioned in the source text on "page 454 of the Pathfinder RPG Core Rulebook."

Conclusion: A Robust Validator

A developer creating a Pathfinder 1e Treasure and XP validator based on these source texts faces two primary challenges: correctly mapping the hierarchical relationship between CR, XP, and Treasure, and handling data inconsistencies. This guide reiterates the absolute importance of using the Challenge Rating (CR) as the foundational data point for all validation checks. More critically, it stresses the necessity of building the system to handle the documented inconsistencies in XP values; failing to account for these variants will result in a brittle validator that produces frequent false negatives. By following the principles and data models outlined in this guide, a developer can create a robust, accurate, and source-faithful validation tool.
