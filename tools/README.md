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

Dedicated HTML table converter with additional features like colspan handling and stdin support.

```bash
# Convert HTML file
python3 tools/html_table_to_tsv.py input.html -o output.txt

# Read from stdin (useful for piping)
echo "<table><tr><td>AC</td><td>15</td></tr></table>" | python3 tools/html_table_to_tsv.py --stdin

# Copy to clipboard
python3 tools/html_table_to_tsv.py input.html --clipboard
```

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

**Input (HTML):**
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

## Key Differences

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| `pathfinder_statblock_to_tsv.py` | Extract tables to separate file | MD or HTML | TSV file |
| `pathfinder_statblock_to_tsv_inline.py` | Replace tables in document | MD only | Modified MD |
| `html_table_to_tsv.py` | HTML-specific with stdin support | HTML | TSV file |
