import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { flightsAPI } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    try {
      const response = await flightsAPI.getAll();
      setFlights(response.data);
    } catch (err) {
      setError('Failed to load flights');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this flight?')) {
      return;
    }

    try {
      await flightsAPI.delete(id);
      setFlights(flights.filter(f => f.id !== id));
    } catch (err) {
      alert('Failed to delete flight');
    }
  };

  const getTurbulenceBadge = (turbulence) => {
    const colors = {
      none: 'badge-success',
      light: 'badge-info',
      moderate: 'badge-warning',
      severe: 'badge-danger'
    };
    return colors[turbulence] || 'badge-secondary';
  };

  const getAnxietyColor = (level) => {
    if (level <= 3) return '#4caf50';
    if (level <= 6) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-content">
          <h1>CabinCalm</h1>
          <div className="nav-links">
            <Link to="/dashboard">Flights</Link>
            <Link to="/education">Education</Link>
            <Link to="/trends">Trends</Link>
            <span className="user-name">Hi, {user?.name}</span>
            <button onClick={logout} className="btn-logout">Logout</button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <h2>My Flights</h2>
          <Link to="/flights/new" className="btn-primary">Log New Flight</Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading flights...</div>
        ) : flights.length === 0 ? (
          <div className="empty-state">
            <p>You haven't logged any flights yet.</p>
            <Link to="/flights/new" className="btn-primary">Log Your First Flight</Link>
          </div>
        ) : (
          <div className="flights-grid">
            {flights.map(flight => (
              <div key={flight.id} className="flight-card">
                <div className="flight-header">
                  <h3>{flight.airline}</h3>
                  <span className={`badge ${getTurbulenceBadge(flight.turbulence)}`}>
                    {flight.turbulence}
                  </span>
                </div>
                
                <div className="flight-details">
                  <div className="detail-row">
                    <span className="label">Route:</span>
                    <span className="value">{flight.route}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Date:</span>
                    <span className="value">{new Date(flight.flight_date).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Time:</span>
                    <span className="value">{flight.flight_time}</span>
                  </div>
                  {flight.weather && (
                    <div className="detail-row">
                      <span className="label">Weather:</span>
                      <span className="value">{flight.weather}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="label">Anxiety Level:</span>
                    <div className="anxiety-display">
                      <div className="anxiety-bar">
                        <div 
                          className="anxiety-fill" 
                          style={{ 
                            width: `${flight.anxiety_level * 10}%`,
                            backgroundColor: getAnxietyColor(flight.anxiety_level)
                          }}
                        />
                      </div>
                      <span className="anxiety-value">{flight.anxiety_level}/10</span>
                    </div>
                  </div>
                  {flight.triggers && (
                    <div className="detail-row">
                      <span className="label">Triggers:</span>
                      <span className="value">{flight.triggers}</span>
                    </div>
                  )}
                  {flight.notes && (
                    <div className="detail-row notes">
                      <span className="label">Notes:</span>
                      <p className="value">{flight.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flight-actions">
                  <button 
                    onClick={() => navigate(`/flights/edit/${flight.id}`)}
                    className="btn-secondary"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(flight.id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
