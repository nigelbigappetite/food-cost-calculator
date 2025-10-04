# Google Sheets API Setup Guide

## 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

## 2. Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in details:
   - Name: "Wing Shack Food Cost Calculator"
   - Description: "Service account for food cost calculations"
4. Click "Create and Continue"
5. Skip role assignment for now
6. Click "Done"

## 3. Generate Service Account Key

1. Click on your service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Choose "JSON" format
5. Download the key file

## 4. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

Replace the values with:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: From the downloaded JSON file (client_email)
- `GOOGLE_PRIVATE_KEY`: From the downloaded JSON file (private_key) - keep the quotes and \n characters

## 5. Share Spreadsheet (Optional)

If you want to manually create a spreadsheet:
1. Create a new Google Sheet
2. Name it "Wing Shack Food Cost Prototype"
3. Share it with your service account email (give Editor access)
4. Add the spreadsheet ID to your `.env.local`:

```env
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id-here
```

## 6. Test the Setup

1. Run `npm run dev`
2. Go to `http://localhost:3000/foodcost`
3. Click "Initialize New Sheet"
4. Check the console for success messages

## Troubleshooting

- **403 Forbidden**: Check that the Google Sheets API is enabled
- **401 Unauthorized**: Verify your service account credentials
- **404 Not Found**: The spreadsheet might not exist or not be shared with the service account
- **Rate Limit**: You might be hitting API limits, wait a few minutes

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your service account key secure
- Consider using environment variables in production (Vercel, etc.)
