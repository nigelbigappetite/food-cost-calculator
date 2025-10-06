import pandas as pd

def parse_recipes(df: pd.DataFrame) -> pd.DataFrame:
    """
    Parse and normalize recipes data.
    
    Args:
        df: Raw recipes DataFrame
        
    Returns:
        pd.DataFrame: Normalized recipes data
    """
    # Clean column names
    df.columns = df.columns.str.strip()
    
    # Ensure ingredients column is string and handle NaN values
    if "Ingredients (qty+unit)" in df.columns:
        df["Ingredients (qty+unit)"] = df["Ingredients (qty+unit)"].astype(str)
        df["Ingredients (qty+unit)"] = df["Ingredients (qty+unit)"].replace('nan', '')
    
    return df
