import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Parfum } from '../types';
import { formatPrice } from '../lib/utils';
import './EditorDashboard.css';

type SortCol = 'created_at' | 'nume_parfum' | 'brand' | 'pret' | 'stoc';
type SortDir = 'asc' | 'desc';

export default function EditorDashboard() {
  const { isEditor } = useAuth();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState<'parfumuri' | 'comenzi'>('parfumuri');

  // Parfumuri state
  const [parfumuri, setParfumuri]   = useState<Parfum[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterTip, setFilterTip]   = useState('');
  const [sortCol, setSortCol]       = useState<SortCol>('created_at');
  const [sortDir, setSortDir]       = useState<SortDir>('desc');
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editStocId, setEditStocId] = useState<string | null>(null);
  const [editStocVal, setEditStocVal] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Comenzi state
  const [orders, setOrders]           = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState('');
  const [updatingId, setUpdatingId]   = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditor) navigate('/');
  }, [isEditor, navigate]);

  const fetchParfumuri = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('parfumuri')
      .select('*')
      .order(sortCol, { ascending: sortDir === 'asc' });
    if (search.trim()) {
      query = query.or(
        `nume_parfum.ilike.%${search.trim()}%,brand.ilike.%${search.trim()}%,creator.ilike.%${search.trim()}%`
      );
    }
    if (filterTip) query = query.eq('tip_parfum', filterTip);
    const { data } = await query;
    setParfumuri((data as Parfum[]) ?? []);
    setLoading(false);
  }, [search, filterTip, sortCol, sortDir]);

  useEffect(() => { fetchParfumuri(); }, [fetchParfumuri]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    let query = supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });
    if (orderFilter) query = query.eq('status', orderFilter);
    const { data, error } = await query;
    if (error) {
      console.error('fetchOrders error:', error.message);
      setOrdersError(error.message);
    }
    setOrders(data ?? []);
    setOrdersLoading(false);
  }, [orderFilter]);

  useEffect(() => {
    if (activeTab === 'comenzi') fetchOrders();
  }, [activeTab, fetchOrders]);

  function handleSort(col: SortCol) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    const parfum = parfumuri.find(p => p.id === deleteId);
    if (parfum?.image_url) {
      const path = parfum.image_url.split('/parfumuri-images/')[1];
      if (path) await supabase.storage.from('parfumuri-images').remove([path]);
    }
    await supabase.from('parfumuri').delete().eq('id', deleteId);
    setDeleteId(null);
    setDeleteLoading(false);
    setSuccessMsg('Parfumul a fost șters.');
    setTimeout(() => setSuccessMsg(null), 3000);
    fetchParfumuri();
  }

  async function handleSaveStoc(id: string) {
    const val = Number(editStocVal);
    if (isNaN(val) || val < 0) return;
    await supabase.from('parfumuri').update({ stoc: val }).eq('id', id);
    setEditStocId(null);
    setSuccessMsg('Stoc actualizat.');
    setTimeout(() => setSuccessMsg(null), 2500);
    fetchParfumuri();
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    setUpdatingId(null);
    setSuccessMsg('Status actualizat!');
    setTimeout(() => setSuccessMsg(null), 2500);
    fetchOrders();
  }

  const totalParfumuri = parfumuri.length;
  const inStoc   = parfumuri.filter(p => p.stoc > 0).length;
  const epuizate = parfumuri.filter(p => p.stoc === 0).length;
  const pretMediu = parfumuri.length
    ? parfumuri.reduce((s, p) => s + p.pret, 0) / parfumuri.length
    : 0;

  const deleteParfum = parfumuri.find(p => p.id === deleteId);

  return (
    <div className="ed-page">
      {/* Header */}
      <div className="ed-header">
        <div>
          <h1 className="ed-title">Dashboard Editor</h1>
          <p className="ed-subtitle">Gestionează catalogul și comenzile</p>
        </div>
        <Link to="/editor/add" className="btn-secondary">
          + Adaugă parfum nou
        </Link>
      </div>

      {successMsg && <div className="ed-success">{successMsg}</div>}

      {/* Stats */}
      <div className="ed-stats">
        <div className="ed-stat-card">
          <div className="ed-stat-value">{totalParfumuri}</div>
          <div className="ed-stat-label">Total parfumuri</div>
        </div>
        <div className="ed-stat-card">
          <div className="ed-stat-value ed-stat-value--green">{inStoc}</div>
          <div className="ed-stat-label">În stoc</div>
        </div>
        <div className="ed-stat-card">
          <div className="ed-stat-value ed-stat-value--red">{epuizate}</div>
          <div className="ed-stat-label">Stoc epuizat</div>
        </div>
        <div className="ed-stat-card">
          <div className="ed-stat-value ed-stat-value--gold">{formatPrice(pretMediu)}</div>
          <div className="ed-stat-label">Preț mediu</div>
        </div>
      </div>

      {/* Tab-uri */}
      <div className="ed-tabs">
        <button
          className={`ed-tab ${activeTab === 'parfumuri' ? 'ed-tab--active' : ''}`}
          onClick={() => setActiveTab('parfumuri')}
        >
          🧴 Parfumuri ({totalParfumuri})
        </button>
        <button
          className={`ed-tab ${activeTab === 'comenzi' ? 'ed-tab--active' : ''}`}
          onClick={() => setActiveTab('comenzi')}
        >
          📦 Comenzi {orders.length > 0 && `(${orders.length})`}
        </button>
      </div>

      {/* ── TAB PARFUMURI ── */}
      {activeTab === 'parfumuri' && (
        <>
          <div className="ed-filters">
            <input
              type="text"
              className="ed-search"
              placeholder="Caută după nume, brand, creator..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="ed-filter-select"
              value={filterTip}
              onChange={e => setFilterTip(e.target.value)}
            >
              <option value="">Toate tipurile</option>
              <option value="Parfum">Parfum</option>
              <option value="Eau de Parfum">Eau de Parfum</option>
              <option value="Eau de Toilette">Eau de Toilette</option>
              <option value="Eau de Cologne">Eau de Cologne</option>
            </select>
            {(search || filterTip) && (
              <button className="btn-primary ed-clear" onClick={() => { setSearch(''); setFilterTip(''); }}>
                Resetează ×
              </button>
            )}
          </div>

          <div className="ed-table-wrap">
            {loading ? (
              <div className="ed-loading"><div className="aep-spinner"></div></div>
            ) : parfumuri.length === 0 ? (
              <div className="ed-empty">
                <p>Niciun parfum găsit.</p>
                <Link to="/editor/add" className="btn-secondary">Adaugă primul parfum</Link>
              </div>
            ) : (
              <table className="ed-table">
                <thead>
                  <tr>
                    <th className="ed-th">Imagine</th>
                    <th className="ed-th ed-th--sort" onClick={() => handleSort('nume_parfum')}>
                      Nume {sortCol === 'nume_parfum' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="ed-th ed-th--sort" onClick={() => handleSort('brand')}>
                      Brand {sortCol === 'brand' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="ed-th">Tip</th>
                    <th className="ed-th ed-th--sort" onClick={() => handleSort('pret')}>
                      Preț {sortCol === 'pret' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="ed-th ed-th--sort" onClick={() => handleSort('stoc')}>
                      Stoc {sortCol === 'stoc' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="ed-th">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {parfumuri.map(p => (
                    <tr key={p.id} className="ed-tr">
                      <td className="ed-td">
                        {p.image_url
                          ? <img src={p.image_url} alt={p.nume_parfum} className="ed-thumb" />
                          : <div className="ed-thumb-placeholder">{p.brand.charAt(0)}</div>
                        }
                      </td>
                      <td className="ed-td"><div className="ed-name">{p.nume_parfum}</div></td>
                      <td className="ed-td"><p className="ed-brand">{p.brand}</p></td>
                      <td className="ed-td">
                        {p.tip_parfum && <span className="ed-tip-badge">{p.tip_parfum}</span>}
                      </td>
                      <td className="ed-td"><span className="ed-price">{formatPrice(p.pret)}</span></td>
                      <td className="ed-td">
                        {editStocId === p.id ? (
                          <div className="ed-stoc-edit">
                            <input
                              type="number"
                              className="ed-stoc-input"
                              value={editStocVal}
                              onChange={e => setEditStocVal(e.target.value)}
                              autoFocus min="0"
                            />
                            <button className="btn-primary ed-stoc-save" onClick={() => handleSaveStoc(p.id)}>✓</button>
                            <button className="btn-primary ed-stoc-cancel" onClick={() => setEditStocId(null)}>×</button>
                          </div>
                        ) : (
                          <span
                            className={`ed-stoc ed-stoc--${p.stoc > 10 ? 'ok' : p.stoc > 0 ? 'low' : 'zero'}`}
                            onClick={() => { setEditStocId(p.id); setEditStocVal(p.stoc.toString()); }}
                            title="Click pentru a edita stocul"
                          >
                            {p.stoc} buc.
                          </span>
                        )}
                      </td>
                      <td className="ed-td">
                        <div className="ed-actions">
                          <Link to={`/editor/edit/${p.id}`} className="btn-primary ed-btn-sm">Editează</Link>
                          <button className="btn-danger ed-btn-sm" onClick={() => setDeleteId(p.id)}>Șterge</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── TAB COMENZI ── */}
      {activeTab === 'comenzi' && (
        <div className="ed-orders-section">
          <div className="ed-orders-filters">
            {['', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
              <button
                key={s}
                className={`ed-status-chip ${orderFilter === s ? 'ed-status-chip--active' : ''}`}
                onClick={() => setOrderFilter(s)}
              >
                {s === '' ? 'Toate' : s}
              </button>
            ))}
          </div>

          {ordersLoading ? (
            <div className="ed-loading"><div className="aep-spinner" /></div>
          ) : ordersError ? (
            <div className="ed-orders-error">
              <p>⚠️ Eroare la încărcarea comenzilor:</p>
              <code>{ordersError}</code>
              <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-lo)' }}>
                Rulează <strong>supabase/fix_rls_editor_orders.sql</strong> în Supabase SQL Editor.
              </p>
              <button className="btn-primary" style={{ marginTop: 12 }} onClick={fetchOrders}>
                Încearcă din nou
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="ed-empty"><p>Nicio comandă găsită.</p></div>
          ) : (
            <div className="ed-orders-list">
              {orders.map(order => (
                <div key={order.id} className="ed-order-card">
                  <div className="ed-order-header">
                    <div className="ed-order-meta">
                      <span className="ed-order-id">#{order.id.slice(0,8).toUpperCase()}</span>
                      <span className="ed-order-date">
                        {new Date(order.created_at).toLocaleDateString('ro-RO', { day:'numeric', month:'long', year:'numeric' })}
                      </span>
                      <span className="ed-order-client">
                        👤 {order.shipping_name}
                      </span>
                    </div>
                    <div className="ed-order-right">
                      <span className="ed-order-total">{Number(order.total).toFixed(2)} RON</span>
                      <select
                        className="ed-status-select"
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="PENDING">⏳ PENDING</option>
                        <option value="PAID">✅ PAID</option>
                        <option value="SHIPPED">🚚 SHIPPED</option>
                        <option value="DELIVERED">📬 DELIVERED</option>
                        <option value="CANCELLED">❌ CANCELLED</option>
                      </select>
                    </div>
                  </div>

                  <div className="ed-order-shipping">
                    📍 {order.shipping_name} · {order.shipping_address}, {order.shipping_city} · 📞 {order.shipping_phone}
                  </div>

                  {order.items?.length > 0 && (
                    <div className="ed-order-items">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="ed-order-item">
                          <span className="ed-oi-name">{item.parfum_name}</span>
                          <span className="ed-oi-qty">× {item.quantity}</span>
                          <span className="ed-oi-price">{Number(item.unit_price * item.quantity).toFixed(2)} RON</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="ed-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="ed-modal" onClick={e => e.stopPropagation()}>
            <h3 className="ed-modal-title">Confirmi ștergerea?</h3>
            <p className="ed-modal-text">
              Parfumul „<strong>{deleteParfum?.nume_parfum}</strong>" va fi șters permanent
              împreună cu imaginea. Această acțiune nu poate fi anulată.
            </p>
            <div className="ed-modal-actions">
              <button className="btn-primary" onClick={() => setDeleteId(null)}>Anulează</button>
              <button className="btn-danger" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? 'Se șterge...' : 'Da, șterge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
