console.log('\n' + '='.repeat(70));
console.log('🚀 OFFLINE STORES SYNC - GOOGLE SHEETS SETUP GUIDE');
console.log('='.repeat(70) + '\n');

console.log('📋 STEP 1: Get Your Google Sheet ID');
console.log('─'.repeat(70));
console.log('1. Open your Google Sheet in a browser');
console.log('2. Look at the URL, it looks like:');
console.log('   https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit');
console.log('3. Copy the SHEET_ID part (between /d/ and /edit)');
console.log('   Example: 1abc123def456ghi789jkl012mno345pqr678stu901\n');

console.log('📋 STEP 2: Share Google Sheet with Service Account');
console.log('─'.repeat(70));
console.log('1. In your Google Sheet, click the "Share" button (top-right)');
console.log('2. Add this email address:');
console.log('   \x1b[32mdropiq@gen-lang-client-0169377687.iam.gserviceaccount.com\x1b[0m');
console.log('3. Set permission to "Viewer" or "Editor"');
console.log('4. Uncheck "Notify people" (it\'s a service account)');
console.log('5. Click "Share"\n');

console.log('📋 STEP 3: Add Sheet ID to .env File');
console.log('─'.repeat(70));
console.log('1. Open your .env file');
console.log('2. Find this line:');
console.log('   GOOGLE_SHEETS_STORE_REGISTRATION_ID=PASTE_YOUR_SHEET_ID_HERE');
console.log('3. Replace PASTE_YOUR_SHEET_ID_HERE with your actual Sheet ID');
console.log('4. Save the file\n');

console.log('📋 STEP 4: Test the Connection');
console.log('─'.repeat(70));
console.log('Run: \x1b[33mnpm run test:sheets\x1b[0m');
console.log('This will verify that the service account can access your sheet\n');

console.log('📋 STEP 5: Sync Data from Google Sheets');
console.log('─'.repeat(70));
console.log('Run: \x1b[33mnpm run sync:stores\x1b[0m');
console.log('This will fetch data from Google Sheets and create stores/products\n');

console.log('📋 STEP 6: View Your Data');
console.log('─'.repeat(70));
console.log('Run: \x1b[33mnpm run view:stores\x1b[0m');
console.log('This shows all stores and products in a nice format\n');

console.log('📋 STEP 7: Start Automatic Sync (Every 5 Minutes)');
console.log('─'.repeat(70));
console.log('Run: \x1b[33mnpm run scheduler:stores\x1b[0m');
console.log('This will continuously sync changes from Google Sheets\n');

console.log('='.repeat(70));
console.log('✅ CURRENT STATUS');
console.log('='.repeat(70) + '\n');

console.log('✓ Database migration: \x1b[32mCOMPLETE\x1b[0m');
console.log('✓ offline_stores table: \x1b[32mCREATED\x1b[0m');
console.log('✓ Test data: \x1b[32mADDED\x1b[0m');
console.log('✓ CSV sync: \x1b[32mWORKING\x1b[0m');
console.log('⚠ Google Sheets sync: \x1b[33mNEEDS SHEET ID\x1b[0m\n');

console.log('='.repeat(70));
console.log('📚 AVAILABLE COMMANDS');
console.log('='.repeat(70) + '\n');

console.log('\x1b[36mnpm run migrate\x1b[0m          - Run database migrations');
console.log('\x1b[36mnpm run sync:stores:csv\x1b[0m  - Sync from local CSV file');
console.log('\x1b[36mnpm run test:sheets\x1b[0m      - Test Google Sheets connection');
console.log('\x1b[36mnpm run sync:stores\x1b[0m      - One-time sync from Google Sheets');
console.log('\x1b[36mnpm run scheduler:stores\x1b[0m - Start auto-sync (every 5 min)');
console.log('\x1b[36mnpm run view:stores\x1b[0m      - View all stores and products\n');

console.log('='.repeat(70));
console.log('💡 TIPS');
console.log('='.repeat(70) + '\n');

console.log('• Make sure your Google Sheet has these columns:');
console.log('  - Shop Name');
console.log('  - Owner\'s Full Name');
console.log('  - Owner\'s Phone Number (for Store ID generation)');
console.log('  - Shop Location / Address (Include Street, City, and Postal Code)');
console.log('  - Preferred Time for Follow-up Call (Optional)');
console.log('  - Enter the Store ID');
console.log('  - Enter the products : \\nProd name including model - Price you sell.');
console.log('  - Form Your Store ID\n');

console.log('• Products format (one per line):');
console.log('  iPhone 15 Pro Max - Rs. 89,999');
console.log('  Samsung Galaxy S24 Ultra - Rs. 79,999\n');

console.log('• Store ID auto-generation format:');
console.log('  {first 4 digits of phone}-{shop 2 letters}-{owner 2 letters}');
console.log('  Example: 9876-SI-SI for phone 9876543210, Siva Prasad Electronics\n');

console.log('='.repeat(70) + '\n');
console.log('Need help? Check: docs/OFFLINE_STORES_SYNC.md\n');
