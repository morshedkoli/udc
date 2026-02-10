# Google Sheets Database Setup Guide

This application now uses Google Sheets as its database instead of MongoDB. Follow these steps to set it up:

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter a project name (e.g., "Service Logger Dashboard")
4. Click **Create**

## Step 2: Enable Google Sheets API

1. In your Google Cloud project, go to **APIs & Services** → **Library**
2. Search for "Google Sheets API"
3. Click on it and press **Enable**

## Step 3: Create a Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Enter a name (e.g., "sheets-service-account")
4. Click **Create and Continue**
5. Skip the optional steps and click **Done**

## Step 4: Generate Service Account Key

1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON** format
5. Click **Create** - a JSON file will be downloaded

## Step 5: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "Service Logger Dashboard" (or any name you prefer)
4. Copy the **Sheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the long string between `/d/` and `/edit`

## Step 6: Share the Sheet with Service Account

1. In your Google Sheet, click the **Share** button
2. Paste the service account email from the JSON file (looks like: `your-service-account@your-project.iam.gserviceaccount.com`)
3. Give it **Editor** permissions
4. Uncheck "Notify people"
5. Click **Share**

## Step 7: Configure Environment Variables

1. Open the `.env.local` file in your project
2. Replace the placeholders with your actual values:

```env
GOOGLE_SHEET_ID=your_actual_sheet_id_from_step_5
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...paste_entire_json_content_here..."}
```

**Important:** 
- For `GOOGLE_SHEET_ID`: Paste just the Sheet ID (the long string from the URL)
- For `GOOGLE_SERVICE_ACCOUNT_KEY`: Paste the **entire contents** of the downloaded JSON file as a single line (no line breaks)

### Example:

```env
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"my-project-123","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...","client_email":"sheets-service@my-project.iam.gserviceaccount.com",...}
```

## Step 8: Restart Your Development Server

1. Stop the current dev server (Ctrl+C in terminal)
2. Run `npm run dev` again
3. The app will automatically create the necessary sheets and populate default data

## Sheet Structure

The application will automatically create two sheets:

### 1. **services** sheet
Columns: `id`, `serviceName`, `serviceDate`, `amountPaid`, `customerGender`, `notes`

### 2. **serviceOptions** sheet
Columns: `name`

Default service options will be automatically populated.

## Troubleshooting

### Error: "GOOGLE_SHEET_ID environment variable is required"
- Make sure you've set the `GOOGLE_SHEET_ID` in `.env.local`
- Restart the dev server after updating `.env.local`

### Error: "The caller does not have permission"
- Make sure you've shared the Google Sheet with the service account email
- The service account needs **Editor** permissions

### Error: "Invalid JSON in GOOGLE_SERVICE_ACCOUNT_KEY"
- Make sure the JSON is on a single line with no line breaks
- Make sure all quotes are properly escaped
- Copy the entire content from the downloaded JSON file

## Benefits of Using Google Sheets

✅ **No database setup required** - Just create a Google Sheet  
✅ **Free forever** - No hosting costs  
✅ **Easy to view/edit data** - Use Google Sheets interface  
✅ **Automatic backups** - Google handles it  
✅ **Collaborative** - Share with team members  
✅ **No connection issues** - No IP whitelisting needed  

---

**Need help?** Check the console for detailed error messages.
