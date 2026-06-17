/* SOMNIA App — Shop screens (light): Shop, Product, Cart, My, Settings + Onboarding */
const { useState:useStateH, useEffect:useEffectH } = React;
const P2 = window.SOMNIA_PRICE;

/* full-bleed marketing detail cuts, per product id (rendered below the buy info) */
const APP_DETAILCUTS = {
  jelly:[
    {src:'assets/app/detail/jelly-detail-1.png',w:1800,h:4452,alt:'SOMNIA Dream Jelly — 3 Night Moods'},
    {src:'assets/app/detail/jelly-detail-2.gif',w:460,h:501,alt:'잠들기 전 30분, 하루를 차분하게 마무리하는 젤리'},
    {src:'assets/app/detail/jelly-detail-3.gif',w:718,h:404,alt:'밤의 루틴을 즐기는 순간'},
    {src:'assets/app/detail/jelly-detail-4.png',w:1800,h:6531,alt:'POINT · HOW TO USE · 수면 만족도'},
  ],
  mask:[
    {src:'assets/app/detail/mask-detail-1.gif',w:1280,h:720,alt:'잠들기 전, 빛을 차단하는 순간'},
    {src:'assets/app/detail/mask-detail-2.png',w:3130,h:8511,alt:'SOMNIA 프리미엄 수면안대 — 구조 · 디테일 · CARE GUIDE'},
  ],
};

/* ============== SHOP HOME ============== */
function TabShop({ t, lang, go, cartCount, tabbar }) {
  const D = window.SOMNIA_DATA;
  const [cat, setCat] = useStateH('all');
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
          {items.map(p=>(
            <div className="prod" key={p.id} onClick={()=>go('product',p.id)}>
              <div className="prod__img">
                {p.tag[lang] && <div className="prod__tag">{p.tag[lang]}</div>}
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
          ))}
        </div>
      </div>
      {tabbar}
    </div>
  );
}

/* ============== PRODUCT DETAIL ============== */
function ScreenProduct({ t, lang, back, pid, addToCart }) {
  const D = window.SOMNIA_DATA;
  const p = D.products.find(x=>x.id===pid) || D.products[0];
  const detail = (window.SOMNIA_PRODUCTS||{})[p.id];
  const catKey = p.cat==='beauty'?'beauty':p.cat==='aroma'?'aroma':'gear';
  const [opt, setOpt] = useStateH(0);
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
          {detail && window.SOMNIA_NOTICE && (
            <div className="pd-notice">
              <div className="pd-sec-t">{t('pd_notice')}</div>
              <ul>{window.SOMNIA_NOTICE[lang].map((n,i)=>(<li key={i}>{n}</li>))}</ul>
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
        <div className="price"><span>{sel ? sel.name[lang] : t('member_price')}</span><b>{P2(p.member)}</b></div>
        <button className="btn btn--ghost" style={{flex:'none',width:'auto',padding:'14px 18px'}} onClick={()=>addToCart(p.id)} aria-label={t('add_cart')}>{Ico.bag({s:18})}</button>
        <button className="btn btn--primary" style={{flex:1}} onClick={()=>addToCart(p.id)}>{t('pd_buy_now')}</button>
      </div>
    </div>
  );
}

/* ============== CART ============== */
function ScreenCart({ t, lang, back, cart, setQty, checkout }) {
  const D = window.SOMNIA_DATA;
  const lines = cart.map(c=>({ ...c, p:D.products.find(x=>x.id===c.id) })).filter(c=>c.p);
  const subtotal = lines.reduce((a,c)=>a+c.p.price*c.q,0);
  const memberTotal = lines.reduce((a,c)=>a+c.p.member*c.q,0);
  const disc = subtotal - memberTotal;
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
            {lines.map(c=>(
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
            <div className="summary">
              <div className="ln"><span>{t('subtotal')}</span><span>{P2(subtotal)}</span></div>
              <div className="ln lav"><span>{t('member_disc')}</span><span>−{P2(disc)}</span></div>
              <div className="ln"><span>{t('ship')}</span><span>{t('free')}</span></div>
              <div className="ln total"><span>{t('total')}</span><span>{P2(memberTotal)}</span></div>
            </div>
          </div>
          <div className="stickybar">
            <button className="btn btn--primary" style={{flex:1}} onClick={checkout}>{t('checkout')} · {P2(memberTotal)}</button>
          </div>
        </>
      )}
    </div>
  );
}

/* ============== MY PAGE ============== */
function TabMy({ t, lang, go, tabbar }) {
  const D = window.SOMNIA_DATA;
  const curTier = D.tiers.find(x=>x.cur) || D.tiers[0];
  const rows = [
    ['box', t('my_orders'), '', ()=>{}],
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
          <div className="mrow" style={{color:'var(--faint)'}}>
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
function ScreenSettings({ t, lang, setLang, back, nightTheme, setNightTheme }) {
  const [noti,setNoti] = useStateH(true);
  const [snd,setSnd] = useStateH(true);
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

/* ============== ONBOARDING ============== */
function Onboarding({ t, finish }) {
  useEffectH(()=>{
    const host = document.querySelector('.onb__stars'); if(!host||host.childElementCount) return;
    for(let i=0;i<40;i++){ const s=document.createElement('span'); s.className='star';
      const r=Math.random()*2+0.6; s.style.width=s.style.height=r+'px';
      s.style.left=Math.random()*100+'%'; s.style.top=Math.random()*70+'%';
      s.style.setProperty('--d',(2+Math.random()*4)+'s'); s.style.setProperty('--dl',(Math.random()*4)+'s');
      host.appendChild(s); }
  },[]);
  return (
    <div className="scr dark onb anim-fade">
      <div className="onb__bg"></div>
      <div className="onb__stars"></div>
      <img className="onb__logo" src="assets/logo-full-white.png" alt="SOMNIA"/>
      <div className="onb__tag" style={{whiteSpace:'pre-line'}}>{t('onb_tag')}</div>
      <div className="onb__btn">
        <button className="btn btn--primary" onClick={finish}>{t('onb_start')}</button>
      </div>
    </div>
  );
}

/* ============== ADDRESS management ============== */
function ScreenAddress({ t, lang, back }) {
  const D = window.SOMNIA_DATA;
  return (
    <div className="scr light anim-push">
      <div className="hdr">
        <button className="icon-btn" onClick={back}>{Ico.back({s:20})}</button>
        <div style={{flex:1,marginLeft:6}}><h1 style={{fontSize:24}}>{t('addr_title')}</h1></div>
      </div>
      <div className="body">
        {D.addresses.map((a,i)=>(
          <div className="card" key={i} style={{marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <span style={{fontSize:15,fontWeight:600}}>{a.label[lang]}</span>
              {a.def && <span style={{fontSize:10,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:'#fff',background:'var(--lav)',padding:'3px 8px',borderRadius:999}}>{t('addr_default')}</span>}
              <span style={{marginLeft:'auto',fontSize:13,color:'var(--lav)',fontWeight:600,cursor:'pointer'}}>{t('addr_edit')}</span>
            </div>
            <div style={{fontSize:14,fontWeight:600}}>{a.name[lang]} · {a.phone}</div>
            <div style={{fontSize:13.5,color:'var(--dim)',marginTop:4,lineHeight:1.5}}>{a.addr[lang]}</div>
          </div>
        ))}
        <button className="btn btn--ghost" style={{marginTop:4}}>{Ico.plus({s:18})} {t('addr_add')}</button>
      </div>
    </div>
  );
}

/* ============== MEMBERSHIP TIERS ============== */
function ScreenTiers({ t, lang, back }) {
  const D = window.SOMNIA_DATA;
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

Object.assign(window, { TabShop, ScreenProduct, ScreenCart, TabMy, ScreenSettings, Onboarding, ScreenAddress, ScreenTiers });
