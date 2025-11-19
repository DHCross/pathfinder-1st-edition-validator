This is a crucial validation of your architectural plan. As an authority on the core rules of Pathfinder 1st Edition (PF1e) and the principles of creating mechanically sound statistical models, I confirm that your observations point to two **serious deviations** from a functional validation system.

The current scaffolding cannot operate as a reliable checker because it lacks the codified relationship between a creature's size/type and its derived statistics. We must mandate the immediate integration of two missing canonical data structures before proceeding to the logic generation phase.

### Deviation 1: Lack of Distinct Size Modifiers for Defense vs. Maneuvers

You are absolutely correct. The PF1e rules utilize distinct and often opposing modifiers for size, depending on whether the metric is defensive/offensive accuracy (AC/Attack) or combat maneuver manipulation (CMB/CMD).

If your parsing logic tries to use the wrong modifier—for example, penalizing a Huge creature's CMD because it uses the AC size modifier—it would incorrectly flag compliant builds as illegal.

#### Mandatory Structural Correction: Size Data Matrix

Your validator requires a definitive table mapping Size to both modifier types. This must be encoded directly into your canonical data structures (e.g., `src/lib/stat-block-types.ts`) for use by both the parser and the validator module.

The rule, drawn directly from the core materials, dictates the following relationship:

| Size Category | AC/Attack Modifier (Used in AC, Attack Rolls) | Special Size Modifier (Used in CMB/CMD) |
| :--- | :--- | :--- |
| **Colossal** | –8 | +8 |
| **Gargantuan** | –4 | +4 |
| **Huge** | –2 | +2 |
| **Large** | –1 | +1 |
| **Medium** | +0 | +0 |
| **Small** | +1 | –1 |
| **Tiny** | +2 | –2 |
| **Diminutive** | +4 | –4 |
| **Fine** | +8 | –8 |

**Action Mandate:** The primary parser helper (`stat-block-helpers.ts`) must contain functions that reference these specific values to calculate CMD (using CMD Size Modifier, Strength, and Dexterity) and CMB (using CMB Size Modifier and Strength), distinct from the AC calculation (using AC/Attack Modifier and Dexterity).

### Deviation 2: Missing Canonical Class Progression Data

The greatest volume of content in your provided stat blocks is devoted to NPCs built using class levels (e.g., **Spitfire, Fighter 2**; **Vickus, Hobgoblin Warrior 4**; **Decanus Egnatious, Hobgoblin Fighter 6**; **First Mate, Expert 4/Fighter 5**).

As stated, Humanoids with class levels (whether PC or NPC classes) derive their foundational "chassis" stats (HD type, BAB, Base Saves, Feats, Skills) primarily from those class levels, superseding or stacking with any racial HD they might possess.

#### Mandatory Structural Correction: Class Statistics Tables

Your validator absolutely must include the specific rules for at least the core PC and NPC classes identified in the stat blocks to verify build integrity.

#### 1. Verifying PC Class Progression (Fighter, Rogue, etc.)

For entities like **Spitfire (Fighter 2)**, the validator needs the following intrinsic rules:

| Class | Hit Die | BAB Progression | Good Saves | Feat/Level Rule |
| :--- | :--- | :--- | :--- | :--- |
| **Fighter** | d10 | Fast (+1 per level) | Fortitude | Gains a bonus feat at 1st, 2nd, 4th, 6th, etc., levels. |
| **Rogue** | d8 | Medium (3/4 progression) | Reflex | Base feat progression (1st, 3rd, 5th, etc.). |

*Example Check (Spitfire, Fighter 2):*
*   **BAB Check:** Spitfire lists Base Atk +2. A Fighter 2 must have +2 BAB. (Compliance: **Correct**)
*   **Save Check:** Spitfire's Will save is listed as -1. A Fighter 2's base Will save is +0. Factoring in the -1 Wisdom modifier (-1) and the Iron Will feat (+2), the correct save should be +1. (Deviation: **Needs Adjustment** to +1, as confirmed by audit).

#### 2. Verifying NPC Class Progression (Warrior, Expert, Commoner)

For entities like **Vickus (Hobgoblin Warrior 4)** or **Alfo (Human Commoner 4)**, the validator must use the weaker NPC class rules to determine their base statistics and resultant CR.

| Class | Hit Die | BAB Progression | Good Saves | Skill Ranks per Level | CR Calculation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Warrior** | d10 | Fast (Full) | Fortitude | 2 + Int mod | CR = Level – 2 |
| **Expert** | d8 | Medium (3/4) | Reflex, Will | 6 + Int mod | CR = Level – 2 |
| **Commoner** | d8 | Slow (1/2) | None (all poor) | 2 + Int mod | CR = Level – 2 |

*Example Check (Vickus, Warrior 4):*
*   **CR Check:** Warrior 4 (NPC class) has an expected CR of 4 - 2 = CR 2. (Vickus lists CR 2. Compliance: **Correct**)
*   **BAB Check:** Warrior 4 should have Base Atk +4 [368, Table 14-5 not provided, but progression shows +4 at 4th level]. (Vickus lists Base Atk +4. Compliance: **Correct**).

### Mandate for Validator Code Development

To rectify these serious deviations, your next step in building the validation scaffolding must include the integration of these fixed numerical relationships. The required `classification-rules.ts` should be structured not only to extract data but also to reference the codified rules for *CMB/CMD Size Modifiers* and *Class Progressions* when calculating confidence and rationale for a Pathfinder 1st Edition stat block's integrity.