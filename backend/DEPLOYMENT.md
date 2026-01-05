# CabinCalm Backend - Production Deployment Guide

## Pre-Deployment Checklist

### ✅ Required Environment Variables

Create a `.env` file on your production server with these variables:

```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Security - CRITICAL: Generate a strong secret!
JWT_SECRET=<your-super-secure-random-64-character-string>

# CORS Configuration - Set to your frontend domain
CLIENT_ORIGIN=https://your-frontend-domain.com
```

**Generate a secure JWT_SECRET:**
```bash
# Use Node.js to generate a random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Deployment Steps

### 1. Prepare the Server

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 or higher recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Upload Backend Code

```bash
# Clone your repository or upload files
git clone <your-repo-url>
cd cabin-calm/backend

# Or use SCP/SFTP to upload files
```

### 3. Install Dependencies

```bash
npm install --production
```

### 4. Set Up Environment Variables

```bash
# Copy and edit the environment file
cp .env.example .env
nano .env  # or vim, or your preferred editor

# Make sure to set:
# - Strong JWT_SECRET
# - Production CLIENT_ORIGIN
# - NODE_ENV=production
```

### 5. Initialize Database

```bash
# The database will be created automatically on first run
# But you can pre-initialize it:
node database.js

# Run VACUUM for optimization
node vacuum.js
```

### 6. Test the Server

```bash
# Start the server manually first
node server.js

# You should see:
# CabinCalm server running on port 5000
# Environment: production
# CORS origin: https://your-frontend.com
# Connected to CabinCalm database

# Test health endpoint
curl http://localhost:5000/api/health
# Should return: {"status":"ok","message":"CabinCalm API is running"}
```

---

## Production Process Management

### Option A: PM2 (Recommended)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the application
pm2 start server.js --name cabincalm-api

# Configure PM2 to restart on system reboot
pm2 startup
pm2 save

# Useful PM2 commands:
pm2 status              # Check status
pm2 logs cabincalm-api  # View logs
pm2 restart cabincalm-api
pm2 stop cabincalm-api
pm2 delete cabincalm-api
```

### Option B: systemd Service

Create `/etc/systemd/system/cabincalm.service`:

```ini
[Unit]
Description=CabinCalm API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/cabin-calm/backend
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=cabincalm-api
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable cabincalm
sudo systemctl start cabincalm
sudo systemctl status cabincalm

# View logs
sudo journalctl -u cabincalm -f
```

---

## Reverse Proxy Setup (Nginx)

### Install Nginx

```bash
sudo apt install nginx -y
```

### Configure Nginx

Create `/etc/nginx/sites-available/cabincalm-api`:

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/cabincalm-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Add SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d api.your-domain.com

# Certbot will automatically update your nginx config
# and set up auto-renewal
```

---

## Database Backup Strategy

### Manual Backup

```bash
# Create backup directory
mkdir -p ~/backups/cabincalm

# Backup database
cp cabincalm.db ~/backups/cabincalm/cabincalm-$(date +%Y%m%d-%H%M%S).db

# Or create a compressed backup
tar -czf ~/backups/cabincalm/cabincalm-$(date +%Y%m%d-%H%M%S).tar.gz cabincalm.db
```

### Automated Daily Backups

Create backup script `~/backup-cabincalm.sh`:

```bash
#!/bin/bash
BACKUP_DIR=~/backups/cabincalm
DB_PATH=/path/to/cabin-calm/backend/cabincalm.db
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Copy database
cp $DB_PATH $BACKUP_DIR/cabincalm-$TIMESTAMP.db

# Keep only last 30 days of backups
find $BACKUP_DIR -name "cabincalm-*.db" -mtime +30 -delete

echo "Backup completed: cabincalm-$TIMESTAMP.db"
```

Make executable and add to crontab:
```bash
chmod +x ~/backup-cabincalm.sh

# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/yourusername/backup-cabincalm.sh >> /home/yourusername/backup.log 2>&1
```

---

## Monitoring and Health Checks

### Health Endpoint

The backend provides `/api/health` for monitoring:

```bash
curl https://api.your-domain.com/api/health
```

### External Monitoring Services

Set up monitoring with services like:
- **UptimeRobot** (free)
- **Pingdom**
- **StatusCake**

Configure to ping `/api/health` every 5 minutes.

### Log Monitoring

```bash
# With PM2
pm2 logs cabincalm-api --lines 100

# With systemd
sudo journalctl -u cabincalm -f --lines=100

# Check for errors
sudo journalctl -u cabincalm -p err
```

---

## Security Best Practices

### ✅ Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

# Block direct access to Node.js port
sudo ufw deny 5000

sudo ufw enable
sudo ufw status
```

### ✅ Database Permissions

```bash
# Set proper permissions on database file
chmod 600 cabincalm.db
chown www-data:www-data cabincalm.db  # or your app user
```

### ✅ Environment File Security

```bash
# Protect .env file
chmod 600 .env
chown www-data:www-data .env
```

### ✅ Regular Updates

```bash
# Update dependencies regularly
npm audit
npm audit fix

# Update Node.js
sudo npm install -g n
sudo n stable
```

---

## Testing Your Production Deployment

### Smoke Test Checklist

1. **Health Check**
   ```bash
   curl https://api.your-domain.com/api/health
   ```

2. **Registration**
   ```bash
   curl -X POST https://api.your-domain.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test12345","name":"Test User"}'
   ```

3. **Login**
   ```bash
   curl -X POST https://api.your-domain.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test12345"}'
   ```

4. **Protected Endpoint (with token)**
   ```bash
   curl -X GET https://api.your-domain.com/api/flights \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

5. **CORS Test**
   - Visit your frontend
   - Try to register/login
   - Verify requests complete successfully

6. **Rate Limiting Test**
   - Try registering 21 times in 15 minutes
   - 21st attempt should fail with 429 status

---

## Troubleshooting

### Server won't start

```bash
# Check logs
pm2 logs cabincalm-api

# Common issues:
# 1. Port already in use
sudo lsof -i :5000
# Kill process if needed
sudo kill -9 <PID>

# 2. Missing environment variables
cat .env
# Verify all required vars are set

# 3. Database permission issues
ls -la cabincalm.db
# Should be readable/writable by app user
```

### CORS Errors

```bash
# Verify CLIENT_ORIGIN in .env
grep CLIENT_ORIGIN .env

# Should match your frontend domain exactly
# Including protocol (https://) and no trailing slash
```

### Database Locked Errors

```bash
# Check for multiple processes accessing database
ps aux | grep node

# Stop all instances
pm2 stop all

# Restart
pm2 start cabincalm-api
```

### High Memory Usage

```bash
# Monitor memory
pm2 monit

# If needed, restart periodically
pm2 restart cabincalm-api --cron "0 3 * * *"  # Daily at 3 AM
```

---

## Rollback Procedure

If deployment fails:

```bash
# 1. Stop the new version
pm2 stop cabincalm-api

# 2. Restore previous code
git checkout <previous-commit>
npm install

# 3. Restore database backup if needed
cp ~/backups/cabincalm/cabincalm-TIMESTAMP.db cabincalm.db

# 4. Restart
pm2 restart cabincalm-api

# 5. Verify health
curl http://localhost:5000/api/health
```

---

## Performance Optimization

### Enable Compression

Add to [server.js](server.js):

```javascript
const compression = require('compression');
app.use(compression());
```

Install:
```bash
npm install compression
```

### Database Optimization

```bash
# Run VACUUM periodically (monthly recommended)
node vacuum.js

# Or add to crontab
0 3 1 * * cd /path/to/backend && node vacuum.js
```

---

## Frontend Integration

After backend is deployed, provide these details to your frontend:

```javascript
// Frontend .env file
VITE_API_URL=https://api.your-domain.com
```

Make sure frontend makes requests to the production API URL, not localhost.

---

## Quick Reference

### Essential Commands

```bash
# Start server
pm2 start server.js --name cabincalm-api

# View logs
pm2 logs cabincalm-api

# Restart server
pm2 restart cabincalm-api

# Check status
pm2 status

# Backup database
cp cabincalm.db ~/backups/cabincalm-$(date +%Y%m%d).db

# View health
curl http://localhost:5000/api/health
```

### Important Files

- `cabincalm.db` - SQLite database
- `.env` - Environment configuration
- `server.js` - Main application file
- `database.js` - Database initialization

### Support Contacts

- Check logs first: `pm2 logs cabincalm-api`
- Health endpoint: `https://api.your-domain.com/api/health`
- Database backups: `~/backups/cabincalm/`

---

## Post-Deployment Checklist

- [ ] Backend running on production server
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] CORS configured for frontend domain
- [ ] Process manager (PM2) running
- [ ] Automated backups scheduled
- [ ] Health monitoring configured
- [ ] Firewall rules applied
- [ ] Frontend updated with production API URL
- [ ] Smoke tests passed
- [ ] Documentation updated

---

**Your backend is production-ready! 🚀**

For issues, check logs first, then verify environment variables and database permissions.
