import pandas as pd
import io

def detect_file_type(content: bytes) -> str:
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
    except:
        try:
            # Try Excel if CSV fails
            df = pd.read_excel(io.BytesIO(content))
        except:
            return "unknown"
    
    # Normalize column headers
    headers = [h.strip().lower() for h in df.columns]
    
    # Detection logic based on column patterns
    if "ingredient" in headers and ("pack size" in headers or "packsize" in headers):
        return "costings"
    elif "selling price" in headers or any("selling price" in h for h in headers):
        return "menu"
    elif "ingredients" in headers and ("qty" in headers or "quantity" in headers):
        return "recipes"
    elif "menu item" in headers and "ingredients" in headers:
        return "recipes"
    elif "menu item" in headers and "brand" in headers and "category" in headers:
        return "recipes"
    
    return "unknown"
