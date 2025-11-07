// Consent Mode helpers for the playground
// - setConsent(true|false) updates dataLayer, gtag (if present) and persists the choice
// - Banner buttons call setConsent

// Debug: confirmar que o arquivo script.js foi carregado
console.log('script.js carregado - consent helpers inicializados');

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

		// Informar GTM via dataLayer (use event 'consent_update')
		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push({ event: 'consent_update', consent: consentState });

		// Se gtag estiver presente, atualizar consent mode também
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
		// Se já houver decisão persistida, reaplicar e esconder banner
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

		// caso não haja decisão, mostrar banner (por padrão já está visível)
		showBanner();
	}

	// Expor a função globalmente para uso manual/console
	window.setConsent = setConsent;

		// Anexar handlers aos botões do banner de forma robusta (DOM pode já estar pronto)
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
			// DOM já carregado — anexar imediatamente
			attachBannerHandlers();
		}
})();
