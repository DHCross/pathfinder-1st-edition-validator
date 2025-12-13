#!/usr/bin/env python3
"""
Pathfinder Statblock Table to Tab-Delimited Converter
======================================================

Converts Markdown pipe tables and HTML tables to tab-delimited format.
Specifically designed for Pathfinder 1st Edition statblocks and game content.

Usage:
    python3 tools/pathfinder_statblock_to_tsv.py input.md -o output.txt
    python3 tools/pathfinder_statblock_to_tsv.py input.html -o output.txt
    python3 tools/pathfinder_statblock_to_tsv.py input.md --clipboard

Author: Pathfinder 1st Edition Validator Tools
Date: 2025-12-13
"""

import argparse
import re
import sys
from pathlib import Path
from typing import List, Optional, Tuple
from html.parser import HTMLParser


def parse_markdown_table(table_text: str) -> List[List[str]]:
    """
    Parse a markdown pipe table into a list of rows.
    
    Args:
        table_text: Markdown table text with pipes
    
    Returns:
        List of rows, where each row is a list of cells
    """
    lines = [line.strip() for line in table_text.strip().split('\n') if line.strip()]
    rows = []
    
    for line in lines:
        # Skip separator lines (e.g., | :--- | :--- |)
        if re.match(r'^\|[\s:\-|]+\|$', line):
            continue
        
        # Remove leading/trailing pipes and split
        line = line.strip('|')
        cells = [cell.strip() for cell in line.split('|')]
        rows.append(cells)
    
    return rows


def extract_tables_from_markdown(content: str) -> List[Tuple[str, List[List[str]]]]:
    """
    Extract all markdown tables from content.
    
    Returns:
        List of tuples: (preceding_header, table_rows)
    """
    lines = content.split('\n')
    tables = []
    current_table_lines = []
    current_header = ""
    in_table = False
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Check if this is a table line (starts with |)
        if stripped.startswith('|'):
            if not in_table:
                # New table starting - capture preceding header
                for j in range(i - 1, max(-1, i - 10), -1):
                    prev_line = lines[j].strip()
                    if prev_line.startswith('#') or prev_line.startswith('**'):
                        current_header = prev_line.lstrip('#').strip('*').strip()
                        break
                in_table = True
            
            current_table_lines.append(line)
        elif in_table:
            # End of table
            if current_table_lines:
                table_rows = parse_markdown_table('\n'.join(current_table_lines))
                tables.append((current_header, table_rows))
                current_table_lines = []
                current_header = ""
            in_table = False
    
    # Handle table at end of file
    if current_table_lines:
        table_rows = parse_markdown_table('\n'.join(current_table_lines))
        tables.append((current_header, table_rows))
    
    return tables


class HTMLTableParser(HTMLParser):
    """Parse HTML tables into row/cell structure."""
    
    def __init__(self):
        super().__init__()
        self.tables: List[List[List[str]]] = []
        self.current_table: List[List[str]] = []
        self.current_row: List[str] = []
        self.current_cell: str = ""
        self.in_table = False
        self.in_row = False
        self.in_cell = False
    
    def handle_starttag(self, tag: str, attrs):
        tag = tag.lower()
        if tag == 'table':
            self.in_table = True
            self.current_table = []
        elif tag == 'tr':
            self.in_row = True
            self.current_row = []
        elif tag in ('td', 'th'):
            self.in_cell = True
            self.current_cell = ""
    
    def handle_endtag(self, tag: str):
        tag = tag.lower()
        if tag == 'table':
            if self.current_table:
                self.tables.append(self.current_table)
            self.in_table = False
            self.current_table = []
        elif tag == 'tr':
            if self.current_row:
                self.current_table.append(self.current_row)
            self.in_row = False
            self.current_row = []
        elif tag in ('td', 'th'):
            self.current_row.append(self.current_cell.strip())
            self.in_cell = False
            self.current_cell = ""
    
    def handle_data(self, data: str):
        if self.in_cell:
            self.current_cell += data


def extract_tables_from_html(content: str) -> List[Tuple[str, List[List[str]]]]:
    """
    Extract all HTML tables from content.
    
    Returns:
        List of tuples: (table_index_header, table_rows)
    """
    parser = HTMLTableParser()
    parser.feed(content)
    
    tables = []
    for i, table_rows in enumerate(parser.tables):
        header = f"Table {i + 1}"
        tables.append((header, table_rows))
    
    return tables


def format_as_tsv(tables: List[Tuple[str, List[List[str]]]], include_headers: bool = True) -> str:
    """
    Format extracted tables as tab-separated values.
    
    Args:
        tables: List of (header, rows) tuples
        include_headers: Whether to include section headers
    
    Returns:
        Tab-delimited string
    """
    output_lines = []
    
    for header, rows in tables:
        if include_headers and header:
            output_lines.append(f"# {header}")
            output_lines.append("")
        
        for row in rows:
            output_lines.append('\t'.join(row))
        
        output_lines.append("")
    
    return '\n'.join(output_lines)


def detect_format(content: str, file_path: Optional[Path] = None) -> str:
    """
    Detect whether content is Markdown or HTML.
    
    Returns:
        'markdown' or 'html'
    """
    if file_path:
        suffix = file_path.suffix.lower()
        if suffix in ('.html', '.htm'):
            return 'html'
        if suffix in ('.md', '.markdown'):
            return 'markdown'
    
    # Content-based detection
    if '<table' in content.lower() or '<tr' in content.lower():
        return 'html'
    if '|' in content and re.search(r'^\s*\|.*\|', content, re.MULTILINE):
        return 'markdown'
    
    return 'markdown'


def convert_file(input_path: Path, output_path: Optional[Path] = None, 
                 include_headers: bool = True, clipboard: bool = False,
                 force_format: Optional[str] = None) -> str:
    """
    Convert file containing tables to tab-delimited format.
    
    Args:
        input_path: Path to input file
        output_path: Path to output file (optional)
        include_headers: Include section headers
        clipboard: Copy to clipboard instead of saving
        force_format: Force 'markdown' or 'html' format detection
    
    Returns:
        The converted TSV content
    """
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Detect format
    fmt = force_format or detect_format(content, input_path)
    
    # Extract tables based on format
    if fmt == 'html':
        tables = extract_tables_from_html(content)
        print(f"Detected HTML format")
    else:
        tables = extract_tables_from_markdown(content)
        print(f"Detected Markdown format")
    
    if not tables:
        print("Warning: No tables found in input file", file=sys.stderr)
        return ""
    
    print(f"Found {len(tables)} table(s) in input file")
    
    # Format as TSV
    tsv_content = format_as_tsv(tables, include_headers)
    
    # Output
    if clipboard:
        try:
            import pyperclip
            pyperclip.copy(tsv_content)
            print("✓ Copied to clipboard!")
        except ImportError:
            print("Error: pyperclip not installed. Install with: pip install pyperclip", 
                  file=sys.stderr)
            print("\nContent:")
            print(tsv_content)
    elif output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(tsv_content)
        print(f"✓ Saved to: {output_path}")
    else:
        print(tsv_content)
    
    return tsv_content


def convert_text(text: str, include_headers: bool = True, 
                 force_format: Optional[str] = None) -> str:
    """
    Convert text containing tables to tab-delimited format.
    
    Args:
        text: Content with tables (Markdown or HTML)
        include_headers: Include section headers
        force_format: Force 'markdown' or 'html' format detection
    
    Returns:
        Tab-delimited string
    """
    fmt = force_format or detect_format(text)
    
    if fmt == 'html':
        tables = extract_tables_from_html(text)
    else:
        tables = extract_tables_from_markdown(text)
    
    return format_as_tsv(tables, include_headers)


def main():
    parser = argparse.ArgumentParser(
        description='Convert Markdown/HTML tables to tab-delimited format for Pathfinder statblocks',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Convert Markdown file and save
  %(prog)s input.md -o output.txt
  
  # Convert HTML file
  %(prog)s statblock.html -o output.txt
  
  # Convert and print to stdout
  %(prog)s input.md
  
  # Copy to clipboard (requires pyperclip)
  %(prog)s input.md --clipboard
  
  # Force format detection
  %(prog)s input.txt --format markdown -o output.txt
  
  # Convert without section headers
  %(prog)s input.md --no-headers -o output.txt
        """
    )
    
    parser.add_argument('input', type=Path, help='Input file (Markdown or HTML)')
    parser.add_argument('-o', '--output', type=Path, help='Output file path')
    parser.add_argument('--no-headers', action='store_true',
                       help='Exclude section headers from output')
    parser.add_argument('--clipboard', action='store_true',
                       help='Copy result to clipboard (requires pyperclip)')
    parser.add_argument('--format', choices=['markdown', 'html'],
                       help='Force input format (auto-detected by default)')
    
    args = parser.parse_args()
    
    if not args.input.exists():
        print(f"Error: Input file not found: {args.input}", file=sys.stderr)
        return 1
    
    try:
        convert_file(
            args.input, 
            args.output, 
            include_headers=not args.no_headers,
            clipboard=args.clipboard,
            force_format=args.format
        )
        return 0
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
