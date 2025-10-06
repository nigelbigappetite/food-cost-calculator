import pandas as pd

def parse_menu_prices(df: pd.DataFrame) -> pd.DataFrame:
    """
    Parse and normalize menu prices data.
    
    Args:
        df: Raw menu prices DataFrame
        
    Returns:
        pd.DataFrame: Normalized menu prices data
    """
    # Clean column names
    df.columns = df.columns.str.strip()
    
    return df
