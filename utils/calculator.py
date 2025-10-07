import pandas as pd
import re

def normalize_recipe_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize column names in recipes DataFrame to standard names.
    
    Args:
        df: Raw recipes DataFrame
        
    Returns:
        pd.DataFrame: DataFrame with normalized column names
    """
    # Clean column names
    df.columns = df.columns.str.strip()
    
    # Map common column name variations to standard names
    column_mapping = {}
    
    # Find menu item column (various names)
    for col in df.columns:
        if any(word in col.lower() for word in ["menu item", "name", "item"]):
            column_mapping[col] = "Menu Item"
            break
    
    # Find brand column (various names)
    for col in df.columns:
        if any(word in col.lower() for word in ["brand", "company", "restaurant"]):
            column_mapping[col] = "Brand"
            break
    
    # Find category column (various names)
    for col in df.columns:
        if any(word in col.lower() for word in ["category", "type", "section"]):
            column_mapping[col] = "Category"
            break
    
    # Find ingredients column (various names)
    for col in df.columns:
        if any(word in col.lower() for word in ["ingredients", "ingredient", "recipe"]):
            column_mapping[col] = "Ingredients (qty+unit)"
            break
    
    # Rename columns
    df = df.rename(columns=column_mapping)
    
    # Add default values for missing columns
    if "Brand" not in df.columns:
        df["Brand"] = "Unknown"
    if "Category" not in df.columns:
        df["Category"] = "Unknown"
    if "Ingredients (qty+unit)" not in df.columns:
        # If no ingredients column, create one from ingredient columns
        ingredient_cols = [col for col in df.columns if any(word in col.lower() for word in ["cheese", "chicken", "flour", "tomato", "olive", "salt", "pepper", "garlic", "onion", "mushroom", "beef", "pork", "fish", "rice", "pasta", "bread", "butter", "milk", "egg"]) and "selling price" not in col.lower()]
        qty_cols = [col for col in df.columns if "qty" in col.lower() and "selling price" not in col.lower()]
        
        if ingredient_cols and qty_cols:
            # Create ingredients string from ingredient and qty columns
            ingredients_list = [[] for _ in range(len(df))]  # Initialize with empty lists for each row
            
            for i, ingredient_col in enumerate(ingredient_cols):
                if i < len(qty_cols):
                    qty_col = qty_cols[i]
                    # Get the ingredient name (remove units in parentheses)
                    ingredient_name = ingredient_col.split('(')[0].strip()
                    # Get quantity from the qty column
                    qty_values = df[qty_col].fillna(0)
                    # Get unit from ingredient column
                    unit = ingredient_col.split('(')[1].split(')')[0] if '(' in ingredient_col else 'unit'
                    
                    # Create ingredient string for each row
                    for idx, qty in enumerate(qty_values):
                        if qty > 0:
                            ingredients_list[idx].append(f"{ingredient_name}: {qty} {unit}")
            
            # Join ingredients for each row
            df["Ingredients (qty+unit)"] = ["; ".join(ingredients) for ingredients in ingredients_list]
    
    return df

def calculate_gp(cost_df: pd.DataFrame, rec_df: pd.DataFrame, menu_df: pd.DataFrame = None) -> dict:
    """
    Calculate gross profit for all menu items, grouped by brand.
    
    Args:
        cost_df: Costings DataFrame with unit costs
        rec_df: Recipes DataFrame with ingredient quantities
        menu_df: Menu prices DataFrame (optional)
        
    Returns:
        dict: Results grouped by brand with food costs and GP calculations
    """
    all_results = []
    calculated_items = {}  # Store calculated costs for meal deals
    
    # Normalize column names in recipes DataFrame
    rec_df = normalize_recipe_columns(rec_df)
    
    # First pass: Calculate individual items (non-meal deals)
    individual_items = rec_df[~rec_df["Menu Item"].str.contains("Meal:", na=False)]
    meal_items = rec_df[rec_df["Menu Item"].str.contains("Meal:", na=False)]
    
    # Process individual items first
    for _, row in individual_items.iterrows():
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
        
        result = {
            "Brand": row.get("Brand", ""),
            "Menu Item": row["Menu Item"],
            "Category": row.get("Category", ""),
            "Food Cost (£)": round(fc, 2),
            "Selling Price (£)": round(sp, 2),
            "GP £": round(gp, 2),
            "GP %": round(gp_pct, 1),
            "Notes": "; ".join(notes) if notes else ""
        }
        
        all_results.append(result)
        calculated_items[row["Menu Item"]] = fc  # Store for meal deals
    
    # Second pass: Calculate meal deals using individual item costs
    for _, row in meal_items.iterrows():
        fc, notes = calc_item_cost(row, cost_df, calculated_items)
        
        # Get selling price
        sp = 0
        if menu_df is not None and not menu_df.empty:
            price_match = menu_df[menu_df["Menu Item"].str.lower() == row["Menu Item"].lower()]
            if not price_match.empty:
                sp = price_match.iloc[0]["Selling Price (£)"]
        
        # Calculate GP
        gp = sp - fc if sp else 0
        gp_pct = (gp / sp * 100) if sp else 0
        
        all_results.append({
            "Brand": row.get("Brand", ""),
            "Menu Item": row["Menu Item"],
            "Category": row.get("Category", ""),
            "Food Cost (£)": round(fc, 2),
            "Selling Price (£)": round(sp, 2),
            "GP £": round(gp, 2),
            "GP %": round(gp_pct, 1),
            "Notes": "; ".join(notes) if notes else ""
        })
    
    # Group results by brand
    results_df = pd.DataFrame(all_results)
    brand_groups = {}
    
    if not results_df.empty:
        for brand in results_df["Brand"].unique():
            if pd.notna(brand) and brand.strip():
                brand_data = results_df[results_df["Brand"] == brand]
                brand_groups[brand] = brand_data.to_dict(orient="records")
    
    return brand_groups

def calc_item_cost(row: pd.Series, cost_df: pd.DataFrame, calculated_items: dict = None) -> tuple[float, list]:
    """
    Calculate the total food cost for a single menu item.
    
    Args:
        row: Recipe row with ingredients
        cost_df: Costings DataFrame with unit costs
        calculated_items: Dictionary of already calculated menu item costs (for meal deals)
        
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
            
            # First, try to find as a direct ingredient
            ing_match = find_ingredient_match(name.strip(), cost_df)
            
            if not ing_match.empty:
                unit_cost = ing_match.iloc[0]["UnitCost"]
                total_cost += qty * unit_cost
            elif calculated_items is not None:
                # Try to find as a menu item (for meal deals)
                menu_item_cost = find_menu_item_cost(name.strip(), calculated_items)
                if menu_item_cost is not None:
                    total_cost += qty * menu_item_cost
                    notes.append(f"REFERENCED: {name} (menu item cost: £{menu_item_cost:.2f})")
                else:
                    notes.append(f"ASSUMED: no match for {name}")
            else:
                notes.append(f"ASSUMED: no match for {name}")
                
        except Exception as e:
            notes.append(f"ASSUMED: {token} ({e})")
    
    return total_cost, notes

def find_ingredient_match(name: str, cost_df: pd.DataFrame) -> pd.DataFrame:
    """
    Find ingredient match using fuzzy matching for partial names.
    """
    name_lower = name.lower().strip()
    
    # Try exact match first
    exact_match = cost_df[cost_df["Ingredient_norm"] == name_lower]
    if not exact_match.empty:
        return exact_match
    
    # Try contains match
    contains_match = cost_df[cost_df["Ingredient_norm"].str.contains(name_lower, na=False, regex=False)]
    if not contains_match.empty:
        return contains_match
    
    # Try partial matching - split the search term and look for any part
    name_parts = name_lower.split()
    for part in name_parts:
        if len(part) > 2:  # Only use meaningful parts
            part_match = cost_df[cost_df["Ingredient_norm"].str.contains(part, na=False, regex=False)]
            if not part_match.empty:
                return part_match
    
    return pd.DataFrame()  # No match found

def find_menu_item_cost(name: str, calculated_items: dict) -> float:
    """
    Find menu item cost from already calculated items.
    """
    name_lower = name.lower().strip()
    
    # Try exact match first
    if name_lower in calculated_items:
        return calculated_items[name_lower]
    
    # Try partial matching
    for menu_item, cost in calculated_items.items():
        if name_lower in menu_item.lower() or menu_item.lower() in name_lower:
            return cost
    
    return None  # No match found
