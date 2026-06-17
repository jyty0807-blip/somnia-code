/* SOMNIA — shared cart (localStorage, cross-page) */
(function () {
  'use strict';

  var KEY = 'somnia-cart';

  /* ─── storage ─── */
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }
  function fmt(n) { return Number(n).toLocaleString('ko-KR') + '원'; }
  function getCount() { return load().reduce(function (s, i) { return s + (i.qty || 0); }, 0); }

  /* ─── badge sync ─── */
  function syncBadges() {
    var c = getCount();
    document.querySelectorAll('.cartnum').forEach(function (el) { el.textContent = c || ''; });
  }

  /* ─── render drawer items ─── */
  function renderItems() {
    var el = document.getElementById('cart-items');
    if (!el) return;
    var items = load();
    var totalEl = document.getElementById('cart-total');

    if (!items.length) {
      el.innerHTML = '<p class="cart-empty">장바구니가 비어있어요.</p>';
      if (totalEl) totalEl.textContent = '0원';
      return;
    }

    var total = items.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    if (totalEl) totalEl.textContent = fmt(total);

    el.innerHTML = items.map(function (item) {
      return '<div class="cart-item" data-id="' + item.id + '">' +
        '<div class="cart-item__info">' +
          '<div class="cart-item__name">' + item.name + '</div>' +
          '<div class="cart-item__price">' + fmt(item.price * item.qty) + '</div>' +
        '</div>' +
        '<div class="cart-item__qty">' +
          '<button class="cart-q" data-action="minus" data-id="' + item.id + '">−</button>' +
          '<span>' + item.qty + '</span>' +
          '<button class="cart-q" data-action="plus" data-id="' + item.id + '">+</button>' +
        '</div>' +
        '<button class="cart-remove" data-id="' + item.id + '" aria-label="삭제">×</button>' +
      '</div>';
    }).join('');

    el.querySelectorAll('.cart-remove').forEach(function (btn) {
      btn.addEventListener('click', function () { CART.remove(btn.dataset.id); });
    });
    el.querySelectorAll('.cart-q').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cur = load();
        var item = null;
        for (var i = 0; i < cur.length; i++) { if (cur[i].id === btn.dataset.id) { item = cur[i]; break; } }
        if (!item) return;
        var newQty = item.qty + (btn.dataset.action === 'plus' ? 1 : -1);
        if (newQty < 1) CART.remove(btn.dataset.id);
        else CART.update(btn.dataset.id, newQty);
      });
    });
  }

  /* ─── inject CSS ─── */
  function injectStyles() {
    var s = document.createElement('style');
    s.textContent = [
      /* drawer */
      '.cart-drawer{position:fixed;inset:0;z-index:9000;pointer-events:none}',
      '.cart-drawer.open{pointer-events:auto}',
      '.cart-overlay{position:absolute;inset:0;background:rgba(10,20,48,.62);opacity:0;transition:opacity .35s ease;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}',
      '.cart-drawer.open .cart-overlay{opacity:1}',
      '.cart-panel{position:absolute;top:0;right:0;bottom:0;width:360px;max-width:94vw;background:#13294f;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .38s cubic-bezier(.22,.61,.36,1);box-shadow:-24px 0 60px rgba(10,20,48,.5)}',
      '.cart-drawer.open .cart-panel{transform:none}',
      /* head */
      '.cart-head{display:flex;align-items:center;justify-content:space-between;padding:24px 24px 16px;border-bottom:1px solid rgba(214,236,250,.1)}',
      '.cart-title{font-family:Outfit,sans-serif;font-size:.75rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#fff}',
      '.cart-close{background:none;border:none;color:rgba(214,236,250,.45);font-size:1.4rem;line-height:1;cursor:pointer;padding:4px 8px;border-radius:8px;transition:color .2s}',
      '.cart-close:hover{color:#fff}',
      /* items */
      '.cart-items{flex:1;overflow-y:auto;padding:8px 0}',
      '.cart-empty{padding:56px 24px;text-align:center;color:rgba(214,236,250,.35);font-size:.875rem;font-family:Outfit,sans-serif}',
      '.cart-item{display:flex;align-items:center;gap:12px;padding:16px 24px;border-bottom:1px solid rgba(214,236,250,.07)}',
      '.cart-item__info{flex:1;min-width:0}',
      '.cart-item__name{font-size:.85rem;font-weight:500;color:#fff;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.cart-item__price{font-size:.78rem;color:rgba(214,236,250,.55)}',
      '.cart-item__qty{display:flex;align-items:center;gap:8px;flex-shrink:0}',
      '.cart-item__qty span{font-size:.82rem;color:#fff;min-width:16px;text-align:center}',
      '.cart-q{background:rgba(214,236,250,.1);border:none;color:#fff;width:24px;height:24px;border-radius:6px;cursor:pointer;font-size:.85rem;line-height:1;transition:background .2s;flex-shrink:0;display:flex;align-items:center;justify-content:center}',
      '.cart-q:hover{background:rgba(214,236,250,.22)}',
      '.cart-remove{background:none;border:none;color:rgba(214,236,250,.28);font-size:1.1rem;cursor:pointer;padding:4px;border-radius:6px;transition:color .2s;flex-shrink:0;line-height:1}',
      '.cart-remove:hover{color:rgba(214,236,250,.8)}',
      /* foot */
      '.cart-foot{padding:20px 24px;border-top:1px solid rgba(214,236,250,.1)}',
      '.cart-total-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px}',
      '.cart-total-row>span:first-child{font-family:Outfit,sans-serif;font-size:.7rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:rgba(214,236,250,.45)}',
      '#cart-total{font-family:Outfit,sans-serif;font-size:1.15rem;font-weight:700;color:#fff}',
      '.cart-buy-btn{width:100%;padding:14px;background:#1958B2;border:none;border-radius:12px;color:#fff;font-family:Outfit,sans-serif;font-size:.875rem;font-weight:600;letter-spacing:.04em;cursor:pointer;transition:background .2s}',
      '.cart-buy-btn:hover{background:#1649a0}',
      /* toast */
      '.cart-toast{position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(10px);background:#13294f;color:rgba(214,236,250,.92);padding:11px 20px;border-radius:12px;font-family:Outfit,sans-serif;font-size:.82rem;border:1px solid rgba(184,167,230,.25);opacity:0;transition:opacity .25s,transform .25s;z-index:9100;white-space:nowrap;pointer-events:none}',
      '.cart-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}',
      /* nav cart */
      'a.nav__cart,button.nav__cart{display:inline-flex;align-items:center;gap:5px;cursor:pointer;padding:4px 0;background:none;border:none;color:inherit}',
      '.nav__cart .cartnum{min-width:16px;height:16px;background:#1958B2;color:#fff;font-family:Outfit,sans-serif;font-size:.58rem;font-weight:700;border-radius:99px;display:inline-flex;align-items:center;justify-content:center;padding:0 4px;line-height:1}',
      '.nav__cart .cartnum:empty{display:none}',
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ─── inject drawer HTML ─── */
  function injectDrawer() {
    var d = document.createElement('div');
    d.className = 'cart-drawer';
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-label', '장바구니');
    d.innerHTML =
      '<div class="cart-overlay"></div>' +
      '<div class="cart-panel">' +
        '<div class="cart-head">' +
          '<span class="cart-title">Cart</span>' +
          '<button class="cart-close" aria-label="닫기">×</button>' +
        '</div>' +
        '<div class="cart-items" id="cart-items"></div>' +
        '<div class="cart-foot">' +
          '<div class="cart-total-row"><span>합계</span><span id="cart-total">0원</span></div>' +
          '<button class="cart-buy-btn">주문하기 →</button>' +
        '</div>' +
      '</div>' +
      '<div class="cart-toast" id="cart-toast"></div>';
    document.body.appendChild(d);

    d.querySelector('.cart-overlay').addEventListener('click', CART.close);
    d.querySelector('.cart-close').addEventListener('click', CART.close);
    d.querySelector('.cart-buy-btn').addEventListener('click', function () {
      var items = load();
      if (!items.length) return;
      var total = items.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
      CART.toast('주문이 완료되었습니다  ·  합계 ' + fmt(total));
      save([]);
      syncBadges();
      renderItems();
      CART.close();
    });

    renderItems();
  }

  /* ─── public API ─── */
  var toastTimer;
  var CART = window.CART = {
    add: function (item) {
      var items = load();
      var found = false;
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === item.id) { items[i].qty += (item.qty || 1); found = true; break; }
      }
      if (!found) items.push({ id: item.id, name: item.name, price: item.price, qty: item.qty || 1 });
      save(items);
      syncBadges();
      renderItems();
      CART.open();
      CART.toast(item.name + ' 담았어요.');
    },
    remove: function (id) {
      save(load().filter(function (i) { return i.id !== id; }));
      syncBadges(); renderItems();
    },
    update: function (id, qty) {
      var items = load();
      for (var i = 0; i < items.length; i++) { if (items[i].id === id) { items[i].qty = qty; break; } }
      save(items); syncBadges(); renderItems();
    },
    open: function () { var d = document.querySelector('.cart-drawer'); if (d) d.classList.add('open'); },
    close: function () { var d = document.querySelector('.cart-drawer'); if (d) d.classList.remove('open'); },
    toast: function (msg) {
      var el = document.getElementById('cart-toast');
      if (!el) return;
      el.textContent = msg;
      el.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
    },
    getCount: getCount
  };

  /* ─── bind nav cart icons ─── */
  function bindCartIcons() {
    document.querySelectorAll('.nav__cart').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); CART.open(); });
    });
  }

  /* ─── init ─── */
  document.addEventListener('DOMContentLoaded', function () {
    injectStyles();
    injectDrawer();
    syncBadges();
    bindCartIcons();
  });
})();
