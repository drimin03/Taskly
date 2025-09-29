# Email Functionality Setup

This document explains how to use the email functionality in this Next.js application.

## API Route

The email API route is located at `/app/api/send-email/route.js`. It accepts POST requests with the following body structure:

```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "text": "Plain text content (optional)",
  "html": "<p>HTML content (optional)</p>"
}
```

## Environment Variables

To use the email functionality, you need to set the following environment variables in your `.env.local` file:

```
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your-app-password
```

For other providers, you can also set:

```
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
```

## Switching Email Providers

To switch from Gmail to another email provider (like SendGrid or Mailgun), you only need to change the environment variables:

1. Update the `SMTP_HOST`, `SMTP_PORT`, and `SMTP_SECURE` values
2. Update the `EMAIL_USER` and `EMAIL_PASS` with the appropriate credentials for your provider

## Forgot Password Functionality

The authentication form includes a "Forgot Password" option that sends a password reset email using Firebase's built-in functionality. 

To use the custom email service instead, uncomment the relevant section in the `handleSubmit` function in `components/auth-form.tsx`.

## Vercel Deployment

When deploying to Vercel:

1. Add your environment variables in the Vercel project settings
2. The API route will automatically work with Vercel's serverless functions
3. No additional configuration is needed for the email functionality to work on Vercel