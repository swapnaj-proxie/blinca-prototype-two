/* Blinca – restaurant page */
(function () {
  'use strict';
  var B = window.Blinca, S = window.BlincaStore, D = window.BLINCA_DATA, t = window.t;
  var app = document.getElementById('app');
  var slug = B.params().get('slug') || 'blinca-demo';
  var r = S.restaurant(slug);
  var filter = { q: '', veg: false, spicy: false };
  var active = null, lockSpy = false;

  B.mountHeader({});
  B.mountFooter('dark');

  function promoFor() {
    if (r.status !== 'open') return null;
    return D.offers.filter(function (o) { return o.rule.type === 'freeDelivery'; })[0] || null;
  }
  function sections() {
    var pop = (r.popular || []).map(function (id) { return S.item(r.slug, id); }).filter(Boolean);
    var list = pop.length ? [{ id: 'popular', name: t('rest.popular'), items: pop, popular: true }] : [];
    r.menu.forEach(function (c) { list.push({ id: c.id, name: B.L(c.name), items: c.items }); });
    return list;
  }
  function pastOrders() { return S.orders().filter(function (o) { return o.slug === r.slug; }).slice(0, 3); }
  function matches(it) {
    if (filter.veg && (it.tags || []).indexOf('vegetarian') === -1) return false;
    if (filter.spicy && (it.tags || []).indexOf('spicy') === -1) return false;
    if (filter.q) { var q = B.norm(filter.q); return B.norm(it.name.en).indexOf(q) !== -1 || B.norm(it.name.sv).indexOf(q) !== -1 || B.norm(B.L(it.desc)).indexOf(q) !== -1; }
    return true;
  }

  /* ---------- pieces ---------- */
  function heroHTML() {
    var fav = S.isFav(r.slug);
    var meta = '<span class="rate">' + B.icon('star', 15) + r.rating.toFixed(1) + ' <span>(' + t('rest.reviews', { n: r.reviews }) + ')</span></span><i class="dot"></i>' + B.cuisineNames(r) + '<i class="dot"></i>' + B.priceLevel(r.priceLevel) + (r.km ? '<i class="dot"></i>' + String(r.km).replace('.', S.lang() === 'sv' ? ',' : '.') + ' km' : '');
    var acts = '<button class="icon-btn sm white' + (fav ? ' is-on' : '') + '" data-action="toggle-fav" data-fav data-slug="' + r.slug + '" aria-pressed="' + fav + '" aria-label="' + t('fav.label', { name: B.esc(r.name) }) + '">' + B.icon('heart', 17) + '</button>' +
      '<button class="icon-btn sm white" data-share aria-label="' + t('rest.share') + '">' + B.icon('share', 17) + '</button>' +
      '<button class="icon-btn sm white" data-hours aria-label="' + t('rest.info') + '">' + B.icon('info', 17) + '</button>';
    var live = r.status === 'open' ? '<span class="live"></span>' : B.icon(r.status === 'paused' ? 'pause' : 'clock', 15);
    var mode = S.mode();
    return '<section class="card rhero"><div class="cv">' + B.img(r.image, r.name) +
      '<a class="icon-btn sm white back-btn" href="index.html" aria-label="' + t('common.back') + '">' + B.icon('left', 18) + '</a><div class="acts">' + acts + '</div>' +
      '<div class="idn"><span class="avatar"><span>' + B.esc(r.name.charAt(0)) + '</span></span><div><h1>' + B.esc(r.name) + '</h1><p class="m">' + meta + '</p></div></div></div>' +
      '<div class="idn-m"><span class="avatar sm"><span>' + B.esc(r.name.charAt(0)) + '</span></span><div><h1>' + B.esc(r.name) + '</h1><p class="m">' + meta + '</p></div></div>' +
      '<div class="stats">' +
        '<div class="stat"><small>' + t('rest.status') + '</small><strong class="' + (r.status === 'open' ? '' : 'muted') + '">' + live + B.statusText(r) + '</strong></div>' +
        '<div class="stat"><small>' + t('co.delivery') + '</small><strong>' + t('common.minRange', { a: r.eta, b: r.eta + 10 }) + '</strong></div>' +
        '<div class="stat"><small>' + t('co.deliveryFee') + '</small><strong>' + (r.fee ? B.kr(r.fee) : t('rest.free')) + '</strong></div>' +
        (r.minOrder ? '<div class="stat"><small>' + t('rest.minOrder') + '</small><strong>' + B.kr(r.minOrder) + '</strong></div>' : '') +
        '<div class="seg mode-seg" role="radiogroup" aria-label="' + t('co.delOrPick') + '">' +
          '<button role="radio" aria-checked="' + (mode === 'delivery') + '" class="' + (mode === 'delivery' ? 'is-on' : '') + '" data-mode="delivery">' + B.icon('bike', 17) + t('co.delivery') + '</button>' +
          '<button role="radio" aria-checked="' + (mode === 'pickup') + '" class="' + (mode === 'pickup' ? 'is-on' : '') + '" data-mode="pickup">' + B.icon('walk', 17) + t('rest.pickupEta', { n: r.pickupEta }) + '</button></div>' +
      '</div></section>';
  }
  function promoHTML() {
    var o = promoFor();
    if (!o) return '';
    return '<div class="promo-strip"><span class="pi">' + B.icon('tag', 18) + '</span><p><strong>' + B.esc(B.L(o.title)) + '</strong> <span class="muted">' + t('rest.promoWith', { min: o.rule.min }) + '</span> <span class="code">' + o.code + '</span></p>' +
      '<button class="btn btn-secondary btn-sm" data-action="copy-code" data-code="' + o.code + '">' + B.icon('copy', 15) + t('rest.copyCode') + '</button></div>';
  }
  function railHTML(secs) {
    var links = secs.map(function (s) {
      return '<a href="#cat-' + s.id + '" data-nav="' + s.id + '" class="' + (s.id === active ? 'is-on' : '') + '">' + B.esc(s.name) + '<span>' + s.items.length + '</span></a>';
    }).join('') + (pastOrders().length ? '<a href="#cat-again" data-nav="again">' + t('rest.orderAgain') + '<span>' + pastOrders().length + '</span></a>' : '');
    var h = r.hours[(new Date().getDay() + 6) % 7];
    return '<nav class="card rail" aria-label="' + t('rest.menu') + '"><p class="rail-label">' + t('rest.menu') + '</p>' + links +
      '<div class="rail-info"><span>' + B.icon('clock', 16) + t('rest.todayHours', { a: h[0], b: h[1] }) + '</span><span>' + B.icon('pin', 16) + B.esc(r.address.split(',')[0]) + '</span>' +
      '<button class="btn-link sm" data-hours>' + t('rest.seeHours') + '</button></div></nav>';
  }
  function chipsHTML(secs) {
    return '<div class="cat-chips" role="navigation" aria-label="' + t('rest.menu') + '"><button class="icon-btn sm outline" data-focus-search aria-label="' + t('rest.searchMenu') + '">' + B.icon('search', 17) + '</button>' +
      secs.map(function (s) { return '<button class="chip' + (s.id === active ? ' is-on' : '') + '" data-nav="' + s.id + '">' + B.esc(s.name) + '</button>'; }).join('') + '</div>';
  }
  function dishCard(it, popular, rank) {
    var q = S.itemQty(r.slug, it.id);
    if (popular) {
      return '<article class="card pcard' + (q ? ' in-cart' : '') + '" id="pop-' + it.id + '"><div class="media"><button class="media-btn" data-open="' + it.id + '" aria-label="' + B.esc(B.L(it.name)) + '">' + B.img(it.image) + '</button><span class="rank">' + t('rest.mostOrdered', { n: rank }) + '</span>' + B.ctrl(r.slug, it.id) + '</div>' +
        '<div class="pc-body"><h3><button data-open="' + it.id + '">' + B.esc(B.L(it.name)) + '</button></h3><p class="price">' + B.kr(it.price) + '</p></div></article>';
    }
    return '<article class="card mi' + (q ? ' in-cart' : '') + '" id="item-' + it.id + '">' + (q ? '<span class="incart">' + t('rest.inCart', { n: q }) + '</span>' : '') +
      '<div class="mi-text"><h3><button data-open="' + it.id + '">' + B.esc(B.L(it.name)) + '</button></h3><p>' + B.esc(B.L(it.desc)) + '</p><div class="mi-ft"><b>' + B.kr(it.price) + '</b>' + B.tags(it) + '</div></div>' +
      '<div class="media"><button class="media-btn" data-open="' + it.id + '" tabindex="-1" aria-hidden="true">' + B.img(it.image) + '</button>' + B.ctrl(r.slug, it.id) + '</div></article>';
  }
  function menuHTML(secs) {
    var any = false;
    var html = secs.map(function (s) {
      var items = s.items.filter(matches);
      if (!items.length) return '';
      any = true;
      var sub = s.popular ? t('rest.popularSub') : s.id === 'lunch' ? t('rest.lunchSub') : t('rest.dishes', { n: items.length });
      return '<section class="msec" id="cat-' + s.id + '" data-sec="' + s.id + '"><div class="msec-h"><h2 class="h2">' + B.esc(s.name) + '</h2><span class="count">' + sub + '</span></div>' +
        '<div class="' + (s.popular ? 'pop3' : 'mgrid') + '">' + items.map(function (it, i) { return dishCard(it, s.popular, i + 1); }).join('') + '</div></section>';
    }).join('');
    var past = pastOrders();
    if (past.length && !filter.q && !filter.veg && !filter.spicy) {
      var loc = S.lang() === 'sv' ? 'sv-SE' : 'en-GB';
      html += '<section class="msec" id="cat-again" data-sec="again"><div class="msec-h"><h2 class="h2">' + t('rest.orderAgain') + '</h2></div><div class="card list-card">' +
        past.map(function (o) {
          var items = o.items.map(function (i) { var it = S.item(o.slug, i.itemId); return i.qty + '× ' + (it ? B.esc(B.L(it.name)) : ''); }).join(', ');
          return '<div class="list-row"><div class="grow"><strong>' + items + '</strong><small>' + new Date(o.date).toLocaleDateString(loc, { day: 'numeric', month: 'short' }) + ' · ' + B.kr(o.amount) + '</small></div><button class="btn btn-secondary btn-sm" data-reorder="' + o.id + '">' + t('home.reorder') + '</button></div>';
        }).join('') + '</div></section>';
    }
    if (!any) html = '<div class="empty"><span class="empty-ic">' + B.icon('search', 26) + '</span><h3>' + t('rest.noMatch') + '</h3><p>' + t('rest.noMatchText') + '</p><button class="btn btn-secondary" data-reset-filter>' + t('rest.clearSearch') + '</button></div>';
    return html;
  }
  function sideCartHTML() {
    var cart = S.cart(), cr = S.cartRestaurant(), mode = S.mode();
    var head = '<div class="sc-head"><h2 class="h3">' + t('co.yourOrder') + '</h2><span class="tag">' + B.icon(mode === 'delivery' ? 'bike' : 'walk', 13) + (mode === 'delivery' ? t('co.delivery') : t('co.pickup')) + '</span></div>';
    if (!cart.length) return head + '<div class="sc-empty"><span class="empty-ic sm">' + B.icon('cart', 22) + '</span><strong>' + t('rest.orderEmpty') + '</strong><p>' + t('rest.orderEmptyText') + '</p></div>';
    if (cr.slug !== r.slug) return head + '<div class="sc-empty"><p>' + t('rest.otherCart', { name: B.esc(cr.name) }) + '</p><button class="btn btn-secondary btn-sm" data-action="open-cart">' + t('rest.viewCart') + '</button></div>';
    var pr = B.pricing();
    return head + cart.map(function (l) {
      var it = S.item(l.slug, l.itemId), sub = B.lineSub(l);
      return '<div class="sc-line"><div><strong>' + B.esc(B.L(it.name)) + '</strong>' + (sub ? '<small>' + sub + '</small>' : '') + '</div><b>' + B.kr(S.lineTotal(l)) + '</b>' +
        B.lineStepper(l) + '<button class="btn-link muted sm" data-action="line-remove" data-key="' + B.esc(l.key) + '">' + t('cart.remove') + '</button></div>';
    }).join('') + '<div class="sc-totals">' + B.totalsHTML(pr) + '</div>' +
      (r.minOrder && pr.sub < r.minOrder ? '<p class="form-err">' + t('rest.minLeft', { n: r.minOrder - pr.sub }) + '</p>' : '') +
      '<a class="btn btn-primary btn-lg btn-block mt-12' + (r.minOrder && pr.sub < r.minOrder ? ' is-disabled" aria-disabled="true' : '') + '" href="checkout.html">' + t('rest.goCheckout', { total: B.kr(pr.total) }) + '</a>';
  }
  function cartBarHTML() {
    var n = S.count(), cr = S.cartRestaurant();
    if (!n || !cr) return '';
    return '<button class="cart-bar" data-action="open-cart"><span class="cb-n">' + n + '</span><span class="grow">' + t('rest.viewCart') + '</span><span class="cb-tot">' + B.kr(S.subtotal()) + '</span></button>';
  }
  function closedBanner() {
    if (r.status === 'open') return '';
    return '<div class="note-banner">' + B.icon(r.status === 'paused' ? 'pause' : 'clock', 18) + (r.status === 'paused' ? t('rest.pausedBanner') : t('rest.closedBanner', { time: r.opensAt })) + '</div>';
  }

  /* ---------- render ---------- */
  function render() {
    if (!r) {
      document.title = t('rest.notFound') + ' – Blinca';
      app.innerHTML = '<div class="wrap narrow pad-y"><div class="empty"><span class="empty-ic">' + B.icon('search', 26) + '</span><h3>' + t('rest.notFound') + '</h3><p>' + t('rest.notFoundText') + '</p><a class="btn btn-primary" href="index.html">' + t('nav.home') + '</a></div></div>';
      return;
    }
    document.title = r.name + ' – Blinca';
    var secs = sections();
    if (!active) active = secs[0].id;
    app.innerHTML = '<div class="wrap rest">' +
      '<nav class="crumb" aria-label="Breadcrumb"><a href="index.html">' + t('nav.home') + '</a>' + B.icon('right', 14) + '<a href="index.html#all-restaurants">' + t('rest.restaurants') + '</a>' + B.icon('right', 14) + '<b aria-current="page">' + B.esc(r.name) + '</b></nav>' +
      heroHTML() + promoHTML() +
      '<div class="rlay">' + railHTML(secs) +
        '<div class="rmain">' + chipsHTML(secs) +
          '<div class="mtools"><div class="pill-search lg">' + B.icon('search', 18) + '<input type="search" data-msearch placeholder="' + t('rest.searchIn', { name: B.esc(r.name) }) + '" aria-label="' + t('rest.searchMenu') + '" value="' + B.esc(filter.q) + '"></div>' +
          '<button class="chip' + (filter.veg ? ' is-on' : '') + '" data-diet="veg" aria-pressed="' + filter.veg + '">' + B.icon('leaf', 16) + t('tag.vegetarian') + '</button>' +
          '<button class="chip' + (filter.spicy ? ' is-on' : '') + '" data-diet="spicy" aria-pressed="' + filter.spicy + '">' + B.icon('flame', 16) + t('tag.spicy') + '</button></div>' +
          closedBanner() + '<div data-menu>' + menuHTML(secs) + '</div></div>' +
        '<aside class="card side-cart" data-sidecart aria-label="' + t('co.yourOrder') + '">' + sideCartHTML() + '</aside>' +
      '</div></div><div data-cartbar>' + cartBarHTML() + '</div>';
  }
  function refreshMenu() {
    var secs = sections();
    app.querySelector('[data-menu]').innerHTML = menuHTML(secs);
    var visible = Array.prototype.map.call(app.querySelectorAll('[data-sec]'), function (s) { return s.getAttribute('data-sec'); });
    app.querySelectorAll('[data-nav]').forEach(function (a) { a.hidden = visible.indexOf(a.getAttribute('data-nav')) === -1 && !!(filter.q || filter.veg || filter.spicy); });
  }
  function refreshCart() {
    var sc = app.querySelector('[data-sidecart]'); if (sc) sc.innerHTML = sideCartHTML();
    var cb = app.querySelector('[data-cartbar]'); if (cb) cb.innerHTML = cartBarHTML();
    app.querySelectorAll('.mi, .pcard').forEach(function (card) {
      var id = card.id.replace(/^(item|pop)-/, ''), q = S.itemQty(r.slug, id);
      card.classList.toggle('in-cart', q > 0);
      if (card.classList.contains('mi')) {
        var tag = card.querySelector('.incart');
        if (q && !tag) { card.insertAdjacentHTML('afterbegin', '<span class="incart"></span>'); tag = card.querySelector('.incart'); }
        if (tag) { if (q) tag.textContent = t('rest.inCart', { n: q }); else tag.remove(); }
      }
    });
  }

  /* ---------- scroll-spy ---------- */
  function offset() { var h = document.getElementById('site-header'); var c = app.querySelector('.cat-chips'); return (h ? h.offsetHeight : 0) + (c && c.offsetParent && getComputedStyle(c).display !== 'none' ? c.offsetHeight : 0) + 16; }
  function setActive(id) {
    if (id === active) return;
    active = id;
    app.querySelectorAll('[data-nav]').forEach(function (a) {
      var on = a.getAttribute('data-nav') === id;
      a.classList.toggle('is-on', on);
      if (on && a.classList.contains('chip')) { var p = a.parentNode; p.scrollTo({ left: a.offsetLeft - 60, behavior: 'smooth' }); }
    });
  }
  function onScroll() {
    if (lockSpy || !r) return;
    var secs = app.querySelectorAll('[data-sec]');
    if (!secs.length) return;
    var off = offset() + 40, cur = secs[0].getAttribute('data-sec');
    secs.forEach(function (s) { if (s.getBoundingClientRect().top <= off) cur = s.getAttribute('data-sec'); });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = secs[secs.length - 1].getAttribute('data-sec');
    setActive(cur);
  }
  function goTo(id) {
    var el = document.getElementById('cat-' + id);
    if (!el) return;
    setActive(id);
    lockSpy = true;
    window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset()), behavior: 'smooth' });
    setTimeout(function () { lockSpy = false; }, 800);
  }

  /* ---------- hours / info modal ---------- */
  function openHours() {
    var names = S.lang() === 'sv' ? ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'] : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    var today = (new Date().getDay() + 6) % 7;
    B.openModal('<div class="modal-pad"><div class="m-head"><h2>' + B.esc(r.name) + '</h2><button class="icon-btn sm" data-close aria-label="' + t('common.close') + '">' + B.icon('x', 18) + '</button></div>' +
      '<div class="info-rows"><p>' + B.icon('pin', 17) + B.esc(r.address) + '</p><p>' + B.icon('bike', 17) + t('rest.deliveryEta', { n: r.eta + '–' + (r.eta + 10) }) + ' · ' + (r.fee ? B.kr(r.fee) : t('rest.free')) + '</p>' + (r.minOrder ? '<p>' + B.icon('receipt', 17) + t('rest.minOrder') + ': ' + B.kr(r.minOrder) + '</p>' : '') + '</div>' +
      '<h3 class="h3 mt-16">' + t('rest.hoursTitle') + '</h3><table class="hours">' + r.hours.map(function (h, i) {
        return '<tr' + (i === today ? ' class="is-today"' : '') + '><th scope="row">' + names[i] + (i === today ? ' <span>(' + t('rest.today') + ')</span>' : '') + '</th><td>' + h[0] + '–' + h[1] + '</td></tr>';
      }).join('') + '</table></div>', { label: t('rest.hoursTitle') });
  }

  /* ---------- events ---------- */
  app.addEventListener('click', function (e) {
    var el;
    if ((el = e.target.closest('[data-nav]'))) { e.preventDefault(); goTo(el.getAttribute('data-nav')); return; }
    if ((el = e.target.closest('[data-mode]'))) { S.setMode(el.getAttribute('data-mode')); return; }
    if ((el = e.target.closest('[data-diet]'))) { var k = el.getAttribute('data-diet'); filter[k] = !filter[k]; el.classList.toggle('is-on', filter[k]); el.setAttribute('aria-pressed', String(filter[k])); refreshMenu(); return; }
    if (e.target.closest('[data-reset-filter]')) { filter = { q: '', veg: false, spicy: false }; render(); return; }
    if (e.target.closest('[data-hours]')) { openHours(); return; }
    if (e.target.closest('[data-focus-search]')) { var i = app.querySelector('[data-msearch]'); i.scrollIntoView({ block: 'center', behavior: 'smooth' }); i.focus({ preventScroll: true }); return; }
    if (e.target.closest('[data-share]')) {
      var url = window.location.href.split('#')[0];
      if (navigator.share) navigator.share({ title: r.name, url: url }).catch(function () { /* cancelled */ });
      else B.copy(url, t('rest.linkCopied'));
      return;
    }
    if ((el = e.target.closest('[data-open]'))) { B.requestAdd(r.slug, el.getAttribute('data-open')); return; }
    if ((el = e.target.closest('[data-reorder]'))) {
      var o = S.orders().filter(function (x) { return x.id === el.getAttribute('data-reorder'); })[0];
      if (!o || r.status !== 'open') { B.toast(t('rest.notTaking', { name: B.esc(r.name) })); return; }
      var run = function () { o.items.forEach(function (i) { S.addLine(o.slug, i.itemId, i.opts, i.qty); }); B.toast(t('again.added')); };
      var cr = S.cartRestaurant();
      if (cr && cr.slug !== r.slug) B.confirm({ title: t('conflict.title'), text: t('conflict.text', { other: B.esc(cr.name), name: B.esc(r.name) }), ok: t('conflict.ok'), onOk: function () { S.clearCart(); run(); } });
      else run();
    }
    if ((el = e.target.closest('.is-disabled'))) e.preventDefault();
  });
  app.addEventListener('input', function (e) { if (e.target.hasAttribute('data-msearch')) { filter.q = e.target.value; refreshMenu(); } });
  window.addEventListener('scroll', onScroll, { passive: true });

  S.on(function (type) {
    if (type === 'lang' || type === 'reset' || type === 'sync' || type === 'user') { render(); return; }
    if (type === 'mode') { var y = window.scrollY; render(); window.scrollTo(0, y); return; }
    if (type === 'cart' || type === 'orders') refreshCart();
  });

  render();
  if (r && /^#item-/.test(window.location.hash)) {
    var target = document.getElementById(window.location.hash.slice(1));
    if (target) setTimeout(function () {
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset() - 10 });
      target.classList.add('is-flash');
      setTimeout(function () { target.classList.remove('is-flash'); }, 1800);
    }, 80);
  }
})();
