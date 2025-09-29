# Email Functionality - Complete Setup Guide

## Overview
This document provides a complete guide to using the email functionality that has been implemented in your Next.js application. The implementation includes:

1. An API route for sending emails via POST requests
2. A reusable email utility library
3. Forgot password functionality integrated into the authentication form
4. Environment variable configuration for different email providers
5. Vercel deployment compatibility

## Files Created

### 1. API Route: `/app/api/send-email/route.js`
- Handles POST requests for sending emails
- Validates required fields (to, subject)
- Uses the email utility library to send emails
- Returns appropriate success or error responses

### 2. Email Utility: `/lib/email.ts` (compiled to `/lib/email.js`)
- Reusable functions for sending emails
- Configurable for different SMTP providers
- Includes password reset email template
- Type-safe implementation with TypeScript

### 3. Environment Configuration: `/.env.local`
- Contains all necessary environment variables
- Pre-configured for Gmail SMTP
- Easily switchable to other providers

### 4. Authentication Form: `/components/auth-form.tsx`
- Integrated "Forgot Password" functionality
- Uses Firebase's built-in password reset by default
- Custom email service option available (commented out)

### 5. Test Page: `/app/email-test/page.tsx`
- Client-side interface for testing email functionality
- Allows sending test emails directly from the browser

## How to Use

### 1. Configure Environment Variables
Update the `.env.local` file with your actual email credentials:

```env
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=your-actual-app-password

# For Gmail (default)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true

# For other providers, uncomment and modify as needed:
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_SECURE=false
```

### 2. Sending Emails via API
Make a POST request to `/api/send-email` with the following JSON body:

```javascript
fetch('/api/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: 'recipient@example.com',
    subject: 'Your Subject',
    text: 'Plain text content',
    html: '<p>HTML content</p>',
  }),
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### 3. Forgot Password Functionality
The authentication form now includes a "Forgot Password" option that:
1. Collects the user's email address
2. Sends a password reset email using Firebase's built-in functionality
3. Provides user feedback via toast notifications

To use the custom email service instead of Firebase's built-in one:
1. Open `/components/auth-form.tsx`
2. Find the commented section in the `handleSubmit` function for mode "forgot-password"
3. Uncomment the custom email service code
4. Comment out the Firebase password reset code

### 4. Using the Email Utility Directly
You can import and use the email utility functions in any server-side code:

```javascript
import { sendEmail, sendPasswordResetEmail } from '@/lib/email';

// Send a custom email
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  text: 'Thanks for signing up!',
  html: '<p>Thanks for signing up!</p>',
});

// Send a password reset email
await sendPasswordResetEmail('user@example.com', 'https://yoursite.com/reset-password?token=abc123');
```

## Switching Email Providers

To switch from Gmail to another email provider (like SendGrid or Mailgun):

1. Update the `SMTP_HOST`, `SMTP_PORT`, and `SMTP_SECURE` values in `.env.local`
2. Update the `EMAIL_USER` and `EMAIL_PASS` with the appropriate credentials for your provider

Example for SendGrid:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

## Deployment to Vercel

1. Push your code to your Git repository
2. Connect your repository to Vercel
3. Add your environment variables in the Vercel project settings:
   - EMAIL_USER
   - EMAIL_PASS
   - SMTP_HOST (optional, defaults to Gmail)
   - SMTP_PORT (optional, defaults to 465)
   - SMTP_SECURE (optional, defaults to true)

The email functionality will work automatically with Vercel's serverless functions.

## Testing

You can test the email functionality in several ways:

1. Visit `/email-test` in your application to send test emails
2. Use the "Forgot Password" option on the authentication page
3. Make direct API calls to `/api/send-email`
4. Run the verification script: `node verify-email-setup.js`

## Security Notes

- Never commit actual credentials to your repository
- Use application-specific passwords for Gmail
- Store sensitive environment variables securely in Vercel
- Consider using more secure authentication methods for production applications

## Troubleshooting

If emails aren't sending:

1. Verify your environment variables are set correctly
2. Check that your SMTP credentials are valid
3. Ensure your SMTP provider allows connections from Vercel IPs
4. Check the Vercel function logs for error details
5. Verify that your email provider isn't blocking the connection due to security settings

## Support

For additional help with the email functionality, refer to:
- The implementation details in the files listed above
- The Nodemailer documentation: https://nodemailer.com/
- The Next.js API routes documentation: https://nextjs.org/docs/pages/building-your-application/routing/api-routes