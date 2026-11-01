"""  """#!/usr/bin/env python3
"""Extract budget data for Desa Lelea from Perbup Indramayu PDF - revised."""

import sys
import csv
import re
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    print("ERROR: pdfplumber not installed. Run: pip install pdfplumber")
    sys.exit(1)

PDF_PATH = "public/data-source/Perbup Indramayu Nomor 223 Tahun 2024.pdf"
BUDGET_CSV = "public/data-source/lelea_budget.csv"
REPORT_MD = "public/data-source/REPORT.md"

# Known village-level tables and what they contain
FUND_TYPES = {
    1277: ("Dana Desa", "Dana Desa"),
    1290: ("Alokasi Dana Desa", "Bagi Hasil Pajak dan Retribusi Daerah"),
    1301: ("Dana Otsus/Dana Khusus", "Dana Khusus"),
    1311: ("Bantuan Keuangan Provinsi", "Bantuan Keuangan Provinsi"),
    1325: ("Bantuan Keuangan Kabupaten", "Bantuan Keuangan Kabupaten"),
    1337: ("Dana Insentif Daerah", "Dana Insentif Daerah"),
}

def clean_amount(s):
    """Parse amount string to integer. Indonesian format: dot=thousand, comma=decimal."""
    if not s:
        return None
    # Remove Rp, spaces
    s = s.replace("Rp", "").strip()
    # Indonesian format: 941.750.000,00 means 941,750,000.00
    # Remove dots (thousand separator)
    s = s.replace(".", "")
    # Remove comma and everything after (decimal part)
    if "," in s:
        s = s.split(",")[0]
    try:
        return int(s)
    except ValueError:
        return None

def main():
    pdf_file = Path(PDF_PATH)
    if not pdf_file.exists():
        print(f"ERROR: PDF not found at {PDF_PATH}")
        sys.exit(1)
    
    print(f"Opening PDF: {PDF_PATH}")
    
    with pdfplumber.open(pdf_file) as pdf:
        total_pages = len(pdf.pages)
        print(f"Total pages: {total_pages}\n")
        
        budget_rows = []
        pages_checked = set()
        
        # Extract from known pages with village allocations
        for page_num in sorted(FUND_TYPES.keys()):
            if page_num > total_pages:
                print(f"Page {page_num} out of range (PDF has {total_pages} pages)")
                continue
            
            fund_name, fund_category = FUND_TYPES[page_num]
            page = pdf.pages[page_num - 1]  # 0-indexed
            pages_checked.add(page_num)
            
            text = page.extract_text()
            if not text:
                print(f"Page {page_num}: No text extracted")
                continue
            
            print(f"Extracting page {page_num}: {fund_name}")
            
            lines = text.split('\n')
            for line in lines:
                # Look for Lelea in this line with a number (village ID)
                # Pattern: number + village_name + amount
                # e.g., "192 Lelea 941.750.000,00"
                if 'lelea' in line.lower():
                    # Try to parse: number space lelea space amount
                    match = re.search(r'(\d+)\s+lelea\s+([\d.,]+)', line, re.IGNORECASE)
                    if match:
                        village_num = match.group(1)
                        amount_str = match.group(2)
                        amount = clean_amount(amount_str)
                        
                        if amount and amount > 0:
                            print(f"  Found: Village {village_num} - {amount:,} ({amount_str})")
                            budget_rows.append({
                                'tahun': '2024',
                                'jenis': 'pendapatan',
                                'bidang': 'Pendapatan Transfer',
                                'uraian': fund_name,
                                'anggaran': amount,
                                'realisasi': 0,
                                'sumber_halaman': page_num
                            })
        
        # Write CSV
        if budget_rows:
            with open(BUDGET_CSV, "w", encoding="utf-8", newline='') as f:
                writer = csv.DictWriter(f, fieldnames=[
                    'tahun', 'jenis', 'bidang', 'uraian', 'anggaran', 'realisasi', 'sumber_halaman'
                ])
                writer.writeheader()
                writer.writerows(budget_rows)
            print(f"\nWrote {len(budget_rows)} budget items to {BUDGET_CSV}")
        else:
            print("\nNo budget data extracted.")
        
        # Write report
        with open(REPORT_MD, "w", encoding="utf-8") as f:
            f.write("# Extraction Report - Revised\n\n")
            f.write(f"**PDF:** {PDF_PATH}\n")
            f.write(f"**Total pages:** {total_pages}\n")
            f.write(f"**Pages checked for village allocations:** {len(pages_checked)}\n")
            f.write(f"**Budget items extracted for Desa Lelea:** {len(budget_rows)}\n\n")
            
            if budget_rows:
                f.write("## Extracted Budget Items\n\n")
                for row in budget_rows:
                    f.write(f"- {row['uraian']}: Rp {row['anggaran']:,} (page {row['sumber_halaman']})\n")
                f.write("\n### Summary by Fund Type\n")
                by_fund = {}
                for row in budget_rows:
                    uraian = row['uraian']
                    if uraian not in by_fund:
                        by_fund[uraian] = 0
                    by_fund[uraian] += row['anggaran']
                
                total = 0
                for fund, amount in sorted(by_fund.items()):
                    f.write(f"- {fund}: Rp {amount:,}\n")
                    total += amount
                f.write(f"\n**Total allocation to Desa Lelea:** Rp {total:,}\n")
            else:
                f.write("## No Budget Data\n\n")
                f.write("No budget data for Desa Lelea was extracted.\n")
        
        print(f"\nWrote report to {REPORT_MD}")
        print("\n=== SUMMARY ===")
        print(f"Pages checked: {len(pages_checked)}")
        print(f"Budget items: {len(budget_rows)}")
        
        if budget_rows:
            print("\nExtracted allocations:")
            by_fund = {}
            for row in budget_rows:
                uraian = row['uraian']
                if uraian not in by_fund:
                    by_fund[uraian] = 0
                by_fund[uraian] += row['anggaran']
            
            total = 0
            for fund, amount in sorted(by_fund.items()):
                print(f"  {fund}: Rp {amount:,}")
                total += amount
            print(f"\nTotal: Rp {total:,}")

if __name__ == "__main__":
    main()
