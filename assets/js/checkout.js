/* Blinca – checkout */
(function () {
  'use strict';
  var B = window.Blinca, S = window.BlincaStore, D = window.BLINCA_DATA, t = window.t;
  var app = document.getElementById('app');
  var u = S.user() || {};
  var st = { time: 'asap', slot: '', cc: '+46', phone: u.phone || '', note: '', placing: false, done: false };

  B.mountHeader({});
  B.mountFooter('min');

  function addr() { return S.address(); }
  function eta(r) { return S.mode() === 'pickup' ? r.pickupEta : r.eta + (addr().extraEta || 10); }
  function slots(r) {
    var out = [], now = new Date();
    for (var day = 0; day < 2 && out.length < 24; day++) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day);
      var h = r.hours[(d.getDay() + 6) % 7], o = h[0].split(':'), c = h[1].split(':');
      var start = new Date(d); start.setHours(+o[0], +o[1], 0, 0);
      var end = new Date(d); end.setHours(+c[0], +c[1], 0, 0);
      if (end <= start) end.setDate(end.getDate() + 1);
      var s = new Date(Math.max(start.getTime() + 30 * 60000, now.getTime() + 45 * 60000));
      s.setMinutes(s.getMinutes() < 30 ? 30 : 60, 0, 0);
      for (; s <= end && out.length < 24; s = new Date(s.getTime() + 30 * 60000)) {
        var lbl = (s.toDateString() === now.toDateString() ? t('co.today') : t('co.tomorrow')) + ' ' + ('0' + s.getHours()).slice(-2) + ':' + ('0' + s.getMinutes()).slice(-2);
        out.push({ v: s.toISOString(), l: lbl });
      }
    }
    return out;
  }
  function digits() { return st.phone.replace(/\D/g, '').length; }
  function problems(r, pr) {
    var p = [];
    if (S.mode() === 'delivery' && !B.deliverable(addr())) p.push(t('co.noDeliver'));
    if (r.minOrder && pr.sub < r.minOrder) p.push(t('rest.minLeft', { n: r.minOrder - pr.sub }));
    if (st.time === 'schedule' && !st.slot) p.push(t('co.hintSlot'));
    if (digits() < 7 || digits() > 15) p.push(t('co.hintPhone'));
    if (r.status !== 'open') p.push(t('rest.notTaking', { name: B.esc(r.name) }));
    return p;
  }

  function step(n, done, title, body, sub) {
    return '<section class="card step"><div class="step-h"><span class="num' + (done ? ' done' : '') + '">' + (done ? B.icon('check', 15) : n) + '</span><h2 class="h3">' + title + (sub ? ' <span class="count">' + sub + '</span>' : '') + '</h2></div>' + body + '</section>';
  }
  function modeSeg(r) {
    var m = S.mode();
    return '<div class="seg lg" role="radiogroup"><button role="radio" aria-checked="' + (m === 'delivery') + '" class="' + (m === 'delivery' ? 'is-on' : '') + '" data-mode="delivery">' + B.icon('bike', 18) + t('co.delivery') + ' · ' + t('common.minRange', { a: r.eta, b: r.eta + 10 }) + '</button>' +
      '<button role="radio" aria-checked="' + (m === 'pickup') + '" class="' + (m === 'pickup' ? 'is-on' : '') + '" data-mode="pickup">' + B.icon('walk', 18) + t('co.pickup') + ' · ' + t('common.min', { n: r.pickupEta }) + '</button></div>';
  }
  function addressBody(r, fee) {
    if (S.mode() === 'pickup') {
      return '<div class="radio-tile is-on static"><span class="ti">' + B.icon('walk', 18) + '</span><span class="rt-text"><strong>' + B.esc(r.name) + '</strong><span>' + B.esc(r.address) + '</span></span></div>' +
        '<p class="ok-msg">' + B.icon('check', 16) + t('co.readyIn', { eta: r.pickupEta }) + '</p>';
    }
    var cur = S.addressId();
    var tiles = S.allAddresses().map(function (a) {
      var ok = B.deliverable(a);
      return '<label class="radio-tile' + (a.id === cur ? ' is-on' : '') + '"><input type="radio" name="addr" value="' + a.id + '"' + (a.id === cur ? ' checked' : '') + '><span class="rdot"></span><span class="ti">' + B.icon(B.addrIcon(a), 18) + '</span>' +
        '<span class="rt-text"><strong>' + B.esc(a.label) + '</strong><span>' + B.esc(a.street + ', ' + a.zip + ' ' + a.city) + (ok ? '' : ' · ' + t('addr.outside')) + '</span></span></label>';
    }).join('');
    var ok = B.deliverable(addr());
    return '<div class="tile-list" role="radiogroup">' + tiles + '</div><button class="btn btn-secondary btn-sm dashed mt-12" data-new-addr>' + B.icon('plus', 16) + t('addr.addNew') + '</button>' +
      (ok ? '<p class="ok-msg">' + B.icon('check', 16) + t('co.weDeliver', { fee: B.kr(fee), eta: eta(r) }) + '</p>' : '<p class="form-err">' + B.icon('info', 16) + t('co.noDeliver') + '</p>');
  }
  function timeBody(r) {
    var list = st.time === 'schedule' ? slots(r) : [];
    if (st.time === 'schedule' && !st.slot && list.length) st.slot = list[0].v;
    return '<div class="seg lg" role="radiogroup"><button role="radio" aria-checked="' + (st.time === 'asap') + '" class="' + (st.time === 'asap' ? 'is-on' : '') + '" data-time="asap">' + t('co.asap') + ' · ' + t('common.min', { n: eta(r) }) + '</button>' +
      '<button role="radio" aria-checked="' + (st.time === 'schedule') + '" class="' + (st.time === 'schedule' ? 'is-on' : '') + '" data-time="schedule">' + B.icon('clock', 17) + t('co.schedule') + '</button></div>' +
      (st.time === 'schedule' ? '<div class="select-wrap mt-12"><select class="field" data-slot aria-label="' + t('co.schedule') + '">' + list.map(function (s) { return '<option value="' + s.v + '"' + (s.v === st.slot ? ' selected' : '') + '>' + s.l + '</option>'; }).join('') + '</select>' + B.icon('down', 17) + '</div>' : '');
  }
  function contactBody() {
    var bad = st.phone && (digits() < 7 || digits() > 15);
    return '<label class="label" for="co-phone">' + t('co.phone') + '</label><div class="phone-row"><div class="select-wrap"><select class="field" data-cc aria-label="' + t('co.country') + '">' +
      [['+46', '🇸🇪 +46'], ['+47', '🇳🇴 +47'], ['+45', '🇩🇰 +45'], ['+358', '🇫🇮 +358']].map(function (c) { return '<option value="' + c[0] + '"' + (st.cc === c[0] ? ' selected' : '') + '>' + c[1] + '</option>'; }).join('') +
      '</select>' + B.icon('down', 16) + '</div><input class="field' + (bad ? ' is-invalid' : '') + '" id="co-phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="70 123 45 67" value="' + B.esc(st.phone) + '"></div>' +
      '<p class="help">' + t('co.phoneHelp') + '</p>';
  }
  function summaryHTML(r, pr) {
    var p = problems(r, pr);
    return '<div class="sc-head"><h2 class="h3">' + t('co.yourOrder') + '</h2><button class="btn-link sm" data-action="open-cart-edit">' + t('co.editCart') + '</button></div>' +
      '<div class="row-card plain"><span class="th">' + B.img(r.image) + '</span><span class="grow"><strong>' + B.esc(r.name) + '</strong><small>' + B.esc(r.address.split(',').slice(0, 2).join(',')) + '</small></span></div>' +
      S.cart().map(function (l) {
        var it = S.item(l.slug, l.itemId), sub = B.lineSub(l);
        return '<div class="sum-line"><span class="th sm">' + B.img(it.image) + '</span><div class="grow"><strong>' + B.esc(B.L(it.name)) + '</strong><small>' + (sub ? sub + ' · ' : '') + B.kr(S.lineTotal(l)) + '</small></div>' + B.lineStepper(l) + '</div>';
      }).join('') +
      '<div class="mt-12">' + B.promoBox(pr) + '</div><div class="sc-totals">' + B.totalsHTML(pr) + '</div>' +
      '<button class="btn btn-primary btn-lg btn-block mt-12" data-place' + (p.length || st.placing ? ' disabled' : '') + '>' + (st.placing ? t('co.processing') : t('co.placeTotal', { total: B.kr(pr.total) })) + '</button>' +
      (p.length && !st.placing ? '<p class="hint">' + p[0] + '</p>' : '') +
      '<p class="secure">' + B.icon('shield', 15) + t('co.secure') + '</p>';
  }
  function mobileBarHTML(r, pr) {
    var p = problems(r, pr);
    return '<div class="co-bar"><div><small>' + t('co.total') + '</small><strong>' + B.kr(pr.total) + '</strong></div><button class="btn btn-primary btn-lg grow" data-place' + (p.length || st.placing ? ' disabled' : '') + '>' + (st.placing ? t('co.processing') : t('co.place')) + '</button></div>';
  }

  function render() {
    document.title = t('title.checkout');
    var r = S.cartRestaurant();
    if (!r) {
      app.innerHTML = '<div class="wrap narrow pad-y"><h1 class="h1">' + t('co.title') + '</h1><div class="empty mt-16"><span class="empty-ic">' + B.icon('cart', 28) + '</span><h3>' + t('cart.empty') + '</h3><p>' + t('cart.emptyText') + '</p><a class="btn btn-primary" href="index.html#all-restaurants">' + t('cart.browse') + '</a></div></div>';
      return;
    }
    var pr = B.pricing();
    var deliveryOk = S.mode() === 'pickup' || B.deliverable(addr());
    app.innerHTML = '<div class="wrap co-wrap"><a class="back-link" href="' + B.restaurantUrl(r.slug) + '">' + B.icon('left', 16) + t('co.backTo', { name: B.esc(r.name) }) + '</a>' +
      '<h1 class="h1">' + t('co.title') + '</h1><div class="co"><div class="co-steps">' +
      step(1, true, t('co.how'), modeSeg(r)) +
      step(2, deliveryOk, S.mode() === 'pickup' ? t('co.pickupFrom') : t('co.deliveryAddress'), addressBody(r, r.fee)) +
      step(3, true, S.mode() === 'pickup' ? t('co.pickupTime') : t('co.deliveryTime'), timeBody(r)) +
      step(4, digits() >= 7 && digits() <= 15, t('co.contact'), contactBody()) +
      step(5, !!st.note.trim(), t('co.note'), '<textarea class="field field-area" id="co-note" rows="3" maxlength="300" placeholder="' + t('co.notePh') + '">' + B.esc(st.note) + '</textarea>', t('common.optional')) +
      '</div><aside class="card co-summary" data-summary>' + summaryHTML(r, pr) + '</aside></div></div><div data-cobar>' + mobileBarHTML(r, pr) + '</div>';
  }
  function refreshSummary() {
    var r = S.cartRestaurant(); if (!r) return;
    var pr = B.pricing();
    var s = app.querySelector('[data-summary]'); if (s) s.innerHTML = summaryHTML(r, pr);
    var b = app.querySelector('[data-cobar]'); if (b) b.innerHTML = mobileBarHTML(r, pr);
    var nums = app.querySelectorAll('.step .num');
    if (nums[3]) { var ok = digits() >= 7 && digits() <= 15; nums[3].classList.toggle('done', ok); nums[3].innerHTML = ok ? B.icon('check', 15) : '4'; }
  }

  app.addEventListener('click', function (e) {
    var el;
    if ((el = e.target.closest('[data-mode]'))) { S.setMode(el.getAttribute('data-mode')); return; }
    if ((el = e.target.closest('[data-time]'))) { st.time = el.getAttribute('data-time'); if (st.time === 'asap') st.slot = ''; render(); return; }
    if (e.target.closest('[data-new-addr]')) { B.openAddressForm(); return; }
    if (e.target.closest('[data-action="open-cart-edit"]')) { window.location.href = B.restaurantUrl(S.cartRestaurant().slug); return; }
    if (e.target.closest('[data-place]')) place();
  });
  app.addEventListener('change', function (e) {
    var el = e.target;
    if (el.name === 'addr') S.setAddress(el.value);
    else if (el.hasAttribute('data-slot')) { st.slot = el.value; refreshSummary(); }
    else if (el.hasAttribute('data-cc')) st.cc = el.value;
  });
  app.addEventListener('input', function (e) {
    if (e.target.id === 'co-phone') { st.phone = e.target.value; e.target.classList.remove('is-invalid'); refreshSummary(); }
    else if (e.target.id === 'co-note') st.note = e.target.value;
  });
  app.addEventListener('focusout', function (e) {
    if (e.target.id === 'co-phone') e.target.classList.toggle('is-invalid', !!st.phone && (digits() < 7 || digits() > 15));
  });

  function place() {
    var r = S.cartRestaurant(), pr = B.pricing();
    if (!r || problems(r, pr).length || st.placing) return;
    st.placing = true; refreshSummary();
    setTimeout(function () {
      var order = { id: 'BL-' + (10500 + Math.floor(Math.random() * 89000)), slug: r.slug, date: new Date().toISOString().slice(0, 19), amount: pr.sub, total: pr.total, mode: S.mode(),
        items: S.cart().map(function (l) { return { itemId: l.itemId, opts: l.opts, qty: l.qty }; }) };
      var etaMin = eta(r), mode = S.mode();
      st.placing = false; st.done = true;
      S.addOrder(order);
      S.clearCart();
      B.openModal('<div class="done-modal"><span class="done-ic">' + B.icon('check', 30) + '</span><h2>' + t('done.title') + '</h2>' +
        '<p>' + t(mode === 'delivery' ? 'done.textDelivery' : 'done.textPickup', { id: order.id, name: B.esc(r.name), eta: etaMin }) + '</p><p class="muted">' + t('done.paid', { total: B.kr(order.total) }) + '</p>' +
        '<div class="done-actions"><a class="btn btn-secondary btn-lg grow" href="info.html?page=account&tab=orders">' + t('done.orders') + '</a><a class="btn btn-primary btn-lg grow" href="index.html" autofocus>' + t('done.home') + '</a></div></div>',
        { className: 'modal-sm', label: t('done.title'), onClose: function () { window.location.href = 'index.html'; } });
    }, 900);
  }

  S.on(function (type) {
    if (st.done) return;
    if (type === 'cart' || type === 'orders') { if (!S.cartRestaurant()) render(); else refreshSummary(); return; }
    if (type === 'mode' || type === 'address' || type === 'lang' || type === 'reset' || type === 'sync') render();
  });
  render();
})();
