# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **Russian sales analytics web application** that processes Excel files to analyze sales data by geographic regions. The application automatically maps Russian cities to federal districts and provides interactive visualizations and filtering capabilities.

## Application Architecture

### Core Components

The application consists of two main files:

1. **`index_excel.html`** - **PRIMARY APPLICATION**
   - Full Excel (.xlsx) support with robust error handling
   - Uses external CDN libraries (Chart.js, XLSX.js, Bootstrap)
   - Enhanced status reporting and diagnostics
   - Progressive library loading with fallback mechanisms
   - Best for production use with stable internet

2. **`app.js`** - **CORE APPLICATION LOGIC**
   - Comprehensive Excel file processing with enhanced column detection
   - Russian city-to-region mapping database (65+ cities)
   - Interactive Chart.js visualizations and filtering
   - Flexible column name matching for various Excel formats
   - Real-time data validation and error handling

### Core Data Processing Flow

1. **File Upload** → Excel (.xlsx) file parsing using XLSX.js library
2. **Column Detection** → Flexible detection of City, Product, Quantity, Amount columns
3. **City-to-Region Mapping** → Built-in database maps 65+ Russian cities to federal districts
4. **Data Aggregation** → Groups sales by regions, products, quantities, and amounts
5. **Visualization** → Interactive pie chart (Chart.js) + sortable statistics table
6. **Dynamic Filtering** → Product/region filters with real-time updates

### Key Data Structures

- **`cityToRegion`** object: Maps Russian city names to federal districts (Центральный, Северо-Западный, etc.)
- **`salesData`** array: Processed records with structure `{city, region, product, quantity, amount}`
- **Regional aggregations**: Dynamically calculated statistics by region

### Column Detection System

The application uses enhanced column detection supporting various naming conventions:
```javascript
// Supported column name patterns:
cityIndex = findColumnIndex(headers, ['город', 'city', 'City', 'ГОРОД', 'город доставки']);
productIndex = findColumnIndex(headers, ['товар', 'product', 'наименование', 'Product', 'ТОВАР', 'название']);
quantityIndex = findColumnIndex(headers, ['количество', 'quantity', 'кол-во', 'Quantity', 'КОЛИЧЕСТВО', 'qty', 'доставлено шт', 'заказано шт']);
amountIndex = findColumnIndex(headers, ['сумма', 'amount', 'стоимость', 'Amount', 'СУММА', 'price', 'цена', 'общая сумма', 'итого', 'доставлено руб', 'заказано руб']);
```

## Common Development Commands

### Testing the Application
```bash
# Open the primary application directly
open index_excel.html

# Serve files locally if needed for testing
python3 -m http.server 8000
# Then visit: http://localhost:8000/index_excel.html
```

### Using Sample Data
```bash
# Use included sample Excel file for testing
ls продажи.xlsx

# View application code structure
cat app.js | head -100  # View initialization and core functions
```

### Debugging Excel File Issues
```bash
# Check browser console (F12) for detailed processing logs
# The application provides extensive logging for:
# - File parsing progress
# - Column detection results
# - Data transformation steps
# - Error diagnostics
```

## Expected Excel Data Format

### Required Columns (flexible naming):
- **City**: `город`, `city`, `City`, `ГОРОД`, `город доставки`
- **Product**: `товар`, `product`, `наименование`, `Product`, `ТОВАР`, `название`

### Optional Columns:
- **Quantity**: `количество`, `quantity`, `кол-во`, `Quantity`, `КОЛИЧЕСТВО`, `qty`, `доставлено шт`, `заказано шт`
- **Amount**: `сумма`, `amount`, `стоимость`, `Amount`, `СУММА`, `price`, `цена`, `общая сумма`, `итого`, `доставлено руб`, `заказано руб`

### Data Processing Notes
- Numeric values are cleaned of currency symbols (₽, $, €) and spaces
- Comma decimal separators are converted to dots
- Empty or invalid amounts default to 0
- Empty or invalid quantities default to 1

## Regional Mapping System

The application includes a comprehensive mapping of Russian cities to federal districts:
- **Центральный** (Central): Moscow, Voronezh, Ryazan, etc.
- **Северо-Западный** (Northwestern): St. Petersburg, Kaliningrad, etc.
- **Южный** (Southern): Rostov-on-Don, Krasnodar, etc.
- **Приволжский** (Volga): Kazan, Samara, Perm, etc.
- **Уральский** (Ural): Yekaterinburg, Chelyabinsk, etc.
- **Сибирский** (Siberian): Novosibirsk, Omsk, etc.
- **Дальневосточный** (Far Eastern): Khabarovsk, Vladivostok, etc.

Unknown cities are automatically categorized as "Другие регионы" (Other regions).

## Error Handling Patterns

- **Library Loading**: Progressive fallback from CDN to offline versions
- **File Processing**: Detailed error messages with suggested solutions
- **Data Validation**: Flexible column name matching with user feedback
- **Status Reporting**: Real-time processing feedback in `index_excel.html`

## Browser Compatibility Notes

- Uses modern JavaScript (ES6+) features
- Requires FileReader API for file processing
- Chart.js for visualizations (or custom canvas implementation offline)
- Bootstrap 5 for UI styling (CDN or self-contained)

## Troubleshooting Common Issues

### Library Loading Issues
- **"Chart is not defined"** → Check internet connection, XLSX library loads Chart.js dynamically
- **"XLSX библиотека не загружена"** → Verify internet connection for CDN access

### Data Processing Issues
- **"Не найдены обязательные колонки"** → Check column names match expected patterns
- **All amounts showing as "0,00 рублей"** → Verify amount column naming and numeric formatting
- **No data loaded** → Ensure Excel file has data rows beyond headers
- **Cities showing as "Другие регионы"** → City names not found in `cityToRegion` mapping

### File Format Issues
- **Excel parsing errors** → Ensure file is valid .xlsx format, not corrupted
- **Empty data after processing** → Check that file contains required City and Product columns

## Extending the Application

### Adding New Cities
To add support for new cities, modify the `cityToRegion` object in `app.js`:
```javascript
const cityToRegion = {
    // existing cities...
    'Новый город': 'Соответствующий федеральный округ'
};
```

### Adding New Column Patterns
To support new column naming conventions, update the arrays in `processSalesData()`:
```javascript
const cityIndex = findColumnIndex(headers, ['город', 'city', 'новое_название']);
```