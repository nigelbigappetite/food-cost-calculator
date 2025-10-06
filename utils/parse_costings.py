import pandas as pd

def parse_costings(df: pd.DataFrame) -> pd.DataFrame:
    """
    Parse and normalize costings data.
    
    Args:
        df: Raw costings DataFrame
        
    Returns:
        pd.DataFrame: Normalized costings data with unit costs
    """
    # Clean column names
    df.columns = df.columns.str.strip()
    
    # Normalize ingredient names for matching
    df["Ingredient_norm"] = df["Ingredient"].str.lower().str.strip()
    
    # Calculate unit cost
    df["UnitCost"] = df["Our Price (£)"] / df["Pack Size"]
    
    return df
