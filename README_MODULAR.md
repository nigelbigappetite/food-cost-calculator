# 👹 Hungry Tum Food Cost Calculator - Modular Edition

A self-contained, modular Food Cost Calculator built with FastAPI that can run locally or be hosted on Vercel/Render.

## 🚀 Features

- **Auto-detects file types** (CSV/XLSX) - no need to specify which file is which
- **Calculates Food Cost (£), GP £, GP %** with intelligent assumptions
- **Returns both JSON API and HTML table** for different use cases
- **Live query system** with natural language support
- **Color-coded results** (green = good margins, red = low margins)
- **Modular architecture** for easy maintenance and extension

## 📁 Project Structure

```
project/
├── main.py                # FastAPI application
├── utils/
│   ├── __init__.py
│   ├── detect_type.py     # Auto-detects file types
│   ├── parse_costings.py  # Costings data parser
│   ├── parse_recipes.py   # Recipes data parser
│   ├── parse_menu.py      # Menu prices parser
│   ├── calculator.py      # Core FC/GP calculation logic
│   └── html_formatter.py  # Color-coded HTML table generator
├── requirements.txt       # Python dependencies
└── README_MODULAR.md      # This file
```

## 🛠️ Installation & Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the server:**
   ```bash
   python -m uvicorn main:app --reload
   ```

3. **Access the application:**
   - Web Interface: `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`
   - JSON Results: `http://localhost:8000/results`

## 📊 File Format Requirements

### Costings File
```csv
Ingredient,Our Price (£),Pack Size
Cheese,10.00,112
Chicken Breast,15.00,2
Flour,2.50,5
```

### Recipes File
```csv
Menu Item,Brand,Category,Ingredients (qty+unit)
Margherita Pizza,Big Appetite,main,cheese:3 slices;flour:0.3 kg;tomato sauce:0.1 liter
Chicken Wings,Big Appetite,main,chicken breast:0.5 kg;olive oil:0.05 liter
```

### Menu Prices File (Optional)
```csv
Menu Item,Selling Price (£)
Margherita Pizza,12.00
Chicken Wings,8.50
```

## 🔧 API Endpoints

### Upload Files
```bash
POST /upload
Content-Type: multipart/form-data

# Upload multiple files at once
curl -X POST -F "files=@costings.csv" -F "files=@recipes.csv" -F "files=@menu_prices.csv" http://localhost:8000/upload
```

**Response:** Beautiful HTML table with color-coded results

### Get JSON Results
```bash
GET /results
```

**Response:** JSON array of all calculated items

### Query Data
```bash
GET /query?q=your_question
```

**Examples:**
- `?q=cheese cost` - Get ingredient unit cost
- `?q=chicken pizza gp` - Get specific item margins
- `?q=items under 70` - Filter by GP threshold

## 🎨 HTML Output Features

The HTML table includes:
- **Color-coded GP%**: Green (≥70%), Orange (65-69%), Red (<65%)
- **Summary statistics**: Total items, average GP, high/low margin counts
- **Professional styling**: Gradient headers, hover effects, responsive design
- **Notion-ready**: Can be embedded in Notion or other dashboards

## 🧩 Modular Architecture

### File Type Detection (`utils/detect_type.py`)
- Automatically identifies costings, recipes, or menu files
- Handles various column name formats
- Supports both CSV and Excel files

### Parsers (`utils/parse_*.py`)
- **Costings**: Calculates unit costs from pack prices
- **Recipes**: Normalizes ingredient data and handles empty values
- **Menu**: Processes selling prices for GP calculations

### Calculator (`utils/calculator.py`)
- Core food cost calculation logic
- Handles missing ingredients gracefully
- Generates detailed notes for assumptions

### HTML Formatter (`utils/html_formatter.py`)
- Creates beautiful, color-coded tables
- Includes summary statistics
- Professional styling with gradients and animations

## 🚀 Deployment Options

### Local Development
```bash
python -m uvicorn main:app --reload
```

### Production (Vercel)
1. Add `vercel.json` configuration
2. Deploy with `vercel deploy`

### Production (Render)
1. Add `render.yaml` configuration
2. Connect GitHub repository
3. Deploy automatically

## 📈 Sample Results

| Menu Item | Food Cost | Selling Price | GP £ | GP % | Notes |
|-----------|-----------|---------------|------|------|-------|
| Margherita Pizza | £1.02 | £12.00 | £10.98 | 91.5% | - |
| Chicken Wings | £4.30 | £8.50 | £4.20 | 49.4% | - |
| Regular Fries | £0.44 | £3.50 | £3.06 | 87.6% | - |

## 🔍 Query Examples

```bash
# Get ingredient costs
curl "http://localhost:8000/query?q=cheese cost"
# Response: {"Ingredient":"Cheese","Unit Cost (£)":0.0893}

# Get item margins
curl "http://localhost:8000/query?q=chicken pizza gp"
# Response: {"Menu Item":"Chicken Pizza","Food Cost (£)":2.52,"GP £":12.48,"GP %":83.2}

# Filter low-margin items
curl "http://localhost:8000/query?q=items under 70"
# Response: [{"Menu Item":"Chicken Wings","GP %":49.4,...}]
```

## 🎯 Key Benefits

1. **Self-contained**: No external dependencies beyond Python packages
2. **Auto-detection**: Upload any combination of files, system figures out what they are
3. **Dual output**: Both programmatic (JSON) and visual (HTML) results
4. **Intelligent assumptions**: Handles missing data gracefully with clear notes
5. **Modular design**: Easy to extend and maintain
6. **Production-ready**: Can be deployed to Vercel, Render, or any Python hosting

## 🔧 Customization

- **Add new file types**: Extend `detect_type.py`
- **Modify calculations**: Update `calculator.py`
- **Change styling**: Edit `html_formatter.py`
- **Add new queries**: Extend the query logic in `main.py`

---

**Built with ❤️ for Hungry Tum | Food Cost Generator**
