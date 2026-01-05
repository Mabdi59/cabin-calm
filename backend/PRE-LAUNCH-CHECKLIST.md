# CabinCalm Backend - Final Pre-Launch Checklist

## ⚠️ Complete these steps IN ORDER before going live

---

## 1️⃣ Confirm Environment Variables

### Check your production .env file:

```bash
cat .env
```

### Required variables:

```bash
NODE_ENV=production
PORT=5000
JWT_SECRET=<your-64-char-random-secret>
CLIENT_ORIGIN=https://your-frontend-domain.com
```

### Verification Commands:

```bash
# Test JWT_SECRET strength (should be 64+ characters)
echo $JWT_SECRET | wc -c

# Verify CLIENT_ORIGIN is NOT localhost
grep CLIENT_ORIGIN .env | grep -v localhost
echo $?  # Should be 0 (no localhost found)

# Confirm NODE_ENV is production
grep NODE_ENV .env | grep production
```

### ✅ Checklist:
- [ ] JWT_SECRET is 64+ characters
- [ ] JWT_SECRET is randomly generated (not default)
- [ ] CLIENT_ORIGIN is your production frontend domain
- [ ] CLIENT_ORIGIN includes https:// protocol
- [ ] CLIENT_ORIGIN has NO trailing slash
- [ ] NODE_ENV=production
- [ ] No localhost references in production .env

**Generate a strong JWT_SECRET if needed:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 2️⃣ HTTPS and Port Security

### Verify HTTPS Configuration:

```bash
# Test that your API responds with HTTPS
curl -I https://api.your-domain.com/api/health

# Should see:
# HTTP/2 200
# (not HTTP/1.1 301 redirect loop)
```

### Verify Port 5000 is NOT publicly accessible:

```bash
# From external machine, this should FAIL:
curl http://your-server-ip:5000/api/health

# From server itself, this should WORK:
curl http://localhost:5000/api/health
```

### Check Nginx/Reverse Proxy is forcing HTTPS:

```bash
# Test HTTP redirect to HTTPS
curl -I http://api.your-domain.com/api/health

# Should see:
# HTTP/1.1 301 Moved Permanently
# Location: https://api.your-domain.com/...
```

### ✅ Checklist:
- [ ] HTTPS certificate installed (Let's Encrypt or other)
- [ ] HTTP automatically redirects to HTTPS
- [ ] Port 5000 blocked from public access
- [ ] Only Nginx/proxy can access port 5000
- [ ] Certificate auto-renewal configured

**Quick Nginx HTTPS verification:**
```bash
sudo nginx -t
sudo certbot certificates  # Check SSL status
```

---

## 3️⃣ Process Management (PM2/systemd)

### Verify PM2 is running:

```bash
pm2 status

# Should show cabincalm-api with status "online"
```

### Ensure auto-restart on crash:

```bash
# Test crash recovery
pm2 stop cabincalm-api
sleep 2
pm2 status  # Should auto-restart

# Or manually restart
pm2 restart cabincalm-api
```

### Ensure restart on reboot:

```bash
# Configure startup script
pm2 startup
# Follow the command it outputs

# Save current process list
pm2 save

# Verify startup configuration
systemctl status pm2-$(whoami)
```

### ✅ Checklist:
- [ ] `pm2 status` shows app running
- [ ] App auto-restarts after manual stop
- [ ] PM2 configured to start on system reboot
- [ ] `pm2 save` executed
- [ ] Startup script configured

**Test reboot behavior (optional but recommended):**
```bash
pm2 save
sudo reboot
# After reboot:
pm2 status  # Should show app running
```

---

## 4️⃣ Database Security

### Check database file permissions:

```bash
ls -la cabincalm.db

# Should show:
# -rw------- (600) or -rw-r----- (640)
# Owner: your-app-user (not root)
```

### Lock down database:

```bash
# Set restrictive permissions
chmod 600 cabincalm.db

# Set correct owner
chown $(whoami):$(whoami) cabincalm.db

# Verify
ls -la cabincalm.db
```

### Verify database location:

```bash
pwd
# Should NOT be:
# - /var/www/html
# - Any publicly accessible directory
# - Anywhere served by web server
```

### Check backup cron job exists:

```bash
crontab -l | grep backup

# Should see something like:
# 0 2 * * * /path/to/backup-cabincalm.sh
```

### Test backup script:

```bash
# Run backup manually
~/backup-cabincalm.sh

# Verify backup created
ls -lh ~/backups/cabincalm/
```

### ✅ Checklist:
- [ ] Database permissions set to 600
- [ ] Database owned by app user (not root)
- [ ] Database NOT in public web directory
- [ ] Backup cron job scheduled
- [ ] Backup script tested and working
- [ ] Backups stored outside web root
- [ ] Backup retention policy set (30 days)

---

## 5️⃣ Flight API Validation Testing

### Test missing required fields:

```bash
# Should return 400 error
curl -X POST https://api.your-domain.com/api/flights \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"airline":"Test"}' \
  -w "\nStatus: %{http_code}\n"

# Expected: {"error":"Missing required fields"}
# Status: 400
```

### Test invalid anxiety level:

```bash
# Test anxiety > 10
curl -X POST https://api.your-domain.com/api/flights \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "flight_date":"2026-01-05",
    "airline":"Test",
    "departure_airport":"JFK",
    "arrival_airport":"LAX",
    "flight_time":"3h",
    "turbulence":"none",
    "anxiety_level":15
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: {"error":"Anxiety level must be between 1 and 10"}
# Status: 400
```

### Test invalid turbulence value:

```bash
curl -X POST https://api.your-domain.com/api/flights \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "flight_date":"2026-01-05",
    "airline":"Test",
    "departure_airport":"JFK",
    "arrival_airport":"LAX",
    "flight_time":"3h",
    "turbulence":"extreme",
    "anxiety_level":5
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: {"error":"Invalid turbulence level"}
# Status: 400
```

### Test invalid date format:

```bash
curl -X POST https://api.your-domain.com/api/flights \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "flight_date":"01/05/2026",
    "airline":"Test",
    "departure_airport":"JFK",
    "arrival_airport":"LAX",
    "flight_time":"3h",
    "turbulence":"none",
    "anxiety_level":5
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: {"error":"Invalid date format. Use YYYY-MM-DD"}
# Status: 400
```

### Test user isolation:

```bash
# User A creates a flight (save the ID)
FLIGHT_ID=<note-the-id-returned>

# User B tries to access User A's flight (should fail)
curl -X GET https://api.your-domain.com/api/flights/$FLIGHT_ID \
  -H "Authorization: Bearer USER_B_TOKEN" \
  -w "\nStatus: %{http_code}\n"

# Expected: {"error":"Flight not found"}
# Status: 404
```

### Verify no stack traces in errors:

```bash
# Trigger various errors and check responses
# None should contain:
# - File paths
# - Line numbers
# - Stack traces
# - Internal error details
```

### ✅ Checklist:
- [ ] Missing fields rejected with 400
- [ ] Invalid anxiety (0, 11, -1) rejected
- [ ] Invalid turbulence rejected
- [ ] Invalid date format rejected
- [ ] Empty fields after trim rejected
- [ ] Max length enforced (triggers, notes)
- [ ] User cannot access other user's flights
- [ ] User cannot edit other user's flights
- [ ] User cannot delete other user's flights
- [ ] All errors return `{"error": "message"}` format
- [ ] No stack traces exposed to clients

---

## 6️⃣ Statistics Endpoint Safety

### Test with zero flights:

```bash
# Login as new user with no flights
curl -X GET https://api.your-domain.com/api/flights/stats/trends \
  -H "Authorization: Bearer NEW_USER_TOKEN" \
  | jq

# Expected: Safe default values, no crash
# {
#   "totalFlights": 0,
#   "averageAnxiety": 0,
#   "turbulenceDistribution": {...},
#   "anxietyTrend": [],
#   "commonTriggers": {}
# }
```

### Test with one flight:

```bash
# Add one flight, then check stats
curl -X GET https://api.your-domain.com/api/flights/stats/trends \
  -H "Authorization: Bearer TOKEN" \
  | jq

# Should return proper data without errors
```

### Test with large dataset:

```bash
# Time the request with many flights
time curl -s https://api.your-domain.com/api/flights/stats/trends \
  -H "Authorization: Bearer TOKEN" \
  > /dev/null

# Should complete in < 2 seconds even with 100+ flights
```

### Check logs for errors:

```bash
# Monitor logs while calling stats endpoint
pm2 logs cabincalm-api --lines 50

# Look for:
# - Database errors
# - Undefined errors
# - NaN values
# - Division by zero
```

### ✅ Checklist:
- [ ] Zero flights returns safe empty data
- [ ] One flight shows correct stats
- [ ] Large dataset (50+) doesn't timeout
- [ ] No crashes or unhandled errors
- [ ] Response time acceptable (< 2s)
- [ ] No NaN or undefined in response
- [ ] Logs show no errors during stats call

---

## 7️⃣ Log Review

### Check PM2 logs:

```bash
# View recent logs
pm2 logs cabincalm-api --lines 200

# Look for:
# - Database connection errors
# - Authentication failures (excessive)
# - Unhandled promise rejections
# - Deprecated warnings
# - Stack traces
```

### Search for specific error patterns:

```bash
# Database errors
pm2 logs cabincalm-api --lines 500 | grep -i "database error"

# Authentication issues
pm2 logs cabincalm-api --lines 500 | grep -i "authentication"

# 500 errors
pm2 logs cabincalm-api --lines 500 | grep "500"

# Unhandled rejections
pm2 logs cabincalm-api --lines 500 | grep -i "unhandled"
```

### Check for repeating errors:

```bash
# Get error frequency
pm2 logs cabincalm-api --lines 1000 | grep "error" | sort | uniq -c | sort -rn

# Any error appearing > 10 times needs investigation
```

### ✅ Checklist:
- [ ] No database connection errors
- [ ] No unhandled promise rejections
- [ ] No deprecated package warnings
- [ ] No stack traces in production logs
- [ ] Failed auth attempts are reasonable (not attack)
- [ ] No repeating error patterns
- [ ] Log level appropriate for production

**Fix any issues found before proceeding!**

---

## 8️⃣ Admin Scripts Security

### Verify scripts are NOT exposed as routes:

```bash
# These should all return 404:
curl -I https://api.your-domain.com/migrate.js
curl -I https://api.your-domain.com/clean-duplicates.js
curl -I https://api.your-domain.com/vacuum.js
curl -I https://api.your-domain.com/update-summaries.js

# All should return: 404 Not Found
```

### Verify scripts are only accessible via SSH:

```bash
# Only these should work (from server):
node migrate.js
node clean-duplicates.js
node vacuum.js
node update-summaries.js
```

### Check Nginx isn't serving .js files from backend:

```bash
# Check Nginx config
sudo nginx -T | grep -A 10 "location.*\.js"

# Should NOT have rules serving backend .js files
```

### ✅ Checklist:
- [ ] Admin scripts return 404 via HTTP
- [ ] Scripts only accessible via SSH/terminal
- [ ] No accidental API routes for scripts
- [ ] Nginx not serving backend .js files
- [ ] Scripts require server access to run

---

## 9️⃣ Health Monitoring Setup

### Test health endpoint:

```bash
# Should return 200 OK
curl -I https://api.your-domain.com/api/health

# Full response:
curl https://api.your-domain.com/api/health
# {"status":"ok","message":"CabinCalm API is running"}
```

### Set up external monitoring:

**Option A: UptimeRobot (Free)**
1. Go to https://uptimerobot.com
2. Create account
3. Add monitor:
   - Type: HTTP(s)
   - URL: `https://api.your-domain.com/api/health`
   - Interval: 5 minutes
   - Expected: Contains "ok"

**Option B: Simple Cron Monitor**
```bash
# Create monitoring script
cat > ~/monitor-health.sh << 'EOF'
#!/bin/bash
HEALTH_URL="https://api.your-domain.com/api/health"
RESPONSE=$(curl -s "$HEALTH_URL")

if [[ $RESPONSE != *"ok"* ]]; then
  echo "Health check failed at $(date)" >> ~/health-failures.log
  # Optionally: send email or Slack notification
fi
EOF

chmod +x ~/monitor-health.sh

# Add to crontab (every 5 minutes)
crontab -e
# Add: */5 * * * * ~/monitor-health.sh
```

### Test notification (if configured):

```bash
# Stop server temporarily
pm2 stop cabincalm-api

# Wait 5-10 minutes
# Verify you receive alert

# Restart
pm2 restart cabincalm-api
```

### ✅ Checklist:
- [ ] `/api/health` returns 200 status
- [ ] Response contains `{"status":"ok"}`
- [ ] External monitoring configured (UptimeRobot/Pingdom)
- [ ] Check interval set to 5 minutes
- [ ] Alert notifications configured
- [ ] Test alert received when server down

---

## 🔟 Final Backend Launch Checklist

### Run through each item:

```bash
# 1. HTTPS enabled
curl -I https://api.your-domain.com/api/health | head -1
# Expected: HTTP/2 200

# 2. JWT secret strong
echo $JWT_SECRET | wc -c
# Expected: > 64

# 3. CORS correct
grep CLIENT_ORIGIN .env
# Expected: https://your-production-frontend.com

# 4. DB locked down
ls -la cabincalm.db
# Expected: -rw------- (600)

# 5. Backups enabled
crontab -l | grep backup
# Expected: cron job line

# 6. PM2 running
pm2 status
# Expected: cabincalm-api | online

# 7. Foreign keys enforced
sqlite3 cabincalm.db "PRAGMA foreign_keys;"
# Expected: 1

# 8. Validation verified
# (Run validation tests from step 5)

# 9. Auth isolation verified
# (Run user isolation tests from step 5)

# 10. Stats endpoint stable
curl -s https://api.your-domain.com/api/flights/stats/trends \
  -H "Authorization: Bearer TOKEN" | jq .totalFlights
# Expected: number (no error)

# 11. Logs clean
pm2 logs cabincalm-api --lines 100 | grep -i error | wc -l
# Expected: 0 or very low number

# 12. Health check monitored
curl https://api.your-domain.com/api/health
# Expected: {"status":"ok","message":"CabinCalm API is running"}
```

### Complete Checklist:

- [ ] ✅ HTTPS enabled and forced
- [ ] ✅ JWT secret strong (64+ chars)
- [ ] ✅ CORS correct for real domain
- [ ] ✅ DB locked down (600 permissions)
- [ ] ✅ Backups enabled (cron scheduled)
- [ ] ✅ PM2/systemd running
- [ ] ✅ Foreign keys enforced
- [ ] ✅ Validation verified (all tests passed)
- [ ] ✅ Auth isolation verified
- [ ] ✅ Stats endpoint stable
- [ ] ✅ Logs clean (no repeating errors)
- [ ] ✅ Health check monitored

---

## 🚀 LAUNCH DECISION

### If ALL items above are checked ✅:

```
┌─────────────────────────────────────┐
│  🎉 BACKEND IS READY FOR LAUNCH! 🎉 │
└─────────────────────────────────────┘
```

**Final actions:**
1. Document your production URLs
2. Save admin credentials securely
3. Bookmark monitoring dashboard
4. Keep this checklist for future reference

### If ANY items are ❌:

**DO NOT LAUNCH YET**

Go back and complete missing items. Security and stability must be 100% before going live.

---

## Post-Launch Monitoring (First 24 Hours)

### Monitor these closely:

```bash
# Watch logs in real-time
pm2 logs cabincalm-api --lines 0

# Check error rate
pm2 logs cabincalm-api --lines 1000 | grep -i error | wc -l

# Monitor memory usage
pm2 monit

# Check response times
curl -w "@curl-format.txt" -s https://api.your-domain.com/api/health

# Watch database size
ls -lh cabincalm.db
```

### Create curl-format.txt for timing:

```bash
cat > curl-format.txt << 'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
      time_redirect:  %{time_redirect}\n
   time_pretransfer:  %{time_pretransfer}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
```

### Red flags to watch for:

- ⚠️ Error rate > 1% of requests
- ⚠️ Memory usage constantly increasing
- ⚠️ Response times > 2 seconds
- ⚠️ Database locks
- ⚠️ Repeated 500 errors
- ⚠️ High CPU usage (> 80% sustained)

**If you see any red flags:** Check logs immediately and investigate.

---

## Emergency Rollback Procedure

If critical issues arise after launch:

```bash
# 1. Stop current version
pm2 stop cabincalm-api

# 2. Restore from git
git log --oneline -10  # Find last working commit
git checkout <commit-hash>
npm install

# 3. Restore database backup (if needed)
cp ~/backups/cabincalm/cabincalm-<timestamp>.db cabincalm.db

# 4. Restart
pm2 restart cabincalm-api

# 5. Verify
curl https://api.your-domain.com/api/health

# 6. Check logs
pm2 logs cabincalm-api --lines 50
```

---

## Support and Resources

- **Health Check:** `https://api.your-domain.com/api/health`
- **Logs:** `pm2 logs cabincalm-api`
- **Database:** `~/backups/cabincalm/`
- **Documentation:** `FINALIZATION.md`, `DEPLOYMENT.md`

**Keep this checklist accessible for future updates and deployments!**

---

✨ **Your backend is production-ready. Good luck with your launch!** ✨
