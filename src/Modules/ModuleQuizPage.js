import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardShell from '../Dashboard/DashboardShell';
import { moduleConfigsBySlug } from './moduleConfigs';
import './ModuleDetail.css';

const ModuleQuizPage = () => {
  const navigate = useNavigate();
  const { moduleCode, chapterId } = useParams();
  const [answers, setAnswers] = useState({});

  const config = moduleConfigsBySlug[moduleCode];
  const chapter = config?.chapters.find(
    (ch) => ch.id === chapterId && ch.type === 'Quiz'
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
              Quiz not found for this module.
            </p>
            <button type="button" className="module-back" onClick={handleBack}>
              ← Back to module
            </button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));
  };

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
                Quiz &middot; {chapter.title}
              </h3>
              <span className="module-detail-type-tag">Multiple choice</span>
            </div>

            {(chapter.questions || []).map((question) => {
              const selected = answers[question.id];

              return (
                <div key={question.id} className="module-quiz-question">
                  <p className="module-quiz-question-text">{question.text}</p>
                  <div className="module-quiz-options">
                    {question.options.map((option) => (
                      <label
                        key={option.id}
                        className="module-quiz-option"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option.id}
                          checked={selected === option.id}
                          onChange={() =>
                            handleAnswerChange(question.id, option.id)
                          }
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
};

export default ModuleQuizPage;

