// Test custom email functionality
const dotenv = require('dotenv');
dotenv.config();

console.log('Testing custom email functionality...\n');

// Check if required environment variables are loaded
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✓ SET' : '✗ NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ SET' : '✗ NOT SET');
console.log('SMTP_HOST:', process.env.SMTP_HOST ? '✓ SET' : '✗ NOT SET');

if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.SMTP_HOST) {
  console.log('\n✅ All required environment variables are loaded!');
  
  // Test the actual email sending
  const { sendPasswordResetEmail } = require('./lib/email.js');
  
  // Test password reset email
  const testEmail = process.env.EMAIL_USER; // Send to the same email used for sending
  // Use environment variable for base URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const testUrl = `${baseUrl}/reset-password?email=` + encodeURIComponent(testEmail);
  
  console.log('\nSending test password reset email...');
  
  sendPasswordResetEmail(testEmail, testUrl)
    .then(result => {
      console.log('✅ Password reset email sent successfully!');
      console.log('Message ID:', result.messageId);
    })
    .catch(error => {
      console.log('❌ Failed to send password reset email:');
      console.log('Error:', error.message);
    });
} else {
  console.log('\n❌ Required environment variables are not loaded properly.');
  console.log('Please check your .env.local file and make sure it\'s formatted correctly.');
}