#!/usr/bin/env node

// Script to generate Prisma Client without requiring execute permissions
// Uses Node.js to directly call Prisma's generate function

const path = require('path');
const { spawn } = require('child_process');

// Find the Prisma CLI entry point
const prismaPath = path.join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js');

console.log('Generating Prisma Client...');

// Use Node.js to directly execute the Prisma CLI script
const prismaProcess = spawn('node', [prismaPath, 'generate'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

prismaProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Prisma generate failed with exit code ${code}`);
    process.exit(1);
  } else {
    console.log('Prisma Client generated successfully!');
  }
});

prismaProcess.on('error', (error) => {
  console.error('Failed to generate Prisma Client:', error.message);
  process.exit(1);
});
