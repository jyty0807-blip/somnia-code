/* SOMNIA Detail Studio — Aroma (오일 & 룸스프레이): section nav, edit panel, PNG + hero GIF export */
(function(){
  'use strict';

  /* ---------- palette (brochure-studio mirror) ---------- */
  var COL = { Navy:'#0E1A3A', Ocean:'#1958B2', Plum:'#4B2E83', Lavender:'#B8A7E6', Mist:'#D0E6FA', Ivory:'#F6F2EA', White:'#FFFFFF' };
  var ORDER = ['Navy','Ocean','Plum','Lavender','Mist','Ivory','White'];
  function chips(cur, attr){
    return ORDER.map(function(n){ var hx=COL[n];
      return '<button class="cw'+(String(cur).toLowerCase()===hx.toLowerCase()?' on':'')+'" data-'+attr+'="'+hx+'" title="'+n+'" style="background:'+hx+'"></button>';
    }).join('');
  }

  /* ---------- state ---------- */
  var SECS = [];   // {key,label,frame,sec}
  var KEY='somnia_aroma_v1';
  var ST = load();
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY))||{}; }catch(e){ return {}; } }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(ST)); }catch(e){} }

  document.querySelectorAll('.frame').forEach(function(fr){
    SECS.push({ key:fr.dataset.sec, label:fr.dataset.label, frame:fr, sec:fr.querySelector('.sec') });
  });

  /* restore saved edits (text html, hidden, bg, hl, gradient, shadow) */
  function restore(){
    SECS.forEach(function(s){
      var d=ST[s.key]; if(!d) return;
      if(d.hidden) s.frame.classList.add('hidden-sec');
      if(d.bg) applyBg(s,d.bg);
      if(d.hl) s.sec.style.setProperty('--hl', d.hl);
      if(d.grad){ s.sec.style.setProperty('--g1',d.grad.g1); s.sec.style.setProperty('--g2',d.grad.g2); }
      if(d.shadow&&d.shadow.on) applyShadow(s, true, d.shadow.k);
      if(d.html){ for(var sel in d.html){ var el=s.sec.querySelector(sel); if(el) el.innerHTML=d.html[sel]; } }
    });
  }

  /* ---------- left rail ---------- */
  var seclist=document.getElementById('seclist');
  var EYE='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12C5 6.5 19 6.5 22 12C19 17.5 5 17.5 2 12Z"/><circle cx="12" cy="12" r="3"/><line class="slash" x1="3.5" y1="3.5" x2="20.5" y2="20.5"/></svg>';
  SECS.forEach(function(s,i){
    var it=document.createElement('div'); it.className='item'; it.dataset.key=s.key;
    it.innerHTML='<span class="ix">'+String(i+1).padStart(2,'0')+'</span><span class="nm">'+s.label+'</span>'+
      '<button class="eye'+(s.frame.classList.contains('hidden-sec')?' off':'')+'" title="표시/숨김">'+EYE+'</button>';
    it.addEventListener('click',function(e){ if(e.target.closest('.eye')) return; selectSec(s.key); });
    it.querySelector('.eye').addEventListener('click',function(e){ e.stopPropagation();
      var hid=s.frame.classList.toggle('hidden-sec'); this.classList.toggle('off',hid);
      ST[s.key]=ST[s.key]||{}; ST[s.key].hidden=hid; save();
    });
    seclist.appendChild(it);
  });

  var current=SECS[0].key;
  function selectSec(key){
    current=key;
    document.querySelectorAll('.seclist .item').forEach(function(it){ it.classList.toggle('on',it.dataset.key===key); });
    SECS.forEach(function(s){ s.frame.classList.toggle('sel', s.key===key); });
    var s=byKey(key);
    if(s && !s.frame.classList.contains('hidden-sec')) scrollToFrame(s.frame);
    buildPanel(key);
  }
  function scrollToFrame(frame){
    var stage=document.querySelector('.stage');
    var fr=frame.getBoundingClientRect(), st=stage.getBoundingClientRect();
    var delta=(fr.top-st.top)-(stage.clientHeight-fr.height)/2;
    stage.scrollTop=Math.max(0,stage.scrollTop+delta);
  }
  function byKey(k){ return SECS.filter(function(s){ return s.key===k; })[0]; }

  /* ---------- background / highlight helpers ---------- */
  function applyShadow(s,on,k){ s.sec.classList.toggle('sec--shadow',!!on); s.sec.style.setProperty('--sk',(k==null?1:k)); }
  function applyBg(s,hx){
    s.sec.style.background=hx;
    var dark = ['#0E1A3A','#1958B2','#4B2E83'].indexOf(hx.toUpperCase())>=0;
    s.sec.style.color = dark ? '#fff' : '';
  }
  /* global font color (전체 글자색) */
  var FONT_COLORS=[{n:'기본',hx:''},{n:'네이비',hx:'#0E1A3A'},{n:'딥플럼',hx:'#2C1F52'},{n:'잉크',hx:'#15171c'},{n:'오션',hx:'#1958B2'},{n:'코코아',hx:'#3a2d24'}];
  function applyFontColor(hx){
    var st=document.querySelector('.studio');
    if(hx){ st.style.setProperty('--txt',hx); st.classList.add('txtcol'); }
    else { st.classList.remove('txtcol'); st.style.removeProperty('--txt'); }
  }

  /* ---------- right panel ---------- */
  var pTitle=document.getElementById('pTitle'), pHint=document.getElementById('pHint'), pBody=document.getElementById('pBody');
  var BG_KEYS=['notes','blend','howto','formula','spec','notice'];
  var HL_KEYS=['notes','blend'];
  var IMG_KEYS=['hero','blend'];
  function buildPanel(key){
    var s=byKey(key); pTitle.textContent=s.label;
    var rows=[];
    // global font color (shown on every section)
    var curTxt=(ST.__g&&ST.__g.txt)||'';
    rows.push('<h2>전체 글자색</h2><p class="hint" style="margin-top:-2px">모든 섹션의 본문·제목 글자색을 한 번에 바꿔요. (히어로 제외)</p>'+
      '<div class="cwrap">'+FONT_COLORS.map(function(c){
        var on=String(curTxt).toLowerCase()===c.hx.toLowerCase();
        var bg=c.hx||'linear-gradient(135deg,#bbb,#eee)';
        return '<button class="cw'+(on?' on':'')+'" data-txt="'+c.hx+'" title="'+c.n+'" style="background:'+bg+'"></button>';
      }).join('')+'</div>');
    // editable text fields per section
    var fields=textFields(key);
    if(fields.length){
      rows.push('<h2>텍스트</h2>');
      fields.forEach(function(f){
        var el=s.sec.querySelector(f.sel);
        rows.push('<div class="field"><label>'+f.lab+'</label><textarea data-sel="'+f.sel+'">'+(el?htmlToText(el.innerHTML):'')+'</textarea></div>');
      });
      rows.push('<p class="hint">줄바꿈은 Enter로 입력해요. 캔버스에서 직접 클릭해 편집할 수도 있어요.</p>');
      rows.push('<h2>강조 (캔버스에서 드래그로 선택 후)</h2>'+
        '<div class="btnrow" style="flex-direction:row;flex-wrap:wrap;gap:7px">'+
        '<button class="btn btn--g" data-emph="ac" style="flex:1">색 텍스트</button>'+
        '<button class="btn btn--g" data-emph="hl" style="flex:1">형광펜</button>'+
        '<button class="btn btn--g" data-emph="clear" style="flex:1">해제</button></div>');
    }
    // image hint (sections with an image-slot)
    if(IMG_KEYS.indexOf(key)>=0){
      rows.push('<h2>제품 이미지</h2><p class="hint">아래 이미지 영역에 사진을 드래그해 넣고, 채운 뒤 우상단 교체·삭제 버튼으로 바꿀 수 있어요. (cover 영역은 더블클릭 후 드래그·스크롤로 위치·확대 조절)</p>');
    }
    // background swatch (flat sections)
    if(BG_KEYS.indexOf(key)>=0){
      var curBg=(ST[key]&&ST[key].bg)||'';
      rows.push('<h2>배경색</h2><div class="cfield"><span class="clab">배경</span><div class="cwrap">'+
        '<button class="cw'+(!curBg?' on':'')+'" data-bg="" title="기본" style="background:linear-gradient(135deg,#444,#888)"></button>'+
        chips(curBg,'bg')+'</div></div>');
    }
    // gradient background (hero)
    if(key==='hero'){
      var gd=(ST[key]&&ST[key].grad)||{g1:'#0E1A3A',g2:'#1c3168'};
      rows.push('<h2>배경 그라데이션</h2>'+
        '<div class="cfield"><span class="clab">위 색</span><div class="cwrap">'+chips(gd.g1,'g1')+'</div></div>'+
        '<div class="cfield"><span class="clab">아래 색</span><div class="cwrap">'+chips(gd.g2,'g2')+'</div></div>');
    }
    // highlight color (sections that use .hl)
    if(HL_KEYS.indexOf(key)>=0){
      var curHl=(ST[key]&&ST[key].hl)||'#D0E6FA';
      rows.push('<h2>형광펜 색</h2><div class="cfield"><span class="clab">하이라이트</span><div class="cwrap">'+
        '<button class="cw" data-hl="#bfe9c4" style="background:#bfe9c4"></button>'+
        '<button class="cw" data-hl="#FFE9A8" style="background:#FFE9A8"></button>'+
        chips(curHl,'hl')+'</div></div>');
    }
    // hero image → GIF
    if(key==='hero'){
      var hv=document.querySelector('.s-hero .herovid');
      rows.push('<h2>히어로 영상 → GIF</h2><p class="hint">짧은 영상을 넣으면 이미지 영역이 움직이고, 저해상 루프 GIF로 추출돼요. (소리 없음, 2~4초 권장)</p>'+
        '<div class="btnrow"><label class="btn btn--g" style="text-align:center;cursor:pointer">＋ 영상 넣기<input type="file" accept="video/*" data-herovid hidden></label>'+
        '<div class="slider"><label><span>길이(초)</span><span class="rdo" data-gdurv>'+( (ST.hero&&ST.hero.gdur)||3 )+'</span></label><input type="range" data-gdur min="1" max="6" step="0.5" value="'+((ST.hero&&ST.hero.gdur)||3)+'"></div>'+
        '<button class="btn" data-herogif '+((hv&&hv.src)?'':'disabled')+'>히어로 GIF 저장</button></div>');
    }

    // shadow toggle + intensity (전 요소 그림자)
    var sh=(ST[key]&&ST[key].shadow)||{on:false,k:1};
    rows.push('<h2>그림자</h2>'+
      '<label class="field" style="display:flex;align-items:center;gap:9px;cursor:pointer"><input type="checkbox" data-shadow'+(sh.on?' checked':'')+'><span style="font-size:13px;color:#cdd9f5">전 요소 그림자 넣기</span></label>'+
      '<div class="slider"><label><span>강도</span><span class="rdo" data-shk>'+(sh.k==null?1:sh.k)+'</span></label><input type="range" data-shadowk min="0" max="2.5" step="0.1" value="'+(sh.k==null?1:sh.k)+'"></div>');
    // export
    rows.push('<h2>내보내기</h2><div class="btnrow">'+
      '<button class="btn" data-png-this>이 섹션 PNG</button>'+
      '</div><div class="msg" id="pMsg"></div>');

    pBody.innerHTML=rows.join('');

    // wire textareas
    pBody.querySelectorAll('textarea[data-sel]').forEach(function(ta){
      ta.addEventListener('input',function(){
        var el=s.sec.querySelector(ta.dataset.sel); if(!el) return;
        setElText(el, ta.value);
        recordHtml(key, ta.dataset.sel, el.innerHTML);
      });
    });
    // bg chips
    pBody.querySelectorAll('[data-bg]').forEach(function(b){
      b.addEventListener('click',function(){
        var hx=b.getAttribute('data-bg');
        ST[key]=ST[key]||{};
        if(hx){ ST[key].bg=hx; applyBg(s,hx); } else { delete ST[key].bg; s.sec.style.background=''; s.sec.style.color=''; }
        save(); pBody.querySelectorAll('[data-bg]').forEach(function(x){x.classList.remove('on');}); b.classList.add('on');
      });
    });
    // gradient chips (g1=위, g2=아래)
    ['g1','g2'].forEach(function(stop){
      pBody.querySelectorAll('[data-'+stop+']').forEach(function(b){
        b.addEventListener('click',function(){
          var hx=b.getAttribute('data-'+stop);
          ST[key]=ST[key]||{}; var g=ST[key].grad||{g1:'#0E1A3A',g2:'#1c3168'};
          g[stop]=hx; ST[key].grad=g; save();
          s.sec.style.setProperty('--g1',g.g1); s.sec.style.setProperty('--g2',g.g2);
          pBody.querySelectorAll('[data-'+stop+']').forEach(function(x){x.classList.remove('on');}); b.classList.add('on');
        });
      });
    });
    // hl chips
    pBody.querySelectorAll('[data-hl]').forEach(function(b){
      b.addEventListener('click',function(){
        var hx=b.getAttribute('data-hl'); s.sec.style.setProperty('--hl',hx);
        ST[key]=ST[key]||{}; ST[key].hl=hx; save();
        pBody.querySelectorAll('[data-hl]').forEach(function(x){x.classList.remove('on');}); b.classList.add('on');
      });
    });
    pBody.querySelector('[data-png-this]').addEventListener('click',function(){ exportPNG(s); });
    // global font color chips
    pBody.querySelectorAll('[data-txt]').forEach(function(b){
      b.addEventListener('click',function(){
        var hx=b.getAttribute('data-txt');
        ST.__g=ST.__g||{}; ST.__g.txt=hx; save(); applyFontColor(hx);
        pBody.querySelectorAll('[data-txt]').forEach(function(x){x.classList.remove('on');}); b.classList.add('on');
      });
    });
    // shadow controls
    var shTog=pBody.querySelector('[data-shadow]'), shK=pBody.querySelector('[data-shadowk]');
    function saveShadow(){ ST[key]=ST[key]||{}; ST[key].shadow={on:shTog.checked,k:+shK.value}; save(); }
    if(shTog) shTog.addEventListener('change',function(){ applyShadow(s,shTog.checked,+shK.value); saveShadow(); });
    if(shK) shK.addEventListener('input',function(){ var l=pBody.querySelector('[data-shk]'); if(l) l.textContent=shK.value;
      if(shTog.checked) applyShadow(s,true,+shK.value); saveShadow(); });
    // hero video controls
    var hvIn=pBody.querySelector('[data-herovid]'), hgifBtn=pBody.querySelector('[data-herogif]');
    var gdur=pBody.querySelector('[data-gdur]');
    if(gdur) gdur.addEventListener('input',function(){ var l=pBody.querySelector('[data-gdurv]'); if(l) l.textContent=gdur.value;
      ST.hero=ST.hero||{}; ST.hero.gdur=+gdur.value; save(); });
    if(hvIn) hvIn.addEventListener('change',function(e){ var f=e.target.files[0]; if(!f) return;
      var box=document.querySelector('.s-hero .heroimg');
      var v=box.querySelector('.herovid');
      if(!v){ v=document.createElement('video'); v.className='herovid'; v.muted=true; v.loop=true; v.playsInline=true; v.setAttribute('playsinline',''); box.appendChild(v); }
      v.src=URL.createObjectURL(f); v.load();
      v.play().catch(function(){});
      box.classList.add('hasvid');
      if(hgifBtn) hgifBtn.disabled=false;
    });
    if(hgifBtn) hgifBtn.addEventListener('click',function(){ exportHeroGIF(); });
    // emphasis buttons (wrap current selection inside this section)
    pBody.querySelectorAll('[data-emph]').forEach(function(b){
      b.addEventListener('mousedown',function(e){ e.preventDefault(); }); // keep selection
      b.addEventListener('click',function(){ applyEmph(s, b.getAttribute('data-emph')); });
    });
  }

  function textFields(key){
    switch(key){
      case 'hero': return [{sel:"[data-ed='hero-eyebrow']",lab:'eyebrow'},{sel:"[data-ed='hero-h2']",lab:'헤드라인'},{sel:"[data-ed='hero-lead']",lab:'리드'}];
      case 'notes': return [{sel:"[data-ed='notes-h2']",lab:'제목'},
        {sel:"[data-ed='note1-nm']",lab:'탑 노트 향'},{sel:"[data-ed='note1-cp']",lab:'탑 노트 설명'},
        {sel:"[data-ed='note2-nm']",lab:'하트 노트 향'},{sel:"[data-ed='note2-cp']",lab:'하트 노트 설명'},
        {sel:"[data-ed='note3-nm']",lab:'베이스 노트 향'},{sel:"[data-ed='note3-cp']",lab:'베이스 노트 설명'}];
      case 'blend': return [{sel:"[data-ed='blend-eyebrow']",lab:'eyebrow'},{sel:"[data-ed='blend-h2']",lab:'헤드라인'},{sel:"[data-ed='blend-body']",lab:'본문'}];
      case 'howto': return [{sel:"[data-ed='howto-h2']",lab:'제목'},
        {sel:"[data-ed='oil-t']",lab:'오일 제목'},{sel:"[data-ed='oil-1']",lab:'오일 스텝1'},{sel:"[data-ed='oil-2']",lab:'오일 스텝2'},{sel:"[data-ed='oil-3']",lab:'오일 스텝3'},
        {sel:"[data-ed='spray-t']",lab:'스프레이 제목'},{sel:"[data-ed='spray-1']",lab:'스프레이 스텝1'},{sel:"[data-ed='spray-2']",lab:'스프레이 스텝2'},{sel:"[data-ed='spray-3']",lab:'스프레이 스텝3'}];
      case 'formula': return [{sel:"[data-ed='formula-h2']",lab:'제목'},
        {sel:"[data-ed='f1-k']",lab:'특징1'},{sel:"[data-ed='f1-d']",lab:'특징1 설명'},
        {sel:"[data-ed='f2-k']",lab:'특징2'},{sel:"[data-ed='f2-d']",lab:'특징2 설명'},
        {sel:"[data-ed='f3-k']",lab:'특징3'},{sel:"[data-ed='f3-d']",lab:'특징3 설명'},
        {sel:"[data-ed='f4-k']",lab:'특징4'},{sel:"[data-ed='f4-d']",lab:'특징4 설명'}];
      case 'spec': return [{sel:"[data-ed='spec-h2']",lab:'제목'},{sel:"[data-ed='oilspec-h4']",lab:'오일 제품명'},{sel:"[data-ed='sprayspec-h4']",lab:'스프레이 제품명'}];
      case 'notice': return [{sel:"[data-ed='notice-h2']",lab:'제목'},{sel:"[data-ed='notice-disc']",lab:'각주'}];
    }
    return [];
  }

  function recordHtml(key,sel,html){ ST[key]=ST[key]||{}; ST[key].html=ST[key].html||{}; ST[key].html[sel]=html; save(); }

  // strip edit markup -> readable text with newlines for the textarea
  function htmlToText(html){
    var d=document.createElement('div'); d.innerHTML=html.replace(/<br\b[^>]*>/gi,'\n');
    return d.textContent.replace(/\u00a0/g,' ').replace(/[ \t]+\n/g,'\n').trim();
  }
  function setElText(el, text){
    var html=text.split('\n').map(function(line){ return escapeHtml(line); }).join('<br>');
    el.innerHTML=html;
  }
  function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  /* apply/remove accent or highlight on the current selection within a section */
  function applyEmph(s, kind){
    var sel=window.getSelection(); if(!sel||sel.rangeCount===0||sel.isCollapsed){ msg('캔버스에서 글자를 드래그해 선택한 뒤 눌러주세요'); return; }
    var range=sel.getRangeAt(0);
    if(!s.sec.contains(range.commonAncestorContainer)){ msg('이 섹션 안의 텍스트를 선택해주세요'); return; }
    var host=range.commonAncestorContainer; while(host && host.nodeType===3) host=host.parentNode;
    var editable=host.closest('[contenteditable]'); if(!editable){ msg('편집 가능한 텍스트를 선택해주세요'); return; }
    if(kind==='clear'){
      editable.querySelectorAll('.ac,.hl').forEach(function(sp){
        if(range.intersectsNode(sp)){ var p=sp.parentNode; while(sp.firstChild) p.insertBefore(sp.firstChild,sp); p.removeChild(sp); }
      });
      editable.querySelectorAll('.ac,.hl').forEach(function(sp){ if(!sp.textContent.trim()) sp.remove(); });
      editable.normalize();
    } else {
      var span=document.createElement('span'); span.className=kind;
      try{ range.surroundContents(span); }
      catch(e){ var frag=range.extractContents(); span.appendChild(frag); range.insertNode(span); }
    }
    sel.removeAllRanges();
    var fsel=cssPath(editable,s.sec); if(fsel) recordHtml(s.key,fsel,editable.innerHTML);
    var ta=pBody.querySelector('textarea[data-sel="'+fsel+'"]'); if(ta) ta.value=htmlToText(editable.innerHTML);
  }

  /* contenteditable edits in canvas -> persist */
  document.querySelectorAll('.sec [contenteditable]').forEach(function(el){
    el.addEventListener('input',function(){
      var s=SECS.filter(function(x){return x.sec.contains(el);})[0]; if(!s) return;
      var sel=cssPath(el,s.sec); if(sel){ recordHtml(s.key,sel,el.innerHTML);
        var ta=pBody.querySelector('textarea[data-sel="'+sel+'"]'); if(ta && ta.value!==el.innerHTML) ta.value=htmlToText(el.innerHTML);
      }
    });
    el.addEventListener('focus',function(){ var s=SECS.filter(function(x){return x.sec.contains(el);})[0]; if(s&&s.key!==current) selectSec(s.key); });
  });
  function cssPath(el,root){
    if(el.dataset && el.dataset.ed) return "[data-ed='"+el.dataset.ed+"']";
    var s=SECS.filter(function(x){return x.sec===root;})[0]; if(!s) return null;
    var fs=textFields(s.key);
    for(var i=0;i<fs.length;i++){ if(root.querySelector(fs[i].sel)===el) return fs[i].sel; }
    return null;
  }

  /* ---------- zoom ---------- */
  var strip=document.getElementById('strip'), zoom=document.getElementById('zoom'), zoomv=document.getElementById('zoomv');
  function applyZoom2(){ var z=(+zoom.value)/100; strip.style.transform='scale('+z+')'; strip.style.transformOrigin='top center'; zoomv.textContent=zoom.value+'%';
    strip.style.marginBottom=(strip.scrollHeight*(z-1))+'px';
  }
  zoom.addEventListener('input',applyZoom2);

  /* ---------- export helpers ---------- */
  var LIB='https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js';
  var GIFLIB='https://cdn.jsdelivr.net/npm/gif.js.optimized@1.0.1/dist/gif.js';
  var GIFWORKER='https://cdn.jsdelivr.net/npm/gif.js.optimized@1.0.1/dist/gif.worker.js';
  var _workerBlobURL=null;
  async function workerURL(){ if(_workerBlobURL) return _workerBlobURL;
    var res=await fetch(GIFWORKER); var txt=await res.text();
    _workerBlobURL=URL.createObjectURL(new Blob([txt],{type:'application/javascript'}));
    return _workerBlobURL;
  }
  function loadScript(src,test){ return (test&&test()) ? Promise.resolve() : new Promise(function(res,rej){ var sc=document.createElement('script'); sc.src=src; sc.onload=res; sc.onerror=function(){rej(new Error('load fail: '+src));}; document.head.appendChild(sc); }); }
  function msg(t){ var m=document.getElementById('pMsg'); if(m){ m.style.display='block'; m.textContent=t; } }

  // swap shadow-DOM <image-slot> for a plain div during capture
  function swapSlots(root){
    var subs=[];
    root.querySelectorAll('image-slot').forEach(function(slot){
      var sr=slot.shadowRoot; if(!sr) return;
      var frame=sr.querySelector('.frame'), img=sr.querySelector('.frame img');
      var cs=getComputedStyle(slot), fcs=frame?getComputedStyle(frame):null;
      var div=document.createElement('div');
      div.style.cssText='width:'+cs.width+';height:'+cs.height+';position:relative;display:block;overflow:hidden';
      if(fcs){ div.style.borderRadius=fcs.borderRadius; if(fcs.clipPath&&fcs.clipPath!=='none') div.style.clipPath=fcs.clipPath; }
      if(slot.hasAttribute('data-filled') && img && img.getAttribute('src')){
        var ics=getComputedStyle(img), im=document.createElement('img'); im.src=img.src;
        im.style.cssText='position:absolute;max-width:none;width:'+ics.width+';height:'+ics.height+';left:'+ics.left+';top:'+ics.top+';transform:translate(-50%,-50%)';
        div.appendChild(im);
      } else { div.style.background='rgba(14,26,58,.06)'; }
      var parent=slot.parentNode, marker=slot.nextSibling; parent.insertBefore(div,slot); parent.removeChild(slot);
      subs.push({slot:slot,div:div,parent:parent,marker:marker});
    });
    return function(){ subs.forEach(function(s){ s.parent.insertBefore(s.slot,s.marker); s.div.remove(); }); };
  }

  function captureNode(node, w, h, scale){
    var prev=node.style.transform; node.style.transform='none';
    var rs=swapSlots(node);
    // html-to-image errors on a <video> with no src — detach empty ones during capture
    var vids=[];
    node.querySelectorAll('video').forEach(function(v){ if(!v.getAttribute('src')){ vids.push({v:v,p:v.parentNode,n:v.nextSibling}); v.parentNode.removeChild(v); } });
    function restore(){ rs(); node.style.transform=prev; vids.forEach(function(o){ o.p.insertBefore(o.v,o.n); }); }
    return window.htmlToImage.toPng(node,{ width:w, height:h, pixelRatio:scale||2, cacheBust:true, skipFonts:true,
      style:{ transform:'none', margin:'0', boxShadow:'none' } })
      .then(function(url){ restore(); return url; },
            function(e){ restore(); throw e; });
  }

  function download(url,name){ var a=document.createElement('a'); a.href=url; a.download=name; a.click(); }

  async function exportPNG(s){
    try{
      msg('준비 중…'); await loadScript(LIB,function(){return window.htmlToImage;});
      if(document.fonts&&document.fonts.ready){ try{ await document.fonts.ready; }catch(e){} }
      msg('저장 중… '+s.label);
      var url=await captureNode(s.sec, 1000, s.sec.offsetHeight, 2);
      download(url,'somnia-aroma-'+s.key+'.png');
      msg('완료 ✓');
    }catch(e){ msg('실패 — '+(e.message||e)); console.error(e); }
  }

  async function exportAll(){
    try{
      await loadScript(LIB,function(){return window.htmlToImage;});
      if(document.fonts&&document.fonts.ready){ try{ await document.fonts.ready; }catch(e){} }
      for(var i=0;i<SECS.length;i++){ var s=SECS[i]; if(s.frame.classList.contains('hidden-sec')) continue;
        var url=await captureNode(s.sec, 1000, s.sec.offsetHeight, 2);
        download(url,'somnia-aroma-'+String(i+1).padStart(2,'0')+'-'+s.key+'.png');
        await new Promise(function(r){ setTimeout(r,300); });
      }
    }catch(e){ alert('내보내기 실패: '+(e.message||e)); console.error(e); }
  }

  async function exportStrip(){
    try{
      await loadScript(LIB,function(){return window.htmlToImage;});
      if(document.fonts&&document.fonts.ready){ try{ await document.fonts.ready; }catch(e){} }
      var stack=document.createElement('div'); stack.style.cssText='width:1000px;background:#fff;position:fixed;left:-99999px;top:0';
      var clones=[];
      SECS.forEach(function(s){ if(s.frame.classList.contains('hidden-sec')) return;
        var c=s.sec.cloneNode(true); stack.appendChild(c); clones.push(c); });
      document.body.appendChild(stack);
      var url=await captureNode(stack, 1000, stack.offsetHeight, 2);
      document.body.removeChild(stack);
      download(url,'somnia-aroma-full.png');
    }catch(e){ alert('내보내기 실패: '+(e.message||e)); console.error(e); }
  }

  /* ---------- GIF: hero video loop ---------- */
  async function exportHeroGIF(){
    try{
      var hero=byKey('hero').sec, v=hero.querySelector('.herovid');
      if(!v||!v.src){ msg('먼저 영상을 넣어주세요'); return; }
      msg('GIF 준비 중…');
      await loadScript(LIB,function(){return window.htmlToImage;});
      await loadScript(GIFLIB,function(){return window.GIF;});
      var wurl=await workerURL();
      if(document.fonts&&document.fonts.ready){ try{ await document.fonts.ready; }catch(e){} }
      if(!v.videoWidth){ await new Promise(function(r){ v.addEventListener('loadeddata',r,{once:true}); }); }
      var OUT=460, R=OUT/1000;
      var W=OUT, H=Math.round(hero.offsetHeight*R);
      var box=hero.querySelector('.heroimg');
      var rx=box.offsetLeft*R, ry=box.offsetTop*R, rw=box.offsetWidth*R, rh=box.offsetHeight*R, rr=24*R;
      var wasPlaying=!v.paused; v.pause();
      var vParent=v.parentNode, vNext=v.nextSibling; vParent.removeChild(v);
      var staticURL;
      try{ staticURL=await captureNode(hero, 1000, hero.offsetHeight, R); }
      finally{ vParent.insertBefore(v, vNext); }
      var staticImg=await new Promise(function(res){ var im=new Image(); im.onload=function(){res(im);}; im.src=staticURL; });
      var N=16, dur=Math.min(v.duration||3, (ST.hero&&ST.hero.gdur)||3);
      var gif=new window.GIF({workers:2, quality:12, width:W, height:H, workerScript:wurl, repeat:0});
      var cv=document.createElement('canvas'); cv.width=W; cv.height=H; var ctx=cv.getContext('2d');
      function roundClip(){ ctx.beginPath(); ctx.moveTo(rx+rr,ry); ctx.arcTo(rx+rw,ry,rx+rw,ry+rh,rr); ctx.arcTo(rx+rw,ry+rh,rx,ry+rh,rr); ctx.arcTo(rx,ry+rh,rx,ry,rr); ctx.arcTo(rx,ry,rx+rw,ry,rr); ctx.closePath(); }
      function coverRect(img){ var ir=img.videoWidth/img.videoHeight, r=rw/rh, sw,sh,sx,sy;
        if(ir>r){ sh=img.videoHeight; sw=sh*r; sx=(img.videoWidth-sw)/2; sy=0; } else { sw=img.videoWidth; sh=sw/r; sx=0; sy=(img.videoHeight-sh)/2; }
        ctx.drawImage(img,sx,sy,sw,sh,rx,ry,rw,rh); }
      for(var i=0;i<N;i++){
        var t=dur*i/N;
        v.currentTime=t;
        await new Promise(function(res){ v.addEventListener('seeked',res,{once:true}); setTimeout(res,300); });
        ctx.clearRect(0,0,W,H);
        ctx.drawImage(staticImg,0,0,W,H);
        ctx.save(); roundClip(); ctx.clip(); coverRect(v); ctx.restore();
        gif.addFrame(ctx,{copy:true, delay: Math.round(dur/N*1000)});
        msg('GIF 렌더 '+(i+1)+'/'+N);
      }
      if(wasPlaying) v.play().catch(function(){});
      gif.on('progress',function(p){ msg('GIF 인코딩 '+Math.round(p*100)+'%'); });
      gif.on('finished',function(b){ download(URL.createObjectURL(b),'somnia-aroma-hero-loop.gif'); msg('GIF 완료 ✓ ('+Math.round(b.size/1024)+'KB)'); });
      gif.render();
    }catch(e){ msg('GIF 실패 — '+(e.message||e)); console.error(e); }
  }

  /* ---------- secbar + rail buttons ---------- */
  document.querySelectorAll('.frame').forEach(function(fr){
    var s=byKey(fr.dataset.sec);
    var pngb=fr.querySelector('[data-png]'); if(pngb) pngb.addEventListener('click',function(e){ e.stopPropagation(); exportPNG(s); });
    fr.addEventListener('mousedown',function(e){ if(!e.target.closest('[contenteditable]') && !e.target.closest('.secbar')) selectSec(fr.dataset.sec); });
  });
  document.getElementById('dlAll').addEventListener('click',exportAll);
  document.getElementById('dlStrip').addEventListener('click',exportStrip);

  /* ---------- init ---------- */
  restore();
  if(ST.__g&&ST.__g.txt) applyFontColor(ST.__g.txt);
  applyZoom2();
  selectSec(SECS[0].key);
})();
