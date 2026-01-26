// ============================================
// CONFIGURAZIONE
// ============================================

const CONFIG = {
  // URL del server (da modificare con il tuo indirizzo)
  // Per usare HTTPS: cambia 'http' in 'https' e assicurati che il server supporti SSL
  baseUrl: 'http://94.185.76.20:8000',

  // Timeout per le richieste (in millisecondi)
  requestTimeout: 5000,

  // Durata dei messaggi toast (in millisecondi)
  toastDuration: 3000,

  // Debounce per i pulsanti (in millisecondi)
  debounceDelay: 1000,

  // Abilita logging in console
  enableLogging: true,

  // Abilita autenticazione (se false, i comandi vengono eseguiti senza auth)
  enableAuth: false,

  // Nome della chiave localStorage per il token
  tokenStorageKey: 'domotica_auth_token'
};

// ============================================
// LOGGING
// ============================================

const Logger = {
  log(message, data = null) {
    if (CONFIG.enableLogging) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${message}`, data || '');
    }
  },

  error(message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, error || '');
  },

  info(message, data = null) {
    if (CONFIG.enableLogging) {
      const timestamp = new Date().toISOString();
      console.info(`[${timestamp}] INFO: ${message}`, data || '');
    }
  }
};

// ============================================
// AUTENTICAZIONE
// ============================================

const Auth = {
  /**
   * Verifica se l'utente è autenticato
   */
  isAuthenticated() {
    const token = localStorage.getItem(CONFIG.tokenStorageKey);
    return token !== null && token !== '';
  },

  /**
   * Ottiene il token corrente
   */
  getToken() {
    return localStorage.getItem(CONFIG.tokenStorageKey);
  },

  /**
   * Salva il token
   */
  setToken(token) {
    localStorage.setItem(CONFIG.tokenStorageKey, token);
    Logger.log('Token di autenticazione salvato');
  },

  /**
   * Rimuove il token (logout)
   */
  logout() {
    localStorage.removeItem(CONFIG.tokenStorageKey);
    Logger.log('Logout effettuato');
    Toast.info('Disconnesso con successo');
    window.location.reload();
  },

  /**
   * Effettua il login
   */
  async login(username, password) {
    Logger.log('Tentativo di login', { username });

    try {
      // Genera un token semplice (in produzione, questo dovrebbe venire dal server)
      // Questo è solo un esempio - il server dovrebbe gestire l'autenticazione
      const token = btoa(`${username}:${password}:${Date.now()}`);

      this.setToken(token);
      Logger.log('Login effettuato con successo');
      Toast.success('Login effettuato con successo');

      return true;

    } catch (error) {
      Logger.error('Errore durante il login', error);
      Toast.error('Errore durante il login');
      return false;
    }
  },

  /**
   * Mostra il form di login
   */
  showLoginForm() {
    const loginForm = document.getElementById('login-modal');
    if (loginForm) {
      loginForm.style.display = 'flex';
    }
  },

  /**
   * Nasconde il form di login
   */
  hideLoginForm() {
    const loginForm = document.getElementById('login-modal');
    if (loginForm) {
      loginForm.style.display = 'none';
    }
  }
};

// ============================================
// FEEDBACK VISIVO (TOAST NOTIFICATIONS)
// ============================================

const Toast = {
  show(message, type = 'info') {
    // Rimuovi toast precedenti
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Crea nuovo toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    Logger.info(`Toast mostrato: ${type}`, message);

    // Rimuovi dopo il timeout
    setTimeout(() => {
      toast.remove();
    }, CONFIG.toastDuration);
  },

  success(message) {
    this.show(message, 'success');
  },

  error(message) {
    this.show(message, 'error');
  },

  info(message) {
    this.show(message, 'info');
  }
};

// ============================================
// GESTIONE COMANDI DOMOTICA
// ============================================

const DomoticaAPI = {
  // Mappa per tracciare le richieste in corso (rate limiting)
  pendingRequests: new Set(),

  /**
   * Invia un comando al server domotico
   * @param {string} endpoint - L'endpoint del comando (es: '/DO_Toggle.cgi?DO=a53c1p1')
   * @param {string} actionName - Nome dell'azione per il logging
   * @returns {Promise<boolean>} - true se successo, false altrimenti
   */
  async sendCommand(endpoint, actionName) {
    // Verifica autenticazione se abilitata
    if (CONFIG.enableAuth && !Auth.isAuthenticated()) {
      Logger.info('Utente non autenticato, mostro form di login');
      Toast.error('Effettua il login per eseguire i comandi');
      Auth.showLoginForm();
      return false;
    }

    // Rate limiting: verifica se c'è già una richiesta per questo endpoint
    if (this.pendingRequests.has(endpoint)) {
      Logger.info(`Richiesta già in corso per: ${actionName}`);
      Toast.info('Attendere il completamento della richiesta precedente');
      return false;
    }

    this.pendingRequests.add(endpoint);
    Logger.log(`Invio comando: ${actionName}`, endpoint);

    const url = `${CONFIG.baseUrl}${endpoint}`;

    try {
      // Crea un AbortController per il timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.requestTimeout);

      // Prepara opzioni fetch
      const fetchOptions = {
        method: 'GET',
        mode: 'no-cors', // Necessario per server senza CORS
        signal: controller.signal
      };

      // NOTA: Con mode 'no-cors' NON possiamo inviare headers custom
      // Se hai bisogno di autenticazione, devi rimuovere 'no-cors' e configurare CORS sul server
      // Oppure usare un reverse proxy (vedi nginx.conf.example)

      // Invia la richiesta
      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);

      // Con mode: 'no-cors', response.ok sarà sempre false
      // Assumiamo successo se non ci sono errori
      Logger.log(`Comando eseguito: ${actionName}`);
      Toast.success(`${actionName} eseguito con successo`);

      return true;

    } catch (error) {
      if (error.name === 'AbortError') {
        Logger.error(`Timeout per: ${actionName}`);
        Toast.error(`Timeout: ${actionName} non risponde`);
      } else {
        Logger.error(`Errore invio comando: ${actionName}`, error);
        Toast.error(`Errore: impossibile eseguire ${actionName}`);
      }

      return false;

    } finally {
      // Rimuovi la richiesta dalla lista dopo il debounce delay
      setTimeout(() => {
        this.pendingRequests.delete(endpoint);
      }, CONFIG.debounceDelay);
    }
  },

  /**
   * Apri la pagina di login
   */
  openLogin() {
    Logger.log('Apertura pagina login');
    const loginUrl = `${CONFIG.baseUrl}/webpass.htm`;
    window.open(loginUrl, '_blank', 'width=600,height=400');
    Toast.info('Pagina di login aperta');
  }
};

// ============================================
// GESTORI EVENTI PULSANTI
// ============================================

const ButtonHandlers = {
  // Mappa dei pulsanti con i loro endpoint
  commands: {
    'apri-cancelletto': {
      endpoint: '/DO_Toggle.cgi?DO=a53c1p1',
      name: 'Apri Cancelletto'
    },
    'cancello-grande': {
      endpoint: '/DO_Pulse.cgi?DO=a21c1p1',
      name: 'Cancello Grande'
    },
    'basculante': {
      endpoint: '/DO_Pulse.cgi?DO=a14c1p3',
      name: 'Basculante'
    },
    'luci-garage': {
      endpoint: '/DO_Toggle.cgi?DO=a15c1p1',
      name: 'Luci Garage'
    }
  },

  /**
   * Gestisce il click su un pulsante comando
   */
  async handleCommand(buttonId, buttonElement) {
    const command = this.commands[buttonId];
    if (!command) {
      Logger.error(`Comando non trovato: ${buttonId}`);
      return;
    }

    // Disabilita il pulsante durante l'esecuzione
    buttonElement.disabled = true;

    // Aggiungi spinner
    const originalText = buttonElement.textContent;
    buttonElement.innerHTML = `${originalText} <span class="loading-spinner"></span>`;

    // Esegui il comando
    await DomoticaAPI.sendCommand(command.endpoint, command.name);

    // Ripristina il pulsante
    buttonElement.disabled = false;
    buttonElement.textContent = originalText;
  },

  /**
   * Inizializza i gestori eventi per tutti i pulsanti
   */
  init() {
    // Pulsanti comando
    Object.keys(this.commands).forEach(buttonId => {
      const button = document.getElementById(buttonId);
      if (button) {
        button.addEventListener('click', () => {
          this.handleCommand(buttonId, button);
        });
        Logger.info(`Gestore eventi registrato per: ${buttonId}`);
      }
    });

    // Pulsante login/logout
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
      loginButton.addEventListener('click', () => {
        if (CONFIG.enableAuth && Auth.isAuthenticated()) {
          // Se autenticato, mostra opzione logout
          if (confirm('Vuoi disconnetterti?')) {
            Auth.logout();
          }
        } else {
          // Altrimenti apri pagina login del server
          DomoticaAPI.openLogin();
        }
      });
      Logger.info('Gestore eventi registrato per: login-button');
    }

    // Form di login modale
    const loginForm = document.getElementById('auth-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('auth-username').value;
        const password = document.getElementById('auth-password').value;

        const success = await Auth.login(username, password);
        if (success) {
          Auth.hideLoginForm();
          // Aggiorna testo pulsante login
          if (loginButton) {
            loginButton.textContent = 'Logout';
          }
        }
      });
      Logger.info('Gestore eventi registrato per: auth-login-form');
    }

    // Pulsante chiudi modale
    const closeModal = document.getElementById('close-login-modal');
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        Auth.hideLoginForm();
      });
    }

    // Aggiorna testo pulsante login se già autenticato
    if (CONFIG.enableAuth && Auth.isAuthenticated() && loginButton) {
      loginButton.textContent = 'Logout';
    }
  }
};

// ============================================
// SERVICE WORKER
// ============================================

const ServiceWorkerManager = {
  /**
   * Registra il service worker per PWA
   */
  async register() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('./service-worker.js');
        Logger.log('Service Worker registrato', registration.scope);
      } catch (error) {
        Logger.error('Errore registrazione Service Worker', error);
      }
    } else {
      Logger.info('Service Worker non supportato dal browser');
    }
  }
};

// ============================================
// INIZIALIZZAZIONE APP
// ============================================

function initApp() {
  Logger.log('Inizializzazione applicazione Domotica Casa Lazise');

  // Registra service worker
  ServiceWorkerManager.register();

  // Inizializza gestori eventi pulsanti
  ButtonHandlers.init();

  Logger.log('Applicazione inizializzata con successo');
}

// Avvia l'app quando il DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
