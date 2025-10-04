export interface Ingredient {
  id: string;
  name: string;
  purchasePrice: number; // Price per unit (e.g., per kg, per liter)
  unit: string; // e.g., 'kg', 'liter', 'piece', 'gram'
  quantityUsed: number; // How much of this ingredient is used in the recipe
  costPerUnit: number; // Calculated: purchasePrice / quantityUsed
}

export interface Customization {
  id: string;
  name: string;
  additionalCost: number; // Additional cost for this customization
  additionalIngredients?: Ingredient[]; // Additional ingredients needed
}

export interface MenuItem {
  id: string;
  name: string;
  sellingPrice: number;
  ingredients: Ingredient[];
  customizations?: Customization[];
  totalFoodCost: number; // Calculated
  grossProfit: number; // Calculated: sellingPrice - totalFoodCost
  grossProfitPercentage: number; // Calculated: (grossProfit / sellingPrice) * 100
}

export interface Brand {
  id: string;
  name: string;
  menuItems: MenuItem[];
  totalRevenue: number; // Calculated
  totalFoodCosts: number; // Calculated
  overallGrossProfit: number; // Calculated
  overallGrossProfitPercentage: number; // Calculated
}

export interface ItemVariant {
  id: string;
  baseItemName: string;
  variantName: string;
  sellingPrice: number;
  foodCost: number; // Calculated from ingredients
  grossProfit: number; // Calculated
  grossProfitPercentage: number; // Calculated
}

export interface FlexibleMealDeal {
  id: string;
  name: string;
  sellingPrice: number;
  components: {
    category: 'main' | 'side' | 'drink';
    itemType: string; // e.g., "Wings", "Fries", "Drink"
    isFlexible: boolean; // true for "any side", "any flavor"
    specificItem?: string; // if not flexible, specific item name
  }[];
  totalFoodCost: number; // Calculated (average if flexible)
  grossProfit: number; // Calculated
  grossProfitPercentage: number; // Calculated
  componentBreakdown: {
    category: string;
    itemType: string;
    isFlexible: boolean;
    averageCost: number;
    individualCosts: number[];
    individualSellingPrices: number[];
  }[];
}

export interface MealDeal {
  id: string;
  name: string;
  sellingPrice: number;
  components: {
    itemName: string;
    category: 'main' | 'side' | 'drink';
  }[];
  totalFoodCost: number; // Calculated
  grossProfit: number; // Calculated
  grossProfitPercentage: number; // Calculated
  componentBreakdown: {
    itemName: string;
    category: string;
    individualCost: number;
    individualSellingPrice: number;
  }[];
}

export interface CalculationResult {
  menuItem: MenuItem;
  ingredientBreakdown: {
    ingredient: Ingredient;
    cost: number;
    percentage: number; // Percentage of total food cost
  }[];
  customizationBreakdown?: {
    customization: Customization;
    additionalCost: number;
  }[];
}
