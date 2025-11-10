// consent-init.js
// Inicializa window.dataLayer e aplica o estado de consentimento padrão
// Deve ser incluído no <head> ANTES do snippet do GTM para garantir que o
// consentimento padrão seja conhecido pelo container.
(function () {
  window.dataLayer = window.dataLayer || [];
  try {
    var stored = localStorage.getItem('ga_consent');
    if (stored) {
      var state = JSON.parse(stored);
      window.dataLayer.push({ event: 'consent_default', consent: state });
    } else {
      var defaultState = {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_personalization: 'denied',
        ad_user_data: 'denied'
      };
      window.dataLayer.push({ event: 'consent_default', consent: defaultState });
    }
  } catch (e) {
    // em caso de erro, negar por padrão
    window.dataLayer.push({
      event: 'consent_default',
      consent: {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_personalization: 'denied',
        ad_user_data: 'denied'
      }
    });
  }

  // Helper global para aplicar um estado de consentimento (usa localStorage + dataLayer)
  window.applyConsent = function (state) {
    try {
      localStorage.setItem('ga_consent', JSON.stringify(state));
    } catch (e) {
      // ignore storage errors
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'consent_update', consent: state });
    if (typeof gtag === 'function') {
      try {
        gtag('consent', 'update', state);
      } catch (e) {
        // ignore
      }
    }
  };
})();
