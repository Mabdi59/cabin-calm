import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainNav from './components/MainNav/MainNav';
import Home from './pages/Home/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FlightForm from './pages/FlightForm';
import Education from './pages/Education';
import Trends from './pages/Trends';
import RealTimeGuide from './pages/RealTimeGuide';
import NotFound from './pages/NotFound';
import './App.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return !user ? children : <Navigate to="/dashboard" />;
}

function Layout() {
  const location = useLocation();
  const showMainNav = location.pathname === '/';
  
  return (
    <>
      {showMainNav && <MainNav />}
      <Routes>
        <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/flights/new" 
            element={
              <PrivateRoute>
                <FlightForm />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/flights/edit/:id" 
            element={
              <PrivateRoute>
                <FlightForm />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/education" 
            element={
              <PrivateRoute>
                <Education />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/trends" 
            element={
              <PrivateRoute>
                <Trends />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/guide" 
            element={
              <PrivateRoute>
                <RealTimeGuide />
              </PrivateRoute>
            } 
          />
        >
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout />
      </  <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
