import React, { useState, useEffect } from 'react'
import { Ico } from './icons.jsx'
import { SOMNIA_I18N, SOMNIA_PRICE, SOMNIA_DATA, formatDate } from './i18n.js'
import { SOMNIA_PRODUCTS, SOMNIA_NOTICE } from './products.js'
import { WheelCol } from './screens-sleep.jsx'
import { auth, getAddresses, addAddress, updateAddress, deleteAddress, getDefaultAddress, createOrder, getOrders, getBundles } from './firebase.js'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import logoFullWhite from '../logo-full-white.png'
import jellyDetail1 from './detail/jelly-detail-1.png'
import jellyDetail2 from './detail/jelly-detail-2.gif'
import jellyDetail3 from './detail/jelly-detail-3.gif'
import jellyDetail4 from './detail/jelly-detail-4.png'
import maskDetail1 from './detail/mask-detail-1.gif'
import maskDetail2 from './detail/mask-detail-2.png'

const P2 = SOMNIA_PRICE;

const APP_DETAILCUTS = {
  jelly:[
    {src:jellyDetail1,w:1800,h:4452,alt:'SOMNIA Dream Jelly — 3 Night Moods'},
    {src:jellyDetail2,w:460,h:501,alt:'잠들기 전 30분, 하루를 차분하게 마무리하는 젤리'},
    {src:jellyDetail3,w:718,h:404,alt:'밤의 루틴을 즐기는 순간'},
    {src:jellyDetail4,w:1800,h:6531,alt:'POINT · HOW TO USE · 수면 만족도'},
  ],
  mask:[
    {src:maskDetail1,w:1280,h:720,alt:'잠들기 전, 빛을 차단하는 순간'},
    {src:maskDetail2,w:3130,h:8511,alt:'SOMNIA 프리미엄 수면안대 — 구조 · 디테일 · CARE GUIDE'},
  ],
};

/* ============== SHOP HOME ============== */
export function TabShop({ t, lang, go, cartCount, tabbar, stockMap, bundles }) {
  const D = SOMNIA_DATA;
  const [cat, setCat] = useState('all');
  const cats = [['all',t('cat_all')],['beauty',t('cat_beauty')],['aroma',t('cat_aroma')],['gear',t('cat_gear')]];
  const items = cat==='all' ? D.products : D.products.filter(p=>p.cat===cat);
  return (
    <div className="scr light anim-fade">
      <div className="hdr">
        <div><div className="hdr__ey" style={{color:'var(--lav)'}}>{t('members_only')}</div><h1>{t('shop_title')}</h1></div>
        <button className="icon-btn" style={{position:'relative'}} onClick={()=>go('cart')}>
          {Ico.bag({s:20})}
          {cartCount>0 && <span style={{position:'absolute',top:-3,right:-3,minWidth:18,height:18,borderRadius:99,background:'#e8638b',color:'#fff',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>{cartCount}</span>}
        </button>
      </div>
      <div className="body">
        <div className="member-card">
          <div className="mc-row">
            <div><div className="mc-tier">{t('mc_tier')}</div><div className="mc-name">{t('mc_name')}</div></div>
            <div className="mc-badge">{t('mc_member')}</div>
          </div>
          <div className="mc-stats">
            <div className="s"><b>2,480</b><span>{t('mc_point')}</span></div>
            <div className="s"><b>3</b><span>{t('mc_coupon')}</span></div>
            <div className="s"><b>15%</b><span>{t('mc_grade')}</span></div>
          </div>
        </div>

        <div className="chips" style={{marginTop:18}}>
          {cats.map(([k,lbl])=>(<div key={k} className={'chip'+(cat===k?' on':'')} onClick={()=>setCat(k)}>{lbl}</div>))}
        </div>

        <div className="pgrid" style={{marginTop:16}}>
          {items.map(p=>{ const oos = stockMap && stockMap[p.id] === 0; return (
            <div className={'prod'+(oos?' prod--oos':'')} key={p.id} onClick={()=>go('product',p.id)}>
              <div className="prod__img">
                {oos && <div className="prod__oos-badge">{t('sold_out')}</div>}
                {!oos && p.tag[lang] && <div className="prod__tag">{p.tag[lang]}</div>}
                <image-slot id={p.slot} placeholder={p.id}></image-slot>
              </div>
              <div className="prod__b">
                <div className="prod__cat">{t('cat_'+(p.cat==='beauty'?'beauty':p.cat==='aroma'?'aroma':'gear'))}</div>
                <div className="prod__n">{p.name[lang]}</div>
                <div className="prod__price">
                  <b>{P2(p.member)}</b>
                  {p.old>0 && <s>{P2(p.old)}</s>}
                </div>
              </div>
            </div>
          )})}
        </div>

        {bundles && bundles.length > 0 && (<>
          <div style={{fontSize:18,fontWeight:700,marginTop:28,marginBottom:12}}>{t('bundle_section')}</div>
          <div className="bundle-list">
            {bundles.map(b => {
              const itemIds = (b.items || []).map(x => typeof x === 'string' ? x : x.id);
              const oos = itemIds.some(id => stockMap && stockMap[id] === 0);
              return (
                <div className={'bundle'+(oos?' prod--oos':'')} key={b.id} onClick={()=>go('bundleDetail',b.id)}>
                  <div className="bundle__ic">{Ico.box({s:18})}</div>
                  <div className="bundle__b">
                    <b>{b.name}</b>
                    <p>{b.desc}</p>
                  </div>
                  {oos ? <span className="bundle__oos">{t('sold_out')}</span> : <span className="bundle__arw">{Ico.next({s:16})}</span>}
                </div>
              );
            })}
          </div>
        </>)}
      </div>
      {tabbar}
    </div>
  );
}

/* ============== BUNDLE DETAIL ============== */
export function ScreenBundleDetail({ t, lang, back, bundle, stockMap, addBundleToCart }) {
  if (!bundle) return null;
  const D = SOMNIA_DATA;
  const itemIds = (bundle.items || []).map(x => typeof x === 'string' ? x : x.id);
  const itemProducts = itemIds.map(id => D.products.find(p => p.id === id)).filter(Boolean);
  const origTotal = itemProducts.reduce((a, p) => a + p.member, 0);
  const bundlePrice = bundle.price || origTotal;
  const saving = origTotal - bundlePrice;
  const oos = itemIds.some(id => stockMap && stockMap[id] === 0);
  return (
    <div className="scr light anim-push">
      <div style={{position:'absolute',top:56,left:22,zIndex:10}}>
        <button className="icon-btn" style={{background:'rgba(255,255,255,.7)',backdropFilter:'blur(8px)'}} onClick={back}>{Ico.back({s:20})}</button>
      </div>
      <div className="body" style={{paddingTop:80}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{width:64,height:64,borderRadius:18,margin:'0 auto 14px',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#C2B0F5,#5b9fd6)',color:'#fff'}}>{Ico.box({s:28})}</div>
          <div style={{fontSize:20,fontWeight:700}}>{bundle.name}</div>
          <div style={{fontSize:14,color:'var(--dim)',marginTop:6,lineHeight:1.5}}>{bundle.desc}</div>
        </div>

        <div className="pd-sec">
          <div className="pd-sec-t">{t('bundle_items')}</div>
          {itemProducts.map(p => {
            const itemOos = stockMap && stockMap[p.id] === 0;
            return (
              <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',minHeight:56,borderBottom:'1px solid var(--border)'}}>
                <div style={{width:48,height:48,borderRadius:10,overflow:'hidden',flexShrink:0,background:'var(--surface2)'}}>
                  <image-slot id={p.slot} placeholder={p.id}></image-slot>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600}}>{p.name[lang]}</div>
                  <div style={{fontSize:12.5,color:'var(--dim)'}}>{P2(p.member)}</div>
                </div>
                {itemOos && <span style={{fontSize:10,fontWeight:700,color:'#e8638b'}}>{t('sold_out')}</span>}
              </div>
            );
          })}
        </div>

        <div className="summary" style={{marginTop:18}}>
          <div className="ln"><span>{t('bundle_orig')}</span><span>{P2(origTotal)}</span></div>
          {saving > 0 && <div className="ln lav"><span>{t('bundle_save')}</span><span>−{P2(saving)}</span></div>}
          <div className="ln total"><span>{t('total')}</span><span>{P2(bundlePrice)}</span></div>
        </div>
      </div>
      <div className="stickybar">
        {oos ? (
          <button className="btn btn--disabled" style={{flex:1}} disabled>{t('sold_out')}</button>
        ) : (
          <button className="btn btn--primary" style={{flex:1}} onClick={()=>addBundleToCart(bundle)}>{t('add_cart')} · {P2(bundlePrice)}</button>
        )}
      </div>
    </div>
  );
}

/* ============== PRODUCT DETAIL ============== */
export function ScreenProduct({ t, lang, back, pid, addToCart, stockMap }) {
  const D = SOMNIA_DATA;
  const p = D.products.find(x=>x.id===pid) || D.products[0];
  const detail = (SOMNIA_PRODUCTS||{})[p.id];
  const catKey = p.cat==='beauty'?'beauty':p.cat==='aroma'?'aroma':'gear';
  const [opt, setOpt] = useState(0);
  const sel = detail && detail.options ? detail.options[opt] : null;
  return (
    <div className="scr light anim-push">
      <div style={{position:'absolute',top:56,left:22,zIndex:10}}>
        <button className="icon-btn" style={{background:'rgba(255,255,255,.7)',backdropFilter:'blur(8px)'}} onClick={back}>{Ico.back({s:20})}</button>
      </div>
      <div className="body nopad-b" style={{padding:0,overflowY:'auto'}}>
        <div className="pd-img"><image-slot id={p.slot} placeholder={p.id}></image-slot></div>
        <div className="pd-body">
          {/* 1 name · 2 one-liner */}
          <div className="pd-cat">{t('cat_'+catKey)}</div>
          <div className="pd-name">{p.name[lang]}</div>
          {detail && <div className="pd-line">{detail.oneLiner[lang]}</div>}
          <div className="pd-price"><b>{P2(p.member)}</b>{p.old>0 && <s>{P2(p.old)}</s>}</div>
          <div className="pd-member">{Ico.spark({s:14})} {t('member_price')}</div>

          {/* 3 flavor / scent options */}
          {detail && detail.options && (
            <div className="pd-sec">
              <div className="pd-sec-t">{detail.optionLabel[lang]}</div>
              <div className="optgrid">
                {detail.options.map((o,i)=>(
                  <button key={o.id} className={'optcard'+(i===opt?' on':'')} onClick={()=>setOpt(i)}>
                    <span className="optdot" style={{background:o.color}}></span>
                    <span className="optmeta">
                      <b>{o.name[lang]}</b>
                      <small>{o.mood[lang]}</small>
                    </span>
                    {i===opt && <span className="optcheck">{Ico.check({s:14})}</span>}
                  </button>
                ))}
              </div>
              {sel && <div className="optcaption">{sel.caption[lang]}</div>}
            </div>
          )}

          {/* 4 recommended time */}
          {detail && (
            <div className="pd-pill-row">
              <span className="pd-pill">{Ico.moon({s:14})} {t('pd_use_time')} · <b>{detail.useTime[lang]}</b></span>
            </div>
          )}

          {/* long desc */}
          {detail && <div className="pd-desc">{detail.desc[lang]}</div>}
          {!detail && <div className="pd-desc">{p.desc[lang]}</div>}

          {/* 5 features */}
          {detail && (
            <div className="pd-sec">
              <div className="pd-sec-t">{t('pd_features')}</div>
              <ul className="pd-feat">
                {detail.features[lang].map((f,i)=>(<li key={i}><span className="pd-tick">{Ico.check({s:13})}</span>{f}</li>))}
              </ul>
            </div>
          )}

          {/* 6 contents/volume */}
          {detail && (
            <div className="pd-rows">
              <div className="pd-rowi"><span>{t('pd_spec')}</span><b style={{fontWeight:600}}>{detail.spec[lang]}</b></div>
              <div className="pd-rowi"><span>{t('pd_ship')}</span><b style={{fontWeight:600}}>{t('pd_ship_v')}</b></div>
              <div className="pd-rowi"><span>{t('pd_review')}</span><b style={{fontWeight:600}}>★ {t('pd_review_v')}</b></div>
            </div>
          )}

          {/* 7 how to use */}
          {detail && (
            <div className="pd-sec">
              <div className="pd-sec-t">{t('pd_howto')}</div>
              <ol className="pd-steps">
                {detail.howto[lang].map((s,i)=>(<li key={i}><span className="pd-step-n">{i+1}</span><span>{s}</span></li>))}
              </ol>
            </div>
          )}

          {/* 8 cautions (spray) */}
          {detail && detail.cautions && (
            <div className="pd-sec">
              <div className="pd-sec-t">{t('pd_caution')}</div>
              <ul className="pd-cau">
                {detail.cautions[lang].map((c,i)=>(<li key={i}>{c}</li>))}
              </ul>
            </div>
          )}

          {/* 9 routine bundles */}
          {detail && detail.bundles && (
            <div className="pd-sec">
              <div className="pd-sec-t">{t('pd_bundle')}</div>
              <div className="bundle-list">
                {detail.bundles.map((b,i)=>(
                  <div className="bundle" key={i}>
                    <div className="bundle__ic">{Ico.box({s:18})}</div>
                    <div className="bundle__b"><b>{b.name[lang]}</b><p>{b.desc[lang]}</p></div>
                    <span className="bundle__arw">{Ico.next({s:16})}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* app link */}
          {detail && (
            <div className="pd-applink">
              <div className="pd-applink__ic">{Ico.moon({s:16})}</div>
              <p>{t('pd_app_link')}</p>
            </div>
          )}

          {/* legal-safe notice */}
          {detail && SOMNIA_NOTICE && (
            <div className="pd-notice">
              <div className="pd-sec-t">{t('pd_notice')}</div>
              <ul>{SOMNIA_NOTICE[lang].map((n,i)=>(<li key={i}>{n}</li>))}</ul>
            </div>
          )}
        </div>

        {/* full-bleed marketing detail cut (per product) */}
        {APP_DETAILCUTS[p.id] && (
          <div className="pd-detailcut">
            <div className="pd-detailcut__label">{lang==='ko'?'상세 정보':'Details'}</div>
            {APP_DETAILCUTS[p.id].map((im,i)=>(
              <img key={i} src={im.src} width={im.w} height={im.h} alt={im.alt} loading="lazy"/>
            ))}
          </div>
        )}
      </div>
      <div className="stickybar">
        {stockMap && stockMap[p.id] === 0 ? (
          <button className="btn btn--disabled" style={{flex:1}} disabled>{t('sold_out')}</button>
        ) : (<>
          <div className="price"><span>{sel ? sel.name[lang] : t('member_price')}</span><b>{P2(p.member)}</b></div>
          <button className="btn btn--ghost" style={{flex:'none',width:'auto',padding:'14px 18px'}} onClick={()=>addToCart(p.id)} aria-label={t('add_cart')}>{Ico.bag({s:18})}</button>
          <button className="btn btn--primary" style={{flex:1}} onClick={()=>addToCart(p.id)}>{t('pd_buy_now')}</button>
        </>)}
      </div>
    </div>
  );
}

/* ============== CART ============== */
export function ScreenCart({ t, lang, back, cart, setQty, uid, go, showToast, stockMap, bundles }) {
  const D = SOMNIA_DATA;
  const [noAddr, setNoAddr] = useState(false);
  const productLines = cart.filter(c=>!c.bundleId).map(c=>({ ...c, p:D.products.find(x=>x.id===c.id) })).filter(c=>c.p);
  const bundleLines = cart.filter(c=>c.bundleId).map(c=>{
    const b = (bundles||[]).find(x=>x.id===c.bundleId);
    return b ? { ...c, bundle:b } : null;
  }).filter(Boolean);
  const lines = [...productLines, ...bundleLines];
  const subtotal = productLines.reduce((a,c)=>a+c.p.price*c.q,0) + bundleLines.reduce((a,c)=>{
    const orig = (c.bundle.items||[]).map(id=>{ const p=D.products.find(x=>x.id===(typeof id==='string'?id:id.id)); return p?p.price:0; }).reduce((s,v)=>s+v,0);
    return a + orig * c.q;
  },0);
  const memberTotal = productLines.reduce((a,c)=>a+c.p.member*c.q,0) + bundleLines.reduce((a,c)=>a+(c.bundle.price||0)*c.q,0);
  const disc = subtotal - memberTotal;
  const hasOOS = productLines.some(c=> stockMap && stockMap[c.id] === 0) ||
    bundleLines.some(c=> (c.bundle.items||[]).some(id=> stockMap && stockMap[typeof id==='string'?id:id.id] === 0));
  const goCheckout = async () => {
    if (!uid) return;
    const addr = await getDefaultAddress(uid);
    if (!addr) { setNoAddr(true); return; }
    go('checkout', { productLines, bundleLines, subtotal, memberTotal, disc, addr });
  };
  return (
    <div className="scr light anim-push">
      <div className="hdr">
        <button className="icon-btn" onClick={back}>{Ico.back({s:20})}</button>
        <div style={{flex:1,marginLeft:6}}><h1 style={{fontSize:24}}>{t('cart_title')}</h1></div>
      </div>
      {lines.length===0 ? (
        <div className="body" style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
          <div className="empty-state">
            <div style={{opacity:.4}}>{Ico.bag({s:48,w:1.3})}</div>
            <div style={{fontSize:15}}>{t('cart_empty')}</div>
            <button className="btn btn--primary btn--pill" style={{width:'auto'}} onClick={back}>{t('go_shop')}</button>
          </div>
        </div>
      ) : (
        <>
          <div className="body">
            {productLines.map(c=>(
              <div className="crow" key={c.id}>
                <div className="crow__img"><image-slot id={c.p.slot} placeholder={c.id}></image-slot></div>
                <div className="crow__b">
                  <div className="crow__cat">{t('cat_'+(c.p.cat==='beauty'?'beauty':c.p.cat==='aroma'?'aroma':'gear'))}</div>
                  <div className="crow__n">{c.p.name[lang]}</div>
                  <div className="qty">
                    <button onClick={()=>setQty(c.id,-1)}>−</button>
                    <span>{c.q}</span>
                    <button onClick={()=>setQty(c.id,1)}>+</button>
                  </div>
                </div>
                <div className="crow__price">{P2(c.p.member*c.q)}</div>
              </div>
            ))}
            {bundleLines.map(c=>(
              <div className="crow" key={'b_'+c.bundleId}>
                <div className="crow__img" style={{display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#C2B0F5,#5b9fd6)',borderRadius:10,color:'#fff'}}>{Ico.box({s:22})}</div>
                <div className="crow__b">
                  <div className="crow__cat">{t('bundle_section')}</div>
                  <div className="crow__n">{c.bundle.name}</div>
                  <div className="qty">
                    <button onClick={()=>setQty(c.bundleId,-1,true)}>−</button>
                    <span>{c.q}</span>
                    <button onClick={()=>setQty(c.bundleId,1,true)}>+</button>
                  </div>
                </div>
                <div className="crow__price">{P2((c.bundle.price||0)*c.q)}</div>
              </div>
            ))}
            <div className="summary">
              <div className="ln"><span>{t('subtotal')}</span><span>{P2(subtotal)}</span></div>
              <div className="ln lav"><span>{t('member_disc')}</span><span>−{P2(disc)}</span></div>
              <div className="ln"><span>{t('ship')}</span><span>{t('free')}</span></div>
              <div className="ln total"><span>{t('total')}</span><span>{P2(memberTotal)}</span></div>
            </div>
          </div>
          <div className="stickybar">
            <button className="btn btn--primary" style={{flex:1}} onClick={goCheckout} disabled={hasOOS}>
              {hasOOS ? t('stock_insufficient') : `${t('checkout')} · ${P2(memberTotal)}`}
            </button>
          </div>
        </>
      )}
      {noAddr && (
        <div className="modal-overlay" onClick={()=>setNoAddr(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>{t('cart_no_addr_title')}</div>
            <div style={{fontSize:13.5,color:'var(--dim)',lineHeight:1.5}}>{t('cart_no_addr')}</div>
            <div style={{display:'flex',gap:10,marginTop:18}}>
              <button className="btn btn--ghost" style={{flex:1}} onClick={()=>setNoAddr(false)}>{t('cancel')}</button>
              <button className="btn btn--primary" style={{flex:1}} onClick={()=>{ setNoAddr(false); go('address'); }}>{t('cart_go_addr')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============== CHECKOUT ============== */
const TIER_RATES = { cloud:0.01, pastel:0.03, lavender:0.05, midnight:0.08 };
const COUPONS = [
  { id:'none', discount:0 },
  { id:'10pct', discount:0.10, pct:true },
  { id:'5k', discount:5000 },
];
const PAY_METHODS = ['card','kakao','naver','toss'];

export function ScreenCheckout({ t, lang, back, data, uid, onOrder, showToast }) {
  const D = SOMNIA_DATA;
  const { productLines, bundleLines, subtotal, memberTotal, disc, addr } = data;
  const curTier = D.tiers.find(x=>x.cur) || D.tiers[0];
  const rate = TIER_RATES[curTier.key] || 0.01;
  const [payMethod, setPayMethod] = useState('card');
  const [couponId, setCouponId] = useState('none');
  const [ordering, setOrdering] = useState(false);
  const coupon = COUPONS.find(c=>c.id===couponId);
  const couponDisc = coupon.pct ? Math.round(memberTotal * coupon.discount) : coupon.discount;
  const finalTotal = Math.max(0, memberTotal - couponDisc);
  const reward = Math.round(finalTotal * rate);

  const payIcons = { card:'ticket', kakao:'chat', naver:'globe', toss:'spark' };

  const doOrder = async () => {
    setOrdering(true);
    try {
      const orderItems = [];
      productLines.forEach(c=> orderItems.push({ id:c.id, name:c.p.name, qty:c.q, price:c.p.member }));
      bundleLines.forEach(c=> {
        const itemIds = (c.bundle.items||[]).map(id=>typeof id==='string'?id:id.id);
        itemIds.forEach(id=> {
          const exist = orderItems.find(x=>x.id===id);
          if (exist) exist.qty += c.q;
          else { const p=D.products.find(x=>x.id===id); if(p) orderItems.push({ id, name:p.name, qty:c.q, price:p.member }); }
        });
      });
      const result = await createOrder(uid, { items:orderItems, address:addr, subtotal, discount:disc+couponDisc, total:finalTotal });
      setOrdering(false);
      onOrder({ orderId:result.orderId, total:finalTotal, reward, payMethod });
    } catch(e) {
      setOrdering(false);
      showToast(t('stock_insufficient'));
    }
  };

  return (
    <div className="scr light anim-push">
      <div className="hdr">
        <button className="icon-btn" onClick={back}>{Ico.back({s:20})}</button>
        <div style={{flex:1,marginLeft:6}}><h1 style={{fontSize:24}}>{t('ck_title')}</h1></div>
      </div>
      <div className="body" style={{display:'flex',flexDirection:'column',gap:20}}>
        {/* 배송지 */}
        <div className="card">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
            <span style={{fontSize:13,fontWeight:600,color:'var(--dim)'}}>{t('ck_addr')}</span>
          </div>
          <div style={{fontSize:14,fontWeight:600}}>{addr.name} · {addr.phone}</div>
          <div style={{fontSize:13,color:'var(--dim)',marginTop:4,lineHeight:1.5}}>{addr.addr}{addr.addrDetail ? ` ${addr.addrDetail}` : ''}</div>
        </div>

        {/* 결제 수단 */}
        <div>
          <div style={{fontSize:15,fontWeight:700,marginBottom:10}}>{t('ck_pay')}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {PAY_METHODS.map(m=>(
              <div key={m} onClick={()=>setPayMethod(m)}
                style={{display:'flex',alignItems:'center',gap:10,padding:'14px 16px',minHeight:56,borderRadius:14,
                  border:'1.5px solid '+(payMethod===m?'var(--lav)':'var(--border)'),
                  background:payMethod===m?'var(--lav-soft, #EDE9FB)':'var(--surface)',cursor:'pointer'}}>
                {Ico[payIcons[m]]({s:18})}
                <span style={{fontSize:13.5,fontWeight:payMethod===m?600:400}}>{t('ck_'+m)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 쿠폰 */}
        <div>
          <div style={{fontSize:15,fontWeight:700,marginBottom:10}}>{t('ck_coupon')}</div>
          {COUPONS.map(c=>(
            <label key={c.id} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 0',minHeight:56,borderBottom:'1px solid var(--border)',cursor:'pointer'}}>
              <input type="radio" name="coupon" checked={couponId===c.id} onChange={()=>setCouponId(c.id)}
                style={{accentColor:'var(--lav)',width:18,height:18,flexShrink:0}} />
              <span style={{fontSize:14,flex:1}}>{t('ck_coupon_'+c.id.replace('pct','10'))}</span>
              {c.discount>0 && <span style={{fontSize:13,fontWeight:600,color:'var(--lav)'}}>{c.pct ? '-10%' : '-'+P2(c.discount)}</span>}
            </label>
          ))}
        </div>

        {/* 결제 요약 + 예상 적립금 */}
        <div className="summary">
          <div className="ln"><span>{t('subtotal')}</span><span>{P2(subtotal)}</span></div>
          <div className="ln lav"><span>{t('member_disc')}</span><span>−{P2(disc)}</span></div>
          {couponDisc > 0 && <div className="ln lav"><span>{t('ck_coupon_disc')}</span><span>−{P2(couponDisc)}</span></div>}
          <div className="ln"><span>{t('ship')}</span><span>{t('free')}</span></div>
          <div className="ln total"><span>{t('total')}</span><span>{P2(finalTotal)}</span></div>
        </div>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',borderRadius:14,background:'linear-gradient(120deg,rgba(110,91,203,.08),rgba(25,91,130,.06))'}}>
          <div>
            <div style={{fontSize:13,color:'var(--dim)'}}>{t('ck_reward')} ({t('ck_reward_rate')} {Math.round(rate*100)}%)</div>
            <div style={{fontSize:18,fontWeight:700,color:'var(--lav)',marginTop:2}}>+{reward.toLocaleString()}{t('pts')}</div>
          </div>
          <div style={{fontSize:12,color:'var(--dim)'}}>{curTier.name[lang]}</div>
        </div>
      </div>
      <div className="stickybar">
        <button className="btn btn--primary" style={{flex:1}} onClick={doOrder} disabled={ordering || finalTotal <= 0}>
          {ordering ? t('cart_ordering') : `${t('ck_pay_btn')} · ${P2(finalTotal)}`}
        </button>
      </div>
    </div>
  );
}

/* ============== ORDER COMPLETE ============== */
export function ScreenOrderComplete({ t, lang, result, onDone, go }) {
  return (
    <div className="scr light anim-fade">
      <div className="body" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',gap:16}}>
        <div style={{width:64,height:64,borderRadius:99,background:'linear-gradient(135deg,#C2B0F5,#5b9fd6)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>{Ico.check({s:32,w:2.5})}</div>
        <div style={{fontSize:20,fontWeight:700}}>{t('ck_complete')}</div>
        <div style={{fontSize:13,color:'var(--dim)'}}>{t('ck_order_num')} {result.orderId}</div>

        <div className="card" style={{width:'100%',maxWidth:280,marginTop:8}}>
          <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
            <span style={{fontSize:14,color:'var(--dim)'}}>{t('ck_paid')}</span>
            <span style={{fontSize:16,fontWeight:700}}>{P2(result.total)}</span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0'}}>
            <span style={{fontSize:14,color:'var(--dim)'}}>{t('ck_earned')}</span>
            <span style={{fontSize:16,fontWeight:700,color:'var(--lav)'}}>+{result.reward.toLocaleString()}{t('pts')}</span>
          </div>
        </div>

        <div style={{display:'flex',gap:10,marginTop:12,width:'100%',maxWidth:280}}>
          <button className="btn btn--ghost" style={{flex:1}} onClick={onDone}>{t('ck_back_shop')}</button>
          <button className="btn btn--primary" style={{flex:1}} onClick={()=>go('orders')}>{t('ck_view_orders')}</button>
        </div>
      </div>
    </div>
  );
}

/* ============== MY PAGE ============== */
export function TabMy({ t, lang, go, tabbar, onLogout }) {
  const D = SOMNIA_DATA;
  const curTier = D.tiers.find(x=>x.cur) || D.tiers[0];
  const rows = [
    ['box', t('my_orders'), '', ()=>go('orders')],
    ['pin', t('my_addr'), '', ()=>go('address')],
    ['spark', t('tier_title'), curTier.name[lang], ()=>go('tiers')],
    ['ticket', t('my_coupon'), '3'+(lang==='ko'?'장':''), ()=>{}],
    ['bell', t('my_noti'), '', ()=>go('settings')],
    ['globe', t('my_lang'), lang==='ko'?'한국어':'English', ()=>go('settings')],
    ['help', t('my_help'), '', ()=>window.open('SOMNIA.html','_blank')],
  ];
  return (
    <div className="scr light anim-fade">
      <div className="hdr">
        <div><h1>{t('tab_my')}</h1></div>
        <button className="icon-btn" onClick={()=>go('settings')}>{Ico.cog({s:20})}</button>
      </div>
      <div className="body">
        <div className="profile">
          <div className="profile__av"><image-slot id="app-avatar" shape="circle" placeholder="photo"></image-slot></div>
          <div>
            <h2>{t('mc_name')}</h2>
            <div className="tier">{Ico.spark({s:13})} {t('mc_tier')}</div>
          </div>
        </div>
        <div className="minicards">
          <div className="minicard"><b>2,480</b><span>{t('mc_point')}</span></div>
          <div className="minicard"><b>3</b><span>{t('mc_coupon')}</span></div>
          <div className="minicard" style={{cursor:'pointer'}} onClick={()=>go('tiers')}><b>15%</b><span>{t('mc_grade')}</span></div>
        </div>
        <div className="mlist">
          {rows.map((r,i)=>(
            <div className="mrow" key={i} onClick={r[3]}>
              <div className="mi">{Ico[r[0]]({s:18})}</div>
              <div className="ml">{r[1]}</div>
              {r[2] && <div className="mv">{r[2]}</div>}
              {Ico.next({s:16})}
            </div>
          ))}
          <div className="mrow" style={{color:'var(--faint)',cursor:'pointer'}} onClick={()=>{ signOut(auth); if(onLogout) onLogout(); }}>
            <div className="mi">{Ico.out({s:18})}</div>
            <div className="ml">{t('my_logout')}</div>
          </div>
        </div>
      </div>
      {tabbar}
    </div>
  );
}

/* ============== SETTINGS ============== */
export function ScreenSettings({ t, lang, setLang, back, nightTheme, setNightTheme }) {
  const [noti,setNoti] = useState(true);
  const [snd,setSnd] = useState(true);
  const dark = nightTheme==='dark';
  return (
    <div className="scr light anim-push">
      <div className="hdr">
        <button className="icon-btn" onClick={back}>{Ico.back({s:20})}</button>
        <div style={{flex:1,marginLeft:6}}><h1 style={{fontSize:24}}>{t('set_title')}</h1></div>
      </div>
      <div className="body">
        <div className="section-t" style={{marginTop:6}}>{t('set_lang')}</div>
        <div className="seg">
          <button className={lang==='ko'?'on':''} onClick={()=>setLang('ko')}>한국어</button>
          <button className={lang==='en'?'on':''} onClick={()=>setLang('en')}>English</button>
        </div>
        <div className="section-t">{t('set_pref')}</div>
        <div className="toggle"><span>{t('set_noti')}</span><div className={'sw'+(noti?' on':'')} onClick={()=>setNoti(!noti)}><i></i></div></div>
        <div className="toggle"><span>{t('set_sound')}</span><div className={'sw'+(snd?' on':'')} onClick={()=>setSnd(!snd)}><i></i></div></div>
        <div className="toggle"><span>{t('set_dark')}</span><div className={'sw'+(dark?' on':'')} onClick={()=>setNightTheme(dark?'dawn':'dark')}><i></i></div></div>
      </div>
    </div>
  );
}

/* ── Onboarding pickers (reuse WheelCol from screens-sleep.jsx) ── */
function OnbTimePicker({ value, onChange }) {
  const iv = value && value.includes(':') ? value.split(':') : ['23','00'];
  const [h, setH] = useState(parseInt(iv[0],10)||23);
  const [m, setM] = useState(parseInt(iv[1],10)||0);
  useEffect(() => {
    onChange(String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0'));
  }, [h, m]);
  return (
    <div className="onb-picker">
      <WheelCol value={h} set={setH} max={24} />
      <span className="wheelcolon">:</span>
      <WheelCol value={m} set={setM} max={60} step={5} />
      <span className="wheelampm">{h < 12 ? 'AM' : 'PM'}</span>
    </div>
  );
}

function OnbDurationPicker({ value, onChange, ko }) {
  const iv = value && value.includes(':') ? value.split(':') : ['07','30'];
  const [h, setH] = useState(parseInt(iv[0],10)||7);
  const [m, setM] = useState(parseInt(iv[1],10)||0);
  useEffect(() => {
    onChange(String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0'));
  }, [h, m]);
  return (
    <div className="onb-picker">
      <WheelCol value={h} set={setH} max={24} pad={false} />
      <span style={{fontSize:16,fontWeight:600,color:'var(--dim)',alignSelf:'center',marginBottom:2}}>{ko?'시':'h'}</span>
      <WheelCol value={m} set={setM} max={60} step={30} />
      <span style={{fontSize:16,fontWeight:600,color:'var(--dim)',alignSelf:'center',marginBottom:2}}>{ko?'분':'m'}</span>
    </div>
  );
}

/* ============== ONBOARDING ============== */
export function Onboarding({ t, lang, finish }) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(null);
  const [goalCustom, setGoalCustom] = useState(false);
  const [goalCustomVal, setGoalCustomVal] = useState('');
  const [bed,  setBed]  = useState(null);
  const [bedCustom, setBedCustom] = useState(false);
  const [bedCustomVal, setBedCustomVal] = useState('');
  const [wake, setWake] = useState(null);
  const [wakeCustom, setWakeCustom] = useState(false);
  const [wakeCustomVal, setWakeCustomVal] = useState('');

  useEffect(() => {
    const host = document.querySelector('.onb__stars'); if (!host) return;
    host.innerHTML = '';
    for (let i = 0; i < 40; i++) {
      const s = document.createElement('span'); s.className = 'star';
      const r = Math.random() * 2 + 0.6;
      s.style.width = s.style.height = r + 'px';
      s.style.left = Math.random() * 100 + '%';
      s.style.top  = Math.random() * 70  + '%';
      s.style.setProperty('--d',  (2 + Math.random() * 4) + 's');
      s.style.setProperty('--dl', (Math.random() * 4) + 's');
      host.appendChild(s);
    }
  }, [step]);

  const ko = lang === 'ko';
  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => s - 1);

  const GOALS = ko ? ['6시간','7시간','7.5시간','8시간','9시간'] : ['6h','7h','7.5h','8h','9h'];
  const BEDS  = ['21:00','22:00','23:00','00:00','01:00'];
  const WAKES = ['06:00','06:30','07:00','07:30','08:00'];

  const Opt = ({ label, on, onClick }) => (
    <button className={'onb-opt'+(on?' on':'')} onClick={onClick}>
      <span>{label}</span>
      <span className="onb-opt__circle">
        {on && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><polyline points="1,4.5 4,7.5 10,1" stroke="#0a1430" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </span>
    </button>
  );

  const bg = step === 0
    ? <><div className="onb__bg"/><div className="onb__stars"/></>
    : <div className="onb__stars"/>;
  const dots = (
    <div style={{display:'flex',gap:6,justifyContent:'center',position:'absolute',top:54,left:0,right:0}}>
      {[1,2,3].map(i => (
        <div key={i} style={{height:6, width:step>=i?18:6, borderRadius:99,
          background: step>=i ? '#C2B0F5' : 'rgba(255,255,255,.2)', transition:'all .3s'}}/>
      ))}
    </div>
  );
  const foot = (can) => (
    <div className="bt-foot" style={{display:'flex',gap:10}}>
      <button className="btn btn--ghost" onClick={prev}>{ko?'이전':'Back'}</button>
      <button className="btn btn--primary" onClick={next}
        style={{opacity:can?1:.4, pointerEvents:can?'auto':'none'}}>
        {ko?'다음':'Next'} →
      </button>
    </div>
  );

  /* ── Step 0: Welcome ── */
  if (step === 0) return (
    <div className="scr dark onb anim-fade">
      {bg}
      <img className="onb__logo" src={logoFullWhite} alt="SOMNIA"/>
      <div className="onb__tag" style={{whiteSpace:'pre-line'}}>{t('onb_tag')}</div>
      <div className="onb__btn">
        <button className="btn btn--primary" onClick={next}>{ko?'시작하기':'Get started'} →</button>
      </div>
    </div>
  );

  /* ── Step 1: Sleep goal ── */
  if (step === 1) return (
    <div className="scr dark anim-fade" style={{justifyContent:'flex-start',position:'relative'}}>
      {bg}{dots}
      <div className="body" style={{paddingTop:120}}>
        <div style={{fontSize:11,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--lav)',marginBottom:12}}>
          {ko?'수면 목표':'Sleep Goal'}
        </div>
        <h1 style={{fontSize:24,fontWeight:700,lineHeight:1.3,marginBottom:24,whiteSpace:'pre-line'}}>
          {ko?'하루에 몇 시간\n자고 싶으세요?':'How many hours\ndo you want to sleep?'}
        </h1>
        <div className="onb-opts grid2">
          {GOALS.map((g,i) => (
            <Opt key={i} label={g} on={!goalCustom && goal===i}
              onClick={()=>{ setGoal(i); setGoalCustom(false); }}/>
          ))}
          <Opt label={ko?'직접 입력':'Custom'} on={goalCustom}
            onClick={()=>{ setGoalCustom(true); setGoal(null); if(!goalCustomVal) setGoalCustomVal('07:30'); }}/>
        </div>
        {goalCustom && <OnbDurationPicker value={goalCustomVal} onChange={setGoalCustomVal} ko={ko}/>}
      </div>
      {foot(!goalCustom ? goal !== null : true)}
    </div>
  );

  /* ── Step 2: Bedtime ── */
  if (step === 2) return (
    <div className="scr dark anim-fade" style={{justifyContent:'flex-start',position:'relative'}}>
      {bg}{dots}
      <div className="body" style={{paddingTop:120}}>
        <div style={{fontSize:11,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--lav)',marginBottom:12}}>
          {ko?'취침 시간':'Bedtime'}
        </div>
        <h1 style={{fontSize:24,fontWeight:700,lineHeight:1.3,marginBottom:24,whiteSpace:'pre-line'}}>
          {ko?'보통 언제\n잠드나요?':'When do you usually\nfall asleep?'}
        </h1>
        <div className="onb-opts grid2">
          {BEDS.map((b,i) => (
            <Opt key={i} label={b} on={!bedCustom && bed===i}
              onClick={()=>{ setBed(i); setBedCustom(false); }}/>
          ))}
          <Opt label={ko?'직접 입력':'Custom'} on={bedCustom}
            onClick={()=>{ setBedCustom(true); setBed(null); if(!bedCustomVal) setBedCustomVal('23:00'); }}/>
        </div>
        {bedCustom && <OnbTimePicker value={bedCustomVal} onChange={setBedCustomVal}/>}
      </div>
      {foot(!bedCustom ? bed !== null : true)}
    </div>
  );

  /* ── Step 3: Wake time ── */
  if (step === 3) return (
    <div className="scr dark anim-fade" style={{justifyContent:'flex-start',position:'relative'}}>
      {bg}{dots}
      <div className="body" style={{paddingTop:120}}>
        <div style={{fontSize:11,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--lav)',marginBottom:12}}>
          {ko?'기상 시간':'Wake Time'}
        </div>
        <h1 style={{fontSize:24,fontWeight:700,lineHeight:1.3,marginBottom:24,whiteSpace:'pre-line'}}>
          {ko?'몇 시에\n일어나나요?':'When do you\nusually wake up?'}
        </h1>
        <div className="onb-opts grid2">
          {WAKES.map((w,i) => (
            <Opt key={i} label={w} on={!wakeCustom && wake===i}
              onClick={()=>{ setWake(i); setWakeCustom(false); }}/>
          ))}
          <Opt label={ko?'직접 입력':'Custom'} on={wakeCustom}
            onClick={()=>{ setWakeCustom(true); setWake(null); if(!wakeCustomVal) setWakeCustomVal('07:00'); }}/>
        </div>
        {wakeCustom && <OnbTimePicker value={wakeCustomVal} onChange={setWakeCustomVal}/>}
      </div>
      {foot(!wakeCustom ? wake !== null : true)}
    </div>
  );

  /* ── Step 4: Ready ── */
  const goalVal = (() => {
    if (!goalCustom) return goal !== null ? GOALS[goal] : null;
    const [gh,gm] = (goalCustomVal||'07:30').split(':').map(Number);
    return ko ? `${gh}시간${gm?' '+gm+'분':''}` : gm ? `${gh}h ${gm}m` : `${gh}h`;
  })();
  const bedVal  = bedCustom  ? bedCustomVal  : (bed  !== null ? BEDS[bed]   : null);
  const wakeVal = wakeCustom ? wakeCustomVal : (wake !== null ? WAKES[wake] : null);
  const summary = [
    [ko?'수면 목표':'Sleep goal', goalVal],
    [ko?'취침'    :'Bedtime',    bedVal],
    [ko?'기상'    :'Wake up',    wakeVal],
  ];
  return (
    <div className="scr dark anim-fade" style={{justifyContent:'flex-start',position:'relative'}}>
      {bg}{dots}
      <div className="body" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',paddingTop:70,paddingBottom:80}}>
        <div style={{width:68,height:68,borderRadius:22,background:'rgba(194,176,245,.18)',
          display:'flex',alignItems:'center',justifyContent:'center',marginBottom:24}}>
          {Ico.moon({s:34})}
        </div>
        <h1 style={{fontSize:26,fontWeight:700,marginBottom:10}}>{ko?'준비됐어요!':'All set!'}</h1>
        <p style={{fontSize:14,color:'var(--dim)',lineHeight:1.6,marginBottom:28,maxWidth:260,whiteSpace:'pre-line'}}>
          {ko?'당신의 수면 루틴이 설계되었습니다.\n썸니아와 함께 시작해요.':'Your sleep routine is ready.\nLet\'s start with SOMNIA.'}
        </p>
        <div className="card" style={{width:'100%',textAlign:'left',padding:'18px 20px'}}>
          {summary.map(([label,val],i,arr) => (
            <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:14,
              paddingBottom:i<arr.length-1?12:0, marginBottom:i<arr.length-1?12:0,
              borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,.1)':'none'}}>
              <span style={{color:'var(--dim)'}}>{label}</span>
              <span style={{fontWeight:600}}>{val??'—'}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bt-foot">
        <button className="btn btn--primary" style={{width:'100%'}} onClick={finish}>
          {ko?'썸니아 시작하기':'Start SOMNIA'} →
        </button>
      </div>
    </div>
  );
}

/* ============== shared styles ============== */
const emptyStyle = {textAlign:'center',padding:40,color:'var(--dim)'};

/* ============== ORDERS ============== */
const STATUS_KEY = { paid:'ord_paid', shipping:'ord_ship', delivered:'ord_done', cancelled:'ord_cancel' };
const STATUS_CLS = { paid:'badge--info', shipping:'badge--warn', delivered:'badge--ok', cancelled:'badge--dim' };

export function ScreenOrders({ t, lang, back, uid }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    if (!uid) return;
    getOrders(uid).then(r=>{ setList(r); setLoading(false); });
  }, [uid]);
  return (
    <div className="scr light anim-push">
      <div className="hdr">
        <button className="icon-btn" onClick={back}>{Ico.back({s:20})}</button>
        <div style={{flex:1,marginLeft:6}}><h1 style={{fontSize:24}}>{t('ord_title')}</h1></div>
      </div>
      <div className="body">
        {loading ? <div style={emptyStyle}>…</div>
        : list.length===0 ? <div style={emptyStyle}>{t('ord_empty')}</div>
        : list.map(o=>(
          <div className="card" key={o.id} style={{marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
              <span className={'badge '+(STATUS_CLS[o.status]||'')}>{t(STATUS_KEY[o.status]||o.status)}</span>
              <span style={{fontSize:12,color:'var(--dim)',marginLeft:'auto'}}>{formatDate(o.createdAt, lang)}</span>
            </div>
            <div style={{fontSize:13,color:'var(--dim)',marginBottom:8,lineHeight:1.4}}>{t('ord_num')} {o.orderId}</div>
            <div style={{fontSize:14,fontWeight:600,lineHeight:1.4,display:'flex',justifyContent:'space-between'}}>
              <span>{o.items?.length||0}{t('ord_items')}</span>
              <span>{P2(o.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============== ADDRESS management ============== */
const addrInputStyle = {width:'100%',padding:'12px 14px',borderRadius:12,border:'1.5px solid var(--border)',fontSize:14,background:'var(--surface)',color:'var(--fg)'};
const addrLabelStyle = {fontSize:12,fontWeight:600,color:'var(--dim)',marginBottom:4,display:'block'};

export function ScreenAddress({ t, lang, back, uid, go }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const reload = ()=>{ if(!uid) return; setLoading(true); getAddresses(uid).then(r=>{ setList(r); setLoading(false); }); };
  useEffect(()=>{ reload(); }, [uid]);
  const toggleDefault = async (item) => {
    await updateAddress(uid, item.id, { isDefault: !item.isDefault });
    reload();
  };
  const remove = async (item) => {
    await deleteAddress(uid, item.id);
    reload();
  };
  return (
    <div className="scr light anim-push">
      <div className="hdr">
        <button className="icon-btn" onClick={back}>{Ico.back({s:20})}</button>
        <div style={{flex:1,marginLeft:6}}><h1 style={{fontSize:24}}>{t('addr_title')}</h1></div>
      </div>
      <div className="body">
        {loading ? <div style={emptyStyle}>…</div>
        : list.length===0 ? <div style={emptyStyle}>{t('addr_empty')}</div>
        : list.map(a=>(
          <div className="card" key={a.id} style={{marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <span style={{fontSize:15,fontWeight:600}}>{a.label}</span>
              {a.isDefault && <span style={{fontSize:10,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:'#fff',background:'var(--lav)',padding:'3px 8px',borderRadius:999}}>{t('addr_default')}</span>}
              <span style={{marginLeft:'auto',fontSize:13,color:'var(--lav)',fontWeight:600,cursor:'pointer'}} onClick={()=>go('addressForm',a)}>{t('addr_edit')}</span>
            </div>
            <div style={{fontSize:14,fontWeight:600}}>{a.name} · {a.phone}</div>
            <div style={{fontSize:13.5,color:'var(--dim)',marginTop:4,lineHeight:1.5}}>{a.addr}{a.addrDetail ? ` ${a.addrDetail}` : ''}</div>
            <div style={{display:'flex',gap:12,marginTop:10}}>
              {!a.isDefault && <span style={{fontSize:12,color:'var(--lav)',fontWeight:600,cursor:'pointer'}} onClick={()=>toggleDefault(a)}>{t('addr_set_default')}</span>}
              <span style={{fontSize:12,color:'var(--faint)',cursor:'pointer',marginLeft:'auto'}} onClick={()=>{ if(confirm(t('addr_del_confirm'))) remove(a); }}>{t('addr_del')}</span>
            </div>
          </div>
        ))}
        <button className="btn btn--ghost" style={{marginTop:4}} onClick={()=>go('addressForm',null)}>{Ico.plus({s:18})} {t('addr_add')}</button>
      </div>
    </div>
  );
}

/* ============== ADDRESS FORM ============== */
export function ScreenAddressForm({ t, lang, back, uid, editing, onSaved }) {
  const isEdit = !!editing;
  const [label, setLabel] = useState(editing?.label || '');
  const [name, setName] = useState(editing?.name || '');
  const [phone, setPhone] = useState(editing?.phone || '');
  const [addr, setAddr] = useState(editing?.addr || '');
  const [addrDetail, setAddrDetail] = useState(editing?.addrDetail || '');
  const [zip, setZip] = useState(editing?.zip || '');
  const [isDef, setIsDef] = useState(editing?.isDefault || false);
  const [saving, setSaving] = useState(false);
  const searchAddr = () => {
    if (!window.daum?.Postcode) {
      const s = document.createElement('script');
      s.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      s.onload = () => openPostcode();
      s.onerror = () => alert(lang==='ko'?'주소 검색 서비스에 연결할 수 없습니다.':'Unable to connect to address search service.');
      document.head.appendChild(s);
    } else openPostcode();
  };
  const openPostcode = () => {
    new window.daum.Postcode({
      oncomplete(d) {
        setZip(d.zonecode);
        setAddr(d.roadAddress || d.jibunAddress);
      }
    }).open();
  };
  const save = async () => {
    if (!uid || !name.trim() || !phone.trim() || !addr.trim()) return;
    setSaving(true);
    const data = { label: label.trim()||t('addr_new'), name: name.trim(), phone: phone.trim(), addr: addr.trim(), addrDetail: addrDetail.trim(), zip: zip.trim(), isDefault: isDef };
    if (isEdit) await updateAddress(uid, editing.id, data);
    else await addAddress(uid, data);
    setSaving(false);
    onSaved();
  };
  return (
    <div className="scr light anim-push">
      <div className="hdr">
        <button className="icon-btn" onClick={back}>{Ico.back({s:20})}</button>
        <div style={{flex:1,marginLeft:6}}><h1 style={{fontSize:24}}>{isEdit ? t('addr_edit_title') : t('addr_new')}</h1></div>
      </div>
      <div className="body" style={{display:'flex',flexDirection:'column',gap:14}}>
        <div>
          <label style={addrLabelStyle}>{t('addr_label')}</label>
          <input style={addrInputStyle} value={label} onChange={e=>setLabel(e.target.value)} placeholder={lang==='ko'?'예: 집, 회사':'e.g. Home, Office'} />
        </div>
        <div>
          <label style={addrLabelStyle}>{t('addr_name')}</label>
          <input style={addrInputStyle} value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label style={addrLabelStyle}>{t('addr_phone')}</label>
          <input style={addrInputStyle} value={phone} onChange={e=>setPhone(e.target.value)} type="tel" />
        </div>
        <div>
          <label style={addrLabelStyle}>{t('addr_zip')}</label>
          <div style={{display:'flex',gap:8}}>
            <input style={{...addrInputStyle,flex:1,background:'var(--surface2)',opacity:.7}} value={zip} readOnly placeholder={lang==='ko'?'우편번호':'Zip'} />
            <button className="btn btn--ghost" style={{whiteSpace:'nowrap',fontSize:13,padding:'10px 14px'}} onClick={searchAddr}>{t('addr_zip_search')}</button>
          </div>
        </div>
        <div>
          <label style={addrLabelStyle}>{t('addr_addr')}</label>
          <input style={{...addrInputStyle,background:'var(--surface2)',opacity:.7}} value={addr} readOnly placeholder={lang==='ko'?'주소 검색 버튼을 눌러주세요':'Use search button above'} />
        </div>
        <div>
          <label style={addrLabelStyle}>{t('addr_addr_detail')}</label>
          <input style={addrInputStyle} value={addrDetail} onChange={e=>setAddrDetail(e.target.value)} placeholder={lang==='ko'?'동/호수':'Apt, Suite, etc.'} />
        </div>
        <label style={{display:'flex',alignItems:'center',gap:8,fontSize:14,cursor:'pointer'}}>
          <input type="checkbox" checked={isDef} onChange={e=>setIsDef(e.target.checked)} style={{accentColor:'var(--lav)',width:18,height:18}} />
          {t('addr_set_default')}
        </label>
        <button className="btn btn--primary" style={{width:'100%',marginTop:8}} onClick={save} disabled={saving}>
          {saving ? '…' : t('addr_save')}
        </button>
      </div>
    </div>
  );
}

/* ============== MEMBERSHIP TIERS ============== */
/* ============== LOGIN ============== */
export function ScreenLogin({ t, lang, onLogin }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const ko = lang === 'ko';
  const submit = async () => {
    setErr(''); setLoading(true);
    try {
      try { await signInWithEmailAndPassword(auth, email, pw); }
      catch (err) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          try { await createUserWithEmailAndPassword(auth, email, pw); }
          catch (e2) { throw err; }
        } else throw err;
      }
      onLogin();
    } catch(e) { setErr(ko ? '이메일 또는 비밀번호를 확인해주세요.' : 'Invalid email or password.'); }
    setLoading(false);
  };
  return (
    <div className="scr dark onb anim-fade" style={{justifyContent:'center',padding:'0 32px'}}>
      <div className="onb__stars"/>
      <div style={{position:'relative',zIndex:2,width:'100%',maxWidth:320}}>
        <img className="onb__logo" src={logoFullWhite} alt="SOMNIA" style={{display:'block',margin:'0 auto 30px',width:160}}/>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            placeholder={ko?'이메일':'Email'}
            style={{width:'100%',padding:'14px 16px',borderRadius:14,border:'1.5px solid rgba(255,255,255,.15)',
              background:'rgba(255,255,255,.08)',color:'#EAF0FF',fontSize:15,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)}
            placeholder={ko?'비밀번호':'Password'} onKeyDown={e=>e.key==='Enter'&&submit()}
            style={{width:'100%',padding:'14px 16px',borderRadius:14,border:'1.5px solid rgba(255,255,255,.15)',
              background:'rgba(255,255,255,.08)',color:'#EAF0FF',fontSize:15,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
        </div>
        {err && <div style={{color:'#E7A6BE',fontSize:13,marginTop:10,textAlign:'center'}}>{err}</div>}
        <button className="btn btn--primary" style={{marginTop:18,opacity:loading?.5:1}} onClick={submit} disabled={loading}>
          {loading ? '...' : (ko?'로그인':'Log in')}
        </button>
        <div style={{fontSize:11,color:'rgba(234,240,255,.4)',textAlign:'center',marginTop:16,lineHeight:1.5}}>
          demo@somnia.kr / somnia2026
        </div>
      </div>
    </div>
  );
}

export function ScreenTiers({ t, lang, back }) {
  const D = SOMNIA_DATA;
  const cur = D.tiers.find(x=>x.cur) || D.tiers[0];
  const curIdx = D.tiers.indexOf(cur);
  const toNext = Math.max(0, D.nextTierAt - D.points);
  const prevAt = 2000, span = D.nextTierAt - prevAt;
  const pct = Math.min(100, Math.round((D.points - prevAt) / span * 100));
  return (
    <div className="scr light anim-push">
      <div className="hdr">
        <button className="icon-btn" onClick={back}>{Ico.back({s:20})}</button>
        <div style={{flex:1,marginLeft:6}}><h1 style={{fontSize:24}}>{t('tier_title')}</h1></div>
      </div>
      <div className="body">
        <div className="member-card">
          <div className="mc-row">
            <div><div className="mc-tier">{t('tier_cur')}</div><div className="mc-name">{cur.name[lang]} · {cur.range[lang]}</div></div>
            <div className="mc-badge">{D.points.toLocaleString()}P</div>
          </div>
          <div style={{marginTop:18,position:'relative',zIndex:1}}>
            <div style={{height:8,borderRadius:99,background:'rgba(255,255,255,.25)',overflow:'hidden'}}>
              <div style={{height:'100%',width:pct+'%',borderRadius:99,background:'#fff'}}></div>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:12,opacity:.9}}>
              <span>{cur.name[lang]}</span>
              <span>{t('tier_to_next')} {toNext.toLocaleString()}P</span>
            </div>
          </div>
        </div>

        <div className="section-t">{t('tier_sub')}</div>
        {D.tiers.map((tr,i)=>{
          const active = tr.cur;
          const META = {
            cloud:    { grad:['#AFCDEC','#7FA9D6'], ic:'cloud',   ring:'rgba(127,169,214,.45)', chip:'#E8F1FA', chipFg:'#3E6E9E' },
            pastel:   { grad:['#F4C4DD','#E6A0C6'], ic:'droplet', ring:'rgba(230,160,198,.5)',  chip:'#FBEAF3', chipFg:'#B85E8E' },
            lavender: { grad:['#C2B0F5','#8155C8'], ic:'moon',    ring:'rgba(129,85,200,.5)',   chip:'#EFE7F9', chipFg:'#6E45B0' },
            midnight: { grad:['#5566A8','#1B2550'], ic:'sparkle', ring:'rgba(60,76,140,.5)',    chip:'#E7EAF5', chipFg:'#3A4682' },
          }[tr.key] || { grad:['#C2B0F5','#5b9fd6'], ic:'spark', ring:'var(--border)', chip:'var(--lav-soft,#EDE9FB)', chipFg:'var(--lav)' };
          const locked = i > curIdx;
          return (
            <div className="card" key={tr.key} style={{marginBottom:12,position:'relative',
              border: active?('1.5px solid '+META.grad[1]):'1px solid var(--border)',
              opacity: locked?0.92:1}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:44,height:44,borderRadius:13,flex:'none',display:'flex',alignItems:'center',justifyContent:'center',
                  background:`linear-gradient(135deg,${META.grad[0]},${META.grad[1]})`,color:'#fff',
                  boxShadow: locked?'none':`0 8px 18px -8px ${META.ring}`,
                  filter: locked?'saturate(.55)':'none'}}>{Ico[META.ic]({s:22})}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:16,fontWeight:600,display:'flex',alignItems:'center',gap:7}}>
                    {tr.name[lang]}
                    {active && <span style={{fontSize:10,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:'#fff',background:META.grad[1],padding:'3px 8px',borderRadius:999}}>{t('tier_cur')}</span>}
                  </div>
                  <div style={{fontSize:12,color:'var(--dim)',marginTop:2}}>{tr.range[lang]}</div>
                </div>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:7,marginTop:13}}>
                {tr.perks[lang].map((p,j)=>(
                  <span key={j} style={{fontSize:12,color:META.chipFg,background:META.chip,padding:'6px 11px',borderRadius:999,fontWeight:600}}>{p}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

