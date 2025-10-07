from fastapi import FastAPI, UploadFile, File
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import pandas as pd
import io
from utils.detect_type import detect_file_type
from utils.parse_costings import parse_costings
from utils.parse_recipes import parse_recipes
from utils.parse_menu import parse_menu_prices
from utils.calculator import calculate_gp
from utils.html_formatter import make_html_table

app = FastAPI(title="Hungry Tum | Food Cost Generator")

# Allow browser access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# In-memory store
db = {"costings": None, "recipes": None, "menu": None, "results": None}

@app.post("/upload")
async def upload_files(files: list[UploadFile] = File(...)):
    """
    Upload and process CSV/XLSX files.
    Auto-detects file types and calculates food costs.
    """
    try:
        print(f"Received {len(files)} files for upload")
        
        # Reset database
        db["costings"] = None
        db["recipes"] = None
        db["menu"] = None
        db["results"] = None
        
        # Process each uploaded file
        for i, file in enumerate(files):
            print(f"Processing file {i+1}: {file.filename}")
            content = await file.read()
            file_type = detect_file_type(content, file.filename)
            print(f"File {file.filename} detected as: {file_type}")
            
            # Parse based on file extension
            if file.filename.endswith(".csv"):
                df = pd.read_csv(io.BytesIO(content))
            else:
                df = pd.read_excel(io.BytesIO(content))
            
            print(f"File {file.filename} has {len(df)} rows and columns: {list(df.columns)}")
            
            # Store based on detected type
            if file_type == "costings":
                db["costings"] = parse_costings(df)
                print(f"Stored costings data: {len(db['costings'])} rows")
            elif file_type == "recipes":
                db["recipes"] = parse_recipes(df)
                print(f"Stored recipes data: {len(db['recipes'])} rows")
            elif file_type == "menu":
                db["menu"] = parse_menu_prices(df)
                print(f"Stored menu data: {len(db['menu'])} rows")
            else:
                print(f"Warning: Could not detect type for {file.filename}")
        
        # Debug: Check what we have
        print(f"Final state - Costings: {db['costings'] is not None}, Recipes: {db['recipes'] is not None}, Menu: {db['menu'] is not None}")
        
        # Validate required data
        if db["costings"] is None or db["recipes"] is None:
            error_msg = f"Need at least costings and recipes data. Got: costings={db['costings'] is not None}, recipes={db['recipes'] is not None}, menu={db['menu'] is not None}"
            print(error_msg)
            return JSONResponse({"error": error_msg}, status_code=400)
        
        # Calculate results (now returns brand-grouped data)
        brand_results = calculate_gp(db["costings"], db["recipes"], db["menu"])
        db["results"] = brand_results
        
        print(f"Calculated results for brands: {list(brand_results.keys())}")
        
        # Generate HTML table with brand sections
        html_table = make_html_table(brand_results)
        
        return HTMLResponse(content=html_table)
        
    except Exception as e:
        print(f"Upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)

@app.get("/results")
async def get_results():
    """Get results as JSON."""
    if db["results"] is None:
        return JSONResponse({"error": "No results yet. Upload files first."}, status_code=400)
    return db["results"]

@app.get("/query")
async def query_data(q: str):
    """
    Query data using natural language.
    Examples: "cheese cost", "chicken pizza gp", "items under 70"
    """
    if db["results"] is None:
        return JSONResponse({"error": "No data loaded."}, status_code=400)
    
    q_low = q.lower()
    
    # 1) Ingredient cost lookup
    if any(word in q_low for word in ["cost", "price"]) and db["costings"] is not None:
        for _, r in db["costings"].iterrows():
            if r["Ingredient"].lower() in q_low:
                return {
                    "Ingredient": r["Ingredient"], 
                    "Unit Cost (£)": round(r["UnitCost"], 4)
                }
    
    # 2) Menu item GP lookup
    if "gp" in q_low or "margin" in q_low:
        for brand, brand_data in db["results"].items():
            for item in brand_data:
                if item["Menu Item"].lower() in q_low:
                    return {
                        "Brand": item["Brand"],
                        "Menu Item": item["Menu Item"],
                        "Food Cost (£)": item["Food Cost (£)"],
                        "GP £": item["GP £"],
                        "GP %": item["GP %"]
                    }
    
    # 3) Filter by GP threshold
    import re
    m = re.search(r"under\s*(\d+)", q_low)
    if m:
        threshold = float(m.group(1))
        results = []
        for brand, brand_data in db["results"].items():
            for item in brand_data:
                if item["GP %"] < threshold:
                    results.append(item)
        return results
    
    return {"message": "Query not recognised. Try: 'cheese cost', 'chicken pizza gp', or 'items under 70'"}

@app.get("/")
async def home():
    """Main page with direct input and file upload interface."""
    return HTMLResponse("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hungry Tum | Food Cost Generator</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
                max-width: 1200px; 
                margin: 0 auto; 
                padding: 20px; 
                background: #f8f9fa;
                line-height: 1.6;
            }
            .header { 
                background: linear-gradient(135deg, #2c3e50, #34495e); 
                color: white; 
                padding: 40px; 
                border-radius: 12px; 
                text-align: center; 
                margin-bottom: 30px; 
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            }
            .tabs {
                display: flex;
                margin-bottom: 20px;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 16px rgba(0,0,0,0.05);
            }
            .tab {
                flex: 1;
                padding: 20px;
                text-align: center;
                cursor: pointer;
                background: #f8f9fa;
                border: none;
                font-size: 16px;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            .tab.active {
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
            }
            .tab:hover {
                background: #e9ecef;
            }
            .tab.active:hover {
                background: linear-gradient(135deg, #2980b9, #1f618d);
            }
            .tab-content {
                display: none;
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.05);
            }
            .tab-content.active {
                display: block;
            }
            .form-group {
                margin-bottom: 20px;
            }
            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #2c3e50;
            }
            .form-group input, .form-group select {
                width: 100%;
                padding: 12px;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                font-size: 16px;
                transition: border-color 0.3s ease;
            }
            .form-group input:focus, .form-group select:focus {
                outline: none;
                border-color: #3498db;
            }
            .ingredient-row, .menu-row {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 1fr auto;
                gap: 10px;
                align-items: end;
                margin-bottom: 10px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #e9ecef;
            }
            .ingredient-row input, .menu-row input, .ingredient-row select, .menu-row select {
                margin: 0;
            }
            .remove-btn {
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 12px;
                cursor: pointer;
                font-size: 14px;
            }
            .remove-btn:hover {
                background: #c0392b;
            }
            .btn {
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
                padding: 16px 32px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
                margin: 10px 5px;
            }
            .btn:hover {
                background: linear-gradient(135deg, #2980b9, #1f618d);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
            }
            .btn-secondary {
                background: linear-gradient(135deg, #95a5a6, #7f8c8d);
            }
            .btn-secondary:hover {
                background: linear-gradient(135deg, #7f8c8d, #6c7b7d);
            }
            .upload-section { 
                background: white; 
                padding: 40px; 
                border-radius: 12px; 
                border: 2px dashed #e9ecef; 
                box-shadow: 0 4px 16px rgba(0,0,0,0.05);
                transition: all 0.3s ease;
            }
            .upload-section:hover { 
                border-color: #3498db; 
                background: #f8f9fa; 
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            }
            input[type="file"] { 
                margin: 15px 0; 
                padding: 12px; 
                width: 100%; 
                border: 2px solid #e9ecef; 
                border-radius: 8px; 
                font-size: 16px;
                transition: border-color 0.3s ease;
            }
            input[type="file"]:focus { 
                outline: none; 
                border-color: #3498db; 
            }
            input[type="submit"] { 
                background: linear-gradient(135deg, #3498db, #2980b9); 
                color: white; 
                padding: 16px 32px; 
                border: none; 
                border-radius: 8px; 
                cursor: pointer; 
                font-size: 16px; 
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
            }
            input[type="submit"]:hover { 
                background: linear-gradient(135deg, #2980b9, #1f618d); 
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
            }
            .info { 
                background: #e8f4fd; 
                padding: 20px; 
                border-radius: 8px; 
                margin-top: 20px; 
                border-left: 4px solid #3498db;
            }
            .logo { 
                width: 80px; 
                height: 80px; 
                margin-bottom: 20px; 
            }
            #results {
                margin-top: 30px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div style="margin-bottom: 20px;">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMzgiIGZpbGw9IiNmZjZiMzUiLz4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iOCIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iNTAiIGN5PSIzMCIgcj0iOCIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIgZmlsbD0iYmxhY2siLz4KPGNpcmNsZSBjeD0iNTAiIGN5PSIzMCIgcj0iNCIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTI1IDU1IEMzMCA1MCA0MCA1MCA0MCA1MCBDNDAgNTAgNTAgNTAgNTUgNTUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0yMCAyMCBDMjAgMTUgMjUgMTAgMzAgMTAgQzM1IDEwIDQwIDE1IDQwIDIwIiBzdHJva2U9IiNmZjZiMzUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik00MCAyMCBDNDAgMTUgNDUgMTAgNTAgMTAgQzU1IDEwIDYwIDE1IDYwIDIwIiBzdHJva2U9IiNmZjZiMzUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=" alt="Hungry Tum Logo" class="logo">
            </div>
            <h1 style="margin: 0; font-size: 2.8rem; font-weight: 700; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">HUNGRY TUM</h1>
            <p style="margin: 8px 0 0 0; font-size: 1.1rem; opacity: 0.9; font-weight: 300;">Food Cost Calculator & Profit Analysis</p>
        </div>
        
        <div class="tabs">
            <button class="tab active" onclick="showTab('direct-input')">📝 Direct Input</button>
            <button class="tab" onclick="showTab('csv-upload')">📁 CSV Upload</button>
        </div>
        
        <div id="direct-input" class="tab-content active">
            <h2>🍽️ Create Your Brand & Menu</h2>
            
            <div class="form-group">
                <label for="brand-name">Brand Name</label>
                <input type="text" id="brand-name" placeholder="e.g., SMSH BN, McDonald's, etc.">
            </div>
            
            <h3>📦 Product Prices (Ingredients)</h3>
            <div id="ingredients-container">
                <div class="ingredient-row">
                    <input type="text" placeholder="Item Name (e.g., Cheese)" class="ingredient-name">
                    <input type="number" placeholder="Purchase Price" step="0.01" class="ingredient-price">
                    <input type="number" placeholder="Quantity" step="0.01" class="ingredient-quantity">
                    <input type="text" placeholder="Unit (e.g., kg, slices)" class="ingredient-unit">
                    <button type="button" class="remove-btn" onclick="removeIngredient(this)">Remove</button>
                </div>
            </div>
            <button type="button" class="btn btn-secondary" onclick="addIngredient()">+ Add Ingredient</button>
            
            <h3>🍕 Menu Items & Recipes</h3>
            <div id="menu-container">
                <div class="menu-row">
                    <input type="text" placeholder="Menu Item (e.g., Margherita Pizza)" class="menu-item">
                    <select class="menu-category">
                        <option value="main">Main</option>
                        <option value="side">Side</option>
                        <option value="drink">Drink</option>
                        <option value="dessert">Dessert</option>
                    </select>
                    <input type="number" placeholder="Selling Price" step="0.01" class="menu-price">
                    <input type="text" placeholder="Ingredients (e.g., Cheese: 3 slices; Flour: 0.3 kg)" class="menu-ingredients">
                    <button type="button" class="remove-btn" onclick="removeMenu(this)">Remove</button>
                </div>
            </div>
            <button type="button" class="btn btn-secondary" onclick="addMenu()">+ Add Menu Item</button>
            
            <div style="text-align: center; margin-top: 30px;">
                <button type="button" class="btn" onclick="calculateGP()">🚀 Calculate GP</button>
                <button type="button" class="btn btn-secondary" onclick="clearAll()">🗑️ Clear All</button>
            </div>
            
            <div id="results"></div>
        </div>
        
        <div id="csv-upload" class="tab-content">
            <h2>📊 Upload Your Data Files</h2>
            <form action="/upload" enctype="multipart/form-data" method="post">
                <div class="form-group">
                    <label for="files">Choose CSV/Excel Files</label>
                    <input name="files" type="file" multiple accept=".csv,.xlsx,.xls">
                </div>
                <button type="submit" class="btn">🚀 Upload & Calculate</button>
            </form>
            
            <div class="info">
                <h3>📋 Standardized Templates:</h3>
                <p><strong>Download these templates and fill them with your data:</strong></p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 10px 0;">
                    <p><strong>📄 Product Prices Template:</strong> <a href="/templates/product-prices-template.csv" download>Download CSV</a></p>
                    <p style="margin: 5px 0; font-size: 14px; color: #666;">Columns: Item Name, Purchase Price, Quantity, Unit</p>
                    
                    <p><strong>📄 Recipes Template:</strong> <a href="/templates/recipes-template.csv" download>Download CSV</a></p>
                    <p style="margin: 5px 0; font-size: 14px; color: #666;">Columns: Menu Item, Brand, Category, Ingredient, Quantity, Unit</p>
                    
                    <p><strong>📄 Menu Template:</strong> <a href="/templates/menu-template.csv" download>Download CSV</a></p>
                    <p style="margin: 5px 0; font-size: 14px; color: #666;">Columns: Item Name, Category, Selling Price</p>
                </div>
                
                <h3>📋 File Naming Convention:</h3>
                <p><strong>Name your files using this pattern:</strong></p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 10px 0; font-family: monospace; font-size: 14px;">
                    <strong>Brand Name - Function</strong><br>
                    Examples:<br>
                    • SMSH BN - recipes<br>
                    • SMSH BN - menu<br>
                    • SMSH BN - Product list
                </div>
                
                <p>I'll auto-detect file types, calculate FC, GP £, and GP %, and show results below.</p>
            </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
            <h3>🔍 API Endpoints:</h3>
            <p><a href="/docs">📖 API Documentation</a> | <a href="/results">📊 JSON Results</a></p>
        </div>
        
        <script>
            function showTab(tabName) {
                // Hide all tab contents
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Remove active class from all tabs
                document.querySelectorAll('.tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Show selected tab content
                document.getElementById(tabName).classList.add('active');
                
                // Add active class to clicked tab
                event.target.classList.add('active');
            }
            
            function addIngredient() {
                const container = document.getElementById('ingredients-container');
                const newRow = document.createElement('div');
                newRow.className = 'ingredient-row';
                newRow.innerHTML = `
                    <input type="text" placeholder="Item Name (e.g., Cheese)" class="ingredient-name">
                    <input type="number" placeholder="Purchase Price" step="0.01" class="ingredient-price">
                    <input type="number" placeholder="Quantity" step="0.01" class="ingredient-quantity">
                    <input type="text" placeholder="Unit (e.g., kg, slices)" class="ingredient-unit">
                    <button type="button" class="remove-btn" onclick="removeIngredient(this)">Remove</button>
                `;
                container.appendChild(newRow);
            }
            
            function removeIngredient(button) {
                button.parentElement.remove();
            }
            
            function addMenu() {
                const container = document.getElementById('menu-container');
                const newRow = document.createElement('div');
                newRow.className = 'menu-row';
                newRow.innerHTML = `
                    <input type="text" placeholder="Menu Item (e.g., Margherita Pizza)" class="menu-item">
                    <select class="menu-category">
                        <option value="main">Main</option>
                        <option value="side">Side</option>
                        <option value="drink">Drink</option>
                        <option value="dessert">Dessert</option>
                    </select>
                    <input type="number" placeholder="Selling Price" step="0.01" class="menu-price">
                    <input type="text" placeholder="Ingredients (e.g., Cheese: 3 slices; Flour: 0.3 kg)" class="menu-ingredients">
                    <button type="button" class="remove-btn" onclick="removeMenu(this)">Remove</button>
                `;
                container.appendChild(newRow);
            }
            
            function removeMenu(button) {
                button.parentElement.remove();
            }
            
            function clearAll() {
                document.getElementById('brand-name').value = '';
                document.getElementById('ingredients-container').innerHTML = `
                    <div class="ingredient-row">
                        <input type="text" placeholder="Item Name (e.g., Cheese)" class="ingredient-name">
                        <input type="number" placeholder="Purchase Price" step="0.01" class="ingredient-price">
                        <input type="number" placeholder="Quantity" step="0.01" class="ingredient-quantity">
                        <input type="text" placeholder="Unit (e.g., kg, slices)" class="ingredient-unit">
                        <button type="button" class="remove-btn" onclick="removeIngredient(this)">Remove</button>
                    </div>
                `;
                document.getElementById('menu-container').innerHTML = `
                    <div class="menu-row">
                        <input type="text" placeholder="Menu Item (e.g., Margherita Pizza)" class="menu-item">
                        <select class="menu-category">
                            <option value="main">Main</option>
                            <option value="side">Side</option>
                            <option value="drink">Drink</option>
                            <option value="dessert">Dessert</option>
                        </select>
                        <input type="number" placeholder="Selling Price" step="0.01" class="menu-price">
                        <input type="text" placeholder="Ingredients (e.g., Cheese: 3 slices; Flour: 0.3 kg)" class="menu-ingredients">
                        <button type="button" class="remove-btn" onclick="removeMenu(this)">Remove</button>
                    </div>
                `;
                document.getElementById('results').innerHTML = '';
            }
            
            async function calculateGP() {
                const brandName = document.getElementById('brand-name').value;
                if (!brandName) {
                    alert('Please enter a brand name');
                    return;
                }
                
                // Collect ingredients data
                const ingredients = [];
                document.querySelectorAll('.ingredient-row').forEach(row => {
                    const name = row.querySelector('.ingredient-name').value;
                    const price = parseFloat(row.querySelector('.ingredient-price').value);
                    const quantity = parseFloat(row.querySelector('.ingredient-quantity').value);
                    const unit = row.querySelector('.ingredient-unit').value;
                    
                    if (name && !isNaN(price) && !isNaN(quantity) && unit) {
                        ingredients.push({ name, price, quantity, unit });
                    }
                });
                
                // Collect menu data
                const menuItems = [];
                document.querySelectorAll('.menu-row').forEach(row => {
                    const item = row.querySelector('.menu-item').value;
                    const category = row.querySelector('.menu-category').value;
                    const price = parseFloat(row.querySelector('.menu-price').value);
                    const ingredients = row.querySelector('.menu-ingredients').value;
                    
                    if (item && !isNaN(price) && ingredients) {
                        menuItems.push({ item, category, price, ingredients });
                    }
                });
                
                if (ingredients.length === 0) {
                    alert('Please add at least one ingredient');
                    return;
                }
                
                if (menuItems.length === 0) {
                    alert('Please add at least one menu item');
                    return;
                }
                
                // Send data to backend
                try {
                    const response = await fetch('/calculate-direct', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            brand_name: brandName,
                            ingredients: ingredients,
                            menu_items: menuItems
                        })
                    });
                    
                    const result = await response.text();
                    document.getElementById('results').innerHTML = result;
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error calculating GP. Please try again.');
                }
            }
        </script>
    </body>
    </html>
    """)

@app.post("/calculate-direct")
async def calculate_direct(data: dict):
    """Calculate GP from direct input data."""
    try:
        brand_name = data.get("brand_name", "Unknown Brand")
        ingredients_data = data.get("ingredients", [])
        menu_items_data = data.get("menu_items", [])
        
        if not ingredients_data or not menu_items_data:
            return JSONResponse({"error": "Please provide both ingredients and menu items"}, status_code=400)
        
        # Convert to DataFrames
        import pandas as pd
        
        # Create costings DataFrame
        costings_df = pd.DataFrame(ingredients_data)
        costings_df.columns = ["Ingredient", "Our Price (£)", "Pack Size", "Unit"]
        costings_df["Our Price (£)"] = pd.to_numeric(costings_df["Our Price (£)"], errors='coerce')
        costings_df["Pack Size"] = pd.to_numeric(costings_df["Pack Size"], errors='coerce')
        costings_df = costings_df.dropna()
        
        # Create recipes DataFrame
        recipes_data = []
        for menu_item in menu_items_data:
            item_name = menu_item["item"]
            category = menu_item["category"]
            ingredients_str = menu_item["ingredients"]
            
            # Parse ingredients string (e.g., "Cheese: 3 slices; Flour: 0.3 kg")
            if ingredients_str:
                ingredient_parts = ingredients_str.split(";")
                for part in ingredient_parts:
                    part = part.strip()
                    if ":" in part:
                        ingredient_name, qty_unit = part.split(":", 1)
                        ingredient_name = ingredient_name.strip()
                        qty_unit = qty_unit.strip()
                        
                        # Split quantity and unit
                        qty_unit_parts = qty_unit.split()
                        if len(qty_unit_parts) >= 2:
                            qty = qty_unit_parts[0]
                            unit = " ".join(qty_unit_parts[1:])
                        else:
                            qty = qty_unit_parts[0] if qty_unit_parts else "0"
                            unit = "unit"
                        
                        recipes_data.append({
                            "Menu Item": item_name,
                            "Brand": brand_name,
                            "Category": category,
                            "Ingredient": ingredient_name,
                            "Quantity": qty,
                            "Unit": unit
                        })
        
        recipes_df = pd.DataFrame(recipes_data)
        if not recipes_df.empty:
            recipes_df["Quantity"] = pd.to_numeric(recipes_df["Quantity"], errors='coerce')
            recipes_df = recipes_df.dropna()
            
            # Group by menu item and create ingredients string
            recipes_grouped = recipes_df.groupby(["Menu Item", "Brand", "Category"]).apply(
                lambda x: "; ".join([f"{row['Ingredient']}: {row['Quantity']} {row['Unit']}" 
                                   for _, row in x.iterrows()])
            ).reset_index()
            recipes_grouped.columns = ["Menu Item", "Brand", "Category", "Ingredients (qty+unit)"]
            recipes_df = recipes_grouped
        
        # Create menu DataFrame
        menu_df = pd.DataFrame(menu_items_data)
        menu_df.columns = ["Menu Item", "Category", "Selling Price (£)"]
        menu_df["Selling Price (£)"] = pd.to_numeric(menu_df["Selling Price (£)"], errors='coerce')
        menu_df["Brand"] = brand_name
        menu_df = menu_df.dropna()
        
        # Store in database
        db["costings"] = costings_df
        db["recipes"] = recipes_df
        db["menu"] = menu_df
        
        # Calculate GP
        from utils.calculator import calculate_gp
        brand_results = calculate_gp(costings_df, recipes_df, menu_df)
        
        # Store results
        db["results"] = brand_results
        
        # Format as HTML
        from utils.html_formatter import make_html_table
        html_result = make_html_table(brand_results)
        
        return HTMLResponse(html_result)
        
    except Exception as e:
        print(f"Error in calculate_direct: {e}")
        return JSONResponse({"error": f"Calculation error: {str(e)}"}, status_code=500)

@app.get("/templates/{filename}")
async def download_template(filename: str):
    """Download template files."""
    from fastapi.responses import FileResponse
    import os
    
    template_path = f"templates/{filename}"
    if os.path.exists(template_path):
        return FileResponse(template_path, filename=filename)
    else:
        return JSONResponse({"error": "Template not found"}, status_code=404)

@app.get("/api")
async def api_info():
    """API information endpoint."""
    return {"message": "Upload your CSV/XLSX files to /upload then GET /results or /query?q=..."}