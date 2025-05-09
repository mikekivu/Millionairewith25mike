#!/usr/bin/env node

// This script is a wrapper for both PostgreSQL and MySQL database exports

console.log("=== MillionareWith$25 Database Export Tool ===");
console.log("Choose export format:");
console.log("1. PostgreSQL (for Neon database)");
console.log("2. MySQL (for cPanel/phpMyAdmin)");

// Read user input
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Enter your choice (1 or 2): ', (choice) => {
  readline.close();
  
  if (choice === '1') {
    console.log("\nGenerating PostgreSQL export...");
    require('./scripts/generate-sql-export.js');
  } else if (choice === '2') {
    console.log("\nGenerating MySQL export...");
    require('./scripts/generate-mysql-export.cjs');
  } else {
    console.log("Invalid choice. Please run again and select 1 or 2.");
    process.exit(1);
  }
});
