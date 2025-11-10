// Consent Mode helpers for the playground
// - Permite escolhas granulares para as 4 variáveis: analytics_storage, ad_storage, ad_personalization, ad_user_data
// - Persiste em localStorage, empurra para dataLayer e atualiza gtag se presente

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

	function normalizeConsentValue(val) {
		return val === 'granted' ? 'granted' : 'denied';
	}

	// Aceita um objeto com as chaves desejadas ou um boolean (true = all granted, false = all denied)
	function setConsent(stateOrBool) {
		var consentState = {
			analytics_storage: 'denied',
			ad_storage: 'denied',
			ad_personalization: 'denied',
			ad_user_data: 'denied'
		};

		if (typeof stateOrBool === 'boolean') {
			var v = stateOrBool ? 'granted' : 'denied';
			consentState.analytics_storage = v;
			consentState.ad_storage = v;
			consentState.ad_personalization = v;
			consentState.ad_user_data = v;
		} else if (typeof stateOrBool === 'object' && stateOrBool !== null) {
			// mesclar valores informados (espera-se 'granted'|'denied' ou booleans)
			Object.keys(consentState).forEach(function (k) {
				if (k in stateOrBool) {
					var val = stateOrBool[k];
					if (typeof val === 'boolean') consentState[k] = val ? 'granted' : 'denied';
					else consentState[k] = normalizeConsentValue(val);
				}
			});
		}

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

	function populateUIFromState(state) {
		try {
			document.getElementById('consent-checkbox-analytics').checked = (state.analytics_storage === 'granted');
			document.getElementById('consent-checkbox-ad').checked = (state.ad_storage === 'granted');
			document.getElementById('consent-checkbox-ad-personalization').checked = (state.ad_personalization === 'granted');
			document.getElementById('consent-checkbox-ad-user-data').checked = (state.ad_user_data === 'granted');
		} catch (e) {
			// elementos podem não existir — ignorar
		}
	}

	function readConsentFromUI() {
		return {
			analytics_storage: document.getElementById('consent-checkbox-analytics').checked ? 'granted' : 'denied',
			ad_storage: document.getElementById('consent-checkbox-ad').checked ? 'granted' : 'denied',
			ad_personalization: document.getElementById('consent-checkbox-ad-personalization').checked ? 'granted' : 'denied',
			ad_user_data: document.getElementById('consent-checkbox-ad-user-data').checked ? 'granted' : 'denied'
		};
	}

	function initConsentUI() {
		// Se já houver decisão persistida, reaplicar e esconder banner
		try {
			var stored = localStorage.getItem('ga_consent');
			if (stored) {
				var state = JSON.parse(stored);
				window.dataLayer.push({ event: 'consent_restore', consent: state });
				// popular UI (caso o banner ainda seja mostrado em outra aba)
				populateUIFromState(state);
				hideBanner();
				return;
			}
		} catch (e) {
			// ignore parse errors
		}

		// caso não haja decisão, mostrar banner (por padrão já está visível)
		showBanner();
	}

	// Expor funções globalmente
	window.setConsent = setConsent;
	window.getConsent = function () {
		try {
			return JSON.parse(localStorage.getItem('ga_consent') || 'null');
		} catch (e) {
			return null;
		}
	};

	function attachBannerHandlers() {
		var accept = document.getElementById('consent-accept');
		var decline = document.getElementById('consent-decline');
		var save = document.getElementById('consent-save');

		if (accept) accept.addEventListener('click', function () { setConsent(true); });
		if (decline) decline.addEventListener('click', function () { setConsent(false); });
		if (save) save.addEventListener('click', function () {
			try {
				var state = readConsentFromUI();
				setConsent(state);
			} catch (e) {
				console.error('Erro ao ler escolhas de consentimento do UI', e);
			}
		});

		initConsentUI();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', attachBannerHandlers);
	} else {
		attachBannerHandlers();
	}

})();
