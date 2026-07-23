# Carbon Footprint API - Quick Reference Card

## 🚀 Quick Start (5 minutes)

```bash
# 1. Install
pip install -r requirements.txt

# 2. Run backend
python -m uvicorn backend.app:app --reload

# 3. Test API
curl http://localhost:8000/api/v1/carbon-footprint

# 4. Enable frontend to use real API
# Edit frontend/.env:
# VITE_USE_MOCK=false
# VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 📊 MCC Categories (10 Total, 113 Codes)

| Icon | Category | Factor | MCCs | Impact |
|------|----------|--------|------|--------|
| 🔴 | Fuel | 2.31 | 1 | HIGHEST |
| 🟠 | Groceries | 0.70 | 2 | HIGH |
| 🟡 | Dining | 0.60 | 5 | MOD-HIGH |
| 🟡 | Retail | 0.45 | 21 | MODERATE |
| 🟡 | Utilities | 0.40 | 1 | MODERATE |
| 🟡 | Other | 0.50 | 20 | MODERATE |
| 🟢 | Travel & Lodging | 0.30 | 33 | LOW |
| 🟢 | Transport | 0.25 | 9 | LOW |
| 🟢 | Healthcare | 0.20 | 7 | LOW |
| 🟦 | Telecom & Financial | 0.15 | 3 | LOWEST |

---

## 🔗 API Endpoints

### Carbon Footprint
```
GET /api/v1/carbon-footprint
  → Overall footprint summary (monthly, trend, breakdown)

GET /api/v1/carbon-footprint/trend?months=6
  → Historical trend data by category

GET /api/v1/carbon-footprint/categories
  → Breakdown: total CO2e, avg per transaction, count per category

GET /api/v1/carbon-footprint/benchmarks
  → Compare vs national average, EU target, Paris agreement
```

### MCC Data
```
GET /api/v1/carbon-footprint/mcc/distinct
  → All MCC codes with descriptions and factors

GET /api/v1/carbon-footprint/mcc/categories
  → MCCs grouped by high-level category

GET /api/v1/carbon-footprint/mcc/stats
  → Statistics: total distinct MCCs, categories, transaction count
```

---

## 💻 Example: Get Carbon Footprint

### cURL
```bash
curl http://localhost:8000/api/v1/carbon-footprint | jq
```

### Python
```python
import requests
r = requests.get('http://localhost:8000/api/v1/carbon-footprint')
print(r.json()['kgThisMonth'])  # 620.5
```

### JavaScript
```javascript
import { getCarbonFootprint } from '@/services/api'
const data = await getCarbonFootprint()
console.log(data.kgThisMonth)  // 620.5
```

### Response
```json
{
  "kgThisMonth": 620.5,
  "kgLastMonth": 638.2,
  "vsLastMonth": -2.8,
  "topEmissionCategory": "Transport",
  "categoryBreakdown": [...],
  "sixMonthTrend": [...],
  "totalEmissions": 620.5,
  "transactionCount": 250
}
```

---

## 🧮 Calculation Formula

```
CO2e (kg) = Transaction Amount (EUR) × Emission Factor (kgCO2e/EUR)
```

### Examples
| Merchant | MCC | Amount | Factor | CO2e |
|----------|-----|--------|--------|------|
| Restaurant | 5812 | €50 | 0.60 | 30 kg |
| Grocery Store | 5411 | €80 | 0.70 | 56 kg |
| Gas Station | 5541 | €60 | 2.31 | 138.6 kg |
| Bus Ticket | 4111 | €30 | 0.25 | 7.5 kg |

---

## 🔧 Tools & Utilities

### Generate MCC Report
```bash
python backend/utils/mcc_analysis.py
```

Creates:
- `mcc_carbon_report.json` - Detailed data
- `mcc_carbon_mapping_summary.csv` - Excel-friendly export
- Console statistics

---

## 📁 Key Files

```
backend/
├── app.py                    # Main app with routes
├── services/carbon_services.py    # Calculation logic
├── routes/carbon_routes.py        # API endpoints
└── utils/mcc_analysis.py          # Analysis tool

frontend/
└── src/services/api.js       # Frontend API client

Docs/
├── CARBON_FOOTPRINT_API.md        # Complete reference
├── MCC_REFERENCE_GUIDE.md         # MCC details
├── MCC_CODES_COMPLETE_LIST.md    # All 113 MCCs
├── SETUP_AND_TESTING.md           # How-to guide
└── README_CARBON_FOOTPRINT.md     # Implementation summary
```

---

## 📝 Service Methods

```python
from backend.services.carbon_services import get_carbon_service

service = get_carbon_service()

# Calculate emissions
footprint = service.calculate_carbon_footprint()
# → {kgThisMonth, kgLastMonth, categoryBreakdown, ...}

# Get all distinct MCCs
mccs = service.get_distinct_mcc_codes()
# → [{mcc_code, description, category, emission_factor, ...}, ...]

# Get MCCs by category
by_category = service.get_mcc_by_category()
# → {category: [mcc_info, ...], ...}

# Get breakdown by category
by_cat = service.get_carbon_by_category()
# → {category: {totalCO2e, avgCO2e, count, ...}, ...}

# Get historical trend
trend = service.get_carbon_trend(months=6)
# → [{month, data: {category: value, ...}}, ...]

# Get benchmarks
bench = service.get_carbon_benchmarks()
# → {yourFootprint, nationalAvg, euTarget, parisTarget, ...}
```

---

## 🎯 Common Tasks

### Find High Impact Categories
```javascript
const cats = await getCarbonByCategory()
const sorted = Object.entries(cats.categories)
  .sort((a,b) => b[1].totalCO2e - a[1].totalCO2e)
sorted.forEach(([cat, data]) => 
  console.log(`${cat}: ${data.totalCO2e.toFixed(1)} kg`)
)
```

### Get Top MCCs by Transactions
```javascript
const mccs = await getDistinctMCCs()
mccs.sort((a,b) => b.transaction_count - a.transaction_count)
  .slice(0, 10)
  .forEach(m => console.log(`${m.mcc_code}: ${m.description}`))
```

### Calculate Potential Savings
```javascript
// If customer reduced fuel spending by 50%
const reduction = 600 * 0.5 * 2.31  // EUR * factor
console.log(`Potential saving: ${reduction.toFixed(1)} kg CO2e`)
```

---

## ⚙️ Configuration

### Environment Variables
```env
# frontend/.env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_USE_MOCK=false
```

### API Base Path
```
/api/v1/carbon-footprint
```

### Port
Default: 8000 (configurable)

---

## ✅ Checklist

- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Start backend: `python -m uvicorn backend.app:app --reload`
- [ ] Test API: `curl http://localhost:8000/api/v1/carbon-footprint`
- [ ] Update frontend `.env`: `VITE_USE_MOCK=false`
- [ ] Import API functions: `import { getCarbonFootprint } from '@/services/api'`
- [ ] Generate report: `python backend/utils/mcc_analysis.py`
- [ ] Read documentation: `CARBON_FOOTPRINT_API.md`

---

## 🐛 Debugging

**API Returns 500 Error?**
- Check Python dependencies: `pip install pandas`
- Verify CSV files exist in project root
- Check console for error messages

**No Data in Responses?**
- Ensure `customer_transaction_mcc_data.csv` exists
- Check file is readable and not corrupted
- Run `python backend/utils/mcc_analysis.py` to verify data

**Frontend Still Uses Mock Data?**
- Check `VITE_USE_MOCK=false` in `.env`
- Clear browser cache
- Restart dev server

---

## 📚 Documentation

- **Full API Reference**: `CARBON_FOOTPRINT_API.md`
- **MCC Quick Reference**: `MCC_REFERENCE_GUIDE.md`
- **All 113 MCCs**: `MCC_CODES_COMPLETE_LIST.md`
- **Setup Guide**: `SETUP_AND_TESTING.md`
- **Implementation Summary**: `README_CARBON_FOOTPRINT.md`

---

## 🌍 Key Insights

- **Fuel is 9× more impactful** than dining (2.31 vs 0.60)
- **Public transport is 9× better** than personal vehicle fuel (0.25 vs 2.31)
- **Groceries are 14% better** than dining out (0.70 vs 0.60)
- **Telecom is 15× lower** than fuel (0.15 vs 2.31)

---

*Quick Reference v1.0 - July 2026*
