/* Blinca – 404 */
(function () {
  'use strict';
  var B = window.Blinca, S = window.BlincaStore, t = window.t;
  var app = document.getElementById('app');
  B.mountHeader({});
  B.mountFooter('min');
  function render() {
    document.title = t('nf.title') + ' – Blinca';
    app.innerHTML = '<div class="center-card"><div class="card auth-card nf"><span class="nf-ic">' + B.plate + '</span><p class="nf-code">404</p>' +
      '<h1 class="h2">' + t('nf.heading') + '</h1><p class="muted">' + t('nf.text') + '</p>' +
      '<div class="nf-actions"><a class="btn btn-primary btn-lg" href="index.html">' + t('nf.home') + '</a><a class="btn btn-secondary btn-lg" href="index.html#all-restaurants">' + t('cart.browse') + '</a></div></div></div>';
  }
  S.on(function (type) { if (type === 'lang') render(); });
  render();
})();
