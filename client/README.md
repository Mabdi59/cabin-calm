# CabinCalm - Frontend

A comprehensive web application designed to help passengers understand and manage flight anxiety through tracking, education, and real-time reassurance.

**Production-Ready React Application** built with Vite, React Router, and modern best practices.

## Features

### 🛫 Flight Logging
- Track detailed flight information including:
  - Departure and arrival airports (searchable from 37+ airports worldwide)
  - Airline selection (16+ major carriers)
  - Weather conditions
  - Seat location (window/middle/aisle, front/middle/back/over wing)
  - Turbulence levels
  - Personal anxiety ratings (1-10 scale)
  - Anxiety triggers
  - Flight notes

### 📊 Trends & Analytics
- Visualize anxiety patterns over time
- View turbulence distribution across flights
- Identify common triggers
- Track progress with personalized insights
- See average anxiety levels

### 📚 Education Center
- Learn about flight sensations and sounds
- Categorized content:
  - Turbulence explanations
  - Aircraft sounds (engine, hydraulics, APU)
  - Flight phases (takeoff, cruise, landing)
  - Physical sensations during flight

### ✈️ Real-Time In-Flight Guide
- **"What's that sound? Is this normal?"** - Instant answers during flight
- 8 comprehensive flight phases covered:
  - Pre-Flight & Boarding
  - Pushback & Taxi
  - Takeoff
  - Climb
  - Cruise
  - Descent
  - Approach & Landing
  - Go-Around situations
- Searchable database of sensations and explanations
- Dropdown interface for each sensation
- Reassurance messaging for nervous flyers

### 🔍 Smart Search Features
- Searchable dropdowns for airlines, airports, and weather
- Real-time filtering as you type
- Search by airport code or city name

## Technology Stack

- **Frontend**: React 19.2.0, React Router DOM 7.11.0
- **Build Tool**: Vite 7.2.4
- **HTTP Client**: Axios 1.13.2
- **Styling**: Custom CSS
- **Backend**: Node.js/Express (separate repository)
- **Database**: SQLite

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd cabin-calm/client
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create .env file in the client directory
cp .env.example .env

# Edit .env with your backend API URL (default: http://localhost:5000/api)
```

4. Start the development server
```bash
npm start
# or
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Project Structure

```
client/
├── src/
│   ├── assets/          # Static assets
│   ├── components/      # Reusable components
│   │   └── SearchableSelect.jsx
│   ├── context/         # React Context providers
│   │   └── AuthContext.jsx
│   ├── pages/           # Page components
│   │   ├── Auth.css
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── FlightForm.jsx
│   │   ├── Education.jsx
│   │   ├── Trends.jsx
│   │   └── RealTimeGuide.jsx
│   ├── services/        # API services
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── package.json
└── vite.config.js
```

## API Endpoints

The frontend connects to these backend endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/flights` - Get all user flights
- `POST /api/flights` - Create new flight log
- `PUT /api/flights/:id` - Update flight log
- `DELETE /api/flights/:id` - Delete flight log
- `GET /api/flights/stats/trends` - Get anxiety trends
- `GET /api/education` - Get educational content

## License

MIT
