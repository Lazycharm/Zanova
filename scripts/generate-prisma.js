#!/usr/bin/env node

// Script to generate Prisma Client without requiring execute permissions
const { execSync } = require('child_process');
const path = require('path');

try {
  // Try using npx first (most reliable)
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('Prisma Client generated successfully!');
} catch (error) {
  console.error('Failed to generate Prisma Client:', error.message);
  process.exit(1);
}
