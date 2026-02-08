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
            ) : (
              <div className="module-chapter-items-grid">
                {listItems.map((item, index) => {
                  const progress = item.progress ?? 0;
                  const typeLabel = isVideo ? 'Video' : 'Book';
                  const subLabel = isVideo ? `${item.duration || '—'} min` : null;
                  return (
                    <div
                      key={item.id}
                      className={`module-chapter-item-card ${isVideo ? 'module-chapter-item-card-video' : ''}`}
                    >
                      <div className="module-chapter-item-image">
                        {isVideo && <div className="module-chapter-item-play">▶</div>}
                      </div>
                      <div className="module-chapter-item-body">
                        <div className="module-chapter-item-label">
                          {typeLabel} {index + 1} · {isVideo ? 'Video' : 'Book'}
                        </div>
                        <div className="module-chapter-item-title">{item.title}</div>
                        {subLabel && (
                          <div className="module-chapter-item-meta">{subLabel}</div>
                        )}
                        <div className="module-chapter-item-progress">
                          <div className="module-chapter-item-progress-bar">
                            <div
                              className="module-chapter-item-progress-fill"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="module-chapter-item-progress-text">
                            {progress}% Complete
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
};

export default ModuleChapterDetailPage;

