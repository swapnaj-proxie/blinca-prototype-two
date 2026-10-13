/* Blinca – home page v2 ("what are you hungry for?") */
(function () {
  'use strict';
  var B = window.Blinca, S = window.BlincaStore, D = window.BLINCA_DATA, t = window.t;
  var app = document.getElementById('app');
  var st = { tab: 'open', sort: 'recommended', free: false, veg: false, mood: null, q: B.params().get('q') || '' };
  var sortOpen = false, clockTimer = null;

  B.mountHeader({});
  B.mountFooter('dark');

  var listed = function () { return D.restaurants.filter(function (r) { return r.listed || r.status === 'open'; }); };
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
      html += '<a class="btn btn-secondary btn-block" href="#kitchens">' + t('cart.browse') + '</a>';
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

  /* ---------- kitchens ---------- */
  function filtered(list) {
    if (st.q) {
      var q = B.norm(st.q);
      list = list.filter(function (r) {
        return B.norm(r.name).indexOf(q) !== -1 || r.cuisines.some(function (c) { var cu = B.cuisine(c); return cu && (B.norm(cu.name.en).indexOf(q) !== -1 || B.norm(cu.name.sv).indexOf(q) !== -1); }) ||
          r.menu.some(function (c) { return c.items.some(function (i) { return B.norm(i.name.en).indexOf(q) !== -1 || B.norm(i.name.sv).indexOf(q) !== -1; }); });
      });
    }
    if (st.mood) { var m = D.moods.filter(function (x) { return x.id === st.mood; })[0]; list = list.filter(function (r) { return r.cuisines.some(function (c) { return m.cuisines.indexOf(c) !== -1; }); }); }
    if (st.free) list = list.filter(function (r) { return r.fee === 0; });
    if (st.veg) list = list.filter(function (r) { return r.veg; });
    list = list.slice();
    if (st.sort === 'fastest') list.sort(function (a, b) { return a.eta - b.eta; });
    if (st.sort === 'top') list.sort(function (a, b) { return b.rating - a.rating; });
    return list;
  }
  function groups() {
    var all = filtered(listed());
    return {
      open: all.filter(function (r) { return r.status === 'open'; }),
      later: all.filter(function (r) { return r.status === 'closed'; }),
      paused: all.filter(function (r) { return r.status === 'paused'; }),
      fav: all.filter(function (r) { return S.isFav(r.slug); })
    };
  }
  function featuredCard(r) {
    var pop = (r.popular || []).map(function (id) { return S.item(r.slug, id); }).filter(Boolean).slice(0, 2);
    var deal = r.fee > 0 ? D.offers.filter(function (o) { return o.rule.type === 'freeDelivery'; })[0] : null;
    var fav = S.isFav(r.slug);
    return '<article class="featured"><a class="fi" href="' + B.restaurantUrl(r.slug) + '" tabindex="-1" aria-hidden="true">' + B.img(r.image) + '</a><div class="fb">' +
      '<span class="livepill"><i></i>' + t('rest.openCloses', { time: r.closesAt }) + '</span>' +
      '<h3><a href="' + B.restaurantUrl(r.slug) + '">' + B.esc(r.name) + '</a></h3>' +
      '<p class="fmeta"><span class="rate">' + B.icon('star', 15) + r.rating.toFixed(1) + ' <span>(' + r.reviews + ')</span></span><i class="dot"></i>' + B.cuisineNames(r) + '<i class="dot"></i>' + B.priceLevel(r.priceLevel) + (r.km ? '<i class="dot"></i>' + r.km + ' km' : '') + '</p>' +
      '<div class="kfacts"><span class="tag">' + B.icon('bike', 13) + t('common.minRange', { a: r.eta, b: r.eta + 10 }) + '</span><span class="tag">' + (r.fee ? t('rest.fee', { n: r.fee }) : t('rest.freeDelivery')) + '</span>' +
        '<span class="tag">' + B.icon('walk', 13) + t('rest.pickupEta', { n: r.pickupEta }) + '</span>' + (deal ? '<span class="tag hot">' + B.icon('tag', 13) + deal.code + ': ' + t('promo.freeDelivery') + '</span>' : '') + '</div>' +
      (pop.length ? '<div class="minis">' + pop.map(function (it) {
        return '<div class="mini"><span class="th sm">' + B.img(it.image) + '</span><div class="grow"><strong>' + B.esc(B.L(it.name)) + '</strong><small>' + B.kr(it.price) + '</small></div><div data-ctrl="' + r.slug + '|' + it.id + '" class="mini-ctrl"></div></div>';
      }).join('') + '</div>' : '') +
      '<div class="f-actions"><a class="btn btn-primary" href="' + B.restaurantUrl(r.slug) + '">' + t('cart.viewMenu') + '</a>' +
      '<button class="btn btn-secondary' + (fav ? ' is-on' : '') + '" data-action="toggle-fav" data-fav data-slug="' + r.slug + '" aria-pressed="' + fav + '">' + B.icon('heart', 16) + (fav ? t('h2.saved') : t('h2.save')) + '</button></div></div></article>';
  }
  function laterCard(r) {
    var paused = r.status === 'paused';
    var when = paused ? t('rest.pausedShort') : (opensToday(r) ? r.opensAt : t('h2.tomorrowAt', { time: r.opensAt }));
    return '<article class="lcard' + (paused ? ' paused' : '') + '"><a class="media" href="' + B.restaurantUrl(r.slug) + '">' + B.img(r.image) + '<span class="when">' + B.icon(paused ? 'pause' : 'clock', 13) + when + '</span></a>' +
      '<h4><a href="' + B.restaurantUrl(r.slug) + '">' + B.esc(r.name) + '</a><span class="rate">' + B.icon('star', 13) + r.rating.toFixed(1) + '</span></h4>' +
      '<p>' + B.cuisineNames(r) + ' · ' + (r.fee ? t('rest.fee', { n: r.fee }) : t('rest.freeDelivery').toLowerCase()) + '</p>' +
      '<button class="btn btn-secondary btn-sm btn-block" data-schedule="' + r.slug + '"' + (paused ? ' disabled' : '') + '>' + B.icon('clock', 15) + t('h2.schedule') + '</button></article>';
  }
  function anyCard(r) { return r.status === 'open' ? featuredCard(r) : laterCard(r); }
  function laterBlock(list, title, sub) {
    if (!list.length) return '';
    return '<div class="later-h">' + title + (sub ? '<span>' + sub + '</span>' : '') + '</div><div class="lgrid">' + list.map(laterCard).join('') + '</div>';
  }
  function kitchensInner() {
    var g = groups();
    var today = g.later.filter(opensToday), tomorrow = g.later.filter(function (r) { return !opensToday(r); });
    var tab = function (id, label, n) { return '<button role="tab" aria-selected="' + (st.tab === id) + '" class="' + (st.tab === id ? 'is-on' : '') + '" data-tab="' + id + '">' + label + '<b>' + n + '</b></button>'; };
    var applied = [];
    if (st.q) applied.push(['q', '“' + B.esc(st.q) + '”']);
    if (st.mood) applied.push(['mood', B.esc(B.L(D.moods.filter(function (m) { return m.id === st.mood; })[0].name))]);
    var sortMenu = '<div class="bar-pop"><button class="chip' + (st.sort !== 'recommended' ? ' is-on' : '') + '" data-sortbtn aria-haspopup="true" aria-expanded="' + sortOpen + '">' + B.icon('sort', 16) + t('home.sortLabel', { s: t('sort.' + st.sort) }) + B.icon('down', 15) + '</button>' +
      '<div class="menu bar-menu"' + (sortOpen ? '' : ' hidden') + '>' + ['recommended', 'fastest', 'top'].map(function (s) {
        return '<button class="menu-opt" data-sort="' + s + '"><span class="rdot' + (st.sort === s ? ' on' : '') + '"></span>' + t('sort.' + s) + '</button>';
      }).join('') + '</div></div>';
    var body;
    if (st.tab === 'open') {
      body = (g.open.length ? '<div class="featured-list">' + g.open.map(featuredCard).join('') + '</div>' : '<div class="empty"><span class="empty-ic">' + B.icon('clock', 26) + '</span><h3>' + t('h2.noneOpenTitle') + '</h3><p>' + t('h2.noneOpenText') + '</p><button class="btn btn-primary" data-tab="later">' + t('h2.seeLater') + '</button></div>') +
        laterBlock(today, t('h2.laterToday'), t('h2.laterSub'));
    } else if (st.tab === 'later') {
      body = laterBlock(today, t('h2.laterToday'), t('h2.laterSub')) + laterBlock(tomorrow, t('h2.tomorrow'), '') + laterBlock(g.paused, t('rest.pausedShort'), '');
      if (!today.length && !tomorrow.length && !g.paused.length) body = '<div class="empty"><h3>' + t('home.emptyTitle') + '</h3><p>' + t('home.emptyText') + '</p><button class="btn btn-primary" data-clear>' + t('home.clearAll') + '</button></div>';
    } else {
      body = g.fav.length ? '<div class="featured-list">' + g.fav.filter(function (r) { return r.status === 'open'; }).map(featuredCard).join('') + '</div>' +
        laterBlock(g.fav.filter(function (r) { return r.status !== 'open'; }), t('h2.favLater'), '') :
        '<div class="empty"><span class="empty-ic">' + B.icon('heart', 26) + '</span><h3>' + t('h2.noFavTitle') + '</h3><p>' + t('acc.noFavorites') + '</p></div>';
    }
    return '<div class="ktabs"><div class="seg ktab-seg" role="tablist">' + tab('open', t('h2.tabOpen'), g.open.length) + tab('later', t('h2.tabLater'), g.later.length + g.paused.length) + tab('fav', t('h2.tabFav'), g.fav.length) + '</div>' +
      '<div class="ktools">' + sortMenu +
      '<button class="chip' + (st.free ? ' is-on' : '') + '" data-tog="free" aria-pressed="' + st.free + '">' + B.icon('tag', 16) + t('qf.free') + '</button>' +
      '<button class="chip' + (st.veg ? ' is-on' : '') + '" data-tog="veg" aria-pressed="' + st.veg + '">' + B.icon('leaf', 16) + t('qf.veg') + '</button></div></div>' +
      (applied.length ? '<div class="applied">' + applied.map(function (a) { return '<button class="chip is-on sm" data-remove="' + a[0] + '">' + a[1] + B.icon('x', 14) + '</button>'; }).join('') + '<button class="btn-link sm" data-clear>' + t('home.clearAll') + '</button></div>' : '') +
      '<div class="kbody">' + body + '</div>';
  }

  /* ---------- render ---------- */
  function render() {
    document.title = t('title.home');
    app.innerHTML = '<div class="wrap home2"><section class="hello">' + helloHTML() + '<div data-resume>' + resumeHTML() + '</div></section>' +
      moodsHTML() + '<section class="sec duo">' + dealsHTML() + trendingHTML() + '</section>' +
      '<section class="sec" id="kitchens" aria-labelledby="k-title"><div class="sec-head"><h2 class="h2" id="k-title">' + t('h2.kitchensTitle') + '</h2></div><div data-kitchens>' + kitchensInner() + '</div></section></div>';
    B.wireSearch(app.querySelector('[data-big-search]'));
    B.refreshControls();
  }
  function refreshKitchens() { app.querySelector('[data-kitchens]').innerHTML = kitchensInner(); B.refreshControls(); }
  function refreshMoods() { var s = app.querySelector('[aria-labelledby="mood-title"]'); if (s) s.outerHTML = moodsHTML(); }
  function goKitchens() { var k = document.getElementById('kitchens'); if (k) k.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

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

  /* ---------- events ---------- */
  app.addEventListener('submit', function (e) {
    if (!e.target.closest('[data-big-search]')) return;
    e.preventDefault();
    st.q = e.target.querySelector('input').value.trim();
    st.tab = 'open';
    var r = e.target.querySelector('.search-results'); if (r) r.hidden = true;
    refreshKitchens(); goKitchens();
  });
  app.addEventListener('click', function (e) {
    var el;
    if ((el = e.target.closest('[data-intent]'))) { openIntent(el.getAttribute('data-intent')); return; }
    if ((el = e.target.closest('[data-mood]'))) {
      var id = el.getAttribute('data-mood');
      st.mood = st.mood === id ? null : id;
      refreshMoods(); refreshKitchens();
      if (st.mood) goKitchens();
      return;
    }
    if ((el = e.target.closest('[data-tab]'))) { st.tab = el.getAttribute('data-tab'); refreshKitchens(); return; }
    if (e.target.closest('[data-sortbtn]')) { e.stopPropagation(); sortOpen = !sortOpen; refreshKitchens(); return; }
    if ((el = e.target.closest('[data-sort]'))) { st.sort = el.getAttribute('data-sort'); sortOpen = false; refreshKitchens(); return; }
    if ((el = e.target.closest('[data-tog]'))) { var k = el.getAttribute('data-tog'); st[k] = !st[k]; refreshKitchens(); return; }
    if ((el = e.target.closest('[data-remove]'))) {
      if (el.getAttribute('data-remove') === 'q') { st.q = ''; var i = app.querySelector('[data-big-search] input'); if (i) i.value = ''; if (history.replaceState) history.replaceState(null, '', location.pathname); }
      else { st.mood = null; refreshMoods(); }
      refreshKitchens(); return;
    }
    if (e.target.closest('[data-clear]')) {
      st.q = ''; st.mood = null; st.free = false; st.veg = false;
      var inp = app.querySelector('[data-big-search] input'); if (inp) inp.value = '';
      refreshMoods(); refreshKitchens(); return;
    }
    if ((el = e.target.closest('[data-schedule]'))) { openSchedule(el.getAttribute('data-schedule')); return; }
    if ((el = e.target.closest('[data-again]'))) { orderAgain(el.getAttribute('data-again')); return; }
  });
  document.addEventListener('click', function (e) { if (sortOpen && !e.target.closest('.bar-pop')) { sortOpen = false; refreshKitchens(); } });

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
    if (type === 'fav') refreshKitchens();
  });
  render();
  if (st.q || window.location.hash === '#kitchens') setTimeout(goKitchens, 60);
})();
