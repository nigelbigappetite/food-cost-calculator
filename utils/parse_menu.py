import pandas as pd

def parse_menu_prices(df: pd.DataFrame) -> pd.DataFrame:
    """
    Parse and normalize menu prices data.
    Expects standardized template: Item Name, Selling Price
    
    Args:
        df: Raw menu prices DataFrame
        
    Returns:
        pd.DataFrame: Normalized menu prices data
    """
    # Clean column names
    df.columns = df.columns.str.strip()
    
    # Check if we have the standardized template columns
    if "Item Name" in df.columns and "Selling Price" in df.columns:
        # Use standardized template format
        df = df.rename(columns={
            "Item Name": "Menu Item",
            "Selling Price": "Selling Price (£)"
        })
    else:
        # Fallback to old mapping for backward compatibility
        column_mapping = {}
        
        # Find menu item column (various names)
        for col in df.columns:
            if any(word in col.lower() for word in ["menu item", "name", "item"]):
                column_mapping[col] = "Menu Item"
                break
        
        # Find selling price column (various names)
        for col in df.columns:
            if any(word in col.lower() for word in ["selling price", "price"]):
                column_mapping[col] = "Selling Price (£)"
                break
        
        # Rename columns
        df = df.rename(columns=column_mapping)
    
    # Convert selling price to numeric
    if "Selling Price (£)" in df.columns:
        df["Selling Price (£)"] = pd.to_numeric(df["Selling Price (£)"], errors='coerce')
    
    return df
