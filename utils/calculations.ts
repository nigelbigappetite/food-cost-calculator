import { MenuItem, Ingredient, Customization, CalculationResult, Brand } from '@/types';

export function calculateIngredientCost(ingredient: Ingredient): number {
  return ingredient.purchasePrice * ingredient.quantityUsed;
}

export function calculateMenuItemCosts(menuItem: MenuItem): MenuItem {
  // Calculate total food cost from base ingredients
  const baseFoodCost = menuItem.ingredients.reduce((total, ingredient) => {
    return total + calculateIngredientCost(ingredient);
  }, 0);

  // Calculate additional costs from customizations
  const customizationCost = menuItem.customizations?.reduce((total, customization) => {
    const additionalIngredientCost = customization.additionalIngredients?.reduce((ingredientTotal, ingredient) => {
      return ingredientTotal + calculateIngredientCost(ingredient);
    }, 0) || 0;
    return total + customization.additionalCost + additionalIngredientCost;
  }, 0) || 0;

  const totalFoodCost = baseFoodCost + customizationCost;
  const grossProfit = menuItem.sellingPrice - totalFoodCost;
  const grossProfitPercentage = menuItem.sellingPrice > 0 ? (grossProfit / menuItem.sellingPrice) * 100 : 0;

  return {
    ...menuItem,
    totalFoodCost,
    grossProfit,
    grossProfitPercentage,
  };
}

export function calculateDetailedBreakdown(menuItem: MenuItem): CalculationResult {
  const calculatedMenuItem = calculateMenuItemCosts(menuItem);
  
  // Calculate ingredient breakdown
  const ingredientBreakdown = calculatedMenuItem.ingredients.map(ingredient => {
    const cost = calculateIngredientCost(ingredient);
    const percentage = calculatedMenuItem.totalFoodCost > 0 ? (cost / calculatedMenuItem.totalFoodCost) * 100 : 0;
    return {
      ingredient,
      cost,
      percentage,
    };
  });

  // Calculate customization breakdown
  const customizationBreakdown = calculatedMenuItem.customizations?.map(customization => {
    const additionalIngredientCost = customization.additionalIngredients?.reduce((total, ingredient) => {
      return total + calculateIngredientCost(ingredient);
    }, 0) || 0;
    const additionalCost = customization.additionalCost + additionalIngredientCost;
    return {
      customization,
      additionalCost,
    };
  });

  return {
    menuItem: calculatedMenuItem,
    ingredientBreakdown,
    customizationBreakdown,
  };
}

export function calculateBrandTotals(brand: Brand): Brand {
  const calculatedMenuItems = brand.menuItems.map(calculateMenuItemCosts);
  
  const totalRevenue = calculatedMenuItems.reduce((total, item) => total + item.sellingPrice, 0);
  const totalFoodCosts = calculatedMenuItems.reduce((total, item) => total + item.totalFoodCost, 0);
  const overallGrossProfit = totalRevenue - totalFoodCosts;
  const overallGrossProfitPercentage = totalRevenue > 0 ? (overallGrossProfit / totalRevenue) * 100 : 0;

  return {
    ...brand,
    menuItems: calculatedMenuItems,
    totalRevenue,
    totalFoodCosts,
    overallGrossProfit,
    overallGrossProfitPercentage,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(2)}%`;
}
