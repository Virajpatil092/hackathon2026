"""
MCC Carbon Mapping Analysis Utility
Generates a detailed report of distinct MCC codes from transaction data
with their high-level categories and carbon emission factors
"""

import pandas as pd
import json
from pathlib import Path
from collections import defaultdict


def generate_mcc_carbon_report():
    """Generate a detailed report of MCC codes with carbon mapping"""
    
    project_root = Path(__file__).parent.parent
    
    # Load files
    transactions_path = project_root / 'customer_transaction_mcc_data.csv'
    carbon_map_path = project_root / 'mcc_carbon_mapping_europe.csv'
    mcc_desc_path = project_root / 'mcc_codes.json'
    
    print("Loading data...")
    
    # Load transaction data
    try:
        transactions_df = pd.read_csv(transactions_path)
        print(f"✓ Loaded {len(transactions_df):,} transactions")
    except Exception as e:
        print(f"✗ Error loading transactions: {e}")
        return
    
    # Load carbon mapping
    try:
        carbon_map_df = pd.read_csv(carbon_map_path)
        carbon_mapping = {}
        for _, row in carbon_map_df.iterrows():
            mcc = str(int(row['MCC']))
            carbon_mapping[mcc] = {
                'category': row['High_Level_Category'],
                'emission_factor': float(row['Emission Factor (kgCO2e per EUR spent)'])
            }
        print(f"✓ Loaded carbon mapping for {len(carbon_mapping)} MCC codes")
    except Exception as e:
        print(f"✗ Error loading carbon mapping: {e}")
        return
    
    # Load MCC descriptions
    try:
        with open(mcc_desc_path, 'r') as f:
            mcc_descriptions = json.load(f)
        print(f"✓ Loaded descriptions for {len(mcc_descriptions)} MCC codes")
    except Exception as e:
        print(f"✗ Error loading MCC descriptions: {e}")
        mcc_descriptions = {}
    
    # Get distinct MCCs from transactions
    print("\nAnalyzing distinct MCC codes...")
    
    mcc_column = 'MCC' if 'MCC' in transactions_df.columns else None
    if not mcc_column:
        print("✗ No MCC column found in transaction data")
        return
    
    # Get distinct MCCs with transaction counts
    mcc_counts = transactions_df[mcc_column].value_counts().sort_index()
    
    # Create detailed report
    report = {
        'summary': {
            'total_distinct_mccs': len(mcc_counts),
            'total_transactions': len(transactions_df),
            'mapped_mccs': 0,  # Will be updated
            'unmapped_mccs': 0,  # Will be updated
        },
        'by_category': defaultdict(list),
        'all_mccs': [],
        'unmapped_mccs': []
    }
    
    print(f"Found {len(mcc_counts):,} distinct MCC codes")
    print("\nGenerating detailed mapping...\n")
    
    # Process each distinct MCC
    for mcc_code, count in mcc_counts.items():
        mcc_str = str(int(mcc_code)) if isinstance(mcc_code, (int, float)) else str(mcc_code)
        
        if mcc_str in carbon_mapping:
            category = carbon_mapping[mcc_str]['category']
            emission_factor = carbon_mapping[mcc_str]['emission_factor']
            
            mcc_info = {
                'mcc_code': mcc_str,
                'description': mcc_descriptions.get(mcc_str, 'Unknown'),
                'high_level_category': category,
                'emission_factor': emission_factor,
                'transaction_count': int(count)
            }
            
            report['by_category'][category].append(mcc_info)
            report['all_mccs'].append(mcc_info)
            report['summary']['mapped_mccs'] += 1
        else:
            mcc_info = {
                'mcc_code': mcc_str,
                'description': mcc_descriptions.get(mcc_str, 'Unknown'),
                'high_level_category': 'UNMAPPED',
                'emission_factor': None,
                'transaction_count': int(count)
            }
            report['unmapped_mccs'].append(mcc_info)
            report['summary']['unmapped_mccs'] += 1
    
    # Sort MCCs in each category by transaction count
    for category in report['by_category']:
        report['by_category'][category].sort(
            key=lambda x: x['transaction_count'],
            reverse=True
        )
    
    # Sort all MCCs by transaction count
    report['all_mccs'].sort(key=lambda x: x['transaction_count'], reverse=True)
    
    # Print summary
    print("=" * 80)
    print("MCC CARBON MAPPING SUMMARY")
    print("=" * 80)
    print(f"\nTotal Distinct MCC Codes: {report['summary']['total_distinct_mccs']:,}")
    print(f"Total Transactions: {report['summary']['total_transactions']:,}")
    print(f"Mapped to Carbon Data: {report['summary']['mapped_mccs']}")
    print(f"Unmapped (not in carbon dataset): {report['summary']['unmapped_mccs']}")
    print(f"Mapping Coverage: {report['summary']['mapped_mccs'] / report['summary']['total_distinct_mccs'] * 100:.1f}%")
    
    # Print by category
    print("\n" + "=" * 80)
    print("DISTINCT MCCs BY HIGH-LEVEL CATEGORY")
    print("=" * 80)
    
    for category in sorted(report['by_category'].keys()):
        mccs = report['by_category'][category]
        total_transactions = sum(mcc['transaction_count'] for mcc in mccs)
        emission_factors = [mcc['emission_factor'] for mcc in mccs]
        
        print(f"\n{category}")
        print(f"  ├─ Distinct MCCs: {len(mccs)}")
        print(f"  ├─ Total Transactions: {total_transactions:,}")
        print(f"  ├─ Emission Factors: {min(emission_factors):.2f} - {max(emission_factors):.2f} kgCO2e/EUR")
        print(f"  └─ Top 5 MCCs:")
        
        for i, mcc in enumerate(mccs[:5], 1):
            pct = (mcc['transaction_count'] / total_transactions * 100)
            print(f"      {i}. {mcc['mcc_code']}: {mcc['description'][:50]}")
            print(f"         └─ {mcc['transaction_count']:,} transactions ({pct:.1f}%), "
                  f"Factor: {mcc['emission_factor']} kgCO2e/EUR")
    
    # Print top MCCs overall
    print("\n" + "=" * 80)
    print("TOP 20 MCC CODES BY TRANSACTION COUNT")
    print("=" * 80 + "\n")
    
    for i, mcc in enumerate(report['all_mccs'][:20], 1):
        print(f"{i:2d}. {mcc['mcc_code']:6s} | {mcc['description'][:45]:45s} | "
              f"{mcc['high_level_category']:20s} | {mcc['transaction_count']:>7,} trans | "
              f"Factor: {mcc['emission_factor']}")
    
    # Print unmapped MCCs if any
    if report['unmapped_mccs']:
        print("\n" + "=" * 80)
        print("UNMAPPED MCC CODES (Not in carbon mapping dataset)")
        print("=" * 80 + "\n")
        
        for i, mcc in enumerate(report['unmapped_mccs'][:10], 1):
            print(f"{i:2d}. {mcc['mcc_code']:6s} | {mcc['description'][:45]:45s} | "
                  f"{mcc['transaction_count']:>7,} transactions")
    
    # Save detailed report to JSON
    output_path = project_root / 'mcc_carbon_report.json'
    
    # Convert defaultdict to regular dict for JSON serialization
    report['by_category'] = dict(report['by_category'])
    
    with open(output_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n✓ Detailed report saved to: {output_path}")
    
    # Save summary CSV
    csv_output_path = project_root / 'mcc_carbon_mapping_summary.csv'
    summary_df = pd.DataFrame(report['all_mccs'])
    summary_df.to_csv(csv_output_path, index=False)
    print(f"✓ Summary CSV saved to: {csv_output_path}")
    
    return report


if __name__ == '__main__':
    generate_mcc_carbon_report()
