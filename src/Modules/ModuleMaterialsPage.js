import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardShell from '../Dashboard/DashboardShell';
import Pagination from '../components/Pagination';
import { moduleApi, learningMaterialApi } from '../api/api';
import './ModuleDetail.css';

const PER_PAGE = 9;

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
  const per = Number(meta.per_page ?? meta.perPage ?? returnData.per_page ?? perPage) || perPage;
  const current = Number(meta.current_page ?? meta.currentPage ?? 1) || 1;
  const last = meta.last_page ?? meta.lastPage ?? (per > 0 ? Math.max(1, Math.ceil(total / per)) : 1);
  return { current_page: current, last_page: Math.max(1, Number(last) || 1), total, per_page: per };
}

const ModuleMaterialsPage = ({ type }) => {
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const isDocument = type === 'document';
  const [moduleInfo, setModuleInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: PER_PAGE });
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

  const fetchItems = useCallback(async (pageNum) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const params = { module_id: id, type: isDocument ? 'document' : 'media', page: pageNum, per_page: PER_PAGE };
      const { data } = await learningMaterialApi.ilist(params);
      if (data?.status === 'OK') {
        setItems(getListFromResponse(data));
        setMeta(getPaginatedMeta(data, PER_PAGE));
      } else {
        setItems([]);
        setError(data?.errorMessage || 'Failed to load.');
      }
    } catch (err) {
      setItems([]);
      setError(err.response?.data?.errorMessage || err.message || 'Failed to load.');
    } finally {
      setLoading(false);
    }
  }, [id, isDocument]);

  useEffect(() => { fetchModule(); }, [fetchModule]);
  useEffect(() => { fetchItems(page); }, [page, fetchItems]);

  const handleBack = () => navigate(`/modules/${moduleId}`);
  const title = isDocument ? 'Documents' : 'Videos';
  const total = meta.total;
  const lastPage = Math.max(meta.last_page, meta.per_page > 0 && total > 0 ? Math.ceil(total / meta.per_page) : 1);
  const currentPage = meta.current_page;
  const from = total > 0 ? (currentPage - 1) * meta.per_page + 1 : 0;
  const to = Math.min(currentPage * meta.per_page, total);

  return (
    <DashboardShell activeMenuId="mymodule">
      <div className="module-page">
        <header className="module-header">
          <div className="module-header-main">
            <button type="button" className="module-back" onClick={handleBack}>← Back to module</button>
            <div className="module-header-left">
              <div className="module-logo">HM</div>
              <div className="module-header-text">
                <h1 className="module-title">{moduleInfo?.code ? `${moduleInfo.code} - ${moduleInfo.name}` : (moduleInfo?.name ?? 'Module')}</h1>
                <p className="module-subtitle">{title}</p>
              </div>
            </div>
          </div>
        </header>
        <section className="module-detail-section">
          <div className="module-detail-panel">
            {error && <p className="management-error">{error}</p>}
            {loading ? (
              <p className="module-detail-empty">Loading…</p>
            ) : (
              <>
                <div className="module-materials-grid">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="module-material-card"
                      role={item.media ? 'button' : undefined}
                      tabIndex={item.media ? 0 : undefined}
                      onClick={() => item.media && window.open(item.media, '_blank', 'noopener,noreferrer')}
                      onKeyDown={(e) => item.media && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), window.open(item.media, '_blank', 'noopener,noreferrer'))}
                    >
                      <div className="module-material-card-image" style={{ backgroundImage: `url(${process.env.PUBLIC_URL || ''}/samp.jpeg)` }} />
                      <div className="module-material-card-body">
                        <h4 className="module-material-card-title">{item.title || 'Untitled'}</h4>
                        <p className="module-material-card-desc">{item.description || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {items.length === 0 && !loading && <p className="module-detail-empty">No {title.toLowerCase()} in this module.</p>}
                <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={setPage} total={total} from={from} to={to} />
              </>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
};

export default ModuleMaterialsPage;
