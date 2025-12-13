import React, { useState, useCallback } from 'react';
import './TableToTSVConverter.css';

interface TableToTSVConverterProps {
    defaultInput?: string;
}

type FormatType = 'auto' | 'markdown' | 'html' | 'word';

interface ConversionResult {
    output: string;
    tableCount: number;
    detectedFormat: 'markdown' | 'html' | 'word';
}

/**
 * Parse a Markdown pipe table into rows of cells
 */
function parseMarkdownTable(tableText: string): string[][] {
    const lines = tableText.trim().split('\n').filter(line => line.trim());
    const rows: string[][] = [];
    
    for (const line of lines) {
        // Skip separator lines (e.g., | :--- | :--- |)
        if (/^\|[\s:\-|]+\|$/.test(line.trim())) {
            continue;
        }
        
        // Remove leading/trailing pipes and split
        const trimmed = line.trim().replace(/^\||\|$/g, '');
        const cells = trimmed.split('|').map(cell => cell.trim());
        rows.push(cells);
    }
    
    return rows;
}

/**
 * Extract all Markdown tables from content
 */
function extractMarkdownTables(content: string): { header: string; rows: string[][] }[] {
    const lines = content.split('\n');
    const tables: { header: string; rows: string[][] }[] = [];
    let currentTableLines: string[] = [];
    let currentHeader = '';
    let inTable = false;
    
    for (let i = 0; i < lines.length; i++) {
        const stripped = lines[i].trim();
        
        if (stripped.startsWith('|')) {
            if (!inTable) {
                // Look backwards for header
                for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
                    const prevLine = lines[j].trim();
                    if (prevLine.startsWith('#') || prevLine.startsWith('**')) {
                        currentHeader = prevLine.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
                        break;
                    }
                }
                inTable = true;
            }
            currentTableLines.push(lines[i]);
        } else if (inTable) {
            if (currentTableLines.length > 0) {
                const tableRows = parseMarkdownTable(currentTableLines.join('\n'));
                tables.push({ header: currentHeader, rows: tableRows });
                currentTableLines = [];
                currentHeader = '';
            }
            inTable = false;
        }
    }
    
    // Handle table at end
    if (currentTableLines.length > 0) {
        const tableRows = parseMarkdownTable(currentTableLines.join('\n'));
        tables.push({ header: currentHeader, rows: tableRows });
    }
    
    return tables;
}

/**
 * Clean Microsoft Word HTML before parsing
 * Word adds lots of proprietary markup that interferes with parsing
 */
function cleanWordHTML(content: string): string {
    // Remove XML declarations and doctype
    content = content.replace(/<\?xml[^>]*\?>/g, '');
    content = content.replace(/<!DOCTYPE[^>]*>/gi, '');
    
    // Remove Office namespace tags like <o:p>, </o:p>, <w:*>, etc.
    content = content.replace(/<\/?[ovwx]:[^>]*>/g, '');
    
    // Remove conditional comments <!--[if ...]-->...<!--[endif]-->
    content = content.replace(/<!--\[if[^\]]*\]>[\s\S]*?<!\[endif\]-->/g, '');
    content = content.replace(/<!--\[if[^\]]*\]>/g, '');
    content = content.replace(/<!\[endif\]-->/g, '');
    
    // Remove mso-* styles from style attributes
    content = content.replace(/mso-[^;"]+;?/g, '');
    
    // Remove empty style attributes
    content = content.replace(/\s+style\s*=\s*["']\s*["']/g, '');
    
    // Remove Word-specific class attributes
    content = content.replace(/\s+class\s*=\s*["']Mso[^"']*["']/g, '');
    
    // Remove font tags (Word loves these)
    content = content.replace(/<\/?font[^>]*>/gi, '');
    
    // Remove empty spans
    content = content.replace(/<span[^>]*>\s*<\/span>/g, '');
    
    // Normalize whitespace
    content = content.replace(/[\r\n]+/g, '\n');
    
    return content;
}

/**
 * Detect if content is Word HTML
 */
function isWordHTML(content: string): boolean {
    return content.includes('mso-') || 
           content.includes('<o:p>') || 
           content.includes('class="Mso') ||
           content.includes('urn:schemas-microsoft-com');
}

/**
 * Parse HTML tables from content
 */
function extractHTMLTables(content: string, fromWord: boolean = false): { header: string; rows: string[][] }[] {
    // Auto-detect and clean Word HTML
    if (fromWord || isWordHTML(content)) {
        content = cleanWordHTML(content);
    }
    
    const tables: { header: string; rows: string[][] }[] = [];
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    
    let tableMatch;
    let tableIndex = 0;
    
    while ((tableMatch = tableRegex.exec(content)) !== null) {
        const tableContent = tableMatch[1];
        const rows: string[][] = [];
        
        let rowMatch;
        while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
            const rowContent = rowMatch[1];
            const cells: string[] = [];
            
            let cellMatch;
            while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
                // Strip HTML tags and decode entities
                let cellText = cellMatch[1]
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)))
                    .replace(/\s+/g, ' ')
                    .trim();
                cells.push(cellText);
            }
            
            if (cells.length > 0) {
                rows.push(cells);
            }
        }
        
        if (rows.length > 0) {
            tableIndex++;
            tables.push({ header: `Table ${tableIndex}`, rows });
        }
    }
    
    return tables;
}

/**
 * Detect format from content
 */
function detectFormat(content: string): 'markdown' | 'html' | 'word' {
    const hasHtmlTable = /<table/i.test(content);
    const hasMarkdownTable = /^\s*\|.*\|/m.test(content);
    
    if (hasHtmlTable) {
        // Check if it's Word HTML specifically
        if (isWordHTML(content)) {
            return 'word';
        }
        return 'html';
    }
    if (hasMarkdownTable) return 'markdown';
    return 'markdown';
}

/**
 * Format tables as TSV
 */
function formatAsTSV(tables: { header: string; rows: string[][] }[], includeHeaders: boolean): string {
    const outputLines: string[] = [];
    
    for (const { header, rows } of tables) {
        if (includeHeaders && header) {
            outputLines.push(`# ${header}`);
            outputLines.push('');
        }
        
        for (const row of rows) {
            outputLines.push(row.join('\t'));
        }
        
        outputLines.push('');
    }
    
    return outputLines.join('\n');
}

/**
 * Main conversion function
 */
function convertToTSV(content: string, format: FormatType, includeHeaders: boolean): ConversionResult {
    const detectedFormat = format === 'auto' ? detectFormat(content) : format;
    
    let tables: { header: string; rows: string[][] }[];
    
    if (detectedFormat === 'html') {
        tables = extractHTMLTables(content, false);
    } else if (detectedFormat === 'word') {
        tables = extractHTMLTables(content, true);
    } else {
        tables = extractMarkdownTables(content);
    }
    
    const output = formatAsTSV(tables, includeHeaders);
    
    return {
        output,
        tableCount: tables.length,
        detectedFormat
    };
}

export const TableToTSVConverter: React.FC<TableToTSVConverterProps> = ({ defaultInput = '' }) => {
    const [input, setInput] = useState(defaultInput);
    const [output, setOutput] = useState('');
    const [format, setFormat] = useState<FormatType>('auto');
    const [includeHeaders, setIncludeHeaders] = useState(true);
    const [tableCount, setTableCount] = useState(0);
    const [detectedFormat, setDetectedFormat] = useState<'markdown' | 'html' | 'word' | null>(null);
    const [copied, setCopied] = useState(false);

    const handleConvert = useCallback(() => {
        if (!input.trim()) {
            setOutput('');
            setTableCount(0);
            setDetectedFormat(null);
            return;
        }
        
        const result = convertToTSV(input, format, includeHeaders);
        setOutput(result.output);
        setTableCount(result.tableCount);
        setDetectedFormat(result.detectedFormat);
    }, [input, format, includeHeaders]);

    const handleCopy = useCallback(async () => {
        if (!output) return;
        
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [output]);

    const handleClear = useCallback(() => {
        setInput('');
        setOutput('');
        setTableCount(0);
        setDetectedFormat(null);
    }, []);

    return (
        <div className="table-to-tsv-converter">
            <div className="converter-header">
                <h2>Table to TSV Converter</h2>
                <p className="converter-description">
                    Paste Markdown, HTML, or Word tables to convert them to tab-delimited format for InDesign import.
                </p>
            </div>

            <div className="converter-controls">
                <div className="control-group">
                    <label htmlFor="format-select">Format:</label>
                    <select 
                        id="format-select"
                        value={format} 
                        onChange={(e) => setFormat(e.target.value as FormatType)}
                    >
                        <option value="auto">Auto-detect</option>
                        <option value="markdown">Markdown</option>
                        <option value="html">HTML</option>
                        <option value="word">Word (paste from Word)</option>
                    </select>
                </div>
                
                <div className="control-group">
                    <label>
                        <input 
                            type="checkbox" 
                            checked={includeHeaders}
                            onChange={(e) => setIncludeHeaders(e.target.checked)}
                        />
                        Include section headers
                    </label>
                </div>

                <div className="control-buttons">
                    <button className="btn-convert" onClick={handleConvert}>
                        Convert to TSV
                    </button>
                    <button className="btn-clear" onClick={handleClear}>
                        Clear
                    </button>
                </div>
            </div>

            <div className="converter-panels">
                <div className="panel input-panel">
                    <div className="panel-header">
                        <h3>Input</h3>
                        <span className="format-hint">Paste Markdown, HTML, or Word table</span>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Paste your table here...

Markdown example:
| Stat | Value |
|------|-------|
| AC   | 15    |
| HP   | 45    |

HTML/Word: Just copy a table from Word or a webpage and paste it here.
Word tables are auto-detected and cleaned up.`}
                        spellCheck={false}
                    />
                </div>

                <div className="panel output-panel">
                    <div className="panel-header">
                        <h3>Output (TSV)</h3>
                        <div className="output-info">
                            {detectedFormat && (
                                <span className="detected-format">
                                    Detected: {detectedFormat}
                                </span>
                            )}
                            {tableCount > 0 && (
                                <span className="table-count">
                                    {tableCount} table{tableCount !== 1 ? 's' : ''} found
                                </span>
                            )}
                        </div>
                    </div>
                    <textarea
                        value={output}
                        readOnly
                        placeholder="Converted output will appear here..."
                    />
                    <button 
                        className={`btn-copy ${copied ? 'copied' : ''}`}
                        onClick={handleCopy}
                        disabled={!output}
                    >
                        {copied ? '✓ Copied!' : 'Copy to Clipboard'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TableToTSVConverter;
