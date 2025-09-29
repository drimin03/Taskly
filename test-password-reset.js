// Simple test for password reset functionality
const dotenv = require('dotenv');
dotenv.config();

console.log('Testing password reset functionality...\n');

// Check if required environment variables are loaded
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✓ SET' : '✗ NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ SET' : '✗ NOT SET');
console.log('SMTP_HOST:', process.env.SMTP_HOST ? '✓ SET' : '✗ NOT SET');

if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.SMTP_HOST) {
  console.log('\n✅ All required environment variables are loaded!');
  console.log('Password reset functionality should work correctly.');
  
  // Test the actual email sending
  const { sendEmail } = require('./lib/email.js');
  
  // Simple test email
  const testEmail = {
    to: process.env.EMAIL_USER,
    subject: 'Test Password Reset Functionality',
    text: 'This is a test email to verify password reset functionality is working.',
    html: '<p>This is a <strong>test email</strong> to verify password reset functionality is working.</p>'
  };
  
  console.log('\nSending test email...');
  
  sendEmail(testEmail)
    .then(result => {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.messageId);
    })
    .catch(error => {
      console.log('❌ Failed to send email:');
      console.log('Error:', error.message);
    });
} else {
  console.log('\n❌ Required environment variables are not loaded properly.');
  console.log('Please check your .env.local file and make sure it\'s formatted correctly.');
  console.log('Also ensure you\'re running this in the correct environment.');
}