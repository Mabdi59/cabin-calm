import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { educationAPI } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from './Education.module.css';

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
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.userInfo}>
          <span className={styles.greeting}>Hi, {user?.name}</span>
          <button onClick={logout} className={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Understanding Flight Anxiety</h1>
          <p className={styles.intro}>
            Learn what different sensations, movements, and sounds mean during flight. Clarity reduces uncertainty, and uncertainty drives anxiety.
          </p>
        </div>

        <div className={styles.filters}>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`${styles.filterBtn} ${selectedCategory === cat.id ? styles.active : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={loadArticles} className={styles.retryBtn}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading content...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📚</div>
            <h2>No articles found</h2>
            <p>Try selecting a different category or check back later.</p>
          </div>
        ) : (
          <div className={styles.articlesGrid}>
            {articles.map(article => (
              <div key={article.id || article._id} className={styles.articleCard}>
                <div className={styles.articleIcon}>
                  {getCategoryIcon(article.category)}
                </div>
                <h3>{article.title}</h3>
                <div className={styles.category}>
                  {formatCategoryLabel(article.category)}
                </div>
                <p className={styles.summary}>{getSummary(article.content)}</p>
                <button 
                  className={styles.readMoreBtn}
                  onClick={() => setSelectedArticle(article)}
                >
                  Read More
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.tips}>
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
        <div className={styles.modal} onClick={() => setSelectedArticle(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedArticle(null)}>
              ×
            </button>
            <div className={styles.modalIcon}>
              {getCategoryIcon(selectedArticle.category)}
            </div>
            <h2>{selectedArticle.title}</h2>
            <div className={styles.modalCategory}>
              {formatCategoryLabel(selectedArticle.category)}
            </div>
            <p className={styles.modalText}>{selectedArticle.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Education;
