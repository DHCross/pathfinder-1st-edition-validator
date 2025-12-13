# Pathfinder 1st Edition Validator Tools

Command-line utilities for converting Pathfinder statblock tables to tab-delimited format.

## Tools

### pathfinder_statblock_to_tsv.py

Converts Markdown pipe tables **and** HTML tables to tab-delimited format. Auto-detects input format.

```bash
# Convert Markdown file
python3 tools/pathfinder_statblock_to_tsv.py input.md -o output.txt

# Convert HTML file
python3 tools/pathfinder_statblock_to_tsv.py statblock.html -o output.txt

# Print to stdout
python3 tools/pathfinder_statblock_to_tsv.py input.md

# Copy to clipboard (requires pyperclip)
python3 tools/pathfinder_statblock_to_tsv.py input.md --clipboard

# Force format detection
python3 tools/pathfinder_statblock_to_tsv.py input.txt --format markdown

# Exclude section headers
python3 tools/pathfinder_statblock_to_tsv.py input.md --no-headers -o output.txt
```

### pathfinder_statblock_to_tsv_inline.py

Replaces Markdown pipe tables **in-place** within the document, converting them to tab-delimited format while preserving all other content.

```bash
# Create new file with converted tables
python3 tools/pathfinder_statblock_to_tsv_inline.py input.md -o output.md

# Auto-generate output filename (creates input_inline.md)
python3 tools/pathfinder_statblock_to_tsv_inline.py input.md

# Modify file in place (overwrites original)
python3 tools/pathfinder_statblock_to_tsv_inline.py input.md --in-place
```

### html_table_to_tsv.py

Dedicated HTML table converter with support for:
- **Microsoft Word tables** (auto-detects and cleans Word's messy HTML)
- Web HTML tables
- Colspan handling
- stdin support for piping

```bash
# Convert HTML file (auto-detects Word HTML)
python3 tools/html_table_to_tsv.py input.html -o output.txt

# Read from stdin (useful for piping)
echo "<table><tr><td>AC</td><td>15</td></tr></table>" | python3 tools/html_table_to_tsv.py --stdin

# Copy to clipboard
python3 tools/html_table_to_tsv.py input.html --clipboard
```

## Microsoft Word Support

When you copy a table from Microsoft Word, it copies as HTML to the clipboard. Word's HTML is notoriously messy with:
- `<o:p>` Office namespace tags
- `mso-*` CSS styles
- Conditional comments `<!--[if ...]-->`
- Extra spans and font tags

**All tools auto-detect Word HTML** and clean it up before parsing. You can:

1. **Copy a table from Word** → Paste into a `.html` file → Run the tool
2. **Use the Storybook component** → Paste directly into the UI

The tools detect Word HTML by looking for telltale signs like `mso-`, `<o:p>`, or `class="Mso*"`.

## Storybook Component

A React UI is available at **Tools/TableToTSVConverter** in Storybook:

```bash
npm run storybook
```

Features:
- Paste Markdown, HTML, or Word tables directly
- Auto-detects format (including Word HTML)
- Copy output to clipboard with one click
- Preview before copying

## Use Cases

### InDesign Import
All tools output true tab characters (`\t`) between columns and newlines between rows, which is ideal for InDesign's "Convert Text to Table" feature (Tab / Paragraph delimiters).

### Pathfinder Statblock Example

**Input (Markdown):**
```markdown
| Stat | Value |
|------|-------|
| AC   | 15    |
| HP   | 45    |
| Fort | +6    |
```

**Output (TSV):**
```
Stat	Value
AC	15
HP	45
Fort	+6
```

**Input (HTML or Word):**
```html
<table>
  <tr><th>Stat</th><th>Value</th></tr>
  <tr><td>AC</td><td>15</td></tr>
  <tr><td>HP</td><td>45</td></tr>
</table>
```

**Output (TSV):**
```
Stat	Value
AC	15
HP	45
```

## Dependencies

- Python 3.6+
- Optional: `pyperclip` for clipboard support (`pip install pyperclip`)
- For .docx support: `pip install python-docx`

### word_doc_to_tsv.py ⭐ Holy Grail

**Extracts ALL tables from a Word document** (.docx) and converts them to tab-delimited or Markdown format.

```bash
# Extract all tables to single TSV file
python3 tools/word_doc_to_tsv.py document.docx -o tables.txt

# Extract to Markdown format
python3 tools/word_doc_to_tsv.py document.docx -o tables.md --format markdown

# One file per table
python3 tools/word_doc_to_tsv.py document.docx -o tables.txt --per-table
# Creates: tables_table1.txt, tables_table2.txt, etc.

# Copy to clipboard
python3 tools/word_doc_to_tsv.py document.docx --clipboard

# Print to stdout
python3 tools/word_doc_to_tsv.py document.docx
```

**Requires:** `pip install python-docx`

## Key Differences

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| `word_doc_to_tsv.py` | **Extract ALL tables from .docx** | .docx file | TSV or Markdown |
| `pathfinder_statblock_to_tsv.py` | Extract tables to separate file | MD, HTML, Word | TSV file |
| `pathfinder_statblock_to_tsv_inline.py` | Replace tables in document | MD only | Modified MD |
| `html_table_to_tsv.py` | HTML/Word-specific with stdin | HTML, Word | TSV file |
