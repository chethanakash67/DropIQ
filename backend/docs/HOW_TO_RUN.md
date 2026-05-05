# 🚀 How to Run the System

## Manual Sync (Run Anytime)

Fetch data from Google Sheets immediately:
```bash
npm run sync:stores
```

View current data:
```bash
npm run view:stores
```

Check system status:
```bash
node system-status.js
```

---

## Running Both Server and Scheduler

### Option 1: Development Mode (Two Terminals)

**Terminal 1 - Main Server:**
```bash
npm run dev
```
This runs your main application on port 3000.

**Terminal 2 - Store Sync Scheduler:**
```bash
npm run scheduler:stores
```
This syncs Google Sheets every 5 minutes.

Both run independently - closing one doesn't affect the other!

---

### Option 2: Production Mode (PM2 - Recommended)

**1. Install PM2 (one-time):**
```bash
npm install -g pm2
```

**2. Start both services:**
```bash
# Start main server
pm2 start src/server.js --name "dropiq-server"

# Start store sync scheduler
pm2 start src/scheduler/offline-store-sync.js --name "store-sync"
```

**3. Manage services:**
```bash
# View status
pm2 status

# View logs
pm2 logs store-sync

# Restart a service
pm2 restart store-sync

# Stop a service
pm2 stop store-sync

# Start on Windows boot (one-time setup)
pm2 save
pm2 startup
```

**4. Monitor:**
```bash
# Real-time monitoring
pm2 monit
```

---

### Option 3: Scheduler Only (No Main Server)

If you only need the Google Sheets sync:
```bash
npm run scheduler:stores
```

This runs standalone - no server needed!

---

## Quick Commands Reference

| Command | What It Does |
|---------|--------------|
| `npm run sync:stores` | **Manual sync (immediate)** |
| `npm run scheduler:stores` | Auto-sync every 5 minutes |
| `npm run view:stores` | View all stores/products |
| `npm run dev` | Start main server (development) |
| `npm run start` | Start main server (production) |
| `node system-status.js` | Check system status |

---

## FAQ

**Q: Do I need the main server running for sync to work?**  
A: **NO!** The scheduler is completely independent.

**Q: Can I run sync without the scheduler?**  
A: **YES!** Use `npm run sync:stores` whenever you want.

**Q: How do I know if scheduler is running?**  
A: Check the terminal - you'll see sync logs every 5 minutes.

**Q: Can I change sync frequency?**  
A: Yes! Edit `OFFLINE_STORE_SYNC_SCHEDULE` in `.env`
   - Every 1 minute: `*/1 * * * *`
   - Every 10 minutes: `*/10 * * * *`
   - Every hour: `0 * * * *`

**Q: What if I close the terminal?**  
A: The process stops. Use PM2 to keep it running in background.

---

## Recommended Setup for Production

**Best practice:** Use PM2 for both services

```bash
# One-time setup
npm install -g pm2

# Start services
pm2 start src/server.js --name "dropiq-server"
pm2 start src/scheduler/offline-store-sync.js --name "store-sync"

# Save config (survives reboots)
pm2 save
pm2 startup

# Done! Both run in background forever
```

Check with: `pm2 status`

---

## Current Running Processes

Check your VS Code terminals:
- Look for a terminal running: `npm run scheduler:stores`
- That's your sync scheduler (runs every 5 min)
- It's independent of the main server

---

## Testing

**Test manual sync:**
```bash
npm run sync:stores
```

**Test scheduler:**
```bash
npm run scheduler:stores
# Wait 5 minutes, you'll see: "[timestamp] Starting scheduled sync..."
```

**Test database:**
```bash
npm run view:stores
```

---

## Production Checklist

- [ ] Main server running: `pm2 start src/server.js --name "dropiq-server"`
- [ ] Scheduler running: `pm2 start src/scheduler/offline-store-sync.js --name "store-sync"`
- [ ] PM2 saved: `pm2 save`
- [ ] Auto-startup enabled: `pm2 startup`
- [ ] Check status: `pm2 status` (both should show "online")
- [ ] Monitor logs: `pm2 logs`

**That's it!** Your system runs 24/7 in the background. 🚀
