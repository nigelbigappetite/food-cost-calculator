# Food Cost Calculator

A comprehensive food cost breakdown calculator for Hungry Tummy Brands, designed to calculate food costs, gross profit percentages, and ingredient breakdowns for restaurant menu items.

## Features

- **Menu Item Management**: Add and manage menu items with selling prices
- **Ingredient Tracking**: Track ingredients with purchase prices, units, and quantities used
- **Customization Support**: Add customizations with additional costs and ingredients
- **Real-time Calculations**: Automatic calculation of:
  - Total food cost per menu item
  - Gross profit (£) per menu item
  - Gross profit percentage (%) per menu item
  - Brand-wide totals and averages
- **Detailed Breakdowns**: View ingredient costs and percentages of total food cost
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

### Adding a Brand
1. Enter the brand name in the "Brand Information" section

### Adding Menu Items
1. Enter the menu item name and selling price
2. Add ingredients with their purchase prices, units, and quantities used
3. Optionally add customizations with additional costs
4. Click "Add Menu Item" to save

### Calculating Results
1. Add one or more menu items
2. Click "Calculate Results" to see the breakdown
3. View detailed ingredient costs, gross profits, and percentages

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
