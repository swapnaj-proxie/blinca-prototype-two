/* Blinca – home page */
(function () {
  'use strict';
  var B = window.Blinca, S = window.BlincaStore, D = window.BLINCA_DATA, t = window.t;
  var app = document.getElementById('app');

  var EMPTY = { sort: 'recommended', open: false, free: false, veg: false, time: 0, rating: 0, price: [], cuisines: [] };
  var st = clone(EMPTY);
  st.q = B.params().get('q') || '';
  var openPop = null, heroIndex = 0, heroTimer = null;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function has(a, v) { return a.indexOf(v) !== -1; }
  function toggle(a, v) { var i = a.indexOf(v); if (i === -1) a.push(v); else a.splice(i, 1); }
  var listed = function () { return D.restaurants.filter(function (r) { return r.listed; }); };

  B.mountHeader({});
  B.mountFooter('dark');

  /* ---------- filtering (same rules as before, more inputs) ---------- */
  function apply(f, withQuery) {
    var list = listed();
    if (withQuery && st.q) {
      var q = B.norm(st.q);
      list = list.filter(function (r) {
        return B.norm(r.name).indexOf(q) !== -1 ||
          r.cuisines.some(function (c) { var cu = B.cuisine(c); return cu && (B.norm(cu.name.en).indexOf(q) !== -1 || B.norm(cu.name.sv).indexOf(q) !== -1); }) ||
          r.menu.some(function (cat) { return cat.items.some(function (i) { return B.norm(i.name.en).indexOf(q) !== -1 || B.norm(i.name.sv).indexOf(q) !== -1; }); });
      });
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
  function countLabel(n) { return n === 1 ? t('home.count1') : t('home.count', { n: n }); }
  function cuisineCounts() {
    var c = {};
    listed().forEach(function (r) { r.cuisines.forEach(function (x) { c[x] = (c[x] || 0) + 1; }); });
    return c;
  }

  /* ---------- sections ---------- */
  function secHead(title, id, extra) {
    return '<div class="sec-head"><h2 class="h2" id="' + id + '-title">' + title + '</h2><div class="sec-side">' + (extra || '') +
      '<div class="arrows"><button class="icon-btn sm outline" data-prev="' + id + '" aria-label="' + t('common.prev') + '">' + B.icon('left', 17) + '</button>' +
      '<button class="icon-btn sm outline" data-next="' + id + '" aria-label="' + t('common.next') + '">' + B.icon('arrow', 17) + '</button></div></div></div>';
  }
  function heroHTML() {
    return '<section class="hero" aria-roledescription="carousel" aria-label="' + t('home.highlights') + '">' +
      D.heroSlides.map(function (s, i) {
        var on = i === heroIndex;
        return '<div class="hero-slide theme-' + s.theme + (on ? ' is-on' : '') + '" aria-hidden="' + !on + '"><div class="hero-text"><h1>' + B.esc(B.L(s.title)) + '</h1><p>' + B.esc(B.L(s.text)) + '</p>' +
          '<a class="btn hero-btn" href="' + (S.user() ? 'index.html#all-restaurants' : 'login.html') + '"' + (on ? '' : ' tabindex="-1"') + '>' + (S.user() ? t('home.orderNow') : t('home.joinNow')) + '</a></div>' +
          '<div class="hero-img">' + B.img(s.image) + '</div></div>';
      }).join('') +
      '<div class="hero-dots">' + D.heroSlides.map(function (s, i) { return '<button class="' + (i === heroIndex ? 'is-on' : '') + '" data-dot="' + i + '" aria-label="' + t('home.slide', { n: i + 1 }) + '"></button>'; }).join('') + '</div></section>';
  }
  function cuisinesHTML() {
    return '<section class="sec" aria-labelledby="cuis-title">' + secHead(t('home.craving'), 'cuis') +
      '<div class="track" data-track="cuis">' + D.cuisines.map(function (c) {
        return '<button class="cuis' + (has(st.cuisines, c.id) ? ' is-on' : '') + '" data-pick-cuisine="' + c.id + '" aria-pressed="' + has(st.cuisines, c.id) + '"><span class="cuis-img">' + B.img(c.image) + '</span><span>' + B.esc(B.L(c.name)) + '</span></button>';
      }).join('') + '</div></section>';
  }
  function offersHTML() {
    return '<section class="sec" aria-labelledby="offers-title">' + secHead(t('home.offers'), 'offers', '<button class="btn-link" data-action="open-offers">' + t('home.seeAll', { n: D.offers.length }) + '</button>') +
      '<div class="track" data-track="offers">' + D.offers.map(B.offerCard).join('') + '</div></section>';
  }
  function popularHTML() {
    return '<section class="sec" aria-labelledby="pop-title">' + secHead(t('home.popular'), 'pop') +
      '<div class="track" data-track="pop">' + D.popular.map(function (p) {
        var r = S.restaurant(p[0]), it = S.item(p[0], p[1]);
        if (!r || !it) return '';
        var url = B.restaurantUrl(r.slug, it.id);
        return '<article class="dish"><div class="media"><a href="' + url + '" tabindex="-1" aria-hidden="true">' + B.img(it.image) + '</a>' + B.ctrl(r.slug, it.id) + '</div>' +
          '<h3><a href="' + url + '">' + B.esc(B.L(it.name)) + '</a></h3><p class="meta">' + B.esc(r.name) + '</p><p class="price">' + B.kr(it.price) + '</p></article>';
      }).join('') + '</div></section>';
  }
  function againHTML() {
    var orders = S.orders();
    if (!orders.length) return '';
    var loc = S.lang() === 'sv' ? 'sv-SE' : 'en-GB';
    return '<section class="sec" aria-labelledby="again-title"><div class="sec-head"><h2 class="h2" id="again-title">' + t('home.orderAgain') + '</h2></div><div class="again-grid">' +
      orders.slice(0, 4).map(function (o) {
        var r = S.restaurant(o.slug), f = o.items[0], it = S.item(o.slug, f.itemId);
        var label = f.qty + '× ' + (it ? B.esc(B.L(it.name)) : '') + (o.items.length > 1 ? ' ' + t('again.more', { n: o.items.length - 1 }) : '');
        return '<div class="card again"><span class="th">' + B.img(it ? it.image : null) + '</span><div class="grow"><small>' + B.esc(r.name) + '</small><strong>' + label + '</strong><small>' +
          new Date(o.date).toLocaleDateString(loc, { day: 'numeric', month: 'short' }) + ' · ' + B.kr(o.amount) + '</small></div>' +
          '<button class="btn btn-secondary btn-sm" data-again="' + o.id + '">' + t('home.reorder') + '</button></div>';
      }).join('') + '</div></section>';
  }

  /* ---------- filter bar ---------- */
  function chip(attrs, on, inner) { return '<button class="chip' + (on ? ' is-on' : '') + '" ' + attrs + ' aria-pressed="' + !!on + '">' + inner + '</button>'; }
  function popMenu(id) {
    if (id === 'sort') {
      return ['recommended', 'fastest', 'top'].map(function (s) {
        return '<button class="menu-opt" data-set-sort="' + s + '" role="menuitemradio" aria-checked="' + (st.sort === s) + '"><span class="rdot' + (st.sort === s ? ' on' : '') + '"></span>' + t('sort.' + s) + '</button>';
      }).join('');
    }
    if (id === 'price') {
      return [1, 2, 3].map(function (p) {
        return '<button class="menu-opt" data-set-price="' + p + '" role="menuitemcheckbox" aria-checked="' + has(st.price, p) + '"><span class="box' + (has(st.price, p) ? ' on' : '') + '">' + B.icon('check', 13) + '</span>' + B.priceLevel(p) + '</button>';
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
    return '<div class="fbar-row">' +
      chip('data-open-filters', n > 0, B.icon('sliders', 16) + t('home.allFilters') + (n ? '<span class="n">' + n + '</span>' : '')) +
      dropChip('sort', B.icon('sort', 16) + sortLabel, st.sort !== 'recommended') + '<span class="sep" aria-hidden="true"></span>' +
      chip('data-q="open"', st.open, B.icon('clock', 16) + t('qf.open')) +
      chip('data-q="fast"', st.time === 30, B.icon('bike', 16) + t('qf.fast')) +
      chip('data-q="free"', st.free, B.icon('tag', 16) + t('qf.free')) +
      chip('data-q="top"', st.rating === 4.5, B.icon('star', 16, 'filled') + t('qf.top')) +
      chip('data-q="veg"', st.veg, B.icon('leaf', 16) + t('qf.veg')) +
      dropChip('price', priceLabel, st.price.length > 0) + dropChip('cuisine', cuisLabel, st.cuisines.length > 0) + '</div>';
  }
  function appliedHTML(list) {
    var items = [];
    if (st.q) items.push(['q', '“' + B.esc(st.q) + '”']);
    if (st.open) items.push(['open', t('qf.open')]);
    if (st.time) items.push(['time', t('home.underMin', { n: st.time })]);
    if (st.free) items.push(['free', t('qf.free')]);
    if (st.rating) items.push(['rating', t('home.ratingPlus', { n: st.rating.toFixed(1) })]);
    if (st.veg) items.push(['veg', t('qf.veg')]);
    st.price.slice().sort().forEach(function (p) { items.push(['price:' + p, B.priceLevel(p)]); });
    st.cuisines.forEach(function (c) { items.push(['cuisine:' + c, B.esc(B.L(B.cuisine(c).name))]); });
    if (!items.length) return '';
    return '<div class="applied"><span>' + t('home.showing', { x: list.length, y: listed().length }) + '</span>' +
      items.map(function (i) { return '<button class="chip is-on sm" data-remove="' + i[0] + '" aria-label="' + t('home.removeFilter', { name: i[1] }) + '">' + i[1] + B.icon('x', 14) + '</button>'; }).join('') +
      '<button class="btn-link sm" data-clear>' + t('home.clearAll') + '</button></div>';
  }
  function restaurantCard(r) {
    var badge = r.status === 'paused' ? '<span class="status paused">' + B.icon('pause', 13) + t('rest.pausedShort') + '</span>'
      : r.status === 'closed' ? '<span class="status">' + B.icon('clock', 13) + t('rest.opens', { time: r.opensAt }) + '</span>' : '';
    var fav = S.isFav(r.slug);
    var fee = r.fee === 0 ? '<span class="free">' + t('rest.freeDelivery') + '</span>' : t('rest.fee', { n: r.fee });
    return '<article class="rcard' + (r.status !== 'open' ? ' closed' : '') + '"><div class="media">' + B.img(r.image) + badge +
      '<button class="icon-btn sm white fav' + (fav ? ' is-on' : '') + '" data-action="toggle-fav" data-fav data-slug="' + r.slug + '" aria-pressed="' + fav + '" aria-label="' + t('fav.label', { name: B.esc(r.name) }) + '">' + B.icon('heart', 17) + '</button></div>' +
      '<div class="rc-head"><h3><a class="rc-link" href="' + B.restaurantUrl(r.slug) + '">' + B.esc(r.name) + '</a></h3><span class="rate">' + B.icon('star', 15) + r.rating.toFixed(1) + ' <span>(' + r.reviews + ')</span></span></div>' +
      '<p class="meta">' + B.cuisineNames(r) + '<i class="dot"></i>' + B.priceLevel(r.priceLevel) + '</p>' +
      '<p class="meta">' + B.icon('bike', 15) + t('common.min', { n: r.eta }) + '<i class="dot"></i>' + fee + '</p></article>';
  }
  function gridHTML(list) {
    if (!list.length) return '<div class="empty"><span class="empty-ic">' + B.icon('search', 26) + '</span><h3>' + t('home.emptyTitle') + '</h3><p>' + t('home.emptyText') + '</p><button class="btn btn-primary" data-clear>' + t('home.clearAll') + '</button></div>';
    return '<div class="rgrid">' + list.map(restaurantCard).join('') + '</div>';
  }

  function renderResults() {
    var list = apply(st, true);
    var sec = app.querySelector('[data-results]');
    sec.querySelector('[data-count]').textContent = countLabel(list.length);
    sec.querySelector('.fbar').innerHTML = barHTML() + appliedHTML(list);
    sec.querySelector('[data-grid]').innerHTML = gridHTML(list);
    app.querySelectorAll('[data-pick-cuisine]').forEach(function (b) {
      var on = has(st.cuisines, b.getAttribute('data-pick-cuisine'));
      b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on));
    });
  }

  function render() {
    stopHero();
    document.title = t('title.home');
    app.innerHTML = '<div class="wrap home">' + heroHTML() + cuisinesHTML() + offersHTML() + popularHTML() + '<div data-again-wrap>' + againHTML() + '</div>' +
      '<section class="sec" id="all-restaurants" data-results aria-labelledby="all-title"><div class="sec-head"><h2 class="h2" id="all-title">' + t('home.all') + ' <span class="count" data-count></span></h2></div>' +
      '<div class="fbar"></div><div data-grid></div></section></div>';
    ['cuis', 'offers', 'pop'].forEach(function (id) { B.carousel(app.querySelector('[data-track="' + id + '"]'), app.querySelector('[data-prev="' + id + '"]'), app.querySelector('[data-next="' + id + '"]')); });
    renderResults();
    startHero();
  }

  /* ---------- hero ---------- */
  function showSlide(i) {
    var slides = app.querySelectorAll('.hero-slide');
    heroIndex = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) {
      var on = k === heroIndex;
      s.classList.toggle('is-on', on); s.setAttribute('aria-hidden', String(!on));
      var b = s.querySelector('.hero-btn'); if (on) b.removeAttribute('tabindex'); else b.setAttribute('tabindex', '-1');
    });
    app.querySelectorAll('[data-dot]').forEach(function (d, k) { d.classList.toggle('is-on', k === heroIndex); });
  }
  function startHero() { stopHero(); if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; heroTimer = setInterval(function () { showSlide(heroIndex + 1); }, 6000); }
  function stopHero() { if (heroTimer) clearInterval(heroTimer); heroTimer = null; }

  /* ---------- filters drawer ---------- */
  function openFiltersDrawer() {
    var draft = clone(st);
    delete draft.q;
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
        '<div class="f-sec"><h3>' + t('home.price') + '</h3><div class="chips">' + [1, 2, 3].map(function (p) { return chip('data-dprice="' + p + '"', has(draft.price, p), B.priceLevel(p)); }).join('') + '</div></div>' +
        '<div class="f-sec"><h3>' + t('home.cuisine') + '</h3><div class="pill-search">' + B.icon('search', 17) + '<input data-cq placeholder="' + t('home.findCuisine') + '" aria-label="' + t('home.findCuisine') + '" value="' + B.esc(cq) + '"></div>' +
          '<div class="checks">' + (shown.length ? shown.map(function (c) {
            var on = has(draft.cuisines, c.id);
            return '<label class="check"><input type="checkbox" data-dcuis="' + c.id + '"' + (on ? ' checked' : '') + '><span class="box' + (on ? ' on' : '') + '">' + B.icon('check', 13) + '</span>' + B.esc(B.L(c.name)) + '<span class="mo-n">' + counts[c.id] + '</span></label>';
          }).join('') : '<p class="muted small">' + t('home.noCuisine') + '</p>') + '</div>' +
          (!cq && cuis.length > 5 ? '<button class="btn-link sm" data-more>' + (expanded ? t('home.showLess') : t('home.showMore', { n: cuis.length - 5 })) + '</button>' : '') + '</div>';
      var n = apply(draft, true).length;
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
      else if (e.target.closest('[data-fapply]')) { var q2 = st.q; st = clone(draft); st.q = q2; d.close(); renderResults(); scrollToResults(); return; }
      else return;
      draw();
    });
    d.el.addEventListener('change', function (e) { var c = e.target.getAttribute('data-dcuis'); if (c) { toggle(draft.cuisines, c); draw(); } });
    d.el.addEventListener('input', function (e) {
      if (e.target.hasAttribute('data-cq')) { cq = e.target.value; draw(); var i = body.querySelector('[data-cq]'); i.focus(); i.setSelectionRange(cq.length, cq.length); }
    });
    draw();
  }
  function scrollToResults() {
    var sec = document.getElementById('all-restaurants');
    if (sec && sec.getBoundingClientRect().top < 0) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function clearQuery() {
    st.q = '';
    document.querySelectorAll('.search-input').forEach(function (i) { i.value = ''; });
    if (history.replaceState) history.replaceState(null, '', window.location.pathname);
  }

  /* ---------- events ---------- */
  app.addEventListener('click', function (e) {
    var el;
    if ((el = e.target.closest('[data-pop]'))) {
      e.stopPropagation();
      if (window.matchMedia('(max-width: 1080px)').matches) { openFiltersDrawer(); return; }
      var id = el.getAttribute('data-pop');
      openPop = openPop === id ? null : id;
      renderResults();
      return;
    }
    if ((el = e.target.closest('[data-set-sort]'))) { e.stopPropagation(); st.sort = el.getAttribute('data-set-sort'); openPop = null; renderResults(); return; }
    if ((el = e.target.closest('[data-set-price]'))) { e.stopPropagation(); toggle(st.price, +el.getAttribute('data-set-price')); renderResults(); return; }
    if ((el = e.target.closest('[data-set-cuisine]'))) { e.stopPropagation(); toggle(st.cuisines, el.getAttribute('data-set-cuisine')); renderResults(); return; }
    if ((el = e.target.closest('[data-q]'))) {
      var q = el.getAttribute('data-q');
      if (q === 'fast') st.time = st.time === 30 ? 0 : 30;
      else if (q === 'top') st.rating = st.rating === 4.5 ? 0 : 4.5;
      else st[q] = !st[q];
      renderResults(); return;
    }
    if (e.target.closest('[data-open-filters]')) { openFiltersDrawer(); return; }
    if ((el = e.target.closest('[data-remove]'))) {
      var r = el.getAttribute('data-remove');
      if (r === 'q') clearQuery();
      else if (r === 'time' || r === 'rating') st[r] = 0;
      else if (r.indexOf('price:') === 0) toggle(st.price, +r.slice(6));
      else if (r.indexOf('cuisine:') === 0) toggle(st.cuisines, r.slice(8));
      else st[r] = false;
      renderResults(); return;
    }
    if (e.target.closest('[data-clear]')) { var s = st.sort; st = clone(EMPTY); st.sort = s; clearQuery(); renderResults(); return; }
    if ((el = e.target.closest('[data-pick-cuisine]'))) {
      var c = el.getAttribute('data-pick-cuisine');
      toggle(st.cuisines, c); renderResults();
      if (has(st.cuisines, c)) document.getElementById('all-restaurants').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if ((el = e.target.closest('[data-dot]'))) { showSlide(+el.getAttribute('data-dot')); startHero(); return; }
    if ((el = e.target.closest('[data-again]'))) { orderAgain(el.getAttribute('data-again')); return; }
  });
  document.addEventListener('click', function (e) { if (openPop && !e.target.closest('.bar-pop')) { openPop = null; renderResults(); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openPop) { openPop = null; renderResults(); } });
  app.addEventListener('mouseover', function (e) { if (e.target.closest('.hero')) stopHero(); });
  app.addEventListener('mouseout', function (e) { var h = e.target.closest('.hero'); if (h && !h.contains(e.relatedTarget)) startHero(); });

  function orderAgain(id) {
    var o = S.orders().filter(function (x) { return x.id === id; })[0];
    if (!o) return;
    var r = S.restaurant(o.slug);
    if (r.status !== 'open') { B.toast(t('rest.notTaking', { name: B.esc(r.name) })); return; }
    var run = function () { o.items.forEach(function (i) { S.addLine(o.slug, i.itemId, i.opts, i.qty); }); B.toast(t('again.added')); B.openCart(); };
    var cr = S.cartRestaurant();
    if (cr && cr.slug !== o.slug) B.confirm({ title: t('conflict.title'), text: t('conflict.text', { other: B.esc(cr.name), name: B.esc(r.name) }), ok: t('conflict.ok'), onOk: function () { S.clearCart(); run(); } });
    else run();
  }

  S.on(function (type) {
    if (type === 'lang' || type === 'reset' || type === 'sync' || type === 'user') render();
    else if (type === 'orders') app.querySelector('[data-again-wrap]').innerHTML = againHTML();
  });
  render();
  if (window.location.hash === '#all-restaurants') setTimeout(function () { document.getElementById('all-restaurants').scrollIntoView({ block: 'start' }); }, 60);
})();
