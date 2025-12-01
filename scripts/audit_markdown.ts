
import * as fs from 'fs';
import * as path from 'path';
import { parsePF1eStatBlock } from '../src/lib/pf1e-parser';
import { validateBasics } from '../src/engine/validateBasics';
import { validateBenchmarks } from '../src/engine/validateBenchmarks';
import { validateEconomy } from '../src/engine/validateEconomy';

// Use the user's provided test document in `Rules/Test docs`
const filePath = path.join(process.cwd(), 'Rules/Test docs/A0 Cyclopedia Pathfinder 1e (Most Recent) (2).md');
const reportPath = path.join(process.cwd(), 'Audit_Report_A0_Cyclopedia_TEST.md');

function extractStatBlocks(content: string): string[] {
    const blocks: string[] = [];
    const lines = content.split('\n');
    let currentBlock: string[] = [];
    let inBlock = false;

    // Regex to identify the start of a stat block: **Name CR X**
    const startRegex = /^\*\*([^\*]+) CR ([0-9\/]+)\*\*/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check for start of a new block
        if (startRegex.test(line)) {
            if (inBlock && currentBlock.length > 0) {
                blocks.push(currentBlock.join('\n'));
            }
            inBlock = true;
            currentBlock = [line];
            continue;
        }

        // Check for end of block (Markdown headers usually denote new sections)
        // But be careful, some blocks might be inside sections. 
        // We'll assume a header # means end of block if we are in one.
        if (inBlock && line.startsWith('#')) {
            inBlock = false;
            blocks.push(currentBlock.join('\n'));
            currentBlock = [];
            continue;
        }

        if (inBlock) {
            currentBlock.push(line);
        }
    }

    // Push the last block if exists
    if (inBlock && currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'));
    }

    return blocks;
}

function runAudit() {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const rawBlocks = extractStatBlocks(content);

        let reportContent = `# Audit Report: A0 Cyclopedia Pathfinder 1e\n\n`;
        reportContent += `**Date:** ${new Date().toLocaleDateString()}\n`;
        reportContent += `**Source File:** ${filePath}\n`;
        reportContent += `**Total Stat Blocks Found:** ${rawBlocks.length}\n\n`;
        reportContent += `---\n\n`;

        console.log(`Found ${rawBlocks.length} potential stat blocks.\n`);

        rawBlocks.forEach((raw) => {
            // Clean up the raw text slightly to help the parser if needed, 
            // though the parser has its own cleaning.
            // The parser expects the first line to be the name, but our extraction includes the **Name CR X** line.
            // The parser logic:
            // const lines = fullText.split('\n')...
            // name: lines[0] ...
            // CR extraction looks for "CR X".
            // So passing the raw block starting with "**Name CR X**" should work fine.

            const block = parsePF1eStatBlock(raw);
            
            // Run Validations
            const vBasics = validateBasics(block);
            const vBench = validateBenchmarks(block);
            const vEcon = validateEconomy(block);

            const allMessages = [
                ...vBasics.messages,
                ...vBench.messages,
                ...vEcon.messages
            ];

            const hasErrors = allMessages.some(m => m.severity === 'critical');
            const hasWarnings = allMessages.some(m => m.severity === 'warning');

            if (hasErrors || hasWarnings) {
                const header = `### ${block.name} (CR ${block.cr})`;
                console.log(header);
                reportContent += `${header}\n`;
                reportContent += `**Source Line:** \`${raw.split('\n')[0]}\`\n\n`;
                
                if (hasErrors) {
                    console.log(`❌ ERRORS:`);
                    reportContent += `**❌ ERRORS:**\n`;
                    allMessages.filter(m => m.severity === 'critical').forEach(m => {
                        console.log(`  - ${m.message}`);
                        reportContent += `- ${m.message}\n`;
                    });
                    reportContent += `\n`;
                }

                if (hasWarnings) {
                    console.log(`⚠️ WARNINGS:`);
                    reportContent += `**⚠️ WARNINGS:**\n`;
                    allMessages.filter(m => m.severity === 'warning').forEach(m => {
                        console.log(`  - ${m.message}`);
                        reportContent += `- ${m.message}\n`;
                    });
                    reportContent += `\n`;
                }
                console.log(`\n`);
                reportContent += `---\n\n`;
            }
        });

        fs.writeFileSync(reportPath, reportContent);
        console.log(`Report written to ${reportPath}`);

    } catch (err) {
        console.error("Error reading or processing file:", err);
    }
}

runAudit();
