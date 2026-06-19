/* SOMNIA Image Manager — slot state CRUD + zoom */
(function(){
'use strict';
var STATE_FILE = '.image-slots.state.json';
var MAX_DIM = 1200;

var PAGES = [
  { name:'SOMNIA.html · 랜딩', slots:[
    {id:'good-jelly',ph:'Melatonin Jelly — product shot'},
    {id:'good-oil',ph:'Lavender oil — product shot'},
    {id:'good-mask',ph:'Sleep eye mask — product shot'},
    {id:'good-spray',ph:'Room spray — product shot'},
    {id:'good-pajama',ph:'Sleepwear / pajama — product shot'},
    {id:'atmos-img',ph:'Lifestyle / night imagery'},
  ]},
  { name:'SOMNIA Product.html · 드림 젤리', slots:[
    {id:'pdp-main',ph:'메인 제품컷 — 정면 패키지'},
    {id:'pdp-thumb-1',ph:'썸네일 1'},{id:'pdp-thumb-2',ph:'썸네일 2'},
    {id:'pdp-thumb-3',ph:'썸네일 3'},{id:'pdp-thumb-4',ph:'썸네일 4'},
    {id:'detail-hero',ph:'무드 비주얼 — 밤, 손 위의 젤리'},
    {id:'why-shot',ph:'제품 디테일컷 — 젤리 클로즈업'},
    {id:'detail-2',ph:'라이프스타일 컷 — 침실 무드'},
    {id:'detail-3',ph:'성분 비주얼 — 원료/텍스처'},
    {id:'flavor-moonberry',ph:'문 베리 컷'},
    {id:'flavor-grape',ph:'딥 나이트 그레이프 컷'},
    {id:'flavor-vanilla',ph:'바닐라 문 컷'},
  ]},
  { name:'SOMNIA Aroma Duo.html · 아로마 듀오', slots:[
    {id:'duo-main',ph:'듀오 세트 — 오일 + 스프레이'},
    {id:'duo-main-oil',ph:'라벤더 아로마 오일 단품'},
    {id:'duo-main-spray',ph:'필로우 룸 스프레이 단품'},
    {id:'duo-thumb-1',ph:'썸네일 1'},{id:'duo-thumb-2',ph:'썸네일 2'},
    {id:'duo-thumb-3',ph:'썸네일 3'},{id:'duo-thumb-4',ph:'썸네일 4'},
    {id:'duo-hero',ph:'무드 비주얼'},
    {id:'oil-shot',ph:'아로마 오일 컷'},{id:'oil-life',ph:'오일 라이프스타일'},
    {id:'spray-shot',ph:'룸 스프레이 컷'},{id:'spray-life',ph:'스프레이 라이프스타일'},
    {id:'notes-shot',ph:'향/원료 비주얼'},
  ]},
  { name:'SOMNIA Sleep Gear Trio.html · 슬립 기어 트리오', slots:[
    {id:'gear-main',ph:'메인컷 — 잠옷+안대+양말'},
    {id:'gear-main-pajama',ph:'잠옷 메인컷'},
    {id:'gear-main-mask',ph:'수면안대 메인컷'},
    {id:'gear-main-socks',ph:'수면양말 메인컷'},
    {id:'gear-thumb-1',ph:'썸네일 1 · 잠옷'},{id:'gear-thumb-2',ph:'썸네일 2 · 안대'},
    {id:'gear-thumb-3',ph:'썸네일 3 · 양말'},{id:'gear-thumb-4',ph:'썸네일 4 · 세트'},
    {id:'gear-hero',ph:'무드 비주얼'},
    {id:'pajama-shot',ph:'잠옷 컷'},{id:'pajama-life',ph:'잠옷 라이프스타일'},
    {id:'mask-shot',ph:'수면안대 컷'},{id:'mask-life',ph:'안대 라이프스타일'},
    {id:'socks-shot',ph:'양말 컷'},{id:'socks-life',ph:'양말 라이프스타일'},
    {id:'together-1',ph:'잠옷 디테일'},{id:'together-2',ph:'안대 디테일'},
    {id:'together-3',ph:'양말 디테일'},{id:'care-shot',ph:'소재/디테일 비주얼'},
  ]},
  { name:'Card News · 카드뉴스', slots:[
    {id:'card-bg-1',ph:'밤하늘 / 침실 무드'},
    {id:'card-bg-5',ph:'슬립테크 제품 컷'},
    {id:'card-bg-6',ph:'달밤 바다 / 침실 무드'},
  ]},
  { name:'Detail Studio · 드림 젤리', slots:[
    {id:'hero_img',ph:'제품 · 모델 컷'},
  ]},
  { name:'Detail Studio · 아로마', slots:[
    {id:'aroma_hero_img',ph:'오일 + 스프레이 무드컷'},
    {id:'aroma_blend_img',ph:'원료 · 텍스처 컷'},
  ]},
  { name:'Detail Studio · 슬립웨어', slots:[
    {id:'sw_hero_img',ph:'수면웨어 착장 무드컷'},
    {id:'sw_craft_img',ph:'봉제 · 디테일 클로즈업'},
  ]},
];

var state = {};
var filter = 'all';

function getVal(id) {
  var v = state[id];
  if (!v) return null;
  return typeof v === 'string' ? { u: v, s: 1, x: 0, y: 0 } : v;
}

function loadState() {
  return fetch(STATE_FILE).then(function(r){ return r.ok ? r.json() : {}; })
    .then(function(j){ state = j || {}; })
    .catch(function(){ state = {}; });
}

function saveState() {
  var w = window.omelette && window.omelette.writeFile;
  if (w) { w(STATE_FILE, JSON.stringify(state)); toast('저장됨'); }
  else { toast('저장됨 (새로고침 시 반영)'); }
}

var toastEl, toastT;
function toast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg; toastEl.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('show'); }, 2000);
}

function resizeImage(file, cb) {
  if (file.type === 'image/gif') {
    var reader = new FileReader();
    reader.onload = function(){ cb(reader.result); };
    reader.readAsDataURL(file);
    return;
  }
  var img = new Image();
  img.onload = function(){
    var w = img.width, h = img.height;
    if (w > MAX_DIM || h > MAX_DIM) {
      var r = Math.min(MAX_DIM/w, MAX_DIM/h);
      w = Math.round(w*r); h = Math.round(h*r);
    }
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, 0, 0, w, h);
    cb(c.toDataURL('image/webp', 0.85));
  };
  img.src = URL.createObjectURL(file);
}

function uploadToSlot(id, file) {
  resizeImage(file, function(dataUrl){
    var cur = getVal(id);
    state[id] = { u: dataUrl, s: cur ? cur.s : 1, x: 0, y: 0 };
    saveState();
    render();
  });
}

function clearSlot(id) {
  delete state[id];
  saveState();
  render();
}

function setZoom(id, s) {
  var cur = getVal(id);
  if (!cur) return;
  state[id] = { u: cur.u, s: parseFloat(s), x: cur.x, y: cur.y };
  saveState();
  render();
}

function pickFile(id) {
  var inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = function(){ if (inp.files[0]) uploadToSlot(id, inp.files[0]); };
  inp.click();
}

function render() {
  var grid = document.getElementById('grid');
  if (!grid) return;
  grid.innerHTML = '';

  var total = 0, filled = 0;
  PAGES.forEach(function(page){
    if (filter !== 'all' && page.name !== filter) return;
    page.slots.forEach(function(slot){
      total++;
      var val = getVal(slot.id);
      if (val) filled++;
      var card = document.createElement('div');
      card.className = 'slot-card';
      card.dataset.id = slot.id;

      var imgDiv = document.createElement('div');
      imgDiv.className = 'slot-card__img';
      if (val && val.u) {
        var img = document.createElement('img');
        img.src = val.u;
        img.style.transform = 'scale('+((val.s||1))+') translate('+(val.x||0)+'px,'+(val.y||0)+'px)';
        img.alt = slot.id;
        imgDiv.appendChild(img);
      } else {
        imgDiv.innerHTML = '<div class="empty"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>'+slot.ph+'</div>';
      }
      imgDiv.onclick = function(){ pickFile(slot.id); };

      var body = document.createElement('div');
      body.className = 'slot-card__body';
      body.innerHTML = '<div class="slot-card__id">'+slot.id+'</div><div class="slot-card__page">'+page.name+'</div>';

      if (val && val.u) {
        var ctrl = document.createElement('div');
        ctrl.className = 'slot-card__controls';
        var sv = val.s || 1;
        ctrl.innerHTML = '<label>줌</label><input type="range" min="0.5" max="3" step="0.1" value="'+sv+'"><span>'+sv.toFixed(1)+'x</span>';
        ctrl.querySelector('input').oninput = function(e){
          ctrl.querySelector('span').textContent = parseFloat(e.target.value).toFixed(1)+'x';
        };
        ctrl.querySelector('input').onchange = function(e){ setZoom(slot.id, e.target.value); };
        body.appendChild(ctrl);
      }

      var acts = document.createElement('div');
      acts.className = 'slot-card__actions';
      var btnUp = document.createElement('button');
      btnUp.className = 'btn-upload'; btnUp.textContent = val ? '교체' : '업로드';
      btnUp.onclick = function(ev){ ev.stopPropagation(); pickFile(slot.id); };
      acts.appendChild(btnUp);
      if (val) {
        var btnCl = document.createElement('button');
        btnCl.className = 'btn-clear'; btnCl.textContent = '삭제';
        btnCl.onclick = function(ev){ ev.stopPropagation(); clearSlot(slot.id); };
        acts.appendChild(btnCl);
      }
      body.appendChild(acts);

      card.appendChild(imgDiv);
      card.appendChild(body);
      grid.appendChild(card);
    });
  });

  var counter = document.getElementById('counter');
  if (counter) counter.textContent = filled + ' / ' + total + ' 등록됨';
}

function renderFilters() {
  var bar = document.getElementById('filters');
  if (!bar) return;
  bar.innerHTML = '';
  var all = document.createElement('div');
  all.className = 'chip' + (filter === 'all' ? ' on' : '');
  all.textContent = '전체';
  all.onclick = function(){ filter = 'all'; renderFilters(); render(); };
  bar.appendChild(all);
  PAGES.forEach(function(page){
    var chip = document.createElement('div');
    chip.className = 'chip' + (filter === page.name ? ' on' : '');
    chip.textContent = page.name.split('·')[1] ? page.name.split('·')[1].trim() : page.name;
    chip.onclick = function(){ filter = page.name; renderFilters(); render(); };
    bar.appendChild(chip);
  });
}

function handleBatchDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('over');
  var files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
  if (!files || !files.length) return;
  var allIds = {};
  PAGES.forEach(function(p){ p.slots.forEach(function(s){ allIds[s.id] = true; }); });
  var matched = 0;
  Array.from(files).forEach(function(f){
    var name = f.name.replace(/\.[^.]+$/, '');
    if (allIds[name]) { matched++; uploadToSlot(name, f); }
  });
  if (matched) toast(matched + '개 매칭 업로드');
  else toast('매칭된 슬롯이 없습니다 (파일명 = 슬롯 ID)');
}

document.addEventListener('DOMContentLoaded', function(){
  toastEl = document.getElementById('toast');
  var bz = document.getElementById('batch-zone');
  if (bz) {
    bz.addEventListener('dragover', function(e){ e.preventDefault(); bz.classList.add('over'); });
    bz.addEventListener('dragleave', function(){ bz.classList.remove('over'); });
    bz.addEventListener('drop', handleBatchDrop);
    bz.addEventListener('click', function(){
      var inp = document.createElement('input');
      inp.type = 'file'; inp.multiple = true; inp.accept = 'image/*';
      inp.onchange = function(){ handleBatchDrop({ preventDefault:function(){}, currentTarget:bz, target:inp }); };
      inp.click();
    });
  }
  loadState().then(function(){ renderFilters(); render(); });
});
})();
