const { Pool, neonConfig } = require('@neondatabase/serverless');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = WebSocket;

async function generateMySQLExport() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not defined');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Create output directory
    const outputDir = path.join(__dirname, '..', 'database-export');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(outputDir, `mysql-export-${timestamp}.sql`);
    const stream = fs.createWriteStream(outputFile);

    // Write header
    stream.write('-- MySQL compatible export generated on ' + new Date().toISOString() + '\n');
    stream.write('-- MillionareWith$25 Database Backup\n\n');
    
    // Add MySQL compatibility settings
    stream.write('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n');
    stream.write('SET time_zone = "+00:00";\n\n');
    
    // Get list of tables
    const tableRes = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    // For each table, get its structure and data
    for (const table of tableRes.rows) {
      const tableName = table.table_name;
      console.log(`Processing table: ${tableName}`);

      // Get column definitions
      const columnRes = await pool.query(`
        SELECT column_name, data_type, character_maximum_length, column_default, is_nullable, 
               pg_get_serial_sequence('${tableName}', column_name) as seq_name,
               udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      // Write CREATE TABLE statement
      stream.write(`-- Table structure for table \`${tableName}\`\n`);
      stream.write(`DROP TABLE IF EXISTS \`${tableName}\`;\n`);
      stream.write(`CREATE TABLE \`${tableName}\` (\n`);

      const columns = columnRes.rows.map(col => {
        let colDef = `  \`${col.column_name}\``;
        
        // Convert PostgreSQL types to MySQL types
        let mysqlType;
        
        // Handle array types
        if (col.data_type === 'ARRAY') {
          // Convert arrays to TEXT with JSON serialization
          mysqlType = 'TEXT';
          console.log(`Converting array column ${col.column_name} to TEXT for MySQL compatibility`);
        } else {
          switch (col.data_type) {
            case 'integer':
              if (col.seq_name) {
                mysqlType = 'INT AUTO_INCREMENT';
              } else {
                mysqlType = 'INT';
              }
              break;
            case 'text':
              mysqlType = 'TEXT';
              break;
            case 'timestamp with time zone':
            case 'timestamp without time zone':
              mysqlType = 'TIMESTAMP';
              break;
            case 'boolean':
              mysqlType = 'TINYINT(1)';
              break;
            case 'numeric':
              // For numeric types, we'll use DECIMAL with the appropriate precision
              mysqlType = 'DECIMAL(18,8)';
              break;
            default:
              // For other types, we'll just use the same type name
              if (col.character_maximum_length && col.data_type.includes('char')) {
                mysqlType = `VARCHAR(${col.character_maximum_length})`;
              } else {
                mysqlType = col.data_type.toUpperCase();
              }
          }
        }
        
        colDef += ` ${mysqlType}`;
        
        // Add NOT NULL if required
        if (col.is_nullable === 'NO') {
          colDef += ' NOT NULL';
        }
        
        // Add default value if exists and it's not a sequence default
        if (col.column_default && !col.column_default.includes('nextval')) {
          // Clean up the default value to be MySQL compatible
          let defaultValue = col.column_default;
          
          // Remove PostgreSQL cast operators ::text and similar
          if (defaultValue.includes('::')) {
            defaultValue = defaultValue.split('::')[0];
          }
          
          if (defaultValue === 'true') {
            defaultValue = '1';
          } else if (defaultValue === 'false') {
            defaultValue = '0';
          } else if (defaultValue === 'now()') {
            defaultValue = 'CURRENT_TIMESTAMP';
          } else if (defaultValue.includes("'")) {
            // If it's a string literal, keep the quotes
            defaultValue = defaultValue.trim();
          } else if (isNaN(defaultValue)) {
            // If it's not a number and doesn't have quotes, add them
            defaultValue = `'${defaultValue}'`;
          }
          
          colDef += ` DEFAULT ${defaultValue}`;
        }
        
        return colDef;
      });
      
      // Get primary keys
      const pkRes = await pool.query(`
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass
        AND i.indisprimary
      `, [tableName]);

      // Add primary key constraint
      if (pkRes.rows.length > 0) {
        const pkColumns = pkRes.rows.map(row => `\`${row.attname}\``);
        columns.push(`  PRIMARY KEY (${pkColumns.join(', ')})`);
      }

      stream.write(columns.join(',\n') + '\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n');

      // Get table data
      const dataRes = await pool.query(`SELECT * FROM ${tableName}`);
      
      // Write INSERT statements for data
      if (dataRes.rows.length > 0) {
        stream.write(`-- Dumping data for table \`${tableName}\`\n`);
        
        const columnNames = columnRes.rows.map(col => `\`${col.column_name}\``);
        
        for (const row of dataRes.rows) {
          const values = columnRes.rows.map(col => {
            const value = row[col.column_name];
            
            // Handle null values
            if (value === null) return 'NULL';
            
            // Handle array values by converting to JSON strings
            if (col.data_type === 'ARRAY' && Array.isArray(value)) {
              return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
            }
            
            // Handle other value types
            if (typeof value === 'boolean') return value ? '1' : '0';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
            
            return value;
          });
          
          stream.write(`INSERT INTO \`${tableName}\` (${columnNames.join(', ')}) VALUES (${values.join(', ')});\n`);
        }
        stream.write('\n');
      }
    }

    // Write foreign key constraints
    stream.write('-- Foreign key constraints\n');
    const fkRes = await pool.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    `);

    for (const fk of fkRes.rows) {
      stream.write(`ALTER TABLE \`${fk.table_name}\` ADD CONSTRAINT \`${fk.constraint_name}\` `);
      stream.write(`FOREIGN KEY (\`${fk.column_name}\`) REFERENCES \`${fk.foreign_table_name}\` (\`${fk.foreign_column_name}\`);\n`);
    }

    stream.end();
    
    console.log(`MySQL export generated successfully to: ${outputFile}`);
    return outputFile;
  } catch (error) {
    console.error('Error generating MySQL export:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

generateMySQLExport()
  .then(outputFile => {
    console.log('MySQL file created:', outputFile);
    console.log('You can download this file from the Replit file explorer.');
  })
  .catch(err => {
    console.error('Export failed:', err);
    process.exit(1);
  });
