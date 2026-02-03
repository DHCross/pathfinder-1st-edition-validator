import React, { useMemo, useState, useCallback } from 'react';
import './HtmlNoiseStripper.css';

type SourceType = 'empty' | 'text' | 'html' | 'word';

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
  const [copied, setCopied] = useState(false);

  const options: StripOptions = {
    preserveBlankLines,
    compactWhitespace,
    listBullets,
  };

  const detectedSource = useMemo(() => detectSourceType(input), [input]);
  const cleaned = useMemo(() => stripHtmlNoise(input, options), [input, options]);

  const stats = useMemo(() => {
    const inputLines = input.trim() ? input.trim().split(/\r?\n/).length : 0;
    const outputLines = cleaned.trim() ? cleaned.trim().split(/\n/).length : 0;
    return { inputLines, outputLines };
  }, [input, cleaned]);

  const handleCopy = useCallback(async () => {
    if (!cleaned) return;
    try {
      await navigator.clipboard.writeText(cleaned);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }, [cleaned]);

  return (
    <div className="html-stripper">
      <header className="module-header">
        <h1>HTML Stripper</h1>
        <p>Strip HTML and Word noise from stat blocks. This tool does not validate stats.</p>
      </header>

      <section className="stripper-controls card">
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
            value={cleaned}
            readOnly
            placeholder="Cleaned text will appear here."
          />
          <div className="stripper-output-actions">
            <button
              className={`btn btn--primary ${copied ? 'is-copied' : ''}`}
              onClick={handleCopy}
              disabled={!cleaned}
            >
              {copied ? 'Copied' : 'Copy Cleaned Text'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
