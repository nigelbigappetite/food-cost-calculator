'use client';

import { useState } from 'react';
import { Plus, Trash2, Calculator, DollarSign, Percent, ChefHat } from 'lucide-react';
import { MenuItem, Ingredient, Customization, Brand } from '@/types';
import { calculateDetailedBreakdown, calculateBrandTotals, formatCurrency, formatPercentage } from '@/utils/calculations';

export default function Home() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentBrand, setCurrentBrand] = useState<Brand>({
    id: '',
    name: '',
    menuItems: [],
    totalRevenue: 0,
    totalFoodCosts: 0,
    overallGrossProfit: 0,
    overallGrossProfitPercentage: 0,
  });
  const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem>({
    id: '',
    name: '',
    sellingPrice: 0,
    ingredients: [],
    customizations: [],
    totalFoodCost: 0,
    grossProfit: 0,
    grossProfitPercentage: 0,
  });
  const [showResults, setShowResults] = useState(false);

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: '',
      purchasePrice: 0,
      unit: 'kg',
      quantityUsed: 0,
      costPerUnit: 0,
    };
    setCurrentMenuItem(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient],
    }));
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) => {
    setCurrentMenuItem(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ingredient =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient
      ),
    }));
  };

  const removeIngredient = (id: string) => {
    setCurrentMenuItem(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ingredient => ingredient.id !== id),
    }));
  };

  const addCustomization = () => {
    const newCustomization: Customization = {
      id: Date.now().toString(),
      name: '',
      additionalCost: 0,
      additionalIngredients: [],
    };
    setCurrentMenuItem(prev => ({
      ...prev,
      customizations: [...(prev.customizations || []), newCustomization],
    }));
  };

  const updateCustomization = (id: string, field: keyof Customization, value: string | number) => {
    setCurrentMenuItem(prev => ({
      ...prev,
      customizations: prev.customizations?.map(customization =>
        customization.id === id ? { ...customization, [field]: value } : customization
      ),
    }));
  };

  const removeCustomization = (id: string) => {
    setCurrentMenuItem(prev => ({
      ...prev,
      customizations: prev.customizations?.filter(customization => customization.id !== id),
    }));
  };

  const addMenuItem = () => {
    if (currentMenuItem.name && currentMenuItem.sellingPrice > 0 && currentMenuItem.ingredients.length > 0) {
      const newMenuItem = {
        ...currentMenuItem,
        id: Date.now().toString(),
      };
      setCurrentBrand(prev => ({
        ...prev,
        menuItems: [...prev.menuItems, newMenuItem],
      }));
      setCurrentMenuItem({
        id: '',
        name: '',
        sellingPrice: 0,
        ingredients: [],
        customizations: [],
        totalFoodCost: 0,
        grossProfit: 0,
        grossProfitPercentage: 0,
      });
    }
  };

  const calculateResults = () => {
    if (currentBrand.menuItems.length > 0) {
      setShowResults(true);
    }
  };

  const calculatedBrand = calculateBrandTotals(currentBrand);

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
            {/* Brand Information */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Brand Information</h2>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={currentBrand.name}
                    onChange={(e) => setCurrentBrand(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter brand name"
                  />
                </div>
              </div>
            </div>

            {/* Menu Item Information */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Menu Item</h2>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={currentMenuItem.name}
                      onChange={(e) => setCurrentMenuItem(prev => ({ ...prev, name: e.target.value }))}
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
                      className="input"
                      value={currentMenuItem.sellingPrice}
                      onChange={(e) => setCurrentMenuItem(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="card">
              <div className="card-header">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Ingredients</h2>
                  <button
                    onClick={addIngredient}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Ingredient</span>
                  </button>
                </div>
              </div>
              <div className="card-body space-y-4">
                {currentMenuItem.ingredients.map((ingredient, index) => (
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
                          className="input"
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
                          className="input"
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
                          className="input"
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
                          className="input"
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

            {/* Customizations */}
            <div className="card">
              <div className="card-header">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Customizations (Optional)</h2>
                  <button
                    onClick={addCustomization}
                    className="btn btn-secondary flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Customization</span>
                  </button>
                </div>
              </div>
              <div className="card-body space-y-4">
                {currentMenuItem.customizations?.map((customization, index) => (
                  <div key={customization.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-900">Customization {index + 1}</h3>
                      <button
                        onClick={() => removeCustomization(customization.id)}
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
                          className="input"
                          value={customization.name}
                          onChange={(e) => updateCustomization(customization.id, 'name', e.target.value)}
                          placeholder="e.g., Extra Cheese"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Additional Cost (£)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          value={customization.additionalCost}
                          onChange={(e) => updateCustomization(customization.id, 'additionalCost', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={addMenuItem}
                className="btn btn-success flex items-center space-x-2"
                disabled={!currentMenuItem.name || currentMenuItem.sellingPrice <= 0 || currentMenuItem.ingredients.length === 0}
              >
                <Plus className="h-4 w-4" />
                <span>Add Menu Item</span>
              </button>
              <button
                onClick={calculateResults}
                className="btn btn-primary flex items-center space-x-2"
                disabled={currentBrand.menuItems.length === 0}
              >
                <Calculator className="h-4 w-4" />
                <span>Calculate Results</span>
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {showResults && calculatedBrand.menuItems.length > 0 && (
              <>
                {/* Brand Summary */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-lg font-semibold text-gray-900">Brand Summary</h2>
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(calculatedBrand.totalRevenue)}
                        </div>
                        <div className="text-sm text-gray-500">Total Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(calculatedBrand.totalFoodCosts)}
                        </div>
                        <div className="text-sm text-gray-500">Total Food Costs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(calculatedBrand.overallGrossProfit)}
                        </div>
                        <div className="text-sm text-gray-500">Gross Profit</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {formatPercentage(calculatedBrand.overallGrossProfitPercentage)}
                        </div>
                        <div className="text-sm text-gray-500">GP Percentage</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items Breakdown */}
                {calculatedBrand.menuItems.map((menuItem) => {
                  const breakdown = calculateDetailedBreakdown(menuItem);
                  return (
                    <div key={menuItem.id} className="card">
                      <div className="card-header">
                        <h3 className="text-lg font-semibold text-gray-900">{menuItem.name}</h3>
                        <div className="text-sm text-gray-500">
                          Selling Price: {formatCurrency(menuItem.sellingPrice)}
                        </div>
                      </div>
                      <div className="card-body space-y-4">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-red-600">
                              {formatCurrency(menuItem.totalFoodCost)}
                            </div>
                            <div className="text-xs text-gray-500">Food Cost</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">
                              {formatCurrency(menuItem.grossProfit)}
                            </div>
                            <div className="text-xs text-gray-500">Gross Profit</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-yellow-600">
                              {formatPercentage(menuItem.grossProfitPercentage)}
                            </div>
                            <div className="text-xs text-gray-500">GP %</div>
                          </div>
                        </div>

                        {/* Ingredient Breakdown */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Ingredient Breakdown</h4>
                          <div className="space-y-2">
                            {breakdown.ingredientBreakdown.map((item, index) => (
                              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                                <div>
                                  <div className="font-medium text-gray-900">{item.ingredient.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {item.ingredient.quantityUsed} {item.ingredient.unit} @ {formatCurrency(item.ingredient.purchasePrice)}/{item.ingredient.unit}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-gray-900">{formatCurrency(item.cost)}</div>
                                  <div className="text-sm text-gray-500">{formatPercentage(item.percentage)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Customization Breakdown */}
                        {breakdown.customizationBreakdown && breakdown.customizationBreakdown.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Customization Breakdown</h4>
                            <div className="space-y-2">
                              {breakdown.customizationBreakdown.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <div className="font-medium text-gray-900">{item.customization.name}</div>
                                  <div className="font-medium text-gray-900">{formatCurrency(item.additionalCost)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {!showResults && (
              <div className="card">
                <div className="card-body text-center py-12">
                  <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Calculate</h3>
                  <p className="text-gray-500">
                    Add menu items and click "Calculate Results" to see your food cost breakdown.
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
