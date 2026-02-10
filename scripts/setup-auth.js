#!/usr/bin/env node

/**
 * Quick setup script for authentication system
 * Generates JWT secrets and updates .env file
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 Setting up DropIQ Authentication System...\n');

// Generate secure random secrets
const generateSecret = () => crypto.randomBytes(64).toString('hex');

const jwtSecret = generateSecret();
const jwtRefreshSecret = generateSecret();

console.log('✅ Generated JWT secrets');

// Read .env file or create from template
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Found existing .env file');
} else if (fs.existsSync(envExamplePath)) {
  envContent = fs.readFileSync(envExamplePath, 'utf8');
  console.log('✅ Created .env from .env.example');
} else {
  console.error('❌ Error: No .env or .env.example file found');
  process.exit(1);
}

// Update or add JWT secrets
if (envContent.includes('JWT_SECRET=')) {
  envContent = envContent.replace(
    /JWT_SECRET=.*/,
    `JWT_SECRET=${jwtSecret}`
  );
} else {
  envContent += `\nJWT_SECRET=${jwtSecret}`;
}

if (envContent.includes('JWT_REFRESH_SECRET=')) {
  envContent = envContent.replace(
    /JWT_REFRESH_SECRET=.*/,
    `JWT_REFRESH_SECRET=${jwtRefreshSecret}`
  );
} else {
  envContent += `\nJWT_REFRESH_SECRET=${jwtRefreshSecret}`;
}

// Write updated .env file
fs.writeFileSync(envPath, envContent);
console.log('✅ Updated .env with JWT secrets\n');

console.log('📋 Next steps:\n');
console.log('1. Install dependencies:');
console.log('   npm install\n');
console.log('2. Run database migration:');
console.log('   psql -U your_user -d your_db -f src/database/migrations/003_auth_system.sql\n');
console.log('3. Start server:');
console.log('   npm run dev\n');
console.log('4. Test authentication:');
console.log('   curl -X POST http://localhost:3000/api/auth/signup \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"email":"test@example.com","password":"Test123456"}\'\n');
console.log('📖 Full documentation: docs/AUTHENTICATION.md\n');
console.log('✨ Setup complete!');
