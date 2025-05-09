# MillionareWith$25 cPanel Migration Guide

This guide will help you migrate your MillionareWith$25 application and database from Replit to a cPanel hosting environment.

## Step 1: Export the Database

1. Run the export script in Replit by typing:
   ```
   node export-db.js
   ```

2. Choose option 2 (MySQL) when prompted.

3. The MySQL export file will be generated in the `database-export` folder.

4. Download the MySQL export file from the Replit file explorer (right-click on the file and select "Download").

## Step 2: Import the Database to cPanel

1. Log in to your cPanel account.

2. Go to the "MySQL Databases" section and create a new database.
   - Note down the database name (e.g., `username_dbname`).

3. Create a database user and assign it to the database with "ALL PRIVILEGES".
   - Note down the username and password.

4. Go to phpMyAdmin from your cPanel dashboard.

5. Select your newly created database from the left sidebar.

6. Click the "Import" tab at the top.

7. Click "Choose File" and select the MySQL export file you downloaded from Replit.

8. Click "Go" to start the import process.

## Step 3: Export the Application Code

1. In Replit, download your entire project as a ZIP file (click the three dots menu near the top and select "Download as zip").

2. Extract the ZIP file on your local computer.

## Step 4: Configure the Application for cPanel

1. Update the database connection in your application:

   - Create a `.env` file in the root directory with the following content:
     ```
     DATABASE_URL=mysql://username:password@localhost:3306/database_name
     ```
     Replace `username`, `password`, and `database_name` with the values you noted down in Step 2.

   - Replace the database connection setup in `server/db.ts` with the MySQL-compatible version:
     
     ```typescript
     // Copy the content from server/db-compatibility.ts to server/db.ts
     ```
     
   - Use the `ensureArray` helper function to handle array data:
     
     ```typescript
     // Example usage in your code:
     import { ensureArray } from './db';
     
     // When accessing plan features:
     const features = ensureArray(plan.features);
     
     // Now features is guaranteed to be an array whether it came from 
     // PostgreSQL (as an array) or MySQL (as a JSON string)
     ```

2. Ensure Node.js is available on your cPanel hosting (or use a hosting plan that supports Node.js).

## Step 5: Upload the Application to cPanel

1. Log in to your cPanel account.

2. Go to "File Manager".

3. Navigate to the public_html directory (or the directory where you want to host the application).

4. Click "Upload" and select all the files from your extracted project.

## Step 6: Install Dependencies and Build the Application

1. Connect to your cPanel server via SSH or use the Terminal feature in cPanel.

2. Navigate to your application directory:
   ```
   cd public_html
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Build the client-side application:
   ```
   npm run build
   ```

5. Configure the Node.js application to run with your cPanel hosting provider's requirements.
   - This might involve creating a custom Node.js application in cPanel, or
   - Setting up a process manager like PM2 to keep your application running.

## Step 7: Configure Domain and SSL

1. Point your domain to the cPanel hosting if you haven't already.

2. Set up SSL certificates for secure HTTPS connections.

## Step 8: Test the Application

1. Visit your domain to ensure the application is working correctly.

2. Test all features, especially those involving database operations.

## Troubleshooting

If you encounter issues:

1. Check the server logs in cPanel for error messages.
2. Ensure your database connection string is correct.
3. Make sure the Node.js version on your cPanel hosting is compatible with your application.
4. Verify all required environment variables are set correctly.

## Note on Array Data Type

The PostgreSQL database used in Replit supports array data types (like the `features` column in the `plans` table), but MySQL does not. In the MySQL export, array columns have been converted to TEXT columns containing JSON strings. 

If you need to modify these values in MySQL, remember:
- The data is stored as a JSON string (e.g., `["item1", "item2"]`)
- When reading this data in your application, you'll need to parse the JSON string back into an array

## Note on Payment Gateways

Remember to update your payment gateway credentials (PayPal, Coinbase, etc.) in the admin panel after migration to ensure payments work correctly.