import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const heroImage = process.env.PUBLIC_URL + '/custom.jpeg';

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header-inner">
          <div className="home-brand">
            <img src={process.env.PUBLIC_URL + '/BUNI.png'} alt="BUNI" className="home-logo-img" />
            <span className="home-brand-text">E-Learning Platform</span>
          </div>
        </div>
      </header>

      <main className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-content">
            <h1 className="home-title">
              Where teaching and learning
              <span className="home-title-break">come together</span>
            </h1>
            <p className="home-subtitle">
              Create engaging learning experiences that you can personalize, manage, and measure.
              Empower learners to grow and prepare for the future with your own online classroom.
            </p>
            <div className="home-actions">
              <button
                type="button"
                className="home-btn home-btn-primary"
                onClick={handleRegisterClick}
              >
                Register
              </button>
              <button
                type="button"
                className="home-btn home-btn-secondary"
                onClick={handleLoginClick}
              >
                Login
              </button>
            </div>
          </div>
          <div className="home-hero-visual">
            <img
              src={heroImage}
              alt="Learning Management System — courses, certifications, and digital learning"
              className="home-hero-img"
            />
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <div className="home-footer-inner">
          &copy; All rights reserved 2026
        </div>
      </footer>
    </div>
  );
};

export default Home;

