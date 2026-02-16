import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardShell from '../Dashboard/DashboardShell';
import { moduleApi, learningMaterialApi, quizApi } from '../api/api';
import './ModuleDetail.css';

const ModuleDetailByApi = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const [moduleInfo, setModuleInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({ documents: 0, videos: 0, quizzes: 0 });

  useEffect(() => {
    let cancelled = false;
    const id = Number(moduleId);
    if (!id) {
      setError('Invalid module.');
      setLoading(false);
      return;
    }

    function getListFromResponse(data) {
      const returnData = data?.returnData;
      if (!returnData) return [];
      const listOfItem = returnData.list_of_item ?? returnData;
      if (Array.isArray(listOfItem)) return listOfItem;
      return listOfItem?.data ?? returnData.data ?? [];
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get module name from GET /module/ilist (same as Module list page)
        let mod = null;
        let page = 1;
        const perPage = 5;
        while (true) {
          const { data } = await moduleApi.ilist({ paginate: true, per_page: perPage, page });
          if (cancelled || data?.status !== 'OK') break;
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
          if (data?.status === 'OK' && !cancelled) {
            const m = data?.returnData?.module ?? data?.returnData ?? data?.module;
            if (m) mod = m;
          }
        }
        if (mod) {
          setModuleInfo({
            id: mod.id,
            name: mod.name ?? mod.module_name ?? mod.title ?? 'Module',
            code: mod.code ?? '',
          });
        }

        const [docRes, videoRes, quizRes] = await Promise.all([
          learningMaterialApi.ilist({ module_id: id, type: 'document', per_page: 1, page: 1 }),
          learningMaterialApi.ilist({ module_id: id, type: 'media', per_page: 1, page: 1 }),
          quizApi.ilist({ module_id: id, per_page: 1, page: 1 })
        ]);

        if (cancelled) return;
        const getTotal = (res) => {
          const rd = res?.data?.returnData || {};
          const list = rd.list_of_item ?? rd;
          const meta = list?.meta ?? rd.meta ?? rd;
          return Number(meta?.total ?? rd?.total ?? list?.total ?? 0) || 0;
        };
        setCounts({
          documents: getTotal(docRes),
          videos: getTotal(videoRes),
          quizzes: getTotal(quizRes)
        });
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.errorMessage || err.message || 'Failed to load module.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [moduleId]);

  const handleBack = () => navigate('/dashboard?menu=mymodule');

  if (loading) {
    return (
      <DashboardShell activeMenuId="mymodule">
        <div className="module-page">
          <button type="button" className="module-back" onClick={handleBack}>← Back to My Modules</button>
          <p className="module-detail-empty">Loading module…</p>
        </div>
      </DashboardShell>
    );
  }

  if (error || !moduleInfo) {
    return (
      <DashboardShell activeMenuId="mymodule">
        <div className="module-page">
          <button type="button" className="module-back" onClick={handleBack}>← Back to My Modules</button>
          <p className="module-detail-empty">{error || 'Module not found.'}</p>
        </div>
      </DashboardShell>
    );
  }

  const progress = 0; // Could come from API later
  const chapterCount = 3;
  const cards = [
    { number: 1, id: 'documents', type: 'Document', title: 'Documents', count: counts.documents, path: `/modules/${moduleId}/documents` },
    { number: 2, id: 'videos', type: 'Video', title: 'Videos', count: counts.videos, path: `/modules/${moduleId}/videos` },
    { number: 3, id: 'quiz', type: 'Quiz', title: 'Quiz', count: counts.quizzes, path: `/modules/${moduleId}/quiz` }
  ];

  return (
    <DashboardShell activeMenuId="mymodule">
      <div className="module-page">
        <header className="module-header">
          <div className="module-header-main">
            <button type="button" className="module-back" onClick={handleBack}>
              ← Back to My Modules
            </button>
            <div className="module-header-left">
              <div className="module-logo">HM</div>
              <div className="module-header-text">
                <h1 className="module-title">{moduleInfo.name ? (moduleInfo.code ? `${moduleInfo.code} - ${moduleInfo.name}` : moduleInfo.name) : 'Module'}</h1>
                {/* {moduleInfo.description && <p className="module-subtitle">{moduleInfo.description}</p>} */}
                <div className="module-meta">
                  <span>{chapterCount} chapters</span>
                  <span>{counts.videos} videos</span>
                  <span>{counts.quizzes} questions</span>
                </div>
              </div>
            </div>
          </div>
          <div className="module-header-right">
            <div className={`module-progress-circle ${progress === 0 ? 'zero' : ''}`}>
              <span>{progress}%</span>
            </div>
            <p className="module-progress-text">
              Progress - {progress}% Complete
            </p>
          </div>
        </header>

        <section className="module-chapters-section">
          <div className="module-chapters-header">
            <h2>
              Chapters <span className="module-chapters-count">({chapterCount} Chapters)</span>
            </h2>
          </div>
          <div className="module-chapters-grid module-three-cards">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`module-chapter-card ${card.type === 'Quiz' ? 'module-chapter-card-quiz' : ''}`}
                onClick={() => navigate(card.path)}
              >
                <div className="module-chapter-image" style={{ backgroundImage: `url(${process.env.PUBLIC_URL || ''}/samp.jpeg)` }} />
                <div className="module-chapter-body">
                  <div className="module-chapter-label">
                    Chapter {card.number} · {card.type}
                  </div>
                  <div className="module-chapter-title">{card.title}</div>
                  {card.type === 'Quiz' ? (
                    <div className="module-quiz-status-row">
                      <span className="module-quiz-status-label">Status</span>
                      <span className="module-quiz-status start">Start</span>
                    </div>
                  ) : (
                    <div className="module-chapter-progress">
                      <div className="module-chapter-progress-bar">
                        <div className="module-chapter-progress-fill" style={{ width: '0%' }} />
                      </div>
                      <span className="module-chapter-progress-text">0% Complete</span>
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

export default ModuleDetailByApi;
