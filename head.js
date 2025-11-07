// head.js — carrega helpers não-críticos para a página (consent UI, handlers)
// Este arquivo é carregado assincronamente pelo snippet inline no <head>.

// Conteúdo baseado em script.js
console.log('head.js carregado - consent helpers inicializados');
(function () {
  window.dataLayer = window.dataLayer || [];

  function hideBanner() {
    var b = document.getElementById('consent-banner');
    if (b) b.style.display = 'none';
  }

  function showBanner() {
    var b = document.getElementById('consent-banner');
    if (b) b.style.display = 'flex';
  }

  function setConsent(granted) {
    var consentState = {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: granted ? 'granted' : 'denied'
    };

    try {
      localStorage.setItem('ga_consent', JSON.stringify(consentState));
    } catch (e) {
      // ignore storage errors
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'consent_update', consent: consentState });

    if (typeof gtag === 'function') {
      try {
        gtag('consent', 'update', consentState);
      } catch (e) {
        // ignore
      }
    }

    hideBanner();
    console.log('Consentimento atualizado:', consentState);
  }

  function initConsentUI() {
    try {
      var stored = localStorage.getItem('ga_consent');
      if (stored) {
        var state = JSON.parse(stored);
        window.dataLayer.push({ event: 'consent_restore', consent: state });
        hideBanner();
        return;
      }
    } catch (e) {
      // ignore parse errors
    }
    showBanner();
  }

  window.setConsent = setConsent;

  function attachBannerHandlers() {
    var accept = document.getElementById('consent-accept');
    var decline = document.getElementById('consent-decline');
    if (accept) accept.addEventListener('click', function () { setConsent(true); });
    if (decline) decline.addEventListener('click', function () { setConsent(false); });

    initConsentUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachBannerHandlers);
  } else {
    attachBannerHandlers();
  }
})();
