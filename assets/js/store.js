/* Blinca – state store backed by localStorage. */
window.BlincaStore = (function () {
  'use strict';
  var D = window.BLINCA_DATA;
  var PREFIX = 'blinca.v1.';  /* same keys the live site uses */
  var memory = {};
  var subs = [];

  function read(k, d) {
    try {
      var v = window.localStorage.getItem(PREFIX + k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return Object.prototype.hasOwnProperty.call(memory, k) ? memory[k] : d;
    }
  }
  function write(k, v) {
    memory[k] = v;
    try { window.localStorage.setItem(PREFIX + k, JSON.stringify(v)); } catch (e) { /* private mode */ }
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------- lookups ---------- */
  function restaurant(slug) {
    for (var i = 0; i < D.restaurants.length; i++) if (D.restaurants[i].slug === slug) return D.restaurants[i];
    return null;
  }
  function item(slug, itemId) {
    var r = restaurant(slug);
    if (!r) return null;
    for (var c = 0; c < r.menu.length; c++) {
      var items = r.menu[c].items;
      for (var i = 0; i < items.length; i++) if (items[i].id === itemId) return items[i];
    }
    return null;
  }
  function normOpts(opts) {
    var out = {};
    Object.keys(opts || {}).sort().forEach(function (g) {
      var arr = (opts[g] || []).slice().sort();
      if (arr.length) out[g] = arr;
    });
    return out;
  }
  function keyFor(slug, itemId, opts, note) {
    return slug + '|' + itemId + '|' + JSON.stringify(normOpts(opts)) + (note ? '|' + note : '');
  }
  function unitPrice(slug, itemId, opts) {
    var it = item(slug, itemId);
    if (!it) return 0;
    var p = it.price;
    (it.options || []).forEach(function (g) {
      var chosen = (opts && opts[g.id]) || [];
      g.choices.forEach(function (c) { if (chosen.indexOf(c.id) !== -1) p += c.price; });
    });
    return p;
  }

  /* ---------- first visit seed ---------- */
  function seedIfNeeded() {
    if (read('seeded', false)) return;
    write('cart', D.seed.cart.map(function (l) {
      return { key: keyFor(l.slug, l.itemId, l.opts), slug: l.slug, itemId: l.itemId, opts: normOpts(l.opts), qty: l.qty };
    }));
    write('orders', clone(D.seed.orders));
    write('favorites', clone(D.seed.favorites));
    write('address', D.seed.address);
    if (read('lang', null) == null) write('lang', 'en');
    write('user', { name: 'Anna Svensson', email: 'anna@example.se', phone: '70 123 45 67' });
    write('myAddresses', []);
    write('promo', null);
    write('mode', 'delivery');
    write('seeded', true);
  }
  seedIfNeeded();

  function validCart() {
    return read('cart', []).filter(function (l) { return l && item(l.slug, l.itemId) && l.qty > 0; });
  }

  var S = {
    restaurant: restaurant,
    item: item,
    keyFor: keyFor,
    unitPrice: unitPrice,

    on: function (fn) { subs.push(fn); },
    emit: function (type) {
      subs.slice().forEach(function (fn) {
        try { fn(type); } catch (e) { if (window.console) console.error(e); }
      });
    },

    /* language */
    lang: function () { var l = read('lang', 'en'); return l === 'sv' ? 'sv' : 'en'; },
    setLang: function (l) {
      if (l !== 'en' && l !== 'sv') return;
      write('lang', l);
      document.documentElement.lang = l;
      S.emit('lang');
    },

    /* address */
    addressId: function () { return read('address', 'home'); },
    address: function () {
      var id = S.addressId(), all = S.allAddresses();
      for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
      return all[0];
    },
    setAddress: function (id) { write('address', id); S.emit('address'); },

    /* cart */
    cart: validCart,
    cartRestaurant: function () { var c = validCart(); return c.length ? restaurant(c[0].slug) : null; },
    count: function () { return validCart().reduce(function (n, l) { return n + l.qty; }, 0); },
    lineTotal: function (l) { return unitPrice(l.slug, l.itemId, l.opts) * l.qty; },
    subtotal: function () { return validCart().reduce(function (n, l) { return n + S.lineTotal(l); }, 0); },
    itemQty: function (slug, itemId) {
      return validCart().reduce(function (n, l) { return n + (l.slug === slug && l.itemId === itemId ? l.qty : 0); }, 0);
    },
    /* returns 'ok' or 'conflict' (cart holds another restaurant) */
    addLine: function (slug, itemId, opts, qty, note) {
      var cart = validCart();
      if (cart.length && cart[0].slug !== slug) return 'conflict';
      note = (note || '').trim();
      var key = keyFor(slug, itemId, opts, note);
      var found = null;
      cart.forEach(function (l) { if (l.key === key) found = l; });
      if (found) found.qty += qty || 1;
      else cart.push({ key: key, slug: slug, itemId: itemId, opts: normOpts(opts), qty: qty || 1, note: note });
      write('cart', cart);
      S.emit('cart');
      return 'ok';
    },
    decItem: function (slug, itemId) {
      var cart = validCart();
      for (var i = cart.length - 1; i >= 0; i--) {
        if (cart[i].slug === slug && cart[i].itemId === itemId) {
          cart[i].qty -= 1;
          if (cart[i].qty <= 0) cart.splice(i, 1);
          break;
        }
      }
      write('cart', cart);
      S.emit('cart');
    },
    changeQty: function (key, delta) {
      var cart = validCart();
      for (var i = 0; i < cart.length; i++) {
        if (cart[i].key === key) {
          cart[i].qty += delta;
          if (cart[i].qty <= 0) cart.splice(i, 1);
          break;
        }
      }
      write('cart', cart);
      S.emit('cart');
    },
    removeLine: function (key) {
      write('cart', validCart().filter(function (l) { return l.key !== key; }));
      S.emit('cart');
    },
    clearCart: function () { write('cart', []); write('promo', null); S.emit('cart'); },

    /* delivery mode + promo */
    mode: function () { return read('mode', 'delivery') === 'pickup' ? 'pickup' : 'delivery'; },
    setMode: function (m) { write('mode', m === 'pickup' ? 'pickup' : 'delivery'); S.emit('mode'); },
    promo: function () { return read('promo', null); },
    setPromo: function (code) { write('promo', code || null); S.emit('cart'); },

    /* session (prototype only – real auth lives in auth.js) */
    user: function () { return read('user', null); },
    setUser: function (u) { write('user', u || null); S.emit('user'); },

    /* addresses the customer added */
    allAddresses: function () { return D.addresses.concat(read('myAddresses', [])); },
    addAddress: function (a) {
      var list = read('myAddresses', []);
      a.id = 'a' + Date.now();
      list.push(a);
      write('myAddresses', list);
      S.setAddress(a.id);
      return a;
    },

    /* favourites */
    favorites: function () { return read('favorites', []); },
    isFav: function (slug) { return S.favorites().indexOf(slug) !== -1; },
    toggleFav: function (slug) {
      var f = S.favorites();
      var i = f.indexOf(slug);
      if (i === -1) f.push(slug); else f.splice(i, 1);
      write('favorites', f);
      S.emit('fav');
      return i === -1;
    },

    /* orders */
    orders: function () {
      return read('orders', []).filter(function (o) { return restaurant(o.slug); })
        .sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    },
    addOrder: function (o) {
      var list = read('orders', []);
      list.push(o);
      write('orders', list);
      S.emit('orders');
    },

    /* demo */
    resetDemo: function () {
      write('seeded', false);
      seedIfNeeded();
      S.emit('reset');
    }
  };

  document.documentElement.lang = S.lang();
  /* keep tabs in sync */
  window.addEventListener('storage', function (e) {
    if (e.key && e.key.indexOf(PREFIX) === 0) S.emit('sync');
  });
  return S;
})();
