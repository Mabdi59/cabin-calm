# CabinCalm Backend - Operations Runbook

**Quick reference for production operations and emergency response**

---

## 🌐 Production Details

### API Endpoint
```
https://api.your-domain.com
```

### Health Check
```
https://api.your-domain.com/api/health
```

### Server Access
```bash
# SSH connection
ssh your-user@your-server-ip

# Backend directory
cd /path/to/cabin-calm/backend
```

---

## 📦 Database

### Location
```
/path/to/cabin-calm/backend/cabincalm.db
```

### Backup Locations
```
Primary:   ~/backups/cabincalm/
Secondary: [off-server location - S3/Dropbox/etc]
```

### Pre-Launch Stable Snapshot
```
cabincalm-prelaunch-stable-20260105.db
```
*This is your clean rollback point*

### Quick Backup Command
```bash
cp cabincalm.db ~/backups/cabincalm/emergency-$(date +%Y%m%d-%H%M%S).db
```

---

## 🔧 Common PM2 Commands

### Status & Monitoring
```bash
pm2 status                    # Check app status
pm2 logs cabincalm-api        # View logs
pm2 logs cabincalm-api --err  # Error logs only
pm2 monit                     # Real-time monitoring
pm2 info cabincalm-api        # Detailed info
```

### Control
```bash
pm2 restart cabincalm-api     # Restart app
pm2 stop cabincalm-api        # Stop app
pm2 start cabincalm-api       # Start app
pm2 reload cabincalm-api      # Zero-downtime reload
```

### Logs
```bash
pm2 logs cabincalm-api --lines 100           # Last 100 lines
pm2 logs cabincalm-api --lines 0 --raw       # Follow new logs
pm2 flush cabincalm-api                      # Clear old logs
```

---

## 🚨 Emergency Rollback (< 5 minutes)

### If Critical Issue Arises

```bash
# 1. Stop current version
pm2 stop cabincalm-api

# 2. Restore pre-launch backup
cp ~/backups/cabincalm/cabincalm-prelaunch-stable-20260105.db cabincalm.db

# 3. Restore previous code (if needed)
git log --oneline -5
git checkout <previous-commit-hash>
npm install --production

# 4. Restart
pm2 restart cabincalm-api

# 5. Verify
curl https://api.your-domain.com/api/health
pm2 logs cabincalm-api --lines 20

# 6. Check monitoring
# Visit UptimeRobot/monitoring dashboard
```

---

## 🩺 Health Check Responses

### Healthy
```json
{"status":"ok","message":"CabinCalm API is running"}
HTTP 200
```

### Issues
```
Connection refused = Server down
Timeout = Server overloaded or network issue
500 error = Application error
404 = Routing issue or Nginx misconfigured
```

---

## 🔍 Quick Diagnostics

### Server Running?
```bash
pm2 status
# Should show: cabincalm-api | online
```

### Database Accessible?
```bash
ls -la cabincalm.db
sqlite3 cabincalm.db "SELECT COUNT(*) FROM users;"
```

### Logs Show Errors?
```bash
pm2 logs cabincalm-api --lines 50 | grep -i error
```

### Port Open?
```bash
curl http://localhost:5000/api/health
```

### HTTPS Working?
```bash
curl -I https://api.your-domain.com/api/health
```

### Memory Usage?
```bash
pm2 monit
# Or: free -h
```

---

## 📊 Monitoring Dashboard

### Primary Monitor
```
Service: [UptimeRobot/Pingdom/Other]
URL: [your-monitoring-dashboard-url]
Login: [your-credentials-location]
```

### Check Interval
```
5 minutes
```

### Alert Methods
```
Email: your-email@example.com
[Other: SMS/Slack/Discord]
```

---

## 🔐 Environment Variables

### Required Production Vars
```bash
NODE_ENV=production
PORT=5000
JWT_SECRET=[stored securely]
CLIENT_ORIGIN=https://your-frontend-domain.com
```

### View Current
```bash
cat .env | grep -v "^#"
```

---

## 🛠️ Common Issues & Fixes

### Issue: App Keeps Restarting
```bash
# Check logs for error
pm2 logs cabincalm-api --err --lines 50

# Common causes:
# - Database locked
# - Missing environment variable
# - Port conflict
```

### Issue: Database Locked
```bash
# Find processes using database
lsof cabincalm.db

# Kill if needed
pm2 stop cabincalm-api
# Wait 5 seconds
pm2 start cabincalm-api
```

### Issue: High Memory
```bash
# Check usage
pm2 monit

# Restart to clear
pm2 restart cabincalm-api
```

### Issue: CORS Errors
```bash
# Verify CLIENT_ORIGIN
grep CLIENT_ORIGIN .env

# Restart after change
pm2 restart cabincalm-api
```

### Issue: Nginx Down
```bash
sudo systemctl status nginx
sudo nginx -t          # Test config
sudo systemctl restart nginx
```

---

## 📞 Support Contacts

### Yourself
```
[Your phone/email for reminders]
```

### Server Provider
```
Provider: [AWS/DigitalOcean/Linode/etc]
Support: [support URL or phone]
Account: [account email]
```

### Domain/DNS
```
Provider: [Namecheap/Cloudflare/etc]
Account: [login email]
```

### SSL Certificate
```
Type: Let's Encrypt
Renewal: Automatic via certbot
Check: sudo certbot certificates
```

---

## 📝 Maintenance Schedule

### Daily (Automated)
- Database backup at 2 AM
- Health check every 5 minutes

### Weekly (Manual - First Month)
- Review logs for patterns
- Check error rate
- Monitor response times
- Review database size

### Monthly (Manual)
```bash
# Run VACUUM
node vacuum.js

# Update dependencies
npm audit
npm audit fix

# Check disk space
df -h

# Review backup retention
ls -lh ~/backups/cabincalm/
```

---

## 🎯 Key Performance Indicators

### Normal Baseline
```
Response time: < 500ms
Error rate: < 0.1%
Uptime: > 99.9%
Memory: < 200MB
CPU: < 20%
```

### Alert Thresholds
```
Response time: > 2 seconds
Error rate: > 1%
Uptime: < 99%
Memory: > 500MB
CPU: > 80%
```

---

## 🔄 Update Procedure

### For Minor Updates
```bash
# 1. Backup first
cp cabincalm.db ~/backups/cabincalm/pre-update-$(date +%Y%m%d).db

# 2. Pull changes
git pull origin main

# 3. Install dependencies
npm install --production

# 4. Restart
pm2 restart cabincalm-api

# 5. Monitor
pm2 logs cabincalm-api --lines 50
```

### For Major Updates
```bash
# 1. Full backup
cp cabincalm.db ~/backups/cabincalm/major-update-$(date +%Y%m%d).db

# 2. Test on staging first (if available)

# 3. Schedule maintenance window

# 4. Update during low-traffic period

# 5. Have rollback plan ready
```

---

## 📱 Quick Mobile Reference

When away from computer, you can check:

### Via SSH App
```bash
pm2 status
pm2 logs cabincalm-api --lines 20
```

### Via Monitoring Dashboard
- Open UptimeRobot app
- Check health status
- View uptime percentage

### Emergency Restart (SSH)
```bash
pm2 restart cabincalm-api
```

---

## ✅ Pre-Launch Verification (One-Time)

Before marking as "LIVE":

- [ ] Run through PRE-LAUNCH-CHECKLIST.md
- [ ] All 12 items checked
- [ ] Pre-launch backup created
- [ ] Monitoring configured
- [ ] This runbook updated with actual URLs
- [ ] Emergency contacts filled in
- [ ] Rollback procedure tested once

---

## 🎉 Launch Day Reference

### What to Monitor
```
First 1 hour:  Every 15 minutes
First 24 hours: Every 2 hours
First week:     Morning & evening
```

### What to Check
```bash
# Health
curl https://api.your-domain.com/api/health

# Logs
pm2 logs cabincalm-api --lines 50

# Memory
pm2 monit

# Errors
pm2 logs cabincalm-api --err --lines 20
```

---

**Keep this file updated as your infrastructure evolves.**

**Print or bookmark for quick emergency reference.**

*Last updated: 2026-01-05*
