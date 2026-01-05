# Admin Scripts

**⚠️ These scripts should only be run via SSH/terminal access, never exposed as API routes.**

## Scripts

### migrate.js
Updates database schema by adding new columns and migrating data.

**Usage:**
```bash
node admin-scripts/migrate.js
```

**When to run:**
- After pulling database schema changes
- Before deploying new version with schema updates
- Safe to run multiple times (checks if columns exist)

---

### clean-duplicates.js
Removes duplicate education articles from the database.

**Usage:**
```bash
node admin-scripts/clean-duplicates.js
```

**When to run:**
- If duplicate articles appear in database
- After manual database imports
- Occasional maintenance

---

### update-summaries.js
Adds or updates summary text for education articles.

**Usage:**
```bash
node admin-scripts/update-summaries.js
```

**When to run:**
- When adding new education content
- To update article summaries
- After content changes

---

### vacuum.js
Optimizes and defragments the SQLite database file.

**Usage:**
```bash
node admin-scripts/vacuum.js
```

**When to run:**
- Monthly as part of maintenance
- After deleting large amounts of data
- If database performance degrades
- After schema changes

**Recommended schedule:** Monthly via cron:
```bash
0 3 1 * * cd /path/to/backend && node admin-scripts/vacuum.js
```

---

## Security Notes

✅ **These scripts are safe** - They only modify the database schema and data
✅ **Not exposed** - They cannot be called via HTTP/API
✅ **Admin only** - Require SSH access to server
✅ **Idempotent** - Safe to run multiple times (where applicable)

❌ **Do NOT:**
- Create API routes for these scripts
- Allow public access to these files
- Run during high-traffic periods (except migrate.js)
- Run without database backup

---

## Before Running Any Script

**Always backup first:**
```bash
cp cabincalm.db ~/backups/cabincalm/before-script-$(date +%Y%m%d-%H%M%S).db
```

---

## Troubleshooting

### Script won't run
```bash
# Check you're in the right directory
pwd
# Should be: /path/to/cabin-calm/backend

# Run from backend root
node admin-scripts/script-name.js
```

### Database locked
```bash
# Stop the server temporarily
pm2 stop cabincalm-api

# Run script
node admin-scripts/script-name.js

# Restart server
pm2 start cabincalm-api
```

---

**For daily operations, see:** `OPERATIONS-RUNBOOK.md`
