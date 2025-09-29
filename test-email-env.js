require('dotenv').config({ path: '.env' });

console.log('Checking environment variables for email functionality...\n');

console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
console.log('SMTP_HOST:', process.env.SMTP_HOST ? 'SET' : 'NOT SET');

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  console.log('\n✅ Environment variables appear to be set!');
  console.log('Email functionality should work correctly.');
} else {
  console.log('\n⚠️  Environment variables are missing!');
  console.log('Please check your .env.local file.');
}