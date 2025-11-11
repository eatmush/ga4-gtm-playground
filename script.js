// Consent Mode helpers for the playground
// - Permite escolhas granulares para as 4 variáveis: analytics_storage, ad_storage, ad_personalization, ad_user_data
// - Persiste em localStorage, empurra para dataLayer e atualiza gtag se presente

// Login Manager - rastreia autenticação com GTM/dataLayer
window.AuthManager = (function () {
	var storageKey = 'ga_auth';
	var defaultTestUser = { email: 'usuario@teste.com', password: 'senha123' };

	function getAuthState() {
		try {
			var stored = localStorage.getItem(storageKey);
			return stored ? JSON.parse(stored) : null;
		} catch (e) {
			return null;
		}
	}

	function setAuthState(user) {
		try {
			localStorage.setItem(storageKey, JSON.stringify({ email: user.email, timestamp: Date.now() }));
		} catch (e) {
			// ignore storage errors
		}
	}

	function clearAuthState() {
		try {
			localStorage.removeItem(storageKey);
		} catch (e) {
			// ignore
		}
	}

	function pushEvent(eventName, params) {
		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push({
			event: eventName,
			...params
		});
		console.log('Evento de autenticação:', eventName, params);
	}

	function login(email, password) {
		// Validação simples (apenas para teste)
		if (email === defaultTestUser.email && password === defaultTestUser.password) {
			setAuthState({ email: email });
			pushEvent('login', { method: 'email', email: email });
			return { success: true };
		} else {
			pushEvent('login_failed', { method: 'email', email: email, reason: 'invalid_credentials' });
			return { success: false, error: 'Email ou senha incorretos' };
		}
	}

	function logout() {
		var authState = getAuthState();
		if (authState) {
			clearAuthState();
			pushEvent('logout', { email: authState.email });
		}
	}

	function isAuthenticated() {
		return getAuthState() !== null;
	}

	function getCurrentUser() {
		return getAuthState();
	}

	function updateAuthUI() {
		var container = document.getElementById('auth-container');
		if (!container) return;

		var isAuth = isAuthenticated();
		var currentUser = getCurrentUser();

		container.innerHTML = '';

		if (isAuth && currentUser) {
			var userSpan = document.createElement('span');
			userSpan.textContent = currentUser.email;
			userSpan.style.fontSize = '0.9rem';
			userSpan.style.color = '#666';
			container.appendChild(userSpan);

			var logoutBtn = document.createElement('button');
			logoutBtn.textContent = 'Sair';
			logoutBtn.style.background = '#f1f3f4';
			logoutBtn.style.color = '#222';
			logoutBtn.style.border = 'none';
			logoutBtn.style.padding = '8px 12px';
			logoutBtn.style.borderRadius = '6px';
			logoutBtn.style.cursor = 'pointer';
			logoutBtn.onclick = function () {
				logout();
				updateAuthUI();
			};
			container.appendChild(logoutBtn);
		} else {
			var loginBtn = document.createElement('button');
			loginBtn.textContent = 'Login';
			loginBtn.style.background = '#1a73e8';
			loginBtn.style.color = '#fff';
			loginBtn.style.border = 'none';
			loginBtn.style.padding = '8px 12px';
			loginBtn.style.borderRadius = '6px';
			loginBtn.style.cursor = 'pointer';
			loginBtn.onclick = function () {
				showLoginModal();
			};
			container.appendChild(loginBtn);
		}
	}

	return {
		login: login,
		logout: logout,
		isAuthenticated: isAuthenticated,
		getCurrentUser: getCurrentUser,
		updateAuthUI: updateAuthUI,
		getAuthState: getAuthState
	};
})();

function showLoginModal() {
	var modal = document.getElementById('login-modal');
	if (modal) {
		modal.style.display = 'flex';
		document.getElementById('login-email').value = '';
		document.getElementById('login-password').value = '';
		document.getElementById('login-error').style.display = 'none';
		document.getElementById('login-email').focus();
	}
}

function closeLoginModal() {
	var modal = document.getElementById('login-modal');
	if (modal) {
		modal.style.display = 'none';
	}
}

console.log('script.js carregado - consent helpers e auth manager inicializados');

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

// Inicializa UI de autenticação e handlers do modal de login
(function initAuthUI() {
	function attachLoginHandlers() {
		var loginBtn = document.getElementById('login-btn');
		var cancelBtn = document.getElementById('login-cancel-btn');
		var modal = document.getElementById('login-modal');
		var emailInput = document.getElementById('login-email');
		var passwordInput = document.getElementById('login-password');
		var errorDiv = document.getElementById('login-error');

		if (!loginBtn || !cancelBtn) return;

		// Atualiza UI inicial de auth
		window.AuthManager.updateAuthUI();

		// Submeter login via botão
		loginBtn.addEventListener('click', function () {
			var email = (emailInput && emailInput.value) ? emailInput.value.trim() : '';
			var password = (passwordInput && passwordInput.value) ? passwordInput.value : '';

			if (!email || !password) {
				if (errorDiv) {
					errorDiv.textContent = 'Email e senha são obrigatórios';
					errorDiv.style.display = 'block';
				}
				return;
			}

			var result = window.AuthManager.login(email, password);
			if (result.success) {
				closeLoginModal();
				window.AuthManager.updateAuthUI();
			} else {
				if (errorDiv) {
					errorDiv.textContent = result.error || 'Erro ao fazer login';
					errorDiv.style.display = 'block';
				}
			}
		});

		// Submeter login via Enter
		if (passwordInput) {
			passwordInput.addEventListener('keypress', function (e) {
				if (e.key === 'Enter') {
					loginBtn.click();
				}
			});
		}

		// Cancelar
		cancelBtn.addEventListener('click', function () {
			closeLoginModal();
		});

		// Fechar modal ao clicar fora
		if (modal) {
			modal.addEventListener('click', function (e) {
				if (e.target === modal) {
					closeLoginModal();
				}
			});
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', attachLoginHandlers);
	} else {
		attachLoginHandlers();
	}
})();

