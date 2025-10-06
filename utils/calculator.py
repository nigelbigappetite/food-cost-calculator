import pandas as pd
import re

def calculate_gp(cost_df: pd.DataFrame, rec_df: pd.DataFrame, menu_df: pd.DataFrame = None) -> pd.DataFrame:
    """
    Calculate gross profit for all menu items.
    
    Args:
        cost_df: Costings DataFrame with unit costs
        rec_df: Recipes DataFrame with ingredient quantities
        menu_df: Menu prices DataFrame (optional)
        
    Returns:
        pd.DataFrame: Results with food costs and GP calculations
    """
    results = []
    
    for _, row in rec_df.iterrows():
        # Calculate food cost for this item
        fc, notes = calc_item_cost(row, cost_df)
        
        # Get selling price
        sp = 0
        if menu_df is not None and not menu_df.empty:
            price_match = menu_df[menu_df["Menu Item"].str.lower() == row["Menu Item"].lower()]
            if not price_match.empty:
                sp = price_match.iloc[0]["Selling Price (£)"]
        
        # Calculate GP
        gp = sp - fc if sp else 0
        gp_pct = (gp / sp * 100) if sp else 0
        
        results.append({
            "Brand": row.get("Brand", ""),
            "Menu Item": row["Menu Item"],
            "Category": row.get("Category", ""),
            "Food Cost (£)": round(fc, 2),
            "Selling Price (£)": round(sp, 2),
            "GP £": round(gp, 2),
            "GP %": round(gp_pct, 1),
            "Notes": "; ".join(notes) if notes else ""
        })
    
    return pd.DataFrame(results)

def calc_item_cost(row: pd.Series, cost_df: pd.DataFrame) -> tuple[float, list]:
    """
    Calculate the total food cost for a single menu item.
    
    Args:
        row: Recipe row with ingredients
        cost_df: Costings DataFrame with unit costs
        
    Returns:
        tuple: (total_cost, notes_list)
    """
    ingredients_str = str(row["Ingredients (qty+unit)"])
    total_cost = 0
    notes = []
    
    # Handle empty or NaN ingredients
    if pd.isna(ingredients_str) or ingredients_str.strip() == "" or ingredients_str.lower() == "nan":
        return total_cost, ["No ingredients specified"]
    
    # Parse each ingredient
    for token in [t.strip() for t in ingredients_str.split(";") if t.strip()]:
        try:
            name, qty_unit = token.split(":")
            qty, unit = re.findall(r"([\d\.]+)\s*([a-zA-Z]+)", qty_unit.strip())[0]
            qty = float(qty)
            
            # Find matching ingredient
            ing_match = cost_df[cost_df["Ingredient_norm"].str.contains(name.strip().lower(), na=False)]
            if ing_match.empty:
                notes.append(f"ASSUMED: no match for {name}")
                continue
                
            unit_cost = ing_match.iloc[0]["UnitCost"]
            total_cost += qty * unit_cost
            
        except Exception as e:
            notes.append(f"ASSUMED: {token} ({e})")
    
    return total_cost, notes
