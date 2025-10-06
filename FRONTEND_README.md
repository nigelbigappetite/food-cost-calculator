# 👹 Hungry Tum Food Cost Calculator - Frontend

## 🚀 Quick Start

1. **Start the API server:**
   ```bash
   ./start_api.sh
   # or
   python3 -m uvicorn main:app --reload
   ```

2. **Open your browser:**
   ```
   http://localhost:8000
   ```

## 📊 Features

### File Upload Interface
- **Drag & Drop** file upload for 3 CSV files
- **Real-time validation** and error handling
- **Progress indicators** during processing

### Results Dashboard
- **Interactive table** with all calculated food costs
- **Color-coded GP%** (green for good margins, red for low margins)
- **Export to CSV** functionality
- **Responsive design** for mobile and desktop

### Smart Query System
- **Natural language queries** like:
  - "cheese cost" - Get ingredient unit costs
  - "chicken pizza gp" - Get specific item margins
  - "items under 70% GP" - Filter by margin threshold
- **Real-time search** with instant results

## 📁 Required CSV Files

### 1. Costings File (`costings.csv`)
```csv
Ingredient,Our Price (£),Pack Size
Cheese,10.00,112
Chicken Breast,15.00,2
Flour,2.50,5
```

### 2. Recipes File (`recipes.csv`)
```csv
Menu Item,Brand,Category,Ingredients (qty+unit)
Margherita Pizza,Big Appetite,main,cheese:3 slices;flour:0.3 kg;tomato sauce:0.1 liter
Chicken Wings,Big Appetite,main,chicken breast:0.5 kg;olive oil:0.05 liter
```

### 3. Menu Prices File (`menu_prices.csv`)
```csv
Menu Item,Selling Price (£)
Margherita Pizza,12.00
Chicken Wings,8.50
```

## 🎨 UI Features

- **Modern gradient design** with professional styling
- **Responsive layout** that works on all devices
- **Loading animations** and status indicators
- **Error handling** with clear user feedback
- **Export functionality** for further analysis

## 🔧 Technical Details

- **Pure HTML/CSS/JavaScript** - no frameworks required
- **FastAPI backend** with automatic API documentation
- **CORS enabled** for cross-origin requests
- **File validation** and error handling
- **Real-time updates** without page refresh

## 📱 Mobile Support

The interface is fully responsive and works great on:
- 📱 Mobile phones
- 📱 Tablets  
- 💻 Desktop computers
- 🖥️ Large screens

## 🚀 Next Steps

1. Upload your CSV files using the web interface
2. Review the calculated food costs and margins
3. Use smart queries to analyze specific items
4. Export results for further analysis
5. Adjust pricing based on margin insights

---

**Need help?** Check the API documentation at `http://localhost:8000/docs`
