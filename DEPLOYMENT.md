# Deployment Guide for Food Cost Calculator

## Option 1: Deploy via Vercel Web Interface (Recommended)

1. **Push to GitHub:**
   ```bash
   # Create a new repository on GitHub first, then:
   git remote add origin https://github.com/YOUR_USERNAME/food-cost-calculator.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your `food-cost-calculator` repository
   - Vercel will automatically detect it's a Next.js project
   - Click "Deploy"

## Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

## Option 3: Manual GitHub + Vercel Setup

1. **Create GitHub Repository:**
   - Go to GitHub.com
   - Create a new repository called `food-cost-calculator`
   - Don't initialize with README (we already have files)

2. **Push Your Code:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/food-cost-calculator.git
   git branch -M main
   git push -u origin main
   ```

3. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub
   - Select your `food-cost-calculator` repository
   - Deploy!

## What Happens Next

Once deployed, Vercel will:
- Automatically build your Next.js application
- Deploy it to a global CDN
- Give you a live URL (like `https://food-cost-calculator-abc123.vercel.app`)
- Set up automatic deployments when you push to GitHub

## Troubleshooting

If you encounter issues:
1. Check the Vercel build logs in the dashboard
2. Make sure all dependencies are in `package.json`
3. Ensure your code builds locally first with `npm run build`

## Your Live URL

After successful deployment, you'll get a URL like:
`https://food-cost-calculator-abc123.vercel.app`

You can also set up a custom domain in the Vercel dashboard if needed.
