import React, { useState, useEffect, useRef } from 'react'
import { Ico } from './icons.jsx'
import { SOMNIA_DATA } from './i18n.js'

/* ---- sleep quality tiers ---- */
export function quality(score){ return score>=85 ? 'good' : score>=70 ? 'fair' : 'poor'; }
const RING_GRAD = {
  good:['#C2B0F5','#5b9fd6'], fair:['#8FB8E8','#5b9fd6'], poor:['#E7A6BE','#9D88E8']
};

/* ---- reusable sleep score ring ---- */
export function SleepRing({ score=92, size=200, label, cap, tone='good' }) {
  const r = 86, C = 2 * Math.PI * r;
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.strokeDasharray = C;
    el.style.strokeDashoffset = C;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.strokeDashoffset = C * (1 - score/100);
    }));
  }, [score, tone]);
  return (
    <div className="ring" style={{ width:size, height:size }}>
      <svg width={size} height={size} viewBox="0 0 200 200">
        <defs>
          <linearGradient id="ringg-good" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#C2B0F5"/><stop offset="1" stopColor="#5b9fd6"/></linearGradient>
          <linearGradient id="ringg-fair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8FB8E8"/><stop offset="1" stopColor="#5b9fd6"/></linearGradient>
          <linearGradient id="ringg-poor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#E7A6BE"/><stop offset="1" stopColor="#9D88E8"/></linearGradient>
        </defs>
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="14"/>
        <circle ref={ref} className="ring__c" cx="100" cy="100" r={r} fill="none"
          stroke={`url(#ringg-${tone})`} strokeWidth="14" strokeLinecap="round"/>
      </svg>
      <div className="ring__mid">
        <div className="ring__num">{score}</div>
        {label && <div className="ring__q" style={tone==='poor'?{color:'#E7A6BE'}:null}>{label}</div>}
        {cap && <div className="ring__cap">{cap}</div>}
      </div>
    </div>
  );
}

/* ============== HOME (수면 대시보드) ============== */
export function TabHome({ t, lang, go, tabbar, theme }) {
  const D = SOMNIA_DATA;
  const [demo, setDemo] = useState('good');
  const NIGHTS = {
    good:{ score:92, bed:'23:14', wake:'06:56', dur:['7','42'] },
    poor:{ score:56, bed:'01:38', wake:'06:10', dur:['4','32'] },
  };
  const n = NIGHTS[demo];
  const tone = quality(n.score);
  const dateStr = lang==='ko' ? '6월 15일 목요일' : 'Thursday, Jun 15';
  return (
    <div className={'scr '+(theme||'dark')+' anim-fade'}>
      <div className="hdr">
        <div>
          <div className="hdr__ey">{dateStr}</div>
          <h1>{t('greet')}</h1>
        </div>
        <button className="icon-btn" onClick={()=>go('settings')}>{Ico.cog({s:20})}</button>
      </div>

      <div className="body">
        <div style={{display:'flex',alignItems:'center',gap:10,margin:'2px 2px 12px'}}>
          <span style={{fontSize:10.5,color:'var(--faint)',letterSpacing:'.14em',textTransform:'uppercase',flex:'none'}}>{lang==='ko'?'미리보기':'Preview'}</span>
          <div className="chips" style={{flex:1}}>
            <div className={'chip'+(demo==='good'?' on':'')} onClick={()=>setDemo('good')}>{t('demo_good')}</div>
            <div className={'chip'+(demo==='poor'?' on':'')} onClick={()=>setDemo('poor')}>{t('demo_poor')}</div>
          </div>
        </div>

        <div className="card" style={{textAlign:'center'}}>
          <div className="card-h" style={{justifyContent:'center'}}>
            <h3 style={{letterSpacing:'.14em',textTransform:'uppercase',fontSize:12,color:'var(--dim)'}}>{t('home_ey')}</h3>
          </div>
          <SleepRing score={n.score} tone={tone} label={t('q_'+tone)} cap={t('cap_'+tone)} />
          <div className="statrow">
            <div className="stat"><div className="stat__v">{n.bed}</div><div className="stat__l">{t('s_bed')}</div></div>
            <div className="stat"><div className="stat__v">{n.wake}</div><div className="stat__l">{t('s_wake')}</div></div>
            <div className="stat"><div className="stat__v">{n.dur[0]}<small>h</small> {n.dur[1]}<small>m</small></div><div className="stat__l">{t('s_dur')}</div></div>
          </div>
        </div>

        {tone==='poor' && (
          <div className="card insight" style={{marginTop:14,borderColor:'rgba(231,166,190,.35)'}}>
            <div className="insight__ic" style={{background:'rgba(231,166,190,.18)',color:'#E7A6BE'}}>{Ico.spark({s:20})}</div>
            <p style={{alignSelf:'center'}}>{t('tip_poor')}</p>
          </div>
        )}

        <button className="btn btn--primary" style={{marginTop:16}} onClick={()=>go('bedprep')}>
          {Ico.moon({s:19})} {t('start_track')}
        </button>

        <div className="section-t">{t('reco_t')}</div>
        <div className="card reco" onClick={()=>go('product', demo==='poor'?'spray':'oil')} style={{cursor:'pointer'}}>
          <div className="reco__img"><image-slot id={demo==='poor'?'app-reco-spray':'app-reco-oil'} placeholder="reco"></image-slot></div>
          <div className="reco__t">
            <h4>{demo==='poor'?t('reco_poor_name'):t('reco_name')}</h4>
            <p>{demo==='poor'?t('reco_poor_desc'):t('reco_desc')}</p>
          </div>
          <div style={{color:'var(--lav)'}}>{Ico.next({s:18})}</div>
        </div>

        <div className="section-t" style={{display:'flex',justifyContent:'space-between'}}>
          <span>{t('recent')}</span>
        </div>
        <div className="card" style={{padding:'6px 18px'}}>
          <div className="nlist">
            {D.nights.map(n => (
              <div className="nrow" key={n.d} onClick={()=>go('record', n.d)}>
                <div className="nrow__day"><b>{n.d}</b><span>{n.wk[lang]}</span></div>
                <div className="nrow__bar"><i style={{transform:`scaleX(${n.pct/100})`,background:`linear-gradient(90deg,${RING_GRAD[quality(n.score)][0]},${RING_GRAD[quality(n.score)][1]})`}}></i></div>
                <div className="nrow__sc">{n.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {tabbar}
    </div>
  );
}

/* ============== BEDTIME (live tracking) ============== */
const ECG_PATH = "M0,23 H22 L26,23 L30,8 L34,40 L38,23 L44,23 L48,30 L52,23 H100 L122,23 L126,23 L130,8 L134,40 L138,23 L144,23 L148,30 L152,23 H200";

/* ============== BED PREP (set alarm before tracking) ============== */
function timeUntil(now, ah, am){
  let mins = (ah*60+am) - (now.getHours()*60+now.getMinutes());
  if (mins <= 0) mins += 24*60;
  return { h: Math.floor(mins/60), m: mins%60, total: mins };
}
export function WheelCol({ value, set, max, step=1, pad=true }){
  const fmt = (n)=> pad ? String((n+max)%max).padStart(2,'0') : String((n+max)%max);
  const up = ()=> set((value - step + max) % max);
  const down = ()=> set((value + step) % max);
  return (
    <div className="wheelcol">
      <button className="wheelcol__arw" onClick={up} aria-label="up">{Ico.next({s:18, w:2})}</button>
      <div className="wheelcol__win">
        <span className="wv dim">{fmt(value - step)}</span>
        <span className="wv cur">{fmt(value)}</span>
        <span className="wv dim">{fmt(value + step)}</span>
      </div>
      <button className="wheelcol__arw" onClick={down} aria-label="down">{Ico.next({s:18, w:2})}</button>
    </div>
  );
}
export function ScreenBedPrep({ t, lang, go, back, session, theme }){
  const init = session || {};
  const [ah, setAh] = useState(init.ah != null ? init.ah : 6);
  const [am, setAm] = useState(init.am != null ? init.am : 30);
  const [smart, setSmart] = useState(init.smart != null ? init.smart : true);
  const [snd, setSnd] = useState(init.snd || 'rain');
  const now = new Date();
  const u = timeUntil(now, ah, am);
  const ampm = ah < 12 ? 'AM' : 'PM';
  const presets = [[6,0],[6,30],[7,0],[7,30]];
  const sounds = [['rain',t('snd_rain')],['wave',t('snd_wave')],['white',t('snd_white')],['off',t('snd_off')]];
  return (
    <div className={'scr '+(theme||'dark')+' prep anim-fade'}>
      <div className="bt-top">
        <button className="icon-btn" onClick={back}>{Ico.back({s:20})}</button>
        <button className="icon-btn" style={{visibility:'hidden'}}>{Ico.alarm({s:19})}</button>
      </div>
      <div className="body" style={{paddingTop:6}}>
        <div style={{textAlign:'center'}}>
          <h1 style={{fontSize:25,fontWeight:600}}>{t('prep_title')}</h1>
          <div style={{fontSize:14,color:'var(--dim)',marginTop:6}}>{t('prep_sub')}</div>
        </div>

        <div className="section-t" style={{textAlign:'center'}}>{t('prep_alarm')}</div>
        <div className="card" style={{textAlign:'center'}}>
          <div className="alarmwheel">
            <WheelCol value={ah} set={setAh} max={24} />
            <span className="wheelcolon">:</span>
            <WheelCol value={am} set={setAm} max={60} step={5} />
            <span className="wheelampm">{ampm}</span>
          </div>
          <div className="prep-in">{Ico.moon({s:15})} {t('prep_in_pre')} <b>{u.h}{lang==='ko'?'시간 ':'h '}{u.m}{lang==='ko'?'분':'m'}</b> {t('prep_in_post')}</div>
          <div className="chips" style={{justifyContent:'center',marginTop:14}}>
            {presets.map(([ph,pm])=>{
              const on = ph===ah && pm===am;
              return <div key={ph+'-'+pm} className={'chip'+(on?' on':'')} onClick={()=>{setAh(ph);setAm(pm);}}>{String(ph).padStart(2,'0')}:{String(pm).padStart(2,'0')}</div>;
            })}
          </div>
        </div>

        <div className="toggle" style={{marginTop:16,alignItems:'flex-start'}}>
          <div style={{flex:1,paddingRight:14}}>
            <div style={{fontWeight:600}}>{t('prep_smart')}</div>
            <div style={{fontSize:12.5,color:'var(--dim)',marginTop:4,lineHeight:1.45}}>{t('prep_smart_desc')}</div>
          </div>
          <div className={'sw'+(smart?' on':'')} onClick={()=>setSmart(!smart)}><i></i></div>
        </div>

        <div className="section-t">{t('prep_sound')}</div>
        <div className="chips">
          {sounds.map(([k,lbl])=>(<div key={k} className={'chip'+(snd===k?' on':'')} onClick={()=>setSnd(k)}>{lbl}</div>))}
        </div>

        <div style={{textAlign:'center',fontSize:13,color:'var(--faint)',margin:'26px 0 4px'}}>{t('prep_greet')}</div>
      </div>
      <div className="bt-foot">
        <button className="btn btn--primary" onClick={()=>go('bedtime',{ah,am,smart,snd})}>{Ico.moon({s:18})} {t('prep_start')}</button>
      </div>
    </div>
  );
}

/* ============== BEDTIME (live tracking) ============== */
export function ScreenBedtime({ t, lang, go, back, session, theme }) {
  const init = session || {};
  const [el, setEl] = useState(0);     // elapsed seconds (accelerated)
  const [hr, setHr] = useState(60);    // live heart rate
  const [snd, setSnd] = useState(init.snd || 'rain');
  useEffect(() => {
    const id = setInterval(() => {
      setEl(e => e + 90);               // demo-accelerated: +1.5 min / tick
      setHr(h => Math.max(50, Math.min(70, Math.round(h + (Math.random()*6 - 3)))));
    }, 200);
    return () => clearInterval(id);
  }, []);
  const fmt = (n) => String(n).padStart(2,'0');
  const hh = Math.floor(el/3600), mm = Math.floor(el%3600/60), ss = el%60;
  const now = new Date(); const ampm = now.getHours()<12 ? 'AM':'PM';
  const ah = init.ah != null ? init.ah : 6, am = init.am != null ? init.am : 30;
  const baseRemain = timeUntil(now, ah, am).total * 60; // seconds at mount
  const remain = Math.max(0, baseRemain - el);
  const rh = Math.floor(remain/3600), rm = Math.floor(remain%3600/60);
  const dateStr = lang==='ko' ? '6월 15일 목요일 밤' : 'Thu, Jun 15 · Night';
  const sndLbl = { rain:t('snd_rain'), wave:t('snd_wave'), white:t('snd_white'), off:t('snd_off') }[snd];
  return (
    <div className={'scr '+(theme||'dark')+' bedtime live anim-fade'}>
      <div className="bt-top">
        <button className="icon-btn" onClick={back}>{Ico.back({s:20})}</button>
        <button className="icon-btn" onClick={()=>go('bedprep',{ah,am,smart:init.smart,snd})}>{Ico.alarm({s:19})}</button>
      </div>
      <div className="bt-scroll">
        <div className="bt-status"><i></i>{t('bt_status')}</div>
        <div className="bt-elabel">{t('bt_elapsed')}</div>
        <div className="bt-elapsed">{fmt(hh)}:{fmt(mm)}:{fmt(ss)}</div>
        <div className="bt-now">{fmt(((now.getHours()+11)%12)+1)}:{fmt(now.getMinutes())} {ampm} · {dateStr}</div>
        <div className="bt-moon sm"></div>
        <div className="hrcard">
          <div className="hrcard__head">
            <span className="hrcard__lbl">{t('bt_hr')}</span>
            <span className="bt-linked sm"><i></i>{t('bt_linked')}</span>
          </div>
          <div className="hrcard__top">
            <span className="hrcard__hb">{Ico.heart({s:22})}</span>
            <div className="hrcard__v">{hr} <small>{t('bt_bpm')}</small></div>
          </div>
          <div className="wave">
            <svg viewBox="0 0 200 46" preserveAspectRatio="none">
              <path d={ECG_PATH} fill="none" stroke="#ff8aa8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="bt-until">{Ico.alarm({s:16})} {t('bt_until')} <b>{rh}{lang==='ko'?'시간 ':'h '}{rm}{lang==='ko'?'분':'m'}</b></div>
        {snd!=='off' && <div className="bt-playing">{Ico.moon({s:14})} {sndLbl} · {t('prep_playing')}</div>}
      </div>
      <div className="bt-foot">
        <button className="btn btn--primary" onClick={()=>go('summary',{el,hr})}>{t('bt_stop')}</button>
      </div>
    </div>
  );
}

/* ============== SUMMARY (after tracking) ============== */
export function ScreenSummary({ t, lang, go, session, theme }) {
  const rawEl = session && session.el ? session.el : 0;
  const el = rawEl > 3600 ? rawEl : Math.round(7.4*3600);  // demo floor: keep duration realistic
  const hr = session && session.hr ? session.hr : 58;
  const hh = Math.floor(el/3600), mm = Math.floor(el%3600/60);
  const score = 88, tone = quality(score);
  return (
    <div className={'scr '+(theme||'dark')+' anim-fade'} style={{justifyContent:'flex-start'}}>
      <div className="body" style={{paddingTop:74,textAlign:'center',display:'flex',flexDirection:'column'}}>
        <div className="bt-linked" style={{alignSelf:'center',color:'#8fe6b4'}}><i></i>{t('sum_complete')}</div>
        <h1 style={{fontSize:26,fontWeight:600,marginTop:16}}>{t('sum_title')}</h1>
        <div style={{fontSize:14,color:'var(--dim)',marginTop:6}}>{t('sum_sub')}</div>
        <div style={{display:'flex',justifyContent:'center',marginTop:10}}>
          <SleepRing score={score} tone={tone} label={t('q_'+tone)} cap={t('cap_'+tone)} />
        </div>
        <div className="statrow" style={{marginTop:14}}>
          <div className="stat"><div className="stat__v">{hh}<small>h</small> {mm}<small>m</small></div><div className="stat__l">{t('sum_total')}</div></div>
          <div className="stat"><div className="stat__v">{hr} <small>{t('bt_bpm')}</small></div><div className="stat__l">{t('sum_avghr')}</div></div>
          <div className="stat"><div className="stat__v">90<small>%</small></div><div className="stat__l">{t('m_eff')}</div></div>
        </div>
        <div style={{fontSize:12.5,color:'var(--faint)',marginTop:18,display:'flex',gap:7,alignItems:'center',justifyContent:'center'}}>
          {Ico.check({s:15})} {t('sum_save')}
        </div>
      </div>
      <div className="bt-foot">
        <button className="btn btn--primary" onClick={()=>go('home')}>{t('sum_done')}</button>
      </div>
    </div>
  );
}

/* ============== RECORD detail ============== */
export function ScreenRecord({ t, lang, back, day, theme }) {
  const D = SOMNIA_DATA;
  const night = (D.nights||[]).find(n=>n.d===day);
  const score = night ? night.score : 92;
  const tone = quality(score);
  const dateStr = lang==='ko' ? `6월 ${day||15}일${night?' '+night.wk.ko+'요일':''}` : `Jun ${day||15}`;
  const M = {
    good:{ hr:58, resp:14, move:3, eff:94 },
    fair:{ hr:61, resp:15, move:6, eff:85 },
    poor:{ hr:72, resp:17, move:14, eff:63 },
  }[tone];
  // stage chart: hypnogram-style steps. levels: 0 awake,1 rem,2 light,3 deep
  const colors = ['#e8a0b8','#C2B0F5','#7FA8E8','#4F86C4'];
  const labels = [t('st_awake'),t('st_rem'),t('st_light'),t('st_deep')];
  const SEQ = {
    good:[2,3,3,2,1,2,3,3,2,1,2,2,1,0,1,2,3,2,1,1,2,1,0],
    fair:[2,2,3,2,1,2,2,1,2,0,1,2,2,1,0,2,1,2,1,1,2,0,1],
    poor:[2,1,0,2,1,2,0,1,2,1,0,2,1,2,0,1,1,0,2,1,2,0,1],
  };
  const seq = SEQ[tone];
  const W=320,H=120, seg=W/seq.length, lvH=H/4;
  let path = '';
  seq.forEach((lv,i)=>{ const y=lv*lvH+lvH/2; const x0=i*seg, x1=(i+1)*seg;
    path += (i===0?`M ${x0} ${y}`:` L ${x0} ${y}`) + ` L ${x1} ${y}`; });
  return (
    <div className={'scr '+(theme||'dark')+' anim-push'}>
      <div className="hdr">
        <button className="icon-btn" onClick={back}>{Ico.back({s:20})}</button>
        <div style={{flex:1,marginLeft:6}}>
          <div className="hdr__ey">{dateStr}</div>
          <h1 style={{fontSize:22}}>{t('rec_title')}</h1>
        </div>
      </div>
      <div className="body">
        <div className="card score-card">
          <SleepRing score={score} tone={tone} size={88} />
          <div className="score-card__info">
            <div className="score-card__tier" style={tone==='poor'?{color:'var(--poor-color)'}:null}>{t('q_'+tone)}</div>
            <div className="score-card__num">{score}</div>
            <div className="score-card__delta">{t('cap_'+tone)}</div>
          </div>
        </div>

        <div className="section-t">{t('rec_stages')}</div>
        <div className="card">
          <svg className="stagechart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            {[0,1,2,3].map(i=>(<line key={i} x1="0" x2={W} y1={i*lvH+lvH/2} y2={i*lvH+lvH/2} stroke="rgba(255,255,255,.06)" strokeWidth="1"/>))}
            <path d={path} fill="none" stroke={`url(#ringg-${tone})`} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
          </svg>
          <div className="legend">
            {labels.map((l,i)=>(<span key={i}><i style={{background:colors[i]}}></i>{l}</span>))}
          </div>
        </div>

        <div className="metrics" style={{marginTop:16}}>
          <div className="metric"><div className="metric__l">{t('m_hr')}</div><div className="metric__v">{M.hr} <small>{t('bpm')}</small></div></div>
          <div className="metric"><div className="metric__l">{t('m_resp')}</div><div className="metric__v">{M.resp} <small>{t('rpm')}</small></div></div>
          <div className="metric"><div className="metric__l">{t('m_move')}</div><div className="metric__v">{M.move} <small>{t('times')}</small></div></div>
          <div className="metric"><div className="metric__l">{t('m_eff')}</div><div className="metric__v">{M.eff}<small>%</small></div></div>
        </div>
      </div>
    </div>
  );
}

/* ============== REPORT (weekly) ============== */
function heatColor(s){
  const tn = Math.max(0, Math.min(1, (s-50)/45));
  const lo=[243,217,233], hi=[106,73,196]; // pale pink -> purple
  const c = lo.map((v,i)=>Math.round(v+(hi[i]-v)*tn));
  return { bg:`rgb(${c[0]},${c[1]},${c[2]})`, fg: tn>0.42?'#fff':'#6A4FB8' };
}
export function TabReport({ t, lang, go, tabbar, theme }) {
  const D = SOMNIA_DATA;
  const [seg, setSeg] = useState('week');
  const [sel, setSel] = useState(3);
  const max = 100;
  const days = lang==='ko' ? ['11','12','13','14','15','16','17'] : ['11','12','13','14','15','16','17'];
  const avg = Math.round(D.week.reduce((a,b)=>a+b.score,0)/D.week.length);
  const monthAvg = Math.round(D.monthWeeks.reduce((a,b)=>a+b.score,0)/D.monthWeeks.length);
  const recorded = D.monthDays.filter(s=>s>0);
  const monthBest = Math.max.apply(null, recorded);
  const monthNights = recorded.length;
  // weekly sleep duration line chart
  const WH = D.weekHours||[];
  const durAvg = WH.length ? (WH.reduce((a,b)=>a+b,0)/WH.length) : 0;
  const cw=300, ch=120, yMin=4, yMax=9, pad=8;
  const px=(i)=> pad + i*((cw-2*pad)/(WH.length-1));
  const py=(h)=> ch-pad - ((h-yMin)/(yMax-yMin))*(ch-2*pad);
  const linePts = WH.map((h,i)=>`${px(i).toFixed(1)},${py(h).toFixed(1)}`).join(' ');
  const areaPts = `${pad},${ch-pad} ${linePts} ${(cw-pad)},${ch-pad}`;
  const avgY = py(durAvg);
  return (
    <div className={'scr '+(theme||'dark')+' anim-fade'}>
      <div className="hdr">
        <div><div className="hdr__ey">{lang==='ko'?'6월 둘째 주':'Jun · Week 2'}</div><h1>{t('rep_title')}</h1></div>
        <button className="icon-btn">{Ico.bell({s:19})}</button>
      </div>
      <div className="body">
        <div className="seg" style={{marginBottom:16}}>
          <button className={seg==='week'?'on':''} onClick={()=>setSeg('week')}>{t('seg_week')}</button>
          <button className={seg==='month'?'on':''} onClick={()=>setSeg('month')}>{t('seg_month')}</button>
        </div>

        {seg==='week' && (<>
        <div className="weekstrip">
          {D.week.map((d,i)=>(
            <div key={i} className={'wday'+(sel===i?' on':'')} onClick={()=>{ setSel(i); go('record', days[i]); }}>
              <span>{d.wk[lang]}</span><b>{days[i]}</b><em></em>
            </div>
          ))}
        </div>

        <div className="card" style={{marginTop:10,textAlign:'center'}}>
          <div style={{fontSize:12,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--dim)'}}>{t('rep_avg')}</div>
          <div style={{fontSize:54,fontWeight:700,lineHeight:1.05,marginTop:6}}>{avg}</div>
          <div style={{fontSize:13,color:'var(--lav)',fontWeight:600}}>{t('score_q')}</div>
        </div>

        <div className="section-t">{t('rep_scores')}</div>
        <div className="card">
          <div className="barchart">
            {D.week.map((d,i)=>(
              <div className="col" key={i} onClick={()=>{ setSel(i); go('record', days[i]); }} style={{cursor:'pointer'}}>
                <div className="bar" style={{height:`${d.score/max*100}%`,opacity:sel===i?1:.55}}></div>
                <div className="bl">{d.wk[lang]}</div>
              </div>
            ))}
          </div>
        </div>
        </>)}

        {seg==='month' && (<>
        <div className="card" style={{marginTop:10,textAlign:'center'}}>
          <div style={{fontSize:12,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--dim)'}}>{t('rep_month_avg')}</div>
          <div style={{fontSize:54,fontWeight:700,lineHeight:1.05,marginTop:6}}>{monthAvg}</div>
          <div style={{fontSize:13,color:'var(--lav)',fontWeight:600}}>{t('score_q')}</div>
          <div style={{display:'flex',gap:10,marginTop:16}}>
            <div className="stat"><div className="stat__v">{monthBest}</div><div className="stat__l">{t('rep_best')}</div></div>
            <div className="stat"><div className="stat__v">{monthNights}<small> {t('rep_days')}</small></div><div className="stat__l">{t('rep_nights')}</div></div>
          </div>
        </div>

        <div className="section-t">{t('rep_month_trend')}</div>
        <div className="card">
          <div className="barchart">
            {D.monthWeeks.map((d,i)=>(
              <div className="col" key={i}>
                <div className="bar" style={{height:`${d.score/max*100}%`}}></div>
                <div className="bl">{d.wk[lang]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-t">{lang==='ko'?'6월 수면 캘린더':'June Calendar'}</div>
        <div className="card">
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:7}}>
            {D.monthDays.map((s,i)=>{
              const hc = s===0 ? null : heatColor(s);
              return (
              <div key={i} style={{aspectRatio:'1',borderRadius:9,
                background: s===0 ? 'var(--surface2)' : hc.bg,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,
                color: s===0?'var(--faint)':hc.fg,fontWeight:600}}>{s===0?'·':s}</div>
              );
            })}
          </div>
          <div className="legend" style={{marginTop:12,justifyContent:'flex-end'}}>
            <span style={{fontSize:11}}>{lang==='ko'?'낮음':'Low'}</span>
            <span style={{flex:'none',width:60,height:8,borderRadius:99,background:'linear-gradient(90deg,#F3D9E9,#6A49C4)'}}></span>
            <span style={{fontSize:11}}>{lang==='ko'?'높음':'High'}</span>
          </div>
        </div>
        </>)}

        <div className="section-t">{t('rep_duration')}</div>
        <div className="card">
          <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:8}}>
            <span style={{fontSize:30,fontWeight:700,letterSpacing:'-.01em'}}>{durAvg.toFixed(1)}<small style={{fontSize:15,fontWeight:600,color:'var(--dim)'}}> {t('rep_hr_unit')}</small></span>
            <span style={{fontSize:12,color:'var(--lav)',fontWeight:600}}>{t('rep_dur_avg')}</span>
          </div>
          <svg viewBox={`0 0 ${cw} ${ch}`} style={{width:'100%',height:120,display:'block',overflow:'visible'}}>
            <defs>
              <linearGradient id="durarea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#D98CC0" stopOpacity="0.34"/>
                <stop offset="1" stopColor="#9D7BD6" stopOpacity="0.02"/>
              </linearGradient>
              <linearGradient id="durline" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#E59CC4"/><stop offset="1" stopColor="#8C6FD8"/>
              </linearGradient>
            </defs>
            <line x1={pad} x2={cw-pad} y1={avgY} y2={avgY} stroke="var(--lav)" strokeWidth="1" strokeDasharray="3 4" opacity=".55"/>
            <polygon points={areaPts} fill="url(#durarea)"/>
            <polyline points={linePts} fill="none" stroke="url(#durline)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            {WH.map((h,i)=>(<circle key={i} cx={px(i)} cy={py(h)} r="3.2" fill="#fff" stroke="#9D7BD6" strokeWidth="2"/>))}
          </svg>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
            {D.week.map((d,i)=>(<span key={i} style={{flex:1,textAlign:'center',fontSize:10,color:'var(--faint)'}}>{d.wk[lang]}</span>))}
          </div>
        </div>
      </div>
      {tabbar}
    </div>
  );
}

