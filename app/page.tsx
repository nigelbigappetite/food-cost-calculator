'use client';

import { useState } from 'react';
import { Plus, Trash2, Calculator, ChefHat } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  purchasePrice: number;
  unit: string;
  quantityUsed: number;
}

interface MenuItem {
  id: string;
  name: string;
  sellingPrice: number;
  ingredients: Ingredient[];
  totalFoodCost: number;
  grossProfit: number;
  grossProfitPercentage: number;
}

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentItem, setCurrentItem] = useState<MenuItem>({
    id: '',
    name: '',
    sellingPrice: 0,
    ingredients: [],
    totalFoodCost: 0,
    grossProfit: 0,
    grossProfitPercentage: 0,
  });

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: '',
      purchasePrice: 0,
      unit: 'kg',
      quantityUsed: 0,
    };
    setCurrentItem(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient],
    }));
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) => {
    setCurrentItem(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ingredient =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient
      ),
    }));
  };

  const removeIngredient = (id: string) => {
    setCurrentItem(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ingredient => ingredient.id !== id),
    }));
  };

  const calculateItemCosts = (item: MenuItem): MenuItem => {
    const totalFoodCost = item.ingredients.reduce((total, ingredient) => {
      return total + (ingredient.purchasePrice * ingredient.quantityUsed);
    }, 0);
    
    const grossProfit = item.sellingPrice - totalFoodCost;
    const grossProfitPercentage = item.sellingPrice > 0 ? (grossProfit / item.sellingPrice) * 100 : 0;

    return {
      ...item,
      totalFoodCost,
      grossProfit,
      grossProfitPercentage,
    };
  };

  const addMenuItem = () => {
    if (currentItem.name && currentItem.sellingPrice > 0 && currentItem.ingredients.length > 0) {
      const calculatedItem = calculateItemCosts({
        ...currentItem,
        id: Date.now().toString(),
      });
      
      setMenuItems(prev => [...prev, calculatedItem]);
      setCurrentItem({
        id: '',
        name: '',
        sellingPrice: 0,
        ingredients: [],
        totalFoodCost: 0,
        grossProfit: 0,
        grossProfitPercentage: 0,
      });
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage.toFixed(2)}%`;
  };

  const totalRevenue = menuItems.reduce((total, item) => total + item.sellingPrice, 0);
  const totalFoodCosts = menuItems.reduce((total, item) => total + item.totalFoodCost, 0);
  const overallGrossProfit = totalRevenue - totalFoodCosts;
  const overallGrossProfitPercentage = totalRevenue > 0 ? (overallGrossProfit / totalRevenue) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <ChefHat className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Food Cost Calculator</h1>
            </div>
            <div className="text-sm text-gray-500">
              Hungry Tummy Brands
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Menu Item Information */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Menu Item</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={currentItem.name}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Chicken Wings"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selling Price (£)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={currentItem.sellingPrice}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Ingredients</h2>
                  <button
                    onClick={addIngredient}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Ingredient</span>
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 space-y-4">
                {currentItem.ingredients.map((ingredient, index) => (
                  <div key={ingredient.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-900">Ingredient {index + 1}</h3>
                      <button
                        onClick={() => removeIngredient(ingredient.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={ingredient.name}
                          onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                          placeholder="e.g., Chicken Breast"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="liter">liter</option>
                          <option value="ml">ml</option>
                          <option value="piece">piece</option>
                          <option value="cup">cup</option>
                          <option value="tbsp">tbsp</option>
                          <option value="tsp">tsp</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Purchase Price (£)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={ingredient.purchasePrice}
                          onChange={(e) => updateIngredient(ingredient.id, 'purchasePrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity Used
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={ingredient.quantityUsed}
                          onChange={(e) => updateIngredient(ingredient.id, 'quantityUsed', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Menu Item Button */}
            <button
              onClick={addMenuItem}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center space-x-2"
              disabled={!currentItem.name || currentItem.sellingPrice <= 0 || currentItem.ingredients.length === 0}
            >
              <Plus className="h-4 w-4" />
              <span>Add Menu Item</span>
            </button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Summary Stats */}
            {menuItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(totalRevenue)}
                      </div>
                      <div className="text-sm text-gray-500">Total Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(totalFoodCosts)}
                      </div>
                      <div className="text-sm text-gray-500">Total Food Costs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(overallGrossProfit)}
                      </div>
                      <div className="text-sm text-gray-500">Gross Profit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {formatPercentage(overallGrossProfitPercentage)}
                      </div>
                      <div className="text-sm text-gray-500">GP Percentage</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Items List */}
            {menuItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <div className="text-sm text-gray-500">
                    Selling Price: {formatCurrency(item.sellingPrice)}
                  </div>
                </div>
                <div className="px-6 py-4 space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600">
                        {formatCurrency(item.totalFoodCost)}
                      </div>
                      <div className="text-xs text-gray-500">Food Cost</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(item.grossProfit)}
                      </div>
                      <div className="text-xs text-gray-500">Gross Profit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-yellow-600">
                        {formatPercentage(item.grossProfitPercentage)}
                      </div>
                      <div className="text-xs text-gray-500">GP %</div>
                    </div>
                  </div>

                  {/* Ingredient Breakdown */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ingredient Breakdown</h4>
                    <div className="space-y-2">
                      {item.ingredients.map((ingredient, index) => {
                        const cost = ingredient.purchasePrice * ingredient.quantityUsed;
                        const percentage = item.totalFoodCost > 0 ? (cost / item.totalFoodCost) * 100 : 0;
                        return (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                            <div>
                              <div className="font-medium text-gray-900">{ingredient.name}</div>
                              <div className="text-sm text-gray-500">
                                {ingredient.quantityUsed} {ingredient.unit} @ {formatCurrency(ingredient.purchasePrice)}/{ingredient.unit}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">{formatCurrency(cost)}</div>
                              <div className="text-sm text-gray-500">{formatPercentage(percentage)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {menuItems.length === 0 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="px-6 py-12 text-center">
                  <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Calculate</h3>
                  <p className="text-gray-500">
                    Add menu items to see your food cost breakdown.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}