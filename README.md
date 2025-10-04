# Food Cost Calculator

A comprehensive food cost breakdown calculator for Hungry Tum Brands, designed to calculate food costs, gross profit percentages, and ingredient breakdowns for restaurant menu items using CSV data ingestion.

## Features

- **CSV Data Import**: Upload ingredients and menu data via CSV files
- **Smart Ingredient Matching**: Automatically matches menu ingredients with your ingredient database
- **Accurate Cost Calculations**: Calculates cost per unit from bulk purchases (e.g., 112 slices of cheese at £10 = £0.089 per slice)
- **Real-time Calculations**: Automatic calculation of:
  - Total food cost per menu item
  - Gross profit (£) per menu item
  - Gross profit percentage (%) per menu item
  - Brand-wide totals and averages
- **Detailed Breakdowns**: View ingredient costs and percentages of total food cost
- **Export Results**: Download calculated results as CSV
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

Or use the Vercel CLI:
```bash
npm i -g vercel
vercel
```

## How to Use

### Step 1: Prepare Your Data Files

**Ingredients CSV Format:**
```csv
Name,Purchase Price,Quantity,Unit
Cheese,10.00,112,slices
Chicken Breast,15.00,2,kg
Flour,2.50,5,kg
```

**Menu Items CSV Format:**
```csv
Name,Selling Price,Cheese (slices),Qty,Flour (kg),Qty,Chicken Breast (kg),Qty
Margherita Pizza,12.00,Cheese,3,Flour,0.3,Chicken Breast,0
Chicken Pizza,15.00,Cheese,3,Flour,0.3,Chicken Breast,0.2
```

### Step 2: Upload Your Data
1. Upload your ingredients CSV file
2. Upload your menu items CSV file
3. The system will automatically validate and load your data

### Step 3: Calculate Food Costs
1. Click "Calculate Food Costs" to process all menu items
2. View detailed breakdowns for each menu item
3. See brand-wide summary statistics
4. Download results as CSV for further analysis

### Step 4: Analyze Results
- **Food Cost per Item**: Exact cost based on ingredient usage
- **Gross Profit**: Selling price minus food cost
- **GP Percentage**: Profit margin as a percentage
- **Ingredient Breakdown**: Cost and percentage of each ingredient

## Example Usage

### Sample Menu Item: Chicken Wings
- **Selling Price**: £8.50
- **Ingredients**:
  - Chicken Wings: 0.5kg @ £4.00/kg = £2.00
  - Buffalo Sauce: 0.1 liter @ £3.00/liter = £0.30
  - Seasoning: 0.05kg @ £2.00/kg = £0.10
- **Total Food Cost**: £2.40
- **Gross Profit**: £6.10
- **Gross Profit %**: 71.76%

### Customization Example
- **Extra Cheese**: +£1.50 additional cost
- **Extra Sauce**: +£0.20 additional cost

## Technical Details

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel

## File Structure

```
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main calculator page
├── types/
│   └── index.ts             # TypeScript type definitions
├── utils/
│   └── calculations.ts      # Calculation logic
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary to Hungry Tummy Brands.
