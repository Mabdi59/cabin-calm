import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { educationAPI } from '../services/api';
import './Education.css';

function Education() {
  const { user, logout } = useAuth();
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);

  const loadArticles = async () => {
    try {
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const response = await educationAPI.getAll(category);
      setArticles(response.data);
    } catch (err) {
      setError('Failed to load education content');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'turbulence', label: 'Turbulence' },
    { id: 'sounds', label: 'Sounds' },
    { id: 'phases', label: 'Flight Phases' },
    { id: 'sensations', label: 'Sensations' }
  ];

  const getCategoryIcon = (category) => {
    const icons = {
      turbulence: '🌪️',
      sounds: '🔊',
      phases: '✈️',
      sensations: '😌'
    };
    return icons[category] || '📚';
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
        <div className="education-header">
          <h2>Understanding Flight Anxiety</h2>
          <p className="education-intro">
            Learn about common sensations, sounds, and experiences during flight. 
            Understanding what's normal can help reduce anxiety.
          </p>
        </div>

        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading content...</div>
        ) : (
          <div className="articles-grid">
            {articles.map(article => (
              <div key={article.id} className="article-card">
                <div className="article-icon">
                  {getCategoryIcon(article.category)}
                </div>
                <h3>{article.title}</h3>
                <div className="article-category">
                  {article.category}
                </div>
                <p className="article-content">{article.content}</p>
              </div>
            ))}
          </div>
        )}

        <div className="helpful-tips">
          <h3>💡 Quick Tips for Managing Flight Anxiety</h3>
          <ul>
            <li>Practice deep breathing exercises before and during the flight</li>
            <li>Stay hydrated and avoid excessive caffeine</li>
            <li>Listen to calming music or a guided meditation</li>
            <li>Focus on the destination and positive outcomes</li>
            <li>Remember that turbulence is normal and aircraft are designed to handle it</li>
            <li>Talk to flight attendants - they're there to help you feel comfortable</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Education;
