import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { educationAPI } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import './Education.css';

function Education() {
  useDocumentTitle('Education');
  const { user, logout } = useAuth();
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const loadArticles = async () => {
    try {
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const response = await educationAPI.getAll(category);
      setArticles(response.data || []);
    } catch (error) {
      console.error('Failed to load education content:', error);
      setError('Unable to load educational content right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'turbulence', label: 'Turbulence' },
    { id: 'sounds', label: 'Cabin & Aircraft Sounds' },
    { id: 'phases', label: 'Flight Phases' },
    { id: 'sensations', label: 'Physical Sensations' }
  ];

  const getCategoryIcon = (category) => {
    const icons = {
      turbulence: '🌪️',
      sounds: '🔊',
      phases: '✈️',
      sensations: '🧠'
    };
    return icons[category] || '📚';
  };

  const formatCategoryLabel = (category) => {
    const labels = {
      turbulence: 'TURBULENCE',
      sounds: 'SOUNDS',
      phases: 'FLIGHT PHASES',
      sensations: 'SENSATIONS'
    };
    return labels[category] || category.toUpperCase();
  };

  const getSummary = (content) => {
    if (!content || typeof content !== 'string') return '';
    const maxLength = 120;
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
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
        <div className="education-header">
          <h2>Understanding Flight Anxiety</h2>
          <p className="education-intro">
            Learn what different sensations, movements, and sounds mean during flight. Clarity reduces uncertainty, and uncertainty drives anxiety.
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

        {error && (
          <div className="error-message">
            {error}
            <button 
              onClick={loadArticles} 
              style={{ marginLeft: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
              className="btn-secondary"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading content...</div>
        ) : articles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No articles found</h3>
            <p>Try selecting a different category or check back later.</p>
          </div>
        ) : (
          <div className="articles-grid">
            {articles.map(article => (
              <div key={article.id || article._id} className="article-card">
                <div className="article-icon">
                  {getCategoryIcon(article.category)}
                </div>
                <h3>{article.title}</h3>
                <div className="article-category">
                  {formatCategoryLabel(article.category)}
                </div>
                <p className="article-summary">{getSummary(article.content)}</p>
                <button 
                  className="btn-read-more"
                  onClick={() => setSelectedArticle(article)}
                >
                  Read More
                </button>
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

      {selectedArticle && (
        <div className="article-modal" onClick={() => setSelectedArticle(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedArticle(null)}>
              ×
            </button>
            <div className="modal-icon">
              {getCategoryIcon(selectedArticle.category)}
            </div>
            <h2>{selectedArticle.title}</h2>
            <div className="modal-category">
              {formatCategoryLabel(selectedArticle.category)}
            </div>
            <p className="modal-text">{selectedArticle.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Education;
