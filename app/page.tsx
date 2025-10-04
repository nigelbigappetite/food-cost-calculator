'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Calculator, ChefHat, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface Ingredient {
  name: string;
  purchasePrice: number;
  quantity: number;
  unit: string;
  costPerUnit: number;
}

interface MenuItem {
  name: string;
  sellingPrice: number;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  customizations?: {
    name: string;
    additionalCost: number;
    additionalIngredients?: {
      name: string;
      quantity: number;
      unit: string;
    }[];
  }[];
}

interface CalculatedMenuItem extends MenuItem {
  totalFoodCost: number;
  grossProfit: number;
  grossProfitPercentage: number;
  ingredientBreakdown: {
    ingredient: string;
    cost: number;
    percentage: number;
  }[];
}

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [calculatedItems, setCalculatedItems] = useState<CalculatedMenuItem[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [isCalculated, setIsCalculated] = useState(false);

  const parseCSV = (csvText: string): string[][] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const handleIngredientsUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const rows = parseCSV(csvText);
        
        if (rows.length < 2) {
          setUploadStatus({ type: 'error', message: 'CSV must have at least a header row and one data row' });
          return;
        }

        const header = rows[0].map(h => h.toLowerCase().trim());
        const expectedHeaders = ['name', 'purchase price', 'quantity', 'unit'];
        
        // Check if required headers exist
        const hasRequiredHeaders = expectedHeaders.every(expected => 
          header.some(h => h.includes(expected.replace(' ', '')) || h === expected)
        );

        if (!hasRequiredHeaders) {
          setUploadStatus({ 
            type: 'error', 
            message: 'CSV must have columns: Name, Purchase Price, Quantity, Unit' 
          });
          return;
        }

        const newIngredients: Ingredient[] = rows.slice(1).map(row => {
          const name = row[0]?.trim() || '';
          const purchasePrice = parseFloat(row[1]?.replace(/[£$]/g, '') || '0');
          const quantity = parseFloat(row[2] || '0');
          const unit = row[3]?.trim() || 'kg';
          
          return {
            name,
            purchasePrice,
            quantity,
            unit,
            costPerUnit: quantity > 0 ? purchasePrice / quantity : 0
          };
        }).filter(ing => ing.name && ing.purchasePrice > 0 && ing.quantity > 0);

        setIngredients(newIngredients);
        setUploadStatus({ 
          type: 'success', 
          message: `Successfully loaded ${newIngredients.length} ingredients` 
        });
      } catch (error) {
        setUploadStatus({ type: 'error', message: 'Error parsing CSV file' });
      }
    };
    reader.readAsText(file);
  }, []);

  const handleMenuUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const rows = parseCSV(csvText);
        
        if (rows.length < 2) {
          setUploadStatus({ type: 'error', message: 'CSV must have at least a header row and one data row' });
          return;
        }

        const header = rows[0].map(h => h.toLowerCase().trim());
        const expectedHeaders = ['name', 'selling price'];
        
        if (!expectedHeaders.every(expected => 
          header.some(h => h.includes(expected.replace(' ', '')) || h === expected)
        )) {
          setUploadStatus({ 
            type: 'error', 
            message: 'CSV must have columns: Name, Selling Price, and ingredient columns' 
          });
          return;
        }

        const newMenuItems: MenuItem[] = rows.slice(1).map(row => {
          const name = row[0]?.trim() || '';
          const sellingPrice = parseFloat(row[1]?.replace(/[£$]/g, '') || '0');
          
          // Extract ingredients from remaining columns
          const itemIngredients: { name: string; quantity: number; unit: string }[] = [];
          
          for (let i = 2; i < row.length; i += 2) {
            const ingredientName = row[i]?.trim();
            const quantity = parseFloat(row[i + 1] || '0');
            
            if (ingredientName && quantity > 0) {
              // Try to extract unit from ingredient name (e.g., "Flour (kg)" -> "Flour", "kg")
              const unitMatch = ingredientName.match(/\(([^)]+)\)$/);
              const cleanName = unitMatch ? ingredientName.replace(/\s*\([^)]+\)$/, '') : ingredientName;
              const unit = unitMatch ? unitMatch[1] : 'kg';
              
              itemIngredients.push({
                name: cleanName,
                quantity,
                unit
              });
            }
          }

          return {
            name,
            sellingPrice,
            ingredients: itemIngredients
          };
        }).filter(item => item.name && item.sellingPrice > 0);

        setMenuItems(newMenuItems);
        setUploadStatus({ 
          type: 'success', 
          message: `Successfully loaded ${newMenuItems.length} menu items` 
        });
      } catch (error) {
        setUploadStatus({ type: 'error', message: 'Error parsing CSV file' });
      }
    };
    reader.readAsText(file);
  }, []);

  const calculateFoodCosts = () => {
    if (ingredients.length === 0 || menuItems.length === 0) {
      setUploadStatus({ 
        type: 'error', 
        message: 'Please upload both ingredients and menu items first' 
      });
      return;
    }

    const calculated: CalculatedMenuItem[] = menuItems.map(item => {
      let totalFoodCost = 0;
      const ingredientBreakdown: { ingredient: string; cost: number; percentage: number }[] = [];

      item.ingredients.forEach(ingredient => {
        // Find matching ingredient in our ingredients list
        const matchingIngredient = ingredients.find(ing => 
          ing.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
          ingredient.name.toLowerCase().includes(ing.name.toLowerCase())
        );

        if (matchingIngredient) {
          // Convert units if needed (simplified - you might want more sophisticated unit conversion)
          let quantityInMatchingUnit = ingredient.quantity;
          if (ingredient.unit !== matchingIngredient.unit) {
            // Basic unit conversion (you might want to expand this)
            if (ingredient.unit === 'g' && matchingIngredient.unit === 'kg') {
              quantityInMatchingUnit = ingredient.quantity / 1000;
            } else if (ingredient.unit === 'kg' && matchingIngredient.unit === 'g') {
              quantityInMatchingUnit = ingredient.quantity * 1000;
            } else if (ingredient.unit === 'ml' && matchingIngredient.unit === 'liter') {
              quantityInMatchingUnit = ingredient.quantity / 1000;
            } else if (ingredient.unit === 'liter' && matchingIngredient.unit === 'ml') {
              quantityInMatchingUnit = ingredient.quantity * 1000;
            }
          }

          const cost = quantityInMatchingUnit * matchingIngredient.costPerUnit;
          totalFoodCost += cost;
          
          ingredientBreakdown.push({
            ingredient: ingredient.name,
            cost,
            percentage: 0 // Will calculate after we have total
          });
        } else {
          // Ingredient not found - you might want to handle this differently
          ingredientBreakdown.push({
            ingredient: `${ingredient.name} (not found)`,
            cost: 0,
            percentage: 0
          });
        }
      });

      // Calculate percentages
      ingredientBreakdown.forEach(breakdown => {
        breakdown.percentage = totalFoodCost > 0 ? (breakdown.cost / totalFoodCost) * 100 : 0;
      });

      const grossProfit = item.sellingPrice - totalFoodCost;
      const grossProfitPercentage = item.sellingPrice > 0 ? (grossProfit / item.sellingPrice) * 100 : 0;

      return {
        ...item,
        totalFoodCost,
        grossProfit,
        grossProfitPercentage,
        ingredientBreakdown
      };
    });

    setCalculatedItems(calculated);
    setIsCalculated(true);
    setUploadStatus({ 
      type: 'success', 
      message: `Calculated food costs for ${calculated.length} menu items` 
    });
  };

  const downloadResults = () => {
    const csvContent = [
      ['Menu Item', 'Selling Price', 'Food Cost', 'Gross Profit', 'GP %', 'Ingredients'],
      ...calculatedItems.map(item => [
        item.name,
        `£${item.sellingPrice.toFixed(2)}`,
        `£${item.totalFoodCost.toFixed(2)}`,
        `£${item.grossProfit.toFixed(2)}`,
        `${item.grossProfitPercentage.toFixed(2)}%`,
        item.ingredientBreakdown.map(ing => `${ing.ingredient}: £${ing.cost.toFixed(2)}`).join('; ')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'food-cost-analysis.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadTemplate = (type: 'ingredients' | 'menu') => {
    let csvContent = '';
    let filename = '';
    
    if (type === 'ingredients') {
      csvContent = [
        ['Name', 'Purchase Price', 'Quantity', 'Unit'],
        ['Cheese', '10.00', '112', 'slices'],
        ['Chicken Breast', '15.00', '2', 'kg'],
        ['Flour', '2.50', '5', 'kg'],
        ['Tomato Sauce', '3.00', '1', 'liter'],
        ['Olive Oil', '8.00', '1', 'liter'],
        ['Salt', '1.50', '1', 'kg'],
        ['Pepper', '2.00', '1', 'kg'],
        ['Garlic', '3.00', '0.5', 'kg'],
        ['Onions', '2.00', '2', 'kg'],
        ['Mushrooms', '4.00', '1', 'kg']
      ].map(row => row.join(',')).join('\n');
      filename = 'ingredients-template.csv';
    } else {
      csvContent = [
        ['Name', 'Selling Price', 'Cheese', 'Qty', 'Flour', 'Qty', 'Chicken Breast', 'Qty', 'Tomato Sauce', 'Qty', 'Olive Oil', 'Qty', 'Salt', 'Qty', 'Pepper', 'Qty', 'Garlic', 'Qty', 'Onions', 'Qty', 'Mushrooms', 'Qty'],
        ['Margherita Pizza', '12.00', 'Cheese', '3', 'Flour', '0.3', 'Chicken Breast', '0', 'Tomato Sauce', '0.1', 'Olive Oil', '0.02', 'Salt', '0.01', 'Pepper', '0.01', 'Garlic', '0.01', 'Onions', '0.05', 'Mushrooms', '0'],
        ['Chicken Pizza', '15.00', 'Cheese', '3', 'Flour', '0.3', 'Chicken Breast', '0.2', 'Tomato Sauce', '0.1', 'Olive Oil', '0.02', 'Salt', '0.01', 'Pepper', '0.01', 'Garlic', '0.01', 'Onions', '0.05', 'Mushrooms', '0'],
        ['Chicken Wings', '8.50', 'Cheese', '0', 'Flour', '0', 'Chicken Breast', '0.5', 'Tomato Sauce', '0', 'Olive Oil', '0.05', 'Salt', '0.01', 'Pepper', '0.01', 'Garlic', '0.02', 'Onions', '0', 'Mushrooms', '0']
      ].map(row => row.join(',')).join('\n');
      filename = 'menu-template.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalRevenue = calculatedItems.reduce((sum, item) => sum + item.sellingPrice, 0);
  const totalFoodCosts = calculatedItems.reduce((sum, item) => sum + item.totalFoodCost, 0);
  const overallGrossProfit = totalRevenue - totalFoodCosts;
  const overallGPPercentage = totalRevenue > 0 ? (overallGrossProfit / totalRevenue) * 100 : 0;

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
              Hungry Tum Brands
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upload Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ingredients Upload */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Ingredients Data</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Upload CSV with: Name, Purchase Price, Quantity, Unit
                </p>
              </div>
              <div className="px-6 py-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleIngredientsUpload}
                    className="hidden"
                    id="ingredients-upload"
                  />
                  <div className="space-y-3">
                    <label
                      htmlFor="ingredients-upload"
                      className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block"
                    >
                      Upload Ingredients CSV
                    </label>
                    <div className="text-sm text-gray-500">or</div>
                    <button
                      onClick={() => downloadTemplate('ingredients')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 inline-block"
                    >
                      Download Template
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Example: Cheese, £10.00, 112, slices
                  </p>
                </div>
                {ingredients.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ {ingredients.length} ingredients loaded
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Menu Items Upload */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Menu Items Data</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Upload CSV with: Name, Selling Price, Ingredient1, Qty1, Ingredient2, Qty2...
                </p>
              </div>
              <div className="px-6 py-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleMenuUpload}
                    className="hidden"
                    id="menu-upload"
                  />
                  <div className="space-y-3">
                    <label
                      htmlFor="menu-upload"
                      className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block"
                    >
                      Upload Menu CSV
                    </label>
                    <div className="text-sm text-gray-500">or</div>
                    <button
                      onClick={() => downloadTemplate('menu')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 inline-block"
                    >
                      Download Template
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Example: Pizza, £12.00, Cheese, 2, Flour, 0.5
                  </p>
                </div>
                {menuItems.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ {menuItems.length} menu items loaded
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status and Calculate Button */}
          {uploadStatus.type && (
            <div className={`p-4 rounded-lg flex items-center space-x-2 ${
              uploadStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {uploadStatus.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span>{uploadStatus.message}</span>
            </div>
          )}

          {ingredients.length > 0 && menuItems.length > 0 && (
            <div className="text-center">
              <button
                onClick={calculateFoodCosts}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-2 mx-auto"
              >
                <Calculator className="h-5 w-5" />
                <span>Calculate Food Costs</span>
              </button>
            </div>
          )}

          {/* Results Section */}
          {isCalculated && calculatedItems.length > 0 && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
                    <button
                      onClick={downloadResults}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Results</span>
                    </button>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        £{totalRevenue.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Total Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        £{totalFoodCosts.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Total Food Costs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        £{overallGrossProfit.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Gross Profit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {overallGPPercentage.toFixed(2)}%
                      </div>
                      <div className="text-sm text-gray-500">GP Percentage</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items Breakdown */}
              <div className="space-y-4">
                {calculatedItems.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <div className="text-sm text-gray-500">
                        Selling Price: £{item.sellingPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="px-6 py-4 space-y-4">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-red-600">
                            £{item.totalFoodCost.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">Food Cost</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            £{item.grossProfit.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">Gross Profit</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-yellow-600">
                            {item.grossProfitPercentage.toFixed(2)}%
                          </div>
                          <div className="text-xs text-gray-500">GP %</div>
                        </div>
                      </div>

                      {/* Ingredient Breakdown */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Ingredient Breakdown</h4>
                        <div className="space-y-2">
                          {item.ingredientBreakdown.map((breakdown, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100">
                              <div className="font-medium text-gray-900">{breakdown.ingredient}</div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">£{breakdown.cost.toFixed(2)}</div>
                                <div className="text-sm text-gray-500">{breakdown.percentage.toFixed(1)}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}