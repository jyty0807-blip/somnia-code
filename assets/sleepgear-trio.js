/* SOMNIA — Sleep Gear Trio PDP interactions */
(function(){
  'use strict';
  var fmt=function(n){ return n.toLocaleString('ko-KR'); };
  var state={ comp:'트리오 세트', price:109000, qty:1 };

  /* ---------- starfield ---------- */
  function stars(el,n,maxR){
    if(!el) return;
    var frag=document.createDocumentFragment();
    for(var i=0;i<n;i++){
      var s=document.createElement('span'); s.className='star';
      var r=Math.random()*(maxR-0.6)+0.6;
      s.style.width=s.style.height=r.toFixed(2)+'px';
      s.style.left=(Math.random()*100).toFixed(2)+'%';
      s.style.top=(Math.random()*100).toFixed(2)+'%';
      s.style.setProperty('--dur',(2.5+Math.random()*4).toFixed(2)+'s');
      s.style.setProperty('--del',(Math.random()*5).toFixed(2)+'s');
      frag.appendChild(s);
    }
    el.appendChild(frag);
  }
  document.querySelectorAll('.intro .stars,.flavorshow .stars,.closing .stars').forEach(function(el){ stars(el,46,1.7); });

  /* ---------- reveal ---------- */
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  },{threshold:0.12, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  /* ---------- elements ---------- */
  var subtotalEl=document.getElementById('subtotal');
  var priceNow=document.getElementById('price-now');
  var priceWas=document.getElementById('price-was');
  var offEl=document.getElementById('off');
  var unitEl=document.getElementById('unit');
  var stickyPrice=document.getElementById('sticky-price');
  var stickyOpt=document.getElementById('sticky-opt');
  var galleryMain=document.getElementById('gallery-main');

  function render(){
    var total=state.price*state.qty;
    if(subtotalEl) subtotalEl.textContent=fmt(total);
    if(stickyPrice) stickyPrice.textContent=fmt(total);
    if(stickyOpt) stickyOpt.textContent=state.comp+' · 수량 '+state.qty;
  }

  /* ---------- gallery thumbnail switch ---------- */
  function switchGallery(comp){
    if(!galleryMain) return;
    var slots=galleryMain.querySelectorAll('image-slot');
    slots.forEach(function(slot){
      var target=slot.dataset.comp;
      slot.style.display=(target===comp||(!target&&comp==='trio'))?'':'none';
    });
  }

  /* ---------- composition select ---------- */
  document.querySelectorAll('#comp-select .flavor').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('#comp-select .flavor').forEach(function(b){ b.classList.remove('on'); });
      btn.classList.add('on');
      state.comp=btn.dataset.name;
      state.price=parseInt(btn.dataset.price,10);
      var was=parseInt(btn.dataset.was,10);
      var off=parseInt(btn.dataset.off,10);
      if(priceNow) priceNow.textContent=fmt(state.price);
      if(priceWas){ if(off>0){ priceWas.parentElement.style.display=''; priceWas.textContent=fmt(was); } else { priceWas.parentElement.style.display='none'; } }
      if(offEl){ offEl.style.display=off>0?'':'none'; offEl.textContent=off+'%'; }
      if(unitEl) unitEl.textContent=btn.dataset.unit;
      switchGallery(btn.dataset.comp);
      render();
    });
  });

  /* ---------- quantity ---------- */
  var qtyInput=document.getElementById('qty');
  function setQty(n){ n=Math.max(1,Math.min(20,n|0)); state.qty=n; if(qtyInput) qtyInput.value=n; render(); }
  var qm=document.getElementById('qminus'), qp=document.getElementById('qplus');
  if(qm) qm.addEventListener('click',function(){ setQty(state.qty-1); });
  if(qp) qp.addEventListener('click',function(){ setQty(state.qty+1); });
  if(qtyInput) qtyInput.addEventListener('change',function(){ setQty(parseInt(qtyInput.value,10)||1); });

  /* ---------- cart / buy ---------- */
  var cartCount=0;
  var cartNumEl=document.querySelector('.nav__cart .cartnum');
  var toastEl=document.getElementById('toast'), toastT;
  function toast(msg){ if(!toastEl) return; toastEl.textContent=msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(function(){ toastEl.classList.remove('show'); },2200); }
  function addCart(){
    if(window.CART){ CART.add({id:'sleepgear-trio',name:'슬립 기어 트리오 — '+state.comp,price:state.price,qty:state.qty}); }
    else { cartCount+=state.qty; if(cartNumEl) cartNumEl.textContent=cartCount; toast(state.comp+' '+state.qty+'개를 장바구니에 담았어요.'); }
  }
  function buyNow(){ toast('구매 페이지로 이동합니다 · 합계 '+fmt(state.price*state.qty)+'원'); }
  ['addcart','sticky-cart'].forEach(function(id){ var el=document.getElementById(id); if(el) el.addEventListener('click',addCart); });
  ['buynow','buynow2','sticky-buy'].forEach(function(id){ var el=document.getElementById(id); if(el) el.addEventListener('click',buyNow); });

  /* ---------- sticky bar ---------- */
  var bar=document.getElementById('stickybar');
  var buyBlock=document.querySelector('.buy');
  var ioBar=new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(bar) bar.classList.toggle('show', !en.isIntersecting && en.boundingClientRect.top<0); });
  },{threshold:0});
  if(buyBlock) ioBar.observe(buyBlock);

  /* ---------- tab scrollspy ---------- */
  var tabs=Array.prototype.slice.call(document.querySelectorAll('.detail__tab'));
  var sections=tabs.map(function(t){ return document.querySelector(t.getAttribute('href')); });
  function spy(){
    var y=window.scrollY+window.innerHeight*0.35, idx=0;
    sections.forEach(function(sec,i){ if(sec && sec.offsetTop<=y) idx=i; });
    tabs.forEach(function(t,i){ t.classList.toggle('on', i===idx); });
  }
  window.addEventListener('scroll',spy,{passive:true});
  tabs.forEach(function(t){
    t.addEventListener('click',function(e){
      var target=document.querySelector(t.getAttribute('href'));
      if(target){ e.preventDefault(); window.scrollTo({top:target.offsetTop-70,behavior:'smooth'}); }
    });
  });
  spy(); render();
})();
