import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { flightsAPI } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from './Trends.module.css';

function Trends() {
  useDocumentTitle('Anxiety Trends');
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await flightsAPI.getStats();
      setStats(response.data || null);
    } catch (error) {
      console.error('Failed to load trends:', error);
      setError('Unable to load your trends at the moment. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const getAnxietyColor = (level) => {
    const value = Number(level);

    if (Number.isNaN(value)) return '#9e9e9e';
    if (value <= 3) return '#4caf50';
    if (value <= 6) return '#ff9800';
    return '#f44336';
  };

  const formatAvg = (value) => {
    const num = Number(value);
    return Number.isNaN(num) ? '-' : num.toFixed(1);
  };

  const hasFlights =
    stats &&
    typeof stats.totalFlights === 'number' &&
    stats.totalFlights > 0;

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
            <button onClick={logout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        <h2>Your Flight Anxiety Trends</h2>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading trends...</div>
        ) : !hasFlights ? (
          <div className="empty-state">
            <p>No flight data yet. Log some flights to see your trends!</p>
            <Link to="/flights/new" className="btn-primary">
              Log Your First Flight
            </Link>
          </div>
        ) : (
          <div className="trends-content">

            {/* ===== STATS OVERVIEW ===== */}
            <div className="stats-overview">
              <div className="stat-card">
                <div className="stat-icon">✈️</div>
                <div className="stat-value">{stats.totalFlights}</div>
                <div className="stat-label">Total Flights</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">😌</div>

                <div
                  className="stat-value"
                  style={{
                    color: getAnxietyColor(stats.averageAnxiety),
                  }}
                >
                  {formatAvg(stats.averageAnxiety)}
                </div>

                <div className="stat-label">Average Anxiety</div>
              </div>
            </div>

            {/* ===== TURBULENCE DISTRIBUTION ===== */}
            {stats && stats.turbulenceDistribution && (
              <div className="chart-section">
                <h3>Turbulence Distribution</h3>

                <div className="turbulence-chart">
                  {Object.entries(stats.turbulenceDistribution).map(
                    ([level, count]) => {
                      const percentage =
                        stats.totalFlights > 0
                          ? (count / stats.totalFlights) * 100
                          : 0;

                      const colors = {
                        none: '#4caf50',
                        light: '#2196f3',
                        moderate: '#ff9800',
                        severe: '#f44336',
                      };

                      return (
                        <div key={level} className="turbulence-bar-container">
                          <div className="turbulence-label">
                            <span className="turbulence-level">
                              {level}
                            </span>
                            <span className="turbulence-count">
                              ({count} flights)
                            </span>
                          </div>

                          <div className="turbulence-bar-track">
                            <div
                              className="turbulence-bar-fill"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor:
                                  colors[level] || '#9e9e9e',
                              }}
                            />
                          </div>

                          <span className="turbulence-percentage">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* ===== ANXIETY TREND ===== */}
            {Array.isArray(stats.anxietyTrend) && stats.anxietyTrend.length > 0 && (
              <div className="chart-section">
                <h3>Anxiety Trend Over Time</h3>

                <div className="anxiety-timeline">
                  {stats.anxietyTrend
                    .filter(entry => entry && entry.date && typeof entry.anxiety === 'number')
                    .map((entry, index) => (
                    <div key={index} className="timeline-point">
                      <div className="timeline-date">
                        {new Date(entry.date).toLocaleDateString(
                          'en-US',
                          { month: 'short', day: 'numeric' }
                        )}
                      </div>

                      <div className="timeline-bar-container">
                        <div
                          className="timeline-bar"
                          style={{
                            height: `${entry.anxiety * 10}%`,
                            backgroundColor: getAnxietyColor(
                              entry.anxiety
                            ),
                          }}
                        >
                          <span className="timeline-value">
                            {entry.anxiety}
                          </span>
                        </div>
                      </div>

                      <div className="timeline-turbulence">
                        {entry.turbulence || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== COMMON TRIGGERS ===== */}
            {stats && stats.commonTriggers &&
              typeof stats.commonTriggers === 'object' &&
              Object.keys(stats.commonTriggers).length > 0 && (
                <div className="chart-section">
                  <h3>Most Common Triggers</h3>

                  <div className="triggers-list">
                    {Object.entries(stats.commonTriggers)
                      .filter(([trigger, count]) => trigger && typeof count === 'number')
                      .sort((a, b) => b[1] - a[1])
                      .map(([trigger, count]) => (
                        <div key={trigger} className="trigger-item">
                          <span className="trigger-name">
                            {trigger}
                          </span>

                          <div className="trigger-bar-container">
                            <div
                              className="trigger-bar"
                              style={{
                                width: `${
                                  stats.totalFlights > 0
                                    ? (count / stats.totalFlights) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>

                          <span className="trigger-count">
                            {count}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* ===== INSIGHTS ===== */}
            <div className="insights-section">
              <h3>📊 Insights</h3>

              <div className="insight-cards">
                {Number(stats.averageAnxiety) <= 5 && (
                  <div className="insight-card positive">
                    <p>
                      Your average anxiety level is trending on the
                      lower side. Great progress — keep tracking your
                      flights.
                    </p>
                  </div>
                )}

                {stats.turbulenceDistribution?.none >
                  stats.totalFlights / 2 && (
                  <div className="insight-card positive">
                    <p>
                      Over half of your flights experienced no
                      turbulence. Smooth flights are your norm.
                    </p>
                  </div>
                )}

                {stats.totalFlights >= 5 ? (
                  <div className="insight-card">
                    <p>
                      You’ve logged {stats.totalFlights} flights.
                      Consistency helps reveal long-term trends.
                    </p>
                  </div>
                ) : (
                  <div className="insight-card">
                    <p>
                      Keep logging flights — your insights will get
                      stronger as your history grows.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Trends;
