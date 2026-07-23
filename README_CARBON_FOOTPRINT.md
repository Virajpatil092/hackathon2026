# Carbon Footprint MCC Mapping - Implementation Summary

## What Has Been Created

This implementation provides a complete carbon footprint tracking system that maps Merchant Category Codes (MCCs) to carbon emission factors and provides comprehensive analytics APIs.

### 📁 Project Structure

```
hackathon2026/
├── backend/
│   ├── app.py                          # Main FastAPI application
│   ├── routes/
│   │   ├── carbon_routes.py           # ✨ NEW: Carbon footprint API endpoints
│   │   └── user_routes.py             # Existing user routes
│   ├── services/
│   │   ├── carbon_services.py         # ✨ NEW: Carbon calculation logic
│   │   └── user_services.py           # Existing user services
│   └── utils/
│       └── mcc_analysis.py            # ✨ NEW: MCC data analysis utility
│
├── frontend/
│   └── src/
│       └── services/
│           └── api.js                 # ✨ UPDATED: New API endpoints added
│
├── 📄 mcc_carbon_mapping_europe.csv   # MCC to carbon factor mapping
├── 📄 mcc_codes.json                  # MCC descriptions
├── 📄 customer_transaction_mcc_data.csv # Transaction data (large)
├── 📄 requirements.txt                # ✨ UPDATED: Added pandas
│
└── 📚 Documentation (NEW):
    ├── CARBON_FOOTPRINT_API.md        # Complete API documentation
    ├── MCC_REFERENCE_GUIDE.md         # Quick reference for MCC codes
    ├── MCC_CODES_COMPLETE_LIST.md    # Full list of all 113 MCCs
    └── SETUP_AND_TESTING.md           # Setup and testing guide
```

---

## Key Features

### 1. **Carbon Footprint Calculation** 💚
- Calculates CO2e emissions from transaction data
- Maps MCCs to emission factors (0.15 - 2.31 kgCO2e/EUR)
- Provides monthly trends and category breakdown
- Compares against benchmarks (national average, EU target, Paris agreement target)

### 2. **MCC Data Mapping** 📊
- Maps 113 distinct MCC codes across 10 categories
- Links merchant transactions to carbon impact
- Provides detailed merchant descriptions
- Groups MCCs by high-level categories

### 3. **REST API Endpoints** 🔌
Seven new API endpoints for carbon analytics:
- `GET /api/v1/carbon-footprint` - Overall footprint summary
- `GET /api/v1/carbon-footprint/trend` - Historical trends
- `GET /api/v1/carbon-footprint/categories` - Category breakdown
- `GET /api/v1/carbon-footprint/benchmarks` - Benchmark comparisons
- `GET /api/v1/carbon-footprint/mcc/distinct` - List distinct MCCs
- `GET /api/v1/carbon-footprint/mcc/categories` - MCCs grouped by category
- `GET /api/v1/carbon-footprint/mcc/stats` - MCC statistics

### 4. **Data Analysis Tools** 🔧
- `python backend/utils/mcc_analysis.py` - Generates detailed MCC mapping report
- Outputs JSON and CSV files for further analysis
- Console statistics and insights

---

## MCC Categories & Emission Factors

| Category | Count | Emission Factor | Impact |
|----------|-------|-----------------|--------|
| 🔴 Fuel | 1 | 2.31 | **HIGHEST** |
| 🟠 Groceries | 2 | 0.70 | HIGH |
| 🟡 Dining | 5 | 0.60 | MODERATE-HIGH |
| 🟡 Retail | 21 | 0.45 | MODERATE |
| 🟡 Utilities | 1 | 0.40 | MODERATE |
| 🟡 Other | 20 | 0.50 | MODERATE |
| 🟢 Travel & Lodging | 33 | 0.30 | LOW |
| 🟢 Transport | 9 | 0.25 | LOW |
| 🟢 Healthcare | 7 | 0.20 | LOW |
| 🟢 Telecom & Financial | 3 | 0.15 | **LOWEST** |

**Total: 113 distinct MCC codes**

---

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
# Installs: fastapi, uvicorn, pandas, python-multipart
```

### 2. Start Backend Server
```bash
cd hackathon2026
python -m uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

Server runs at: `http://localhost:8000`

### 3. Test API Endpoints
```bash
# Get carbon footprint
curl http://localhost:8000/api/v1/carbon-footprint

# Get distinct MCCs
curl http://localhost:8000/api/v1/carbon-footprint/mcc/distinct

# Get MCCs by category
curl http://localhost:8000/api/v1/carbon-footprint/mcc/categories
```

### 4. Generate MCC Analysis Report
```bash
python backend/utils/mcc_analysis.py
```

Creates:
- `mcc_carbon_report.json` - Detailed mapping data
- `mcc_carbon_mapping_summary.csv` - CSV export
- Console statistics

### 5. Enable Real API Calls (Frontend)
Update `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_USE_MOCK=false
```

Then use the new API functions:
```javascript
import { 
  getCarbonFootprint,
  getDistinctMCCs,
  getMCCByCategory,
  getMCCStats
} from '@/services/api'

// Now returns real data from backend
const footprint = await getCarbonFootprint()
const mccs = await getDistinctMCCs()
```

---

## Data Flow

```
Customer Transactions (CSV)
    ↓
[Extract MCC codes from transactions]
    ↓
[Look up MCC in carbon mapping CSV]
    ↓
[Get emission factor for category]
    ↓
[Calculate: Amount × Emission Factor = CO2e]
    ↓
[Aggregate by category, month, etc.]
    ↓
API Endpoints
    ↓
Frontend Visualization
```

### Example Calculation
```
Transaction: €100 at restaurant (MCC 5812)
Emission Factor: 0.6 kgCO2e/EUR
CO2e: 100 × 0.6 = 60 kgCO2e
```

---

## API Response Example

### Carbon Footprint Summary
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
    {"month": "Feb 2026", "value": 720},
    {"month": "Mar 2026", "value": 680}
  ],
  "totalEmissions": 620.5,
  "transactionCount": 250
}
```

### Distinct MCC Codes
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

---

## Documentation Files

1. **[CARBON_FOOTPRINT_API.md](CARBON_FOOTPRINT_API.md)**
   - Complete API documentation
   - Data structure explanations
   - Endpoint specifications
   - Backend architecture

2. **[MCC_REFERENCE_GUIDE.md](MCC_REFERENCE_GUIDE.md)**
   - Quick reference for all MCC codes
   - Organized by category
   - Emission factor rankings
   - Key insights and recommendations

3. **[MCC_CODES_COMPLETE_LIST.md](MCC_CODES_COMPLETE_LIST.md)**
   - Full list of all 113 MCC codes
   - Sorted by emission factor
   - Category summary
   - Usage examples

4. **[SETUP_AND_TESTING.md](SETUP_AND_TESTING.md)**
   - Installation instructions
   - API testing examples (cURL, Python, JavaScript)
   - Data flow diagrams
   - Debugging tips
   - Common tasks and solutions

---

## Usage Examples

### Get High Emission Categories
```javascript
const byCategory = await getCarbonByCategory()
const sorted = Object.entries(byCategory.categories)
  .sort((a, b) => b[1].totalCO2e - a[1].totalCO2e)
  
sorted.forEach(([category, data]) => {
  console.log(`${category}: ${data.totalCO2e} kg CO2e`)
})
```

### Find Top Transaction Types
```javascript
const mccs = await getDistinctMCCs()
const topMCCs = mccs
  .sort((a, b) => b.transaction_count - a.transaction_count)
  .slice(0, 10)
  
topMCCs.forEach(mcc => {
  console.log(`${mcc.mcc_code}: ${mcc.description}`)
})
```

### Export for Analysis
```python
from backend.services.carbon_services import get_carbon_service
import pandas as pd

service = get_carbon_service()
mccs = service.get_distinct_mcc_codes()
df = pd.DataFrame(mccs)
df.to_csv('mcc_analysis.csv', index=False)
```

---

## File Changes Summary

### New Files Created ✨
- `backend/services/carbon_services.py` - Carbon calculation service
- `backend/routes/carbon_routes.py` - Carbon API endpoints
- `backend/utils/mcc_analysis.py` - MCC analysis utility
- `CARBON_FOOTPRINT_API.md` - API documentation
- `MCC_REFERENCE_GUIDE.md` - MCC reference
- `MCC_CODES_COMPLETE_LIST.md` - Complete MCC list
- `SETUP_AND_TESTING.md` - Setup guide

### Files Updated 🔄
- `backend/app.py` - Added carbon routes and CORS middleware
- `frontend/src/services/api.js` - Added MCC data endpoints
- `requirements.txt` - Added pandas dependency

### Package Structure 📦
- `backend/__init__.py` - New package marker
- `backend/services/__init__.py` - New package marker
- `backend/routes/__init__.py` - New package marker
- `backend/utils/__init__.py` - New package marker

---

## Next Steps

1. ✅ **Backend API Ready** - All endpoints implemented and documented
2. ✅ **Data Mapping Complete** - All 113 MCCs mapped to carbon factors
3. 🔄 **Frontend Integration** - Enable `VITE_USE_MOCK=false` to use real APIs
4. 🎯 **Create Dashboard Pages** - Build visualizations using the new endpoints
5. 📊 **Generate Reports** - Use MCC analysis tool for detailed insights
6. 🧠 **Recommendations Engine** - Build AI-powered suggestions

---

## Troubleshooting

### API Returns Empty Data
- Ensure CSV files are in the project root
- Check file paths in `carbon_services.py`
- Verify pandas is installed: `pip install pandas`

### Transaction Data Not Loading
- File `customer_transaction_mcc_data.csv` may be too large
- Check available disk space
- Consider chunked loading for very large files

### CORS Issues
- CORS is enabled in `app.py` with `allow_origins=["*"]`
- For production, restrict to specific domains

### Port Already in Use
```bash
# Use different port
python -m uvicorn backend.app:app --port 8001
```

---

## Performance Notes

- **First Request**: Takes longer due to CSV loading and caching
- **Data Caching**: Transaction data is cached in memory
- **Large Datasets**: If transaction data is >1GB, consider:
  - Date range filtering
  - Chunked processing
  - Background jobs

---

## Support & Documentation

- **Full API Docs**: See [CARBON_FOOTPRINT_API.md](CARBON_FOOTPRINT_API.md)
- **MCC Reference**: See [MCC_REFERENCE_GUIDE.md](MCC_REFERENCE_GUIDE.md)
- **Setup Help**: See [SETUP_AND_TESTING.md](SETUP_AND_TESTING.md)
- **Complete MCC List**: See [MCC_CODES_COMPLETE_LIST.md](MCC_CODES_COMPLETE_LIST.md)

---

## Summary

✅ **Complete carbon footprint tracking system** with:
- 7 new REST API endpoints
- 113 MCC codes mapped to 10 categories
- Emission factors from 0.15 to 2.31 kgCO2e/EUR
- Frontend API integration
- Comprehensive documentation
- Analysis tools and reports

**Ready to track, analyze, and reduce carbon footprint!** 🌍💚

---

*Last Updated: July 2026*
