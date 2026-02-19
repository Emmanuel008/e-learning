import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardShell from '../Dashboard/DashboardShell';
import { moduleApi, quizAnswerApi } from '../api/api';
import './ModuleDetail.css';

function getListFromResponse(data) {
  const returnData = data?.returnData;
  if (!returnData) return [];
  const listOfItem = returnData.list_of_item ?? returnData;
  if (Array.isArray(listOfItem)) return listOfItem;
  return listOfItem?.data ?? returnData.data ?? [];
}

const ModuleQuizResultsPage = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const id = Number(moduleId);
  const [moduleInfo, setModuleInfo] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModule = useCallback(async () => {
    if (!id) return;
    try {
      let mod = null;
      let pageNum = 1;
      const perPage = 5;
      while (true) {
        const { data } = await moduleApi.ilist({ paginate: true, per_page: perPage, page: pageNum });
        if (data?.status !== 'OK') break;
        const list = getListFromResponse(data);
        const found = list.find((m) => Number(m.id) === id);
        if (found) {
          mod = found;
          break;
        }
        const rd = data?.returnData || {};
        const metaInfo = rd.list_of_item?.meta ?? rd.meta ?? rd;
        if (pageNum >= (metaInfo?.last_page ?? rd?.last_page ?? 1)) break;
        pageNum += 1;
      }
      if (!mod) {
        const { data } = await moduleApi.iget(id);
        if (data?.status === 'OK') {
          const m = data?.returnData?.module ?? data?.returnData ?? data?.module;
          if (m) mod = m;
        }
      }
      if (mod) {
        setModuleInfo({
          id: mod.id,
          name: mod.name ?? mod.module_name ?? mod.title ?? 'Module',
          code: mod.code ?? ''
        });
      }
    } catch (_) {
      setModuleInfo(null);
    }
  }, [id]);

  const fetchResults = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await quizAnswerApi.iresults({ module_id: id });
      if (data?.status === 'OK') {
        setResultsData(data?.returnData ?? data);
        setError(null);
      } else {
        setResultsData(null);
        setError(data?.errorMessage || 'No results found.');
      }
    } catch (err) {
      setResultsData(null);
      setError(err.response?.data?.errorMessage ?? err.message ?? 'Failed to load results.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchModule();
  }, [fetchModule]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleBackToQuiz = () => navigate(`/modules/${moduleId}/quiz`);
  const handleBackToModule = () => navigate(`/modules/${moduleId}`);

  const rd = resultsData;
  const listRaw = rd?.list_of_item ?? rd?.results ?? rd?.answers ?? rd?.list ?? rd?.data;
  const list = Array.isArray(listRaw) ? listRaw : (listRaw?.data ?? []);
  const countCorrect = rd?.count_correct_answer ?? rd?.score ?? rd?.total_score ?? rd?.marks;
  const totalQuestions = rd?.total_questions ?? rd?.total ?? rd?.total_marks;
  const passPercentage = rd?.passPercentage ?? rd?.pass_percentage ?? rd?.percentage;
  const hasList = Array.isArray(list) && list.length > 0;

  return (
    <DashboardShell activeMenuId="mymodule">
      <div className="module-page">
        <header className="module-header">
          <div className="module-header-main">
            <button type="button" className="module-back" onClick={handleBackToModule}>
              ← Back to module
            </button>
            <div className="module-header-left">
              <div className="module-logo">HM</div>
              <div className="module-header-text">
                <h1 className="module-title">
                  {moduleInfo?.code ? `${moduleInfo.code} - ${moduleInfo.name}` : (moduleInfo?.name ?? 'Module')}
                </h1>
                <p className="module-subtitle">Quiz results</p>
              </div>
            </div>
          </div>
        </header>

        <section className="module-detail-section">
          <div className="module-detail-panel">
            <div className="module-quiz-results-actions">
              <button type="button" className="module-quiz-submit-btn" onClick={handleBackToQuiz}>
                ← Back to quiz
              </button>
            </div>
            {error && !resultsData && <p className="management-error">{error}</p>}
            {loading ? (
              <p className="module-detail-empty">Loading results…</p>
            ) : (
              <div className="module-quiz-results-wrap">
                <div className="module-quiz-results">
                  <h3 className="module-quiz-results-title">Your answers and results</h3>
                  {(countCorrect != null || totalQuestions != null) && (
                    <p className="module-quiz-results-score">
                      Correct: {countCorrect != null ? countCorrect : '—'}
                      {totalQuestions != null ? ` / ${totalQuestions}` : ''} questions
                    </p>
                  )}
                  {passPercentage != null && (
                    <p className="module-quiz-results-percentage">
                      Pass: {Number(passPercentage).toFixed(1)}%
                    </p>
                  )}
                  {hasList ? (
                    <ul className="module-quiz-results-list">
                      {list.map((item, idx) => (
                        <li key={item.question_id ?? item.id ?? idx} className="module-quiz-results-item">
                          <span className="module-quiz-results-q">
                            {item.question_text ?? item.question ?? item.text ?? `Q${idx + 1}`}
                          </span>
                          <span className="module-quiz-results-answer">
                            Your answer: {item.your_answer ?? item.answer ?? item.user_answer ?? '—'}
                            {item.correct_answer != null && <> · Correct: {item.correct_answer}</>}
                            {item.is_correct != null && (
                              <span
                                className={
                                  item.is_correct ? 'module-quiz-results-correct' : 'module-quiz-results-incorrect'
                                }
                              >
                                {item.is_correct ? ' ✓' : ' ✗'}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="module-detail-empty">No results to display. Submit the quiz first.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
};

export default ModuleQuizResultsPage;
