import { NextRequest, NextResponse } from 'next/server';
import { 
  getSheetData, 
  calculateGP, 
  updateMenuSummarySheet, 
  initializeSpreadsheet,
  getSpreadsheetUrl,
  Ingredient,
  MenuItem,
  MenuSummary
} from '@/utils/sheets';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Starting data ingestion...');

    // Initialize spreadsheet if needed
    const spreadsheetId = await initializeSpreadsheet();
    console.log('📊 Spreadsheet ID:', spreadsheetId);

    // Get data from sheets
    const ingredientsData = await getSheetData('Ingredients');
    const menuItemsData = await getSheetData('MenuItems');

    console.log('📋 Ingredients rows:', ingredientsData.length);
    console.log('🍔 Menu items rows:', menuItemsData.length);

    // Convert to proper format
    const ingredients: Ingredient[] = ingredientsData.slice(1).map(row => ({
      name: row[0] || '',
      unit: row[1] || '',
      unitCost: parseFloat(row[2]) || 0,
      packSize: parseFloat(row[3]) || 0,
      costPerUnit: parseFloat(row[4]) || 0,
      supplier: row[5] || '',
      category: row[6] || '',
    }));

    const menuItems: MenuItem[] = menuItemsData.slice(1).map(row => ({
      menuItemName: row[0] || '',
      ingredientName: row[1] || '',
      qtyUsed: parseFloat(row[2]) || 0,
      unit: row[3] || '',
      autoCost: parseFloat(row[4]) || 0,
      sellingPrice: parseFloat(row[5]) || 0,
    }));

    // Calculate GP
    const summary = calculateGP(menuItems, ingredients);
    console.log('💰 Calculated GP for', summary.length, 'menu items');

    // Update menu summary sheet
    await updateMenuSummarySheet(summary);

    // Format response
    const response = summary.map(item => ({
      MenuItem: item.menuItem,
      Cost: item.cost,
      Price: item.price,
      'GP£': item.gpPounds,
      'GP%': item.gpPercent,
    }));

    // Get public URL
    const publicUrl = await getSpreadsheetUrl();

    console.log('✅ Data ingestion completed successfully');
    console.log('🔗 Public URL:', publicUrl);

    return NextResponse.json({
      success: true,
      data: response,
      spreadsheetId,
      publicUrl,
      message: 'Data ingested and calculations completed successfully',
    });

  } catch (error) {
    console.error('❌ Error during data ingestion:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to ingest data and calculate GP',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'initialize') {
      console.log('🚀 Initializing new spreadsheet...');
      const spreadsheetId = await initializeSpreadsheet();
      const publicUrl = await getSpreadsheetUrl();

      return NextResponse.json({
        success: true,
        spreadsheetId,
        publicUrl,
        message: 'Spreadsheet initialized successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Error during POST request:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
