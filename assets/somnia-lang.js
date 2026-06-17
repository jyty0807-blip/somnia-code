/* SOMNIA — language toggle (standalone, KR-default) */
(function(){
  'use strict';
  var root=document.documentElement;
  var saved=localStorage.getItem('somnia-lang')||'kr';
  function setLang(l){
    root.setAttribute('lang-mode',l);
    localStorage.setItem('somnia-lang',l);
    document.querySelectorAll('.lang button').forEach(function(b){
      var on=b.dataset.lang===l;
      b.classList.toggle('on',on);
      b.style.background=on?'var(--navy)':'transparent';
      b.style.color=on?'#fff':'var(--ink-soft)';
    });
    document.documentElement.lang=(l==='kr'?'ko':'en');
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest('.lang button'); if(b) setLang(b.dataset.lang);
  });
  setLang(saved);
})();
