/* SOMNIA — interactions */
(function(){
  'use strict';
  var root=document.documentElement;

  /* ---------- language ---------- */
  var saved=localStorage.getItem('somnia-lang')||'en';
  function setLang(l){
    root.setAttribute('lang-mode',l);
    localStorage.setItem('somnia-lang',l);
    document.querySelectorAll('.lang button').forEach(function(b){
      b.classList.toggle('on',b.dataset.lang===l);
    });
    document.documentElement.lang = (l==='kr'?'ko':'en');
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest('.lang button'); if(b) setLang(b.dataset.lang);
  });
  setLang(saved);

  /* ---------- starfield ---------- */
  function stars(el,n,maxR){
    if(!el) return;
    var frag=document.createDocumentFragment();
    for(var i=0;i<n;i++){
      var s=document.createElement('span');
      s.className='star';
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
  stars(document.querySelector('.hero__stars'),46,1.7);
  stars(document.querySelector('.manifesto__stars'),60,1.8);
  stars(document.querySelector('.app__stars'),40,1.6);

  /* ---------- nav scroll state + mobile menu ---------- */
  var nav=document.querySelector('.nav');
  var hero=document.querySelector('.hero');
  function onScroll(){
    var threshold=(hero?hero.offsetHeight:600)-90;
    nav.classList.toggle('solid',window.scrollY>threshold);
  }
  onScroll();
  window.addEventListener('scroll',onScroll,{passive:true});

  var menu=document.querySelector('.nav__menu');
  var links=document.querySelector('.nav__links');
  if(menu){
    menu.addEventListener('click',function(){
      menu.classList.toggle('open'); links.classList.toggle('open');
    });
    links.addEventListener('click',function(e){
      if(e.target.closest('.nav__link')){menu.classList.remove('open');links.classList.remove('open');}
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls=[].slice.call(document.querySelectorAll('.reveal'));
  function revealNow(el){el.classList.add('in');}
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){revealNow(en.target); io.unobserve(en.target);}
      });
    },{threshold:0.12,rootMargin:'0px 0px -8% 0px'});
    revealEls.forEach(function(el){io.observe(el);});
    // fallback: reveal anything already within the viewport shortly after load,
    // in case IO doesn't fire (e.g. headless / non-rendered frames)
    var fallback=function(){
      revealEls.forEach(function(el){
        if(el.classList.contains('in')) return;
        var r=el.getBoundingClientRect();
        if(r.top < (window.innerHeight||800)*0.96 && r.bottom>0){revealNow(el);}
      });
    };
    setTimeout(fallback,500);
    window.addEventListener('load',function(){setTimeout(fallback,200);});
  } else {
    revealEls.forEach(revealNow);
  }

  /* ---------- parallax (hero + atmosphere bg) ---------- */
  var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var pEls=[];
  document.querySelectorAll('[data-parallax]').forEach(function(el){
    pEls.push({el:el,sp:parseFloat(el.dataset.parallax)});
  });
  var ticking=false;
  function parallax(){
    pEls.forEach(function(p){
      var rect=p.el.parentElement.getBoundingClientRect();
      var off=(rect.top+rect.height/2 - window.innerHeight/2)*p.sp;
      p.el.style.transform='translate3d(0,'+off.toFixed(1)+'px,0)';
    });
    ticking=false;
  }
  if(!reduce && pEls.length){
    window.addEventListener('scroll',function(){
      if(!ticking){requestAnimationFrame(parallax);ticking=true;}
    },{passive:true});
    parallax();
  }

  /* ---------- animated sleep ring ---------- */
  var ring=document.querySelector('.ring__circle');
  var ringNum=document.querySelector('.ring__num');
  if(ring){
    var len=ring.getTotalLength();
    ring.style.strokeDasharray=len;
    ring.style.strokeDashoffset=len;
    var target=92, dur=1600;
    var ringIO=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          ring.style.transition='stroke-dashoffset '+dur+'ms cubic-bezier(.22,.61,.36,1)';
          ring.style.strokeDashoffset=len*(1-target/100);
          var t0=performance.now();
          (function step(now){
            var k=Math.min(1,(now-t0)/dur);
            var e2=1-Math.pow(1-k,3);
            ringNum.textContent=Math.round(target*e2);
            if(k<1) requestAnimationFrame(step);
          })(performance.now());
          ringIO.disconnect();
        }
      });
    },{threshold:0.5});
    ringIO.observe(ring.closest('.phone'));
  }

  /* ---------- newsletter ---------- */
  var form=document.querySelector('.signup');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var ok=document.querySelector('.cta__ok');
      if(ok) ok.classList.add('show');
      form.querySelector('input').value='';
    });
  }

  /* ---------- year ---------- */
  var y=document.querySelector('[data-year]'); if(y) y.textContent=new Date().getFullYear();
})();
