/* SOMNIA Detail Studio — section nav, edit panel, PNG + GIF export */
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
  var KEY='somnia_detail_v1';
  var ST = load();
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY))||{}; }catch(e){ return {}; } }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(ST)); }catch(e){} }

  document.querySelectorAll('.frame').forEach(function(fr){
    SECS.push({ key:fr.dataset.sec, label:fr.dataset.label, frame:fr, sec:fr.querySelector('.sec') });
  });

  /* restore saved edits (text html, hidden, bg, hl) */
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
    // restore chart values/highlight
    if(ST.chart){ var bars=chartBars();
      if(ST.chart.vals) bars.forEach(function(b,i){ if(ST.chart.vals[i]!=null) b.dataset.val=ST.chart.vals[i]; });
      if(ST.chart.hot!=null) bars.forEach(function(b,i){ b.classList.toggle('hot', i===ST.chart.hot); });
    }
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
    if(s && !s.frame.classList.contains('hidden-sec')) s.frame.scrollIntoView({block:'center',behavior:'smooth'});
    buildPanel(key);
  }
  function byKey(k){ return SECS.filter(function(s){ return s.key===k; })[0]; }

  /* ---------- background / highlight helpers ---------- */
  function applyShadow(s,on,k){ s.sec.classList.toggle('sec--shadow',!!on); s.sec.style.setProperty('--sk',(k==null?1:k)); }
  function applyBg(s,hx){
    // flat sections honor a background swatch; hero/gif keep their gradient unless overridden
    s.sec.style.background=hx;
    // keep text legible on dark picks
    var dark = ['#0E1A3A','#1958B2','#4B2E83'].indexOf(hx.toUpperCase())>=0;
    s.sec.style.color = dark ? '#fff' : '';
  }

  /* ---------- right panel ---------- */
  var pTitle=document.getElementById('pTitle'), pHint=document.getElementById('pHint'), pBody=document.getElementById('pBody');
  function buildPanel(key){
    var s=byKey(key); pTitle.textContent=s.label;
    var rows=[];
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
    // background swatch (flat sections)
    if(['points','detail','flavor','usage'].indexOf(key)>=0){
      var curBg=(ST[key]&&ST[key].bg)||'';
      rows.push('<h2>배경색</h2><div class="cfield"><span class="clab">배경</span><div class="cwrap">'+
        '<button class="cw'+(!curBg?' on':'')+'" data-bg="" title="기본" style="background:linear-gradient(135deg,#444,#888)"></button>'+
        chips(curBg,'bg')+'</div></div>');
    }
    // gradient background (hero/gif): pick top & bottom color separately
    if(['hero','gif'].indexOf(key)>=0){
      var gd=(ST[key]&&ST[key].grad)|| (key==='hero'?{g1:'#0E1A3A',g2:'#1c3168'}:{g1:'#4B2E83',g2:'#34155f'});
      rows.push('<h2>배경 그라데이션</h2>'+
        '<div class="cfield"><span class="clab">위 색</span><div class="cwrap">'+chips(gd.g1,'g1')+'</div></div>'+
        '<div class="cfield"><span class="clab">아래 색</span><div class="cwrap">'+chips(gd.g2,'g2')+'</div></div>');
    }
    // highlight color (sections that use .hl)
    if(['points','detail'].indexOf(key)>=0){
      var curHl=(ST[key]&&ST[key].hl)|| (key==='detail'?'#bfe9c4':'#D0E6FA');
      rows.push('<h2>형광펜 색</h2><div class="cfield"><span class="clab">하이라이트</span><div class="cwrap">'+
        '<button class="cw" data-hl="#bfe9c4" style="background:#bfe9c4"></button>'+
        '<button class="cw" data-hl="#FFE9A8" style="background:#FFE9A8"></button>'+
        chips(curHl,'hl')+'</div></div>');
    }
    // image reframe (hero)
    if(key==='hero'){
      rows.push('<h2>제품 이미지</h2><p class="hint">아래 영역에 사진을 드래그해 넣고, 넣은 뒤 이미지를 드래그·스크롤하면 위치·확대(리프레임)가 조절돼요.</p>');
      var hv=document.querySelector('.s-hero .herovid');
      rows.push('<h2>히어로 영상 → GIF</h2><p class="hint">짧은 영상을 넣으면 이미지 영역이 움직이고, 저해상 루프 GIF로 추출돼요. (소리 없음, 2~4초 권장)</p>'+
        '<div class="btnrow"><label class="btn btn--g" style="text-align:center;cursor:pointer">＋ 영상 넣기<input type="file" accept="video/*" data-herovid hidden></label>'+
        '<div class="slider"><label><span>길이(초)</span><span class="rdo" data-gdurv>'+( (ST.hero&&ST.hero.gdur)||3 )+'</span></label><input type="range" data-gdur min="1" max="6" step="0.5" value="'+((ST.hero&&ST.hero.gdur)||3)+'"></div>'+
        '<button class="btn'+(hv&&hv.src?'':' '+'')+'" data-herogif '+((hv&&hv.src)?'':'disabled')+'>히어로 GIF 저장</button></div>');
    }
    // chart values (live)
    if(key==='chart'){
      var cbars=chartBars();
      rows.push('<h2>막대 수치 (실시간 반영)</h2><p class="hint">값을 옮기면 막대 길이가 즉시 바뀌어요. 가장 큰 값이 100% 기준이에요.</p>');
      cbars.forEach(function(b,i){
        var nm=b.querySelector('.blab').textContent.trim()||('막대 '+(i+1));
        rows.push('<div class="slider"><label><span>'+nm+'</span><span class="rdo" data-vlabel="'+i+'">'+(+b.dataset.val||0)+'</span></label>'+
          '<input type="range" data-bar="'+i+'" min="0" max="100" step="1" value="'+(+b.dataset.val||0)+'"></div>');
      });
      rows.push('<h2>강조 막대</h2><div class="field"><select data-charthot>'+
        cbars.map(function(b,i){ return '<option value="'+i+'"'+(b.classList.contains('hot')?' selected':'')+'>'+(b.querySelector('.blab').textContent.trim()||('막대 '+(i+1)))+'</option>'; }).join('')+
        '<option value="-1"'+(cbars.some(function(b){return b.classList.contains('hot');})?'':' selected')+'>강조 없음</option></select></div>');
    }

    // shadow toggle + intensity (전 요소 그림자)
    var sh=(ST[key]&&ST[key].shadow)||{on:false,k:1};
    rows.push('<h2>그림자</h2>'+
      '<label class="field" style="display:flex;align-items:center;gap:9px;cursor:pointer"><input type="checkbox" data-shadow'+(sh.on?' checked':'')+'><span style="font-size:13px;color:#cdd9f5">전 요소 그림자 넣기</span></label>'+
      '<div class="slider"><label><span>강도</span><span class="rdo" data-shk>'+(sh.k==null?1:sh.k)+'</span></label><input type="range" data-shadowk min="0" max="2.5" step="0.1" value="'+(sh.k==null?1:sh.k)+'"></div>');
    // export
    rows.push('<h2>내보내기</h2><div class="btnrow">'+
      '<button class="btn" data-png-this>이 섹션 PNG</button>'+
      (key==='gif'?'<button class="btn btn--g" data-gif-this>이 섹션 GIF</button>':'')+
      '</div><div class="msg" id="pMsg"></div>');

    pBody.innerHTML=rows.join('');

    // wire textareas — convert newlines back to <br>, preserve existing inner spans by diffing text only
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
          ST[key]=ST[key]||{}; var g=ST[key].grad||(key==='hero'?{g1:'#0E1A3A',g2:'#1c3168'}:{g1:'#4B2E83',g2:'#34155f'});
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
    var gb=pBody.querySelector('[data-gif-this]'); if(gb) gb.addEventListener('click',function(){ exportGIF(s); });
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
      var v=document.querySelector('.s-hero .herovid'); v.src=URL.createObjectURL(f); v.load();
      v.play().catch(function(){});
      document.querySelector('.s-hero .heroimg').classList.add('hasvid');
      if(hgifBtn) hgifBtn.disabled=false;
    });
    if(hgifBtn) hgifBtn.addEventListener('click',function(){ exportHeroGIF(); });
    // chart value sliders (live) + highlight select
    pBody.querySelectorAll('input[data-bar]').forEach(function(inp){
      inp.addEventListener('input',function(){
        var bars=chartBars(), b=bars[+inp.dataset.bar]; if(!b) return;
        b.dataset.val=inp.value;
        var lbl=pBody.querySelector('[data-vlabel="'+inp.dataset.bar+'"]'); if(lbl) lbl.textContent=inp.value;
        renderChart(true); persistChart();
      });
    });
    var hotSel=pBody.querySelector('[data-charthot]');
    if(hotSel) hotSel.addEventListener('change',function(){
      var bars=chartBars(), hi=+hotSel.value;
      bars.forEach(function(b,i){ b.classList.toggle('hot', i===hi); });
      renderChart(true); persistChart();
    });
    // emphasis buttons (wrap current selection inside this section)
    pBody.querySelectorAll('[data-emph]').forEach(function(b){
      b.addEventListener('mousedown',function(e){ e.preventDefault(); }); // keep selection
      b.addEventListener('click',function(){ applyEmph(s, b.getAttribute('data-emph')); });
    });
  }

  function textFields(key){
    switch(key){
      case 'hero': return [{sel:'.eyebrow',lab:'eyebrow'},{sel:'h2',lab:'헤드라인'},{sel:'.lead',lab:'리드'}];
      case 'points': return [{sel:'.top .kr',lab:'상단 카피'},{sel:'.prow:nth-child(1) .pt',lab:'POINT 01'},{sel:'.prow:nth-child(2) .pt',lab:'POINT 02'},{sel:'.prow:nth-child(3) .pt',lab:'POINT 03'},{sel:'.prow:nth-child(4) .pt',lab:'POINT 04'},{sel:'.prow:nth-child(5) .pt',lab:'POINT 05'}];
      case 'detail': return [{sel:'.badge',lab:'뱃지'},{sel:'h2',lab:'헤드라인'},{sel:'.body',lab:'본문'},{sel:'.disc',lab:'각주'}];
      case 'flavor': return [{sel:'.top h2',lab:'제목'},{sel:'.fcard:nth-child(1) .nm',lab:'맛1 이름'},{sel:'.fcard:nth-child(1) .cp',lab:'맛1 설명'},{sel:'.fcard:nth-child(2) .nm',lab:'맛2 이름'},{sel:'.fcard:nth-child(2) .cp',lab:'맛2 설명'},{sel:'.fcard:nth-child(3) .nm',lab:'맛3 이름'},{sel:'.fcard:nth-child(3) .cp',lab:'맛3 설명'}];
      case 'usage': return [{sel:'.top h2',lab:'제목'},{sel:'.step:nth-child(1) .tx',lab:'스텝1'},{sel:'.step:nth-child(2) .tx',lab:'스텝2'},{sel:'.step:nth-child(3) .tx',lab:'스텝3'}];
      case 'chart': return [{sel:'.top h2',lab:'제목'},{sel:'.disc',lab:'각주'}];
      case 'gif': return [{sel:'.g-top',lab:'상단 문구'},{sel:'.g-word .w',lab:'강조 단어'},{sel:'.g-bottom',lab:'하단 문구'}];
    }
    return [];
  }

  function recordHtml(key,sel,html){ ST[key]=ST[key]||{}; ST[key].html=ST[key].html||{}; ST[key].html[sel]=html; save(); }

  /* ---------- comparison chart: values drive bar widths in real time ---------- */
  function chartBars(){ var s=byKey('chart'); return s? Array.prototype.slice.call(s.sec.querySelectorAll('.bar')) : []; }
  function renderChart(animate){
    var bars=chartBars(); if(!bars.length) return;
    var vals=bars.map(function(b){ return Math.max(0,+b.dataset.val||0); });
    var max=Math.max(1, Math.max.apply(null,vals));
    bars.forEach(function(b,i){
      var fill=b.querySelector('.bfill'), val=b.querySelector('.bval');
      var t=fill.style.transition;
      if(!animate){ fill.style.transition='none'; }
      fill.style.width=(vals[i]/max*100)+'%';
      val.textContent=vals[i];
      fill.classList.toggle('show', vals[i]/max > 0.16);
      if(!animate){ fill.offsetWidth; fill.style.transition=t; }
    });
  }
  function persistChart(){ var bars=chartBars(); ST.chart=ST.chart||{};
    ST.chart.vals=bars.map(function(b){ return +b.dataset.val||0; });
    ST.chart.hot=bars.reduce(function(a,b,i){ return b.classList.contains('hot')?i:a; }, -1);
    save();
  }

  // strip edit markup -> readable text with newlines for the textarea
  function htmlToText(html){
    var d=document.createElement('div'); d.innerHTML=html.replace(/<br\b[^>]*>/gi,'\n');
    return d.textContent.replace(/\u00a0/g,' ').replace(/[ \t]+\n/g,'\n').trim();
  }
  // write plain text (with newlines) into an element, keeping a single inner accent/hl span if it wraps the whole edit isn't feasible;
  // so we rebuild as text + <br>, which is what hero/lead/most fields use. Spans are re-applied via the canvas buttons.
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
      // unwrap any .ac/.hl spans intersecting the selection
      editable.querySelectorAll('.ac,.hl').forEach(function(sp){
        if(range.intersectsNode(sp)){ var p=sp.parentNode; while(sp.firstChild) p.insertBefore(sp.firstChild,sp); p.removeChild(sp); }
      });
      // also drop any empty emphasis spans left from earlier edits
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
        // sync textarea if panel open for this sec
        var ta=pBody.querySelector('textarea[data-sel="'+sel+'"]'); if(ta && ta.value!==el.innerHTML) ta.value=el.innerHTML;
      }
    });
    el.addEventListener('focus',function(){ var s=SECS.filter(function(x){return x.sec.contains(el);})[0]; if(s&&s.key!==current) selectSec(s.key); });
  });
  function cssPath(el,root){
    // match against the known field selectors for this section
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
  // worker must be same-origin; fetch the cross-origin script and wrap as a blob URL
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
      } else { div.style.background='rgba(255,255,255,.06)'; }
      var parent=slot.parentNode, marker=slot.nextSibling; parent.insertBefore(div,slot); parent.removeChild(slot);
      subs.push({slot:slot,div:div,parent:parent,marker:marker});
    });
    return function(){ subs.forEach(function(s){ s.parent.insertBefore(s.slot,s.marker); s.div.remove(); }); };
  }

  function captureNode(node, w, h, scale){
    var prev=node.style.transform; node.style.transform='none';
    var rs=swapSlots(node);
    return window.htmlToImage.toPng(node,{ width:w, height:h, pixelRatio:scale||2, cacheBust:true, skipFonts:true,
      style:{ transform:'none', margin:'0', boxShadow:'none' } })
      .then(function(url){ rs(); node.style.transform=prev; return url; },
            function(e){ rs(); node.style.transform=prev; throw e; });
  }

  function download(url,name){ var a=document.createElement('a'); a.href=url; a.download=name; a.click(); }

  async function exportPNG(s){
    try{
      msg('준비 중…'); await loadScript(LIB,function(){return window.htmlToImage;});
      if(document.fonts&&document.fonts.ready){ try{ await document.fonts.ready; }catch(e){} }
      msg('저장 중… '+s.label);
      var url=await captureNode(s.sec, 1000, s.sec.offsetHeight, 2);
      download(url,'somnia-detail-'+s.key+'.png');
      msg('완료 ✓');
    }catch(e){ msg('실패 — '+(e.message||e)); console.error(e); }
  }

  async function exportAll(){
    try{
      await loadScript(LIB,function(){return window.htmlToImage;});
      if(document.fonts&&document.fonts.ready){ try{ await document.fonts.ready; }catch(e){} }
      for(var i=0;i<SECS.length;i++){ var s=SECS[i]; if(s.frame.classList.contains('hidden-sec')) continue;
        var url=await captureNode(s.sec, 1000, s.sec.offsetHeight, 2);
        download(url,'somnia-detail-'+String(i+1).padStart(2,'0')+'-'+s.key+'.png');
        await new Promise(function(r){ setTimeout(r,300); });
      }
    }catch(e){ alert('내보내기 실패: '+(e.message||e)); console.error(e); }
  }

  async function exportStrip(){
    try{
      await loadScript(LIB,function(){return window.htmlToImage;});
      if(document.fonts&&document.fonts.ready){ try{ await document.fonts.ready; }catch(e){} }
      // build an offscreen stack of visible sections
      var stack=document.createElement('div'); stack.style.cssText='width:1000px;background:#fff;position:fixed;left:-99999px;top:0';
      var clones=[];
      SECS.forEach(function(s){ if(s.frame.classList.contains('hidden-sec')) return;
        var c=s.sec.cloneNode(true); stack.appendChild(c); clones.push(c); });
      document.body.appendChild(stack);
      var url=await captureNode(stack, 1000, stack.offsetHeight, 2);
      document.body.removeChild(stack);
      download(url,'somnia-detail-full.png');
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
      // wait for video metadata
      if(!v.videoWidth){ await new Promise(function(r){ v.addEventListener('loadeddata',r,{once:true}); }); }
      var OUT=460, R=OUT/1000;
      var W=OUT, H=Math.round(hero.offsetHeight*R);
      // image-area rect (local, unscaled) + radius
      var box=hero.querySelector('.heroimg');
      var rx=box.offsetLeft*R, ry=box.offsetTop*R, rw=box.offsetWidth*R, rh=box.offsetHeight*R, rr=24*R;
      // static hero layer (video detached), captured at output scale
      var wasPlaying=!v.paused; v.pause();
      var vParent=v.parentNode, vNext=v.nextSibling; vParent.removeChild(v);
      var staticURL;
      try{ staticURL=await captureNode(hero, 1000, hero.offsetHeight, R); }
      finally{ vParent.insertBefore(v, vNext); }
      var staticImg=await new Promise(function(res){ var im=new Image(); im.onload=function(){res(im);}; im.src=staticURL; });
      // frames
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
      gif.on('finished',function(b){ download(URL.createObjectURL(b),'somnia-hero-loop.gif'); msg('GIF 완료 ✓ ('+Math.round(b.size/1024)+'KB)'); });
      gif.render();
    }catch(e){ msg('GIF 실패 — '+(e.message||e)); console.error(e); }
  }

  /* ---------- GIF: word fade-emphasis reveal ---------- */
  async function exportGIF(s){
    try{
      msg('GIF 준비 중…');
      await loadScript(LIB,function(){return window.htmlToImage;});
      await loadScript(GIFLIB,function(){return window.GIF;});
      var wurl=await workerURL();
      if(document.fonts&&document.fonts.ready){ try{ await document.fonts.ready; }catch(e){} }
      var word=s.sec.querySelector('.g-word .w');
      var W=500,H=Math.round(500*(s.sec.offsetHeight/1000));   // downscaled gif (gif.js is slow at full res)
      var gif=new window.GIF({workers:2, quality:10, width:W, height:H, workerScript:wurl});
      // frames: word opacity 0.30 -> 1.0 -> hold -> back, letter-spacing eases in
      var steps=[0.30,0.30,0.42,0.56,0.72,0.88,1,1,1,1,0.86,0.6,0.42,0.30];
      var saved=word.style.cssText;
      for(var i=0;i<steps.length;i++){
        var o=steps[i];
        word.style.opacity=o;
        word.style.color = o>0.9 ? '#f3e9ff' : '#c9a9ef';
        word.style.textShadow = o>0.9 ? '0 0 26px rgba(220,200,255,.6)' : 'none';
        msg('GIF 렌더 '+(i+1)+'/'+steps.length);
        var url=await captureNode(s.sec, 1000, s.sec.offsetHeight, 0.5);
        var img=await new Promise(function(res){ var im=new Image(); im.onload=function(){res(im);}; im.src=url; });
        var cv=document.createElement('canvas'); cv.width=W; cv.height=H; cv.getContext('2d').drawImage(img,0,0,W,H);
        gif.addFrame(cv,{delay: (i>=6&&i<=9)?260:150});
      }
      word.style.cssText=saved;
      gif.on('finished',function(blob){ download(URL.createObjectURL(blob),'somnia-detail-reveal.gif'); msg('GIF 완료 ✓'); });
      gif.on('progress',function(p){ msg('GIF 인코딩 '+Math.round(p*100)+'%'); });
      gif.render();
    }catch(e){ msg('GIF 실패 — '+(e.message||e)); console.error(e); }
  }

  /* ---------- secbar + rail buttons ---------- */
  document.querySelectorAll('.frame').forEach(function(fr){
    var s=byKey(fr.dataset.sec);
    var pngb=fr.querySelector('[data-png]'); if(pngb) pngb.addEventListener('click',function(e){ e.stopPropagation(); exportPNG(s); });
    var gifb=fr.querySelector('[data-gif]'); if(gifb) gifb.addEventListener('click',function(e){ e.stopPropagation(); exportGIF(s); });
    fr.addEventListener('mousedown',function(e){ if(!e.target.closest('[contenteditable]') && !e.target.closest('.secbar')) selectSec(fr.dataset.sec); });
  });
  document.getElementById('dlAll').addEventListener('click',exportAll);
  document.getElementById('dlStrip').addEventListener('click',exportStrip);

  /* ---------- init ---------- */
  restore();
  renderChart(false);
  applyZoom2();
  selectSec(SECS[0].key);
  // animate chart bars in shortly after load
  setTimeout(function(){ renderChart(true); }, 360);
})();
