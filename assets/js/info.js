/* Blinca – account + info pages (info.html?page=...) */
(function () {
  'use strict';
  var B = window.Blinca, S = window.BlincaStore, t = window.t;
  var app = document.getElementById('app');
  var P = B.params();
  var page = P.get('page') || 'about';
  var tab = P.get('tab') || 'profile';
  if (page === 'careers' || page === 'partner' || page === 'courier') { window.location.replace('404.html'); return; }
  if (page === 'account') document.body.setAttribute('data-page', tab === 'orders' ? 'orders' : 'account');
  B.page = document.body.getAttribute('data-page');

  B.mountHeader({});
  B.mountFooter('dark');

  var C = {
    how: {
      en: { title: 'How it works', body: [
        ['Pick a kitchen', 'Browse restaurants near your address, filter by cuisine, delivery time or price, and open any menu.'],
        ['Build your order', 'Add dishes, choose sauces and extras, and adjust quantities right from the menu or your cart.'],
        ['Check out', 'Choose delivery or pick-up, deliver now or schedule a time, and pay securely.'],
        ['Eat', 'Follow your order and get it at your door, usually within 30–40 minutes.']] },
      sv: { title: 'Så funkar det', body: [
        ['Välj ett kök', 'Hitta restauranger nära din adress, filtrera på kök, leveranstid eller pris och öppna valfri meny.'],
        ['Bygg din beställning', 'Lägg till rätter, välj såser och tillbehör och ändra antal direkt i menyn eller varukorgen.'],
        ['Gå till kassan', 'Välj leverans eller avhämtning, leverans nu eller vid en vald tid, och betala säkert.'],
        ['Ät', 'Följ din beställning och få den till dörren, oftast inom 30–40 minuter.']] }
    },
    about: {
      en: { title: 'About us', body: [
        ['Local food, fast', 'Blinca connects you with the best independent kitchens in your city – from the pizzeria on the corner to the sushi bar everyone talks about.'],
        ['Fair for restaurants', 'We keep fees low and pay restaurants every week, so the places you love can keep doing what they do best.'],
        ['Made in Stockholm', 'Blinca started in Stockholm and now delivers in Gothenburg and Malmö too.']] },
      sv: { title: 'Om oss', body: [
        ['Lokal mat, snabbt', 'Blinca kopplar ihop dig med de bästa fristående köken i din stad – från pizzerian på hörnet till sushibaren alla pratar om.'],
        ['Schyst mot restauranger', 'Vi håller avgifterna låga och betalar restaurangerna varje vecka, så att dina favoritställen kan fortsätta göra det de är bäst på.'],
        ['Skapat i Stockholm', 'Blinca startade i Stockholm och levererar nu även i Göteborg och Malmö.']] }
    },
    terms: {
      en: { title: 'Terms', body: [['Orders', 'An order is binding once the restaurant has accepted it. Prices include VAT.'], ['Delivery', 'Delivery times are estimates. If your order is late or wrong, contact us and we will make it right.'], ['Refunds', 'Refunds are paid back to the original payment method within 5 working days.']] },
      sv: { title: 'Villkor', body: [['Beställningar', 'En beställning är bindande när restaurangen har accepterat den. Priserna inkluderar moms.'], ['Leverans', 'Leveranstider är uppskattningar. Om din beställning är sen eller fel, kontakta oss så löser vi det.'], ['Återbetalning', 'Återbetalningar görs till det ursprungliga betalsättet inom 5 arbetsdagar.']] }
    },
    privacy: {
      en: { title: 'Privacy', body: [['What we store', 'Your name, phone number, addresses and order history, so we can deliver your food.'], ['Who sees it', 'Restaurants and couriers only see what they need to complete your order.'], ['Your choices', 'You can ask us to export or delete your data at any time: privacy@blinca.se.']] },
      sv: { title: 'Integritet', body: [['Vad vi sparar', 'Ditt namn, telefonnummer, adresser och orderhistorik, så att vi kan leverera din mat.'], ['Vem ser det', 'Restauranger och bud ser bara det de behöver för att slutföra din beställning.'], ['Dina val', 'Du kan när som helst be oss exportera eller radera dina uppgifter: privacy@blinca.se.']] }
    }
  };

  var FAQ = {
    en: [
      ['Where is my order?', 'Open your account to see your latest orders. If the courier is more than 15 minutes late, contact us.'],
      ['Can I change my order?', 'You can change your cart until you place the order. After that, contact the restaurant through our support.'],
      ['How much does delivery cost?', 'Each restaurant sets its own delivery fee, shown on the restaurant card and at checkout. Some restaurants deliver for free.'],
      ['Can I pick up my food myself?', 'Yes. Choose Pick-up at checkout and we will tell you when your food is ready.']
    ],
    sv: [
      ['Var är min beställning?', 'Öppna ditt konto för att se dina senaste beställningar. Om budet är mer än 15 minuter sent, kontakta oss.'],
      ['Kan jag ändra min beställning?', 'Du kan ändra din varukorg tills du lägger beställningen. Därefter kontaktar du restaurangen via vår support.'],
      ['Vad kostar leveransen?', 'Varje restaurang sätter sin egen leveransavgift, som visas på restaurangkortet och i kassan. Vissa restauranger levererar gratis.'],
      ['Kan jag hämta maten själv?', 'Ja. Välj Avhämtning i kassan så meddelar vi när maten är klar.']
    ]
  };

  function textPage(c) {
    return '<h1 class="h1">' + c.title + '</h1><div class="info-grid">' + c.body.map(function (b) { return '<section class="card info-card"><h2 class="h3">' + b[0] + '</h2><p>' + b[1] + '</p></section>'; }).join('') + '</div>';
  }
  function contactPage() {
    return '<h1 class="h1">' + t('nav.contact') + '</h1><div class="info-grid">' +
      '<section class="card info-card"><h2 class="h3">' + t('contact.reach') + '</h2><p>hej@blinca.se<br>+46 8 123 456 00</p><p class="muted">' + t('contact.hours') + '</p></section>' +
      '<form class="card info-card" novalidate><h2 class="h3">' + t('contact.send') + '</h2>' +
      '<label class="label mt-12" for="c-name">' + t('contact.name') + '</label><input class="field" id="c-name" required autocomplete="name">' +
      '<label class="label mt-12" for="c-email">' + t('contact.email') + '</label><input class="field" id="c-email" type="email" required autocomplete="email">' +
      '<label class="label mt-12" for="c-msg">' + t('contact.message') + '</label><textarea class="field field-area" id="c-msg" rows="4" required></textarea>' +
      '<p class="form-err" data-err hidden></p><button class="btn btn-primary btn-lg btn-block mt-16">' + t('contact.submit') + '</button></form></div>';
  }
  function helpPage() {
    return '<h1 class="h1">' + t('footer.helpCentre') + '</h1><div class="faq">' + FAQ[S.lang()].map(function (f, i) {
      return '<details class="card faq-item"' + (i === 0 ? ' open' : '') + '><summary>' + f[0] + B.icon('down', 20) + '</summary><p>' + f[1] + '</p></details>';
    }).join('') + '</div><p class="muted mt-16">' + t('help.more') + ' <a class="btn-link" href="info.html?page=contact">' + t('nav.contact') + '</a></p>';
  }

  /* ---------- account ---------- */
  function initials(n) { return String(n || '?').split(' ').map(function (x) { return x.charAt(0); }).join('').slice(0, 2).toUpperCase(); }
  function orderRows(list) {
    var loc = S.lang() === 'sv' ? 'sv-SE' : 'en-GB';
    if (!list.length) return '<p class="muted">' + t('acc.noOrders') + '</p>';
    return list.map(function (o) {
      var r = S.restaurant(o.slug), f = S.item(o.slug, o.items[0].itemId);
      var items = o.items.map(function (i) { var it = S.item(o.slug, i.itemId); return i.qty + '× ' + (it ? B.esc(B.L(it.name)) : ''); }).join(', ');
      return '<div class="list-row"><span class="th">' + B.img(f ? f.image : null) + '</span><div class="grow"><strong>' + B.esc(r.name) + '</strong><small>' + items + ' · ' +
        new Date(o.date).toLocaleDateString(loc, { day: 'numeric', month: 'short' }) + ' · ' + B.kr(o.amount) + '</small></div>' +
        '<span class="tag good">' + B.icon('check', 13) + t('acc.delivered') + '</span><button class="btn btn-secondary btn-sm" data-reorder="' + o.id + '">' + t('home.reorder') + '</button></div>';
    }).join('');
  }
  function addressCard() {
    var cur = S.addressId();
    return '<section class="card pad-card"><div class="card-h"><h2 class="h3">' + t('acc.addresses') + '</h2><button class="btn btn-secondary btn-sm" data-new-addr>' + B.icon('plus', 16) + t('acc.addAddress') + '</button></div><div class="tile-list">' +
      S.allAddresses().map(function (a) {
        return '<button class="radio-tile' + (a.id === cur ? ' is-on' : '') + '" data-set-addr="' + a.id + '"><span class="rdot"></span><span class="ti">' + B.icon(B.addrIcon(a), 18) + '</span><span class="rt-text"><strong>' + B.esc(a.label) + (a.id === cur ? ' · ' + t('acc.default') : '') + '</strong><span>' + B.esc(a.street + ', ' + a.zip + ' ' + a.city) + '</span></span></button>';
      }).join('') + '</div></section>';
  }
  function favCard() {
    var favs = S.favorites().map(S.restaurant).filter(Boolean);
    return '<section class="card pad-card"><div class="card-h"><h2 class="h3">' + t('acc.favourites') + '</h2></div>' + (favs.length ? '<div class="list">' + favs.map(function (r) {
      return '<div class="list-row"><span class="th">' + B.img(r.image) + '</span><div class="grow"><strong>' + B.esc(r.name) + '</strong><small>' + B.cuisineNames(r) + ' · ★ ' + r.rating.toFixed(1) + '</small></div>' +
        '<a class="btn btn-secondary btn-sm" href="' + B.restaurantUrl(r.slug) + '">' + t('cart.viewMenu') + '</a><button class="icon-btn sm is-on" data-action="toggle-fav" data-fav data-slug="' + r.slug + '" aria-label="' + t('fav.label', { name: B.esc(r.name) }) + '">' + B.icon('heart', 17) + '</button></div>';
    }).join('') + '</div>' : '<p class="muted">' + t('acc.noFavorites') + '</p>') + '</section>';
  }
  function accountPage() {
    var u = S.user();
    if (!u) {
      return '<div class="center-card"><div class="card auth-card"><span class="empty-ic">' + B.icon('user', 26) + '</span><h1 class="h2">' + t('acc.signedOut') + '</h1><p class="muted">' + t('acc.signedOutText') + '</p><a class="btn btn-primary btn-lg btn-block mt-16" href="login.html?next=' + encodeURIComponent('info.html?page=account') + '">' + t('acct.login') + '</a></div></div>';
    }
    var tabs = [['profile', 'user', t('acc.profile')], ['orders', 'receipt', t('acc.orders')], ['favourites', 'heart', t('acc.favourites')], ['addresses', 'pin', t('acc.addresses')]];
    var nav = '<nav class="card side-nav" aria-label="' + t('header.account') + '">' + tabs.map(function (x) {
      return '<a href="info.html?page=account&tab=' + x[0] + '" class="' + (tab === x[0] ? 'is-on' : '') + '"' + (tab === x[0] ? ' aria-current="page"' : '') + '>' + B.icon(x[1], 18) + x[2] + '</a>';
    }).join('') + '<a href="info.html?page=help">' + B.icon('help', 18) + t('footer.helpCentre') + '</a>' +
      '<div class="pop-wrap"><button data-action="toggle-menu" aria-haspopup="true" aria-expanded="false">' + B.icon('globe', 18) + t('header.language') + ' · ' + S.lang().toUpperCase() + '</button><div class="menu" hidden><button data-action="set-lang" data-lang="en">English</button><button data-action="set-lang" data-lang="sv">Svenska</button></div></div>' +
      '<div class="menu-sep"></div><button class="danger" data-action="logout">' + B.icon('logout', 18) + t('acct.logout') + '</button></nav>';
    var profile = '<section class="card pad-card profile"><span class="avatar pink"><span>' + B.esc(initials(u.name)) + '</span></span><div class="grow"><h2 class="h3">' + B.esc(u.name) + '</h2><p class="muted">' + B.esc(u.email) + '</p>' + (u.phone ? '<p class="muted">+46 ' + B.esc(u.phone) + '</p>' : '') + '</div><button class="btn btn-secondary btn-sm" data-edit-profile>' + B.icon('edit', 15) + t('acc.edit') + '</button></section>';
    var recent = '<section class="card pad-card"><div class="card-h"><h2 class="h3">' + (tab === 'orders' ? t('acc.orders') : t('acc.recent')) + '</h2>' + (tab === 'orders' ? '' : '<a class="btn-link sm" href="info.html?page=account&tab=orders">' + t('acc.seeAll') + '</a>') + '</div><div class="list">' + orderRows(tab === 'orders' ? S.orders() : S.orders().slice(0, 3)) + '</div></section>';
    var body = tab === 'orders' ? recent : tab === 'favourites' ? favCard() : tab === 'addresses' ? addressCard() :
      profile + recent + addressCard() +
      '<section class="card pad-card"><div class="card-h"><h2 class="h3">' + t('acc.demo') + '</h2></div><p class="muted">' + t('acc.demoText') + '</p><button class="btn btn-secondary btn-sm mt-12" data-reset>' + t('acc.reset') + '</button></section>';
    var logoutBtn = '<button class="btn btn-secondary btn-block m-logout" data-action="logout">' + B.icon('logout', 16) + t('acct.logout') + '</button>';
    return '<h1 class="h1">' + t('acc.title') + '</h1><div class="acc">' + nav + '<div class="acc-main">' + body + logoutBtn + '</div></div>';
  }

  function render() {
    var html, title;
    if (C[page]) { var c = C[page][S.lang()]; html = textPage(c); title = c.title; }
    else if (page === 'contact') { html = contactPage(); title = t('nav.contact'); }
    else if (page === 'help') { html = helpPage(); title = t('footer.helpCentre'); }
    else if (page === 'account') { html = accountPage(); title = t('acc.title'); }
    else { var d = C.about[S.lang()]; html = textPage(d); title = d.title; }
    document.title = title + ' – Blinca';
    app.innerHTML = '<div class="wrap info-wrap' + (page === 'account' ? ' wide' : '') + '">' + html + '</div>';
  }

  function editProfile() {
    var u = S.user();
    var m = B.openModal('<form class="modal-pad" novalidate><div class="m-head"><h2>' + t('acc.edit') + '</h2><button type="button" class="icon-btn sm" data-close aria-label="' + t('common.close') + '">' + B.icon('x', 18) + '</button></div>' +
      '<label class="label" for="p-name">' + t('contact.name') + '</label><input class="field" id="p-name" value="' + B.esc(u.name) + '" required autofocus>' +
      '<label class="label mt-12" for="p-email">' + t('contact.email') + '</label><input class="field" id="p-email" type="email" value="' + B.esc(u.email) + '" required>' +
      '<label class="label mt-12" for="p-phone">' + t('co.phone') + '</label><input class="field" id="p-phone" type="tel" value="' + B.esc(u.phone || '') + '">' +
      '<p class="form-err" data-err hidden></p><div class="confirm-actions"><button type="button" class="btn btn-ghost" data-close>' + t('common.cancel') + '</button><button class="btn btn-primary">' + t('acc.save') + '</button></div></form>', { label: t('acc.edit') });
    m.el.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, name = f.querySelector('#p-name').value.trim(), email = f.querySelector('#p-email').value.trim();
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { var er = f.querySelector('[data-err]'); er.textContent = t('form.fix'); er.hidden = false; return; }
      S.setUser({ name: name, email: email, phone: f.querySelector('#p-phone').value.trim() });
      m.close(); B.toast(t('acc.saved'));
    });
  }

  app.addEventListener('submit', function (e) {
    e.preventDefault();
    var form = e.target, err = form.querySelector('[data-err]');
    var bad = Array.prototype.filter.call(form.querySelectorAll('[required]'), function (f) { return !f.value.trim() || (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim())); });
    form.querySelectorAll('.field').forEach(function (f) { f.classList.toggle('is-invalid', bad.indexOf(f) !== -1); });
    if (bad.length) { err.textContent = t('form.fix'); err.hidden = false; bad[0].focus(); return; }
    err.hidden = true; form.reset(); B.toast(t('contact.sent'));
  });
  app.addEventListener('click', function (e) {
    var el;
    if (e.target.closest('[data-reset]')) B.confirm({ title: t('acc.reset'), text: t('acc.resetConfirm'), ok: t('acc.reset'), onOk: function () { S.resetDemo(); B.toast(t('acc.resetDone')); } });
    else if (e.target.closest('[data-new-addr]')) B.openAddressForm();
    else if (e.target.closest('[data-edit-profile]')) editProfile();
    else if ((el = e.target.closest('[data-set-addr]'))) { S.setAddress(el.getAttribute('data-set-addr')); B.toast(t('addr.changed')); }
    else if ((el = e.target.closest('[data-reorder]'))) {
      var o = S.orders().filter(function (x) { return x.id === el.getAttribute('data-reorder'); })[0], r = S.restaurant(o.slug);
      if (r.status !== 'open') { B.toast(t('rest.notTaking', { name: B.esc(r.name) })); return; }
      var run = function () { o.items.forEach(function (i) { S.addLine(o.slug, i.itemId, i.opts, i.qty); }); B.toast(t('again.added')); B.openCart(); };
      var cr = S.cartRestaurant();
      if (cr && cr.slug !== o.slug) B.confirm({ title: t('conflict.title'), text: t('conflict.text', { other: B.esc(cr.name), name: B.esc(r.name) }), ok: t('conflict.ok'), onOk: function () { S.clearCart(); run(); } });
      else run();
    }
  });

  S.on(function (type) { if (type !== 'cart') render(); });
  render();
})();
