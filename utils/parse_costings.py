import pandas as pd

def parse_costings(df: pd.DataFrame) -> pd.DataFrame:
    """
    Parse and normalize costings data.
    Expects standardized template: Item Name, Purchase Price, Quantity, Unit
    
    Args:
        df: Raw costings DataFrame
        
    Returns:
        pd.DataFrame: Normalized costings data with unit costs
    """
    # Clean column names
    df.columns = df.columns.str.strip()
    
    # Check if we have the standardized template columns
    if "Item Name" in df.columns and "Purchase Price" in df.columns and "Quantity" in df.columns:
        # Use standardized template format
        df = df.rename(columns={
            "Item Name": "Ingredient",
            "Purchase Price": "Our Price (£)",
            "Quantity": "Pack Size"
        })
    else:
        # Fallback to old mapping for backward compatibility
        column_mapping = {}
        
        # Find ingredient column (various names)
        for col in df.columns:
            if any(word in col.lower() for word in ["ingredient", "name", "item"]):
                column_mapping[col] = "Ingredient"
                break
        
        # Find price column (various names)
        for col in df.columns:
            if any(word in col.lower() for word in ["price", "cost", "our price"]):
                column_mapping[col] = "Our Price (£)"
                break
        
        # Find pack size column (various names)
        for col in df.columns:
            if any(word in col.lower() for word in ["pack", "quantity", "size"]):
                column_mapping[col] = "Pack Size"
                break
        
        # Rename columns
        df = df.rename(columns=column_mapping)
    
    # Check if we have the required columns
    required_cols = ["Ingredient", "Our Price (£)", "Pack Size"]
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}. Available columns: {list(df.columns)}")
    
    # Convert price and quantity to numeric
    df["Our Price (£)"] = pd.to_numeric(df["Our Price (£)"], errors='coerce')
    df["Pack Size"] = pd.to_numeric(df["Pack Size"], errors='coerce')
    
    # Remove rows with invalid data
    df = df.dropna(subset=["Our Price (£)", "Pack Size"])
    
    # Normalize ingredient names for matching
    df["Ingredient_norm"] = df["Ingredient"].str.lower().str.strip()
    
    # Calculate unit cost
    df["UnitCost"] = df["Our Price (£)"] / df["Pack Size"]
    
    return df
