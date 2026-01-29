#!/usr/bin/env node

// Script to generate Prisma Client without requiring execute permissions
// Uses Prisma's programmatic API directly

const path = require('path');
const { execSync } = require('child_process');

console.log('Generating Prisma Client...');

try {
  // Try multiple methods to ensure it works on Hostinger
  const methods = [
    // Method 1: Use node to execute Prisma CLI directly
    () => {
      const prismaPath = path.join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js');
      execSync(`node "${prismaPath}" generate`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
        env: process.env
      });
    },
    // Method 2: Use require to load Prisma CLI programmatically
    () => {
      const prismaCli = require(path.join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js'));
      // Prisma CLI exports a main function that takes process.argv
      const originalArgv = process.argv.slice();
      process.argv = ['node', 'prisma', 'generate'];
      try {
        prismaCli.main();
      } finally {
        process.argv = originalArgv;
      }
    }
  ];

  // Try first method (most reliable)
  try {
    methods[0]();
    console.log('Prisma Client generated successfully!');
  } catch (error) {
    console.log('Method 1 failed, trying alternative...');
    methods[1]();
    console.log('Prisma Client generated successfully!');
  }
} catch (error) {
  console.error('Failed to generate Prisma Client:', error.message);
  console.error('Error details:', error);
  process.exit(1);
}
