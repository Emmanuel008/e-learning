import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardShell from '../Dashboard/DashboardShell';
import Pagination from '../components/Pagination';
import { moduleApi, quizApi, quizAnswerApi } from '../api/api';
import { getUserData } from '../Dashboard/dashboardService';
import './ModuleDetail.css';

const PER_PAGE = 10;

function getListFromResponse(data) {
  const returnData = data?.returnData;
  if (!returnData) return [];
  const listOfItem = returnData.list_of_item ?? returnData;
  if (Array.isArray(listOfItem)) return listOfItem;
  return listOfItem?.data ?? returnData.data ?? [];
}

function getPaginatedMeta(data, perPage) {
  const returnData = data?.returnData || {};
  const listOfItem = returnData.list_of_item || returnData;
  const meta = listOfItem?.meta || returnData.meta || listOfItem || returnData || data;
  const total = Number(meta.total ?? meta.totalCount ?? returnData.total ?? 0) || 0;
  const per = Number(meta.per_page ?? meta.perPage ?? perPage) || perPage;
  const current = Number(meta.current_page ?? meta.currentPage ?? 1) || 1;
  const last = meta.last_page ?? meta.lastPage ?? (per > 0 ? Math.max(1, Math.ceil(total / per)) : 1);
  return {
    current_page: current,
    last_page: Math.max(1, Number(last) || 1),
    total,
    per_page: per
  };
}

const ModuleQuizListPage = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const [moduleInfo, setModuleInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: PER_PAGE });
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);
  const resultsRef = useRef(null);

  const id = Number(moduleId);

  const fetchModule = useCallback(async () => {
    if (!id) return;
    try {
      let mod = null;
      let page = 1;
      const perPage = 5;
      while (true) {
        const { data } = await moduleApi.ilist({ paginate: true, per_page: perPage, page });
        if (data?.status !== 'OK') break;
        const list = getListFromResponse(data);
        const found = list.find((m) => Number(m.id) === id);
        if (found) {
          mod = found;
          break;
        }
        const rd = data?.returnData || {};
        const meta = rd.list_of_item?.meta ?? rd.meta ?? rd;
        const lastPage = meta?.last_page ?? rd?.last_page ?? 1;
        if (page >= lastPage) break;
        page += 1;
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
      } else {
        setModuleInfo(null);
      }
    } catch (_) {
      setModuleInfo(null);
    }
  }, [id]);

  const fetchQuizzes = useCallback(async (pageNum) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await quizApi.ilist({ module_id: id, page: pageNum, per_page: PER_PAGE });
      if (data?.status === 'OK') {
        setQuestions(getListFromResponse(data));
        setMeta(getPaginatedMeta(data, PER_PAGE));
      } else {
        setQuestions([]);
        setError(data?.errorMessage || 'Failed to load quiz.');
      }
    } catch (err) {
      setQuestions([]);
      setError(err.response?.data?.errorMessage || err.message || 'Failed to load quiz.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchModule();
  }, [fetchModule]);

  useEffect(() => {
    fetchQuizzes(page);
  }, [page, fetchQuizzes]);

  const handleBack = () => navigate(`/modules/${moduleId}`);
  const total = meta.total;
  const lastPage = Math.max(meta.last_page, meta.per_page > 0 && total > 0 ? Math.ceil(total / meta.per_page) : 1);
  const currentPage = meta.current_page;
  const from = total > 0 ? (currentPage - 1) * meta.per_page + 1 : 0;
  const to = Math.min(currentPage * meta.per_page, total);

  const getOptions = (q) => {
    const opts = q.options ?? [];
    return Array.isArray(opts) ? opts : [];
  };

  const getOptionValue = (opt) => (typeof opt === 'object' ? opt.option : opt);
  const getOptionLabel = (opt) => (typeof opt === 'object' ? opt.value ?? opt.option : opt);

  const handleAnswerChange = (questionId, optionValue) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionValue }));
    setSubmitMessage(null);
  };

  const handleSubmitAnswers = async () => {
    const user = getUserData();
    if (!user?.id) {
      setSubmitMessage({ type: 'error', text: 'Please log in to submit answers.' });
      return;
    }
    const answers = Object.entries(selectedAnswers)
      .filter(([, answer]) => answer != null && answer !== '')
      .map(([questionId, answer]) => ({ question_id: Number(questionId), answer: String(answer) }));
    if (answers.length === 0) {
      setSubmitMessage({ type: 'error', text: 'Please select at least one answer.' });
      return;
    }
    setSubmitting(true);
    setSubmitMessage(null);
    try {
      const { data } = await quizAnswerApi.iformAction({
        form_method: 'save',
        user_id: Number(user.id),
        answers
      });
      if (data?.status === 'OK') {
        setSubmitMessage({ type: 'success', text: data?.errorMessage || 'Answers submitted successfully.' });
        fetchResults();
      } else {
        setSubmitMessage({ type: 'error', text: data?.errorMessage || 'Failed to submit answers.' });
      }
    } catch (err) {
      const msg = err.response?.data?.errorMessage ?? err.message ?? 'Failed to submit answers.';
      setSubmitMessage({ type: 'error', text: Array.isArray(msg) ? msg[0] : msg });
    } finally {
      setSubmitting(false);
    }
  };

  const fetchResults = useCallback(async () => {
    if (!id) return;
    setResultsLoading(true);
    setResultsError(null);
    setResultsData(null);
    try {
      const { data } = await quizAnswerApi.iresults({ module_id: id });
      if (data?.status === 'OK') {
        const payload = data?.returnData ?? data;
        setResultsData(payload);
        setResultsError(null);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      } else {
        setResultsData(null);
        setResultsError(data?.errorMessage || 'No results found.');
      }
    } catch (err) {
      setResultsData(null);
      setResultsError(err.response?.data?.errorMessage ?? err.message ?? 'Failed to load results.');
    } finally {
      setResultsLoading(false);
    }
  }, [id]);

  const handleViewResults = () => {
    fetchResults();
  };

  const renderResults = () => {
    if (resultsLoading) return <p className="module-detail-empty">Loading results…</p>;
    if (resultsError && !resultsData) return <p className="management-error">{resultsError}</p>;
    if (!resultsData) return null;
    const rd = resultsData;
    const list = Array.isArray(rd) ? rd : (rd.results ?? rd.answers ?? rd.list ?? rd.data ?? (rd.list_of_item?.data ?? rd.list_of_item) ?? []);
    const score = rd.score ?? rd.total_score ?? rd.marks;
    const total = rd.total ?? rd.total_questions ?? rd.total_marks;
    return (
      <div className="module-quiz-results">
        <h3 className="module-quiz-results-title">My results</h3>
        {(score != null || total != null) && (
          <p className="module-quiz-results-score">
            Score: {score != null ? score : '—'} {total != null ? ` / ${total}` : ''}
          </p>
        )}
        {Array.isArray(list) && list.length > 0 ? (
          <ul className="module-quiz-results-list">
            {list.map((item, idx) => (
              <li key={item.question_id ?? item.id ?? idx} className="module-quiz-results-item">
                <span className="module-quiz-results-q">{item.question_text ?? item.question ?? item.text ?? `Q${idx + 1}`}</span>
                <span className="module-quiz-results-answer">
                  Your answer: {item.your_answer ?? item.answer ?? item.user_answer ?? '—'}
                  {item.correct_answer != null && (
                    <> · Correct: {item.correct_answer}</>
                  )}
                  {item.is_correct != null && (
                    <span className={item.is_correct ? 'module-quiz-results-correct' : 'module-quiz-results-incorrect'}>
                      {item.is_correct ? ' ✓' : ' ✗'}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="module-detail-empty">No results to display yet. Submit your answers first.</p>
        )}
      </div>
    );
  };

  return (
    <DashboardShell activeMenuId="mymodule">
      <div className="module-page">
        <header className="module-header">
          <div className="module-header-main">
            <button type="button" className="module-back" onClick={handleBack}>
              ← Back to module
            </button>
            <div className="module-header-left">
              <div className="module-logo">HM</div>
              <div className="module-header-text">
                <h1 className="module-title">{moduleInfo?.code ? `${moduleInfo.code} - ${moduleInfo.name}` : (moduleInfo?.name ?? 'Module')}</h1>
                <p className="module-subtitle">Quiz</p>
              </div>
            </div>
          </div>
        </header>

        <section className="module-detail-section">
          <div className="module-detail-panel">
            {error && <p className="management-error">{error}</p>}
            {loading ? (
              <p className="module-detail-empty">Loading quiz…</p>
            ) : (
              <>
                <div className="module-quiz-list">
                  {questions.map((q, idx) => {
                    const qNum = (currentPage - 1) * meta.per_page + idx + 1;
                    const questionId = q.id || `q-${idx}`;
                    const selected = selectedAnswers[questionId];
                    return (
                      <div key={q.id || idx} className="module-quiz-question-card">
                        <p className="module-quiz-question-text">
                          <span className="module-quiz-qn-prefix">Qn{qNum}:</span> {q.question || q.name || 'Question'}
                        </p>
                        <div className="module-quiz-options">
                          {getOptions(q).map((opt, i) => {
                            const value = getOptionValue(opt);
                            const label = getOptionLabel(opt);
                            return (
                              <label key={i} className="module-quiz-option">
                                <input
                                  type="radio"
                                  name={questionId}
                                  value={value}
                                  checked={selected === value}
                                  onChange={() => handleAnswerChange(questionId, value)}
                                />
                                <span>{label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {questions.length === 0 && !loading && (
                  <p className="module-detail-empty">No quiz questions in this module.</p>
                )}
                {submitMessage && (
                  <p className={submitMessage.type === 'success' ? 'module-quiz-success' : 'management-error'} style={{ marginTop: '1rem' }}>
                    {submitMessage.text}
                  </p>
                )}
                {questions.length > 0 && (
                  <div className="module-quiz-submit-wrap">
                    <button type="button" className="module-quiz-submit-btn" onClick={handleSubmitAnswers} disabled={submitting}>
                      {submitting ? 'Submitting…' : 'Submit answers'}
                    </button>
                    <button type="button" className="module-quiz-results-btn" onClick={handleViewResults} disabled={resultsLoading}>
                      {resultsLoading ? 'Loading…' : 'View my results'}
                    </button>
                  </div>
                )}
                {(resultsLoading || resultsData != null || resultsError) ? (
                  <div className="module-quiz-results-wrap" ref={resultsRef}>
                    {renderResults()}
                  </div>
                ) : null}
                <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={setPage} total={total} from={from} to={to} />
              </>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
};

export default ModuleQuizListPage;
