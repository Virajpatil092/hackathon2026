# Carbon Footprint API Setup & Testing Guide

## Quick Start

### 1. Install Dependencies

```bash
# Install Python packages
pip install -r requirements.txt

# If you haven't already
pip install pandas fastapi uvicorn
```

### 2. Run the Backend Server

```bash
# From the project root directory
python -m uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

### 3. Generate MCC Analysis Report

```bash
# Generate detailed MCC mapping report
python backend/utils/mcc_analysis.py
```

This creates:
- `mcc_carbon_report.json` - Detailed mapping data
- `mcc_carbon_mapping_summary.csv` - CSV for Excel/analysis
- Console output with statistics

---

## API Testing

### Using cURL

```bash
# Get carbon footprint summary
curl http://localhost:8000/api/v1/carbon-footprint

# Get carbon trend (last 6 months)
curl "http://localhost:8000/api/v1/carbon-footprint/trend?months=6"

# Get emissions by category
curl http://localhost:8000/api/v1/carbon-footprint/categories

# Get carbon benchmarks
curl http://localhost:8000/api/v1/carbon-footprint/benchmarks

# Get distinct MCC codes
curl http://localhost:8000/api/v1/carbon-footprint/mcc/distinct

# Get MCCs grouped by category
curl http://localhost:8000/api/v1/carbon-footprint/mcc/categories

# Get MCC statistics
curl http://localhost:8000/api/v1/carbon-footprint/mcc/stats
```

### Using Python Requests

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# Get carbon footprint
response = requests.get(f"{BASE_URL}/carbon-footprint")
footprint = response.json()
print(f"Total CO2e this month: {footprint['kgThisMonth']} kg")

# Get distinct MCC codes
response = requests.get(f"{BASE_URL}/carbon-footprint/mcc/distinct")
mccs = response.json()
print(f"Found {len(mccs)} distinct MCC codes")

# Get MCCs by category
response = requests.get(f"{BASE_URL}/carbon-footprint/mcc/categories")
categories = response.json()
for category, mccs in categories.items():
    print(f"{category}: {len(mccs)} MCCs")
```

### Using JavaScript/Frontend

```javascript
// In frontend environment (with VITE_USE_MOCK=false)

import {
  getCarbonFootprint,
  getCarbonTrend,
  getCarbonByCategory,
  getCarbonBenchmarks,
  getDistinctMCCs,
  getMCCByCategory,
  getMCCStats
} from '@/services/api'

// Get carbon footprint
const footprint = await getCarbonFootprint()
console.log(`This month: ${footprint.kgThisMonth} kg CO2e`)

// Get MCC mapping data
const mccs = await getDistinctMCCs()
const byCategory = await getMCCByCategory()
const stats = await getMCCStats()

console.log(`Total MCCs: ${stats.totalDistinctMCCs}`)
console.log(`Categories: ${stats.categories.join(', ')}`)
```

---

## Data Flow Diagram

```
Frontend (React/Vue)
    │
    ├─ /api/v1/carbon-footprint [GET]
    │   └─> CarbonFootprintService.calculate_carbon_footprint()
    │       ├─> Load transactions CSV
    │       ├─> Map MCC to categories & emission factors
    │       └─> Calculate totals & breakdown
    │
    ├─ /api/v1/carbon-footprint/mcc/distinct [GET]
    │   └─> CarbonFootprintService.get_distinct_mcc_codes()
    │       ├─> Load transactions CSV
    │       ├─> Extract unique MCCs
    │       ├─> Load MCC descriptions
    │       └─> Load carbon mapping
    │
    └─ Other endpoints...

Data Files:
  ├─ customer_transaction_mcc_data.csv (transactions)
  ├─ mcc_carbon_mapping_europe.csv (emission factors)
  └─ mcc_codes.json (MCC descriptions)
```

---

## Response Examples

### Carbon Footprint Response

```json
{
  "kgThisMonth": 620.5,
  "kgLastMonth": 638.2,
  "vsLastMonth": -2.8,
  "topEmissionCategory": "Transport",
  "categoryBreakdown": [
    {
      "label": "Transport",
      "value": 38.5,
      "kg": 238.7,
      "emission_factor": 0.25
    }
  ],
  "sixMonthTrend": [
    {
      "month": "Feb 2026",
      "value": 720
    }
  ],
  "totalEmissions": 620.5,
  "transactionCount": 250
}
```

### Distinct MCC Codes Response

```json
[
  {
    "mcc_code": "5812",
    "description": "Eating Places and Restaurants",
    "high_level_category": "Dining",
    "emission_factor": 0.6,
    "transaction_count": 16
  },
  {
    "mcc_code": "5541",
    "description": "Service Stations",
    "high_level_category": "Fuel",
    "emission_factor": 2.31,
    "transaction_count": 12
  }
]
```

### MCC Statistics Response

```json
{
  "totalDistinctMCCs": 45,
  "totalCategories": 9,
  "totalTransactions": 250,
  "categories": [
    "Dining",
    "Transport & Travel",
    "Utilities",
    "Retail",
    "Fuel"
  ],
  "emissionFactorRange": {
    "min": 0.15,
    "max": 2.31
  }
}
```

---

## Common Tasks

### 1. Analyze High-Emission Categories

```javascript
const byCategory = await getCarbonByCategory()

// Sort by total emissions
const sorted = Object.entries(byCategory.categories)
  .sort((a, b) => b[1].totalCO2e - a[1].totalCO2e)

sorted.forEach(([category, data]) => {
  console.log(`${category}: ${data.totalCO2e} kg CO2e`)
})
```

### 2. Find Top Transaction Types

```javascript
const mccs = await getDistinctMCCs()

// Sort by transaction count
const topMCCs = mccs
  .sort((a, b) => b.transaction_count - a.transaction_count)
  .slice(0, 10)

topMCCs.forEach(mcc => {
  console.log(`${mcc.mcc_code}: ${mcc.description} (${mcc.transaction_count} transactions)`)
})
```

### 3. Generate Category Summary

```python
from backend.services.carbon_services import get_carbon_service

service = get_carbon_service()

# Get all MCCs by category
mccs_by_category = service.get_mcc_by_category()

# Print summary
for category, mccs in mccs_by_category.items():
    emission_factor = mccs[0]['emission_factor']  # Same for all in category
    total_transactions = sum(m['transaction_count'] for m in mccs)
    print(f"{category}: {len(mccs)} MCCs, {total_transactions} transactions, Factor: {emission_factor}")
```

### 4. Export Data for Analysis

```python
import pandas as pd
from backend.services.carbon_services import get_carbon_service

service = get_carbon_service()

# Get all MCCs
mccs = service.get_distinct_mcc_codes()

# Convert to DataFrame
df = pd.DataFrame(mccs)

# Save to CSV
df.to_csv('mcc_analysis.csv', index=False)

# Group by category
grouped = df.groupby('high_level_category').agg({
    'mcc_code': 'count',
    'transaction_count': 'sum',
    'emission_factor': 'first'
})

grouped.to_csv('category_summary.csv')
```

---

## Debugging

### Check if Service Loads Correctly

```python
from backend.services.carbon_services import get_carbon_service

service = get_carbon_service()

# Verify data is loaded
print(f"MCC mappings: {len(service.mcc_carbon_map)}")
print(f"MCC descriptions: {len(service.mcc_descriptions)}")
print(f"Transactions loaded: {service.transactions_df is not None}")

# Test calculation
footprint = service.calculate_carbon_footprint()
print(f"Total emissions: {footprint['totalEmissions']} kg CO2e")
```

### View Available MCC Categories

```python
from backend.services.carbon_services import get_carbon_service

service = get_carbon_service()
categories = service.get_mcc_by_category()

print("Available categories:")
for category in sorted(categories.keys()):
    print(f"  - {category}")
```

### Check Data File Paths

```python
from pathlib import Path

project_root = Path(__file__).parent.parent

print(f"Transaction file exists: {(project_root / 'customer_transaction_mcc_data.csv').exists()}")
print(f"Carbon mapping file exists: {(project_root / 'mcc_carbon_mapping_europe.csv').exists()}")
print(f"MCC codes file exists: {(project_root / 'mcc_codes.json').exists()}")
```

---

## Performance Tips

1. **First Request Takes Longer**: Data files are loaded and cached on first request
2. **Large Dataset**: If transaction data is very large (>1GB), consider:
   - Using chunked loading with pandas
   - Filtering by date range
   - Running analysis in background job
3. **Caching**: Implement Redis caching for frequently accessed endpoints

---

## Next Steps

1. ✅ Backend API is ready to use
2. ✅ MCC data is properly mapped
3. 🔄 Frontend integration: Update `VITE_USE_MOCK=false` to use real API
4. 📊 Create visualization pages that use these endpoints
5. 🎯 Build recommendation engine based on high-emission categories

---

*For more information, see [CARBON_FOOTPRINT_API.md](CARBON_FOOTPRINT_API.md) and [MCC_REFERENCE_GUIDE.md](MCC_REFERENCE_GUIDE.md)*
