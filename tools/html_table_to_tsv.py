#!/usr/bin/env python3
"""
HTML Table to Tab-Delimited Converter
=====================================

Converts HTML tables to tab-delimited format for InDesign import.
Specifically designed for Pathfinder 1st Edition statblocks copied from web sources.

Usage:
    python3 tools/html_table_to_tsv.py input.html -o output.txt
    python3 tools/html_table_to_tsv.py input.html --clipboard
    echo "<table>...</table>" | python3 tools/html_table_to_tsv.py --stdin

Author: Pathfinder 1st Edition Validator Tools
Date: 2025-12-13
"""

import argparse
import re
import sys
from pathlib import Path
from typing import List, Optional, Tuple
from html.parser import HTMLParser


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
        self.cell_colspan = 1
    
    def handle_starttag(self, tag: str, attrs):
        tag = tag.lower()
        attrs_dict = dict(attrs)
        
        if tag == 'table':
            self.in_table = True
            self.current_table = []
        elif tag == 'tr':
            self.in_row = True
            self.current_row = []
        elif tag in ('td', 'th'):
            self.in_cell = True
            self.current_cell = ""
            # Handle colspan
            self.cell_colspan = int(attrs_dict.get('colspan', 1))
        elif tag == 'br' and self.in_cell:
            self.current_cell += " "
    
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
            cell_content = self.current_cell.strip()
            # Clean up whitespace
            cell_content = re.sub(r'\s+', ' ', cell_content)
            # Add cell (and empty cells for colspan)
            self.current_row.append(cell_content)
            for _ in range(self.cell_colspan - 1):
                self.current_row.append("")
            self.in_cell = False
            self.current_cell = ""
            self.cell_colspan = 1
    
    def handle_data(self, data: str):
        if self.in_cell:
            self.current_cell += data
    
    def handle_entityref(self, name: str):
        """Handle HTML entities like &nbsp;"""
        if self.in_cell:
            entities = {
                'nbsp': ' ',
                'amp': '&',
                'lt': '<',
                'gt': '>',
                'quot': '"',
                'apos': "'",
                'mdash': '—',
                'ndash': '–',
                'times': '×',
                'plusmn': '±',
            }
            self.current_cell += entities.get(name, f'&{name};')
    
    def handle_charref(self, name: str):
        """Handle numeric character references like &#160;"""
        if self.in_cell:
            try:
                if name.startswith('x'):
                    char = chr(int(name[1:], 16))
                else:
                    char = chr(int(name))
                self.current_cell += char
            except (ValueError, OverflowError):
                self.current_cell += f'&#{name};'


def extract_tables_from_html(content: str) -> List[Tuple[str, List[List[str]]]]:
    """
    Extract all HTML tables from content.
    
    Returns:
        List of tuples: (table_header, table_rows)
    """
    parser = HTMLTableParser()
    
    try:
        parser.feed(content)
    except Exception as e:
        print(f"Warning: HTML parsing error: {e}", file=sys.stderr)
    
    tables = []
    for i, table_rows in enumerate(parser.tables):
        # Try to find a caption or preceding header
        header = f"Table {i + 1}"
        tables.append((header, table_rows))
    
    return tables


def format_as_tsv(tables: List[Tuple[str, List[List[str]]]], 
                  include_headers: bool = True,
                  normalize_columns: bool = True) -> str:
    """
    Format extracted tables as tab-separated values.
    
    Args:
        tables: List of (header, rows) tuples
        include_headers: Whether to include section headers
        normalize_columns: Pad rows to have consistent column count
    
    Returns:
        Tab-delimited string
    """
    output_lines = []
    
    for header, rows in tables:
        if not rows:
            continue
            
        # Normalize column count if requested
        if normalize_columns and rows:
            max_cols = max(len(row) for row in rows)
            rows = [row + [''] * (max_cols - len(row)) for row in rows]
        
        if include_headers and header:
            output_lines.append(f"# {header}")
            output_lines.append("")
        
        for row in rows:
            output_lines.append('\t'.join(row))
        
        output_lines.append("")
    
    return '\n'.join(output_lines)


def convert_html(content: str, include_headers: bool = True) -> str:
    """
    Convert HTML content to tab-delimited format.
    
    Args:
        content: HTML content with tables
        include_headers: Include section headers
    
    Returns:
        Tab-delimited string
    """
    tables = extract_tables_from_html(content)
    return format_as_tsv(tables, include_headers)


def convert_file(input_path: Path, output_path: Optional[Path] = None, 
                 include_headers: bool = True, clipboard: bool = False) -> str:
    """
    Convert HTML file to tab-delimited format.
    
    Args:
        input_path: Path to input HTML file
        output_path: Path to output file (optional)
        include_headers: Include section headers
        clipboard: Copy to clipboard instead of saving
    
    Returns:
        The converted TSV content
    """
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    tables = extract_tables_from_html(content)
    
    if not tables:
        print("Warning: No HTML tables found in input file", file=sys.stderr)
        return ""
    
    print(f"Found {len(tables)} table(s) in input file")
    
    tsv_content = format_as_tsv(tables, include_headers)
    
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


def main():
    parser = argparse.ArgumentParser(
        description='Convert HTML tables to tab-delimited format for Pathfinder statblocks',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Convert HTML file and save
  %(prog)s input.html -o output.txt
  
  # Convert and print to stdout
  %(prog)s input.html
  
  # Copy to clipboard (requires pyperclip)
  %(prog)s input.html --clipboard
  
  # Read from stdin (for piping)
  echo "<table><tr><td>AC</td><td>15</td></tr></table>" | %(prog)s --stdin
  
  # Convert without section headers
  %(prog)s input.html --no-headers -o output.txt
        """
    )
    
    parser.add_argument('input', type=Path, nargs='?', help='Input HTML file')
    parser.add_argument('-o', '--output', type=Path, help='Output file path')
    parser.add_argument('--no-headers', action='store_true',
                       help='Exclude section headers from output')
    parser.add_argument('--clipboard', action='store_true',
                       help='Copy result to clipboard (requires pyperclip)')
    parser.add_argument('--stdin', action='store_true',
                       help='Read HTML from stdin instead of file')
    
    args = parser.parse_args()
    
    if args.stdin:
        content = sys.stdin.read()
        tsv_content = convert_html(content, include_headers=not args.no_headers)
        
        if args.clipboard:
            try:
                import pyperclip
                pyperclip.copy(tsv_content)
                print("✓ Copied to clipboard!", file=sys.stderr)
            except ImportError:
                print("Error: pyperclip not installed", file=sys.stderr)
                print(tsv_content)
        elif args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(tsv_content)
            print(f"✓ Saved to: {args.output}", file=sys.stderr)
        else:
            print(tsv_content)
        return 0
    
    if not args.input:
        parser.error("Input file required (or use --stdin)")
    
    if not args.input.exists():
        print(f"Error: Input file not found: {args.input}", file=sys.stderr)
        return 1
    
    try:
        convert_file(
            args.input, 
            args.output, 
            include_headers=not args.no_headers,
            clipboard=args.clipboard
        )
        return 0
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
