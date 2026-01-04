import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { flightsAPI } from '../services/api';
import './FlightForm.css';

function FlightForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    flight_date: '',
    airline: '',
    route: '',
    flight_time: '',
    weather: '',
    turbulence: 'none',
    anxiety_level: 5,
    triggers: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      loadFlight();
    }
  }, [id]);

  const loadFlight = async () => {
    try {
      const response = await flightsAPI.getOne(id);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to load flight');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await flightsAPI.update(id, formData);
      } else {
        await flightsAPI.create(formData);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save flight');
    } finally {
      setLoading(false);
    }
  };

  const commonTriggers = [
    'Engine sounds',
    'Turbulence',
    'Takeoff',
    'Landing',
    'Descent',
    'Climb',
    'Banking/turning',
    'Weather',
    'Noises',
    'Announcements'
  ];

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
        <div className="form-container">
          <h2>{isEdit ? 'Edit Flight' : 'Log New Flight'}</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="flight_date">Flight Date *</label>
                <input
                  type="date"
                  id="flight_date"
                  name="flight_date"
                  value={formData.flight_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="flight_time">Flight Time *</label>
                <input
                  type="time"
                  id="flight_time"
                  name="flight_time"
                  value={formData.flight_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="airline">Airline *</label>
              <input
                type="text"
                id="airline"
                name="airline"
                value={formData.airline}
                onChange={handleChange}
                required
                placeholder="e.g., United Airlines, Delta, Southwest"
              />
            </div>

            <div className="form-group">
              <label htmlFor="route">Route *</label>
              <input
                type="text"
                id="route"
                name="route"
                value={formData.route}
                onChange={handleChange}
                required
                placeholder="e.g., JFK to LAX, London to Paris"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="weather">Weather Conditions</label>
                <input
                  type="text"
                  id="weather"
                  name="weather"
                  value={formData.weather}
                  onChange={handleChange}
                  placeholder="e.g., Clear, Cloudy, Rainy"
                />
              </div>

              <div className="form-group">
                <label htmlFor="turbulence">Turbulence Level *</label>
                <select
                  id="turbulence"
                  name="turbulence"
                  value={formData.turbulence}
                  onChange={handleChange}
                  required
                >
                  <option value="none">None</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="anxiety_level">
                Anxiety Level: {formData.anxiety_level}/10 *
              </label>
              <input
                type="range"
                id="anxiety_level"
                name="anxiety_level"
                min="1"
                max="10"
                value={formData.anxiety_level}
                onChange={handleChange}
                className="anxiety-slider"
              />
              <div className="anxiety-scale">
                <span>Low (1)</span>
                <span>High (10)</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="triggers">Anxiety Triggers</label>
              <div className="triggers-help">
                Common triggers (click to add):
              </div>
              <div className="trigger-chips">
                {commonTriggers.map(trigger => (
                  <button
                    key={trigger}
                    type="button"
                    className="trigger-chip"
                    onClick={() => {
                      const current = formData.triggers;
                      const triggers = current ? current.split(',').map(t => t.trim()) : [];
                      if (!triggers.includes(trigger)) {
                        triggers.push(trigger);
                        setFormData(prev => ({ ...prev, triggers: triggers.join(', ') }));
                      }
                    }}
                  >
                    + {trigger}
                  </button>
                ))}
              </div>
              <input
                type="text"
                id="triggers"
                name="triggers"
                value={formData.triggers}
                onChange={handleChange}
                placeholder="Comma-separated list of triggers"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional details about the flight..."
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Saving...' : (isEdit ? 'Update Flight' : 'Log Flight')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FlightForm;
