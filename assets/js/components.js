/* Blinca – shared UI (header, footer, drawers, modals, cart, add control). */
window.Blinca = (function () {
  'use strict';
  var D = window.BLINCA_DATA;
  var S = window.BlincaStore;
  var t = window.t;
  var B = { t: t };

  /* ---------- helpers ---------- */
  B.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  B.L = function (v) { if (v == null) return ''; if (typeof v === 'string') return v; return v[S.lang()] != null ? v[S.lang()] : v.en; };
  B.kr = function (n) { return n + ' kr'; };
  B.decimal = function (n) { return n.toFixed(2).replace('.', ','); };
  B.params = function () { return new URLSearchParams(window.location.search); };
  B.norm = function (s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };
  B.restaurantUrl = function (slug, itemId) { return 'restaurant.html?slug=' + encodeURIComponent(slug) + (itemId ? '#item-' + itemId : ''); };
  B.page = document.body.getAttribute('data-page') || '';
  B.isMobile = function () { return window.matchMedia('(max-width: 760px)').matches; };
  B.cuisine = function (id) { return D.cuisines.filter(function (c) { return c.id === id; })[0]; };
  B.cuisineNames = function (r) { return r.cuisines.map(function (c) { var cu = B.cuisine(c); return cu ? B.esc(B.L(cu.name)) : ''; }).join(' · '); };
  B.priceLevel = function (n) { return new Array(n + 1).join('kr ').trim(); };
  B.deliverable = function (a) { return !!a && (a.deliverable === true || (a.deliverable == null && /stockholm|solna|sundbyberg|nacka/.test(B.norm(a.city)))); };

  /* ---------- logo (inline so it uses the page font) ---------- */
  B.logo = function (white) {
    var c = white ? '#ffffff' : '#E23744', k = white ? '#231C1C' : '#ffffff';
    return '<svg class="logo-svg" viewBox="0 0 160 48" role="img" aria-label="blinca"><g fill="' + c + '">' +
      '<rect x="2" y="15" width="12" height="3.4" rx="1.7"/><rect x="0" y="22" width="17" height="3.4" rx="1.7"/>' +
      '<rect x="4" y="29" width="13" height="3.4" rx="1.7"/><rect x="1" y="36" width="15" height="3.4" rx="1.7"/>' +
      '<path d="M20.5 9.2c0-1.5 1-2.7 2.4-3.2l4.6-1.5V22a14.6 14.6 0 1 1-7 12.4z"/><circle cx="34.6" cy="33.6" r="14.4"/></g>' +
      '<g fill="' + k + '"><rect x="30.2" y="24" width="3.6" height="14" rx="1.6"/><circle cx="36.2" cy="34" r="4.6"/></g>' +
      '<circle cx="36.2" cy="34" r="1.9" fill="' + c + '"/>' +
      '<text x="54" y="40" fill="' + c + '" font-family="\'Google Sans\',system-ui,sans-serif" font-size="33" font-weight="600" letter-spacing="-0.4">blinca</text></svg>';
  };

  /* ---------- icons ---------- */
  var I = {
    search: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.3-4.3"/>',
    globe: '<circle cx="12" cy="12" r="9.5"/><path d="M12 2.5a14.5 14.5 0 0 0 0 19 14.5 14.5 0 0 0 0-19"/><path d="M2.5 12h19"/>',
    cart: '<circle cx="8" cy="20.5" r="1.2"/><circle cx="18.5" cy="20.5" r="1.2"/><path d="M2.5 3h2.2l2.6 12.1a1.8 1.8 0 0 0 1.8 1.4h9.3a1.8 1.8 0 0 0 1.8-1.4L21.8 7H5.6"/>',
    user: '<path d="M19 21v-1.5a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4V21"/><circle cx="12" cy="7.5" r="4"/>',
    pin: '<path d="M19.5 10c0 5.5-7.5 11.5-7.5 11.5S4.5 15.5 4.5 10a7.5 7.5 0 0 1 15 0Z"/><circle cx="12" cy="10" r="2.6"/>',
    down: '<path d="m6 9 6 6 6-6"/>', right: '<path d="m9 6 6 6-6 6"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    left: '<path d="M19 12H5"/><path d="m11.5 18.5-6.5-6.5 6.5-6.5"/>',
    arrow: '<path d="M5 12h14"/><path d="m12.5 5.5 6.5 6.5-6.5 6.5"/>',
    clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.5 2"/>',
    bike: '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
    tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1" fill="currentColor"/>',
    star: '<path d="M12 2.8l2.85 5.78 6.38.93-4.62 4.5 1.09 6.35L12 17.36l-5.7 3 1.09-6.35-4.62-4.5 6.38-.93z"/>',
    heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>', plus: '<path d="M5 12h14"/><path d="M12 5v14"/>', minus: '<path d="M5 12h14"/>',
    pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
    walk: '<circle cx="13" cy="4" r="1.6"/><path d="m9.5 21 2.2-5.5 2.8 2.5V21"/><path d="M8 11.5 10 8l3.5-1 2.5 3.5 2.5 1"/><path d="m11.7 15.5.8-5"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.4.4 1.6 1.4 2.9 2.5 2.9z"/>',
    sliders: '<path d="M4 6h10"/><path d="M18 6h2"/><circle cx="16" cy="6" r="2"/><path d="M4 12h4"/><path d="M12 12h8"/><circle cx="10" cy="12" r="2"/><path d="M4 18h12"/><circle cx="18" cy="18" r="2"/>',
    sort: '<path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/>',
    share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>',
    info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    receipt: '<path d="M5 2.5v19l2.5-1.5 2.5 1.5 2-1.5 2 1.5 2.5-1.5 2.5 1.5v-19l-2.5 1.5-2.5-1.5-2 1.5-2-1.5L7.5 4z"/><path d="M9 8.5h6"/><path d="M9 12.5h6"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-2.2 3.2"/><path d="M6.6 6.6A17 17 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.4-1.6"/><path d="M14.1 14.1a3 3 0 0 1-4.2-4.2"/><path d="m2 2 20 20"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    help: '<circle cx="12" cy="12" r="9.5"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>'
  };
  B.icon = function (name, size, cls) {
    var s = size || 20;
    return '<svg class="ic ' + (cls || '') + '" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (I[name] || '') + '</svg>';
  };
  var PLATE = '<svg class="plate" viewBox="0 0 124 100" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v18a8 8 0 0 0 16 0V8"/><path d="M20 8v86"/><circle cx="62" cy="54" r="35"/><circle cx="62" cy="54" r="24"/><path d="M112 94V8c-8.5 5-12.5 17-12.5 29.5 0 8.5 4.5 13 12.5 13"/></svg>';
  B.plate = PLATE;
  B.placeholder = function () { return '<div class="ph">' + PLATE + '</div>'; };
  B.img = function (src, alt) {
    if (!src) return B.placeholder();
    return '<img class="cover" src="' + B.esc(src) + '" alt="' + B.esc(alt || '') + '" loading="lazy" decoding="async" onerror="Blinca.imgFail(this)">';
  };
  B.imgFail = function (el) { var d = document.createElement('div'); d.innerHTML = B.placeholder(); if (el.parentNode) el.parentNode.replaceChild(d.firstChild, el); };
  B.tags = function (it) {
    return (it.tags || []).map(function (tg) {
      return tg === 'vegetarian' ? '<span class="tag veg">' + B.icon('leaf', 13) + t('tag.vegetarian') + '</span>'
        : tg === 'spicy' ? '<span class="tag hot">' + B.icon('flame', 13) + t('tag.spicy') + '</span>' : '';
    }).join('');
  };
  B.statusText = function (r) {
    if (r.status === 'open') return t('rest.openCloses', { time: r.closesAt });
    if (r.status === 'paused') return t('rest.paused');
    return t('rest.closedOpens', { time: r.opensAt });
  };

  /* ---------- pricing (subtotal, delivery, promo, VAT) ---------- */
  B.pricing = function (mode) {
    var r = S.cartRestaurant();
    var sub = S.subtotal();
    mode = mode || S.mode();
    var fee = r && mode === 'delivery' ? r.fee : 0;
    var discount = 0, promo = null;
    var code = S.promo();
    if (code && r) {
      var o = D.offers.filter(function (x) { return x.code === code; })[0];
      promo = { code: code, valid: false, msg: '' };
      if (!o) promo.msg = t('promo.unknown');
      else if (o.rule.weekday != null && new Date().getDay() !== o.rule.weekday) promo.msg = t('promo.tuesday');
      else if (o.rule.untilHour != null && new Date().getHours() >= o.rule.untilHour) promo.msg = t('promo.ended');
      else if (o.rule.type === 'freeDelivery') {
        if (mode !== 'delivery') promo.msg = t('promo.deliveryOnly');
        else if (sub < o.rule.min) promo.msg = t('promo.spendMore', { n: o.rule.min - sub });
        else { promo.valid = true; discount = fee; promo.label = t('promo.freeDelivery'); }
      } else if (o.rule.type === 'percent') {
        promo.valid = true; discount = Math.round(sub * o.rule.value / 100); promo.label = o.rule.value + ' %';
      }
    }
    var total = Math.max(0, sub + fee - discount);
    var vatBase = Math.max(0, sub - (promo && promo.valid && promo.label !== t('promo.freeDelivery') ? discount : 0));
    var vat = Math.floor(vatBase * D.vatRate / (1 + D.vatRate) * 100) / 100;
    return { r: r, sub: sub, fee: fee, discount: discount, total: total, vat: vat, promo: promo, mode: mode };
  };

  /* ================================================================
     HEADER (one header on every page)
     ================================================================ */
  var headerOpts = {};
  function addrLabel() { var a = S.address(); return B.esc(a.street + ', ' + a.city); }
  function badge() { var n = S.count(); return '<span class="badge" data-cart-badge' + (n ? '' : ' hidden') + '>' + n + '</span>'; }
  function langMenu() {
    var l = S.lang();
    return '<div class="menu lang-menu" role="menu" hidden>' +
      ['en', 'sv'].map(function (x) {
        return '<button role="menuitemradio" aria-checked="' + (l === x) + '" data-action="set-lang" data-lang="' + x + '"><span class="lm-code">' + x.toUpperCase() + '</span>' + (x === 'en' ? 'English' : 'Svenska') + (l === x ? B.icon('check', 16, 'ml-auto brand') : '') + '</button>';
      }).join('') + '</div>';
  }
  function acctMenu() {
    var u = S.user();
    var nav = '<a href="info.html?page=how">' + B.icon('info', 18) + t('nav.how') + '</a><a href="info.html?page=about">' + B.icon('heart', 18) + t('nav.about') + '</a><a href="info.html?page=contact">' + B.icon('help', 18) + t('nav.contact') + '</a>';
    if (!u) return '<div class="menu acct-menu" role="menu" hidden><a href="login.html">' + B.icon('user', 18) + t('acct.login') + '</a><div class="menu-sep"></div>' + nav + '</div>';
    return '<div class="menu acct-menu" role="menu" hidden><div class="menu-user"><strong>' + B.esc(u.name) + '</strong><span>' + B.esc(u.email) + '</span></div>' +
      '<a href="info.html?page=account">' + B.icon('user', 18) + t('acc.profile') + '</a>' +
      '<a href="info.html?page=account&tab=orders">' + B.icon('receipt', 18) + t('acc.orders') + '</a>' +
      '<a href="info.html?page=account&tab=favourites">' + B.icon('heart', 18) + t('acc.favourites') + '</a>' +
      '<a href="info.html?page=account&tab=addresses">' + B.icon('pin', 18) + t('acc.addresses') + '</a>' +
      '<div class="menu-sep"></div>' + nav + '<div class="menu-sep"></div>' +
      '<button class="danger" data-action="logout">' + B.icon('logout', 18) + t('acct.logout') + '</button></div>';
  }
  function headerHTML() {
    var cart = headerOpts.noCart ? '' : '<button class="icon-btn" data-action="open-cart" aria-label="' + t('header.cart') + '">' + B.icon('cart', 21) + badge() + '</button>';
    return '<div class="wrap hdr-in">' +
      '<a class="logo" href="index.html" aria-label="Blinca – ' + t('nav.home') + '">' + B.logo() + '</a>' +
      '<button class="addr-btn" data-action="open-address" aria-haspopup="dialog">' + B.icon('pin', 20) +
        '<span class="addr-text"><small>' + t('header.deliveryAddress') + '</small><strong data-addr-text>' + addrLabel() + '</strong></span>' + B.icon('down', 18, 'muted-ic') + '</button>' +
      '<div class="search" role="search">' + B.icon('search', 18, 'search-ic') +
        '<input type="search" class="search-input" autocomplete="off" placeholder="' + t('header.search') + '" aria-label="' + t('header.search') + '">' +
        '<div class="search-results" hidden></div></div>' +
      '<div class="pop-wrap"><button class="lang-pill" data-action="toggle-menu" aria-haspopup="true" aria-expanded="false" aria-label="' + t('header.language') + '">' + B.icon('globe', 19) + S.lang().toUpperCase() + B.icon('down', 15) + '</button>' + langMenu() + '</div>' +
      '<div class="pop-wrap"><button class="icon-btn" data-action="toggle-menu" aria-haspopup="true" aria-expanded="false" aria-label="' + t('header.account') + '">' + B.icon('user', 20) + '</button>' + acctMenu() + '</div>' +
      cart + '</div>';
  }
  function mobileChrome() {
    var p = B.page;
    var tab = function (id, href, icon, label, act) {
      return (act ? '<button data-action="' + act + '"' : '<a href="' + href + '"') + ' class="' + (p === id ? 'is-here' : '') + '"><span class="tb-ic">' + B.icon(icon, 22) + (id === 'cart' ? badge() : '') + '</span><span>' + label + '</span>' + (act ? '</button>' : '</a>');
    };
    return '<nav class="tabbar" aria-label="' + t('nav.main') + '">' +
      tab('home', 'index.html', 'home', t('nav.home')) + tab('search', '', 'search', t('nav.search'), 'open-search') +
      tab('orders', 'info.html?page=account&tab=orders', 'receipt', t('acc.orders')) + tab('account', 'info.html?page=account', 'user', t('header.account')) + '</nav>';
  }
  B.mountHeader = function (opts) {
    headerOpts = opts || headerOpts;
    var el = document.getElementById('site-header');
    if (!el) return;
    el.className = 'hdr' + (headerOpts.noCart ? ' no-cart' : '');
    el.innerHTML = headerHTML();
    var old = document.querySelector('.tabbar');
    if (old) old.remove();
    if (!headerOpts.noTabbar) document.body.insertAdjacentHTML('beforeend', mobileChrome());
    wireSearch(el.querySelector('.search'));
  };
  function refreshHeaderBits() {
    document.querySelectorAll('[data-cart-badge]').forEach(function (b) { var n = S.count(); b.textContent = n; b.hidden = !n; });
    document.querySelectorAll('[data-addr-text]').forEach(function (s) { s.innerHTML = addrLabel(); });
  }

  /* search (header + mobile sheet share it) */
  function wireSearch(wrap) {
    if (!wrap) return;
    var input = wrap.querySelector('input'), box = wrap.querySelector('.search-results');
    var q0 = B.params().get('q');
    if (q0 && B.page === 'home') input.value = q0;
    input.addEventListener('input', function () { renderResults(input.value, box); });
    input.addEventListener('focus', function () { if (input.value.trim()) renderResults(input.value, box); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); var v = input.value.trim(); window.location.href = 'index.html' + (v ? '?q=' + encodeURIComponent(v) : '') + '#all-restaurants'; }
      if (e.key === 'Escape') { box.hidden = true; input.blur(); }
    });
  }
  B.wireSearch = function (w) { wireSearch(w); };
  function renderResults(value, box) {
    var q = B.norm(value.trim());
    if (!q) { box.hidden = true; box.innerHTML = ''; return; }
    var rs = D.restaurants.filter(function (r) {
      return B.norm(r.name).indexOf(q) !== -1 || r.cuisines.some(function (c) { var cu = B.cuisine(c); return cu && (B.norm(cu.name.en).indexOf(q) !== -1 || B.norm(cu.name.sv).indexOf(q) !== -1); });
    }).slice(0, 5);
    var dishes = [];
    D.restaurants.forEach(function (r) { r.menu.forEach(function (c) { c.items.forEach(function (i) { if (B.norm(i.name.en).indexOf(q) !== -1 || B.norm(i.name.sv).indexOf(q) !== -1) dishes.push({ r: r, i: i }); }); }); });
    dishes = dishes.slice(0, 6);
    var row = function (href, im, title, sub) { return '<a class="sr-row" href="' + href + '"><span class="sr-th">' + B.img(im) + '</span><span><strong>' + title + '</strong><small>' + sub + '</small></span></a>'; };
    var html = '';
    if (rs.length) html += '<div class="sr-group">' + t('search.restaurants') + '</div>' + rs.map(function (r) { return row(B.restaurantUrl(r.slug), r.image, B.esc(r.name), B.cuisineNames(r)); }).join('');
    if (dishes.length) html += '<div class="sr-group">' + t('search.dishes') + '</div>' + dishes.map(function (d) { return row(B.restaurantUrl(d.r.slug, d.i.id), d.i.image, B.esc(B.L(d.i.name)), B.esc(d.r.name) + ' · ' + B.kr(d.i.price)); }).join('');
    box.innerHTML = html || '<div class="sr-empty">' + t('search.none', { q: B.esc(value.trim()) }) + '</div>';
    box.hidden = false;
  }
  B.openSearchSheet = function () {
    var d = B.openDrawer({ side: 'top', label: t('nav.search'), className: 'sheet-search',
      html: '<div class="d-head"><h2>' + t('nav.search') + '</h2><button class="icon-btn sm" data-close aria-label="' + t('common.close') + '">' + B.icon('x', 18) + '</button></div>' +
        '<div class="d-body"><button class="addr-btn sheet-addr" data-action="open-address">' + B.icon('pin', 20) + '<span class="addr-text"><small>' + t('header.deliveryAddress') + '</small><strong data-addr-text>' + addrLabel() + '</strong></span>' + B.icon('down', 18, 'muted-ic') + '</button>' +
        '<div class="search">' + B.icon('search', 18, 'search-ic') + '<input type="search" class="search-input" autofocus autocomplete="off" placeholder="' + t('header.search') + '" aria-label="' + t('header.search') + '"><div class="search-results inline" hidden></div></div></div>' });
    wireSearch(d.el.querySelector('.search'));
  };

  /* ================================================================
     FOOTER (dark on browsing pages, minimal on task pages)
     ================================================================ */
  B.mountFooter = function (kind) {
    var el = document.getElementById('site-footer');
    if (!el) return;
    var render = function () {
      if (kind === 'min') {
        el.className = 'ftr-min';
        el.innerHTML = '<div class="wrap"><a href="info.html?page=help">' + t('footer.help') + '</a><a href="info.html?page=terms">' + t('footer.terms') + '</a><a href="info.html?page=privacy">' + t('footer.privacy') + '</a><span aria-hidden="true">·</span><span>' + t('footer.language') + ' <button data-action="set-lang" data-lang="sv">Svenska</button> / <button data-action="set-lang" data-lang="en">English</button></span></div>';
        return;
      }
      el.className = 'ftr';
      el.innerHTML = '<div class="wrap"><div class="ftr-grid"><div><a class="ftr-logo" href="index.html">' + B.logo(true) + '</a><p>' + t('footer.tagline') + '</p></div>' +
        '<div><h4>Blinca</h4><a href="info.html?page=about">' + t('nav.about') + '</a><a href="info.html?page=how">' + t('nav.how') + '</a><a href="info.html?page=careers">' + t('footer.careers') + '</a></div>' +
        '<div><h4>' + t('footer.work') + '</h4><a href="info.html?page=partner">' + t('footer.addRestaurant') + '</a><a href="info.html?page=courier">' + t('footer.courier') + '</a></div>' +
        '<div><h4>' + t('footer.help') + '</h4><a href="info.html?page=help">' + t('footer.helpCentre') + '</a><a href="info.html?page=contact">' + t('nav.contact') + '</a><a href="info.html?page=terms">' + t('footer.terms') + '</a><a href="info.html?page=privacy">' + t('footer.privacy') + '</a></div></div>' +
        '<div class="ftr-bottom"><span>© ' + new Date().getFullYear() + ' Blinca AB</span><span><button data-action="set-lang" data-lang="sv">Svenska</button> / <button data-action="set-lang" data-lang="en">English</button></span></div></div>';
    };
    render();
    S.on(function (type) { if (type === 'lang') render(); });
  };

  /* ================================================================
     LAYERS: modal + drawer share focus trap, Esc and scroll lock
     ================================================================ */
  var layers = [];
  function openLayer(wrapClass, panelClass, html, opts) {
    opts = opts || {};
    var last = document.activeElement;
    var wrap = document.createElement('div');
    wrap.className = wrapClass;
    wrap.innerHTML = '<div class="scrim" data-close></div><div class="' + panelClass + ' ' + (opts.className || '') + '" role="dialog" aria-modal="true" aria-label="' + B.esc(opts.label || '') + '" tabindex="-1">' + html + '</div>';
    document.body.appendChild(wrap);
    document.body.classList.add('no-scroll');
    var panel = wrap.lastChild;
    var api = {
      el: panel,
      close: function () {
        if (!wrap.parentNode) return;
        wrap.classList.remove('is-open');
        layers = layers.filter(function (l) { return l !== api; });
        if (!layers.length) document.body.classList.remove('no-scroll');
        setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 240);
        if (opts.onClose) opts.onClose();
        if (last && last.focus) try { last.focus({ preventScroll: true }); } catch (e) { /* noop */ }
      }
    };
    layers.push(api);
    wrap.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) { e.preventDefault(); api.close(); } });
    requestAnimationFrame(function () {
      wrap.classList.add('is-open');
      var f = panel.querySelector('[autofocus]') || panel;
      try { f.focus({ preventScroll: true }); } catch (e) { /* noop */ }
    });
    return api;
  }
  B.openModal = function (html, opts) { return openLayer('modal-wrap', 'modal', html, opts); };
  B.openDrawer = function (opts) { return openLayer('drawer-wrap side-' + (opts.side || 'right'), 'drawer', opts.html, opts); };
  B.closeAll = function () { layers.slice().forEach(function (l) { l.close(); }); };
  document.addEventListener('keydown', function (e) {
    if (!layers.length) return;
    if (e.key === 'Escape') { layers[layers.length - 1].close(); return; }
    if (e.key === 'Tab') {
      var m = layers[layers.length - 1].el;
      var f = Array.prototype.filter.call(m.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'), function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  B.confirm = function (o) {
    var m = B.openModal('<div class="confirm"><h2>' + o.title + '</h2><p>' + o.text + '</p><div class="confirm-actions"><button class="btn btn-ghost" data-close>' + (o.cancel || t('common.cancel')) + '</button><button class="btn btn-primary" data-ok autofocus>' + o.ok + '</button></div></div>', { className: 'modal-sm', label: o.title });
    m.el.querySelector('[data-ok]').addEventListener('click', function () { m.close(); o.onOk(); });
    return m;
  };

  var toastTimer;
  B.toast = function (msg) {
    var el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
    el.innerHTML = B.icon('check', 18) + '<span>' + msg + '</span>';
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  };
  B.copy = function (text, msg) {
    var done = function () { B.toast(msg); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done); else done();
  };

  /* ================================================================
     ADDRESS PICKER + NEW ADDRESS FORM
     ================================================================ */
  B.addrIcon = function (a) { return a.id === 'home' ? 'home' : a.id === 'work' ? 'briefcase' : 'pin'; };
  B.openAddressModal = function () {
    var cur = S.addressId();
    var html = '<div class="modal-pad"><div class="m-head"><h2>' + t('addr.choose') + '</h2><button class="icon-btn sm" data-close aria-label="' + t('common.close') + '">' + B.icon('x', 18) + '</button></div>' +
      '<div class="tile-list">' + S.allAddresses().map(function (a) {
        var ok = B.deliverable(a);
        return '<button class="radio-tile' + (a.id === cur ? ' is-on' : '') + '" data-addr="' + a.id + '" aria-pressed="' + (a.id === cur) + '"><span class="rdot"></span><span class="ti">' + B.icon(B.addrIcon(a), 18) + '</span>' +
          '<span class="rt-text"><strong>' + B.esc(a.label) + '</strong><span>' + B.esc(a.street + ', ' + a.zip + ' ' + a.city) + (ok ? '' : ' · ' + t('addr.outside')) + '</span></span></button>';
      }).join('') + '</div>' +
      '<button class="btn btn-secondary btn-sm dashed mt-12" data-addnew>' + B.icon('plus', 16) + t('addr.addNew') + '</button></div>';
    var m = B.openModal(html, { label: t('addr.choose') });
    m.el.querySelectorAll('[data-addr]').forEach(function (b) {
      b.addEventListener('click', function () { S.setAddress(b.getAttribute('data-addr')); m.close(); B.toast(t('addr.changed')); });
    });
    m.el.querySelector('[data-addnew]').addEventListener('click', function () { m.close(); B.openAddressForm(); });
  };
  B.openAddressForm = function (onSaved) {
    var html = '<form class="modal-pad" novalidate><div class="m-head"><h2>' + t('addr.newTitle') + '</h2><button type="button" class="icon-btn sm" data-close aria-label="' + t('common.close') + '">' + B.icon('x', 18) + '</button></div>' +
      '<label class="label" for="na-label">' + t('addr.label') + '</label><input class="field" id="na-label" placeholder="' + t('addr.labelPh') + '">' +
      '<label class="label mt-12" for="na-street">' + t('co.street') + '</label><input class="field" id="na-street" autocomplete="street-address" required autofocus>' +
      '<div class="two-col mt-12"><div><label class="label" for="na-zip">' + t('co.zip') + '</label><input class="field" id="na-zip" inputmode="numeric" autocomplete="postal-code" required></div>' +
      '<div><label class="label" for="na-city">' + t('co.city') + '</label><input class="field" id="na-city" autocomplete="address-level2" required></div></div>' +
      '<p class="form-err" data-err hidden></p>' +
      '<div class="confirm-actions"><button type="button" class="btn btn-ghost" data-close>' + t('common.cancel') + '</button><button class="btn btn-primary">' + t('addr.save') + '</button></div></form>';
    var m = B.openModal(html, { label: t('addr.newTitle') });
    var form = m.el.querySelector('form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var get = function (id) { return form.querySelector('#' + id).value.trim(); };
      var bad = ['na-street', 'na-zip', 'na-city'].filter(function (id) { return !get(id); });
      form.querySelectorAll('.field').forEach(function (f) { f.classList.toggle('is-invalid', bad.indexOf(f.id) !== -1); });
      if (bad.length) { var er = form.querySelector('[data-err]'); er.textContent = t('form.fix'); er.hidden = false; form.querySelector('#' + bad[0]).focus(); return; }
      var a = S.addAddress({ label: get('na-label') || t('addr.other'), street: get('na-street'), zip: get('na-zip'), city: get('na-city'), extraEta: 10 });
      m.close();
      B.toast(t('addr.saved'));
      if (onSaved) onSaved(a);
    });
  };

  /* ================================================================
     ADD CONTROL + STEPPER (identical everywhere)
     ================================================================ */
  B.stepperHTML = function (q, decAttrs, incAttrs, size, name, disabledInc) {
    return '<div class="stepper ' + (size || '') + '"><button ' + decAttrs + ' aria-label="' + t('qty.less', { name: name }) + '">' + B.icon('minus', 16) + '</button>' +
      '<b aria-live="polite">' + q + '</b><button ' + incAttrs + ' aria-label="' + t('qty.more', { name: name }) + '"' + (disabledInc ? ' disabled' : '') + '>' + B.icon('plus', 16) + '</button></div>';
  };
  function ctrlInner(slug, itemId) {
    var it = S.item(slug, itemId), r = S.restaurant(slug);
    var q = S.itemQty(slug, itemId), name = B.esc(B.L(it.name)), closed = r.status !== 'open';
    var a = 'data-slug="' + slug + '" data-item="' + itemId + '"';
    if (q > 0) return B.stepperHTML(q, 'data-action="dec-item" ' + a, 'data-action="add-item" ' + a, '', name, closed);
    return '<button class="add-round" data-action="add-item" ' + a + ' aria-label="' + t('qty.add', { name: name }) + '"' + (closed ? ' disabled' : '') + '>' + B.icon('plus', 18) + '</button>';
  }
  B.ctrl = function (slug, itemId) { return '<div class="ctrl" data-ctrl="' + slug + '|' + itemId + '">' + ctrlInner(slug, itemId) + '</div>'; };
  B.refreshControls = function () {
    document.querySelectorAll('[data-ctrl]').forEach(function (el) {
      var p = el.getAttribute('data-ctrl').split('|');
      var had = el.contains(document.activeElement) ? document.activeElement.getAttribute('data-action') : null;
      el.innerHTML = ctrlInner(p[0], p[1]);
      if (had) { var f = el.querySelector('[data-action="' + had + '"]') || el.querySelector('button'); if (f) f.focus({ preventScroll: true }); }
    });
  };

  B.addToCart = function (slug, itemId, opts, qty, note) {
    var r = S.restaurant(slug), it = S.item(slug, itemId);
    if (!r || !it) return;
    if (r.status !== 'open') { B.toast(t('rest.notTaking', { name: B.esc(r.name) })); return; }
    var name = B.esc(B.L(it.name));
    var res = S.addLine(slug, itemId, opts || {}, qty || 1, note);
    if (res === 'conflict') {
      var other = S.cartRestaurant();
      B.confirm({ title: t('conflict.title'), text: t('conflict.text', { other: B.esc(other.name), name: B.esc(r.name) }), ok: t('conflict.ok'),
        onOk: function () { S.clearCart(); S.addLine(slug, itemId, opts || {}, qty || 1, note); B.toast(t('cart.added', { name: name })); } });
      return;
    }
    B.toast(t('cart.added', { name: name }));
  };
  B.requestAdd = function (slug, itemId) {
    var it = S.item(slug, itemId), r = S.restaurant(slug);
    if (!it || !r) return;
    if (r.status !== 'open') { B.toast(t('rest.notTaking', { name: B.esc(r.name) })); return; }
    if (it.options && it.options.length) B.openItemModal(slug, itemId); else B.addToCart(slug, itemId, {});
  };

  /* ================================================================
     ITEM / ADD-ON POPUP
     ================================================================ */
  B.rank = function (r, itemId) { var i = (r.popular || []).indexOf(itemId); return i === -1 ? 0 : i + 1; };
  B.openItemModal = function (slug, itemId) {
    var it = S.item(slug, itemId), r = S.restaurant(slug);
    if (!it) return;
    var sel = {}, qty = 1;
    (it.options || []).forEach(function (g) { sel[g.id] = []; });
    var rank = B.rank(r, itemId);
    var groups = (it.options || []).map(function (g) {
      var single = g.max === 1;
      return '<fieldset class="og" data-group="' + g.id + '"><div class="og-head"><legend>' + B.esc(B.L(g.name)) + '</legend><span class="tag" data-rule="' + g.id + '"></span></div>' +
        g.choices.map(function (c) {
          return '<label class="opt"><input type="' + (single ? 'radio' : 'checkbox') + '" name="g-' + g.id + '" value="' + c.id + '"><span class="box' + (single ? ' round' : '') + '">' + B.icon('check', 13) + '</span>' +
            '<span class="opt-name">' + B.esc(B.L(c.name)) + '</span><span class="opt-price">' + (c.price ? '+' + B.kr(c.price) : '') + '</span></label>';
        }).join('') + '</fieldset>';
    }).join('');
    var html = '<div class="item-modal"><div class="im-media">' + B.img(it.image, B.L(it.name)) +
      '<button class="icon-btn sm white im-close" data-close aria-label="' + t('common.close') + '">' + B.icon('x', 18) + '</button></div>' +
      '<div class="im-main"><div class="im-scroll"><h2>' + B.esc(B.L(it.name)) + '</h2><p class="muted">' + B.esc(B.L(it.desc)) + '</p>' +
      '<div class="im-meta"><b>' + B.kr(it.price) + '</b>' + B.tags(it) + (rank ? '<span class="tag">' + t('rest.mostOrdered', { n: rank }) + '</span>' : '') + '</div>' +
      groups +
      '<label class="og-title-row" for="im-note"><span class="h3">' + t('item.note') + '</span><span class="count">' + t('common.optional') + '</span></label>' +
      '<textarea class="field field-area" id="im-note" rows="2" maxlength="140" placeholder="' + t('item.notePh') + '"></textarea></div>' +
      '<div class="im-foot"><div class="stepper md" data-qty><button data-q="-1" aria-label="−">' + B.icon('minus', 16) + '</button><b>1</b><button data-q="1" aria-label="+">' + B.icon('plus', 16) + '</button></div>' +
      '<button class="btn btn-primary btn-lg grow" data-add></button></div></div></div>';
    var m = B.openModal(html, { className: 'modal-item', label: B.L(it.name) });
    var root = m.el;
    function valid() { return (it.options || []).every(function (g) { return sel[g.id].length >= g.min && sel[g.id].length <= g.max; }); }
    function firstMissing() { var g = (it.options || []).filter(function (g) { return sel[g.id].length < g.min; })[0]; return g ? B.L(g.name).toLowerCase() : ''; }
    function update() {
      var unit = S.unitPrice(slug, itemId, sel);
      var btn = root.querySelector('[data-add]');
      btn.disabled = !valid();
      btn.textContent = valid() ? t('item.addPrice', { price: B.kr(unit * qty) }) : t('item.choose', { name: firstMissing() });
      root.querySelector('[data-qty] b').textContent = qty;
      root.querySelector('[data-q="-1"]').disabled = qty <= 1;
      (it.options || []).forEach(function (g) {
        var n = sel[g.id].length;
        var rule = root.querySelector('[data-rule="' + g.id + '"]');
        rule.textContent = g.min > 0 ? t('item.required', { n: g.max }) + (n ? ' · ✓' : '') : t('item.upTo', { max: g.max, n: n });
        rule.classList.toggle('hot', g.min > 0 && !n);
        var full = g.max > 1 && n >= g.max;
        root.querySelectorAll('[data-group="' + g.id + '"] input').forEach(function (inp) {
          inp.disabled = full && !inp.checked;
          inp.closest('.opt').classList.toggle('is-on', inp.checked);
          inp.closest('.opt').classList.toggle('is-dis', inp.disabled);
        });
      });
    }
    root.addEventListener('change', function (e) {
      var inp = e.target;
      if (!inp.name || inp.name.indexOf('g-') !== 0) return;
      var gid = inp.name.slice(2);
      sel[gid] = Array.prototype.map.call(root.querySelectorAll('input[name="g-' + gid + '"]:checked'), function (x) { return x.value; });
      update();
    });
    root.querySelectorAll('[data-q]').forEach(function (b) { b.addEventListener('click', function () { qty = Math.max(1, Math.min(20, qty + +b.getAttribute('data-q'))); update(); }); });
    root.querySelector('[data-add]').addEventListener('click', function () {
      if (!valid()) return;
      var note = root.querySelector('#im-note').value;
      var copy = JSON.parse(JSON.stringify(sel));
      m.close();
      B.addToCart(slug, itemId, copy, qty, note);
    });
    update();
  };

  /* ================================================================
     CART DRAWER
     ================================================================ */
  B.optText = function (l) {
    var it = S.item(l.slug, l.itemId), parts = [];
    (it.options || []).forEach(function (g) { var ch = l.opts[g.id] || []; g.choices.forEach(function (c) { if (ch.indexOf(c.id) !== -1) parts.push(B.L(c.name)); }); });
    return parts.join(', ');
  };
  B.lineSub = function (l) { var o = B.optText(l); return B.esc(o) + (l.note ? (o ? ' · ' : '') + '“' + B.esc(l.note) + '”' : ''); };
  B.lineStepper = function (l) {
    var name = B.esc(B.L(S.item(l.slug, l.itemId).name)), k = B.esc(l.key);
    return B.stepperHTML(l.qty, 'data-action="line-dec" data-key="' + k + '"', 'data-action="line-inc" data-key="' + k + '"', '', name);
  };
  B.promoBox = function (pr) {
    var p = pr.promo;
    if (p && p.valid) return '<div class="promo-row is-ok">' + B.icon('tag', 18) + '<span><b>' + B.esc(p.code) + '</b> · ' + p.label + '</span><button class="btn-link sm" data-action="promo-remove">' + t('cart.remove') + '</button></div>';
    return '<form class="promo-row" data-promo-form>' + B.icon('tag', 18) + '<input class="promo-input" name="code" placeholder="' + t('promo.placeholder') + '" aria-label="' + t('promo.placeholder') + '" value="' + B.esc(p ? p.code : '') + '" autocomplete="off"><button class="btn btn-secondary btn-sm">' + t('promo.apply') + '</button></form>' +
      (p && !p.valid ? '<p class="form-err">' + p.msg + '</p>' : '');
  };
  B.totalsHTML = function (pr) {
    return '<div class="sum-row"><span>' + t('cart.subtotal') + '</span><span>' + B.kr(pr.sub) + '</span></div>' +
      (pr.mode === 'delivery' ? '<div class="sum-row"><span>' + t('co.deliveryFee') + '</span><span>' + B.kr(pr.fee) + '</span></div>' : '') +
      (pr.discount ? '<div class="sum-row good"><span>' + t('promo.discount') + ' (' + B.esc(pr.promo.code) + ')</span><span>−' + B.kr(pr.discount) + '</span></div>' : '') +
      '<div class="sum-total"><span>' + t('co.total') + '</span><span>' + B.kr(pr.total) + '</span></div>' +
      '<p class="vat">' + t('co.vat', { vat: B.decimal(pr.vat) }) + '</p>';
  };
  function cartDrawerHTML() {
    var cart = S.cart(), r = S.cartRestaurant(), n = S.count();
    var head = '<div class="d-head"><h2>' + t('cart.title') + (n ? '<span class="count">' + t('cart.items', { n: n }) + '</span>' : '') + '</h2><button class="icon-btn sm" data-close aria-label="' + t('common.close') + '">' + B.icon('x', 18) + '</button></div>';
    if (!cart.length) {
      return head + '<div class="d-body"><div class="empty"><span class="empty-ic">' + B.icon('cart', 28) + '</span><h3>' + t('cart.empty') + '</h3><p>' + t('cart.emptyText') + '</p><a class="btn btn-primary" href="index.html#all-restaurants">' + t('cart.browse') + '</a></div></div>';
    }
    var pr = B.pricing();
    return head + '<div class="d-body">' +
      '<div class="card row-card"><span class="th">' + B.img(r.image) + '</span><span class="grow"><strong>' + B.esc(r.name) + '</strong><small>' + (S.mode() === 'delivery' ? t('rest.deliveryEta', { n: r.eta + '–' + (r.eta + 10) }) : t('rest.pickupEta', { n: r.pickupEta })) + '</small></span>' +
      '<a class="btn btn-secondary btn-sm" href="' + B.restaurantUrl(r.slug) + '">' + t('cart.viewMenu') + '</a></div>' +
      cart.map(function (l) {
        var it = S.item(l.slug, l.itemId);
        return '<div class="card cart-line"><span class="th">' + B.img(it.image) + '</span><div class="cl-info"><strong>' + B.esc(B.L(it.name)) + '</strong>' +
          (B.lineSub(l) ? '<small>' + B.lineSub(l) + '</small>' : '') + '<b>' + B.kr(S.lineTotal(l)) + '</b></div>' +
          '<div class="cl-side"><button class="icon-btn xs" data-action="line-remove" data-key="' + B.esc(l.key) + '" aria-label="' + t('cart.remove') + '">' + B.icon('trash', 15) + '</button>' + B.lineStepper(l) + '</div></div>';
      }).join('') +
      '<div class="card promo-card">' + B.promoBox(pr) + '</div></div>' +
      '<div class="d-foot">' + B.totalsHTML(pr) + '<a class="btn btn-primary btn-lg btn-block mt-12" href="checkout.html">' + t('cart.goCheckout') + '</a></div>';
  }
  var cartDrawer = null;
  B.openCart = function () {
    if (B.page === 'checkout') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (cartDrawer) return;
    cartDrawer = B.openDrawer({ side: 'right', label: t('cart.title'), className: 'drawer-cart', html: cartDrawerHTML(), onClose: function () { cartDrawer = null; } });
  };
  function refreshCartDrawer() {
    if (!cartDrawer) return;
    var focusKey = document.activeElement && cartDrawer.el.contains(document.activeElement) ? [document.activeElement.getAttribute('data-action'), document.activeElement.getAttribute('data-key')] : null;
    cartDrawer.el.innerHTML = cartDrawerHTML();
    if (focusKey) { var f = cartDrawer.el.querySelector('[data-action="' + focusKey[0] + '"][data-key="' + (focusKey[1] || '').replace(/"/g, '\\"') + '"]') || cartDrawer.el.querySelector('[data-close]'); if (f) f.focus({ preventScroll: true }); }
  }

  /* offers drawer */
  B.offerCard = function (o) {
    return '<button class="offer theme-' + o.theme + '" data-action="copy-code" data-code="' + o.code + '"><span class="offer-text"><strong>' + B.esc(B.L(o.title)) + '</strong><span>' + B.esc(B.L(o.text)) + '</span></span>' +
      '<span class="offer-img">' + B.img(o.image) + '<span class="code">' + o.code + '</span></span></button>';
  };
  B.openOffers = function () {
    B.openDrawer({ side: 'right', label: t('home.offers'), html: '<div class="d-head"><h2>' + t('home.offers') + '<span class="count">' + D.offers.length + '</span></h2><button class="icon-btn sm" data-close aria-label="' + t('common.close') + '">' + B.icon('x', 18) + '</button></div>' +
      '<div class="d-body">' + D.offers.map(B.offerCard).join('') + '<p class="muted small">' + t('offer.hint') + '</p></div>' });
  };

  /* carousel arrows */
  B.carousel = function (track, prev, next) {
    if (!track) return;
    function upd() { var max = track.scrollWidth - track.clientWidth - 2; if (prev) prev.disabled = track.scrollLeft <= 2; if (next) next.disabled = track.scrollLeft >= max; }
    function go(d) { track.scrollBy({ left: d * Math.max(240, track.clientWidth * 0.8), behavior: 'smooth' }); }
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd(); setTimeout(upd, 300);
  };

  /* ================================================================
     GLOBAL ACTIONS
     ================================================================ */
  function closeMenus(except) {
    document.querySelectorAll('.pop-wrap').forEach(function (w) {
      if (except && w.contains(except)) return;
      var m = w.querySelector('.menu'); if (m) m.hidden = true;
      var b = w.querySelector('[data-action="toggle-menu"]'); if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  B.closeMenus = closeMenus;
  document.addEventListener('click', function (e) {
    closeMenus(e.target);
    document.querySelectorAll('.search').forEach(function (s) { if (!s.contains(e.target)) { var r = s.querySelector('.search-results'); if (r && !r.classList.contains('inline')) r.hidden = true; } });
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var a = el.getAttribute('data-action'), slug = el.getAttribute('data-slug'), itemId = el.getAttribute('data-item'), key = el.getAttribute('data-key');
    switch (a) {
      case 'toggle-menu': { var menu = el.parentNode.querySelector('.menu'); menu.hidden = !menu.hidden; el.setAttribute('aria-expanded', String(!menu.hidden)); break; }
      case 'set-lang': S.setLang(el.getAttribute('data-lang')); break;
      case 'open-address': B.openAddressModal(); break;
      case 'open-cart': B.openCart(); break;
      case 'open-offers': e.preventDefault(); B.openOffers(); break;
      case 'open-search': B.openSearchSheet(); break;
      case 'add-item': e.preventDefault(); e.stopPropagation(); B.requestAdd(slug, itemId); break;
      case 'dec-item': e.preventDefault(); e.stopPropagation(); S.decItem(slug, itemId); break;
      case 'line-inc': S.changeQty(key, 1); break;
      case 'line-dec': S.changeQty(key, -1); break;
      case 'line-remove': S.removeLine(key); break;
      case 'promo-remove': S.setPromo(null); break;
      case 'copy-code': B.copy(el.getAttribute('data-code'), t('offer.copied', { code: el.getAttribute('data-code') })); break;
      case 'toggle-fav': {
        e.preventDefault(); e.stopPropagation();
        var on = S.toggleFav(slug);
        B.toast(t(on ? 'fav.added' : 'fav.removed', { name: B.esc(S.restaurant(slug).name) }));
        break;
      }
      case 'logout': S.setUser(null); B.toast(t('acct.loggedOut')); break;
      default: break;
    }
  });
  document.addEventListener('submit', function (e) {
    var f = e.target.closest('[data-promo-form]');
    if (!f) return;
    e.preventDefault();
    var code = f.code.value.trim().toUpperCase();
    if (!code) { f.code.focus(); return; }
    S.setPromo(code);
    var p = B.pricing().promo;
    if (p && p.valid) B.toast(t('promo.applied', { code: B.esc(code) }));
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenus(); });

  /* state changes */
  var lastLang = S.lang();
  S.on(function (type) {
    if (type === 'lang' || type === 'user' || S.lang() !== lastLang) { lastLang = S.lang(); B.mountHeader(); }
    else refreshHeaderBits();
    B.refreshControls();
    refreshCartDrawer();
    document.querySelectorAll('[data-fav]').forEach(function (b) {
      var on = S.isFav(b.getAttribute('data-slug'));
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
  });
  return B;
})();
