/* Blinca – home page v2 ("what are you hungry for?") */
(function () {
  'use strict';
  var B = window.Blinca, S = window.BlincaStore, D = window.BLINCA_DATA, t = window.t;
  var app = document.getElementById('app');

  /* ---------- All restaurants state (filters/sort/view/paging) ---------- */
  var EMPTY = { sort: 'recommended', open: false, free: false, veg: false, time: 0, rating: 0, price: [], cuisines: [] };
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function has(a, v) { return a.indexOf(v) !== -1; }
  function toggle(a, v) { var i = a.indexOf(v); if (i === -1) a.push(v); else a.splice(i, 1); }
  function loadView() { try { var v = window.localStorage.getItem('blinca.v1.homeView'); return v === 'list' ? 'list' : 'grid'; } catch (e) { return 'grid'; } }
  function saveView(v) { try { window.localStorage.setItem('blinca.v1.homeView', v); } catch (e) { /* private mode */ } }
  function isPhone() { return window.matchMedia('(max-width: 760px)').matches; }
  function isNarrowPop() { return window.matchMedia('(max-width: 1080px)').matches; }
  function gridIcon() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>'; }
  function listIcon() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3.5 6h.01"/><path d="M3.5 12h.01"/><path d="M3.5 18h.01"/></svg>'; }
  function upIcon() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>'; }

  var st = clone(EMPTY);
  st.mood = null;
  st.q = '';
  st.view = loadView();
  st.laterExpanded = false;
  st.openPages = 1;
  var openPop = null, clockTimer = null;

  (function readURL() {
    try {
      var p = B.params();
      var q = p.get('q'); if (q) st.q = q;
      var s = p.get('sort'); if (s === 'recommended' || s === 'fastest' || s === 'top') st.sort = s;
      if (p.get('open') === '1') st.open = true;
      if (p.get('free') === '1') st.free = true;
      if (p.get('veg') === '1') st.veg = true;
      var tm = parseInt(p.get('time'), 10); if (tm === 20 || tm === 30 || tm === 45) st.time = tm;
      var ra = parseFloat(p.get('rating')); if (ra === 4 || ra === 4.5) st.rating = ra;
      var pr = p.get('price');
      if (pr) st.price = pr.split(',').map(function (x) { return +x; }).filter(function (x) { return x === 1 || x === 2 || x === 3; });
      var cu = p.get('cuisines');
      if (cu) st.cuisines = cu.split(',').filter(function (id) { return !!B.cuisine(id); });
      var mo = p.get('mood');
      if (mo && D.moods.some(function (m) { return m.id === mo; })) st.mood = mo;
      var vw = p.get('view'); if (vw === 'list' || vw === 'grid') { st.view = vw; saveView(vw); }
      if (p.get('expanded') === '1') st.laterExpanded = true;
      var pg = parseInt(p.get('pages'), 10); if (pg > 1 && pg < 50) st.openPages = pg;
    } catch (e) { /* keep defaults */ }
  })();

  function writeURL() {
    try {
      if (!history.replaceState) return;
      var p = new URLSearchParams();
      if (st.q) p.set('q', st.q);
      if (st.mood) p.set('mood', st.mood);
      if (st.sort !== 'recommended') p.set('sort', st.sort);
      if (st.open) p.set('open', '1');
      if (st.free) p.set('free', '1');
      if (st.veg) p.set('veg', '1');
      if (st.time) p.set('time', String(st.time));
      if (st.rating) p.set('rating', String(st.rating));
      if (st.price.length) p.set('price', st.price.slice().sort().join(','));
      if (st.cuisines.length) p.set('cuisines', st.cuisines.join(','));
      if (st.view === 'list') p.set('view', 'list');
      if (st.laterExpanded) p.set('expanded', '1');
      if (st.openPages > 1) p.set('pages', String(st.openPages));
      var qs = p.toString();
      history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
    } catch (e) { /* noop */ }
  }

  B.mountHeader({});
  B.mountFooter('dark');

  var listed = function () { return D.restaurants.filter(function (r) { return r.listed || r.status === 'open'; }); };
  var allListed = function () { return D.restaurants.filter(function (r) { return r.listed; }); };
  var dishes = function () {
    var out = [];
    listed().forEach(function (r) { r.menu.forEach(function (c) { c.items.forEach(function (i) { out.push({ r: r, i: i }); }); }); });
    return out;
  };
  function minutes(hhmm) { var p = hhmm.split(':'); return +p[0] * 60 + +p[1]; }
  function nowMin() { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
  function opensToday(r) { return minutes(r.opensAt) > nowMin(); }

  /* ---------- intents ---------- */
  var INTENTS = [
    { id: 'fast', icon: 'bike', kind: 'dish', test: function (x) { return x.r.eta <= 25; } },
    { id: 'cheap', icon: 'tag', kind: 'dish', test: function (x) { return x.i.price < 100; } },
    { id: 'light', icon: 'leaf', kind: 'dish', test: function (x) { return (x.i.tags || []).indexOf('vegetarian') !== -1 || x.r.cuisines.some(function (c) { return c === 'vegan' || c === 'healthy'; }); } },
    { id: 'family', icon: 'user', kind: 'rest', test: function (r) { return r.priceLevel <= 2 && r.cuisines.some(function (c) { return ['pizza', 'burgers', 'kebab'].indexOf(c) !== -1; }); } },
    { id: 'spicy', icon: 'flame', kind: 'dish', test: function (x) { return (x.i.tags || []).indexOf('spicy') !== -1; } },
    { id: 'top', icon: 'star', kind: 'rest', test: function (r) { return r.rating >= 4.5; } }
  ];
  function intentItems(it) { return it.kind === 'dish' ? dishes().filter(it.test) : listed().filter(it.test); }

  /* ---------- greeting + search + resume ---------- */
  function greetingKey() {
    var h = new Date().getHours();
    return h < 5 ? 'h2.evening' : h < 11 ? 'h2.morning' : h < 17 ? 'h2.afternoon' : 'h2.evening';
  }
  function mealKey() {
    var h = new Date().getHours();
    return h < 10 ? 'h2.breakfast' : h < 15 ? 'h2.lunch' : h < 17 ? 'h2.fika' : 'h2.dinner';
  }
  function clockLine() {
    var d = new Date(), loc = S.lang() === 'sv' ? 'sv-SE' : 'en-GB';
    var day = d.toLocaleDateString(loc, { weekday: 'long' });
    return day.charAt(0).toUpperCase() + day.slice(1) + ' · ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ' · ' + t(mealKey());
  }
  function helloHTML() {
    var u = S.user(), a = S.address();
    var first = u ? B.esc(u.name.split(' ')[0]) : '';
    var openEtas = listed().filter(function (r) { return r.status === 'open'; }).map(function (r) { return r.eta; });
    var eta = openEtas.length ? Math.min.apply(null, openEtas) + 5 : 0;
    return '<div class="card hello-main"><p class="greet">' + B.icon('clock', 15) + '<span data-clock>' + clockLine() + '</span></p>' +
      '<h1>' + (first ? t(greetingKey(), { name: first }) : t('h2.hi')) + ' ' + t('h2.hungry') + '</h1>' +
      '<p class="sub">' + B.icon('pin', 15) + B.esc(a.street) + ' · ' + (eta ? t('h2.eta', { n: eta }) : t('h2.noneOpen')) + '</p>' +
      '<form class="search big-search" role="search" data-big-search>' + B.icon('search', 21, 'search-ic') +
        '<input type="search" class="search-input" autocomplete="off" placeholder="' + t('h2.searchPh') + '" aria-label="' + t('header.search') + '" value="' + B.esc(st.q) + '">' +
        '<button class="btn btn-primary">' + t('nav.search') + '</button><div class="search-results" hidden></div></form>' +
      '<div class="intents">' + INTENTS.map(function (it) {
        var n = intentItems(it).length;
        return '<button class="intent" data-intent="' + it.id + '"><i>' + B.icon(it.icon, 16, it.id === 'top' ? 'filled' : '') + '</i>' + t('h2.int.' + it.id) +
          '<small>' + (it.kind === 'dish' ? t('h2.dishes', { n: n }) : t('h2.kitchens', { n: n })) + '</small></button>';
      }).join('') + '</div></div>';
  }
  function resumeHTML() {
    var r = S.cartRestaurant(), orders = S.orders().slice(0, 2), loc = S.lang() === 'sv' ? 'sv-SE' : 'en-GB';
    var helg = D.offers.filter(function (o) { return o.code === 'HELG'; })[0];
    var html = '<aside class="card resume" aria-label="' + t('h2.resume') + '"><h2>' + t('h2.resume') + '</h2>';
    if (r) {
      var pr = B.pricing(), min = helg ? helg.rule.min : 0, pct = Math.min(100, Math.round(pr.sub / min * 100));
      html += '<button class="rc-cart" data-action="open-cart"><span class="th">' + B.img(r.image) + '</span><span class="grow"><strong>' + B.esc(r.name) + '</strong>' +
        '<small>' + t('cart.items', { n: S.count() }) + ' · ' + B.kr(pr.sub) + ' · ' + (pr.sub >= min ? t('h2.freeUnlocked', { code: helg.code }) : t('h2.toFree', { n: min - pr.sub })) + '</small>' +
        '<span class="progress" aria-hidden="true"><b style="width:' + pct + '%"></b></span></span></button>' +
        '<a class="btn btn-primary btn-lg btn-block" href="checkout.html">' + t('rest.goCheckout', { total: B.kr(pr.total) }) + '</a>';
    } else {
      html += '<div class="rc-empty"><span class="empty-ic sm">' + B.icon('cart', 20) + '</span><div><strong>' + t('cart.empty') + '</strong><small>' + t('h2.emptyHint') + '</small></div></div>';
    }
    if (orders.length) {
      html += '<div class="rr-list">' + orders.map(function (o) {
        var it = S.item(o.slug, o.items[0].itemId), rest = S.restaurant(o.slug);
        var label = o.items[0].qty + '× ' + (it ? B.esc(B.L(it.name)) : '') + (o.items.length > 1 ? ' ' + t('again.more', { n: o.items.length - 1 }) : '');
        return '<div class="rr"><span class="th sm">' + B.img(it ? it.image : null) + '</span><div class="grow"><strong>' + label + '</strong><small>' + B.esc(rest.name) + ' · ' +
          new Date(o.date).toLocaleDateString(loc, { day: 'numeric', month: 'short' }) + ' · ' + B.kr(o.amount) + '</small></div><button class="btn btn-secondary btn-sm" data-again="' + o.id + '">' + t('home.reorder') + '</button></div>';
      }).join('') + '</div>';
    } else if (!r) {
      html += '<a class="btn btn-secondary btn-block" href="#all-restaurants">' + t('cart.browse') + '</a>';
    }
    return html + '</aside>';
  }

  /* ---------- moods ---------- */
  function moodRests(m) { return listed().filter(function (r) { return r.cuisines.some(function (c) { return m.cuisines.indexOf(c) !== -1; }); }); }
  function moodsHTML() {
    return '<section class="sec" aria-labelledby="mood-title"><div class="sec-head"><h2 class="h2" id="mood-title">' + t('h2.moods') + '</h2></div><div class="moods">' +
      D.moods.map(function (m) {
        var rs = moodRests(m), prices = [];
        rs.forEach(function (r) { r.menu.forEach(function (c) { if (c.id === 'drinks' || c.id === 'coffee') return; c.items.forEach(function (i) { prices.push(i.price); }); }); });
        var from = prices.length ? Math.min.apply(null, prices) : 0;
        return '<button class="mood' + (st.mood === m.id ? ' is-on' : '') + '" data-mood="' + m.id + '" aria-pressed="' + (st.mood === m.id) + '">' + B.img(m.image) +
          '<span class="mood-ic">' + B.icon(m.icon, 19) + '</span><span class="mood-t"><strong>' + B.esc(B.L(m.name)) + '</strong><span>' + B.esc(B.L(m.text)) + (from ? ' · ' + t('h2.from', { n: from }) : '') + '</span></span>' +
          '<span class="mood-go">' + B.icon(st.mood === m.id ? 'check' : 'arrow', 17) + '</span></button>';
      }).join('') + '</div></section>';
  }

  /* ---------- deals + trending ---------- */
  function dealStatus(o) {
    var d = new Date();
    if (o.rule.untilHour != null) {
      var left = o.rule.untilHour * 60 - nowMin();
      return left > 0 ? { txt: t('h2.endsIn', { t: left >= 60 ? Math.floor(left / 60) + ' h ' + (left % 60) + ' min' : left + ' min' }), live: true } : { txt: t('h2.endedToday'), off: true };
    }
    if (o.rule.weekday != null) return d.getDay() === o.rule.weekday ? { txt: t('h2.todayOnly'), live: true } : { txt: t('h2.everyTuesday') };
    if (o.code === 'HELG') return { txt: d.getDay() === 0 ? t('h2.endsTonight') : t('h2.endsSunday') };
    return { txt: t('h2.noEnd') };
  }
  function dealsHTML() {
    return '<div><div class="sec-head"><h2 class="h2">' + t('h2.deals') + '</h2><button class="btn-link" data-action="open-offers">' + t('home.seeAll', { n: D.offers.length }) + '</button></div><div class="deals">' +
      D.offers.slice().sort(function (a, b) { return (dealStatus(b).live ? 1 : 0) - (dealStatus(a).live ? 1 : 0); }).slice(0, 4).map(function (o) {
        var s = dealStatus(o);
        return '<div class="ticket' + (s.off ? ' is-off' : '') + '"><div class="tim">' + B.img(o.image) + '</div><div class="tb"><span class="cd' + (s.live ? ' deal-urgent' : '') + '"' + (o.rule.untilHour != null ? ' data-countdown="' + o.code + '"' : '') + '>' + B.icon('clock', 14) + s.txt + '</span>' +
          '<strong>' + B.esc(B.L(o.title)) + '</strong><span class="tt">' + B.esc(B.L(o.text)) + '</span>' +
          '<button class="code-btn" data-action="copy-code" data-code="' + o.code + '" aria-label="' + t('rest.copyCode') + ' ' + o.code + '"' + (s.off ? ' disabled' : '') + '><span class="code-txt">' + o.code + '</span><span class="code-ic">' + B.icon('copy', 16) + '</span></button></div></div>';
      }).join('') + '</div></div>';
  }
  function trendingHTML() {
    return '<div><div class="sec-head"><h2 class="h2">' + t('h2.trending') + '</h2><span class="count">' + t('h2.lastHours') + '</span></div><ol class="card trend">' +
      D.trending.map(function (x, i) {
        var r = S.restaurant(x[0]), it = S.item(x[0], x[1]);
        if (!r || !it) return '';
        return '<li class="tr"><span class="rk">' + (i + 1) + '</span><a class="th" href="' + B.restaurantUrl(r.slug, it.id) + '" tabindex="-1" aria-hidden="true">' + B.img(it.image) + '</a>' +
          '<div class="grow"><strong><a href="' + B.restaurantUrl(r.slug, it.id) + '">' + B.esc(B.L(it.name)) + '</a></strong><small>' + B.kr(it.price) + ' · ' + B.esc(r.name) + '</small><span class="up">▲ ' + t('h2.thisHour', { n: x[2] }) + '</span></div>' +
          '<div class="tr-ctrl" data-ctrl="' + r.slug + '|' + it.id + '"></div></li>';
      }).join('') + '</ol></div>';
  }

  /* ================================================================
     ALL RESTAURANTS (white band to footer) – built new from spec
     ================================================================ */
  function applyFilters(f, withQuery) {
    var list = allListed();
    if (withQuery && st.q) {
      var q = B.norm(st.q);
      list = list.filter(function (r) {
        return B.norm(r.name).indexOf(q) !== -1 ||
          r.cuisines.some(function (c) { var cu = B.cuisine(c); return cu && (B.norm(cu.name.en).indexOf(q) !== -1 || B.norm(cu.name.sv).indexOf(q) !== -1); }) ||
          r.menu.some(function (cat) { return cat.items.some(function (i) { return B.norm(i.name.en).indexOf(q) !== -1 || B.norm(i.name.sv).indexOf(q) !== -1; }); });
      });
    }
    if (st.mood) {
      var m = D.moods.filter(function (x) { return x.id === st.mood; })[0];
      if (m) list = list.filter(function (r) { return r.cuisines.some(function (c) { return m.cuisines.indexOf(c) !== -1; }); });
    }
    if (f.open) list = list.filter(function (r) { return r.status === 'open'; });
    if (f.free) list = list.filter(function (r) { return r.fee === 0; });
    if (f.veg) list = list.filter(function (r) { return r.veg; });
    if (f.time) list = list.filter(function (r) { return r.eta <= f.time; });
    if (f.rating) list = list.filter(function (r) { return r.rating >= f.rating; });
    if (f.price.length) list = list.filter(function (r) { return has(f.price, r.priceLevel); });
    if (f.cuisines.length) list = list.filter(function (r) { return r.cuisines.some(function (c) { return has(f.cuisines, c); }); });
    list = list.slice();
    if (f.sort === 'fastest') list.sort(function (a, b) { return a.eta - b.eta; });
    if (f.sort === 'top') list.sort(function (a, b) { return b.rating - a.rating; });
    return list;
  }
  function activeCount(f) {
    return (f.open ? 1 : 0) + (f.free ? 1 : 0) + (f.veg ? 1 : 0) + (f.time ? 1 : 0) + (f.rating ? 1 : 0) + f.price.length + f.cuisines.length;
  }
  function totalLabel(n) { return n === 1 ? t('home.count1') : t('home.count', { n: n }); }
  function cuisineCounts() {
    var c = {};
    allListed().forEach(function (r) { r.cuisines.forEach(function (x) { c[x] = (c[x] || 0) + 1; }); });
    return c;
  }
  function feeHTML(r) {
    return r.fee === 0 ? '<span class="free">' + t('rest.freeDelivery') + '</span>' : B.esc(t('rest.fee', { n: r.fee }));
  }

  function openCard(r) {
    var fav = S.isFav(r.slug);
    return '<article class="all-open-card"><div class="all-open-media">' + B.img(r.image) +
      '<span class="all-open-pill">✓ ' + B.esc(t('all.openPill')) + '</span>' +
      '<span class="all-open-time">' + B.esc(t('common.minRange', { a: r.eta, b: r.eta + 10 })) + '</span></div>' +
      '<button class="icon-btn sm white all-fav" data-action="toggle-fav" data-fav data-slug="' + r.slug + '" aria-pressed="' + fav + '" aria-label="' + t('fav.label', { name: B.esc(r.name) }) + '">' + B.icon('heart', 17) + '</button>' +
      '<div class="all-open-info"><div class="all-open-top"><h3><a class="all-open-link" href="' + B.restaurantUrl(r.slug) + '">' + B.esc(r.name) + '</a></h3>' +
      '<span class="rate">' + B.icon('star', 15) + r.rating.toFixed(1) + ' <span>(' + r.reviews + ')</span></span></div>' +
      '<p class="all-open-meta">' + B.cuisineNames(r) + ' · ' + B.esc(B.priceLevel(r.priceLevel)) + ' · ' + feeHTML(r) + '</p></div></article>';
  }

  function laterRow(r) {
    var fav = S.isFav(r.slug);
    var pill;
    if (r.status === 'paused') {
      pill = '<span class="all-later-pill paused">' + B.icon('pause', 12) + B.esc(t('rest.pausedShort')) + '</span>';
    } else if (r.status === 'open') {
      pill = '<span class="all-later-pill is-open">' + B.esc('✓ ' + t('all.openPill')) + '</span>';
    } else {
      pill = '<span class="all-later-pill">' + B.icon('clock', 13) + B.esc(t('rest.opens', { time: r.opensAt })) + '</span>';
    }
    return '<article class="all-later-row card' + (r.status === 'open' ? ' is-open' : '') + '">' +
      '<a class="all-later-photo" href="' + B.restaurantUrl(r.slug) + '" tabindex="-1" aria-hidden="true">' + B.img(r.image) + '</a>' +
      '<div class="all-later-main"><div class="all-later-top"><h3><a href="' + B.restaurantUrl(r.slug) + '">' + B.esc(r.name) + '</a></h3>' + pill +
      '<span class="rate">' + B.icon('star', 14) + r.rating.toFixed(1) + '</span></div>' +
      '<p class="all-later-meta">' + B.cuisineNames(r) + ' · ' + B.esc(B.priceLevel(r.priceLevel)) + '</p>' +
      '<p class="all-later-meta with-ic">' + B.icon('bike', 14) + '<span>' + B.esc(t('common.minRange', { a: r.eta, b: r.eta + 10 })) + ' · ' + feeHTML(r) + '</span></p></div>' +
      '<button class="icon-btn sm white" data-action="toggle-fav" data-fav data-slug="' + r.slug + '" aria-pressed="' + fav + '" aria-label="' + t('fav.label', { name: B.esc(r.name) }) + '">' + B.icon('heart', 17) + '</button></article>';
  }

  function chip(attrs, on, inner) {
    return '<button class="chip' + (on ? ' is-on' : '') + '" ' + attrs + ' aria-pressed="' + !!on + '">' + inner + '</button>';
  }
  function popMenu(id) {
    if (id === 'sort') {
      return ['recommended', 'fastest', 'top'].map(function (s) {
        return '<button class="menu-opt" data-set-sort="' + s + '" role="menuitemradio" aria-checked="' + (st.sort === s) + '"><span class="rdot' + (st.sort === s ? ' on' : '') + '"></span>' + t('sort.' + s) + '</button>';
      }).join('');
    }
    if (id === 'price') {
      return [1, 2, 3].map(function (p) {
        return '<button class="menu-opt" data-set-price="' + p + '" role="menuitemcheckbox" aria-checked="' + has(st.price, p) + '"><span class="box' + (has(st.price, p) ? ' on' : '') + '">' + B.icon('check', 13) + '</span>' + B.esc(B.priceLevel(p)) + '</button>';
      }).join('');
    }
    var counts = cuisineCounts();
    return D.cuisines.filter(function (c) { return counts[c.id]; }).map(function (c) {
      return '<button class="menu-opt" data-set-cuisine="' + c.id + '" role="menuitemcheckbox" aria-checked="' + has(st.cuisines, c.id) + '"><span class="box' + (has(st.cuisines, c.id) ? ' on' : '') + '">' + B.icon('check', 13) + '</span>' + B.esc(B.L(c.name)) + '<span class="mo-n">' + counts[c.id] + '</span></button>';
    }).join('');
  }
  function dropChip(id, label, on) {
    return '<div class="bar-pop">' + chip('data-pop="' + id + '" aria-haspopup="true" aria-expanded="' + (openPop === id) + '"', on, label + B.icon('down', 15)) +
      '<div class="menu bar-menu" role="menu"' + (openPop === id ? '' : ' hidden') + '>' + popMenu(id) + '</div></div>';
  }
  function barHTML() {
    var n = activeCount(st);
    var sortLabel = t('home.sortLabel', { s: t('sort.' + st.sort) });
    var priceLabel = st.price.length ? st.price.slice().sort().map(B.priceLevel).join(', ') : t('home.price');
    var cuisLabel = st.cuisines.length ? t('home.cuisine') + ' · ' + st.cuisines.length : t('home.cuisine');
    var view = '<div class="all-view" role="group" aria-label="' + t('all.viewLabel') + '">' +
      '<button data-view="grid" class="' + (st.view === 'grid' ? 'is-on' : '') + '" aria-pressed="' + (st.view === 'grid') + '" aria-label="' + t('all.gridView') + '">' + gridIcon() + '</button>' +
      '<button data-view="list" class="' + (st.view === 'list' ? 'is-on' : '') + '" aria-pressed="' + (st.view === 'list') + '" aria-label="' + t('all.listView') + '">' + listIcon() + '</button></div>';
    return '<div class="all-filterbar-row">' +
      chip('data-open-filters', n > 0, B.icon('sliders', 16) + B.esc(t('home.allFilters')) + (n ? ' <span class="n">' + n + '</span>' : '')) +
      dropChip('sort', B.icon('sort', 16) + B.esc(sortLabel), st.sort !== 'recommended') + '<span class="sep" aria-hidden="true"></span>' +
      chip('data-tg="open"', st.open, B.icon('clock', 16) + B.esc(t('qf.open'))) +
      chip('data-tg="fast"', st.time === 30, B.icon('bike', 16) + B.esc(t('qf.fast'))) +
      chip('data-tg="free"', st.free, B.icon('tag', 16) + B.esc(t('qf.free'))) +
      chip('data-tg="top"', st.rating === 4.5, B.icon('star', 16, 'filled') + B.esc(t('qf.top'))) +
      chip('data-tg="veg"', st.veg, B.icon('leaf', 16) + B.esc(t('qf.veg'))) +
      dropChip('price', B.esc(priceLabel), st.price.length > 0) + dropChip('cuisine', B.esc(cuisLabel), st.cuisines.length > 0) + view + '</div>';
  }

  function appliedHTML(list) {
    var items = [];
    if (st.q) items.push(['q', '“' + B.esc(st.q) + '”']);
    if (st.mood) {
      var m = D.moods.filter(function (x) { return x.id === st.mood; })[0];
      if (m) items.push(['mood', B.esc(B.L(m.name))]);
    }
    if (st.open) items.push(['open', t('qf.open')]);
    if (st.time) items.push(['time', t('home.underMin', { n: st.time })]);
    if (st.free) items.push(['free', t('qf.free')]);
    if (st.rating) items.push(['rating', t('home.ratingPlus', { n: st.rating.toFixed(1) })]);
    if (st.veg) items.push(['veg', t('qf.veg')]);
    st.price.slice().sort().forEach(function (p) { items.push(['price:' + p, B.esc(B.priceLevel(p))]); });
    st.cuisines.forEach(function (c) { var cu = B.cuisine(c); if (cu) items.push(['cuisine:' + c, B.esc(B.L(cu.name))]); });
    if (!items.length) return '';
    return '<div class="all-applied"><span>' + B.esc(t('home.showing', { x: list.length, y: allListed().length })) + '</span>' +
      items.map(function (i) { return '<button class="chip is-on sm" data-remove="' + B.esc(i[0]) + '" aria-label="' + t('home.removeFilter', { name: i[1] }) + '">' + i[1] + B.icon('x', 14) + '</button>'; }).join('') +
      '<button class="btn-link sm" data-clear>' + t('home.clearAll') + '</button></div>';
  }

  function emptyHTML() {
    return '<div class="empty"><span class="empty-ic">' + B.icon('search', 26) + '</span><h3>' + t('home.emptyTitle') + '</h3><p>' + t('home.emptyText') + '</p><button class="btn btn-primary" data-clear>' + t('home.clearAll') + '</button></div>';
  }

  function groupsHTML() {
    var all = applyFilters(st, true);
    if (!all.length) return emptyHTML();
    var open = all.filter(function (r) { return r.status === 'open'; });
    var later = all.filter(function (r) { return r.status !== 'open'; });
    later.sort(function (a, b) {
      var ap = a.status === 'paused' ? 1 : 0, bp = b.status === 'paused' ? 1 : 0;
      if (ap !== bp) return ap - bp;
      return minutes(a.opensAt) - minutes(b.opensAt);
    });
    var html = '';
    var effectiveLaterExpanded = st.laterExpanded || !open.length;
    if (open.length) {
      html += '<h3 class="all-group-h">' + B.esc(t('all.openNow', { n: open.length })) + '</h3>';
      if (st.view === 'list') {
        var limL = (isPhone() ? 8 : 12) + Math.max(0, st.openPages - 1) * 12;
        var shownL = open.slice(0, limL);
        html += '<div class="all-later-grid">' + shownL.map(laterRow).join('') + '</div>';
        if (open.length > limL) {
          var moreL = Math.min(12, open.length - limL);
          html += '<div class="all-paging"><button class="btn btn-secondary" data-more-open>' + B.esc(t('home.showMore', { n: moreL })) + '</button>' +
            '<p class="all-shown">' + B.esc(t('all.shownOf', { x: shownL.length, y: open.length })) + '</p></div>';
        }
      } else {
        var lim = (isPhone() ? 8 : 12) + Math.max(0, st.openPages - 1) * 12;
        var shown = open.slice(0, lim);
        html += '<div class="all-open-grid">' + shown.map(openCard).join('') + '</div>';
        if (open.length > lim) {
          var more = Math.min(12, open.length - lim);
          html += '<div class="all-paging"><button class="btn btn-secondary" data-more-open>' + B.esc(t('home.showMore', { n: more })) + '</button>' +
            '<p class="all-shown">' + B.esc(t('all.shownOf', { x: shown.length, y: open.length })) + '</p></div>';
        }
      }
    } else {
      html += '<p class="all-note">' + B.esc(t('all.noneOpen')) + '</p>';
    }
    if (later.length) {
      html += '<h3 class="all-group-h">' + B.esc(t('all.openingLater', { n: later.length })) + '</h3>';
      var vis = effectiveLaterExpanded ? later : later.slice(0, 4);
      html += '<div class="all-later-grid">' + vis.map(laterRow).join('') + '</div>';
      if (later.length > 4) {
        html += '<div class="all-more-wrap"><button class="btn btn-secondary" data-toggle-later>' +
          B.esc(effectiveLaterExpanded ? t('home.showLess') : t('all.showAll', { n: later.length })) + '</button></div>';
      }
    }
    return html;
  }

  function bandHTML() {
    var all = applyFilters(st, true);
    var nOpen = all.filter(function (r) { return r.status === 'open'; }).length;
    var nLater = all.length - nOpen;
    return '<div class="all-band" id="all-restaurants"><div class="wrap"><div class="all-head">' +
      '<h2 id="all-title">' + B.esc(t('home.all')) + ' <span class="count">' + B.esc(totalLabel(all.length)) + '</span></h2>' +
      '<p class="all-sub">' + B.esc(t('all.subtitle', { open: nOpen, later: nLater })) + '</p></div></div>' +
      '<div class="all-filterbar"><div class="wrap">' + barHTML() + '</div></div>' +
      '<div class="wrap">' + appliedHTML(all) + '<div data-groups>' + groupsHTML() + '</div></div></div>';
  }

  /* ---------- render ---------- */
  function render() {
    document.title = t('title.home');
    app.innerHTML = '<div class="wrap home2"><section class="hello">' + helloHTML() + '<div data-resume>' + resumeHTML() + '</div></section>' +
      moodsHTML() + '<section class="sec duo">' + dealsHTML() + trendingHTML() + '</section></div>' +
      bandHTML() +
      '<button class="all-top" data-top hidden aria-label="' + t('all.backTop') + '" title="' + t('all.backTop') + '">' + upIcon() + '</button>';
    B.wireSearch(app.querySelector('[data-big-search]'));
    B.refreshControls();
    var f = document.getElementById('site-footer');
    if (f) f.style.marginTop = '0';
    var li = document.querySelector('.ftr-logo img');
    if (li && !li.getAttribute('data-fb')) {
      li.setAttribute('data-fb', '1');
      li.setAttribute('onerror', "this.onerror=null;this.src='assets/img/logo-white.png'");
    }
    updateTopBtn();
  }
  function refreshAll() {
    var band = document.getElementById('all-restaurants');
    if (!band) { render(); return; }
    band.outerHTML = bandHTML();
    B.refreshControls();
    writeURL();
    updateTopBtn();
  }
  function refreshMoods() { var s = app.querySelector('[aria-labelledby="mood-title"]'); if (s) s.outerHTML = moodsHTML(); }
  function goAll() { var k = document.getElementById('all-restaurants'); if (k) k.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  function resetPaging() { st.openPages = 1; st.laterExpanded = false; }

  function updateTopBtn() {
    var sec = document.getElementById('all-restaurants');
    var btn = app.querySelector('[data-top]');
    if (!sec || !btn) return;
    var top = sec.getBoundingClientRect().top + window.scrollY;
    btn.hidden = !(window.scrollY > top + 2 * window.innerHeight);
  }

  /* ---------- All filters drawer ---------- */
  function openFiltersDrawer() {
    var draft = clone(st);
    var counts = cuisineCounts(), cq = '', expanded = false;
    var d = B.openDrawer({ side: 'left', label: t('home.filters'), className: 'drawer-filters', html: '<div class="d-head"><h2>' + t('home.filters') + '</h2><button class="icon-btn sm" data-close aria-label="' + t('common.close') + '">' + B.icon('x', 18) + '</button></div><div class="d-body" data-fbody></div><div class="d-foot row-foot"><button class="btn btn-ghost" data-fclear>' + t('home.clearAll') + '</button><button class="btn btn-primary btn-lg grow" data-fapply></button></div>' });
    var body = d.el.querySelector('[data-fbody]');
    function seg(name, val, opts) {
      return '<div class="seg" role="radiogroup">' + opts.map(function (o) { var on = val === o[0]; return '<button role="radio" aria-checked="' + on + '" class="' + (on ? 'is-on' : '') + '" data-dset="' + name + '" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>';
    }
    function draw() {
      var cuis = D.cuisines.filter(function (c) { return counts[c.id]; })
        .filter(function (c) { var q = B.norm(cq); return !q || B.norm(c.name.en).indexOf(q) !== -1 || B.norm(c.name.sv).indexOf(q) !== -1; });
      var shown = expanded || cq ? cuis : cuis.slice(0, 5);
      body.innerHTML =
        '<div class="f-sec"><h3>' + t('home.sortBy') + '</h3>' + seg('sort', draft.sort, [['recommended', t('sort.recommended')], ['fastest', t('sort.fastestShort')], ['top', t('sort.top')]]) + '</div>' +
        '<div class="f-sec"><h3>' + t('home.quick') + '</h3><div class="chips">' +
          chip('data-dq="open"', draft.open, B.icon('clock', 16) + t('qf.open')) + chip('data-dq="free"', draft.free, B.icon('tag', 16) + t('qf.free')) + chip('data-dq="veg"', draft.veg, B.icon('leaf', 16) + t('qf.veg')) + '</div></div>' +
        '<div class="f-sec"><h3>' + t('home.deliveryTime') + '</h3>' + seg('time', String(draft.time), [['0', t('home.any')], ['20', '≤ 20'], ['30', '≤ 30'], ['45', '≤ 45']]) + '</div>' +
        '<div class="f-sec"><h3>' + t('home.rating') + '</h3><div class="chips">' +
          [[0, t('home.any')], [4, '4.0+'], [4.5, '4.5+']].map(function (o) { return chip('data-drating="' + o[0] + '"', draft.rating === o[0], (o[0] ? B.icon('star', 15, 'filled') : '') + o[1]); }).join('') + '</div></div>' +
        '<div class="f-sec"><h3>' + t('home.price') + '</h3><div class="chips">' + [1, 2, 3].map(function (p) { return chip('data-dprice="' + p + '"', has(draft.price, p), B.esc(B.priceLevel(p))); }).join('') + '</div></div>' +
        '<div class="f-sec"><h3>' + t('home.cuisine') + '</h3><div class="pill-search">' + B.icon('search', 17) + '<input data-cq placeholder="' + t('home.findCuisine') + '" aria-label="' + t('home.findCuisine') + '" value="' + B.esc(cq) + '"></div>' +
          '<div class="checks">' + (shown.length ? shown.map(function (c) {
            var on = has(draft.cuisines, c.id);
            return '<label class="check"><input type="checkbox" data-dcuis="' + c.id + '"' + (on ? ' checked' : '') + '><span class="box' + (on ? ' on' : '') + '">' + B.icon('check', 13) + '</span>' + B.esc(B.L(c.name)) + '<span class="mo-n">' + counts[c.id] + '</span></label>';
          }).join('') : '<p class="muted small">' + t('home.noCuisine') + '</p>') + '</div>' +
          (!cq && cuis.length > 5 ? '<button class="btn-link sm" data-more>' + (expanded ? t('home.showLess') : t('home.showMore', { n: cuis.length - 5 })) + '</button>' : '') + '</div>';
      var n = applyFilters(draft, true).length;
      d.el.querySelector('[data-fapply]').textContent = n === 1 ? t('home.show1') : t('home.showN', { n: n });
    }
    d.el.addEventListener('click', function (e) {
      var el;
      if ((el = e.target.closest('[data-dset]'))) { var k = el.getAttribute('data-dset'), v = el.getAttribute('data-v'); draft[k] = k === 'time' ? +v : v; }
      else if ((el = e.target.closest('[data-dq]'))) { var q = el.getAttribute('data-dq'); draft[q] = !draft[q]; }
      else if ((el = e.target.closest('[data-drating]'))) draft.rating = +el.getAttribute('data-drating');
      else if ((el = e.target.closest('[data-dprice]'))) toggle(draft.price, +el.getAttribute('data-dprice'));
      else if (e.target.closest('[data-more]')) expanded = !expanded;
      else if (e.target.closest('[data-fclear]')) { var s = draft.sort; draft = clone(EMPTY); draft.sort = s; }
      else if (e.target.closest('[data-fapply]')) {
        st.sort = draft.sort; st.open = draft.open; st.free = draft.free; st.veg = draft.veg;
        st.time = draft.time; st.rating = draft.rating; st.price = draft.price; st.cuisines = draft.cuisines;
        resetPaging(); d.close(); writeURL(); refreshAll(); goAll(); return;
      }
      else return;
      draw();
    });
    d.el.addEventListener('change', function (e) { var c = e.target.getAttribute('data-dcuis'); if (c) { toggle(draft.cuisines, c); draw(); } });
    d.el.addEventListener('input', function (e) {
      if (e.target.hasAttribute('data-cq')) { cq = e.target.value; draw(); var i = body.querySelector('[data-cq]'); i.focus(); i.setSelectionRange(cq.length, cq.length); }
    });
    draw();
  }

  /* ---------- intent drawer ---------- */
  function openIntent(id) {
    var it = INTENTS.filter(function (x) { return x.id === id; })[0];
    var items = intentItems(it);
    var rows = it.kind === 'dish'
      ? items.sort(function (a, b) { return (a.r.status === 'open' ? 0 : 1) - (b.r.status === 'open' ? 0 : 1) || a.i.price - b.i.price; }).map(function (x) {
        return '<div class="card int-row' + (x.r.status === 'open' ? '' : ' is-closed') + '"><a class="th" href="' + B.restaurantUrl(x.r.slug, x.i.id) + '">' + B.img(x.i.image) + '</a><div class="grow"><strong>' + B.esc(B.L(x.i.name)) + '</strong>' +
          '<small>' + B.esc(x.r.name) + ' · ' + (x.r.status === 'open' ? t('common.min', { n: x.r.eta }) : B.statusText(x.r)) + '</small><b>' + B.kr(x.i.price) + '</b></div>' + B.ctrl(x.r.slug, x.i.id).replace('class="ctrl"', 'class="ctrl inline"') + '</div>';
      }).join('')
      : items.map(function (r) {
        return '<a class="card int-row' + (r.status === 'open' ? '' : ' is-closed') + '" href="' + B.restaurantUrl(r.slug) + '"><span class="th">' + B.img(r.image) + '</span><span class="grow"><strong>' + B.esc(r.name) + '</strong><small>' + B.cuisineNames(r) + ' · ★ ' + r.rating.toFixed(1) + '</small><small>' + B.statusText(r) + '</small></span>' + B.icon('right', 18, 'muted-ic') + '</a>';
      }).join('');
    B.openDrawer({ side: 'right', label: t('h2.int.' + id), html: '<div class="d-head"><h2>' + t('h2.int.' + id) + '<span class="count">' + (it.kind === 'dish' ? t('h2.dishes', { n: items.length }) : t('h2.kitchens', { n: items.length })) + '</span></h2><button class="icon-btn sm" data-close aria-label="' + t('common.close') + '">' + B.icon('x', 18) + '</button></div>' +
      '<div class="d-body">' + (rows || '<p class="muted">' + t('home.emptyText') + '</p>') + '</div>' });
  }

  function openSchedule(slug) {
    var r = S.restaurant(slug);
    var when = opensToday(r) ? t('h2.todayAt', { time: r.opensAt }) : t('h2.tomorrowAt', { time: r.opensAt });
    var m = B.openModal('<div class="modal-pad"><div class="m-head"><h2>' + t('h2.schedTitle', { name: B.esc(r.name) }) + '</h2><button class="icon-btn sm" data-close aria-label="' + t('common.close') + '">' + B.icon('x', 18) + '</button></div>' +
      '<div class="sched-hero"><span class="th">' + B.img(r.image) + '</span><div><strong>' + t('h2.opensWhen', { when: when }) + '</strong><small>' + t('h2.schedText') + '</small></div></div>' +
      '<div class="confirm-actions"><button class="btn btn-secondary" data-notify>' + B.icon('clock', 16) + t('h2.notify') + '</button><a class="btn btn-primary" href="' + B.restaurantUrl(r.slug) + '" autofocus>' + t('h2.browseMenu') + '</a></div></div>', { label: t('h2.schedTitle', { name: r.name }) });
    m.el.querySelector('[data-notify]').addEventListener('click', function () { m.close(); B.toast(t('h2.notified', { name: B.esc(r.name), time: r.opensAt })); });
  }

  function orderAgain(id) {
    var o = S.orders().filter(function (x) { return x.id === id; })[0], r = S.restaurant(o.slug);
    if (r.status !== 'open') { B.toast(t('rest.notTaking', { name: B.esc(r.name) })); return; }
    var run = function () { o.items.forEach(function (i) { S.addLine(o.slug, i.itemId, i.opts, i.qty); }); B.toast(t('again.added')); B.openCart(); };
    var cr = S.cartRestaurant();
    if (cr && cr.slug !== o.slug) B.confirm({ title: t('conflict.title'), text: t('conflict.text', { other: B.esc(cr.name), name: B.esc(r.name) }), ok: t('conflict.ok'), onOk: function () { S.clearCart(); run(); } });
    else run();
  }

  function clearQuery() {
    st.q = '';
    document.querySelectorAll('.search-input').forEach(function (i) { i.value = ''; });
  }

  /* ---------- events ---------- */
  app.addEventListener('submit', function (e) {
    if (!e.target.closest('[data-big-search]')) return;
    e.preventDefault();
    st.q = e.target.querySelector('input').value.trim();
    resetPaging();
    var r = e.target.querySelector('.search-results'); if (r) r.hidden = true;
    writeURL(); refreshAll(); goAll();
  });
  app.addEventListener('click', function (e) {
    var el;
    if ((el = e.target.closest('[data-intent]'))) { openIntent(el.getAttribute('data-intent')); return; }
    if ((el = e.target.closest('[data-mood]'))) {
      var id = el.getAttribute('data-mood');
      st.mood = st.mood === id ? null : id;
      resetPaging();
      refreshMoods(); writeURL(); refreshAll();
      if (st.mood) goAll();
      return;
    }
    if (e.target.closest('[data-open-filters]')) { openFiltersDrawer(); return; }
    if ((el = e.target.closest('[data-pop]'))) {
      e.stopPropagation();
      if (isNarrowPop()) { openFiltersDrawer(); return; }
      var pid = el.getAttribute('data-pop');
      openPop = openPop === pid ? null : pid;
      refreshAll();
      return;
    }
    if ((el = e.target.closest('[data-set-sort]'))) { e.stopPropagation(); st.sort = el.getAttribute('data-set-sort'); openPop = null; resetPaging(); writeURL(); refreshAll(); return; }
    if ((el = e.target.closest('[data-set-price]'))) { e.stopPropagation(); toggle(st.price, +el.getAttribute('data-set-price')); resetPaging(); writeURL(); refreshAll(); return; }
    if ((el = e.target.closest('[data-set-cuisine]'))) { e.stopPropagation(); toggle(st.cuisines, el.getAttribute('data-set-cuisine')); resetPaging(); writeURL(); refreshAll(); return; }
    if ((el = e.target.closest('[data-tg]'))) {
      var k = el.getAttribute('data-tg');
      if (k === 'fast') st.time = st.time === 30 ? 0 : 30;
      else if (k === 'top') st.rating = st.rating === 4.5 ? 0 : 4.5;
      else st[k] = !st[k];
      resetPaging(); writeURL(); refreshAll(); return;
    }
    if ((el = e.target.closest('[data-view]'))) {
      st.view = el.getAttribute('data-view');
      saveView(st.view); writeURL(); refreshAll(); return;
    }
    if ((el = e.target.closest('[data-remove]'))) {
      var rk = el.getAttribute('data-remove');
      if (rk === 'q') clearQuery();
      else if (rk === 'mood') { st.mood = null; refreshMoods(); }
      else if (rk === 'time' || rk === 'rating') st[rk] = 0;
      else if (rk.indexOf('price:') === 0) toggle(st.price, +rk.slice(6));
      else if (rk.indexOf('cuisine:') === 0) toggle(st.cuisines, rk.slice(8));
      else st[rk] = false;
      resetPaging(); writeURL(); refreshAll(); return;
    }
    if (e.target.closest('[data-clear]')) {
      var s = st.sort;
      var q0 = st.q; void q0;
      st = Object.assign(clone(EMPTY), { mood: null, q: '', view: st.view, laterExpanded: false, openPages: 1 });
      st.sort = s;
      clearQuery(); refreshMoods(); writeURL(); refreshAll(); return;
    }
    if (e.target.closest('[data-more-open]')) { st.openPages += 1; writeURL(); refreshAll(); return; }
    if (e.target.closest('[data-toggle-later]')) { st.laterExpanded = !st.laterExpanded; writeURL(); refreshAll(); return; }
    if (e.target.closest('[data-top]')) { goAll(); return; }
    if ((el = e.target.closest('[data-schedule]'))) { openSchedule(el.getAttribute('data-schedule')); return; }
    if ((el = e.target.closest('[data-again]'))) { orderAgain(el.getAttribute('data-again')); return; }
  });
  document.addEventListener('click', function (e) {
    if (openPop && !e.target.closest('.bar-pop')) { openPop = null; refreshAll(); }
    var a = e.target.closest && e.target.closest('a[href*="restaurant.html"]');
    if (a) { try { window.sessionStorage.setItem('blinca.v1.homeScroll', String(window.scrollY)); } catch (err) { /* noop */ } }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openPop) { openPop = null; refreshAll(); } });
  window.addEventListener('scroll', updateTopBtn, { passive: true });
  window.addEventListener('resize', updateTopBtn);

  /* live clock + deal countdowns */
  function tick() {
    var c = app.querySelector('[data-clock]'); if (c) c.textContent = clockLine();
    app.querySelectorAll('[data-countdown]').forEach(function (el) {
      var o = D.offers.filter(function (x) { return x.code === el.getAttribute('data-countdown'); })[0];
      var s = dealStatus(o);
      el.innerHTML = B.icon('clock', 14) + s.txt;
      el.classList.toggle('deal-urgent', !!s.live);
    });
  }
  clockTimer = setInterval(tick, 30000);

  S.on(function (type) {
    if (type === 'lang' || type === 'reset' || type === 'sync' || type === 'user' || type === 'address') { render(); return; }
    if (type === 'cart' || type === 'orders' || type === 'mode') { var r = app.querySelector('[data-resume]'); if (r) r.innerHTML = resumeHTML(); }
    if (type === 'fav') refreshAll();
  });
  render();
  (function restoreScroll() {
    var saved = null;
    try { saved = window.sessionStorage.getItem('blinca.v1.homeScroll'); } catch (e) { saved = null; }
    if (saved != null) {
      try { window.sessionStorage.removeItem('blinca.v1.homeScroll'); } catch (e) { /* noop */ }
      var y = parseInt(saved, 10);
      if (!isNaN(y) && y > 0) { setTimeout(function () { window.scrollTo(0, y); }, 60); return; }
    }
    if (st.q || window.location.hash === '#all-restaurants' || window.location.hash === '#kitchens') setTimeout(goAll, 60);
  })();
})();
