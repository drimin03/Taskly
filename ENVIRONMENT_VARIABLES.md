# Environment Variables Configuration

This document explains how to configure environment variables for different deployment environments.

## Required Environment Variables

### Base URL Configuration
- `NEXT_PUBLIC_BASE_URL`: The base URL of your application (e.g., http://localhost:3000 for development, https://yourdomain.com for production)

### Email Configuration
These are typically stored in `.env.local` and should not be committed to version control:
- `EMAIL_USER`: Your email address for sending emails
- `EMAIL_PASS`: Your email password or app-specific password
- `SMTP_HOST`: SMTP server host (optional, defaults to Gmail's SMTP)
- `SMTP_PORT`: SMTP server port (optional)
- `SMTP_SECURE`: Whether to use SSL/TLS (optional)

## Setup Instructions

### Development Environment
1. Create a `.env` file in the root directory with:
   ```
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

2. Create a `.env.local` file in the root directory with your email credentials:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

### Production Environment (Vercel)
1. In your Vercel project settings, add the following environment variables:
   - `NEXT_PUBLIC_BASE_URL`: Set to your production domain (e.g., https://yourdomain.com)
   - `EMAIL_USER`: Your production email address
   - `EMAIL_PASS`: Your production email password or app-specific password

## Notes
- The `NEXT_PUBLIC_BASE_URL` is used to construct URLs in emails and should match your deployment URL
- Never commit `.env.local` to version control as it contains sensitive information
- The application will fall back to `http://localhost:3000` if `NEXT_PUBLIC_BASE_URL` is not set