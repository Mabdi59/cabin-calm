import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { flightsAPI } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from './Dashboard.module.css';

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
    <div className={styles.dashboard}>
      <div className={styles.topBar}>
        <div className={styles.userInfo}>
          <span className={styles.greeting}>Hi, {user?.name}</span>
          <button onClick={logout} className={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>My Flights Journal</h1>
          <Link to="/flights/new" className={styles.addBtn}>+ Add Flight</Link>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading flights...</p>
          </div>
        ) : flights.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✈️</div>
            <h2>Begin Your Flight Journey</h2>
            <p className={styles.emptyIntro}>
              Your first entry will help create your personal anxiety profile. Tracking your flights helps you understand what situations raise anxiety, what helps you feel calmer, and how your confidence improves over time.
            </p>
            
            <div className={styles.emptyFeatures}>
              <h3>What you'll track:</h3>
              <ul>
                <li>✓ Flight details and conditions</li>
                <li>✓ Turbulence and weather</li>
                <li>✓ Your anxiety level</li>
                <li>✓ Triggers you noticed</li>
                <li>✓ What helped you feel calmer</li>
              </ul>
            </div>

            <p className={styles.emptyReassurance}>
              Many anxious flyers notice patterns that become easier to manage once they're aware of them. CabinCalm helps you understand those patterns in a safe and supportive way.
            </p>
            
            <Link to="/flights/new" className={styles.primaryBtn}>Start Your First Flight Entry</Link>
          </div>
        ) : (
          <div className={styles.flightsGrid}>
            {flights.map(flight => (
              <div key={flight._id || flight.id} className={styles.flightCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.route}>
                    {flight.route ? (
                      <span className={styles.airport}>{flight.route}</span>
                    ) : (
                      <>
                        <span className={styles.airport}>{flight.departure_airport || 'N/A'}</span>
                        <span className={styles.arrow}>→</span>
                        <span className={styles.airport}>{flight.arrival_airport || 'N/A'}</span>
                      </>
                    )}
                  </div>
                  <div 
                    className={styles.anxietyBadge}
                    style={{ backgroundColor: getAnxietyColor(flight.anxiety_level) }}
                  >
                    {flight.anxiety_level || 'N/A'}/10
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Date:</span>
                    <span className={styles.value}>{formatDate(flight.flight_date)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Flight:</span>
                    <span className={styles.value}>{flight.flightNumber || flight.airline || 'N/A'}</span>
                  </div>
                  {flight.triggers && Array.isArray(flight.triggers) && flight.triggers.length > 0 && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Triggers:</span>
                      <div className={styles.triggers}>
                        {flight.triggers.map((trigger, idx) => (
                          <span key={idx} className={styles.trigger}>{trigger}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {flight.notes && (
                    <div className={styles.notes}>
                      <span className={styles.label}>Notes:</span>
                      <p>{flight.notes}</p>
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <button 
                    onClick={() => navigate(`/flights/edit/${flight._id || flight.id}`)}
                    className={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(flight._id || flight.id)}
                    className={styles.deleteBtn}
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
