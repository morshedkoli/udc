# Vercel Deployment Guide

This project is optimized for deployment on Vercel. Follow these steps to deploy:

## 1. Environment Variables

You must set the following environment variables in your Vercel project settings:

- `GOOGLE_SHEET_ID`: The ID of your Google Sheet.
- `GOOGLE_SERVICE_ACCOUNT_KEY`: The **entire JSON content** of your service account key file.
  - **Important:** Ensure the JSON is stringified correctly. In Vercel, you can usually paste the JSON directly into the value field. It should look like `{"type": "service_account", ...}`.

## 2. Build Settings

- **Framework Preset:** Next.js
- **Build Command:** `next build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

## 3. Optimizations Included

- **Fonts:** Configured `next/font/google` for optimal loading and zero layout shift.
- **Security:** Added security headers (HSTS, X-XSS-Protection, etc.) in `next.config.ts`.
- **Dynamic Imports:** PDF generation libraries (`jspdf`, `html2canvas`) are loaded dynamically to reduce initial bundle size.
- **Type Safety:** Improved TypeScript types for Google Sheets API integration.

## 4. Troubleshooting

If you encounter issues with the Google Service Account Key:
- ensure there are no extra spaces or newlines if pasting as a single line string.
- If using Vercel CLI, you might need to wrap the JSON in quotes.
