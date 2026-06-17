/* SOMNIA Label Studio — canvas renderer (preview === export) */
(function(){
  'use strict';

  const PRESETS = {
    moonberry: { label:'Moon Berry', c1:'#21396a', c2:'#0e1d3a', text:'#F3F7FF',
      logo:'white', sceneKey:'navy', sceneTint:'rgba(18,33,62,0.22)', capC1:'#2c4a78', capC2:'#0c1a34', capTop:'#1b3358' },
    grape: { label:'Deep Night Grape', c1:'#4a3a7e', c2:'#241640', text:'#F6F2FF',
      logo:'white', sceneKey:'purple', sceneTint:'rgba(52,38,92,0.22)', capC1:'#5a4892', capC2:'#1c1238', capTop:'#372a63' },
    vanilla: { label:'Vanilla Moon', c1:'#ecd9e4', c2:'#d3b3c6', text:'#3a2740',
      logo:'navy', sceneKey:'pink', sceneTint:'rgba(228,205,220,0.18)', capC1:'#efe7d4', capC2:'#cfc1a3', capTop:'#e3d8bf' },
  };

  const S = {
    product:'jelly', mode:'body', preset:'moonberry',
    label:'Moon Berry', line:'DREAM JELLY',
    ing:['MELATONIN','L-THEANINE','MAGNESIUM'], vol:'30 JELLIES', sub:'(120 g)',
    c1:'#21396a', c2:'#0e1d3a', text:'#F3F7FF', subc:'rgba(214,236,250,0.92)', dimc:'rgba(226,236,252,0.86)',
    capC1:'#2c4a78', capC2:'#0c1a34', capTop:'#1b3358',
    logoOn:true, logo:'white', logoScale:1, logoY:0,
    scene:true, sceneKey:'navy', sceneTint:'rgba(18,33,62,0.22)', sceneY:0,
    labelSize:150, lineY:40, font:'serif', italic:true,
    sprayW:500, sprayTextY:0, sprayLogoY:0, sprayGap:0,
    sprayTitleSize:96, sprayItalic:false, sprayShadow:18,
    oilBg:'#9aa6b8', oilText:'#F6F8FC', oilTitleSize:128, oilGuide:true,
    oilName:'라벤더 아로마 오일', oilEN:'LAVENDER AROMA OIL', oilCopy:'100% 라벤더 오일 · 발향용',
    oilDesc:'잠들기 전 침실과 베개 주변에 가볍게 사용하는\n발향 전용 라벤더 아로마 오일입니다.',
    oilVText:'100% PURE LAVENDER ESSENTIAL OIL · FOR FRAGRANCE USE',
    oilCaution:'어린이의 손이 닿지 않는 곳에 보관하십시오.\n눈에 들어가지 않도록 주의하십시오.\n피부에 직접 사용하지 마십시오.\n먹거나 삼키지 마십시오.\n직사광선을 피해 보관하십시오.',
    oilLeftX:0, oilCenterX:0, oilRightX:0,
    otTitle:'AROMA OIL', otSub:'lavender / pillow & room mist', otCap1:'SOMNIA SLEEP COLLECTION',
    otCap2:'100% LAVENDER · FOR FRAGRANCE USE', otBg:'#7d6e86', otText:'#2e2838',
    otSize:96, otItalic:false, otWeight:600, otLogoScale:1,
    otCapSize:40, otCapSpace:10, otLogoColor:'navy', otBgImg:false,
    oilRows:'Lavender Oil | PURE\nAroma / 발향용 | ✓\nVolume 용량 | 10 ml\nOrigin 원산지 | Provence\nNet 순도 | 100%',
  };

  const bg = {}; let logoW=null, logoNavy=null, customBg=null, ready=false;

  function load(src){ return new Promise((res,rej)=>{ const i=new Image(); i.crossOrigin='anonymous';
    i.onload=()=>res(i); i.onerror=rej; i.src=src; }); }
  function tint(img,color){ const c=document.createElement('canvas'); c.width=img.width; c.height=img.height;
    const x=c.getContext('2d'); x.drawImage(img,0,0); x.globalCompositeOperation='source-in';
    x.fillStyle=color; x.fillRect(0,0,c.width,c.height); return c; }

  function capsText(ctx,text,cx,y,size,color,spacing,weight){
    ctx.font=`${weight||500} ${size}px Outfit, Arial, sans-serif`;
    ctx.fillStyle=color; ctx.textBaseline='middle'; ctx.textAlign='left';
    const chars=[...text], w=chars.map(c=>ctx.measureText(c).width);
    const total=w.reduce((a,b)=>a+b,0)+spacing*(chars.length-1);
    let x=cx-total/2; for(let i=0;i<chars.length;i++){ ctx.fillText(chars[i],x,y); x+=w[i]+spacing; }
  }
  // equal target width via auto letter-spacing
  function capsFixed(ctx,text,cx,y,size,color,targetW,weight){
    ctx.font=`${weight||400} ${size}px Outfit, Arial, sans-serif`;
    ctx.fillStyle=color; ctx.textBaseline='middle'; ctx.textAlign='left';
    const chars=[...text], w=chars.map(c=>ctx.measureText(c).width);
    const base=w.reduce((a,b)=>a+b,0), sp=chars.length>1?(targetW-base)/(chars.length-1):0;
    let x=cx-targetW/2; for(let i=0;i<chars.length;i++){ ctx.fillText(chars[i],x,y); x+=w[i]+sp; }
  }
  function cover(ctx,img,dx,dy,dw,dh,oy){
    const ir=img.width/img.height, r=dw/dh; let sw,sh,sx,sy;
    if(ir>r){ sh=img.height; sw=sh*r; sx=(img.width-sw)/2; sy=0; }
    else { sw=img.width; sh=sw/r; sx=0; sy=(img.height-sh)/2; }
    sy=Math.max(0,Math.min(img.height-sh, sy+(oy||0)));
    ctx.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);
  }
  // scene drawn into temp canvas with feathered (alpha) edges so no hard seam
  function feather(img,dw,dh,oy,topF,sideF,botF){
    const t=document.createElement('canvas'); t.width=dw; t.height=dh; const x=t.getContext('2d');
    cover(x,img,0,0,dw,dh,oy);
    x.globalCompositeOperation='destination-out';
    let g=x.createLinearGradient(0,0,0,dh*topF); g.addColorStop(0,'#000'); g.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=g; x.fillRect(0,0,dw,dh*topF);
    if(botF){ let b=x.createLinearGradient(0,dh,0,dh*(1-botF)); b.addColorStop(0,'#000'); b.addColorStop(1,'rgba(0,0,0,0)');
      x.fillStyle=b; x.fillRect(0,dh*(1-botF),dw,dh*botF); }
    let l=x.createLinearGradient(0,0,dw*sideF,0); l.addColorStop(0,'#000'); l.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=l; x.fillRect(0,0,dw*sideF,dh);
    let r=x.createLinearGradient(dw,0,dw*(1-sideF),0); r.addColorStop(0,'#000'); r.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=r; x.fillRect(dw*(1-sideF),0,dw*sideF,dh);
    x.globalCompositeOperation='source-over'; return t;
  }
  const logoImg=()=> S.logo==='navy' ? logoNavy : logoW;
  const sceneImg=()=> customBg || bg[S.sceneKey] || bg.navy;
  function flavorFont(size){ return S.font==='serif'
    ? `${S.italic?'italic ':''}${size}px "Cormorant Garamond", Georgia, serif`
    : `${S.italic?'italic ':''}600 ${size}px Outfit, Arial, sans-serif`; }

  // ---------- BODY 2000 ----------
  function renderBody(ctx){
    const B=2000; ctx.clearRect(0,0,B,B);
    let g=ctx.createLinearGradient(0,0,0,B);
    g.addColorStop(0,S.c1); g.addColorStop(0.45,mix(S.c1,S.c2,.5)); g.addColorStop(1,S.c2);
    ctx.fillStyle=g; ctx.fillRect(0,0,B,B);

    if(S.scene && sceneImg()){
      ctx.drawImage(feather(sceneImg(),B,1240,S.sceneY,0.42,0.10,0.30),0,760);
      let bd=ctx.createLinearGradient(0,1500,0,2000);
      bd.addColorStop(0,hexA(S.c2,0)); bd.addColorStop(1,hexA(S.c2,0.7));
      ctx.fillStyle=bd; ctx.fillRect(0,1500,B,500);
      ctx.fillStyle=S.sceneTint; ctx.fillRect(0,0,B,B);
    }

    let yb=360;
    const bottomLogo = (S.product==='jelly2');
    if(!bottomLogo && S.logoOn && logoImg()){ const lw=760*S.logoScale, lh=lw*(logoImg().height/logoImg().width);
      const ly=360+S.logoY; ctx.drawImage(logoImg(),(B-lw)/2,ly,lw,lh); yb=ly+lh; }

    const lineBase=yb+95+S.lineY;
    capsText(ctx,S.line,B/2,lineBase,60,S.subc,26,500);
    ctx.strokeStyle=hexA(S.text,0.5); ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(720,lineBase+90); ctx.lineTo(1280,lineBase+90); ctx.stroke();

    ctx.font=flavorFont(S.labelSize); ctx.fillStyle=S.text; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.shadowColor='rgba(8,18,40,0.4)'; ctx.shadowBlur=24; ctx.fillText(S.label,B/2,1060); ctx.shadowBlur=0;

    let iy=1300; S.ing.filter(Boolean).forEach(l=>{ capsFixed(ctx,l,B/2,iy,42,S.dimc,560,400); iy+=72; });
    if(bottomLogo){
      if(S.logoOn && logoImg()){ const lw=620*S.logoScale, lh=lw*(logoImg().height/logoImg().width);
        ctx.drawImage(logoImg(),(B-lw)/2,1800-lh/2+S.logoY,lw,lh); }
    } else {
      capsText(ctx,S.vol,B/2,1772,40,S.subc,16,500);
      if(S.sub) capsText(ctx,S.sub,B/2,1828,34,hexA(S.text,0.6),10,400);
    }
  }

  // ---------- CAP 1000 ----------
  function renderCap(ctx){
    const C=1000, CX=500, CY=500, R=486; ctx.clearRect(0,0,C,C);
    ctx.save(); ctx.beginPath(); ctx.arc(CX,CY,R,0,Math.PI*2); ctx.clip();
    let rg=ctx.createRadialGradient(410,360,80,CX,CY,R);
    rg.addColorStop(0,S.capC1); rg.addColorStop(0.55,mix(S.capC1,S.capC2,.55)); rg.addColorStop(1,S.capC2);
    ctx.fillStyle=rg; ctx.fillRect(0,0,C,C); ctx.restore();
    const r1=486,r2=414,tk=180;
    for(let i=0;i<tk;i++){ const a=(i/tk)*Math.PI*2;
      ctx.strokeStyle=(i%2===0)?'rgba(255,255,255,0.10)':'rgba(0,0,0,0.22)'; ctx.lineWidth=4.5;
      ctx.beginPath(); ctx.moveTo(CX+Math.cos(a)*r2,CY+Math.sin(a)*r2); ctx.lineTo(CX+Math.cos(a)*r1,CY+Math.sin(a)*r1); ctx.stroke(); }
    ctx.strokeStyle='rgba(0,0,0,0.35)'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(CX,CY,r2,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(CX,CY,r2-3,0,Math.PI*2); ctx.stroke();
    let tg=ctx.createRadialGradient(420,370,60,CX,CY,r2);
    tg.addColorStop(0,S.capTop); tg.addColorStop(0.7,mix(S.capTop,S.capC2,.4)); tg.addColorStop(1,mix(S.capTop,S.capC2,.6));
    ctx.beginPath(); ctx.arc(CX,CY,r2-8,0,Math.PI*2); ctx.fillStyle=tg; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(CX,CY,r2-8,0,Math.PI*2); ctx.clip();
    let hg=ctx.createRadialGradient(330,300,20,330,300,420);
    hg.addColorStop(0,'rgba(255,255,255,0.16)'); hg.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=hg; ctx.fillRect(0,0,C,C); ctx.restore();
    ctx.strokeStyle='rgba(0,0,0,0.18)'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(CX,CY,300,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(CX,CY,297,0,Math.PI*2); ctx.stroke();
    if(S.logoOn && logoImg()){ const clw=360*S.logoScale, clh=clw*(logoImg().height/logoImg().width);
      ctx.globalAlpha=0.12; ctx.drawImage(logoImg(),(C-clw)/2,(C-clh)/2+3,clw,clh);
      const dark=tint(logoImg(), mix(S.capC2,'#000000',.25));
      ctx.globalAlpha=0.55; ctx.drawImage(dark,(C-clw)/2,(C-clh)/2,clw,clh); ctx.globalAlpha=1; }
  }

  // ---------- ROOM SPRAY 1254x1682 ----------
  function renderSpray(ctx){
    const W=1254,H=1682; ctx.clearRect(0,0,W,H);
    const img=customBg||bg.pink;
    ctx.fillStyle='#2a1c38'; ctx.fillRect(0,0,W,H);
    if(img) cover(ctx,img,0,0,W,H,0);
    // top scrim for logo
    let tg=ctx.createLinearGradient(0,0,0,420); tg.addColorStop(0,'rgba(20,14,34,0.5)'); tg.addColorStop(1,'rgba(20,14,34,0)');
    ctx.fillStyle=tg; ctx.fillRect(0,0,W,420);
    // bottom scrim for text block
    let scrimTop=Math.max(360, 820+S.sprayTextY);
    let bgd=ctx.createLinearGradient(0,scrimTop,0,H); bgd.addColorStop(0,'rgba(18,12,30,0)'); bgd.addColorStop(0.5,'rgba(18,12,30,0.45)'); bgd.addColorStop(1,'rgba(16,10,26,0.78)');
    ctx.fillStyle=bgd; ctx.fillRect(0,scrimTop,W,H-scrimTop);

    const CXc=W/2, W2='rgba(255,255,255,0.86)';
    if(S.logoOn && logoW){ const lw=480, lh=lw*(logoW.height/logoW.width); ctx.drawImage(logoW,(W-lw)/2,150+S.sprayLogoY,lw,lh); }

    const ty=S.sprayTextY;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    // product name
    ctx.font=`${S.sprayItalic?'italic ':''}${S.sprayW} ${S.sprayTitleSize}px Outfit, Arial, sans-serif`; ctx.fillStyle='#fff';
    ctx.shadowColor=`rgba(10,8,22,${(S.sprayShadow/100).toFixed(2)})`; ctx.shadowBlur=Math.max(0,S.sprayShadow*1.4); ctx.shadowOffsetY=S.sprayShadow>0?6:0;
    ctx.fillText('Sleep Well',CXc,1120+ty); ctx.shadowBlur=0; ctx.shadowOffsetY=0;
    ctx.textAlign='center';
    capsText(ctx,'AROMA ROOM SPRAY',CXc,1208+ty,34,W2,18,500);
    // divider
    ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(CXc-130,1262+ty); ctx.lineTo(CXc+130,1262+ty); ctx.stroke();
    // one-liner
    ctx.textAlign='center';
    ctx.font='300 30px Outfit, Arial, sans-serif'; ctx.fillStyle='rgba(255,255,255,0.9)';
    ctx.fillText('라벤더 · 캐모마일 · 시더우드가 어우러진',CXc,1322+ty);
    ctx.fillText('잠들기 전 침실 아로마 스프레이',CXc,1366+ty);
    // scents
    capsText(ctx,'LAVENDER · CHAMOMILE · CEDARWOOD',CXc,1452+ty,32,'#fff',8,500);
    // moods
    ctx.textAlign='center';
    ctx.font='300 30px Outfit, Arial, sans-serif'; ctx.fillStyle='rgba(255,255,255,0.82)';
    ctx.fillText('차분한 · 부드러운 · 우디한 · 포근한',CXc,1512+ty);
    // volume
    capsText(ctx,'100ml / 3.38 fl. oz.',CXc,1588+ty,28,'rgba(255,255,255,0.7)',6,400);
  }

  // ---------- AROMA OIL TITLE STICKER 1145x953 ----------
  function renderOilTitle(ctx){
    const W=1145,H=953; ctx.clearRect(0,0,W,H);
    if(S.otBgImg && customBg){ cover(ctx,customBg,0,0,W,H,0); }
    else { ctx.fillStyle=S.otBg; ctx.fillRect(0,0,W,H); }
    const T=S.otText, cx=W/2;
    const LG = S.otLogoColor==='navy' ? logoNavy : logoW;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    // title
    ctx.font=`${S.otItalic?'italic ':''}${S.otWeight} ${S.otSize}px Outfit, sans-serif`; ctx.fillStyle=T;
    capsText(ctx,S.otTitle,cx,150,S.otSize,T,S.otSize*0.14,S.otWeight);
    // divider
    ctx.strokeStyle=hexA(T,0.85); ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(150,200); ctx.lineTo(W-150,200); ctx.stroke();
    // subtitle
    ctx.font=`${S.otSize*0.34}px Outfit, sans-serif`;
    ctx.fillStyle=hexA(T,0.92); ctx.fillText(S.otSub,cx,238);
    // center logo
    if(S.logoOn && LG){ const lw=420*S.otLogoScale, lh=lw*(LG.height/LG.width);
      ctx.drawImage(LG,cx-lw/2,H/2-lh/2,lw,lh); }
    // captions
    capsText(ctx,S.otCap1,cx,778,S.otCapSize,hexA(T,0.95),S.otCapSpace,600);
    capsText(ctx,S.otCap2,cx,778+S.otCapSize+6,S.otCapSize*0.85,hexA(T,0.8),S.otCapSpace,500);
  }

  // ---------- AROMA OIL 4091x4096 (cylinder wrap sticker) ----------
  function vText(ctx,text,x,y,size,color,spacing,weight){
    ctx.save(); ctx.translate(x,y); ctx.rotate(Math.PI/2);
    capsText(ctx,text,0,0,size,color,spacing,weight); ctx.restore();
  }
  function drawLavender(ctx,cx,cy,sc,color){
    ctx.save(); ctx.translate(cx,cy); ctx.scale(sc,sc);
    ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=3; ctx.lineCap='round';
    // stem
    ctx.beginPath(); ctx.moveTo(0,52); ctx.quadraticCurveTo(-4,10,0,-30); ctx.stroke();
    // leaves
    ctx.beginPath(); ctx.moveTo(0,40); ctx.quadraticCurveTo(-22,30,-30,12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,46); ctx.quadraticCurveTo(22,36,30,18); ctx.stroke();
    // buds (clustered ovals)
    const buds=[[0,-44,7,11],[-9,-30,6,10],[9,-30,6,10],[-7,-14,6,9],[7,-14,6,9],[0,-20,6,10],[0,-2,5,8]];
    buds.forEach(([bx,by,rw,rh])=>{ ctx.beginPath(); ctx.ellipse(bx,by,rw,rh,0,0,Math.PI*2); ctx.fill(); });
    ctx.restore();
  }
  function renderOil(ctx){
    const W=4091,H=4096; ctx.clearRect(0,0,W,H);
    ctx.fillStyle=S.oilBg; ctx.fillRect(0,0,W,H);
    const T=S.oilText, LW=2;
    const gw=3767, gh=1342, gx=(W-gw)/2, gy=(H-gh)/2;
    const cy=gy+gh/2;

    // ---- LEFT: spec table ----
    const lx=gx+90+S.oilLeftX, lw=1140;
    let y=gy+150;
    ctx.textAlign='left'; ctx.textBaseline='middle';
    ctx.font='600 46px Outfit, sans-serif'; ctx.fillStyle=T;
    ctx.fillText('Product Detail', lx, y);
    ctx.textAlign='right'; ctx.fillText('100%', lx+lw, y); ctx.textAlign='left';
    const rows=S.oilRows.split('\n').filter(Boolean).map(l=>l.split('|').map(s=>s.trim()));
    const RH=86; y+=58;
    rows.forEach(r=>{
      ctx.strokeStyle=hexA(T,0.35); ctx.lineWidth=LW;
      ctx.beginPath(); ctx.moveTo(lx,y); ctx.lineTo(lx+lw,y); ctx.stroke();
      ctx.font='400 40px Outfit, sans-serif'; ctx.fillStyle=hexA(T,0.9);
      ctx.textAlign='left'; ctx.fillText(r[0]||'',lx,y+RH/2);
      ctx.textAlign='right'; ctx.fillStyle=hexA(T,0.7); ctx.fillText(r[1]||'',lx+lw,y+RH/2);
      ctx.textAlign='left'; y+=RH;
    });
    ctx.strokeStyle=hexA(T,0.35); ctx.lineWidth=LW;
    ctx.beginPath(); ctx.moveTo(lx,y); ctx.lineTo(lx+lw,y); ctx.stroke();
    ctx.font='300 30px Outfit, sans-serif'; ctx.fillStyle=hexA(T,0.6);
    y+=58; S.oilDesc.split('\n').forEach(line=>{ ctx.fillText(line, lx, y); y+=42; });
    const cau=S.oilCaution.split('\n').filter(Boolean);
    if(cau.length){
      y+=34; ctx.font='600 30px Outfit, sans-serif'; ctx.fillStyle=hexA(T,0.8); ctx.textAlign='left';
      ctx.fillText('CAUTION 주의사항', lx, y);
      ctx.font='300 28px Outfit, sans-serif'; ctx.fillStyle=hexA(T,0.62);
      cau.forEach(c=>{ y+=42; ctx.fillText('• '+c, lx, y); });
    }

    // ---- CENTER: bordered box ----
    const bx=gx+1620+S.oilCenterX, bw=1430, by=gy+150, bh=gh-300;
    ctx.strokeStyle=hexA(T,0.8); ctx.lineWidth=LW;
    ctx.strokeRect(bx,by,bw,bh);
    const r1=by+bh*0.30, r2=by+bh*0.55, r3=by+bh*0.78;
    [r1,r2,r3].forEach(ry=>{ ctx.beginPath(); ctx.moveTo(bx,ry); ctx.lineTo(bx+bw,ry); ctx.stroke(); });
    const vdx=bx+bw*0.72; ctx.beginPath(); ctx.moveTo(vdx,r1); ctx.lineTo(vdx,r2); ctx.stroke();
    const ccx=bx+bw/2;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    if(S.logoOn && logoW){ const lgw=720, lgh=lgw*(logoW.height/logoW.width);
      ctx.drawImage(logoW, ccx-lgw/2, (by+r1)/2-lgh/2, lgw, lgh); }
    else { capsText(ctx,'SOMNIA',ccx,(by+r1)/2,120,T,26,600); }
    capsText(ctx,S.oilName, bx+(vdx-bx)/2, (r1+r2)/2, 56, T, 8, 500);
    drawLavender(ctx, vdx+(bx+bw-vdx)/2, (r1+r2)/2, 1.15, T);
    ctx.fillStyle=T; ctx.fillRect(bx,r2,bw,r3-r2);
    capsFixed(ctx,S.oilEN, ccx, (r2+r3)/2, S.oilTitleSize*0.62, S.oilBg, bw*0.82, 500);
    capsText(ctx,S.oilCopy, ccx, (r3+by+bh)/2, 52, hexA(T,0.92), 6, 400);

    // ---- RIGHT: vertical caption ----
    const rx=gx+gw-80+S.oilRightX;
    vText(ctx,S.oilVText, rx, cy, 30, hexA(T,0.75), 6, 400);

    if(S.oilGuide && S._showGuide){
      ctx.strokeStyle='rgba(255,80,80,0.7)'; ctx.lineWidth=4; ctx.setLineDash([24,18]);
      ctx.strokeRect(gx,gy,gw,gh); ctx.setLineDash([]);
    }
  }

  function render(){
    if(!ready) return;
    const cv=document.getElementById('art'); const ctx=cv.getContext('2d');
    if(S.product==='spray'){ cv.width=1254; cv.height=1682; renderSpray(ctx); cv.className=''; return; }
    if(S.product==='oil'){ cv.width=4091; cv.height=4096; S._showGuide=true; renderOil(ctx); cv.className=''; return; }
    if(S.product==='oiltitle'){ cv.width=1145; cv.height=953; renderOilTitle(ctx); cv.className=''; return; }
    const size=S.mode==='body'?2000:1000; cv.width=size; cv.height=size;
    (S.mode==='body'?renderBody:renderCap)(ctx);
    cv.className = S.mode==='cap'?'cap':'';
  }

  function hex2rgb(h){ h=h.replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join('');
    return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; }
  function mix(a,b,t){ const A=hex2rgb(a),Bb=hex2rgb(b);
    return '#'+A.map((v,i)=>Math.round(v+(Bb[i]-v)*t).toString(16).padStart(2,'0')).join(''); }
  function hexA(h,a){ if(h.startsWith('rgb')) return h; const [r,g,b]=hex2rgb(h); return `rgba(${r},${g},${b},${a})`; }

  function applyPreset(key){ const p=PRESETS[key]; if(!p) return;
    S.preset=key; S.label=p.label; S.c1=p.c1; S.c2=p.c2; S.text=p.text;
    S.subc=hexA(p.text,0.92); S.dimc=hexA(p.text,0.86);
    S.logo=p.logo; S.scene=true; S.sceneKey=p.sceneKey; S.sceneTint=p.sceneTint; customBg=null;
    S.capC1=p.capC1; S.capC2=p.capC2; S.capTop=p.capTop; syncInputs(); render(); }

  function bind(id,ev,fn){ const el=document.getElementById(id); if(el) el.addEventListener(ev,fn); }
  function val(id,v){ const el=document.getElementById(id); if(el && el.value!==undefined) el.value=v; }
  function toHex(c){ if(c.startsWith('#')) return c.length===4?('#'+c.slice(1).split('').map(x=>x+x).join('')):c;
    if(c.startsWith('rgb')){ const m=c.match(/\d+/g); return '#'+m.slice(0,3).map(n=>(+n).toString(16).padStart(2,'0')).join(''); } return '#ffffff'; }
  function syncInputs(){
    document.querySelectorAll('.preset').forEach(b=>b.classList.toggle('on',b.dataset.p===S.preset));
    document.querySelectorAll('.prodbtn').forEach(b=>b.classList.toggle('on',b.dataset.pr===S.product));
    document.querySelectorAll('.modebtn').forEach(b=>b.classList.toggle('on',b.dataset.m===S.mode));
    document.querySelectorAll('.logocol').forEach(b=>b.classList.toggle('on',b.dataset.c===S.logo));
    document.querySelectorAll('.fontbtn').forEach(b=>b.classList.toggle('on',b.dataset.f===S.font));
    document.body.dataset.product=S.product;
    val('f_label',S.label); val('f_line',S.line); val('f_ing',S.ing.join('\n'));
    val('f_vol',S.vol); val('f_sub',S.sub); val('f_c1',toHex(S.c1)); val('f_c2',toHex(S.c2)); val('f_text',toHex(S.text));
    val('f_labelSize',S.labelSize); val('f_lineY',S.lineY); val('f_logoScale',S.logoScale); val('f_logoY',S.logoY); val('f_sceneY',S.sceneY); val('f_sprayW',S.sprayW);
    val('f_oilBg',toHex(S.oilBg)); val('f_oilText',toHex(S.oilText)); val('f_oilTitleSize',S.oilTitleSize);
    const og=document.getElementById('f_oilGuide'); if(og) og.checked=S.oilGuide;
    const lo=document.getElementById('f_logoOn'); if(lo) lo.checked=S.logoOn;
    const it=document.getElementById('f_italic'); if(it) it.checked=S.italic;
    const sc=document.getElementById('f_scene'); if(sc) sc.checked=S.scene;
  }

  function attachUI(){
    document.querySelectorAll('.prodbtn').forEach(b=>b.addEventListener('click',()=>{ S.product=b.dataset.pr; if(b.dataset.pr==='oiltitle') S.logo='navy'; syncInputs(); render(); }));
    document.querySelectorAll('.preset').forEach(b=>b.addEventListener('click',()=>applyPreset(b.dataset.p)));
    document.querySelectorAll('.modebtn').forEach(b=>b.addEventListener('click',()=>{ S.mode=b.dataset.m; syncInputs(); render(); }));
    document.querySelectorAll('.logocol').forEach(b=>b.addEventListener('click',()=>{ S.logo=b.dataset.c; syncInputs(); render(); }));
    document.querySelectorAll('.fontbtn').forEach(b=>b.addEventListener('click',()=>{ S.font=b.dataset.f; syncInputs(); render(); }));
    bind('f_label','input',e=>{S.label=e.target.value; render();});
    bind('f_line','input',e=>{S.line=e.target.value; render();});
    bind('f_ing','input',e=>{S.ing=e.target.value.split('\n'); render();});
    bind('f_vol','input',e=>{S.vol=e.target.value; render();});
    bind('f_sub','input',e=>{S.sub=e.target.value; render();});
    bind('f_c1','input',e=>{S.c1=e.target.value; render();});
    bind('f_c2','input',e=>{S.c2=e.target.value; render();});
    bind('f_text','input',e=>{S.text=e.target.value; S.subc=hexA(e.target.value,0.92); S.dimc=hexA(e.target.value,0.86); render();});
    bind('f_labelSize','input',e=>{S.labelSize=+e.target.value; render();});
    bind('f_lineY','input',e=>{S.lineY=+e.target.value; render();});
    bind('f_logoOn','change',e=>{S.logoOn=e.target.checked; render();});
    bind('f_logoOn2','change',e=>{S.logoOn=e.target.checked; render();});
    bind('f_italic','change',e=>{S.italic=e.target.checked; render();});
    bind('f_scene','change',e=>{S.scene=e.target.checked; render();});
    bind('f_logoScale','input',e=>{S.logoScale=+e.target.value; render();});
    bind('f_logoY','input',e=>{S.logoY=+e.target.value; render();});
    bind('f_sceneY','input',e=>{S.sceneY=+e.target.value; render();});
    bind('f_sprayW','input',e=>{S.sprayW=+e.target.value; render();});
    bind('f_sprayTitleSize','input',e=>{S.sprayTitleSize=+e.target.value; render();});
    bind('f_sprayItalic','change',e=>{S.sprayItalic=e.target.checked; render();});
    bind('f_sprayShadow','input',e=>{S.sprayShadow=+e.target.value; render();});
    bind('f_sprayTextY','input',e=>{S.sprayTextY=+e.target.value; render();});
    bind('f_sprayLogoY','input',e=>{S.sprayLogoY=+e.target.value; render();});
    bind('f_bg','change',e=>{ const f=e.target.files[0]; if(!f) return;
      load(URL.createObjectURL(f)).then(img=>{ customBg=img; S.scene=true; syncInputs(); render(); }); });
    bind('f_bg2','change',e=>{ const f=e.target.files[0]; if(!f) return;
      load(URL.createObjectURL(f)).then(img=>{ customBg=img; render(); }); });
    bind('dl_body','click',()=>download('body'));
    bind('dl_cap','click',()=>download('cap'));
    bind('dl_spray','click',()=>download('spray'));
    bind('f_oilBg','input',e=>{S.oilBg=e.target.value; render();});
    bind('f_oilText','input',e=>{S.oilText=e.target.value; render();});
    bind('f_oilTitleSize','input',e=>{S.oilTitleSize=+e.target.value; render();});
    bind('f_logoOn3','change',e=>{S.logoOn=e.target.checked; render();});
    bind('f_oilGuide','change',e=>{S.oilGuide=e.target.checked; render();});
    bind('f_oilName','input',e=>{S.oilName=e.target.value; render();});
    bind('f_oilEN','input',e=>{S.oilEN=e.target.value; render();});
    bind('f_oilCopy','input',e=>{S.oilCopy=e.target.value; render();});
    bind('f_oilDesc','input',e=>{S.oilDesc=e.target.value; render();});
    bind('f_oilRows','input',e=>{S.oilRows=e.target.value; render();});
    bind('f_oilVText','input',e=>{S.oilVText=e.target.value; render();});
    bind('f_oilCaution','input',e=>{S.oilCaution=e.target.value; render();});
    bind('f_oilLeftX','input',e=>{S.oilLeftX=+e.target.value; render();});
    bind('f_oilCenterX','input',e=>{S.oilCenterX=+e.target.value; render();});
    bind('f_oilRightX','input',e=>{S.oilRightX=+e.target.value; render();});
    bind('dl_oil','click',()=>download('oil'));
    bind('f_otTitle','input',e=>{S.otTitle=e.target.value; render();});
    bind('f_otSub','input',e=>{S.otSub=e.target.value; render();});
    bind('f_otCap1','input',e=>{S.otCap1=e.target.value; render();});
    bind('f_otCap2','input',e=>{S.otCap2=e.target.value; render();});
    bind('f_otBg','input',e=>{S.otBg=e.target.value; render();});
    bind('f_otText','input',e=>{S.otText=e.target.value; render();});
    bind('f_otSize','input',e=>{S.otSize=+e.target.value; render();});
    bind('f_otWeight','input',e=>{S.otWeight=+e.target.value; render();});
    bind('f_otItalic','change',e=>{S.otItalic=e.target.checked; render();});
    bind('f_otLogoScale','input',e=>{S.otLogoScale=+e.target.value; render();});
    bind('f_otCapSize','input',e=>{S.otCapSize=+e.target.value; render();});
    bind('f_otCapSpace','input',e=>{S.otCapSpace=+e.target.value; render();});
    document.querySelectorAll('.otlogocol').forEach(b=>b.addEventListener('click',()=>{ S.otLogoColor=b.dataset.c;
      document.querySelectorAll('.otlogocol').forEach(x=>x.classList.toggle('on',x===b)); render(); }));
    bind('f_otBg2','change',e=>{ const f=e.target.files[0]; if(!f) return;
      load(URL.createObjectURL(f)).then(img=>{ customBg=img; S.otBgImg=true; const t=document.getElementById('f_otBgImg'); if(t) t.checked=true; render(); }); });
    bind('f_otBgImg','change',e=>{S.otBgImg=e.target.checked; render();});
    bind('f_logoOn4','change',e=>{S.logoOn=e.target.checked; render();});
    bind('dl_oiltitle','click',()=>download('oiltitle'));
    bind('dl_oiltitle_svg','click',downloadOilTitleSVG);
    bind('dl_oiltitle_bg','click',()=>{
      const W=1145,H=953,c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d');
      if(S.otBgImg && customBg) cover(x,customBg,0,0,W,H,0); else { x.fillStyle=S.otBg; x.fillRect(0,0,W,H); }
      c.toBlob(b=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='somnia-oil-title-bg-1145x953.png'; a.click(); },'image/png');
    });
    bind('dl_oiltitle_txt','click',()=>{
      const W=1145,H=953,T=S.otText,cx=W/2,c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d');
      const LG = S.otLogoColor==='navy' ? logoNavy : logoW;
      x.textAlign='center'; x.textBaseline='middle';
      x.font=`${S.otItalic?'italic ':''}${S.otWeight} ${S.otSize}px Outfit, sans-serif`;
      capsText(x,S.otTitle,cx,150,S.otSize,T,S.otSize*0.14,S.otWeight);
      x.strokeStyle=hexA(T,0.85); x.lineWidth=3; x.beginPath(); x.moveTo(150,200); x.lineTo(W-150,200); x.stroke();
      x.font=`${S.otSize*0.34}px Outfit, sans-serif`; x.fillStyle=hexA(T,0.92); x.fillText(S.otSub,cx,238);
      if(S.logoOn && LG){ const lw=420*S.otLogoScale, lh=lw*(LG.height/LG.width); x.drawImage(LG,cx-lw/2,H/2-lh/2,lw,lh); }
      capsText(x,S.otCap1,cx,778,S.otCapSize,hexA(T,0.95),S.otCapSpace,600);
      capsText(x,S.otCap2,cx,778+S.otCapSize+6,S.otCapSize*0.85,hexA(T,0.8),S.otCapSpace,500);
      c.toBlob(b=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='somnia-oil-title-text-1145x953.png'; a.click(); },'image/png');
    });
  }

  function imgDataURL(img){ if(!img) return null; const c=document.createElement('canvas');
    c.width=img.width||img.naturalWidth; c.height=img.height||img.naturalHeight;
    c.getContext('2d').drawImage(img,0,0); try{ return c.toDataURL('image/png'); }catch(e){ return null; } }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function downloadOilTitleSVG(){
    const W=1145,H=953,T=S.otText,cx=W/2;
    const LG = S.otLogoColor==='navy' ? logoNavy : logoW;
    const fam="Outfit, Arial, sans-serif";
    function spanned(text,sp){ // letter-spacing via attribute; keep editable
      return esc(text); }
    let bg = (S.otBgImg && customBg)
      ? `<image x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" href="${imgDataURL(customBg)}"/>`
      : `<rect x="0" y="0" width="${W}" height="${H}" fill="${S.otBg}"/>`;
    let logo='';
    if(S.logoOn && LG){ const lw=420*S.otLogoScale, lh=lw*(LG.height/LG.width);
      logo=`<image x="${(cx-lw/2).toFixed(1)}" y="${(H/2-lh/2).toFixed(1)}" width="${lw.toFixed(1)}" height="${lh.toFixed(1)}" href="${imgDataURL(LG)}"/>`; }
    const cap2y=778+S.otCapSize+6;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<g id="background">${bg}</g>
<g id="title">
<text x="${cx}" y="150" font-family="${fam}" font-size="${S.otSize}" font-weight="${S.otWeight}" ${S.otItalic?'font-style="italic"':''} letter-spacing="${(S.otSize*0.14).toFixed(1)}" fill="${T}" text-anchor="middle" dominant-baseline="middle">${spanned(S.otTitle)}</text>
<line x1="150" y1="200" x2="${W-150}" y2="200" stroke="${T}" stroke-opacity="0.85" stroke-width="3"/>
<text x="${cx}" y="238" font-family="${fam}" font-size="${(S.otSize*0.34).toFixed(1)}" fill="${T}" fill-opacity="0.92" text-anchor="middle" dominant-baseline="middle">${esc(S.otSub)}</text>
</g>
<g id="logo">${logo}</g>
<g id="captions">
<text x="${cx}" y="778" font-family="${fam}" font-size="${S.otCapSize}" font-weight="600" letter-spacing="${S.otCapSpace}" fill="${T}" fill-opacity="0.95" text-anchor="middle" dominant-baseline="middle">${esc(S.otCap1)}</text>
<text x="${cx}" y="${cap2y}" font-family="${fam}" font-size="${(S.otCapSize*0.85).toFixed(1)}" font-weight="500" letter-spacing="${S.otCapSpace}" fill="${T}" fill-opacity="0.8" text-anchor="middle" dominant-baseline="middle">${esc(S.otCap2)}</text>
</g>
</svg>`;
    const blob=new Blob([svg],{type:'image/svg+xml'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='somnia-oil-title-1145x953.svg'; a.click();
  }

  function download(mode){
    const W=mode==='body'?2000:mode==='cap'?1000:mode==='spray'?1254:mode==='oiltitle'?1145:4091,
          H=mode==='spray'?1682:mode==='oil'?4096:mode==='oiltitle'?953:W;
    const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const ctx=cv.getContext('2d');
    const pm=S.mode; if(mode==='body'||mode==='cap') S.mode=mode;
    if(mode==='oil'){ S._showGuide=false; renderOil(ctx); S._showGuide=true; }
    else if(mode==='oiltitle') renderOilTitle(ctx);
    else (mode==='body'?renderBody:mode==='cap'?renderCap:renderSpray)(ctx);
    S.mode=pm;
    const name = mode==='spray' ? 'somnia-room-spray-1254x1682'
      : mode==='oil' ? 'somnia-lavender-oil-4091x4096'
      : mode==='oiltitle' ? 'somnia-oil-title-1145x953'
      : `somnia-${S.label.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${mode}-${W}`;
    cv.toBlob(b=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name+'.png'; a.click(); },'image/png');
  }

  attachUI();
  Promise.all([
    load('assets/mockup/src-night.png').catch(()=>null),
    load('assets/mockup/night-purple.png').catch(()=>null),
    load('assets/mockup/night-pink.png').catch(()=>null),
    load('assets/logo-wordmark-white.png'),
  ]).then(([n,p,k,lw])=>{
    bg.navy=n; bg.purple=p; bg.pink=k; logoW=lw; logoNavy=tint(lw,'#23365a');
    return document.fonts ? document.fonts.ready : Promise.resolve();
  }).then(()=>{ ready=true; applyPreset('moonberry'); });
})();
