/* Blinca – login / create account (prototype: real auth stays in auth.js) */
(function () {
  'use strict';
  var B = window.Blinca, S = window.BlincaStore, t = window.t;
  var app = document.getElementById('app');
  var mode = B.params().get('mode') === 'signup' ? 'signup' : 'login';
  var next = B.params().get('next') || 'index.html';
  if (!/^[a-z0-9_-]+\.html/i.test(next)) next = 'index.html';

  B.mountHeader({ noCart: true, noTabbar: true });
  B.mountFooter('min');

  function render() {
    var signup = mode === 'signup';
    document.title = (signup ? t('login.createTitle') : t('login.title')) + ' – Blinca';
    app.innerHTML = '<div class="center-card"><div class="card auth-card">' +
      '<div class="auth-logo">' + B.logo() + '</div><h1 class="h2">' + (signup ? t('login.createTitle') : t('login.welcome')) + '</h1>' +
      '<p class="muted">' + (signup ? t('login.createSub') : t('login.sub')) + '</p>' +
      '<form class="auth-form" novalidate>' +
        (signup ? '<div><label class="label" for="l-name">' + t('contact.name') + '</label><input class="field" id="l-name" autocomplete="name" required></div>' : '') +
        '<div><label class="label" for="l-email">' + t('contact.email') + '</label><input class="field" id="l-email" type="email" autocomplete="email" required' + (signup ? '' : ' autofocus') + '></div>' +
        '<div><div class="label-row"><label class="label" for="l-pass">' + t('login.password') + '</label>' + (signup ? '' : '<button type="button" class="btn-link sm" data-forgot>' + t('login.forgot') + '</button>') + '</div>' +
        '<div class="pass-wrap"><input class="field" id="l-pass" type="password" autocomplete="' + (signup ? 'new-password' : 'current-password') + '" required minlength="6">' +
        '<button type="button" class="pass-toggle" data-eye aria-label="' + t('login.show') + '" aria-pressed="false">' + B.icon('eye', 18) + '</button></div>' +
        (signup ? '<p class="help">' + t('login.passHelp') + '</p>' : '') + '</div>' +
        '<p class="form-err" data-err hidden></p>' +
        '<button class="btn btn-primary btn-lg btn-block">' + (signup ? t('login.create') : t('acct.login')) + '</button>' +
        '<div class="or">' + t('login.or') + '</div>' +
        '<button type="button" class="btn btn-secondary btn-lg btn-block" data-switch>' + (signup ? t('login.haveAccount') : t('login.createTitle')) + '</button>' +
      '</form><p class="legal">' + t('login.legal', { terms: '<a class="btn-link sm" href="info.html?page=terms">' + t('footer.terms') + '</a>', privacy: '<a class="btn-link sm" href="info.html?page=privacy">' + t('footer.privacy') + '</a>' }) + '</p></div></div>';
  }

  app.addEventListener('click', function (e) {
    var eye = e.target.closest('[data-eye]');
    if (eye) {
      var inp = app.querySelector('#l-pass'), show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      eye.setAttribute('aria-pressed', String(show));
      eye.setAttribute('aria-label', show ? t('login.hide') : t('login.show'));
      eye.innerHTML = B.icon(show ? 'eyeOff' : 'eye', 18);
      return;
    }
    if (e.target.closest('[data-switch]')) { mode = mode === 'signup' ? 'login' : 'signup'; render(); return; }
    if (e.target.closest('[data-forgot]')) {
      var em = app.querySelector('#l-email');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())) { showErr([em], t('login.forgotNeedEmail')); return; }
      B.toast(t('login.resetSent'));
    }
  });
  function showErr(fields, msg) {
    app.querySelectorAll('.field').forEach(function (f) { f.classList.toggle('is-invalid', fields.indexOf(f) !== -1); });
    var er = app.querySelector('[data-err]');
    er.textContent = msg; er.hidden = !msg;
    if (fields[0]) fields[0].focus();
  }
  app.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    var name = f.querySelector('#l-name'), email = f.querySelector('#l-email'), pass = f.querySelector('#l-pass');
    var bad = [];
    if (name && !name.value.trim()) bad.push(name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) bad.push(email);
    if (pass.value.length < 6) bad.push(pass);
    if (bad.length) { showErr(bad, bad.indexOf(pass) !== -1 && bad.length === 1 ? t('login.passShort') : t('form.fix')); return; }
    showErr([], '');
    var btn = f.querySelector('.btn-primary');
    btn.disabled = true; btn.textContent = t('login.wait');
    setTimeout(function () {
      var prev = S.user() || {};
      S.setUser({ name: name ? name.value.trim() : (prev.email === email.value.trim() && prev.name ? prev.name : email.value.split('@')[0].replace(/^./, function (c) { return c.toUpperCase(); })), email: email.value.trim(), phone: prev.phone || '' });
      window.location.href = next;
    }, 500);
  });

  S.on(function (type) { if (type === 'lang') render(); });
  render();
})();
