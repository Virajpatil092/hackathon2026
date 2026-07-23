# Carbon Footprint API & MCC Mapping Documentation

## Overview

This document describes the carbon footprint calculation system that maps Merchant Category Codes (MCCs) to carbon emission factors and provides analytics endpoints for tracking and visualizing carbon footprint data.

## Data Structure

### 1. MCC Carbon Mapping (`mcc_carbon_mapping_europe.csv`)

Maps MCC codes to high-level categories and emission factors for Europe.

**Structure:**
```
MCC | High_Level_Category | Emission Factor (kgCO2e per EUR spent)
5812| Dining             | 0.6
5541| Fuel               | 2.31
4111| Transport & Travel | 0.25
3000| Travel & Lodging   | 0.3
```

**Categories:**
- **Fuel**: 2.31 kgCO2e/EUR (highest emissions)
- **Groceries**: 0.7 kgCO2e/EUR
- **Dining**: 0.6 kgCO2e/EUR
- **Retail**: 0.45 kgCO2e/EUR
- **Utilities**: 0.4 kgCO2e/EUR
- **Travel & Lodging**: 0.3 kgCO2e/EUR
- **Transport & Travel**: 0.25 kgCO2e/EUR
- **Healthcare & Pharmacy**: 0.2 kgCO2e/EUR
- **Telecom & Financial**: 0.15 kgCO2e/EUR
- **Other**: 0.5 kgCO2e/EUR

### 2. MCC Descriptions (`mcc_codes.json`)

Contains merchant descriptions for each MCC code.

**Structure:**
```json
{
  "5812": "Eating Places and Restaurants",
  "5541": "Service Stations",
  "4111": "Local and Suburban Commuter Transportation",
  ...
}
```

### 3. Transaction Data (`customer_transaction_mcc_data.csv`)

Customer transaction data with amounts and MCC codes.

**Expected Columns:**
- `MCC`: Merchant Category Code
- `Amount`: Transaction amount in EUR
- `Date`: Transaction date
- `Customer_ID`: (Optional) Customer identifier

### 4. Carbon Calculation

**Formula:**
```
CO2e (kg) = Transaction Amount (EUR) × Emission Factor (kgCO2e/EUR)
```

**Example:**
- Customer spends €100 at a restaurant (MCC 5812)
- Emission Factor for Dining: 0.6 kgCO2e/EUR
- Carbon Footprint: 100 × 0.6 = 60 kgCO2e

## API Endpoints

### Carbon Footprint Endpoints

#### 1. Get Carbon Footprint Summary
```
GET /api/v1/carbon-footprint
```

**Response:**
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
    },
    {
      "label": "Dining",
      "value": 22.1,
      "kg": 136.8,
      "emission_factor": 0.6
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

#### 2. Get Carbon Trend
```
GET /api/v1/carbon-footprint/trend?months=6
```

**Parameters:**
- `months` (optional, default=6): Number of months to retrieve (1-24)

**Response:**
```json
{
  "months": 6,
  "data": [
    {
      "month": "Feb 2026",
      "data": {
        "Transport": 238.5,
        "Dining": 156.2,
        "Utilities": 95.1,
        "Travel": 62.3
      }
    }
  ]
}
```

#### 3. Get Carbon by Category
```
GET /api/v1/carbon-footprint/categories
```

**Response:**
```json
{
  "categories": {
    "Transport": {
      "totalCO2e": 238.7,
      "avgCO2ePerTransaction": 12.3,
      "transactionCount": 19,
      "totalSpent": 950.0
    },
    "Dining": {
      "totalCO2e": 136.8,
      "avgCO2ePerTransaction": 8.5,
      "transactionCount": 16,
      "totalSpent": 228.0
    }
  }
}
```

#### 4. Get Carbon Benchmarks
```
GET /api/v1/carbon-footprint/benchmarks
```

**Response:**
```json
{
  "yourFootprint": 620.0,
  "nationalAverage": 833.0,
  "euTarget": 500.0,
  "parisAgreementTarget": 430.0,
  "maxScale": 1200,
  "comparison": {
    "vsNationalAverage": -25.6,
    "vsEUTarget": 24.0,
    "vsParisTarget": 44.2
  }
}
```

### MCC Data Endpoints

#### 5. Get Distinct MCC Codes
```
GET /api/v1/carbon-footprint/mcc/distinct
```

**Response:**
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
    "mcc_code": "4111",
    "description": "Local and Suburban Commuter Transportation",
    "high_level_category": "Transport & Travel",
    "emission_factor": 0.25,
    "transaction_count": 19
  }
]
```

#### 6. Get MCCs by Category
```
GET /api/v1/carbon-footprint/mcc/categories
```

**Response:**
```json
{
  "Dining": [
    {
      "mcc_code": "5812",
      "description": "Eating Places and Restaurants",
      "high_level_category": "Dining",
      "emission_factor": 0.6,
      "transaction_count": 16
    },
    {
      "mcc_code": "5814",
      "description": "Fast Food Restaurants",
      "high_level_category": "Dining",
      "emission_factor": 0.6,
      "transaction_count": 8
    }
  ],
  "Transport & Travel": [...]
}
```

#### 7. Get MCC Statistics
```
GET /api/v1/carbon-footprint/mcc/stats
```

**Response:**
```json
{
  "totalDistinctMCCs": 45,
  "totalCategories": 9,
  "totalTransactions": 250,
  "categories": [
    "Dining",
    "Transport & Travel",
    "Utilities",
    "Retail"
  ],
  "emissionFactorRange": {
    "min": 0.15,
    "max": 2.31
  }
}
```

## Data Analysis Utility

### Running MCC Analysis Report

Generate a detailed report of distinct MCC codes with carbon mapping:

```bash
python backend/utils/mcc_analysis.py
```

This generates:
1. **mcc_carbon_report.json** - Complete report with all MCCs grouped by category
2. **mcc_carbon_mapping_summary.csv** - CSV export for further analysis
3. Console output with summary statistics

**Output includes:**
- Total distinct MCCs and transactions
- Mapping coverage percentage
- Top MCCs by transaction count
- Unmapped MCCs (if any)
- Emission factors by category

## Backend Architecture

### Services (`backend/services/carbon_services.py`)

**CarbonFootprintService Class:**
- `calculate_carbon_footprint()` - Calculate total emissions
- `get_carbon_by_category()` - Breakdown by category
- `get_carbon_trend()` - Historical trends
- `get_carbon_benchmarks()` - Comparisons with targets
- `get_distinct_mcc_codes()` - List all MCCs in data
- `get_mcc_by_category()` - MCCs grouped by category

### Routes (`backend/routes/carbon_routes.py`)

RESTful endpoints for:
- Carbon footprint analytics
- MCC data and mapping
- Statistics and benchmarks

## Frontend Integration

### API Service (`frontend/src/services/api.js`)

```javascript
// Carbon footprint functions
await getCarbonFootprint()
await getCarbonTrend()
await getCarbonByCategory()
await getCarbonBenchmarks()

// MCC data functions
await getDistinctMCCs()
await getMCCByCategory()
await getMCCStats()
```

## Configuration

### Environment Variables (Frontend)

Set in `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_USE_MOCK=false
```

- `VITE_API_BASE_URL`: Backend API base URL
- `VITE_USE_MOCK`: Set to false to use real API calls

### Running the Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
python -m uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

## Data Quality Notes

1. **Unmapped MCCs**: Some MCCs in transaction data may not exist in the carbon mapping dataset. These are assigned a default emission factor of 0.5 kgCO2e/EUR.

2. **Category Coverage**: Emission factors are specific to Europe and may vary by region.

3. **Accuracy**: Calculations assume linear relationship between spending and emissions. Actual emissions may vary based on specific products/services.

## Example Use Cases

### 1. Customer Carbon Dashboard
```javascript
const footprint = await getCarbonFootprint();
const byCategory = await getCarbonByCategory();
const benchmarks = await getCarbonBenchmarks();

// Display total emissions, breakdown, and progress
```

### 2. MCC Analysis Report
```javascript
const distinctMCCs = await getDistinctMCCs();
const byCategory = await getMCCByCategory();
const stats = await getMCCStats();

// Create detailed MCC mapping report
```

### 3. Category-based Recommendations
```javascript
const categories = await getCarbonByCategory();
// Identify highest emission categories
// Generate targeted recommendations
```

## Performance Considerations

- Transaction data is cached in memory for quick access
- Lazy loading of data files (on first request)
- CSV parsing optimized with pandas
- Aggregate calculations (groupby, sum) performed at request time

## Future Enhancements

1. **Time-based Filtering**: Add date range filters to analytics
2. **Merchant-level Mapping**: Map specific merchants beyond MCC categories
3. **Scope Emissions**: Breakdown Scope 1, 2, and 3 emissions
4. **Recommendations Engine**: AI-powered suggestions based on patterns
5. **Data Export**: Generate detailed reports (PDF, Excel)
6. **Benchmarking**: Compare against industry peers
