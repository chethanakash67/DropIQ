# Offline Store Registration & Sync System

This system automatically fetches store registration data from Google Sheets and creates PostgreSQL tables for each offline store.

## Features

- 📊 **Google Sheets Integration**: Automatically fetches data from Google Sheets using service account credentials
- 🏪 **Store Management**: Creates a main table for store information
- 📦 **Product Tables**: Creates individual product tables for each store (format: `storename_o`)
- 🔄 **Auto Sync**: Scheduled sync every 10 minutes to check for new registrations
- 🆔 **Auto Store ID Generation**: Generates Store IDs automatically if not provided

## Architecture

### Database Tables

#### 1. Main Table: `offline_stores`
Stores information about all registered offline stores:
- `store_id` - Unique store identifier
- `store_name` - Name of the store
- `owner_name` - Store owner's name
- `owner_phone` - Owner's phone number
- `shop_location` - Store address
- `preferred_time` - Preferred time for follow-up
- `table_name` - Name of the store's product table
- `created_at`, `updated_at`, `last_synced_at` - Timestamps

#### 2. Individual Store Tables: `{storename}_o`
Each store gets its own table with products:
- `product_name` - Full product name including model
- `price` - Product price
- `created_at`, `updated_at` - Timestamps

### Store ID Generation Logic

If Store ID is not provided in the Google Sheet, it's auto-generated using:
```
Format: {first 4 digits of phone} - {first 2 letters of shop name} - {first 2 letters of owner name}
Example: 9876-SI-SI
  - Phone: 9876543210
  - Shop Name: Siva Prasad Electronics
  - Owner: Siva Prasad
```

### Table Name Generation

Store product tables are named using:
```
Format: {store_name_lowercase_with_underscores}_o
Example: siva_prasad_electronics_o
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# Database Configuration (existing)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

# Google Sheets Configuration
GOOGLE_SHEETS_STORE_REGISTRATION_ID=your_google_sheet_id_here

# Optional: Custom sync schedule (default: every 10 minutes)
# OFFLINE_STORE_SYNC_SCHEDULE=*/10 * * * *
```

**Note**: The Google Sheet ID is the part in the URL:
```
https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
```

### 3. Run Database Migration

This creates the `offline_stores` table:

```bash
npm run migrate
```

### 4. Google Sheets Service Account Setup

The service account credentials are already configured in:
```
gen-lang-client-0169377687-30900ec04eb4.json
```

Make sure this file has been shared with the Google Sheet with at least **Viewer** permissions:
- Service Account Email: `dropiq@gen-lang-client-0169377687.iam.gserviceaccount.com`

## Usage

### One-Time Manual Sync

To manually sync data from Google Sheets:

```bash
npm run sync:stores
```

This will:
1. Fetch all data from the Google Sheet
2. Create/update stores in the `offline_stores` table
3. Create product tables for each store if they don't exist
4. Insert/update products in each store's table

### Continuous Automatic Sync

To start the scheduler for automatic syncing every 10 minutes:

```bash
npm run scheduler:stores
```

The scheduler will:
- Run an initial sync immediately
- Continue syncing every 10 minutes
- Log all activities with timestamps
- Gracefully handle errors

### Custom Sync Schedule

To customize the sync frequency, set the environment variable:

```env
# Cron expression format
OFFLINE_STORE_SYNC_SCHEDULE=*/5 * * * *  # Every 5 minutes
OFFLINE_STORE_SYNC_SCHEDULE=0 * * * *    # Every hour
OFFLINE_STORE_SYNC_SCHEDULE=0 0 * * *    # Every day at midnight
```

[Cron expression reference](https://www.npmjs.com/package/node-cron)

## Google Sheet Format

The Google Sheet should have these columns:

| Column Name | Description | Required |
|------------|-------------|----------|
| Timestamp | Form submission timestamp | No |
| Shop Name | Name of the store | Yes* |
| Owner's Full Name | Store owner's name | Yes* |
| Owner's Phone Number | Phone number for Store ID generation | Yes* |
| Shop Location / Address | Full store address | No |
| Preferred Time for Follow-up Call | Preferred callback time | No |
| Enter the Store ID | Pre-generated Store ID (if any) | No |
| Enter the products | Products in format: "Product - Rs. Price" | Yes** |
| Form Your Store ID | Alternative Store ID field | No |

\* Required for new store registration  
\*\* Required for adding products to existing stores

### Product Format

Products should be entered in this format (one per line):
```
Iphone 17 pro max - Rs. 14,999
Samsung S24 Ultra - Rs. 22,100
Realme Narzo 60 5G - Rs. 30,000
```

## API/Repository Methods

### OfflineStoreRepository

```javascript
const offlineStoreRepository = require('./repositories/offline-store-repository');

// Generate Store ID
const storeId = offlineStoreRepository.generateStoreId('9876543210', 'Siva Prasad Electronics', 'Siva Prasad');

// Get store by Store ID
const store = await offlineStoreRepository.getStoreByStoreId('9876-SI-SI');

// Create or update store
await offlineStoreRepository.upsertStore({
  storeId: '9876-SI-SI',
  storeName: 'Siva Prasad Electronics',
  ownerName: 'Siva Prasad',
  ownerPhone: '9876543210',
  shopLocation: 'Bangalore, Karnataka',
  preferredTime: '09:00:00',
  tableName: 'siva_prasad_electronics_o'
});

// Create store product table
await offlineStoreRepository.createStoreProductTable('siva_prasad_electronics_o');

// Insert products
await offlineStoreRepository.insertProducts('siva_prasad_electronics_o', [
  { name: 'iPhone 17 Pro Max', price: 14999 },
  { name: 'Samsung S24 Ultra', price: 22100 }
]);

// Get all stores
const stores = await offlineStoreRepository.getAllStores();

// Get products from a store
const products = await offlineStoreRepository.getStoreProducts('siva_prasad_electronics_o');
```

## Monitoring

### Logs

The sync process logs:
- Total rows fetched from Google Sheets
- Each row being processed
- Store creations/updates
- Product table creations
- Product insertions
- Any errors encountered

### Database Queries

Check sync status:
```sql
-- View all stores and last sync time
SELECT store_id, store_name, table_name, last_synced_at 
FROM offline_stores 
ORDER BY last_synced_at DESC;

-- Count products in a store
SELECT COUNT(*) FROM siva_prasad_electronics_o;

-- View all products in a store
SELECT * FROM siva_prasad_electronics_o;
```

## Troubleshooting

### Google Sheets Access Error

**Error**: `The caller does not have permission`

**Solution**: Share the Google Sheet with the service account email:
- Email: `dropiq@gen-lang-client-0169377687.iam.gserviceaccount.com`
- Permission: Viewer or Editor

### Store ID Not Generated

**Issue**: Store ID field is empty in logs

**Check**:
1. Ensure Shop Name, Owner's Full Name, and Phone Number are provided
2. Phone number should have at least 4 digits
3. Shop Name and Owner Name should have at least 2 characters

### Products Not Inserted

**Issue**: Products field is not being parsed

**Check**:
1. Products must be in format: `Product Name - Rs. Price`
2. Each product on a new line
3. Price should be numeric (commas are okay)

### Table Name Conflicts

**Issue**: Table name already exists

**Solution**: The system uses the store name as part of the table name. If two stores have the same name, they'll share the same table. Ensure store names are unique.

## Files Created

```
src/
├── services/
│   └── google-sheets-service.js       # Google Sheets API integration
├── repositories/
│   └── offline-store-repository.js    # Database operations for stores
├── jobs/
│   └── sync-offline-stores.js         # Main sync job
├── scheduler/
│   └── offline-store-sync.js          # Scheduled sync (every 10 min)
└── database/
    └── migrations/
        └── 002_create_offline_stores.sql  # Database schema
```

## Development

### Testing the Sync

Test with a single manual sync first:
```bash
npm run sync:stores
```

Check the output for any errors, then verify in database:
```bash
psql -U your_user -d your_database -c "SELECT * FROM offline_stores;"
```

### Modifying Sync Frequency

Edit the cron expression in `.env` or directly in the scheduler file.

## Production Deployment

For production:

1. **Use PM2** for process management:
```bash
pm2 start src/scheduler/offline-store-sync.js --name "offline-store-sync"
pm2 save
pm2 startup
```

2. **Monitor logs**:
```bash
pm2 logs offline-store-sync
```

3. **Set up database backups** before running the first sync

## Support

For issues or questions, check:
1. Database connection settings
2. Google Sheets share permissions
3. Environment variables configuration
4. Log files for specific errors
