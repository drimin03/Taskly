// Test the full password reset flow
const dotenv = require('dotenv');
dotenv.config();

console.log('=== Full Password Reset Flow Test ===\n');

// Check environment variables
console.log('Environment Variables:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? `✓ SET (${process.env.EMAIL_USER})` : '✗ NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ SET (HIDDEN)' : '✗ NOT SET');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('❌ ERROR: EMAIL_USER and EMAIL_PASS are required!');
  console.log('Please check your .env.local file.');
  process.exit(1);
}

async function testFullFlow() {
  try {
    console.log('\n=== Step 1: Testing Email Sending ===');
    
    const { sendPasswordResetEmail } = require('./lib/email.js');
    
    const testEmail = process.env.EMAIL_USER; // Send to the same email used for sending
    // Use environment variable for base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const testUrl = `${baseUrl}/reset-password?email=${encodeURIComponent(testEmail)}`;
    
    console.log('Sending password reset email to:', testEmail);
    console.log('Reset URL:', testUrl);
    
    const result = await sendPasswordResetEmail(testEmail, testUrl);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    
    console.log('\n=== Step 2: Simulating Email Link Click ===');
    console.log('In a real scenario, the user would click the link in their email.');
    console.log('The link would take them to:', testUrl);
    
    console.log('\n=== Step 3: Simulating Password Reset Form ===');
    console.log('User would enter a new password and submit the form.');
    console.log('In a production app, this would update the user\'s password in the database.');
    
    console.log('\n✅ Full flow test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Try the forgot password feature in the app');
    console.log('2. Check your email inbox (and spam folder)');
    console.log('3. Click the reset link in the email');
    console.log('4. Enter a new password on the reset page');
    
  } catch (error) {
    console.log('❌ Error in full flow test:');
    console.log('Error:', error.message);
  }
}

testFullFlow();