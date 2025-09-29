// Debug email functionality
const dotenv = require('dotenv');
dotenv.config();

console.log('=== Email Debug Script ===\n');

// Check environment variables
console.log('Environment Variables:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? `✓ SET (${process.env.EMAIL_USER})` : '✗ NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ SET (HIDDEN)' : '✗ NOT SET');
console.log('SMTP_HOST:', process.env.SMTP_HOST || 'Not set (using default: smtp.gmail.com)');
console.log('SMTP_PORT:', process.env.SMTP_PORT || 'Not set (using default: 465)');
console.log('SMTP_SECURE:', process.env.SMTP_SECURE || 'Not set (using default based on port)');

console.log('\n=== Testing Email Configuration ===');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('❌ ERROR: EMAIL_USER and EMAIL_PASS are required!');
  console.log('Please check your .env.local file.');
  process.exit(1);
}

// Test the email sending
async function testEmail() {
  try {
    const { sendPasswordResetEmail } = require('./lib/email.js');
    
    const testEmail = process.env.EMAIL_USER; // Send to the same email used for sending
    // Use environment variable for base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const testUrl = `${baseUrl}/reset-password?email=` + encodeURIComponent(testEmail);
    
    console.log('\nSending test password reset email to:', testEmail);
    console.log('Reset URL:', testUrl);
    
    const result = await sendPasswordResetEmail(testEmail, testUrl);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    
    console.log('\n✅ All tests passed! Email functionality is working correctly.');
  } catch (error) {
    console.log('❌ Failed to send email:');
    console.log('Error:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Check if your Gmail credentials are correct');
    console.log('2. Ensure you\'re using an App Password, not your regular Gmail password');
    console.log('3. Check if Gmail 2-factor authentication is enabled');
    console.log('4. Verify that the email address is correct');
    console.log('5. Check your spam/junk folder for the email');
  }
}

testEmail();