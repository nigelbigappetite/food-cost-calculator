import pandas as pd

def parse_recipes(df: pd.DataFrame) -> pd.DataFrame:
    """
    Parse and normalize recipes data.
    Expects standardized template: Menu Item, Brand, Category, Ingredient, Quantity, Unit
    
    Args:
        df: Raw recipes DataFrame
        
    Returns:
        pd.DataFrame: Normalized recipes data
    """
    # Clean column names
    df.columns = df.columns.str.strip()
    
    # Check if we have the standardized template columns
    if "Menu Item" in df.columns and "Ingredient" in df.columns and "Quantity" in df.columns:
        # Use standardized template format - convert to ingredients string format
        df["Ingredients (qty+unit)"] = df["Ingredient"] + ": " + df["Quantity"].astype(str) + " " + df["Unit"]
        
        # Group by menu item to combine ingredients
        grouped = df.groupby("Menu Item").agg({
            "Brand": "first",
            "Category": "first", 
            "Ingredients (qty+unit)": lambda x: "; ".join(x)
        }).reset_index()
        
        return grouped
    else:
        # Fallback to old format for backward compatibility
        if "Ingredients (qty+unit)" in df.columns:
            df["Ingredients (qty+unit)"] = df["Ingredients (qty+unit)"].astype(str)
            df["Ingredients (qty+unit)"] = df["Ingredients (qty+unit)"].replace('nan', '')
    
    return df
