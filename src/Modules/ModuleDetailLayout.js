import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../Dashboard/DashboardShell';
import './ModuleDetail.css';

const ModuleDetailLayout = ({ code, title, subtitle, stats, chapters }) => {
  const navigate = useNavigate();
  const moduleSlug = code.toLowerCase();

  return (
    <DashboardShell activeMenuId="mymodule">
      <div className="module-page">
        <header className="module-header">
          <div className="module-header-main">
            <button
              type="button"
              className="module-back"
              onClick={() => navigate('/dashboard?menu=mymodule')}
            >
              ← Back to My Modules
            </button>

            <div className="module-header-left">
              <div className="module-logo">HM</div>
              <div className="module-header-text">
                <h1 className="module-title">{title}</h1>
                {subtitle && <p className="module-subtitle">{subtitle}</p>}
                <div className="module-meta">
                  <span>{chapters.length} chapters</span>
                  <span>{stats.videos} videos</span>
                  <span>{stats.questions} questions</span>
                </div>
              </div>
            </div>
          </div>

          <div className="module-header-right">
            <div className="module-progress-circle">
              <span>{stats.progress}%</span>
            </div>
            <p className="module-progress-text">
              Progress - {stats.progress}% Complete
            </p>
          </div>
        </header>

        <section className="module-chapters-section">
          <div className="module-chapters-header">
            <h2>
              Chapters <span className="module-chapters-count">({chapters.length} Chapters)</span>
            </h2>
          </div>

          <div className="module-chapters-grid">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className={`module-chapter-card ${
                  chapter.type === 'Quiz' ? 'module-chapter-card-quiz' : ''
                }`}
                onClick={() =>
                  navigate(
                    `/modules/${moduleSlug}/${
                      chapter.type === 'Quiz' ? 'quiz' : 'chapter'
                    }/${chapter.id}`
                  )
                }
              >
                <div className="module-chapter-image" />
                <div className="module-chapter-body">
                  <div className="module-chapter-label">
                    Chapter {chapter.number} &middot; {chapter.type}
                  </div>
                  <div className="module-chapter-title">{chapter.title}</div>
                  {chapter.type === 'Quiz' ? (
                    <div className="module-quiz-status-row">
                      <span className="module-quiz-status-label">Status</span>
                      <span className={`module-quiz-status ${chapter.status?.toLowerCase?.() || (chapter.progress >= 100 ? 'finished' : 'start')}`}>
                        {chapter.status || (chapter.progress >= 100 ? 'Finished' : 'Start')}
                      </span>
                    </div>
                  ) : (
                    <div className="module-chapter-progress">
                      <div className="module-chapter-progress-bar">
                        <div
                          className="module-chapter-progress-fill"
                          style={{ width: `${chapter.progress}%` }}
                        />
                      </div>
                      <span className="module-chapter-progress-text">
                        {chapter.progress}% Complete
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
};

export default ModuleDetailLayout;

