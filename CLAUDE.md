# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **Russian sales analytics web application** that processes Excel files to analyze sales data by geographic regions. The application automatically maps Russian cities to federal districts and provides interactive visualizations and filtering capabilities.

## Application Architecture

### Core Components

The application consists of two main files:

1. **`index_excel.html`** - **PRIMARY APPLICATION**
   - Full Excel (.xlsx) support with robust error handling
   - Uses external CDN libraries (XLSX.js, Bootstrap 5)
   - Enhanced status reporting and diagnostics
   - Progressive library loading with fallback mechanisms
   - Pivot table visualization (products × warehouses)
   - Excel export functionality

2. **`app.js`** - **CORE APPLICATION LOGIC**
   - Comprehensive Excel file processing with enhanced column detection
   - Two-stage city→region→warehouse mapping system
   - Fuzzy string matching for city/region lookup
   - Flexible column name matching for various Excel formats
   - Real-time data validation and error handling
   - Dynamic pivot table generation and Excel export

### Core Data Processing Flow

1. **Initialization** → Load city-to-region mapping (города.txt) and region-to-warehouse mapping (склады.txt)
2. **File Upload** → Excel (.xlsx) file parsing using XLSX.js library
3. **Column Detection** → Flexible detection of City, Product, Nomenclature (optional), Quantity, Amount columns
4. **Two-Stage Mapping** →
   - Stage 1: City → Region (using города.txt with fuzzy matching)
   - Stage 2: Region → Warehouse (using склады.txt with fuzzy matching)
   - Fallback: "МОСКВА ЧЕХОВ\ДОРОЖНАЯ" if mapping fails
5. **Data Aggregation** → Groups sales by products and warehouses
6. **Visualization** → Pivot table (rows=products, columns=warehouses) with quantity/amount in cells
7. **Dynamic Filtering** → Multiple product/warehouse filters with real-time updates
8. **Excel Export** → Export pivot table to .xlsx format

### Key Data Structures

- **`cityToRegion`** object: Maps 130+ Russian cities to their administrative regions (loaded from города.txt)
- **`regionToWarehouse`** object: Maps Russian regions to warehouse locations (loaded from склады.txt)
- **`salesData`** array: Processed records with structure `{city, warehouse, product, nomenclature, quantity, amount}`
- **Pivot structure**: Nested object `{product: {warehouse: {quantity, amount}}}`

### Two-Stage Warehouse Mapping System

The application uses a sophisticated two-stage mapping to determine warehouse locations:

1. **City → Region Mapping** (города.txt, 130+ cities):
   - Format: `Город:Регион`
   - Example: `Москва:Московская область`
   - Uses normalized string matching (lowercase, trim)
   - Supports partial matching with longest-match-wins strategy

2. **Region → Warehouse Mapping** (склады.txt, 68 regional mappings):
   - Format: `Регион:Склад`
   - Example: `Московская область:МОСКВА ЧЕХОВ\ДОРОЖНАЯ`
   - Special case: Sankt Petersburg and Leningrad Oblast → `САНКТ-ПЕТЕРБУРГ ШУШАРЫ/ПАРГОЛОВО`
   - Uses normalized string matching with partial fallback

3. **Fuzzy Matching Logic** (app.js:522-629):
   - First attempts direct exact match (normalized)
   - Falls back to partial string matching (includes)
   - Selects longest matching string to avoid ambiguity
   - Returns default warehouse `МОСКВА ЧЕХОВ\ДОРОЖНАЯ` if no match found
   - Extensive console logging for debugging

### Column Detection System

The application uses enhanced column detection supporting various naming conventions (app.js:360-364):
```javascript
// Supported column name patterns:
cityIndex = findColumnIndex(headers, ['город', 'city', 'City', 'ГОРОД', 'город доставки']);
productIndex = findColumnIndex(headers, ['товар', 'product', 'наименование', 'Product', 'ТОВАР', 'название']);
nomenclatureIndex = findColumnIndex(headers, ['номенклатура', 'nomenclature', 'артикул', 'код', 'Номенклатура', 'НОМЕНКЛАТУРА']);
quantityIndex = findColumnIndex(headers, ['количество', 'quantity', 'кол-во', 'Quantity', 'КОЛИЧЕСТВО', 'qty', 'доставлено шт', 'заказано шт']);
amountIndex = findColumnIndex(headers, ['сумма', 'amount', 'стоимость', 'Amount', 'СУММА', 'price', 'цена', 'общая сумма', 'итого', 'доставлено руб', 'заказано руб']);
```

### Nomenclature Support

When a "Номенклатура" (nomenclature/article code) column is present:
- Product names are formatted as: `${nomenclature} - ${product}`
- If nomenclature is empty, only product name is used
- Nomenclature automatically flows through to pivot table and Excel export
- Nomenclature is stored separately in salesData for potential future use

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
- **City** (Город доставки): `город`, `city`, `City`, `ГОРОД`, `город доставки`
- **Product** (Товар): `товар`, `product`, `наименование`, `Product`, `ТОВАР`, `название`

### Optional Columns:
- **Nomenclature** (Номенклатура): `номенклатура`, `nomenclature`, `артикул`, `код`, `Номенклатура`, `НОМЕНКЛАТУРА`
- **Quantity** (Количество): `количество`, `quantity`, `кол-во`, `Quantity`, `КОЛИЧЕСТВО`, `qty`, `доставлено шт`, `заказано шт`
- **Amount** (Сумма): `сумма`, `amount`, `стоимость`, `Amount`, `СУММА`, `price`, `цена`, `общая сумма`, `итого`, `доставлено руб`, `заказано руб`

### Data Processing Notes
- Numeric values are cleaned of currency symbols (₽, $, €) and spaces
- Comma decimal separators are converted to dots
- Empty or invalid amounts default to 0
- Empty or invalid quantities default to 1
- Product names combine nomenclature and product: `${nomenclature} - ${product}` (if nomenclature exists)

## Warehouse Distribution System

The application maps Russian cities to warehouses through administrative regions:

### Warehouses in the System:
- **Екатеринбург Южный** (Yekaterinburg South) - Ural region
- **Краснодар Индустриальный** (Krasnodar Industrial) - Southern region
- **Новосибирск Планетная** (Novosibirsk Planetnaya) - Siberian/Far Eastern regions
- **Санкт-Петербург Шушары/Парголово** (St. Petersburg Shushary/Pargologo) - Northwestern region
- **Ростов Грушевская** (Rostov Grushevskaya) - Southern region (alternative)
- **МОСКВА ЧЕХОВ\ДОРОЖНАЯ** (Moscow Chekhov\Dorozhnaya) - Default/Central region

### Configuration Files:
- **города.txt** - 130+ cities mapped to administrative regions
- **склады.txt** - 68 administrative regions mapped to warehouses

Unknown cities automatically use default warehouse: `МОСКВА ЧЕХОВ\ДОРОЖНАЯ`

## Visualization and Export

### Pivot Table (app.js:693-827)
The application generates a dynamic pivot table:
- **Rows**: Products (with nomenclature if available)
- **Columns**: Warehouses (dynamically detected from data)
- **Cells**: Display both quantity (штуки) and amount (рубли)
- **Totals**: Row totals (per product) and column totals (per warehouse)
- **Grand Total**: Combined totals in bottom-right cell
- **Styling**: Lime-green accent color for totals, custom Bootstrap theme

### Excel Export (app.js:829-942)
The export function:
- Generates Excel file matching pivot table structure
- Includes all filtered data (respects product/warehouse filters)
- Formats cells with combined quantity/amount: `${quantity} шт / ${amount} ₽`
- Auto-sizes columns for readability
- Names file with current date: `Матрица_продаж_YYYY-MM-DD.xlsx`

## Browser Compatibility Notes

- Uses modern JavaScript (ES6+) features
- Requires FileReader API for file processing
- XLSX.js library for Excel file parsing and generation
- Bootstrap 5 for UI styling (CDN-based)
- Async/await for file loading operations

## Troubleshooting Common Issues

### Library Loading Issues
- **"XLSX библиотека не загружена"** → Verify internet connection for XLSX.js CDN access
- Check browser console (F12) for CDN loading errors

### Data Processing Issues
- **"Не найдены обязательные колонки"** → Check column names match expected patterns (see Column Detection System)
- **All amounts showing as "0,00 рублей"** → Verify amount column naming and numeric formatting
- **No data loaded** → Ensure Excel file has data rows beyond headers
- **All warehouses showing default "МОСКВА ЧЕХОВ\ДОРОЖНАЯ"** →
  - Verify города.txt and склады.txt are loading successfully (check console logs)
  - Ensure city names in Excel match those in города.txt (fuzzy matching handles minor differences)
  - Check browser console for detailed mapping diagnostics

### Warehouse Mapping Debugging
The application provides extensive console logging:
- `ℹ️ Загружено городов: N` - Confirms города.txt loaded successfully
- `ℹ️ Загружено складов: N` - Confirms склады.txt loaded successfully
- `✅ Прямое совпадение: "city" → область "region"` - Successful exact match
- `🔍 Частичное совпадение: "city" → "matched_city" → область "region"` - Successful fuzzy match
- `❌ Город "city" не найден в маппинге` - City not found, using default warehouse

### File Format Issues
- **Excel parsing errors** → Ensure file is valid .xlsx format, not corrupted
- **Empty data after processing** → Check that file contains required City and Product columns

## Extending the Application

### Adding New Cities
Add entries to **города.txt** file (format: `Город:Регион`):
```
Новый город:Соответствующая область
```
The application loads this file on initialization. No code changes required.

### Adding New Warehouses
Add entries to **склады.txt** file (format: `Регион:Склад`):
```
Соответствующая область:Название склада
```
The application loads this file on initialization. No code changes required.

### Adding New Column Patterns
To support new column naming conventions, update the arrays in `processSalesData()` (app.js:360-364):
```javascript
const cityIndex = findColumnIndex(headers, ['город', 'city', 'новое_название']);
```

### Changing Default Warehouse
Modify the `defaultWarehouse` constant in `getWarehouseByRegion()` function (app.js:523):
```javascript
const defaultWarehouse = 'МОСКВА ЧЕХОВ\\ДОРОЖНАЯ';
```

## Key Architectural Decisions

### Why External Mapping Files?
The application uses **города.txt** and **склады.txt** instead of hardcoding mappings in JavaScript:
- **Easy Updates**: Non-technical users can update city/warehouse mappings without modifying code
- **Version Control Friendly**: Changes to mappings are easily tracked in git
- **Fallback Support**: Embedded fallback data in app.js ensures offline functionality
- **Scalability**: Can easily handle hundreds of cities without code bloat

### Why Fuzzy Matching?
City names in Excel files often have inconsistencies:
- Variations in spelling, case, or spacing
- Additional qualifiers (e.g., "город Москва" vs "Москва")
- Longest-match-wins prevents ambiguous matches (e.g., "Нижний Новгород" vs "Новгород")

### Why Pivot Table Instead of Charts?
The pivot table provides better utility for business analysis:
- Shows exact quantities and amounts per product/warehouse combination
- Easy to identify gaps (empty cells indicate no sales)
- Supports multi-select filtering on both dimensions
- Export functionality preserves all data for further analysis
- More actionable than aggregate visualizations

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.