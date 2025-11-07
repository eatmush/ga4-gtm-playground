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
      window.dataLayer.push({
        event: 'consent_default',
        consent: { analytics_storage: 'denied', ad_storage: 'denied' }
      });
    }
  } catch (e) {
    // em caso de erro, negar por padrão
    window.dataLayer.push({
      event: 'consent_default',
      consent: { analytics_storage: 'denied', ad_storage: 'denied' }
    });
  }
})();
