import React, { useMemo, useState, useCallback } from 'react';
import './HtmlNoiseStripper.css';
import { markdownToHtml } from '../lib/universal-formatter-logic';

type SourceType = 'empty' | 'text' | 'html' | 'word';
type OutputMode = 'text' | 'markdown' | 'word';

type StripOptions = {
  preserveBlankLines: boolean;
  compactWhitespace: boolean;
  listBullets: boolean;
};

const SAMPLE_HTML = `<div class="MsoNormal"><b>Goblin</b> CR 1</div>
<div class="MsoNormal">XP 400</div>
<div class="MsoNormal">NE Small humanoid (goblinoid)</div>
<div class="MsoNormal">Init +6; Senses darkvision 60 ft.; Perception +5</div>
<div class="MsoNormal"><b>DEFENSE</b></div>
<div class="MsoNormal">AC 16, touch 13, flat-footed 14 (+2 armor, +2 Dex, +1 size, +1 shield)</div>
<div class="MsoNormal">hp 6 (1d8+2)</div>
<div class="MsoNormal">Fort +3, Ref +4, Will -1</div>
<div class="MsoNormal"><b>OFFENSE</b></div>
<div class="MsoNormal">Speed 30 ft.</div>
<div class="MsoNormal">Melee short sword +2 (1d4/19-20)</div>`;

const isWordHtml = (text: string) => {
  const probe = text.toLowerCase();
  return (
    probe.includes('mso-') ||
    probe.includes('<o:p>') ||
    probe.includes('class="mso') ||
    probe.includes('urn:schemas-microsoft-com')
  );
};

const detectSourceType = (text: string): SourceType => {
  if (!text.trim()) return 'empty';
  if (isWordHtml(text)) return 'word';
  if (/<[^>]+>/.test(text)) return 'html';
  return 'text';
};

const decodeEntities = (text: string): string => {
  if (typeof document === 'undefined') return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const nodeToMarkdown = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? '';
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const className = el.className || '';

  if (tag === 'br') return '\n';
  if (tag === 'hr') return '\n\n';
  if (tag === 'sup') return '';

  const childText = Array.from(el.childNodes).map(nodeToMarkdown).join('');

  if (className.includes('label')) {
    return `**${childText.trim()}**`;
  }

  if (className.includes('spell-level')) {
    return `*${childText.trim()}*`;
  }

  if (className.includes('section-header')) {
    const title = childText.trim().toUpperCase();
    return title ? `\n**${title}**\n` : '';
  }

  if (tag === 'b' || tag === 'strong') {
    return `**${childText.trim()}**`;
  }

  if (tag === 'i' || tag === 'em') {
    return `*${childText.trim()}*`;
  }

  if (tag === 'div' || tag === 'p' || tag === 'li' || tag === 'tr') {
    return `${childText}\n`;
  }

  return childText;
};

const htmlToMarkdown = (input: string): string => {
  if (typeof DOMParser === 'undefined') {
    return stripHtmlNoise(input, {
      preserveBlankLines: true,
      compactWhitespace: true,
      listBullets: true,
    });
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'text/html');
  const body = doc.body;
  const hasStructured = !!doc.querySelector('.stat-line, .section-header, .name, .cr, .xp, .identity');

  if (hasStructured) {
    const output: string[] = [];

    const nameEl = doc.querySelector('.name');
    const crEl = doc.querySelector('.cr');
    if (nameEl) {
      const name = nameEl.textContent?.trim() ?? '';
      const cr = crEl?.textContent?.trim() ?? '';
      output.push(cr ? `${name} ${cr}` : name);
    }

    const xpEl = doc.querySelector('.xp');
    if (xpEl) {
      output.push(xpEl.textContent?.trim() ?? '');
    }

    const identityEl = doc.querySelector('.identity');
    if (identityEl) {
      output.push(identityEl.textContent?.trim() ?? '');
    }

    const ordered = doc.querySelectorAll('.section-header, .stat-line, .flavor-text');
    ordered.forEach((el) => {
      const className = el.className || '';
      if (className.includes('section-header')) {
        const title = el.textContent?.trim().toUpperCase() ?? '';
        if (title) {
          output.push('');
          output.push(`**${title}**`);
        }
        return;
      }
      if (className.includes('flavor-text')) {
        const text = el.textContent?.trim() ?? '';
        if (text) {
          output.push('');
          output.push(`_${text}_`);
        }
        return;
      }
      const lineText = Array.from(el.childNodes).map(nodeToMarkdown).join('');
      const cleaned = lineText.replace(/\s+/g, ' ').trim();
      if (cleaned) output.push(cleaned);
    });

    const structuredText = output
      .map((line) => line.replace(/\s+/g, ' ').trimEnd())
      .join('\n')
      .trim();

    if (structuredText) return structuredText;
  }

  const raw = Array.from(body.childNodes).map(nodeToMarkdown).join('');
  const lines = raw.split('\n').map((line) => line.replace(/\s+/g, ' ').trim());
  const collapsed: string[] = [];
  let previousBlank = false;
  for (const line of lines) {
    const isBlank = line.length === 0;
    if (isBlank && previousBlank) continue;
    collapsed.push(line);
    previousBlank = isBlank;
  }
  return collapsed.join('\n').trim();
};

const stripHtmlNoise = (input: string, options: StripOptions): string => {
  if (!input.trim()) return '';

  let content = input.replace(/\r\n?/g, '\n');

  content = content.replace(/<\?xml[^>]*\?>/gi, '');
  content = content.replace(/<!DOCTYPE[^>]*>/gi, '');
  content = content.replace(/<!--\[if[^\]]*\]>[\s\S]*?<!\[endif\]-->/gi, '');
  content = content.replace(/<!--[\s\S]*?-->/g, '');
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  content = content.replace(/<\/?[ovwx]:[^>]*>/gi, '');
  content = content.replace(/mso-[^;"]+;?/gi, '');
  content = content.replace(/\s+class\s*=\s*["']Mso[^"']*["']/gi, '');
  content = content.replace(/\s+style\s*=\s*["']\s*["']/gi, '');

  content = content.replace(/<\s*br\s*\/?\s*>/gi, '\n');
  content = content.replace(/<\s*hr\s*\/?\s*>/gi, '\n');
  content = content.replace(/<\s*li[^>]*>/gi, options.listBullets ? '- ' : '');
  content = content.replace(/<\/\s*(p|div|tr|li|h[1-6]|table|thead|tbody|tfoot|section|article)\s*>/gi, '\n');

  if (/<[^>]+>/.test(content) || /&[a-zA-Z]+;|&#\d+;/.test(content)) {
    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      content = doc.body?.textContent ?? content;
    } else {
      content = content.replace(/<[^>]+>/g, ' ');
    }
  }

  content = decodeEntities(content);
  content = content.replace(/\u00A0/g, ' ');
  content = content.replace(/[\u200B-\u200D\uFEFF]/g, '');

  let lines = content.split('\n');
  lines = lines.map((line) => {
    const trimmed = options.compactWhitespace
      ? line.replace(/[\t ]+/g, ' ').trim()
      : line.replace(/\s+$/g, '');
    return trimmed;
  });

  if (options.preserveBlankLines) {
    const collapsed: string[] = [];
    let previousBlank = false;
    for (const line of lines) {
      const isBlank = line.length === 0;
      if (isBlank && previousBlank) continue;
      collapsed.push(line);
      previousBlank = isBlank;
    }
    lines = collapsed;
  } else {
    lines = lines.filter((line) => line.length > 0);
  }

  return lines.join('\n').trim();
};

export function HtmlNoiseStripper() {
  const [input, setInput] = useState('');
  const [preserveBlankLines, setPreserveBlankLines] = useState(true);
  const [compactWhitespace, setCompactWhitespace] = useState(true);
  const [listBullets, setListBullets] = useState(true);
  const [outputMode, setOutputMode] = useState<OutputMode>('markdown');
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const options: StripOptions = {
    preserveBlankLines,
    compactWhitespace,
    listBullets,
  };

  const detectedSource = useMemo(() => detectSourceType(input), [input]);
  const cleanedText = useMemo(() => stripHtmlNoise(input, options), [input, options]);
  const markdownOutput = useMemo(() => {
    if (!input.trim()) return '';
    if (detectedSource === 'html' || detectedSource === 'word') {
      return htmlToMarkdown(input);
    }
    return cleanedText;
  }, [input, cleanedText, detectedSource]);

  const wordHtml = useMemo(() => markdownToHtml(markdownOutput), [markdownOutput]);
  const previewText =
    outputMode === 'word' ? wordHtml : outputMode === 'text' ? cleanedText : markdownOutput;

  const stats = useMemo(() => {
    const inputLines = input.trim() ? input.trim().split(/\r?\n/).length : 0;
    const outputLines = previewText.trim() ? previewText.trim().split(/\n/).length : 0;
    return { inputLines, outputLines };
  }, [input, previewText]);

  const handleCopyMarkdown = useCallback(async () => {
    if (!markdownOutput) return;
    try {
      await navigator.clipboard.writeText(markdownOutput);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }, [markdownOutput]);

  const handleCopyHtml = useCallback(async () => {
    if (!markdownOutput) return;
    try {
      const html = wordHtml;
      const blob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([markdownOutput], { type: 'text/plain' });
      const item = new ClipboardItem({
        'text/html': blob,
        'text/plain': textBlob,
      });
      await navigator.clipboard.write([item]);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch (err) {
      console.error('Failed to copy HTML', err);
    }
  }, [markdownOutput, wordHtml]);

  return (
    <div className="html-stripper">
      <header className="module-header">
        <h1>HTML Stripper</h1>
        <p>Strip HTML and Word noise from stat blocks. This tool does not validate stats.</p>
      </header>

      <section className="stripper-controls card">
        <div className="control-group">
          <label htmlFor="output-mode">Output preview</label>
          <select
            id="output-mode"
            value={outputMode}
            onChange={(e) => setOutputMode(e.target.value as OutputMode)}
          >
            <option value="markdown">Markdown</option>
            <option value="text">Plain Text</option>
            <option value="word">Word (HTML)</option>
          </select>
        </div>
        <div className="control-group">
          <label htmlFor="preserve-blank">
            <input
              id="preserve-blank"
              type="checkbox"
              checked={preserveBlankLines}
              onChange={(e) => setPreserveBlankLines(e.target.checked)}
            />
            Preserve blank lines
          </label>
        </div>
        <div className="control-group">
          <label htmlFor="compact-whitespace">
            <input
              id="compact-whitespace"
              type="checkbox"
              checked={compactWhitespace}
              onChange={(e) => setCompactWhitespace(e.target.checked)}
            />
            Compact whitespace
          </label>
        </div>
        <div className="control-group">
          <label htmlFor="list-bullets">
            <input
              id="list-bullets"
              type="checkbox"
              checked={listBullets}
              onChange={(e) => setListBullets(e.target.checked)}
            />
            Keep list bullets
          </label>
        </div>
        <div className="stripper-actions">
          <button className="btn btn--ghost" onClick={() => setInput(SAMPLE_HTML)}>
            Load Example
          </button>
          <button className="btn btn--secondary" onClick={() => setInput('')}>
            Clear
          </button>
        </div>
      </section>

      <div className="panel-layout">
        <section className="panel">
          <div className="panel-header">
            <span className="panel-title">Raw Input</span>
            <div className="stripper-badges">
              {detectedSource !== 'empty' && (
                <span
                  className={`badge ${
                    detectedSource === 'word'
                      ? 'badge--warn'
                      : detectedSource === 'html'
                        ? 'badge--info'
                        : 'badge--pass'
                  }`}
                >
                  {detectedSource === 'word'
                    ? 'Word HTML'
                    : detectedSource === 'html'
                      ? 'HTML'
                      : 'Plain Text'}
                </span>
              )}
              {stats.inputLines > 0 && (
                <span className="badge badge--info">{stats.inputLines} lines</span>
              )}
            </div>
          </div>
          <textarea
            className="stripper-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a stat block from HTML, Word, or a web page..."
          />
        </section>

        <section className="panel">
          <div className="panel-header">
            <span className="panel-title">Cleaned Output</span>
            <div className="stripper-badges">
              {stats.outputLines > 0 && (
                <span className="badge badge--info">{stats.outputLines} lines</span>
              )}
            </div>
          </div>
          <textarea
            className="stripper-textarea"
            value={previewText}
            readOnly
            placeholder="Cleaned text will appear here."
          />
          <div className="stripper-output-actions">
            <button
              className={`btn btn--primary ${copiedHtml ? 'is-copied' : ''}`}
              onClick={handleCopyHtml}
              disabled={!markdownOutput}
              title="Copy rich text for Word or Google Docs"
            >
              {copiedHtml ? 'Copied' : 'Copy for Word/Docs'}
            </button>
            <button
              className={`btn btn--secondary ${copiedMarkdown ? 'is-copied' : ''}`}
              onClick={handleCopyMarkdown}
              disabled={!markdownOutput}
              title="Copy Markdown text"
            >
              {copiedMarkdown ? 'Copied' : 'Copy Markdown'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
