
import * as fs from 'fs';
import * as path from 'path';
import { parsePF1eStatBlock } from '../src/lib/pf1e-parser';
import { validateBasics } from '../src/engine/validateBasics';
import { validateBenchmarks } from '../src/engine/validateBenchmarks';
import { validateEconomy } from '../src/engine/validateEconomy';
import { validateSynergy } from '../src/engine/validateSynergy';

// CLI Usage: npx ts-node scripts/audit_markdown.ts [input.md] [output_report.md]
// Defaults to Cyclopedia if no arguments provided
const args = process.argv.slice(2);
const filePath = args[0] 
  ? path.resolve(process.cwd(), args[0])
  : path.join(process.cwd(), 'Rules/A0 Cyclopedia Pathfinder 1e (Most Recent) (2).md');
const reportPath = args[1]
  ? path.resolve(process.cwd(), args[1])
  : path.join(process.cwd(), 'Audit_Report_A0_Cyclopedia_TEST.md');

interface ExtractedBlock {
  text: string;
  line: number;  // 1-based line number in source file
}

function extractStatBlocks(content: string): ExtractedBlock[] {
    const blocks: ExtractedBlock[] = [];
    const lines = content.split('\n');
    let currentBlock: string[] = [];
    let startLine = 0;
    let inBlock = false;

    // Robust Regex: Optional bold/italics, case insensitive CR
    // Matches: **Name CR 1**, *Name CR 1/2*, Name CR 3, _Name_ CR 1, etc.
    const startRegex = /^[*_]*([^\*_]+?)[*_]*\s+CR\s+([0-9\/]+)/i;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (startRegex.test(line)) {
            // If we were already in a block, push it before starting a new one
            if (inBlock && currentBlock.length > 0) {
                blocks.push({ text: currentBlock.join('\n'), line: startLine });
            }
            inBlock = true;
            startLine = i + 1; // 1-based index for human readability
            currentBlock = [line];
            continue;
        }

        // Detect end of block:
        // 1. A Markdown header '#'
        // 2. Or encountering a new stat block (handled above)
        if (inBlock) {
            if (line.startsWith('#')) {
                inBlock = false;
                blocks.push({ text: currentBlock.join('\n'), line: startLine });
                currentBlock = [];
            } else {
                currentBlock.push(line);
            }
        }
    }

    // Catch trailing block at end of file
    if (inBlock && currentBlock.length > 0) {
        blocks.push({ text: currentBlock.join('\n'), line: startLine });
    }

    return blocks;
}

function runAudit() {
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`Error: File not found: ${filePath}`);
            console.error('Usage: npx ts-node scripts/audit_markdown.ts [input.md] [output_report.md]');
            process.exit(1);
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const rawBlocks = extractStatBlocks(content);

        let reportContent = `# Audit Report: Pathfinder 1e Stat Block Validation\n\n`;
        reportContent += `**Date:** ${new Date().toLocaleDateString()}\n`;
        reportContent += `**Source File:** \`${filePath}\`\n`;
        reportContent += `**Total Stat Blocks Found:** ${rawBlocks.length}\n\n`;
        reportContent += `---\n\n`;

        console.log(`\n📋 Auditing: ${filePath}`);
        console.log(`   Found ${rawBlocks.length} potential stat blocks.\n`);

        let errorCount = 0;
        let warnCount = 0;
        let passCount = 0;

        rawBlocks.forEach((extracted) => {
            const block = parsePF1eStatBlock(extracted.text);

            // Run all Validations
            const vBasics = validateBasics(block);
            const vBench = validateBenchmarks(block);
            const vEcon = validateEconomy(block);
            const vSynergy = validateSynergy(block);

            const allMessages = [
                ...vBasics.messages,
                ...vBench.messages,
                ...vEcon.messages,
                ...vSynergy.messages,
            ];

            const hasErrors = allMessages.some(m => m.severity === 'critical');
            const hasWarnings = allMessages.some(m => m.severity === 'warning');

            if (hasErrors) errorCount++;
            else if (hasWarnings) warnCount++;
            else passCount++;

            if (hasErrors || hasWarnings) {
                const statusIcon = hasErrors ? '❌' : '⚠️';
                const header = `### ${statusIcon} ${block.name} (CR ${block.cr}) — Line ${extracted.line}`;
                console.log(header);
                reportContent += `${header}\n`;
                reportContent += `**Source Line:** ${extracted.line}\n\n`;

                if (hasErrors) {
                    console.log(`  ❌ ERRORS:`);
                    reportContent += `**❌ ERRORS:**\n`;
                    allMessages.filter(m => m.severity === 'critical').forEach(m => {
                        console.log(`    - [${m.category}] ${m.message}`);
                        reportContent += `- \`[${m.category}]\` ${m.message}\n`;
                    });
                    reportContent += `\n`;
                }

                if (hasWarnings) {
                    console.log(`  ⚠️ WARNINGS:`);
                    reportContent += `**⚠️ WARNINGS:**\n`;
                    allMessages.filter(m => m.severity === 'warning').forEach(m => {
                        console.log(`    - [${m.category}] ${m.message}`);
                        reportContent += `- \`[${m.category}]\` ${m.message}\n`;
                    });
                    reportContent += `\n`;
                }

                console.log('');
                reportContent += `---\n\n`;
            }
        });

        // Summary
        const summary = `\n## Summary\n\n| Status | Count |\n|--------|-------|\n| ✅ PASS | ${passCount} |\n| ⚠️ WARN | ${warnCount} |\n| ❌ FAIL | ${errorCount} |\n| **Total** | ${rawBlocks.length} |\n`;
        reportContent = reportContent.replace('---\n\n', summary + '\n---\n\n');

        fs.writeFileSync(reportPath, reportContent);
        console.log(`\n✅ Report written to: ${reportPath}`);
        console.log(`   PASS: ${passCount} | WARN: ${warnCount} | FAIL: ${errorCount}`);

    } catch (err) {
        console.error("Error reading or processing file:", err);
        process.exit(1);
    }
}

runAudit();
