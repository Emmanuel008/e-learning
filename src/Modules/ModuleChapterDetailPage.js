import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardShell from '../Dashboard/DashboardShell';
import { moduleConfigsBySlug } from './moduleConfigs';
import './ModuleDetail.css';

const ModuleChapterDetailPage = () => {
  const navigate = useNavigate();
  const { moduleCode, chapterId } = useParams();

  const config = moduleConfigsBySlug[moduleCode];
  const chapter = config?.chapters.find(
    (ch) => ch.id === chapterId && ch.type !== 'Quiz'
  );

  const handleBack = () => {
    navigate(`/modules/${moduleCode}`);
  };

  if (!config || !chapter) {
    return (
      <DashboardShell activeMenuId="mymodule">
        <div className="module-page">
          <div className="module-detail-panel">
            <p className="module-detail-empty">
              Chapter not found for this module.
            </p>
            <button type="button" className="module-back" onClick={handleBack}>
              ← Back to module
            </button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const isVideo = chapter.type === 'Video';
  const listItems = isVideo
    ? chapter.videos || []
    : chapter.sections || [];

  return (
    <DashboardShell activeMenuId="mymodule">
      <div className="module-page">
        <header className="module-header">
          <div className="module-header-main">
            <button
              type="button"
              className="module-back"
              onClick={handleBack}
            >
              ← Back to module
            </button>

            <div className="module-header-left">
              <div className="module-logo">HM</div>
              <div className="module-header-text">
                <h1 className="module-title">{config.title}</h1>
                {config.subtitle && (
                  <p className="module-subtitle">{config.subtitle}</p>
                )}
              </div>
            </div>
          </div>
        </header>

        <section className="module-detail-section">
          <div className="module-detail-panel">
            <div className="module-detail-header">
              <h3 className="module-detail-title">
                Chapter {chapter.number} &middot; {chapter.title}
              </h3>
              <span className="module-detail-type-tag">
                {isVideo ? 'Videos' : 'Sections'}
              </span>
            </div>

            {listItems.length === 0 ? (
              <p className="module-detail-empty">
                Details for this chapter will appear here.
              </p>
            ) : isVideo ? (
              <div className="module-video-grid">
                {listItems.map((video) => (
                  <div key={video.id} className="module-video-card">
                    <div className="module-video-thumb">
                      <div className="module-video-play-icon">▶</div>
                    </div>
                    <div className="module-video-meta">
                      <div className="module-video-title">{video.title}</div>
                      {video.duration && (
                        <div className="module-video-duration">
                          {video.duration} min
                        </div>
                      )}
                    </div>
                    <div className="module-video-progress">
                      <div className="module-video-progress-bar">
                        <div
                          className="module-video-progress-fill"
                          style={{ width: `${video.progress || 0}%` }}
                        />
                      </div>
                      <div className="module-video-progress-text">
                        {video.progress || 0}% Complete
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="module-detail-list">
                {listItems.map((item) => (
                  <div key={item.id} className="module-detail-card">
                    <div className="module-detail-card-title">
                      {item.title}
                    </div>
                    {item.description && (
                      <p className="module-detail-card-description">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
};

export default ModuleChapterDetailPage;

