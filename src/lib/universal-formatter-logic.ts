// src/lib/universal-formatter-logic.ts

type Mode = 'npc' | 'monster' | 'affliction';

/**
 * Clean text of markdown artifacts for processing, but keep the values.
 */
export function cleanLine(line: string): string {
    return line.replace(/\*\*/g, '').replace(/__/g, '').trim();
}

/**
 * Pre-process text to handle "Blobs" where newlines are missing.
 * Inserts newlines before key headers if they are stuck together.
 */
export function expandBlob(text: string): string {
  // If we detect very few newlines relative to length, it might be a blob.
  if (text.length > 100 && text.split('\n').length < 3) {
      let expanded = text;
      // List of keywords that usually start a new line in a stat block
      const keywords = [
          'DEFENSE', 'OFFENSE', 'STATISTICS', 'TACTICS', 'SPECIAL ABILITIES', 'ECOLOGY',
          'AC', 'hp', 'Fort', 'Ref', 'Will', 'Speed', 'Melee', 'Ranged', 'Space', 'Str', 'Base Atk', 'Feats', 'Skills', 'Languages', 'SQ',
          'Environment', 'Organization', 'Treasure', 'XP'
      ];

      // Regex to find these keywords when they are preceded by a space (or start of string)
      // and NOT already at the start of a line.
      // We look for " **Keyword**" or " Keyword " patterns common in the messy input.

      // 1. Handle explicit markdown headers stuck in text e.g. "**DEFENSE**"
      expanded = expanded.replace(/(\s)(\*\*[A-Z]+\*\*)/g, '\n$2');

      // 2. Handle common bolded headers e.g. "**Init**"
      expanded = expanded.replace(/(\s)(\*\*[A-Za-z]+\*\*)/g, '\n$2');

      // 3. Handle explicit section headers if not bolded but capitalized
      keywords.forEach(kw => {
         // Look for Keyword followed by space or colon, preceded by space/punctuation
         // Avoid partial matches (e.g. "Base Atk" matches inside "Base Atk")
         const regex = new RegExp(`(\\s)(${kw}[:\\s])`, 'g');
         expanded = expanded.replace(regex, '\n$2');
      });

      return expanded;
  }
  return text;
}

export function formatAffliction(lines: string[]): string {
    // Affliction logic: Simple Key-Value extraction
    // Expected format: Name on line 1, then "Type: ...", "Save: ...", etc.
    let name = cleanLine(lines[0]);
    let fields: Record<string, string> = {};

    lines.slice(1).forEach(line => {
        const clean = cleanLine(line);
        const parts = clean.split(':');
        if (parts.length > 1) {
            const key = parts[0].trim().toLowerCase();
            const val = parts.slice(1).join(':').trim();
            fields[key] = val;
        }
    });

    // Construct output
    const type = fields['type'] || 'disease';
    const save = fields['save'] || fields['fortitude'] || fields['fort'] || 'Fortitude DC XX';
    const onset = fields['onset'] || '1 day';
    const frequency = fields['frequency'] || '1/day';
    const effect = fields['effect'] || '1d2 Con damage';
    const cure = fields['cure'] || '2 consecutive saves';

    const res = `### **${name.toUpperCase()}**
**Type** ${type}; **Save** ${save}
**Onset** ${onset}; **Frequency** ${frequency}
**Effect** ${effect}; **Cure** ${cure}`;

    return res;
}

export function formatStatBlock(lines: string[], currentMode: Mode): string {
    // Helper to find a line starting with one of the keywords
    const findLine = (keywords: string[]) => {
        const found = lines.find(l => {
            const clean = cleanLine(l).toLowerCase();
            return keywords.some(k => clean.startsWith(k.toLowerCase()));
        });
        return found ? cleanLine(found) : "";
    };

    // Header Extraction
    // Line 1 is usually Name CR XP
    // We need to support "Name CR X" or "Name (CR X)" or just "Name"
    let nameLine = cleanLine(lines[0]);
    // Remove CR from name line if present
    let name = nameLine;
    let cr = "1";

    const crMatch = nameLine.match(/(?:CR|Challenge Rating)\s*(\d+(?:[\/\.]\d+)?)/i);
    if (crMatch) {
        cr = crMatch[1];
        name = nameLine.substring(0, crMatch.index).trim();
    } else {
        // Check line 2 for CR
        const crLine = findLine(['CR', 'Challenge Rating']);
        if (crLine && crLine !== nameLine) {
             const m = crLine.match(/CR\s*(\d+(?:[\/\.]\d+)?)/i);
             if (m) cr = m[1];
        }
    }

    const xpLine = findLine(['XP']);
    let xp = "400";
    if (xpLine) {
        const m = xpLine.match(/XP\s*([0-9,]+)/i);
        if (m) xp = m[1];
    }

    // Basic Stats
    const initLine = findLine(['Init']);
    const initText = initLine ? initLine.replace(/Init\s*/i, '') : "+0"; // "Init +3; Senses..."

    // Senses often on same line as Init
    let sensesText = "Perception +0";
    if (initLine && /Senses/i.test(initLine)) {
         const parts = initLine.split(/Senses/i);
         if (parts[1]) sensesText = parts[1].trim();
    } else {
        const sensesLine = findLine(['Senses']);
        if (sensesLine) sensesText = sensesLine.replace(/Senses\s*/i, '');
    }

    // Defense
    const acLine = findLine(['AC']);
    const acText = acLine ? acLine.replace(/^AC\s*/i, '') : "10, touch 10, flat-footed 10";

    const hpLine = findLine(['hp', 'HP']);
    const hpText = hpLine ? hpLine.replace(/^(hp|HP)\s*/, '') : "10 (1d8+2)";

    const fortLine = findLine(['Fort']);
    let savesText = "Fort +0, Ref +0, Will +0";
    if (fortLine) {
        // Try to capture the whole saves line which might be "Fort +1, Ref +2, Will +3"
        // Or split across lines. For now, assume single line standard format.
        savesText = fortLine;
    } else {
        // Fallback check individual
        const f = findLine(['Fort']);
        const r = findLine(['Ref']);
        const w = findLine(['Will']);
        if (f || r || w) {
            savesText = [f, r, w].filter(Boolean).join(', ');
        }
    }

    // Offense
    const speedLine = findLine(['Speed']);
    const speedText = speedLine ? speedLine.replace(/^Speed\s*/i, '') : "30 ft.";

    // Categorize lines into sections to capture free-form text (Attacks, Special Abilities)
    // We exclude lines we've already "consumed" via specific searches if possible,
    // but simpler is to detect section headers.

    let sections: Record<string, string[]> = {
        defense: [],
        offense: [],
        tactics: [],
        stats: [],
        ecology: [],
        special: []
    };

    let currentSectionKey = 'stats'; // Default bucket

    // Heuristic: iterate lines, switch bucket on header
    lines.forEach(rawLine => {
        const line = cleanLine(rawLine);
        const lower = line.toLowerCase();

        if (lower.startsWith('defense') && line.length < 10) { currentSectionKey = 'defense'; return; }
        if (lower.startsWith('offense') && line.length < 10) { currentSectionKey = 'offense'; return; }
        if (lower.startsWith('tactics') && line.length < 10) { currentSectionKey = 'tactics'; return; }
        if (lower.startsWith('statistics') && line.length < 15) { currentSectionKey = 'stats'; return; }
        if (lower.startsWith('ecology') && line.length < 10) { currentSectionKey = 'ecology'; return; }
        if (lower.startsWith('special abilities')) { currentSectionKey = 'special'; return; }

        sections[currentSectionKey].push(line);
    });

    // Extract specific fields from sections if not found globally
    // (The global findLine above works okay, but let's refine Offense/Special stuff)

    // Filter out known lines from the generic buckets to avoid duplication
    const filterKnown = (linesArr: string[], prefixes: string[]) => {
        return linesArr.filter(l => !prefixes.some(p => l.toLowerCase().startsWith(p.toLowerCase())));
    };

    const offenseRest = filterKnown(sections.offense, ['Speed', 'Melee', 'Ranged', 'Space', 'Reach', 'Special Attacks', 'Spells']);
    const meleeLine = sections.offense.find(l => l.toLowerCase().startsWith('melee')) || findLine(['Melee']);
    const rangedLine = sections.offense.find(l => l.toLowerCase().startsWith('ranged')) || findLine(['Ranged']);
    const spaceLine = sections.offense.find(l => l.toLowerCase().startsWith('space')) || findLine(['Space']);
    const specialAttacksLine = sections.offense.find(l => l.toLowerCase().startsWith('special attacks')) || findLine(['Special Attacks']);

    // Statistics
    const statBlockLine = sections.stats.find(l => l.toLowerCase().startsWith('str')) || findLine(['Str']);
    const statsText = statBlockLine || "Str 10, Dex 10, Con 10, Int 10, Wis 10, Cha 10";

    const babLine = sections.stats.find(l => l.toLowerCase().startsWith('base atk')) || findLine(['Base Atk']);
    const babText = babLine || "Base Atk +0; CMB +0; CMD 10";

    const featsLine = sections.stats.find(l => l.toLowerCase().startsWith('feats')) || findLine(['Feats']);
    const featsText = featsLine ? featsLine.replace(/^Feats\s*/i, '') : "";

    const skillsLine = sections.stats.find(l => l.toLowerCase().startsWith('skills')) || findLine(['Skills']);
    const skillsText = skillsLine ? skillsLine.replace(/^Skills\s*/i, '') : "";

    const languagesLine = sections.stats.find(l => l.toLowerCase().startsWith('languages')) || findLine(['Languages']);
    const languagesText = languagesLine ? languagesLine.replace(/^Languages\s*/i, '') : "";

    const sqLine = sections.stats.find(l => l.toLowerCase().startsWith('sq')) || findLine(['SQ']);
    const sqText = sqLine ? sqLine.replace(/^SQ\s*/i, '') : "";

    const gearLine = sections.stats.find(l => l.match(/^(Combat Gear|Other Gear|Gear|Possessions)/i));
    const gearText = gearLine || "";

    // Type/Race line is usually line 2 or 3 (after Name/CR/XP)
    // If line 2 is XP, try line 3.
    let typeLine = lines[1];
    if (typeLine && typeLine.toLowerCase().startsWith('xp')) {
        typeLine = lines[2];
    }
    if (!typeLine) typeLine = "N Medium creature";

    // --- BUILD OUTPUT ---

    let out = `**${name.toUpperCase()}**   **CR ${cr}**\n`;
    out += `**XP ${xp}**\n`;
    out += `${typeLine}\n`; // "Male Human..." or "LE Medium..."

    // Init is mandatory visual anchor
    // Parse out just the value from "Init +3; ..."
    let initVal = "+0";
    const initM = initText.match(/([+-]?\d+)/);
    if (initM) initVal = initM[1];

    // Reconstruct Init line
    // "Init +X; Senses [senses]; Perception +X"
    // If Perception is in Senses string, keep it there.
    out += `**Init** ${initVal}; **Senses** ${sensesText}\n\n`;

    out += `**DEFENSE**\n`;
    out += `**AC** ${acText}\n`;
    out += `**hp** ${hpText}\n`;
    out += `**${savesText}**\n`;
    // DR/Immune etc?
    const drLine = sections.defense.find(l => l.toLowerCase().startsWith('dr'));
    if (drLine) out += `**${drLine}**; `;
    const immuneLine = sections.defense.find(l => l.toLowerCase().startsWith('immune'));
    if (immuneLine) out += `**${immuneLine}**`;
    if (drLine || immuneLine) out += `\n`;

    out += `\n**OFFENSE**\n`;
    out += `**Speed** ${speedText}\n`;
    if (meleeLine) out += `**Melee** ${meleeLine.replace(/^Melee\s*/i, '')}\n`;
    if (rangedLine) out += `**Ranged** ${rangedLine.replace(/^Ranged\s*/i, '')}\n`;
    if (spaceLine) out += `**${spaceLine}**\n`;
    if (specialAttacksLine) out += `**Special Attacks** ${specialAttacksLine.replace(/^Special Attacks\s*/i, '')}\n`;

    // Spells would be here. Complex to parse perfectly without proper sectioning.
    // We look for lines starting with "Spells Prepared" or "Spells Known" or "Spell-Like Abilities"
    const spellLines = sections.offense.filter(l => l.match(/^(Spells|Spell-Like)/i));
    spellLines.forEach(sl => out += `**${sl}**\n`);

    if (currentMode === 'npc') {
        // TACTICS
        if (sections.tactics.length > 0) {
            out += `\n**TACTICS**\n`;
            sections.tactics.forEach(t => {
                const parts = t.split(/^(Before Combat|During Combat|Morale|Base Statistics)\s*/i);
                if (parts.length > 1) {
                    // parts[1] is the header, parts[2] is text
                    out += `**${parts[1]}** ${parts[2]}\n`;
                } else {
                    out += `${t}\n`;
                }
            });
        }
    }

    out += `\n**STATISTICS**\n`;
    // Ensure Stat line is bolded keys: Str X, Dex X...
    // The parser finds "Str 10..."
    // We want format "**Str** 10, **Dex** 10..."
    const boldStats = statsText.replace(/(Str|Dex|Con|Int|Wis|Cha)\s*/g, '**$1** ');
    out += `${boldStats}\n`;

    out += `**${babText}**\n`;
    if (featsText) out += `**Feats** ${featsText}\n`;
    if (skillsText) out += `**Skills** ${skillsText}\n`;
    if (languagesText) out += `**Languages** ${languagesText}\n`;
    if (sqText) out += `**SQ** ${sqText}\n`;

    if (currentMode === 'npc' && gearText) {
        out += `**Possessions** ${gearText.replace(/^(Possessions|Gear|Combat Gear)\s*/i, '')}\n`;
    }

    if (currentMode === 'monster') {
        // SPECIAL ABILITIES
        if (sections.special.length > 0) {
            out += `\n**SPECIAL ABILITIES**\n`;
            sections.special.forEach(l => {
                // Bold the name "Name (Ex):"
                const m = l.match(/^([A-Za-z\s]+)\s*\((?:Ex|Su|Sp)\):/);
                if (m) {
                    out += `**${m[0]}** ${l.substring(m[0].length).trim()}\n`;
                } else {
                    out += `${l}\n`;
                }
            });
        }

        // ECOLOGY
        out += `\n**ECOLOGY**\n`;
        const env = sections.ecology.find(l => l.toLowerCase().startsWith('environment')) || "Environment Any";
        const org = sections.ecology.find(l => l.toLowerCase().startsWith('organization')) || "Organization Solitary";
        const treas = sections.ecology.find(l => l.toLowerCase().startsWith('treasure')) || "Treasure Standard";

        out += `**Environment** ${env.replace(/^Environment\s*/i, '')}\n`;
        out += `**Organization** ${org.replace(/^Organization\s*/i, '')}\n`;
        out += `**Treasure** ${treas.replace(/^Treasure\s*/i, '')}\n`;
    }

    return out;
}

/**
 * Convert the specific Markdown subset used by the formatter to HTML
 * suitable for pasting into Word/LibreOffice.
 */
export function markdownToHtml(markdown: string): string {
    if (!markdown) return '';

    // Escape HTML special characters first to avoid XSS or rendering issues with input text
    let html = markdown
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // Convert Headers (e.g. ### **NAME**)
    // We treat lines starting with ### as <h3>
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');

    // Convert Bold **text** -> <b>text</b>
    // We use <b> because it's safer for clipboard paste than <strong> in some contexts,
    // though modern Word handles both.
    html = html.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

    // Convert Italic *text* -> <i>text</i>
    // (Ensure we don't match across newlines generally, or match strict pairs)
    html = html.replace(/\*([^\*\n]+)\*/g, '<i>$1</i>');

    // Handle newlines.
    // Single newline in our format usually means a line break.
    // Double newline means a paragraph break.

    // Split by double newlines to make paragraphs
    const paragraphs = html.split(/\n\s*\n/);

    const formattedParagraphs = paragraphs.map(p => {
        // Within a paragraph, single newlines are line breaks <br>
        const content = p.split('\n').join('<br>');
        // If the paragraph was a header (starts with <h3>), don't wrap in <p>
        if (content.startsWith('<h3>')) return content;
        return `<p style="margin-bottom: 0px; font-family: 'Times New Roman', serif; font-size: 11pt;">${content}</p>`;
    });

    return formattedParagraphs.join('\n');
}
