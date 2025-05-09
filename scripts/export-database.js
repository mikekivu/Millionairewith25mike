const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Use environment variables for database connection
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL environment variable is not defined');
  process.exit(1);
}

// Parse database connection string to get credentials
const regex = /postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
const match = dbUrl.match(regex);

if (!match) {
  console.error('Could not parse DATABASE_URL');
  process.exit(1);
}

const username = match[1];
const password = match[2];
const host = match[3];
const port = match[4];
const database = match[5];

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '..', 'database-export');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputFile = path.join(outputDir, `db-export-${timestamp}.sql`);

// Set environment variables for pg_dump
process.env.PGPASSWORD = password;

// Build the pg_dump command
const pgDumpCmd = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f ${outputFile} --no-owner --no-acl --schema=public`;

console.log('Starting database export...');
exec(pgDumpCmd, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing pg_dump: ${error.message}`);
    process.exit(1);
  }
  
  if (stderr) {
    console.error(`pg_dump stderr: ${stderr}`);
  }
  
  console.log(`Database exported successfully to: ${outputFile}`);
  
  // Create a schema-only export as well
  const schemaOutputFile = path.join(outputDir, `db-schema-${timestamp}.sql`);
  const pgDumpSchemaCmd = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f ${schemaOutputFile} --no-owner --no-acl --schema-only --schema=public`;
  
  console.log('Creating schema-only export...');
  exec(pgDumpSchemaCmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing schema pg_dump: ${error.message}`);
      process.exit(1);
    }
    
    if (stderr) {
      console.error(`Schema pg_dump stderr: ${stderr}`);
    }
    
    console.log(`Schema exported successfully to: ${schemaOutputFile}`);
    
    // Create a data-only export
    const dataOutputFile = path.join(outputDir, `db-data-${timestamp}.sql`);
    const pgDumpDataCmd = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f ${dataOutputFile} --no-owner --no-acl --data-only --schema=public`;
    
    console.log('Creating data-only export...');
    exec(pgDumpDataCmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing data pg_dump: ${error.message}`);
        process.exit(1);
      }
      
      if (stderr) {
        console.error(`Data pg_dump stderr: ${stderr}`);
      }
      
      console.log(`Data exported successfully to: ${dataOutputFile}`);
      console.log('All exports completed!');
    });
  });
});
