import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.logo} style={{fontSize: '4rem', margin: '0 0 1rem'}}>404</h1>
        <h2 className={styles.heading}>Page Not Found</h2>
        <p className={styles.subtitle}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {user ? (
            <>
              <Link to="/dashboard" className={styles.submitBtn}>
                Go to Dashboard
              </Link>
              <button 
                onClick={() => navigate(-1)} 
                className={styles.submitBtn}
                style={{ background: 'rgba(102, 126, 234, 0.1)', color: 'var(--indigo)' }}
              >
                Go Back
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.submitBtn}>
                Go to Login
              </Link>
              <Link to="/register" className={styles.submitBtn} style={{ background: 'rgba(102, 126, 234, 0.1)', color: 'var(--indigo)' }}>
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotFound;
