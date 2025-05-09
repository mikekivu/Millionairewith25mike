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

### 4.1 Update Database Connection

1. Create a `.env` file in the root directory with the following content:
   ```
   DATABASE_URL=mysql://username:password@localhost:3306/database_name
   ```
   
   Replace:
   - `username` with your MySQL database username (often starts with your cPanel username followed by an underscore)
   - `password` with your MySQL database password
   - `database_name` with the name of the MySQL database you created

2. Replace the database connection setup in `server/db.ts` with the MySQL-compatible version:
   
   ```typescript
   // Copy the content from server/db-compatibility.ts to server/db.ts
   ```
   
3. Use the `ensureArray` helper function to handle array data:
   
   ```typescript
   // Example usage in your code:
   import { ensureArray } from './db';
   
   // When accessing plan features:
   const features = ensureArray(plan.features);
   
   // Now features is guaranteed to be an array whether it came from 
   // PostgreSQL (as an array) or MySQL (as a JSON string)
   ```

### 4.2 Configure Environment Variables

Your application uses several environment variables that need to be set up in your cPanel environment:

1. Create a complete `.env` file with all required variables:
   ```
   # Database connection
   DATABASE_URL=mysql://username:password@localhost:3306/database_name
   
   # Payment gateway credentials
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   
   # Other configuration
   NODE_ENV=production
   PORT=3000
   ```

2. Setting Environment Variables in cPanel:
   
   **Method 1: Using .env file**
   - Upload the `.env` file to your application's root directory
   - Ensure your application is configured to read environment variables from this file
   
   **Method 2: Using Node.js App Setup**
   - In cPanel, go to "Setup Node.js App"
   - In the application configuration, there's a section for environment variables
   - Add each variable (DATABASE_URL, PAYPAL_CLIENT_ID, etc.) individually
   
   **Method 3: Using PM2**
   - Create an ecosystem.config.js file:
     ```javascript
     module.exports = {
       apps: [{
         name: "millionairewith25",
         script: "server/index.js",
         env: {
           NODE_ENV: "production",
           DATABASE_URL: "mysql://username:password@localhost:3306/database_name",
           PAYPAL_CLIENT_ID: "your_paypal_client_id",
           PAYPAL_CLIENT_SECRET: "your_paypal_client_secret"
         }
       }]
     };
     ```
   - Start your app with this configuration:
     ```
     pm2 start ecosystem.config.js
     ```

3. Verify Environment Variables:
   - Add a temporary route to check if variables are accessible:
     ```typescript
     // Add temporarily to server/routes.ts
     app.get('/debug-env', (req, res) => {
       res.json({
         databaseConnected: !!process.env.DATABASE_URL,
         paypalConfigured: !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET,
         nodeEnv: process.env.NODE_ENV
       });
     });
     ```
   - Access this route in your browser to check variable availability
   - **IMPORTANT**: Remove this debug route after testing!

### 4.3 Ensure Node.js Availability

1. Check if your cPanel hosting supports Node.js:
   - Look for "Setup Node.js App" in cPanel
   - Check with your hosting provider about Node.js support
   
2. Recommended Node.js Version: 16.x or higher (the application was developed on Node.js 18.x)

3. If Node.js is not available through cPanel, discuss with your hosting provider about upgrading to a plan that supports it.

## Step 5: Upload the Application to cPanel

1. Log in to your cPanel account.

2. Go to "File Manager".

3. Navigate to the public_html directory (or the directory where you want to host the application).

4. Click "Upload" and select all the files from your extracted project.

## Step 6: Install Dependencies and Build the Application

### 6.1 Access Your Server

1. Connect to your cPanel server via SSH:
   - In cPanel, look for the "SSH Access" or "Terminal" option
   - Alternatively, use your preferred SSH client (like PuTTY on Windows or Terminal on Mac)
   - Use the SSH credentials provided by your hosting provider

2. Navigate to your application directory:
   ```
   cd public_html  # or the directory where you uploaded your files
   ```

### 6.2 Install Node.js (if not already installed)

1. Check if Node.js is installed:
   ```
   node -v
   npm -v
   ```

2. If Node.js is not installed, you have a few options:
   - Use the "Setup Node.js App" feature in cPanel (if available)
   - Use NVM (Node Version Manager) to install Node.js:
     ```
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
     source ~/.bashrc  # or source ~/.zshrc if using zsh
     nvm install 16    # install Node.js v16 (or other version compatible with the app)
     ```
   - Contact your hosting provider for assistance with installing Node.js

### 6.3 Install Dependencies

1. Install all dependencies listed in package.json:
   ```
   npm install
   ```
   
   This will take a few minutes as it downloads and installs all required packages.

2. If you encounter memory errors during installation, try using:
   ```
   npm install --no-optional
   ```
   
   Or install with reduced memory usage:
   ```
   NODE_OPTIONS=--max_old_space_size=512 npm install
   ```

3. For production environments, you can use:
   ```
   npm install --production
   ```
   
   This skips dev dependencies, resulting in faster installation and less disk space usage.

### 6.4 Build the Application

1. Build the client-side application:
   ```
   npm run build
   ```
   
   This process:
   - Compiles TypeScript code
   - Bundles React components and assets
   - Optimizes CSS and JavaScript
   - Creates a production-ready build in the `dist` folder

2. If you encounter memory issues during build, allocate more memory:
   ```
   NODE_OPTIONS=--max_old_space_size=1024 npm run build
   ```

### 6.5 Set Up Process Management

For a production environment, you need to keep your Node.js application running continuously:

1. Install PM2 (Process Manager):
   ```
   npm install -g pm2
   ```

2. Start your application with PM2:
   ```
   pm2 start server/index.js --name "millionairewith25"
   ```

3. Set PM2 to start automatically after server reboot:
   ```
   pm2 startup
   ```
   Follow the instructions displayed after running this command.

4. Save the PM2 process list:
   ```
   pm2 save
   ```

### 6.6 Alternative: Using cPanel Node.js Application Setup

Many cPanel hosts offer a Node.js Application setup wizard:

1. In cPanel, find "Setup Node.js App"
2. Create a new application
3. Set the application path to your uploaded files
4. Set the application startup file to `server/index.js`
5. Set the application environment to "production"
6. Set required environment variables (especially DATABASE_URL)
7. Choose the Node.js version (recommend 16.x or higher)
8. Start the application

### 6.7 Verify Installation

After completing the setup:

1. Check that your application is running:
   ```
   pm2 status
   ```
   
2. View application logs if there are issues:
   ```
   pm2 logs millionairewith25
   ```

## Step 7: Configure Domain and SSL

1. Point your domain to the cPanel hosting if you haven't already.

2. Set up SSL certificates for secure HTTPS connections.

## Step 8: Test the Application

1. Visit your domain to ensure the application is working correctly.

2. Test all features, especially those involving database operations.

## Troubleshooting

### Common Issues and Solutions

#### Database Connection Problems

1. **Error**: "Cannot connect to MySQL server"
   - **Solution**: Verify your DATABASE_URL format is correct
   - **Solution**: Check if your database username and password are correct
   - **Solution**: Make sure your MySQL server allows connections from the Node.js application

2. **Error**: "ER_ACCESS_DENIED_ERROR: Access denied for user"
   - **Solution**: Double-check username and password in DATABASE_URL
   - **Solution**: Verify the user has proper permissions to access the database

3. **Error**: "Unknown column or Missing required columns"
   - **Solution**: Make sure the MySQL import was completed successfully
   - **Solution**: Check for SQL errors during import and fix them

#### Node.js and npm Issues

1. **Error**: "npm ERR! code ENOENT"
   - **Solution**: Make sure you're in the correct directory
   - **Solution**: Check if you have proper permissions to install packages

2. **Error**: "npm ERR! code ENOMEM" (Out of memory)
   - **Solution**: Use `NODE_OPTIONS=--max_old_space_size=512 npm install`
   - **Solution**: Try installing with `--no-optional` flag
   - **Solution**: Request more memory allocation from your hosting provider

3. **Error**: "SyntaxError: Unexpected token import/export"
   - **Solution**: Ensure you're using Node.js version 16 or higher
   - **Solution**: Make sure TypeScript is being properly compiled

#### Server Issues

1. **Error**: "EADDRINUSE: Address already in use"
   - **Solution**: Another process is using the specified port
   - **Solution**: Change the PORT in your environment variables
   - **Solution**: Kill the process using the port with `lsof -i :<port>` then `kill <PID>`

2. **Error**: "Application crashes after some time"
   - **Solution**: Set up PM2 to automatically restart the application
   - **Solution**: Check memory usage and optimize if needed
   - **Solution**: Review server logs for error patterns

#### Frontend Issues

1. **Error**: "Failed to load resource: the server responded with a status of 404"
   - **Solution**: Make sure the build process completed successfully
   - **Solution**: Check if assets are in the correct location
   - **Solution**: Verify the server is properly serving static files

2. **Error**: "API calls failing with CORS errors"
   - **Solution**: Ensure the frontend and backend are on the same domain
   - **Solution**: Check CORS configuration in server/index.ts

### Debugging Steps

1. **Check Logs**:
   - cPanel error logs: Access through cPanel > Errors
   - Application logs: `pm2 logs millionairewith25`
   - Database logs: Check MySQL error logs in cPanel

2. **Test Database Connection**:
   - Use a tool like phpMyAdmin to test database access
   - Try connecting with command line: `mysql -u username -p database_name`

3. **Verify Environment**:
   - Ensure all environment variables are set correctly
   - Check Node.js version: `node -v` (should be 16.x or higher)
   - Verify npm version: `npm -v`

4. **Check File Permissions**:
   - Files should be readable: `chmod 644 filename`
   - Directories should be traversable: `chmod 755 directory_name`
   - Executable scripts should have proper permissions: `chmod +x script_name`

## Note on Array Data Type

The PostgreSQL database used in Replit supports array data types (like the `features` column in the `plans` table), but MySQL does not. In the MySQL export, array columns have been converted to TEXT columns containing JSON strings. 

If you need to modify these values in MySQL, remember:
- The data is stored as a JSON string (e.g., `["item1", "item2"]`)
- When reading this data in your application, you'll need to parse the JSON string back into an array

## Note on Payment Gateways

Remember to update your payment gateway credentials (PayPal, Coinbase, etc.) in the admin panel after migration to ensure payments work correctly.