import pandas as pd
import io

def detect_file_type(content: bytes, filename: str = None) -> str:
    """
    Detect the type of file based on its content and column headers.
    
    Args:
        content: Raw file content as bytes
        
    Returns:
        str: File type ('costings', 'recipes', 'menu', or 'unknown')
    """
    try:
        # Try CSV first
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        try:
            # Try Excel if CSV fails
            df = pd.read_excel(io.BytesIO(content))
        except Exception as e2:
            print(f"Failed to read file: CSV error: {e}, Excel error: {e2}")
            return "unknown"
    
    # Normalize column headers
    headers = [h.strip().lower() for h in df.columns]
    print(f"Detected headers: {headers}")  # Debug logging
    
    # Check filename for hints
    filename_lower = filename.lower() if filename else ""
    
    # Detection logic based on column patterns
    # Costings: ingredient + pack size + price
    if ("ingredient" in headers or "ingredients" in headers) and ("pack size" in headers or "packsize" in headers or "pack_size" in headers):
        print("Detected as: costings")
        return "costings"
    
    # Costings alternative: ingredient + price/cost columns
    elif ("ingredient" in headers or "ingredients" in headers) and any(word in h for h in headers for word in ["price", "cost", "our price", "unit cost"]):
        print("Detected as: costings (alternative)")
        return "costings"
    
    # Costings pattern: item + pack + price (common for ingredients)
    elif "item" in headers and "pack" in headers and "price" in headers:
        print("Detected as: costings (item+pack+price pattern)")
        return "costings"
    
    # Costings by filename: if filename contains "ingredient" and has price columns
    elif "ingredient" in filename_lower and any(word in h for h in headers for word in ["price", "cost", "item", "pack"]):
        print("Detected as: costings (filename + content)")
        return "costings"
    
    # Menu: selling price + menu item
    elif ("selling price" in headers or any("selling price" in h for h in headers)) and ("menu item" in headers or "item" in headers):
        print("Detected as: menu")
        return "menu"
    
    # Menu alternative: just selling price or price columns (but not item+pack+price)
    elif any("selling price" in h for h in headers) or (any("price" in h for h in headers) and not ("item" in headers and "pack" in headers)):
        print("Detected as: menu (alternative)")
        return "menu"
    
    # Recipes: ingredients + quantities + menu item
    elif ("ingredients" in headers or "ingredient" in headers) and ("qty" in headers or "quantity" in headers or "qty+unit" in headers):
        print("Detected as: recipes")
        return "recipes"
    
    # Alternative recipe detection: menu item + ingredients
    elif "menu item" in headers and ("ingredients" in headers or "ingredient" in headers):
        print("Detected as: recipes")
        return "recipes"
    
    # Another recipe pattern: menu item + brand + category
    elif "menu item" in headers and "brand" in headers and "category" in headers:
        print("Detected as: recipes")
        return "recipes"
    
    # Recipe alternative: menu item + any food-related columns
    elif "menu item" in headers and len([h for h in headers if any(word in h for word in ["ingredient", "price", "cost", "qty", "quantity", "brand", "category"])]) > 0:
        print("Detected as: recipes (fallback)")
        return "recipes"
    
    # Last resort: if it has ingredient columns, assume costings
    elif "ingredient" in headers or "ingredients" in headers:
        print("Detected as: costings (last resort)")
        return "costings"
    
    print(f"Could not detect file type. Headers: {headers}")
    return "unknown"
