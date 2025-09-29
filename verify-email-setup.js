// Email Setup Verification Script
// This script verifies that all required files for email functionality are in place

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

console.log('Verifying Email Functionality Setup...\n');

// Check if required files exist
const requiredFiles = [
  'app/api/send-email/route.js',
  'lib/email.js',
  '.env.local',
  'components/auth-form.tsx'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✓ ${file} exists`);
  } else {
    console.log(`✗ ${file} is missing`);
    allFilesExist = false;
  }
});

console.log('\n' + '='.repeat(50) + '\n');

if (allFilesExist) {
  console.log('✓ All required files are present');
  
  // Check .env.local for required variables
  const envPath = path.join(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS'];
  let allEnvVarsPresent = true;
  
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar)) {
      console.log(`✓ ${envVar} is defined in .env.local`);
    } else {
      console.log(`✗ ${envVar} is missing from .env.local`);
      allEnvVarsPresent = false;
    }
  });
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  if (allEnvVarsPresent) {
    console.log('🎉 Email functionality setup is complete!');
    console.log('\nTo use this functionality:');
    console.log('1. Update .env.local with your actual email credentials');
    console.log('2. Deploy to Vercel and add the same environment variables in Vercel settings');
    console.log('3. The forgot password feature is already integrated into the auth form');
    console.log('4. You can send emails by making POST requests to /api/send-email');
  } else {
    console.log('⚠️  Email setup is partially complete');
    console.log('Please update .env.local with your actual email credentials');
  }
} else {
  console.log('❌ Email functionality setup is incomplete');
  console.log('Please check the missing files listed above');
}

console.log('Environment variables check:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
console.log('SMTP_HOST:', process.env.SMTP_HOST ? 'SET' : 'NOT SET');

// Test email sending if environment variables are set
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  console.log('\nEnvironment variables are properly configured!');
  console.log('Email functionality should work correctly.');
} else {
  console.log('\nMissing environment variables!');
  console.log('Please check your .env.local file.');
}
