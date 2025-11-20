import { PF1eStatBlock } from '../types/PF1eStatBlock';
import { MonsterStatisticsByCR, XP_Table, CreatureTypeRules, SizeConstants, CreatureSize } from '../rules/pf1e-data-tables';

export interface ScaledResult {
    block: PF1eStatBlock;
    changes: string[];
}

const SIZE_ORDER: CreatureSize[] = ['Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal'];

function adjustSize(current: CreatureSize, steps: number): CreatureSize {
    const idx = SIZE_ORDER.indexOf(current);
    if (idx === -1) return current;
    const newIdx = Math.max(0, Math.min(SIZE_ORDER.length - 1, idx + steps));
    return SIZE_ORDER[newIdx];
}

export function findClosestCR(xp: number): string {
    let closestCR = '1';
    let minDiff = Infinity;

    for (const [cr, val] of Object.entries(XP_Table)) {
        const diff = Math.abs(val - xp);
        if (diff < minDiff) {
            minDiff = diff;
            closestCR = cr;
        }
    }
    return closestCR;
}

export function scaleCreature(original: PF1eStatBlock, targetXP: number): ScaledResult {
    const block = JSON.parse(JSON.stringify(original)) as PF1eStatBlock;
    const changes: string[] = [];
    const originalXP = original.xp || 400;
    const ratio = targetXP / originalXP;

    // 1. Determine Target CR
    const targetCR = findClosestCR(targetXP);
    const targetStats = MonsterStatisticsByCR.find(r => r.cr === targetCR);

    if (!targetStats) {
        changes.push(`Could not find stats for CR ${targetCR}`);
        return { block, changes };
    }

    // --- TIERED SCALING LOGIC (The "Rule of Threes") ---
    
    // WEAK TIER (Ratio <= 0.75): Reduce Size, Reduce Stats
    if (ratio <= 0.75) {
        // Reduce Size by 1 step (if larger than Small)
        const oldSize = block.size;
        if (SIZE_ORDER.indexOf(oldSize) > 3) { // > Small
            block.size = adjustSize(oldSize, -1);
            changes.push(`Reduced Size from ${oldSize} to ${block.size} (Weak Tier)`);
        }

        // Reduce Physical Stats (-4)
        block.str = Math.max(1, (block.str || 10) - 4);
        block.con = Math.max(1, (block.con || 10) - 4);
        changes.push(`Reduced Str/Con by -4 (Weak Tier)`);
    }
    
    // ELITE TIER (Ratio >= 1.25): Increase Stats
    if (ratio >= 1.25) {
        // Increase Physical Stats (+4)
        block.str = (block.str || 10) + 4;
        block.con = (block.con || 10) + 4;
        changes.push(`Increased Str/Con by +4 (Elite Tier)`);
        
        // Note: We don't automatically increase size for Elite, as that's less common,
        // but the HD increase below will make them tough.
    }

    // 2. Adjust HD to match Target HP
    // Calculate HP per HD (using NEW Con)
    const typeRule = CreatureTypeRules[block.type] || { hitDieType: 8 };
    const conMod = Math.floor(((block.con || 10) - 10) / 2);
    const avgDie = (typeRule.hitDieType / 2) + 0.5;
    const hpPerHD = Math.max(1, avgDie + conMod);

    const targetHP = targetStats.hp;
    const newHD = Math.max(1, Math.round(targetHP / hpPerHD));

    const oldHD = block.racialHD || 0; // Assuming racial HD scaling for now
    
    if (block.racialHD !== undefined) {
        block.racialHD = newHD;
    } else if (block.classLevels && block.classLevels.length > 0) {
        // Scale class levels proportionally? Or just the first one?
        // For simplicity, scale the first class level
        const cls = block.classLevels[0];
        cls.level = newHD;
    } else {
        // Fallback: Add racial HD
        block.racialHD = newHD;
    }

    if (newHD !== oldHD) {
        changes.push(`Adjusted HD from ${oldHD} to ${newHD} to match Target HP ${targetHP}`);
    }

    // 3. Recalculate Derived Stats
    // HP
    const newHP = Math.floor(newHD * avgDie) + (newHD * conMod);
    block.hp = newHP;
    block.hp_claimed = newHP;
    block.hd = `${newHD}d${typeRule.hitDieType}${conMod >= 0 ? '+' : ''}${newHD * conMod}`; // Approximate string

    // BAB
    let newBAB = 0;
    if (typeRule.babProgression === 'fast') newBAB = newHD;
    else if (typeRule.babProgression === 'medium') newBAB = Math.floor(newHD * 0.75);
    else newBAB = Math.floor(newHD * 0.5);
    
    block.bab = newBAB;
    block.bab_claimed = newBAB;

    // Saves (Approximate based on Good/Bad saves)
    // Good: 2 + HD/2
    // Bad: HD/3
    const goodSaveVal = Math.floor(2 + newHD / 2);
    const badSaveVal = Math.floor(newHD / 3);
    
    const saves = typeRule.goodSaves || [];
    block.fort = saves.includes('Fort') ? goodSaveVal : badSaveVal;
    block.ref = saves.includes('Ref') ? goodSaveVal : badSaveVal;
    block.will = saves.includes('Will') ? goodSaveVal : badSaveVal;
    
    // Update claimed saves to match
    block.fort_save_claimed = block.fort;
    block.ref_save_claimed = block.ref;
    block.will_save_claimed = block.will;

    // CMD & AC
    const sizeData = SizeConstants[block.size] || { acAttackMod: 0, cmbCmdMod: 0 };
    const strMod = Math.floor(((block.str || 10) - 10) / 2);
    const dexMod = Math.floor(((block.dex || 10) - 10) / 2);
    
    block.cmd = 10 + newBAB + strMod + dexMod + sizeData.cmbCmdMod;
    block.cmd_claimed = block.cmd;

    // Recalculate AC (Preserve Natural/Armor bonuses implicitly by diffing old)
    // Old Base: 10 + OldDex + OldSize
    // New Base: 10 + NewDex + NewSize
    // We assume the "Gear/Natural" bonus is constant, so we just update the base.
    const oldSizeData = SizeConstants[original.size] || { acAttackMod: 0 };
    const oldDexMod = Math.floor(((original.dex || 10) - 10) / 2);
    const oldBaseAC = 10 + oldDexMod + oldSizeData.acAttackMod;
    const oldTotalAC = original.ac_claimed || original.ac;
    const bonusAC = oldTotalAC - oldBaseAC; // This is Armor + Natural + Deflection etc.

    const newBaseAC = 10 + dexMod + sizeData.acAttackMod;
    block.ac = newBaseAC + bonusAC;
    block.ac_claimed = block.ac;
    
    if (block.size !== original.size) {
        changes.push(`Recalculated AC/CMD for size ${block.size}`);
    }

    // 4. Update Header
    block.cr = targetCR as any;
    block.xp = targetXP;

    return { block, changes };
}
