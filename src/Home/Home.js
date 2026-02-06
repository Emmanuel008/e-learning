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

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-brand">
          <div className="home-logo-icon">L</div>
          <span className="home-brand-text">e-learning Platform</span>
        </div>
      </header>

      <main className="home-hero">
        <div className="home-hero-content">
          <p className="home-eyebrow">For Hub Manager </p>
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
      </main>
    </div>
  );
};

export default Home;

