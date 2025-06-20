const { execSync } = require('child_process');

console.log('Running database migrations...');
try {
  // Force push with --accept-data-loss flag
  execSync('npx drizzle-kit push --accept-data-loss', { stdio: 'inherit' });
  console.log('Database migrations completed successfully!');
} catch (error) {
  console.error('Error executing migrations:', error);
  process.exit(1);
}