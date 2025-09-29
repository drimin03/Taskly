// Email Functionality Test
// This test verifies that the email functionality is properly set up

const { sendEmail } = require('../lib/email');

// Simple test function to verify email configuration
function testEmailConfig() {
  // This test verifies that the environment variables are set
  if (!process.env.EMAIL_USER) {
    throw new Error('EMAIL_USER environment variable is not defined');
  }
  
  if (!process.env.EMAIL_PASS) {
    throw new Error('EMAIL_PASS environment variable is not defined');
  }
  
  console.log('Email configuration test passed');
}

// Simple test function to verify sendEmail function
function testSendEmailFunction() {
  // This test verifies that the sendEmail function is properly exported
  if (typeof sendEmail !== 'function') {
    throw new Error('sendEmail is not a function');
  }
  
  console.log('sendEmail function test passed');
}

// Run tests
try {
  testEmailConfig();
  testSendEmailFunction();
  console.log('All email tests passed');
} catch (error) {
  console.error('Email test failed:', error.message);
  process.exit(1);
}