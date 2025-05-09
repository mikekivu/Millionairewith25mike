const { execSync } = require('child_process');

console.log('Running database migrations...');
try {
  // Force push with --force flag
  execSync('npx drizzle-kit push --force', { stdio: 'inherit' });
  console.log('Database migrations completed successfully!');
} catch (error) {
  console.error('Error executing migrations:', error);
  process.exit(1);
}