/**
 * Environment Variables Validation
 * Ensures all required environment variables are set
 */

const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_APP_PASSWORD',
];

const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\nPlease set all required environment variables before starting the application.');
  process.exit(1);
}

console.log('✅ All required environment variables are configured');
