import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Ico } from './icons.jsx'
import { SOMNIA_I18N } from './i18n.js'
import { IOSDevice } from './ios-frame.jsx'
import { TabHome, TabReport, ScreenBedPrep, ScreenBedtime, ScreenSummary, ScreenRecord } from './screens-sleep.jsx'
import { TabShop, ScreenProduct, ScreenCart, TabMy, ScreenSettings, Onboarding, ScreenOrders, ScreenAddress, ScreenAddressForm, ScreenTiers, ScreenLogin } from './screens-shop.jsx'
import { auth } from './firebase.js'
import { onAuthStateChanged } from 'firebase/auth'

const DARK_SCREENS = { home:1, report:1, bedprep:1, bedtime:1, record:1, summary:1 };

function TabBar({ t, tab, setTab, cartCount }) {
  const tabs = [
    ['home','moon', t('tab_sleep')],
    ['report','chart', t('tab_report')],
    ['shop','bag', t('tab_shop')],
    ['my','user', t('tab_my')],
  ];
  return (
    <div className="tabbar">
      {tabs.map(([k,ic,lbl])=>(
        <div key={k} className={'tab'+(tab===k?' on':'')} onClick={()=>setTab(k)}>
          <div style={{position:'relative'}}>
            {Ico[ic]({s:24, w: tab===k?2:1.7})}
            {k==='shop' && cartCount>0 && <span className="tab__badge">{cartCount}</span>}
          </div>
          <span>{lbl}</span>
        </div>
      ))}
    </div>
  );
}

export function App() {
  const [lang, setLangState] = useState(localStorage.getItem('somnia-app-lang') || 'ko');
  const [nightTheme, setNightThemeState] = useState(localStorage.getItem('somnia-app-theme') || 'dark');
  const setNightTheme = (v)=>{ setNightThemeState(v); localStorage.setItem('somnia-app-theme', v); };
  const [onboard, setOnboard] = useState(true);
  const [user, setUser] = useState(undefined);
  useEffect(()=> onAuthStateChanged(auth, (u)=> setUser(u||null)), []);
  const [tab, setTab] = useState('home');
  const [overlay, setOverlay] = useState(null);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState({ msg:'', show:false });
  const toastTimer = useRef(null);

  const t = useCallback((k)=> (SOMNIA_I18N[lang] && SOMNIA_I18N[lang][k]) || k, [lang]);
  const setLang = (l)=>{ setLangState(l); localStorage.setItem('somnia-app-lang', l); };

  const cartCount = cart.reduce((a,c)=>a+c.q,0);

  const showToast = (msg)=>{
    setToast({ msg, show:true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setToast(s=>({ ...s, show:false })), 2200);
  };

  const go = (name, arg)=>{
    if (['home','report','shop','my'].includes(name)) { setTab(name); setOverlay(null); }
    else setOverlay({ name, arg });
  };
  const back = ()=> setOverlay(null);

  const addToCart = (id)=>{
    setCart(c=>{ const f=c.find(x=>x.id===id);
      return f ? c.map(x=>x.id===id?{...x,q:x.q+1}:x) : [...c,{id,q:1}]; });
    showToast(t('added'));
  };
  const setQty = (id,d)=> setCart(c=> c.map(x=>x.id===id?{...x,q:x.q+d}:x).filter(x=>x.q>0));
  const checkout = ()=>{ setCart([]); setOverlay(null); setTab('shop'); showToast(t('ordered')); };

  const tabBarNode = <TabBar t={t} tab={tab} setTab={(k)=>go(k)} cartCount={cartCount} />;

  const loggedOut = !onboard && !user;
  let screenName = overlay ? overlay.name : tab;
  const isNightScreen = !!DARK_SCREENS[screenName];
  const nt = nightTheme;
  const frameDark = onboard || loggedOut ? true : (isNightScreen ? nt==='dark' : false);

  let content;
  if (overlay) {
    const a = overlay.arg;
    if (overlay.name==='bedprep') content = <ScreenBedPrep t={t} lang={lang} go={go} back={back} session={a} theme={nt} />;
    else if (overlay.name==='bedtime') content = <ScreenBedtime t={t} lang={lang} go={go} back={back} session={a} theme={nt} />;
    else if (overlay.name==='summary') content = <ScreenSummary t={t} lang={lang} go={go} session={a} theme={nt} />;
    else if (overlay.name==='record') content = <ScreenRecord t={t} lang={lang} back={back} day={a} theme={nt} />;
    else if (overlay.name==='product') content = <ScreenProduct t={t} lang={lang} back={back} pid={a} addToCart={addToCart} />;
    else if (overlay.name==='cart') content = <ScreenCart t={t} lang={lang} back={back} cart={cart} setQty={setQty} checkout={checkout} uid={user?.uid} go={go} showToast={showToast} />;
    else if (overlay.name==='orders') content = <ScreenOrders t={t} lang={lang} back={back} uid={user?.uid} />;
    else if (overlay.name==='settings') content = <ScreenSettings t={t} lang={lang} setLang={setLang} back={back} nightTheme={nt} setNightTheme={setNightTheme} />;
    else if (overlay.name==='address') content = <ScreenAddress t={t} lang={lang} back={back} uid={user?.uid} go={go} />;
    else if (overlay.name==='addressForm') content = <ScreenAddressForm t={t} lang={lang} back={()=>go('address')} uid={user?.uid} editing={a} onSaved={()=>go('address')} />;
    else if (overlay.name==='tiers') content = <ScreenTiers t={t} lang={lang} back={back} />;
  } else {
    if (tab==='home') content = <TabHome t={t} lang={lang} go={go} tabbar={tabBarNode} theme={nt} />;
    else if (tab==='report') content = <TabReport t={t} lang={lang} go={go} tabbar={tabBarNode} theme={nt} />;
    else if (tab==='shop') content = <TabShop t={t} lang={lang} go={go} cartCount={cartCount} tabbar={tabBarNode} />;
    else if (tab==='my') content = <TabMy t={t} lang={lang} go={go} tabbar={tabBarNode} onLogout={()=>setUser(null)} />;
  }

  return (
    <IOSDevice dark={frameDark}>
      <div className="screen-host">
        {onboard
          ? <Onboarding t={t} lang={lang} finish={()=>setOnboard(false)} />
          : loggedOut
          ? <ScreenLogin t={t} lang={lang} onLogin={()=>{}} />
          : content}
      </div>
      <div className={'toast'+(toast.show?' show':'')}>{Ico.check({s:18})} <span>{toast.msg}</span></div>
    </IOSDevice>
  );
}
