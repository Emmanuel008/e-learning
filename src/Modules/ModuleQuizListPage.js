import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardShell from '../Dashboard/DashboardShell';
import Pagination from '../components/Pagination';
import { moduleApi, quizApi } from '../api/api';
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
