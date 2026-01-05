# CabinCalm - Quick Start Guide

## 🚀 Development Setup

### Prerequisites
- Node.js v18 or higher
- npm or yarn

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your settings

# Start server
node server.js

# Server runs on http://localhost:5000
```

### Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Create .env file (optional, defaults to localhost:5000)
echo "VITE_API_URL=http://localhost:5000/api" > .env.development

# Start development server
npm run dev

# App runs on http://localhost:5173
```

---

## 📁 Project Structure

```
cabin-calm/
├── backend/
│   ├── server.js           # Main Express server
│   ├── database.js         # SQLite database setup
│   ├── cabincalm.db       # SQLite database file
│   ├── .env.example        # Environment template
│   ├── middleware/
│   │   └── auth.js        # JWT authentication
│   └── routes/
│       ├── auth.js        # Login/register endpoints
│       ├── flights.js     # Flight CRUD + stats
│       └── education.js   # Educational content
│
└── client/
    ├── index.html          # Entry point with metadata
    ├── src/
    │   ├── App.jsx         # Main app with routing
    │   ├── main.jsx        # React entry
    │   ├── hooks/
    │   │   └── useDocumentTitle.js  # Page titles
    │   ├── components/
    │   │   └── SearchableSelect.jsx  # Reusable dropdown
    │   ├── context/
    │   │   └── AuthContext.jsx      # Auth state
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx        # Flight list
    │   │   ├── FlightForm.jsx       # Add/edit flight
    │   │   ├── Education.jsx        # Articles
    │   │   ├── Trends.jsx           # Analytics
    │   │   ├── RealTimeGuide.jsx    # In-flight guide
    │   │   └── NotFound.jsx         # 404 page
    │   └── services/
    │       └── api.js      # Axios API client
    ├── .env.development    # Dev environment
    ├── netlify.toml        # Netlify config
    └── vercel.json         # Vercel config
```

---

## 🔑 Environment Variables

### Backend (.env)
```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_ORIGIN=http://localhost:5173
```

### Frontend (.env.development)
```bash
VITE_API_URL=http://localhost:5000/api
```

---

## 🛠️ Common Commands

### Backend
```bash
# Start server
node server.js

# Optimize database
node vacuum.js

# Check health
curl http://localhost:5000/api/health
```

### Frontend
```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🧪 Testing the App

### Quick Test Flow
1. Start backend: `cd backend && node server.js`
2. Start frontend: `cd client && npm run dev`
3. Open browser: `http://localhost:5173`
4. Register a new account
5. Add a test flight
6. Check dashboard, trends, education, and guide

### API Health Check
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"ok","message":"CabinCalm API is running"}
```

---

## 🚀 Deployment

### Backend
See `backend/` directory for deployment guide.
- Deploy to VPS, Heroku, Railway, or Render
- Set environment variables
- Use PM2 or systemd for process management
- Configure reverse proxy (nginx)
- Add SSL certificate

### Frontend
See `client/DEPLOYMENT.md` for detailed guide.
- **Recommended**: Netlify or Vercel (free tier)
- Set `VITE_API_URL` environment variable
- Deploy from Git or CLI
- Automatic SSL and CDN included

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Flights
- `GET /api/flights` - Get all user flights
- `GET /api/flights/:id` - Get one flight
- `POST /api/flights` - Create flight
- `PUT /api/flights/:id` - Update flight
- `DELETE /api/flights/:id` - Delete flight
- `GET /api/flights/stats/trends` - Get analytics

### Education
- `GET /api/education` - Get all articles (optional ?category=)
- `GET /api/education/:id` - Get one article

All protected endpoints require `Authorization: Bearer <token>` header.

---

## 🔐 Security Features

### Backend
- ✅ Helmet security headers
- ✅ Rate limiting on auth endpoints (20 req/15min)
- ✅ CORS with origin whitelist
- ✅ JWT token authentication (7-day expiry)
- ✅ Bcrypt password hashing (10 rounds)
- ✅ SQL injection protection (parameterized queries)
- ✅ Foreign key constraints enforced

### Frontend
- ✅ Token expiration handling
- ✅ Automatic redirect on 401/403
- ✅ Protected route guards
- ✅ Session expiration messages
- ✅ XSS protection via React

---

## 🐛 Troubleshooting

### "CORS Error"
- Check `CLIENT_ORIGIN` in backend `.env` matches frontend URL exactly
- Include `https://` and no trailing slash

### "Cannot connect to backend"
- Verify backend is running: `curl http://localhost:5000/api/health`
- Check `VITE_API_URL` in frontend `.env`
- Check firewall rules

### "Session expired" loop
- Clear browser localStorage: `localStorage.clear()`
- Check JWT_SECRET is set in backend
- Verify token isn't manually corrupted

### "404 on page refresh" (production)
- Configure hosting to serve `index.html` for all routes
- Use `netlify.toml` or `vercel.json` provided

### Database locked
- Only one process should access SQLite at a time
- Check for multiple backend instances running

---

## 📚 Documentation

- **Frontend Finalization**: `client/FRONTEND_FINALIZATION.md`
- **Frontend Deployment**: `client/DEPLOYMENT.md`
- **Backend Setup**: `backend/` (see README if created)
- **Main README**: `README.md` (in root if created)

---

## 🎯 Key Features

### For Users
- 📝 **Flight Logging**: Track flights with detailed information
- 📊 **Trends Analysis**: Visualize anxiety patterns over time
- 📚 **Education Center**: Learn about flight sensations
- ✈️ **Real-Time Guide**: Get reassurance during flights
- 🔐 **Secure**: Personal data protected with authentication

### For Developers
- ⚡ **Modern Stack**: React 19, Vite 7, Node.js, SQLite
- 🎨 **Clean Code**: Well-organized, documented, maintainable
- 🔒 **Production Ready**: Security, performance, error handling
- 📱 **Responsive**: Works on mobile, tablet, desktop
- 🚀 **Easy Deploy**: Multiple hosting options documented

---

## 💡 Tips

### Development
- Use `console.log()` for debugging, but remove before production
- Check browser DevTools Network tab for API errors
- Use React DevTools extension for component debugging

### Database
- Run `node vacuum.js` monthly to optimize database
- Back up `cabincalm.db` regularly (especially before updates)
- Use DB Browser for SQLite to inspect data visually

### Performance
- Frontend automatically code-splits routes
- Backend uses indexes for fast queries
- Consider adding Redis cache for stats endpoint if traffic grows

---

## 🆘 Getting Help

1. Check error logs:
   - Backend: Console output or PM2 logs
   - Frontend: Browser console (F12)

2. Verify configuration:
   - Backend `.env` file
   - Frontend environment variables
   - API URL connections

3. Test basics:
   - Backend health endpoint
   - Database file exists and has data
   - CORS headers in network tab

---

## ✅ Pre-Production Checklist

### Backend
- [ ] Environment variables set (especially JWT_SECRET)
- [ ] Database backed up
- [ ] CORS configured with production frontend URL
- [ ] Rate limiting enabled
- [ ] Process manager configured (PM2)
- [ ] SSL certificate installed
- [ ] Health endpoint accessible

### Frontend
- [ ] VITE_API_URL points to production backend
- [ ] Build completes without errors
- [ ] All routes redirect to index.html
- [ ] SSL certificate installed
- [ ] Error tracking configured (optional)
- [ ] Analytics added (optional)

### Testing
- [ ] Register and login work
- [ ] CRUD operations on flights work
- [ ] Trends display correctly
- [ ] Education loads articles
- [ ] Real-time guide search works
- [ ] 404 page displays
- [ ] Session expiration handled

---

## 🎉 You're All Set!

**CabinCalm** is ready for development or production deployment.

- **Start Developing**: Run both backend and frontend locally
- **Deploy**: Follow deployment guides for production
- **Customize**: Modify content, styling, features as needed

**Need help?** Check the troubleshooting section or review the detailed documentation in each directory.

**Happy coding!** 🚀✈️
