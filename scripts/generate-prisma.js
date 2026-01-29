#!/usr/bin/env node

// Script to generate Prisma Client without requiring execute permissions
// Uses Node.js to directly execute Prisma's CLI script

const path = require('path');
const { execSync } = require('child_process');

console.log('Generating Prisma Client...');

try {
  // Find Prisma CLI entry point
  const prismaPath = path.join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js');
  
  // Use Node.js to execute Prisma CLI script directly (bypasses binary permission issues)
  execSync(`node "${prismaPath}" generate`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: process.env,
    shell: true
  });
  
  console.log('Prisma Client generated successfully!');
} catch (error) {
  console.error('Failed to generate Prisma Client:', error.message);
  console.error('Error details:', error);
  process.exit(1);
}
