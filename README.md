# CabinCalm 🛫

A passenger-only web app that helps anxious flyers understand turbulence, airplane sounds, and phases of flight in plain language, while tracking their anxiety and triggers over multiple trips.

## Features

### For Anxious Flyers
- **Flight Logging**: Track your flights with details like date, airline, route, time, and weather conditions
- **Anxiety Tracking**: Rate your anxiety level (1-10) and identify specific triggers
- **Turbulence Rating**: Record turbulence levels (none/light/moderate/severe) to understand patterns
- **Triggers Identification**: Document what specifically causes anxiety during flights
- **Education Section**: Learn about common flight sensations, sounds, and experiences
- **Trends Dashboard**: Visualize your anxiety patterns over time and see your progress

### Educational Content
- Understanding turbulence and why it's safe
- Common airplane sounds explained
- Flight phases (takeoff, climb, descent, landing)
- Wing movements and why they're normal
- Debunking the "air pocket" myth

## Tech Stack

### Backend
- **Node.js** with **Express** - REST API server
- **SQLite** - Lightweight database for storing user data, flights, and education content
- **JWT** - Secure authentication
- **bcrypt** - Password hashing

### Frontend
- **React** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool and dev server

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Mabdi59/cabin-calm.git
cd cabin-calm
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

4. Create environment files:

Backend `.env` (in root directory):
```bash
cp .env.example .env
```

Edit `.env` and set your values:
```
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

Frontend `.env` (in client directory):
```bash
cd client
cp .env.example .env
```

Edit `client/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

#### Development Mode

1. Start the backend server (from root directory):
```bash
npm run dev
```
The backend will run on http://localhost:5000

2. In a new terminal, start the frontend (from root directory):
```bash
npm run client
```
The frontend will run on http://localhost:5173

3. Open your browser and navigate to http://localhost:5173

#### Production Build

1. Build the frontend:
```bash
npm run build
```

2. Set environment variables:
```bash
export NODE_ENV=production
export PORT=5000
export JWT_SECRET=your-production-secret
```

3. Start the server:
```bash
npm start
```

The application will serve the built frontend at http://localhost:5000

## Usage

### Getting Started
1. **Register**: Create a new account with your email and password
2. **Login**: Sign in to your account
3. **Log a Flight**: Click "Log New Flight" and fill in the details:
   - Flight date and time
   - Airline and route
   - Weather conditions
   - Turbulence level
   - Anxiety level (1-10 scale)
   - Specific triggers
   - Additional notes
4. **View Trends**: Check your anxiety patterns over time
5. **Learn**: Read the education section to understand flight mechanics

### Features in Detail

#### Flight Logging
- Track unlimited flights
- Edit or delete past entries
- Add detailed notes about your experience
- Select from common triggers or add custom ones

#### Trends & Analytics
- View average anxiety level across all flights
- See turbulence distribution
- Track anxiety changes over time
- Identify most common triggers
- Get insights about your progress

#### Education Section
- Filter by category (turbulence, sounds, phases, sensations)
- Read easy-to-understand explanations
- Get practical tips for managing anxiety

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Flights (Protected)
- `GET /api/flights` - Get all user's flights
- `GET /api/flights/:id` - Get specific flight
- `POST /api/flights` - Create new flight
- `PUT /api/flights/:id` - Update flight
- `DELETE /api/flights/:id` - Delete flight
- `GET /api/flights/stats/trends` - Get user's statistics

### Education (Public)
- `GET /api/education` - Get all education articles
- `GET /api/education?category=turbulence` - Filter by category
- `GET /api/education/:id` - Get specific article

## Database Schema

### Users
- id, email, password (hashed), name, created_at

### Flights
- id, user_id, flight_date, airline, route, flight_time, weather, turbulence, anxiety_level, triggers, notes, created_at

### Education Content
- id, title, category, content, created_at

## Contributing

This is a personal anxiety management tool. Feel free to fork and adapt for your own use.

## License

ISC License - See LICENSE file for details

## Support

If you're experiencing flight anxiety, consider:
- Speaking with a mental health professional
- Taking a fear of flying course
- Joining support groups for anxious flyers
- Practicing relaxation techniques

Remember: Flying is statistically one of the safest forms of travel! 🛫✈️
