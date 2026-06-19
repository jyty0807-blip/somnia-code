import React, { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, ADMIN_EMAILS, adminLogin, adminLogout, getOrdersAll, updateOrderStatus, getStockAll, updateStock, getBundles, saveBundle, deleteBundle } from './firebase-admin.js'

const STATUSES = ['paid','ship','done','cancel']
const STATUS_LABEL = { paid:'결제완료', ship:'배송중', done:'배송완료', cancel:'취소' }
const STATUS_CLS = { paid:'b-paid', ship:'b-ship', done:'b-done', cancel:'b-cancel' }
const PRODUCT_NAMES = { jelly:'드림 젤리', oil:'아로마 오일', mask:'수면 안대', spray:'룸 스프레이', pajama:'클라우드 슬립웨어', socks:'슬립 소프트 양말' }

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try { await adminLogin(email, pw); onLogin() }
    catch (e) { console.error('Admin login error:', e.code, e.message); setErr(`로그인 실패: ${e.code || e.message}`) }
    finally { setLoading(false) }
  }
  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h1>SOMNIA Admin</h1>
        <p>관리자 전용 페이지입니다</p>
        <input className="inp" type="email" placeholder="이메일" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="inp" type="password" placeholder="비밀번호" value={pw} onChange={e=>setPw(e.target.value)} required />
        <button className="btn btn--primary" type="submit" disabled={loading}>{loading ? '로그인 중…' : '로그인'}</button>
        {err && <div className="login-err">{err}</div>}
      </form>
    </div>
  )
}

function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const load = useCallback(()=> { setLoading(true); getOrdersAll().then(setOrders).finally(()=>setLoading(false)) }, [])
  useEffect(load, [load])

  const changeStatus = async (id, status) => {
    await updateOrderStatus(id, status)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const fmtDate = (ts) => {
    if (!ts) return '-'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }

  return (
    <div className="panel">
      <div className="panel__head">
        <div><div className="panel__title">주문 관리</div><div className="panel__sub">orders_all 컬렉션</div></div>
        <button className="btn btn--ghost" onClick={load}>새로고침</button>
      </div>
      {loading ? <div className="empty">불러오는 중…</div> : orders.length === 0 ? <div className="empty">주문이 없습니다</div> : (
        <table className="tbl">
          <thead><tr>
            <th>주문번호</th><th>날짜</th><th>상품</th><th>금액</th><th>상태</th><th>변경</th>
          </tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td className="tbl__code tbl__sm">{o.orderId}</td>
                <td>{fmtDate(o.createdAt)}</td>
                <td>{(o.items||[]).map(i => `${i.name?.ko || i.name || i.id} x${i.qty}`).join(', ')}</td>
                <td className="tbl__strong">{(o.total||0).toLocaleString()}원</td>
                <td><span className={`badge ${STATUS_CLS[o.status]||''}`}>{STATUS_LABEL[o.status]||o.status}</span></td>
                <td>
                  <select className="sel" value={o.status} onChange={e => changeStatus(o.id, e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function StockTab() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState({})

  const load = useCallback(()=> { setLoading(true); getStockAll().then(list => { setItems(list); setEditing({}) }).finally(()=>setLoading(false)) }, [])
  useEffect(load, [load])

  const handleChange = (id, val) => setEditing(prev => ({ ...prev, [id]: val }))
  const handleSave = async (id) => {
    const val = editing[id]
    if (val === undefined) return
    await updateStock(id, val)
    setItems(prev => prev.map(p => p.id === id ? { ...p, stock: Number(val) } : p))
    setEditing(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  return (
    <div className="panel">
      <div className="panel__head">
        <div><div className="panel__title">재고 관리</div><div className="panel__sub">products 컬렉션 · 단품 6개</div></div>
        <button className="btn btn--ghost" onClick={load}>새로고침</button>
      </div>
      {loading ? <div className="empty">불러오는 중…</div> : (
        <table className="tbl">
          <thead><tr><th>제품 ID</th><th>제품명</th><th>현재 재고</th><th>수정</th><th></th></tr></thead>
          <tbody>
            {items.map(p => (
              <tr key={p.id}>
                <td className="tbl__code">{p.id}</td>
                <td>{PRODUCT_NAMES[p.id] || p.id}</td>
                <td style={{fontWeight:600}}>{p.stock}</td>
                <td>
                  <input className="inp inp--stock" type="number" min="0"
                    value={editing[p.id] !== undefined ? editing[p.id] : p.stock}
                    onChange={e => handleChange(p.id, e.target.value)} />
                </td>
                <td>
                  {editing[p.id] !== undefined && (
                    <button className="btn btn--primary" onClick={() => handleSave(p.id)}>저장</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function BundleModal({ bundle, onClose, onSaved }) {
  const [name, setName] = useState(bundle?.name || '')
  const [desc, setDesc] = useState(bundle?.desc || '')
  const [itemsStr, setItemsStr] = useState((bundle?.items || []).join(', '))
  const [price, setPrice] = useState(bundle?.price || 0)
  const [originalPrice, setOriginalPrice] = useState(bundle?.originalPrice || 0)
  const [stock, setStock] = useState(bundle?.stock ?? 50)
  const [active, setActive] = useState(bundle?.active !== false)
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    const data = { name, desc, items: itemsStr.split(',').map(s=>s.trim()).filter(Boolean), price: Number(price), originalPrice: Number(originalPrice), stock: Number(stock), active }
    await saveBundle(bundle?.id || null, data)
    setSaving(false); onSaved()
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={e=>e.stopPropagation()} onSubmit={submit}>
        <h2>{bundle?.id ? '번들 수정' : '번들 등록'}</h2>
        <div className="field"><label>세트명</label><input className="inp" value={name} onChange={e=>setName(e.target.value)} required /></div>
        <div className="field"><label>설명</label><input className="inp" value={desc} onChange={e=>setDesc(e.target.value)} /></div>
        <div className="field"><label>구성 제품 (콤마 구분)</label><input className="inp" value={itemsStr} onChange={e=>setItemsStr(e.target.value)} placeholder="jelly, spray, mask" /></div>
        <div style={{display:'flex',gap:12}}>
          <div className="field" style={{flex:1}}><label>판매가</label><input className="inp" type="number" value={price} onChange={e=>setPrice(e.target.value)} /></div>
          <div className="field" style={{flex:1}}><label>정가</label><input className="inp" type="number" value={originalPrice} onChange={e=>setOriginalPrice(e.target.value)} /></div>
          <div className="field" style={{flex:1}}><label>재고</label><input className="inp" type="number" value={stock} onChange={e=>setStock(e.target.value)} /></div>
        </div>
        <div className="field">
          <label style={{display:'inline',marginRight:8}}>활성</label>
          <input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)} />
        </div>
        <div className="btn-row">
          <button type="button" className="btn btn--ghost" onClick={onClose}>취소</button>
          <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? '저장 중…' : '저장'}</button>
        </div>
      </form>
    </div>
  )
}

function BundlesTab() {
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  const load = useCallback(()=> { setLoading(true); getBundles().then(setBundles).finally(()=>setLoading(false)) }, [])
  useEffect(load, [load])

  const handleDelete = async (id) => {
    await deleteBundle(id)
    setBundles(prev => prev.filter(b => b.id !== id))
  }

  return (
    <div className="panel">
      <div className="panel__head">
        <div><div className="panel__title">기획세트 관리</div><div className="panel__sub">bundles 컬렉션</div></div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn--ghost" onClick={load}>새로고침</button>
          <button className="btn btn--primary" onClick={()=>setModal({})}>+ 새 번들</button>
        </div>
      </div>
      {loading ? <div className="empty">불러오는 중…</div> : bundles.length === 0 ? <div className="empty">등록된 번들이 없습니다</div> : (
        <table className="tbl">
          <thead><tr><th>세트명</th><th>구성</th><th>판매가</th><th>재고</th><th>활성</th><th></th></tr></thead>
          <tbody>
            {bundles.map(b => (
              <tr key={b.id}>
                <td className="tbl__strong">{b.name}</td>
                <td>{(b.items||[]).join(', ')}</td>
                <td className="tbl__strong">{(b.price||0).toLocaleString()}원</td>
                <td>{b.stock ?? '-'}</td>
                <td>{b.active !== false ? '활성' : '비활성'}</td>
                <td style={{display:'flex',gap:6}}>
                  <button className="btn btn--ghost" onClick={()=>setModal(b)}>수정</button>
                  <button className="btn btn--danger" onClick={()=>handleDelete(b.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {modal && <BundleModal bundle={modal.id ? modal : null} onClose={()=>setModal(null)} onSaved={()=>{ setModal(null); load() }} />}
    </div>
  )
}

const TABS = [
  ['orders', '주문 관리'],
  ['stock', '재고 관리'],
  ['bundles', '기획세트'],
]

export function AdminApp() {
  const [user, setUser] = useState(undefined)
  const [tab, setTab] = useState('orders')

  useEffect(() => onAuthStateChanged(auth, u => {
    if (u && ADMIN_EMAILS.includes(u.email)) setUser(u)
    else setUser(u ? 'denied' : null)
  }), [])

  if (user === undefined) return null
  if (!user || user === 'denied') return <LoginScreen onLogin={() => {}} />

  return (
    <>
      <header className="admin-hdr">
        <h1>SOMNIA Admin</h1>
        <div className="admin-hdr__right">
          <span>{user.email}</span>
          <button onClick={()=> adminLogout().then(()=>setUser(null))}>로그아웃</button>
        </div>
      </header>
      <nav className="admin-tabs">
        {TABS.map(([k, lbl]) => (
          <div key={k} className={'admin-tab' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{lbl}</div>
        ))}
      </nav>
      <main className="admin-body">
        {tab === 'orders' && <OrdersTab />}
        {tab === 'stock' && <StockTab />}
        {tab === 'bundles' && <BundlesTab />}
      </main>
    </>
  )
}
