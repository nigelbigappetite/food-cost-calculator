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
        
        # Calculate results (now returns brand-grouped data)
        brand_results = calculate_gp(db["costings"], db["recipes"], db["menu"])
        db["results"] = brand_results
        
        # Generate HTML table with brand sections
        html_table = make_html_table(brand_results)
        
        return HTMLResponse(content=html_table)
        
    except Exception as e:
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
    """Main page with file upload interface."""
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
                max-width: 900px; 
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