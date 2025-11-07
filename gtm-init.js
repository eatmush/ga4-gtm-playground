// gtm-init.js
// Inicializa o Google Tag Manager usando o container ID presente no atributo
// `data-gtm-id` do próprio script tag ou em `window.GTM_ID` como fallback.
// Deve ser incluído no <head> onde antes havia o snippet inline do GTM.
(function (w, d, s, l, i) {
  try {
    var currentScript = document.currentScript;
    var dataId = (currentScript && currentScript.getAttribute && currentScript.getAttribute('data-gtm-id')) || window.GTM_ID;
    i = dataId || 'GTM-KBPG55VP'; // fallback para o ID existente no projeto

    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  } catch (e) {
    // Não bloquear a página se houver erro.
    console.error('gtm-init error', e);
  }
})(window, document, 'script', 'dataLayer');
