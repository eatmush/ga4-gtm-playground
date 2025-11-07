GA4 + GTM Playground
=====================

Pequeno playground estático para testar Google Tag Manager (GTM) e GA4 com um exemplo simples de Consent Mode.

Arquivos principais
- `index.html` — página principal com botões de teste e banner de consentimento.
- `pagina-teste-1.html`, `pagina-teste-2.html`, `pagina-teste-3.html` — páginas de teste genéricas com eventos de exemplo.
- `consent-init.js` — inicializa o estado de consentimento (push `consent_default` no `dataLayer`). Deve ser carregado NO `<head>` ANTES do GTM.
- `gtm-init.js` — bootstrap reutilizável do GTM. Lê o `data-gtm-id` do `<script>` que o inclui.
- `script.js` — lógica do banner de consentimento, handlers e persistência em `localStorage`.
- `favicon.ico` — favicon do projeto.

Fluxo de consentimento
- Ao carregar a página, `consent-init.js` empurra um objeto `consent_default` para o `dataLayer` com `analytics_storage` e `ad_storage` definidos como `denied` por padrão (ou reaplica a decisão salva em `localStorage`).
- `gtm-init.js` carrega o GTM depois que o consent default foi aplicado.
- O banner (UI) permite ao usuário `Aceitar` ou `Recusar`; a ação chama `setConsent(true|false)` em `script.js`, que:
	- persiste a escolha em `localStorage` (`ga_consent`),
	- empurra `consent_update` no `dataLayer`,
	- tenta atualizar `gtag('consent','update', ...)` se a função `gtag` existir.

Como testar localmente
1. Inicie um servidor estático a partir da raiz do projeto (recomendado):

```bash
python -m http.server 8000
# Abra http://localhost:8000
```

2. Abra DevTools → Console e Network.
	- Você deve ver o log de carregamento do `script.js` e os pushes no `dataLayer`:
		- `consent_default` (on load)
		- `consent_update` (ao aceitar/recusar)
		- `consent_restore` (se já havia decisão salva)

3. Use GTM Preview/Debug para verificar que tags dependentes de consentimento só disparam quando `analytics_storage` está `granted`.

Alterar container GTM
- Cada página inclui `gtm-init.js` com um atributo `data-gtm-id`. Para usar outro container, altere esse atributo na página desejada ou defina `window.GTM_ID` antes do include.

Notas de arquitetura
- Mantivemos os scripts separados por clareza (`consent-init.js`, `gtm-init.js`, `script.js`). Isso facilita manutenção e testes. Para produção, considere concatenar/minificar os scripts para reduzir requests.
- O arquivo `head.js` foi removido por estar vazio e não referenciado.

Re-testar o banner
- Para forçar o banner a reaparecer durante os testes:

```javascript
localStorage.removeItem('ga_consent'); location.reload();
```

Contato
- Se quiser, posso adicionar opções de consentimento granulares (analytics vs ads), um botão de "Gerenciar consentimento" persistente ou um README mais detalhado com screenshots.

