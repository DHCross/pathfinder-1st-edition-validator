// Test script to verify parser fix for labeled Type and Size
import { parsePF1eStatBlock } from './src/lib/pf1e-parser.ts';

const lampreelText = `Lampreel
Aln: NE Size: H Type: Magical Beast Sub: Mutant
Init: +4 Senses: Darkvision 60 feet. Low-light
vision. Perception: +10
DEFENSE
AC 14/18 touch 8/11 flat-footed 14/14 Dex, +0/+3 Natural, +6 /+6 Armor, +0 Size, -2/-1
HP 60 ( 6d10+20 ) (Body) Fast Healing 1
HP 15 (each head) Fast Healing 1 (will not be able to act until fully recovered)Divide the number of heads by its
hp, that is the amount of damage each head can take before being disabled. These hit points do not affect the body.
Head
Fort +8 , Ref +4 , Will +3 XP :
OFFENSE
Speed: 10 Swim: 40 Climb: 10
Heads: 4 Bites +11 (1d8+10 +grab)
Tentacle (target must be in the water) 1 tentacle +9 +grab.
Gaping Maw 1 bite +9 (2d6+10+swallow whole) In order to make a gaping Maw attack the target must begin the
round grappled by a tentacle.
Space Huge ; Reach 15
Special Attacks
Tentacle (target must be in the water) 1 tentacle +9 +grab.
Gaping Maw 1 bite +9 (2d6+10+swallow whole) In order to make a gaping Maw attack the target must begin the
round grappled by a tentacle.
Corruption field Creature within a 50 foot radius (per point of Wisdom Bonus) of the Lampreel for more than an
hour must make a Will save DC 14 or come under an effect equivalent to a Charm Spell that is weak at first but
grows stronger every day. As time passes it drives the infected creature insane. The creature eventually (after
several weeks becomes fully dominated) The alignment of the creature shifts one step closer to the Lampreel each
week until they are of one alignment. A Lampreel may only enthrall one creature for each point of Wisdom Bonus.
STATISTICS
Str 26 Dex 10 Con 18 Int 12 Wis 12 Cha 6
Base Atk +6 ; CMB +14 (+4 bonus on combat maneuver checks made to start and maintain a grapple.) CMD
24
Feats: Improved Initiative, Iron Will, Multiattack
Skills Climb +17, Perception +13, Stealth +5, Swim +21 Racial skill bonus: +4 Swim
SQ: Amphibious, Fast Haling,
Ecology
Environment: varies
Organization solitary

Treasure standard
The Lampreel is a mutant creation of raw creation and chaos that leaks from the very earth of the Ravenous Coast.
As such there are not many like it in the world. The creatures are hermaphroditic and the one presented in this
adventure has already released a dozen or so eggs that are now spread through out the Ondevka River.
Amphibious (Ex)
Creatures with this special quality have the aquatic subtype, but they can survive indefinitely on land.
Fast Healing (Ex)
A creature with the fast healing special quality regains hit points at an exceptional rate, usually 1 or more hit
points per round, as given in the creature’s entry. Except where noted here, fast healing is just like natural healing.
Fast healing does not restore hit points lost from starvation, thirst, or suffocation, nor does it allow a creature to
regrow lost body parts. Unless otherwise stated, it does not allow lost body parts to be reattached. Fast healing
continues to function (even at negative hit points) until a creature dies, at the point the effects of fast healing end
immediately.
Format: fast healing 5; Location: hp.
Grab (Ex)
If a creature with this special attack hits with the indicated attack (usually a claw or bite attack), it deals normal
damage and attempts to start a grapple as a free action without provoking an attack of opportunity. Unless
otherwise noted, grab can only be used against targets of a size equal to or smaller than the creature with this
ability. If the creature can use grab on creatures of other sizes, it is noted in the creature’s Special Attacks line. The
creature has the option to conduct the grapple normally, or simply use the part of its body it used in the grab to hold
the opponent. If it chooses to do the latter, it takes a –20 penalty on its CMB check to make and maintain
the grapple, but does not gain the grappled condition itself. A successful hold does not deal any extra damage
unless the creature also has the constrict special attack. If the creature does not constrict, each
successful grapple check it makes during successive rounds automatically deals the damage indicated for the
attack that established the hold. Otherwise, it deals constriction damage as well (the amount is given in the
creature’s descriptive text).
Creatures with the grab special attack receive a +4 bonus on combat maneuver checks made to start and maintain
a grapple.
Format: grab; Location: individual attacks and special attacks.
Multiple Brains: The lampreel is a multi headed creature. Its brain is located in the center of the body
under water. It controls the tentacles and ts gaping maw. Each of the heads have a much smaller predatory
brain that while not a separate creature acts on it’s own. When all heads are slain the body will retreat to
deeper waters to slowly regenerate. It is able to attack with its tentacles and will feed creatures it grabs
into the Gaping Maw.
Swallow Whole (Ex)
If a creature with this special attack begins its turn with an opponent grappled in its mouth (see Grab), it can attempt
a new combat maneuver check (as though attempting to pin the opponent). If it succeeds, it swallows its prey, and
the opponent takes bite damage. Unless otherwise noted, the opponent can be up to one size category Smaller
than the swallowing creature. Being swallowed causes a creature to take damage each round. The amount and
type of damage varies and is given in the creature’s statistics. A swallowed creature keeps the grappled condition,
while the creature that did the swallowing does not. A swallowed creature can try to cut its way free with any light
slashing or piercing weapon (the amount of cutting damage required to get free is equal to 1/10 the creature’s
total hit points), or it can just try to escape the grapple. The Armor Class of the interior of a creature that swallows
whole is normally 10 + 1/2 its natural armor bonus, with no modifiers for size or Dexterity. If a swallowed creature
cuts its way out, the swallowing creature cannot use swallow whole again until the damage is healed. If the
swallowed creature escapes the grapple, success puts it back in the attacker’s mouth, where it may be bitten or
swallowed again.
Format: swallow whole (5d6 acid damage, AC 15, 18 hp); Location: Special Attacks).`;

const parsed = parsePF1eStatBlock(lampreelText);
console.log('Parsed Type:', parsed.type);
console.log('Parsed Size:', parsed.size);
console.log('Parsed Alignment:', parsed.alignment);
console.log('Parsed Subtypes:', parsed.subtypes);
