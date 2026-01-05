import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { flightsAPI } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import './Dashboard.css';

// Dashboard - Flights Management
function Dashboard() {
  useDocumentTitle('My Flights');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFlights = async () => {
    try {
      const response = await flightsAPI.getAll();
      setFlights(response.data || []);
    } catch (error) {
      console.error('Failed to load flights:', error);
      setError('Unable to load your flights at the moment. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlights();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this flight?')) {
      return;
    }

    try {
      await flightsAPI.delete(id);
      setFlights(flights.filter(f => f._id !== id && f.id !== id));
    } catch (error) {
      console.error('Failed to delete flight:', error);
      alert('Unable to delete this flight. Please try again.');
    }
  };

  const getAnxietyColor = (level) => {
    if (level <= 2) return '#4caf50';
    if (level <= 4) return '#8bc34a';
    if (level <= 6) return '#ffeb3b';
    if (level <= 8) return '#ff9800';
    return '#f44336';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
            <Link to="/guide">In-Flight Guide</Link>
            <span className="user-name">Hi, {user?.name}</span>
            <button onClick={logout} className="btn-logout">Logout</button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <h2>My Flights Journal</h2>
          <Link to="/flights/new" className="btn-primary">+ Add Flight</Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading flights...</div>
        ) : flights.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✈️</div>
            <h3>Begin Your Flight Journey</h3>
            <p className="empty-intro">
              Your first entry will help create your personal anxiety profile. Tracking your flights helps you understand what situations raise anxiety, what helps you feel calmer, and how your confidence improves over time.
            </p>
            
            <div className="empty-features">
              <h4>What you'll track:</h4>
              <ul>
                <li>✓ Flight details and conditions</li>
                <li>✓ Turbulence and weather</li>
                <li>✓ Your anxiety level</li>
                <li>✓ Triggers you noticed</li>
                <li>✓ What helped you feel calmer</li>
              </ul>
            </div>

            <p className="empty-reassurance">
              Many anxious flyers notice patterns that become easier to manage once they're aware of them. CabinCalm helps you understand those patterns in a safe and supportive way.
            </p>
            
            <Link to="/flights/new" className="btn-primary btn-primary-large">Start Your First Flight Entry</Link>
          </div>
        ) : (
          <div className="flights-grid">
            {flights.map(flight => (
              <div key={flight._id || flight.id} className="flight-card">
                <div className="flight-card-header">
                  <div className="flight-route">
                    {flight.route ? (
                      <span className="airport-code">{flight.route}</span>
                    ) : (
                      <>
                        <span className="airport-code">{flight.departure_airport || 'N/A'}</span>
                        <span className="route-arrow">→</span>
                        <span className="airport-code">{flight.arrival_airport || 'N/A'}</span>
                      </>
                    )}
                  </div>
                  <div 
                    className="anxiety-badge"
                    style={{ backgroundColor: getAnxietyColor(flight.anxiety_level) }}
                  >
                    {flight.anxiety_level || 'N/A'}/10
                  </div>
                </div>

                <div className="flight-details">
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{formatDate(flight.flight_date)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Flight:</span>
                    <span className="detail-value">{flight.flightNumber || flight.airline || 'N/A'}</span>
                  </div>
                  {flight.triggers && Array.isArray(flight.triggers) && flight.triggers.length > 0 && (
                    <div className="detail-row">
                      <span className="detail-label">Triggers:</span>
                      <div className="triggers-list">
                        {flight.triggers.map((trigger, idx) => (
                          <span key={idx} className="trigger-tag">{trigger}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {flight.notes && (
                    <div className="flight-notes">
                      <span className="detail-label">Notes:</span>
                      <p>{flight.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flight-actions">
                  <button 
                    onClick={() => navigate(`/flights/edit/${flight._id || flight.id}`)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(flight._id || flight.id)}
                    className="btn-delete"
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
