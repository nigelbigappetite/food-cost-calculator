// Mock Google Sheets API for demonstration
// In production, replace with actual Google Sheets API

// Mock data for demonstration
const mockIngredientsData = [
  ['Ingredient Name', 'Unit', 'Unit Cost (£)', 'Pack Size', 'Cost per Unit (£)', 'Supplier', 'Category'],
  ['Potato Bun', 'each', 25.00, 45, 0.56, 'Sysco', 'Bread'],
  ['Beyond Meat Patty', '113g', 67.63, 40, 1.69, 'Beyond', 'Protein'],
  ['American Cheese Slice', 'slice', 16.39, 112, 0.15, 'Sysco', 'Dairy'],
  ['Blue Cheese Slice', 'slice', 14.22, 25, 0.57, 'Sysco', 'Dairy'],
  ['Smoked Cheddar Slice', 'slice', 17.41, 50, 0.35, 'Sysco', 'Dairy'],
  ['Violife Vegan Cheese', 'slice', 3.49, 10, 0.35, 'Sysco', 'Vegan'],
  ['Cucumber', 'each', 0.68, 1, 0.68, 'Sysco', 'Veg'],
  ['Sliced Onion', 'g', 3.64, 1250, 0.003, 'Sysco', 'Veg'],
  ['Jalapenos', 'g', 12.77, 1500, 0.009, 'Sysco', 'Veg'],
  ['Fried Shallots', 'g', 8.02, 1000, 0.008, 'Sysco', 'Garnish'],
  ['Thin Cut Fries', 'g', 16.89, 1750, 0.010, 'Sysco', 'Potato'],
  ['Heinz Truffle Mayo', 'ml', 25.69, 1600, 0.016, 'Heinz', 'Sauce'],
  ['Heinz Korean BBQ Sauce', 'ml', 6.52, 875, 0.007, 'Heinz', 'Sauce'],
  ['Franks Red Hot Sauce', 'ml', 20.52, 3780, 0.005, 'Franks', 'Sauce'],
];

const mockMenuItemsData = [
  ['Menu Item Name', 'Ingredient Name', 'Qty Used', 'Unit', 'Auto Cost (£)', 'Selling Price (£)'],
  ['Wagyu Cheese Smash', 'Potato Bun', 1, 'each', '', 11.50],
  ['Wagyu Cheese Smash', 'American Cheese Slice', 1, 'slice', '', ''],
  ['Wagyu Cheese Smash', 'Fried Shallots', 10, 'g', '', ''],
  ['Wagyu Cheese Smash', 'Truffle Mayo', 15, 'ml', '', ''],
  ['Smokey Buffalo Chicken Smash', 'Potato Bun', 1, 'each', '', 10.50],
  ['Smokey Buffalo Chicken Smash', 'Smoked Cheddar Slice', 1, 'slice', '', ''],
  ['Smokey Buffalo Chicken Smash', 'Korean BBQ Sauce', 15, 'ml', '', ''],
  ['Vegan Smash', 'Potato Bun', 1, 'each', '', 9.50],
  ['Vegan Smash', 'Beyond Meat Patty', 2, 'each', '', ''],
  ['Vegan Smash', 'Violife Vegan Cheese', 1, 'slice', '', ''],
  ['Vegan Smash', 'Jalapenos', 5, 'g', '', ''],
  ['Vegan Smash', 'Fried Shallots', 10, 'g', '', ''],
  ['Vegan Smash', 'Truffle Mayo', 15, 'ml', '', ''],
  ['Fries', 'Thin Cut Fries', 200, 'g', '', 3.00],
];

// Spreadsheet ID - will be created if it doesn't exist
let SPREADSHEET_ID: string | null = null;

export interface Ingredient {
  name: string;
  unit: string;
  unitCost: number;
  packSize: number;
  costPerUnit: number;
  supplier: string;
  category: string;
}

export interface MenuItem {
  menuItemName: string;
  ingredientName: string;
  qtyUsed: number;
  unit: string;
  autoCost: number;
  sellingPrice: number;
}

export interface MenuSummary {
  menuItem: string;
  cost: number;
  price: number;
  gpPounds: number;
  gpPercent: number;
}

// Create a new spreadsheet (mock)
export async function createSpreadsheet(): Promise<string> {
  try {
    // Mock spreadsheet creation
    SPREADSHEET_ID = 'mock-spreadsheet-id-' + Date.now();
    console.log('✅ Mock Google Sheet created successfully:', SPREADSHEET_ID);
    console.log('📊 In production, this would create a real Google Sheet with the title "Wing Shack Food Cost Prototype"');
    return SPREADSHEET_ID;
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    throw error;
  }
}

// Get spreadsheet ID (create if doesn't exist)
export async function getSpreadsheetId(): Promise<string> {
  if (SPREADSHEET_ID) {
    return SPREADSHEET_ID;
  }

  // Mock: Always create new spreadsheet for demo
  console.log('📊 Mock: Creating new spreadsheet for demonstration');
  return await createSpreadsheet();
}

// Get data from a specific sheet (mock)
export async function getSheetData(sheetName: string): Promise<any[][]> {
  try {
    console.log(`📊 Mock: Reading data from sheet "${sheetName}"`);
    
    if (sheetName === 'Ingredients') {
      return mockIngredientsData;
    } else if (sheetName === 'MenuItems') {
      return mockMenuItemsData;
    } else if (sheetName === 'MenuSummary') {
      // Return empty array for MenuSummary as it will be calculated
      return [['Menu Item Name', 'Total Food Cost (£)', 'Selling Price (£)', 'GP £', 'GP %']];
    }
    
    return [];
  } catch (error) {
    console.error(`Error reading sheet ${sheetName}:`, error);
    throw error;
  }
}

// Write data to a specific sheet (mock)
export async function writeSheetData(sheetName: string, data: any[][]): Promise<void> {
  try {
    console.log(`📊 Mock: Writing data to sheet "${sheetName}"`);
    console.log(`📊 Data preview:`, data.slice(0, 3)); // Show first 3 rows
    console.log(`📊 In production, this would update the Google Sheet with ${data.length} rows`);
  } catch (error) {
    console.error(`Error writing to sheet ${sheetName}:`, error);
    throw error;
  }
}

// Populate ingredients sheet with sample data (mock)
export async function populateIngredientsSheet(): Promise<void> {
  console.log('📊 Mock: Populating Ingredients sheet with sample data');
  await writeSheetData('Ingredients', mockIngredientsData);
  console.log('✅ Ingredients sheet populated');
}

// Populate menu items sheet with sample data (mock)
export async function populateMenuItemsSheet(): Promise<void> {
  console.log('📊 Mock: Populating MenuItems sheet with sample data');
  await writeSheetData('MenuItems', mockMenuItemsData);
  console.log('✅ MenuItems sheet populated');
}

// Calculate GP for menu items
export function calculateGP(menuItems: MenuItem[], ingredients: Ingredient[]): MenuSummary[] {
  // Create ingredient lookup map
  const ingredientMap = new Map<string, Ingredient>();
  ingredients.forEach(ingredient => {
    ingredientMap.set(ingredient.name, ingredient);
  });

  // Group menu items by menu item name
  const menuItemGroups = new Map<string, MenuItem[]>();
  menuItems.forEach(item => {
    if (!menuItemGroups.has(item.menuItemName)) {
      menuItemGroups.set(item.menuItemName, []);
    }
    menuItemGroups.get(item.menuItemName)!.push(item);
  });

  const summary: MenuSummary[] = [];

  menuItemGroups.forEach((items, menuItemName) => {
    let totalCost = 0;
    let sellingPrice = 0;

    items.forEach(item => {
      const ingredient = ingredientMap.get(item.ingredientName);
      if (ingredient) {
        // Calculate cost for this ingredient
        const cost = (ingredient.costPerUnit * item.qtyUsed);
        totalCost += cost;
      }

      // Get selling price (should be the same for all items in a group)
      if (item.sellingPrice > 0) {
        sellingPrice = item.sellingPrice;
      }
    });

    const gpPounds = sellingPrice - totalCost;
    const gpPercent = sellingPrice > 0 ? (gpPounds / sellingPrice) * 100 : 0;

    summary.push({
      menuItem: menuItemName,
      cost: Math.round(totalCost * 100) / 100,
      price: sellingPrice,
      gpPounds: Math.round(gpPounds * 100) / 100,
      gpPercent: Math.round(gpPercent * 10) / 10,
    });
  });

  return summary;
}

// Update menu summary sheet
export async function updateMenuSummarySheet(summary: MenuSummary[]): Promise<void> {
  const summaryData = [
    ['Menu Item Name', 'Total Food Cost (£)', 'Selling Price (£)', 'GP £', 'GP %'],
    ...summary.map(item => [
      item.menuItem,
      item.cost,
      item.price,
      item.gpPounds,
      item.gpPercent,
    ]),
  ];

  await writeSheetData('MenuSummary', summaryData);
  console.log('✅ MenuSummary sheet updated');
}

// Initialize spreadsheet with all data
export async function initializeSpreadsheet(): Promise<string> {
  try {
    const spreadsheetId = await getSpreadsheetId();
    await populateIngredientsSheet();
    await populateMenuItemsSheet();
    
    // Calculate and update summary
    const ingredientsData = await getSheetData('Ingredients');
    const menuItemsData = await getSheetData('MenuItems');
    
    // Convert to proper format
    const ingredients: Ingredient[] = ingredientsData.slice(1).map(row => ({
      name: row[0],
      unit: row[1],
      unitCost: parseFloat(row[2]) || 0,
      packSize: parseFloat(row[3]) || 0,
      costPerUnit: parseFloat(row[4]) || 0,
      supplier: row[5],
      category: row[6],
    }));

    const menuItems: MenuItem[] = menuItemsData.slice(1).map(row => ({
      menuItemName: row[0],
      ingredientName: row[1],
      qtyUsed: parseFloat(row[2]) || 0,
      unit: row[3],
      autoCost: parseFloat(row[4]) || 0,
      sellingPrice: parseFloat(row[5]) || 0,
    }));

    const summary = calculateGP(menuItems, ingredients);
    await updateMenuSummarySheet(summary);

    console.log('✅ Google Sheet created and populated successfully');
    return spreadsheetId;
  } catch (error) {
    console.error('Error initializing spreadsheet:', error);
    throw error;
  }
}

// Get public URL of the spreadsheet (mock)
export async function getSpreadsheetUrl(): Promise<string> {
  const spreadsheetId = await getSpreadsheetId();
  console.log('📊 Mock: Generated spreadsheet URL for demonstration');
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
}
