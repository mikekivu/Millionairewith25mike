
import { db } from '../server/db';

async function fixSystemSettingsTable() {
  try {
    console.log('🔧 Fixing system_settings table structure...');
    
    // First, check if the table exists
    const tableExists = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'system_settings'
      );
    `);
    
    if (!tableExists.rows[0]?.exists) {
      console.log('📝 Creating system_settings table...');
      await db.execute(`
        CREATE TABLE system_settings (
          id SERIAL PRIMARY KEY,
          key TEXT NOT NULL UNIQUE,
          value TEXT NOT NULL,
          description TEXT,
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log('✅ Table created successfully');
    } else {
      console.log('📝 Table exists, checking column structure...');
      
      // Check if created_at column exists and drop it if it does
      const createdAtExists = await db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'system_settings' AND column_name = 'created_at'
        );
      `);
      
      if (createdAtExists.rows[0]?.exists) {
        console.log('🗑️  Dropping created_at column...');
        await db.execute(`ALTER TABLE system_settings DROP COLUMN created_at;`);
        console.log('✅ created_at column dropped');
      }
      
      // Ensure updated_at column exists
      const updatedAtExists = await db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'system_settings' AND column_name = 'updated_at'
        );
      `);
      
      if (!updatedAtExists.rows[0]?.exists) {
        console.log('➕ Adding updated_at column...');
        await db.execute(`
          ALTER TABLE system_settings 
          ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();
        `);
        console.log('✅ updated_at column added');
      }
    }
    
    // Insert default payment_mode setting if it doesn't exist
    await db.execute(`
      INSERT INTO system_settings (key, value, description, updated_at)
      VALUES ('payment_mode', 'sandbox', 'Payment gateway environment mode (live or sandbox)', NOW())
      ON CONFLICT (key) DO NOTHING;
    `);
    
    console.log('✅ system_settings table fixed and initialized successfully');
    
    // Verify the final structure
    const columns = await db.execute(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'system_settings'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Final table structure:');
    columns.rows.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default || ''}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing system_settings table:', error);
    process.exit(1);
  }
}

fixSystemSettingsTable();
