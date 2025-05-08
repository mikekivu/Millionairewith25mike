// Script to push database schema
import { exec } from 'child_process';

// Run the drizzle-kit push command with the auto-accept flag to avoid interactive prompts
exec('npx drizzle-kit push:pg --accept-data-loss', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Stdout: ${stdout}`);
});