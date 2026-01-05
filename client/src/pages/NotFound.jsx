import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p className="auth-subtitle">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="form-actions" style={{ marginTop: '2rem' }}>
          {user ? (
            <>
              <Link to="/dashboard" className="btn-primary">
                Go to Dashboard
              </Link>
              <button 
                onClick={() => navigate(-1)} 
                className="btn-secondary"
                style={{ marginTop: '1rem' }}
              >
                Go Back
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-primary">
                Go to Login
              </Link>
              <Link to="/register" className="btn-secondary" style={{ marginTop: '1rem' }}>
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
