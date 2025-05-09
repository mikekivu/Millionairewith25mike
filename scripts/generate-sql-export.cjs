const { Pool, neonConfig } = require('@neondatabase/serverless');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = WebSocket;

async function generateDatabaseExport() {
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
    const outputFile = path.join(outputDir, `database-export-${timestamp}.sql`);
    const stream = fs.createWriteStream(outputFile);

    // Write header
    stream.write('-- Database export generated on ' + new Date().toISOString() + '\n');
    stream.write('-- MillionareWith$25 Database Backup\n\n');

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
        SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      // Write CREATE TABLE statement
      stream.write(`-- Table: ${tableName}\n`);
      stream.write(`DROP TABLE IF EXISTS ${tableName} CASCADE;\n`);
      stream.write(`CREATE TABLE ${tableName} (\n`);

      const columns = columnRes.rows.map(col => {
        let colDef = `  ${col.column_name} ${col.data_type}`;
        
        // Add length for varchar types
        if (col.character_maximum_length && col.data_type.includes('char')) {
          colDef += `(${col.character_maximum_length})`;
        }
        
        // Add default value if exists
        if (col.column_default) {
          colDef += ` DEFAULT ${col.column_default}`;
        }
        
        // Add NOT NULL if required
        if (col.is_nullable === 'NO') {
          colDef += ' NOT NULL';
        }
        
        return colDef;
      });

      stream.write(columns.join(',\n') + '\n);\n\n');

      // Get primary keys
      const pkRes = await pool.query(`
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass
        AND i.indisprimary
      `, [tableName]);

      if (pkRes.rows.length > 0) {
        const pkColumns = pkRes.rows.map(row => row.attname);
        stream.write(`ALTER TABLE ${tableName} ADD PRIMARY KEY (${pkColumns.join(', ')});\n\n`);
      }

      // Get table data
      const dataRes = await pool.query(`SELECT * FROM ${tableName}`);
      
      // Write INSERT statements for data
      if (dataRes.rows.length > 0) {
        stream.write(`-- Data for table: ${tableName}\n`);
        
        const columnNames = columnRes.rows.map(col => col.column_name);
        
        for (const row of dataRes.rows) {
          const values = columnNames.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (value instanceof Date) return `'${value.toISOString()}'`;
            return value;
          });
          
          stream.write(`INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES (${values.join(', ')});\n`);
        }
        stream.write('\n');
      }
      
      // Get sequences
      try {
        const seqRes = await pool.query(`
          SELECT pg_get_serial_sequence($1, a.attname) as seq_name
          FROM pg_attribute a
          WHERE a.attrelid = $1::regclass
          AND pg_get_serial_sequence($1, a.attname) IS NOT NULL
        `, [tableName]);

        for (const seq of seqRes.rows) {
          if (seq.seq_name) {
            const currvalRes = await pool.query(`SELECT last_value FROM ${seq.seq_name}`);
            if (currvalRes.rows.length > 0) {
              const lastVal = parseInt(currvalRes.rows[0].last_value);
              stream.write(`SELECT setval('${seq.seq_name}', ${lastVal}, true);\n`);
            }
          }
        }
        stream.write('\n');
      } catch (e) {
        console.log(`Warning: Could not process sequences for ${tableName}: ${e.message}`);
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
      stream.write(`ALTER TABLE ${fk.table_name} ADD CONSTRAINT ${fk.constraint_name} `);
      stream.write(`FOREIGN KEY (${fk.column_name}) REFERENCES ${fk.foreign_table_name} (${fk.foreign_column_name});\n`);
    }

    stream.end();
    
    console.log(`Database exported successfully to: ${outputFile}`);
    return outputFile;
  } catch (error) {
    console.error('Error generating database export:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

generateDatabaseExport()
  .then(outputFile => {
    console.log('SQL file created:', outputFile);
    console.log('You can download this file from the Replit file explorer.');
  })
  .catch(err => {
    console.error('Export failed:', err);
    process.exit(1);
  });
