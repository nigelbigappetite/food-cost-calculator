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

app = FastAPI(title="Big Appetite | Food Cost Generator")

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
        # Process each uploaded file
        for file in files:
            content = await file.read()
            file_type = detect_file_type(content)
            
            # Parse based on file extension
            if file.filename.endswith(".csv"):
                df = pd.read_csv(io.BytesIO(content))
            else:
                df = pd.read_excel(io.BytesIO(content))
            
            # Store based on detected type
            if file_type == "costings":
                db["costings"] = parse_costings(df)
            elif file_type == "recipes":
                db["recipes"] = parse_recipes(df)
            elif file_type == "menu":
                db["menu"] = parse_menu_prices(df)
        
        # Validate required data
        if db["costings"] is None or db["recipes"] is None:
            return JSONResponse(
                {"error": "Need at least costings and recipes data"}, 
                status_code=400
            )
        
        # Calculate results
        db["results"] = calculate_gp(db["costings"], db["recipes"], db["menu"])
        
        # Generate HTML table
        html_table = make_html_table(db["results"])
        
        return HTMLResponse(content=html_table)
        
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@app.get("/results")
async def get_results():
    """Get results as JSON."""
    if db["results"] is None:
        return JSONResponse({"error": "No results yet. Upload files first."}, status_code=400)
    return db["results"].to_dict(orient="records")

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
        for _, r in db["results"].iterrows():
            if r["Menu Item"].lower() in q_low:
                return {
                    "Menu Item": r["Menu Item"],
                    "Food Cost (£)": r["Food Cost (£)"],
                    "GP £": r["GP £"],
                    "GP %": r["GP %"]
                }
    
    # 3) Filter by GP threshold
    import re
    m = re.search(r"under\s*(\d+)", q_low)
    if m:
        threshold = float(m.group(1))
        under = db["results"][db["results"]["GP %"] < threshold]
        return under.to_dict(orient="records")
    
    return {"message": "Query not recognised. Try: 'cheese cost', 'chicken pizza gp', or 'items under 70'"}

@app.get("/")
async def home():
    """Main page with file upload interface."""
    return HTMLResponse("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Big Appetite | Food Cost Generator</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
            .upload-section { background: #f8f9fa; padding: 30px; border-radius: 10px; border: 2px dashed #dee2e6; }
            .upload-section:hover { border-color: #667eea; background: #f0f2ff; }
            input[type="file"] { margin: 10px 0; padding: 10px; width: 100%; border: 1px solid #ddd; border-radius: 5px; }
            input[type="submit"] { background: #667eea; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
            input[type="submit"]:hover { background: #5a6fd8; }
            .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🍽️ Big Appetite</h1>
            <p>Food Cost Calculator & Profit Analysis</p>
        </div>
        
        <div class="upload-section">
            <h2>📊 Upload Your Data Files</h2>
            <form action="/upload" enctype="multipart/form-data" method="post">
                <input name="files" type="file" multiple accept=".csv,.xlsx,.xls">
                <br><br>
                <input type="submit" value="🚀 Upload & Calculate">
            </form>
            
            <div class="info">
                <h3>📋 Supported File Types:</h3>
                <ul>
                    <li><strong>Costings:</strong> Ingredient costs and pack sizes</li>
                    <li><strong>Recipes:</strong> Menu items with ingredient quantities</li>
                    <li><strong>Menu Prices:</strong> Selling prices for menu items</li>
                </ul>
                <p>I'll auto-detect file types, calculate FC, GP £, and GP %, and show results below.</p>
            </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
            <h3>🔍 API Endpoints:</h3>
            <p><a href="/docs">📖 API Documentation</a> | <a href="/results">📊 JSON Results</a></p>
        </div>
    </body>
    </html>
    """)

@app.get("/api")
async def api_info():
    """API information endpoint."""
    return {"message": "Upload your CSV/XLSX files to /upload then GET /results or /query?q=..."}