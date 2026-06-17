/* SOMNIA Brochure Studio — canvas renderer (preview === export)
   2-fold, 4-panel brochure. 307×220mm spread / 153.5×220mm panel, 3mm bleed.
   12 px/mm ≈ 305 dpi. */
(function(){
  'use strict';

  // ---- geometry ----
  const PXMM = 12;
  const TW = 153.5*PXMM|0;   // 1842  trim width (panel)
  const TH = 220*PXMM;       // 2640  trim height
  const BLEED = 3*PXMM;      // 36
  const SAFE = 5*PXMM;       // 60
  const CM = 150;            // content margin from trim edge
  const PW1 = TW+BLEED*2;    // 1914 single-panel canvas width
  const PH1 = TH+BLEED*2;    // 2712 single-panel canvas height
  const SPW = (TW+BLEED)*2;  // 3756 spread width
  const FOLD = TW+BLEED;     // 1878 fold x within spread

  // ---- palette (CMYK-mapped guideline colors) ----
  const COL = { navy:'#0E1A3A', ocean:'#1958B2', lav:'#B8A7E6', mist:'#D0E6FA', ivory:'#F6F2EA', white:'#FFFFFF', plum:'#4B2E83' };
  const COLORS = [['Navy',COL.navy],['Ocean',COL.ocean],['Plum',COL.plum],['Lavender',COL.lav],['Mist',COL.mist],['Ivory',COL.ivory],['White',COL.white]];

  // ---- state ----
  const DEF = {
    view:'P02', logoOn:true, guides:true,
    P02:{ bg:COL.ocean, slogan:'SLEEP DEEPER, LIVE BETTER', kr:'더 깊은 잠, 더 나은 삶',
          body:'좋은 삶은 충분한 회복에서 시작됩니다.',
          el:{ logo:{dx:0,dy:0,size:820,on:true},
               slogan:{dx:0,dy:0,size:104,track:6,weight:600,color:COL.white,on:true},
               divider:{dx:0,dy:94,width:240,thick:3,color:COL.mist,on:true},
               kr:{dx:0,dy:0,size:46,track:0,weight:400,color:COL.mist,on:true},
               body:{dx:0,dy:0,size:42,track:0,weight:300,color:COL.mist,on:true} } },
    P01:{ bg:COL.navy, head:'앱 다운로드', sub:'App Store · Google Play',
          c1:'somnia.co.kr', c2:'@somnia.sleep', c3:'hello@somnia.co.kr', qrLabel:'App Download',
          el:{ logo:{dx:0,dy:0,size:740,on:true},
               head:{dx:0,dy:0,size:78,track:0,weight:600,color:COL.white,on:true},
               sub:{dx:0,dy:0,size:30,track:4,weight:500,color:COL.lav,on:true},
               qr:{dx:0,dy:0,size:300,on:true},
               qrLabel:{dx:0,dy:0,size:26,track:4,weight:500,color:COL.mist,on:true},
               contact:{dx:0,dy:0,size:38,gap:58,weight:400,color:COL.lav,on:true} } },
    P03:{ bg:COL.ivory, symOn:true, align:'left', symCaption:'감은 눈, 잔잔한 수면\n물과 깊은 잠을 함께 담은 브랜드 심볼',
          eyebrow:'SLEEP WELLNESS', head:'좋은 삶은\n충분한 회복에서\n시작됩니다',
          sub:'브랜드 철학 — 회복으로 시작하는 하루',
          body:'썸니아는 잠을 단순한 휴식이 아니라\n삶을 회복시키는 시간으로 봅니다.\n\n수면 데이터와 검증된 루틴으로\n당신의 밤을 더 깊고 고요하게 설계합니다.',
          pills:'Recovery · Ritual · Balance', headSize:96,
          areas:[{id:'P03_a0',dx:0,dy:0,w:0,h:0,zoom:1,ox:0,oy:0,shape:'rounded',fill:'none',opacity:1,feather:0,on:true}],
          el:{ eyebrow:{weight:600,color:COL.ocean,on:true},
               head:{weight:600,color:COL.navy,on:true},
               sub:{weight:500,color:COL.navy,on:true},
               body:{weight:300,color:COL.navy,on:true},
               pills:{weight:600,color:COL.navy,on:true},
               symbol:{dx:0,dy:0,size:140,color:COL.ocean,on:true},
               caption:{dx:0,dy:185,size:34,weight:500,track:2,leading:46,color:COL.navy,align:'center',on:true} } },
    P04:{ bg:COL.white, eyebrow:'SERVICE & PRODUCTS', head:'App + Products',
          sub:'기록하고, 회복하고, 잠드는 하나의 흐름',
          col1Title:'APP SERVICE', col1:'수면 기록 · 분석\n맞춤 슬립 루틴\n슬립 인사이트',
          col2Title:'PRODUCTS', col2:'멜라토닌 드림 젤리\n라벤더 아로마 오일\n슬립 웰 룸 스프레이',
          cta:'App 무료 다운로드',
          areas:[{id:'P04_a0',dx:0,dy:0,w:0,h:0,zoom:1,ox:0,oy:0,shape:'rounded',fill:'none',opacity:1,feather:0,on:true}],
          el:{ eyebrow:{weight:600,track:5,color:COL.ocean,on:true},
               head:{weight:600,track:0,color:COL.navy,on:true},
               sub:{weight:400,track:0,color:COL.navy,on:true},
               col1Title:{weight:600,track:3,color:COL.ocean,on:true},
               col1:{weight:400,track:0,color:COL.navy,on:true},
               col2Title:{weight:600,track:3,color:COL.ocean,on:true},
               col2:{weight:400,track:0,color:COL.navy,on:true},
               cta:{weight:600,track:0,color:COL.white,on:true} } },
  };
  let S = JSON.parse(JSON.stringify(DEF));
  try{ const sv=localStorage.getItem('somnia_brochure'); if(sv) S=Object.assign(S,JSON.parse(sv)); }catch(e){}
  // normalize: rebuild per-element maps merging saved over defaults; migrate old keys & image→areas
  function norm(){
    ['P01','P02','P03','P04'].forEach(p=>{
      const saved=S[p]||{}, savedEl=saved.el||{}, savedAreas=Array.isArray(saved.areas)?saved.areas:null;
      S[p]=Object.assign({}, DEF[p], saved);
      S[p].el={};
      for(const k in DEF[p].el){ S[p].el[k]=Object.assign({}, DEF[p].el[k], savedEl[k]||{}); }
      if(DEF[p].areas){
        let a = savedAreas || (savedEl.image ? [savedEl.image] : null) || DEF[p].areas;
        S[p].areas = a.map((it,i)=>Object.assign({id:p+'_a'+i,dx:0,dy:0,w:0,h:0,zoom:1,ox:0,oy:0,shape:'rounded',fill:'none',opacity:1,feather:0,on:true}, it));
      }
    });
    if(S.P02 && typeof S.P02.sloganSize==='number'){ S.P02.el.slogan.size=S.P02.sloganSize; delete S.P02.sloganSize; }
  }
  norm();
  function save(){ try{ localStorage.setItem('somnia_brochure', JSON.stringify(S)); }catch(e){} }

  // ---- assets ----
  let logoFullW=null, logoFullN=null, wordW=null, wordN=null, symW=null, ready=false;
  const imgs={P01:null,P02:null,qr:null};   // backgrounds + qr
  const areaImgs={};                          // per image-area id -> HTMLImageElement
  function load(src){ return new Promise((res,rej)=>{ const i=new Image(); i.crossOrigin='anonymous';
    i.onload=()=>res(i); i.onerror=rej; i.src=src; }); }
  function tint(img,color){ const c=document.createElement('canvas'); c.width=img.width; c.height=img.height;
    const x=c.getContext('2d'); x.drawImage(img,0,0); x.globalCompositeOperation='source-in';
    x.fillStyle=color; x.fillRect(0,0,c.width,c.height); return c; }

  // ---- helpers ----
  function hex2rgb(h){ h=h.replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join('');
    return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; }
  function hexA(h,a){ if(!h) h=COL.navy; if(h.startsWith('rgb')) return h; const [r,g,b]=hex2rgb(h); return `rgba(${r},${g},${b},${a})`; }
  function rr(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
  function caps(ctx,text,cx,y,size,color,sp,weight){
    ctx.font=`${weight||500} ${size}px Outfit, Arial, sans-serif`;
    ctx.fillStyle=color; ctx.textBaseline='middle'; ctx.textAlign='left';
    const ch=[...text], w=ch.map(c=>ctx.measureText(c).width);
    const total=w.reduce((a,b)=>a+b,0)+sp*(ch.length-1);
    let x=cx-total/2; for(let i=0;i<ch.length;i++){ ctx.fillText(ch[i],x,y); x+=w[i]+sp; }
    return total;
  }
  // letter-spaced single line with explicit alignment around anchor x
  function capsAlign(ctx,text,ax,y,size,color,sp,weight,align){
    ctx.font=`${weight||500} ${size}px Outfit, Arial, sans-serif`;
    ctx.fillStyle=color; ctx.textBaseline='middle'; ctx.textAlign='left';
    const ch=[...text], w=ch.map(c=>ctx.measureText(c).width);
    const total=w.reduce((a,b)=>a+b,0)+sp*(ch.length-1);
    let x = align==='center' ? ax-total/2 : align==='right' ? ax-total : ax;
    for(let i=0;i<ch.length;i++){ ctx.fillText(ch[i],x,y); x+=w[i]+sp; }
    return total;
  }
  // letter-spaced line with baseline + alignment control
  function track(ctx,text,x,y,size,color,sp,weight,align,baseline){
    ctx.font=`${weight||500} ${size}px Outfit, Arial, sans-serif`;
    ctx.fillStyle=color; ctx.textBaseline=baseline||'alphabetic'; ctx.textAlign='left';
    const ch=[...text], w=ch.map(c=>ctx.measureText(c).width);
    const total=w.reduce((a,b)=>a+b,0)+(sp||0)*(ch.length-1);
    let sx = align==='center' ? x-total/2 : align==='right' ? x-total : x;
    for(let i=0;i<ch.length;i++){ ctx.fillText(ch[i],sx,y); sx+=w[i]+(sp||0); }
    return total;
  }
  function cover(ctx,img,dx,dy,dw,dh,oy){
    const ir=img.width/img.height, r=dw/dh; let sw,sh,sx,sy;
    if(ir>r){ sh=img.height; sw=sh*r; sx=(img.width-sw)/2; sy=0; }
    else { sw=img.width; sh=sw/r; sx=0; sy=(img.height-sh)/2; }
    sy=Math.max(0,Math.min(img.height-sh, sy+(oy||0)));
    ctx.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);
  }
  // cover with reframe: zoom (>=1) + pan (-1..1) selects the visible crop
  function coverFrame(o,img,w,h,zoom,panx,pany){
    const ir=img.width/img.height, r=w/h;
    const base = ir>r ? h/img.height : w/img.width;
    const s=base*(zoom||1), dw=img.width*s, dh=img.height*s;
    const freeX=dw-w, freeY=dh-h;
    const dx=-(freeX/2)*(1+(panx||0)), dy=-(freeY/2)*(1+(pany||0));
    o.drawImage(img,dx,dy,dw,dh);
  }
  function feather(img,dw,dh){
    const t=document.createElement('canvas'); t.width=dw; t.height=dh; const x=t.getContext('2d');
    cover(x,img,0,0,dw,dh,0);
    x.globalCompositeOperation='destination-out';
    let g=x.createLinearGradient(0,0,0,dh*0.16); g.addColorStop(0,'#000'); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g; x.fillRect(0,0,dw,dh*0.16);
    g=x.createLinearGradient(0,dh,0,dh*0.84); g.addColorStop(0,'#000'); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g; x.fillRect(0,dh*0.84,dw,dh*0.16);
    g=x.createLinearGradient(0,0,dw*0.12,0); g.addColorStop(0,'#000'); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g; x.fillRect(0,0,dw*0.12,dh);
    g=x.createLinearGradient(dw,0,dw*0.88,0); g.addColorStop(0,'#000'); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g; x.fillRect(dw*0.88,0,dw*0.12,dh);
    x.globalCompositeOperation='source-over'; return t;
  }
  // shape path for image areas
  function shapePath(ctx,shape,x,y,w,h){
    ctx.beginPath();
    if(shape==='circle'){ ctx.ellipse(x+w/2,y+h/2,Math.max(1,w/2),Math.max(1,h/2),0,0,Math.PI*2); }
    else if(shape==='rect'){ ctx.rect(x,y,w,h); }
    else { const r=Math.max(0,Math.min(28,w/2,h/2)); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); }
    ctx.closePath();
  }
  // one image area: shape clip + opacity + feathered edge
  function drawArea(ctx,area,x,y,w,h,img,accent,label){
    if(w<2||h<2) return;
    const shape=area.shape||'rounded', op=(area.opacity==null?1:area.opacity);
    let f=Math.max(0,area.feather||0); f=Math.min(f, Math.min(w,h)/2-1); if(f<0) f=0;
    const fill=(area.fill&&area.fill!=='none')?area.fill:null;
    const cw=Math.ceil(w), chh=Math.ceil(h);
    // soft mask helper (shape + feather)
    const makeMask=()=>{ const m=document.createElement('canvas'); m.width=cw; m.height=chh; const mc=m.getContext('2d');
      mc.fillStyle='#fff'; if(f>0) mc.filter='blur('+f+'px)'; shapePath(mc,shape,f,f,w-2*f,h-2*f); mc.fill(); mc.filter='none'; return m; };
    if(fill){
      const off=document.createElement('canvas'); off.width=cw; off.height=chh; const o=off.getContext('2d');
      o.fillStyle=fill; o.fillRect(0,0,cw,chh);
      if(img) coverFrame(o,img,w,h,area.zoom,area.ox,area.oy);   // image over fill if present
      o.globalCompositeOperation='destination-in'; o.drawImage(makeMask(),0,0); o.globalCompositeOperation='source-over';
      ctx.save(); ctx.globalAlpha=op; ctx.drawImage(off,x,y); ctx.restore();
    } else if(img){
      const off=document.createElement('canvas'); off.width=cw; off.height=chh; const o=off.getContext('2d');
      coverFrame(o,img,w,h,area.zoom,area.ox,area.oy);
      o.globalCompositeOperation='destination-in'; o.drawImage(makeMask(),0,0); o.globalCompositeOperation='source-over';
      ctx.save(); ctx.globalAlpha=op; ctx.drawImage(off,x,y); ctx.restore();
    } else {
      ctx.save(); ctx.globalAlpha=op;
      ctx.fillStyle=hexA(accent,0.06); shapePath(ctx,shape,x,y,w,h); ctx.fill();
      ctx.strokeStyle=hexA(accent,0.32); ctx.lineWidth=2.5; ctx.setLineDash([16,12]); shapePath(ctx,shape,x,y,w,h); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle=hexA(accent,0.5); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font='500 30px Outfit, sans-serif';
      ctx.fillText(label||'이미지 영역',x+w/2,y+h/2); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      ctx.restore();
    }
  }
  // word-wrap with explicit \n + Korean keep-all by spaces
  function lines(ctx,text,maxW,font){ ctx.font=font; const out=[];
    text.split('\n').forEach(par=>{
      if(par===''){ out.push(''); return; }
      const words=par.split(' '); let cur='';
      words.forEach(w=>{ const t=cur?cur+' '+w:w;
        if(ctx.measureText(t).width>maxW && cur){ out.push(cur); cur=w; } else cur=t; });
      if(cur) out.push(cur);
    }); return out;
  }
  function para(ctx,text,x,y,maxW,font,color,lh,align){
    ctx.font=font; ctx.fillStyle=color; ctx.textAlign=align||'left'; ctx.textBaseline='alphabetic';
    const ls=lines(ctx,text,maxW,font); ls.forEach((l,i)=>ctx.fillText(l,x,y+i*lh)); return y+ls.length*lh;
  }
  const vis=(o)=> o && o.on!==false;

  // ================= PANELS =================
  function bgFill(ctx,color,fx,fw){ ctx.fillStyle=color; ctx.fillRect(fx,0,fw,PH1); }

  // P02 FRONT COVER
  function P02(ctx,ox,fx,fw){
    bgFill(ctx,S.P02.bg,fx,fw);
    if(imgs.P02){ ctx.globalAlpha=0.5; ctx.drawImage(feather(imgs.P02,fw,PH1),fx,0); ctx.globalAlpha=1;
      ctx.fillStyle=hexA(S.P02.bg,0.45); ctx.fillRect(fx,0,fw,PH1); }
    const cx=ox+TW/2, E=S.P02.el;
    if(S.logoOn && vis(E.logo) && wordW){ const lw=E.logo.size, lh=lw*(wordW.height/wordW.width);
      ctx.drawImage(wordW, cx-lw/2+E.logo.dx, BLEED+TH*0.20+E.logo.dy, lw, lh); }
    const slX=cx+E.slogan.dx, slY=BLEED+TH*0.50+E.slogan.dy;
    if(vis(E.slogan)) caps(ctx,S.P02.slogan,slX,slY,E.slogan.size,E.slogan.color,E.slogan.track,E.slogan.weight);
    if(vis(E.divider)){ const D=E.divider, dX=cx+D.dx, dY=BLEED+TH*0.50+D.dy;
      ctx.strokeStyle=hexA(D.color,0.7); ctx.lineWidth=D.thick;
      ctx.beginPath(); ctx.moveTo(dX-D.width/2,dY); ctx.lineTo(dX+D.width/2,dY); ctx.stroke(); }
    if(vis(E.kr)) caps(ctx,S.P02.kr,cx+E.kr.dx,BLEED+TH*0.58+E.kr.dy,E.kr.size,E.kr.color,E.kr.track,E.kr.weight);
    if(vis(E.body)) caps(ctx,S.P02.body,cx+E.body.dx,BLEED+TH*0.84+E.body.dy,E.body.size,hexA(E.body.color,0.92),E.body.track,E.body.weight);
  }

  // P01 BACK COVER
  function P01(ctx,ox,fx,fw){
    bgFill(ctx,S.P01.bg,fx,fw);
    if(imgs.P01){ ctx.globalAlpha=0.4; ctx.drawImage(feather(imgs.P01,fw,PH1),fx,0); ctx.globalAlpha=1;
      ctx.fillStyle=hexA(S.P01.bg,0.5); ctx.fillRect(fx,0,fw,PH1); }
    const cx=ox+TW/2, E=S.P01.el;
    if(S.logoOn && vis(E.logo) && logoFullW){ const lw=E.logo.size, lh=lw*(logoFullW.height/logoFullW.width); ctx.drawImage(logoFullW, cx-lw/2+E.logo.dx, BLEED+TH*0.13+E.logo.dy, lw, lh); }
    if(vis(E.head)) caps(ctx,S.P01.head,cx+E.head.dx,BLEED+TH*0.30+E.head.dy,E.head.size,E.head.color,E.head.track,E.head.weight);
    if(vis(E.sub)) caps(ctx,S.P01.sub,cx+E.sub.dx,BLEED+TH*0.345+E.sub.dy,E.sub.size,hexA(E.sub.color,0.95),E.sub.track,E.sub.weight);
    const q=E.qr.size, qx=cx-q/2+E.qr.dx, qy=BLEED+TH*0.44+E.qr.dy;
    if(vis(E.qr)){
      if(imgs.qr){ ctx.fillStyle='#fff'; rr(ctx,qx-18,qy-18,q+36,q+36,24); ctx.fill();
        ctx.save(); rr(ctx,qx,qy,q,q,8); ctx.clip(); cover(ctx,imgs.qr,qx,qy,q,q,0); ctx.restore(); }
      else {
        ctx.fillStyle='#fff'; rr(ctx,qx,qy,q,q,24); ctx.fill();
        ctx.fillStyle=COL.navy; const fs=66, m=30;
        [[qx+m,qy+m],[qx+q-m-fs,qy+m],[qx+m,qy+q-m-fs]].forEach(([x,y])=>{
          rr(ctx,x,y,fs,fs,12); ctx.fill(); ctx.save(); ctx.globalCompositeOperation='destination-out';
          rr(ctx,x+16,y+16,fs-32,fs-32,5); ctx.fill(); ctx.restore(); });
        ctx.fillStyle=hexA(COL.navy,0.85); for(let i=0;i<7;i++)for(let j=0;j<7;j++){ if(Math.random()>0.55 && !((i<2&&j<2)||(i>4&&j<2)||(i<2&&j>4))){
          ctx.fillRect(qx+m+fs+24+i*18, qy+m+fs+24+j*18, 13,13); } }
      }
    }
    if(vis(E.qrLabel)) caps(ctx,S.P01.qrLabel,cx+E.qrLabel.dx,qy+q+58+E.qrLabel.dy,E.qrLabel.size,hexA(E.qrLabel.color,0.8),E.qrLabel.track,E.qrLabel.weight);
    if(vis(E.contact)){ ctx.font=`${E.contact.weight} ${E.contact.size}px Outfit, sans-serif`; ctx.fillStyle=E.contact.color; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
      const by=BLEED+TH*0.84+E.contact.dy, ccx=cx+E.contact.dx;
      [S.P01.c1,S.P01.c2,S.P01.c3].forEach((l,i)=>ctx.fillText(l,ccx,by+i*E.contact.gap)); }
  }

  // P03 INSIDE LEFT — philosophy
  function P03(ctx,ox,fx,fw){
    bgFill(ctx,S.P03.bg,fx,fw);
    const L=ox+CM, R=ox+TW-CM, cw=R-L, E=S.P03.el;
    const AL=S.P03.align||'left', ax = AL==='center' ? (L+R)/2 : AL==='right' ? R : L;
    let y=BLEED+TH*0.10;
    // eyebrow
    if(vis(E.eyebrow)){ ctx.font=`${E.eyebrow.weight} 28px Outfit, sans-serif`; ctx.fillStyle=E.eyebrow.color; ctx.textAlign='left'; ctx.textBaseline='middle';
      const ch=[...S.P03.eyebrow], w=ch.map(c=>ctx.measureText(c).width), total=w.reduce((a,b)=>a+b,0)+5*(ch.length-1);
      let x = AL==='center'?ax-total/2:AL==='right'?ax-total:ax;
      for(let i=0;i<ch.length;i++){ ctx.fillText(ch[i],x,y); x+=w[i]+5; } ctx.textBaseline='alphabetic'; }
    // headline
    y+=124; ctx.font=`${E.head.weight} ${S.P03.headSize}px Outfit, sans-serif`; ctx.textAlign=AL;
    const hls=S.P03.head.split('\n');
    if(vis(E.head)){ ctx.fillStyle=E.head.color; hls.forEach((l,i)=>ctx.fillText(l,ax,y+i*S.P03.headSize*1.18)); }
    y+=hls.length*S.P03.headSize*1.18+24;
    // sub
    if(vis(E.sub)){ ctx.font=`${E.sub.weight} 40px Outfit, sans-serif`; ctx.fillStyle=hexA(E.sub.color,0.85); ctx.textAlign=AL; ctx.fillText(S.P03.sub,ax,y); }
    y+=70; ctx.textAlign='left';
    // body
    if(vis(E.body)){ y=para(ctx,S.P03.body,ax,y,cw,`${E.body.weight} 34px Outfit, sans-serif`,hexA(E.body.color,0.66),50,AL)+30; }
    else { const ls=lines(ctx,S.P03.body,cw,`${E.body.weight} 34px Outfit, sans-serif`); y=y+ls.length*50+30; }
    // pills
    const pills=S.P03.pills.split('·').map(s=>s.trim()).filter(Boolean);
    const ph=68; ctx.font=`${E.pills.weight} 30px Outfit, sans-serif`;
    const pwid=pills.map(p=>ctx.measureText(p).width+56), ptot=pwid.reduce((a,b)=>a+b,0)+20*(pills.length-1);
    if(vis(E.pills)){ let px = AL==='center'?ax-ptot/2:AL==='right'?ax-ptot:ax;
      pills.forEach((p,i)=>{ const pw=pwid[i];
        ctx.strokeStyle=COL.ocean; ctx.lineWidth=2.5; rr(ctx,px,y,pw,ph,ph/2); ctx.stroke();
        ctx.fillStyle=E.pills.color; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(p,px+pw/2,y+ph/2);
        ctx.textAlign='left'; ctx.textBaseline='alphabetic'; px+=pw+20; }); }
    // image areas
    const aY=BLEED+TH*0.64, aH=TH*0.30;
    S.P03.areas.forEach(a=>{ if(a.on===false) return; drawArea(ctx,a,L+a.dx,aY+a.dy,cw+a.w,aH+a.h,areaImgs[a.id],COL.ocean,'이미지 영역 — 수면 분위기 컷'); });
    // brand symbol section — closed eye + calm water
    if(S.P03.symOn!==false && symW){
      const SY=E.symbol, CAP=E.caption, baseY=BLEED+TH*0.52;
      if(vis(SY)){ const sw=SY.size, sh=SY.size*(symW.height/symW.width); ctx.drawImage(tint(symW,SY.color), ox+TW/2+SY.dx-sw/2, baseY+SY.dy, sw, sh); }
      if(vis(CAP)){ const capX=ox+TW/2+CAP.dx, capY=baseY+CAP.dy;
        (S.P03.symCaption||'').split('\n').forEach((ln,i)=>{ if(ln!=='') capsAlign(ctx,ln,capX,capY+i*CAP.leading,CAP.size,CAP.color,CAP.track,CAP.weight,CAP.align||'center'); }); }
    }
  }

  // P04 INSIDE RIGHT — service/products
  function P04(ctx,ox,fx,fw){
    bgFill(ctx,S.P04.bg,fx,fw);
    const L=ox+CM, R=ox+TW-CM, cw=R-L, E=S.P04.el;
    let y=BLEED+TH*0.10;
    if(vis(E.eyebrow)) track(ctx,S.P04.eyebrow,L,y,28,E.eyebrow.color,E.eyebrow.track,E.eyebrow.weight,'left','middle');
    y+=122;
    if(vis(E.head)) track(ctx,S.P04.head,L,y,88,E.head.color,E.head.track,E.head.weight,'left','alphabetic');
    y+=58;
    if(vis(E.sub)) track(ctx,S.P04.sub,L,y,38,hexA(E.sub.color,0.7),E.sub.track,E.sub.weight,'left','alphabetic');
    y+=90;
    function colGroup(x,title,body,tEl,bEl){
      if(vis(tEl)) track(ctx,title,x,y,30,tEl.color,tEl.track,tEl.weight,'left','middle');
      ctx.strokeStyle=hexA(COL.lav,0.8); ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x,y+34); ctx.lineTo(x+cw/2-30,y+34); ctx.stroke();
      let yy=y+92;
      if(vis(bEl)) body.split('\n').filter(Boolean).forEach(l=>{ ctx.fillStyle=COL.lav; ctx.beginPath(); ctx.arc(x+7,yy-12,6,0,Math.PI*2); ctx.fill();
        track(ctx,l,x+34,yy,36,hexA(bEl.color,0.85),bEl.track,bEl.weight,'left','alphabetic'); yy+=64; });
    }
    colGroup(L,S.P04.col1Title,S.P04.col1,E.col1Title,E.col1);
    colGroup(L+cw/2+10,S.P04.col2Title,S.P04.col2,E.col2Title,E.col2);
    // image areas
    const aY=BLEED+TH*0.62, aH=TH*0.20;
    S.P04.areas.forEach(a=>{ if(a.on===false) return; drawArea(ctx,a,L+a.dx,aY+a.dy,cw+a.w,aH+a.h,areaImgs[a.id],COL.navy,'이미지 영역 — 제품 컷'); });
    // CTA pill
    if(vis(E.cta)){ const cH=110, cyy=BLEED+TH*0.88; ctx.font=`${E.cta.weight} 42px Outfit, Arial, sans-serif`;
      const pw=ctx.measureText(S.P04.cta).width+200, cxp=L;
      ctx.fillStyle=COL.ocean; rr(ctx,cxp,cyy,pw,cH,cH/2); ctx.fill();
      track(ctx,S.P04.cta,cxp+pw/2,cyy+cH/2,42,E.cta.color,E.cta.track,E.cta.weight,'center','middle'); }
  }

  const PANEL={P01,P02,P03,P04};

  // ---- guides overlay (screen only) ----
  function guides(ctx){
    ctx.save(); ctx.lineWidth=2;
    ctx.strokeStyle='rgba(255,80,80,0.55)'; ctx.setLineDash([18,12]); ctx.strokeRect(BLEED,BLEED,TW,TH);
    ctx.strokeStyle='rgba(80,160,255,0.5)'; ctx.strokeRect(BLEED+SAFE,BLEED+SAFE,TW-SAFE*2,TH-SAFE*2);
    ctx.setLineDash([]); ctx.restore();
  }

  // ---- render preview ----
  function render(){
    if(!ready) return;
    const cv=document.getElementById('art'); cv.width=PW1; cv.height=PH1;
    const ctx=cv.getContext('2d'); ctx.clearRect(0,0,PW1,PH1);
    PANEL[S.view](ctx,BLEED,0,PW1);
    if(S.guides) guides(ctx);
    document.querySelectorAll('.viewbtn').forEach(b=>b.classList.toggle('on',b.dataset.v===S.view));
  }

  // ---- export (same render path -> hidden elements/areas are excluded) ----
  function dlCanvas(cv,name){ cv.toBlob(b=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; a.click(); },'image/png'); }
  function exportPanel(p){ const cv=document.createElement('canvas'); cv.width=PW1; cv.height=PH1;
    PANEL[p](cv.getContext('2d'),BLEED,0,PW1); dlCanvas(cv,`somnia-brochure-${p}-${PW1}x${PH1}.png`); }
  function exportSpread(side){
    const cv=document.createElement('canvas'); cv.width=SPW; cv.height=PH1; const ctx=cv.getContext('2d');
    const pair = side==='outside' ? ['P01','P02'] : ['P03','P04'];
    PANEL[pair[0]](ctx,BLEED,0,FOLD);
    PANEL[pair[1]](ctx,FOLD,FOLD,SPW-FOLD);
    dlCanvas(cv,`somnia-brochure-${side}-${SPW}x${PH1}.png`);
  }
  // arbitrary two panels side-by-side, full bleed each
  function exportPair(a,b){
    const cv=document.createElement('canvas'); cv.width=PW1*2; cv.height=PH1; const ctx=cv.getContext('2d');
    const lc=document.createElement('canvas'); lc.width=PW1; lc.height=PH1; PANEL[a](lc.getContext('2d'),BLEED,0,PW1);
    const rc=document.createElement('canvas'); rc.width=PW1; rc.height=PH1; PANEL[b](rc.getContext('2d'),BLEED,0,PW1);
    ctx.drawImage(lc,0,0); ctx.drawImage(rc,PW1,0);
    dlCanvas(cv,`somnia-brochure-${a}-${b}-${PW1*2}x${PH1}.png`);
  }

  // ---- UI ----
  function bind(id,ev,fn){ const el=document.getElementById(id); if(el) el.addEventListener(ev,fn); }
  function fld(id,key,sub){ bind(id,'input',e=>{ if(sub) S[sub][key]=e.target.value; else S[key]=e.target.value; save(); render(); }); }
  function loadImgTo(file,slot){ load(URL.createObjectURL(file)).then(img=>{ imgs[slot]=img; render(); }); }

  const EYE='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12C5 6.5 19 6.5 22 12C19 17.5 5 17.5 2 12Z"/><circle cx="12" cy="12" r="3.1"/><line class="slash" x1="3.5" y1="3.5" x2="20.5" y2="20.5"/></svg>';
  function eyeBtn(p,kind,key,on){ return `<button class="eye${on?'':' off'}" data-panel="${p}" data-kind="${kind}" data-id="${key}" title="표시/숨김">${EYE}</button>`; }

  // ---- per-element controls (position / size / spacing / color / align / visibility) ----
  const XF = {
    P02:[
      {key:'logo',  label:'로고',     props:[['dx','좌우',-1100,1100,2],['dy','상하',-1500,1500,2],['size','크기',300,1300,5]]},
      {key:'slogan',label:'슬로건',   props:[['dx','좌우',-1100,1100,2],['dy','상하',-1500,1500,2],['size','크기',48,180,2],['weight','두께',300,700,100],['track','자간',-6,40,1]], colors:[['color','색상']]},
      {key:'divider',label:'구분선',  props:[['dx','좌우',-1100,1100,2],['dy','상하',-1500,1500,2],['width','너비',40,600,4],['thick','두께',1,16,1]], colors:[['color','색상']]},
      {key:'kr',    label:'한글 서브',props:[['dx','좌우',-1100,1100,2],['dy','상하',-1500,1500,2],['size','크기',20,100,1],['weight','두께',300,700,100],['track','자간',-6,40,1]], colors:[['color','색상']]},
      {key:'body',  label:'바디',     props:[['dx','좌우',-1100,1100,2],['dy','상하',-1500,1500,2],['size','크기',20,90,1],['weight','두께',300,700,100],['track','자간',-6,40,1]], colors:[['color','색상']]},
    ],
    P01:[
      {key:'logo',   label:'로고',     props:[['dx','좌우',-1100,1100,2],['dy','상하',-1600,1600,2],['size','크기',300,1100,5]]},
      {key:'head',   label:'헤드라인', props:[['dx','좌우',-1100,1100,2],['dy','상하',-1600,1600,2],['size','크기',40,140,2],['weight','두께',300,700,100],['track','자간',-6,40,1]], colors:[['color','색상']]},
      {key:'sub',    label:'서브',     props:[['dx','좌우',-1100,1100,2],['dy','상하',-1600,1600,2],['size','크기',18,60,1],['weight','두께',300,700,100],['track','자간',-6,40,1]], colors:[['color','색상']]},
      {key:'qr',     label:'QR 코드',  props:[['dx','좌우',-1100,1100,2],['dy','상하',-1600,1600,2],['size','크기',180,500,4]]},
      {key:'qrLabel',label:'QR 캡션',  props:[['dx','좌우',-1100,1100,2],['dy','상하',-1000,1000,2],['size','크기',16,60,1],['weight','두께',300,700,100],['track','자간',-6,40,1]], colors:[['color','색상']]},
      {key:'contact',label:'연락처',   props:[['dx','좌우',-1100,1100,2],['dy','상하',-1600,1600,2],['size','크기',24,64,1],['weight','두께',300,700,100],['gap','줄간격',36,100,2]], colors:[['color','색상']]},
    ],
    P03:[
      {key:'eyebrow',label:'Eyebrow',  props:[['weight','두께',300,700,100]], colors:[['color','색상']]},
      {key:'head',   label:'헤드라인', props:[['weight','두께',300,700,100]], colors:[['color','색상']]},
      {key:'sub',    label:'서브',     props:[['weight','두께',300,700,100]], colors:[['color','색상']]},
      {key:'body',   label:'바디',     props:[['weight','두께',300,700,100]], colors:[['color','색상']]},
      {key:'pills',  label:'키워드 칩',props:[['weight','두께',300,700,100]], colors:[['color','색상']]},
      {key:'symbol', label:'브랜드 심볼',props:[['dx','좌우',-1100,1100,4],['dy','상하',-1500,1500,4],['size','크기',60,400,4]], colors:[['color','색상']]},
      {key:'caption',label:'심볼 캡션', props:[['dx','좌우',-1100,1100,4],['dy','상하',-1500,1500,4],['size','크기',18,90,1],['weight','두께',300,700,100],['track','자간',-6,40,1],['leading','행간',28,120,2]], colors:[['color','색상']], aligns:[['align','정렬']]},
    ],
    P04:[
      {key:'eyebrow',label:'Eyebrow',  props:[['weight','두께',300,700,100],['track','자간',-6,40,1]], colors:[['color','색상']]},
      {key:'head',   label:'헤드라인', props:[['weight','두께',300,700,100],['track','자간',-6,40,1]], colors:[['color','색상']]},
      {key:'sub',    label:'서브',     props:[['weight','두께',300,700,100],['track','자간',-6,40,1]], colors:[['color','색상']]},
      {key:'col1Title',label:'컬럼1 제목',props:[['weight','두께',300,700,100],['track','자간',-6,40,1]], colors:[['color','색상']]},
      {key:'col1',   label:'컬럼1 항목',props:[['weight','두께',300,700,100],['track','자간',-6,40,1]], colors:[['color','색상']]},
      {key:'col2Title',label:'컬럼2 제목',props:[['weight','두께',300,700,100],['track','자간',-6,40,1]], colors:[['color','색상']]},
      {key:'col2',   label:'컬럼2 항목',props:[['weight','두께',300,700,100],['track','자간',-6,40,1]], colors:[['color','색상']]},
      {key:'cta',    label:'CTA 버튼', props:[['weight','두께',300,700,100],['track','자간',-6,40,1]], colors:[['color','색상']]},
    ],
  };
  function miniHTML(p,key,prop,lab,min,max,step,val){
    return `<div class="mini"><label><span>${lab}</span><span class="rdo" id="rdo_${p}_${key}_${prop}">${val}</span></label>`+
      `<input type="range" id="f_${p}_${key}_${prop}" min="${min}" max="${max}" step="${step}" value="${val}"></div>`;
  }
  function swatchRow(p,key,prop,lab,cur){
    const sw=COLORS.map(([nm,hx])=>`<button class="cw${(hx.toLowerCase()===String(cur).toLowerCase())?' on':''}" data-panel="${p}" data-el="${key}" data-prop="${prop}" data-col="${hx}" title="${nm}" style="background:${hx}"></button>`).join('');
    return `<div class="cfield"><span class="clab">${lab}</span><div class="cwrap">${sw}</div></div>`;
  }
  function alignRow(p,key,prop,lab,cur){
    const items=[['left','왼쪽'],['center','가운데'],['right','오른쪽']];
    const b=items.map(([val,t])=>`<button class="ab${val===cur?' on':''}" data-panel="${p}" data-el="${key}" data-prop="${prop}" data-val="${val}">${t}</button>`).join('');
    return `<div class="afield"><span class="clab">${lab}</span><div class="aseg">${b}</div></div>`;
  }
  function buildXF(p){
    const host=document.getElementById('xf_'+p); if(!host) return;
    const E=S[p].el;
    host.innerHTML=XF[p].map(elc=>{
      const v=E[elc.key];
      const grid=elc.props.map(pr=>miniHTML(p,elc.key,pr[0],pr[1],pr[2],pr[3],pr[4],v[pr[0]])).join('');
      const cols=(elc.colors||[]).map(c=>swatchRow(p,elc.key,c[0],c[1],v[c[0]])).join('');
      const algs=(elc.aligns||[]).map(a=>alignRow(p,elc.key,a[0],a[1],v[a[0]])).join('');
      return `<div class="xform"><div class="xfhead"><span>${elc.label}</span>`+
        `<div class="hctl">${eyeBtn(p,'el',elc.key,vis(v))}<button class="reset-el" data-panel="${p}" data-el="${elc.key}">초기화</button></div></div>`+
        (grid?`<div class="xgrid">${grid}</div>`:'')+`${cols}${algs}</div>`;
    }).join('');
    XF[p].forEach(elc=>elc.props.forEach(pr=>{
      bind('f_'+p+'_'+elc.key+'_'+pr[0],'input',e=>{
        S[p].el[elc.key][pr[0]]=+e.target.value;
        const r=document.getElementById('rdo_'+p+'_'+elc.key+'_'+pr[0]); if(r) r.textContent=e.target.value;
        save(); render();
      });
    }));
    host.querySelectorAll('.cw').forEach(b=>b.addEventListener('click',()=>{
      S[b.dataset.panel].el[b.dataset.el][b.dataset.prop]=b.dataset.col;
      b.parentElement.querySelectorAll('.cw').forEach(x=>x.classList.remove('on')); b.classList.add('on');
      save(); render();
    }));
    host.querySelectorAll('.ab').forEach(b=>b.addEventListener('click',()=>{
      S[b.dataset.panel].el[b.dataset.el][b.dataset.prop]=b.dataset.val;
      b.parentElement.querySelectorAll('.ab').forEach(x=>x.classList.remove('on')); b.classList.add('on');
      save(); render();
    }));
    host.querySelectorAll('.eye').forEach(b=>b.addEventListener('click',()=>{
      const el=S[b.dataset.panel].el[b.dataset.id]; if(!el) return; el.on=!(el.on!==false);
      b.classList.toggle('off',el.on===false); save(); render();
    }));
    host.querySelectorAll('.reset-el').forEach(b=>b.addEventListener('click',()=>{
      const pn=b.dataset.panel, k=b.dataset.el; S[pn].el[k]=Object.assign({},DEF[pn].el[k]); save(); buildXF(pn); render();
    }));
  }
  function syncXF(p){
    const E=S[p]&&S[p].el; if(!E) return;
    XF[p].forEach(elc=>{ elc.props.forEach(pr=>{
      const inp=document.getElementById('f_'+p+'_'+elc.key+'_'+pr[0]);
      const r=document.getElementById('rdo_'+p+'_'+elc.key+'_'+pr[0]);
      if(inp) inp.value=E[elc.key][pr[0]]; if(r) r.textContent=E[elc.key][pr[0]];
    });
    (elc.colors||[]).forEach(c=>{ const cur=String(E[elc.key][c[0]]).toLowerCase();
      document.querySelectorAll('.cw[data-panel="'+p+'"][data-el="'+elc.key+'"][data-prop="'+c[0]+'"]').forEach(b=>b.classList.toggle('on',(b.dataset.col||'').toLowerCase()===cur));
    });
    (elc.aligns||[]).forEach(a=>{ const cur=E[elc.key][a[0]];
      document.querySelectorAll('.ab[data-panel="'+p+'"][data-el="'+elc.key+'"][data-prop="'+a[0]+'"]').forEach(b=>b.classList.toggle('on',b.dataset.val===cur));
    });
    const eb=document.querySelector('.eye[data-panel="'+p+'"][data-kind="el"][data-id="'+elc.key+'"]'); if(eb) eb.classList.toggle('off',E[elc.key].on===false);
    });
  }

  // ---- image areas (dynamic, P03/P04) ----
  const SHAPES=[['circle','원'],['rounded','라운드'],['rect','사각형']];
  function areaCard(p,a,idx){
    const sl=(prop,lab,min,max,step,val)=>`<div class="mini"><label><span>${lab}</span><span class="rdo" id="rdo_${p}_${a.id}_${prop}">${val}</span></label><input type="range" data-area="${a.id}" data-prop="${prop}" min="${min}" max="${max}" step="${step}" value="${val}"></div>`;
    const shp=SHAPES.map(([v,t])=>`<button class="sb${(a.shape||'rounded')===v?' on':''}" data-area="${a.id}" data-shape="${v}">${t}</button>`).join('');
    const fillNone=`<button class="fc${(!a.fill||a.fill==='none')?' on':''}" data-area="${a.id}" data-fill="none" title="채움 없음">✕</button>`;
    const fills=COLORS.map(([nm,hx])=>`<button class="fc${(String(a.fill).toLowerCase()===hx.toLowerCase())?' on':''}" data-area="${a.id}" data-fill="${hx}" title="${nm}" style="background:${hx}"></button>`).join('');
    return `<div class="xform"><div class="xfhead"><span>이미지 영역 ${idx+1}</span>`+
      `<div class="hctl">${eyeBtn(p,'area',a.id,a.on!==false)}<button class="reset-el del-area" data-area="${a.id}">삭제</button></div></div>`+
      `<div class="xgrid">${sl('dx','좌우',-1400,1400,4,a.dx)}${sl('dy','상하',-2200,2200,4,a.dy)}${sl('w','너비',-1200,900,4,a.w)}${sl('h','높이',-1000,1400,4,a.h)}${sl('zoom','줌(확대)',1,4,0.05,(a.zoom||1))}${sl('ox','가로 위치',-1,1,0.02,(a.ox||0))}${sl('oy','세로 위치',-1,1,0.02,(a.oy||0))}${sl('opacity','불투명도',0,1,0.02,(a.opacity==null?1:a.opacity))}${sl('feather','페더',0,160,2,(a.feather||0))}</div>`+
      `<div class="afield"><span class="clab">모양</span><div class="aseg">${shp}</div></div>`+
      `<div class="cfield"><span class="clab">채움</span><div class="cwrap">${fillNone}${fills}</div></div>`+
      `<label class="file"><input type="file" class="area-file" data-area="${a.id}" accept="image/*"><span>${areaImgs[a.id]?'＋ 이미지 (교체)':'＋ 이미지'}</span></label></div>`;
  }
  function buildAreas(p){
    const host=document.getElementById('areas_'+p); if(!host) return;
    host.innerHTML=S[p].areas.map((a,i)=>areaCard(p,a,i)).join('');
    host.querySelectorAll('input[type=range]').forEach(inp=>inp.addEventListener('input',()=>{
      const a=S[p].areas.find(x=>x.id===inp.dataset.area); if(!a) return;
      a[inp.dataset.prop]=+inp.value;
      const r=document.getElementById('rdo_'+p+'_'+inp.dataset.area+'_'+inp.dataset.prop); if(r) r.textContent=inp.value;
      save(); render();
    }));
    host.querySelectorAll('.sb').forEach(b=>b.addEventListener('click',()=>{
      const a=S[p].areas.find(x=>x.id===b.dataset.area); if(!a) return; a.shape=b.dataset.shape;
      b.parentElement.querySelectorAll('.sb').forEach(x=>x.classList.remove('on')); b.classList.add('on'); save(); render();
    }));
    host.querySelectorAll('.fc').forEach(b=>b.addEventListener('click',()=>{
      const a=S[p].areas.find(x=>x.id===b.dataset.area); if(!a) return; a.fill=b.dataset.fill;
      b.parentElement.querySelectorAll('.fc').forEach(x=>x.classList.remove('on')); b.classList.add('on'); save(); render();
    }));
    host.querySelectorAll('.eye').forEach(b=>b.addEventListener('click',()=>{
      const a=S[p].areas.find(x=>x.id===b.dataset.id); if(!a) return; a.on=!(a.on!==false);
      b.classList.toggle('off',a.on===false); save(); render();
    }));
    host.querySelectorAll('.del-area').forEach(b=>b.addEventListener('click',()=>{
      S[p].areas=S[p].areas.filter(x=>x.id!==b.dataset.area); delete areaImgs[b.dataset.area]; save(); buildAreas(p); render();
    }));
    host.querySelectorAll('.area-file').forEach(inp=>inp.addEventListener('change',e=>{
      const f=e.target.files[0]; if(!f) return; const id=inp.dataset.area;
      load(URL.createObjectURL(f)).then(img=>{ areaImgs[id]=img; buildAreas(p); render(); });
    }));
  }

  function syncInputs(){
    for(const p of ['P01','P02','P03','P04']) for(const k in S[p]){ const el=document.getElementById('f_'+p+'_'+k); if(el && el.value!==undefined && typeof S[p][k]!=='object') el.value=S[p][k]; }
    const lo=document.getElementById('f_logoOn'); if(lo) lo.checked=S.logoOn;
    const g=document.getElementById('f_guides'); if(g) g.checked=S.guides;
    document.querySelectorAll('.viewbtn').forEach(b=>b.classList.toggle('on',b.dataset.v===S.view));
    document.body.dataset.view=S.view;
    const so=document.getElementById('f_P03_symOn'); if(so) so.checked=S.P03.symOn!==false;
    document.querySelectorAll('#seg_P03_main .ma').forEach(b=>b.classList.toggle('on',b.dataset.val===(S.P03.align||'left')));
    syncBg();
    ['P01','P02','P03','P04'].forEach(syncXF);
    ['P03','P04'].forEach(buildAreas);
  }
  function syncBg(){ const cur=String((S[S.view]&&S[S.view].bg)||'').toLowerCase();
    document.querySelectorAll('.swatches .sw').forEach(b=>b.classList.toggle('on',(b.dataset.bg||'').toLowerCase()===cur)); }

  function attach(){
    document.querySelectorAll('.viewbtn').forEach(b=>b.addEventListener('click',()=>{ S.view=b.dataset.v; document.body.dataset.view=S.view; save(); syncBg(); render(); }));
    bind('f_logoOn','change',e=>{ S.logoOn=e.target.checked; save(); render(); });
    bind('f_guides','change',e=>{ S.guides=e.target.checked; save(); render(); });
    bind('f_P03_symOn','change',e=>{ S.P03.symOn=e.target.checked; save(); render(); });
    document.querySelectorAll('#seg_P03_main .ma').forEach(b=>b.addEventListener('click',()=>{
      S.P03.align=b.dataset.val; document.querySelectorAll('#seg_P03_main .ma').forEach(x=>x.classList.toggle('on',x===b)); save(); render();
    }));
    document.querySelectorAll('.swatches .sw').forEach(b=>b.addEventListener('click',()=>{ S[S.view].bg=b.dataset.bg; save(); syncBg(); render(); }));
    // add image area
    document.querySelectorAll('.addarea').forEach(b=>b.addEventListener('click',()=>{
      const p=b.dataset.panel, arr=S[p].areas, src=arr[arr.length-1];
      const na=Object.assign({}, src || {dx:0,dy:0,w:-320,h:-160,zoom:1,ox:0,oy:0,shape:'rounded',fill:'none',opacity:1,feather:0});
      na.id=p+'_a'+Date.now().toString(36); na.dx=(src?src.dx:0)+50; na.dy=(src?src.dy:0)+50; na.on=true;
      arr.push(na);
      save(); buildAreas(p); render();
    }));
    // text fields
    [['P02','slogan'],['P02','kr'],['P02','body'],
     ['P01','head'],['P01','sub'],['P01','c1'],['P01','c2'],['P01','c3'],['P01','qrLabel'],
     ['P03','eyebrow'],['P03','head'],['P03','sub'],['P03','body'],['P03','pills'],['P03','symCaption'],
     ['P04','eyebrow'],['P04','head'],['P04','sub'],['P04','col1Title'],['P04','col1'],['P04','col2Title'],['P04','col2'],['P04','cta']
    ].forEach(([p,k])=>fld('f_'+p+'_'+k,k,p));
    bind('f_P03_headSize','input',e=>{ S.P03.headSize=+e.target.value; save(); render(); });
    // per-element controls + image areas
    ['P01','P02','P03','P04'].forEach(buildXF);
    ['P03','P04'].forEach(buildAreas);
    // background/qr image uploads
    [['f_img_P01','P01'],['f_img_P02','P02'],['f_img_qr','qr']].forEach(([id,slot])=>
      bind(id,'change',e=>{ const f=e.target.files[0]; if(f) loadImgTo(f,slot); }));
    // exports
    ['P01','P02','P03','P04'].forEach(p=>bind('dl_'+p,'click',()=>exportPanel(p)));
    bind('dl_outside','click',()=>exportSpread('outside'));
    bind('dl_inside','click',()=>exportSpread('inside'));
    bind('dl_pair','click',()=>{ const lp=document.getElementById('pair_l'), rp=document.getElementById('pair_r'); if(lp&&rp) exportPair(lp.value,rp.value); });
    bind('reset','click',()=>{ if(confirm('모든 편집을 기본값으로 되돌릴까요?')){ S=JSON.parse(JSON.stringify(DEF)); norm(); save(); ['P01','P02','P03','P04'].forEach(buildXF); syncInputs(); render(); } });
  }

  attach();
  Promise.all([
    load('assets/logo-full-white.png'),
    load('assets/logo-wordmark-white.png'),
    load('assets/symbol-white.png'),
  ]).then(([lf,wm,sym])=>{
    logoFullW=lf; wordW=wm; symW=sym; logoFullN=tint(lf,COL.navy); wordN=tint(wm,COL.navy);
    return document.fonts ? document.fonts.ready : Promise.resolve();
  }).then(()=>{ ready=true; syncInputs(); render(); });
})();
