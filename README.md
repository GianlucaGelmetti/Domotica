# 🏠 Domotica Casa Lazise

Applicazione web Progressive Web App (PWA) per il controllo dei dispositivi domotici di Casa Lazise.

## 📋 Indice

- [Caratteristiche](#caratteristiche)
- [Installazione](#installazione)
- [Configurazione](#configurazione)
- [Configurazione HTTPS](#configurazione-https)
- [Autenticazione](#autenticazione)
- [Struttura del Progetto](#struttura-del-progetto)
- [Best Practice Implementate](#best-practice-implementate)
- [Sicurezza](#sicurezza)

---

## ✨ Caratteristiche

- ✅ **PWA Completa**: Installabile su dispositivi mobili e desktop
- ✅ **Funzionamento Offline**: Service Worker con cache intelligente
- ✅ **Feedback Visivo**: Toast notifications per ogni azione
- ✅ **Gestione Errori**: Timeout e retry automatico
- ✅ **Rate Limiting**: Protezione contro spam di richieste
- ✅ **Logging Avanzato**: Tracciamento completo delle azioni
- ✅ **Accessibilità**: ARIA labels e semantic HTML
- ✅ **Autenticazione**: Sistema token-based (opzionale)
- ✅ **Responsive**: Ottimizzata per tutti i dispositivi
- ✅ **Content Security Policy**: Protezione XSS

---

## 📦 Installazione

### 1. Download

Clona o scarica questo repository:

\`\`\`bash
git clone <repository-url>
cd Domotica
\`\`\`

### 2. Hosting

Puoi hostare l'applicazione su:

- **Server web locale** (Apache, Nginx)
- **GitHub Pages**
- **Netlify / Vercel** (hosting gratuito)
- **Servizio cloud** (AWS S3, Google Cloud Storage)

### 3. Servire i file

Esempio con Python:

\`\`\`bash
# Python 3
python -m http.server 8080

# Apri il browser su http://localhost:8080
\`\`\`

Esempio con Node.js (serve):

\`\`\`bash
npx serve .
\`\`\`

---

## ⚙️ Configurazione

### Configurazione Server Domotico

Modifica il file \`app.js\` alla riga 11:

\`\`\`javascript
const CONFIG = {
  // Cambia questo URL con l'indirizzo del tuo server
  baseUrl: 'http://94.185.76.20:8000',

  // Altre configurazioni...
  requestTimeout: 5000,      // Timeout richieste (ms)
  toastDuration: 3000,       // Durata notifiche (ms)
  debounceDelay: 1000,       // Delay tra richieste (ms)
  enableLogging: true,       // Abilita logging console
  enableAuth: false          // Abilita autenticazione
};
\`\`\`

### Personalizzazione Comandi

Modifica i comandi domotici in \`app.js\` alla riga 158:

\`\`\`javascript
commands: {
  'apri-cancelletto': {
    endpoint: '/DO_Toggle.cgi?DO=a53c1p1',
    name: 'Apri Cancelletto'
  },
  // Aggiungi altri comandi qui...
}
\`\`\`

---

## 🔒 Configurazione HTTPS

**⚠️ IMPORTANTE**: HTTPS è **ESSENZIALE** per la sicurezza della tua applicazione domotica.

### Perché HTTPS?

- ✅ Crittografia delle comunicazioni
- ✅ Protezione contro man-in-the-middle
- ✅ Richiesto per PWA su produzione
- ✅ Richiesto per Service Worker su domini esterni

### Opzione 1: Certificato Let's Encrypt (Gratuito)

#### Con Nginx:

\`\`\`bash
# Installa certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Ottieni certificato (sostituisci tuodominio.com)
sudo certbot --nginx -d tuodominio.com

# Rinnovo automatico
sudo systemctl enable certbot.timer
\`\`\`

#### Configurazione Nginx:

\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name tuodominio.com;

    ssl_certificate /etc/letsencrypt/live/tuodominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tuodominio.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Root directory
    root /var/www/domotica;
    index index.html;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy per server domotico
    location /api/ {
        proxy_pass http://94.185.76.20:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Redirect HTTP -> HTTPS
server {
    listen 80;
    server_name tuodominio.com;
    return 301 https://$server_name$request_uri;
}
\`\`\`

### Opzione 2: Reverse Proxy con Cloudflare

1. Registra un dominio (gratuito con Freenom)
2. Configura Cloudflare DNS:
   - Aggiungi record A puntando al tuo IP
   - Attiva "Proxied" (nuvola arancione)
3. Cloudflare fornisce HTTPS automaticamente

### Opzione 3: Tunnel con ngrok (Sviluppo)

\`\`\`bash
# Installa ngrok
brew install ngrok  # macOS
# oppure scarica da https://ngrok.com/

# Avvia tunnel
ngrok http 8080

# Usa l'URL HTTPS fornito (es: https://abc123.ngrok.io)
\`\`\`

### Aggiornare l'App per HTTPS

Dopo aver configurato HTTPS, modifica \`app.js\`:

\`\`\`javascript
const CONFIG = {
  baseUrl: 'https://tuodominio.com/api',  // Usa HTTPS!
  // ...
};
\`\`\`

E aggiorna la CSP in \`index.html\`:

\`\`\`html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; connect-src 'self' https://tuodominio.com;">
\`\`\`

---

## 🔐 Autenticazione

L'app include un sistema di autenticazione token-based **disabilitato di default**.

### Abilitare l'Autenticazione

In \`app.js\`, cambia:

\`\`\`javascript
const CONFIG = {
  enableAuth: true,  // Cambia da false a true
  // ...
};
\`\`\`

### Come Funziona

1. All'avvio, se non autenticati, viene mostrato un form di login
2. Le credenziali vengono salvate in localStorage come token
3. Ogni richiesta include il token nell'header Authorization
4. Il pulsante "Login" diventa "Logout" quando autenticati

### ⚠️ Importante

Questo è un **sistema di autenticazione lato client** a scopo dimostrativo.

**Per produzione**, implementa:
- Autenticazione lato server
- JWT (JSON Web Tokens)
- OAuth 2.0
- Scadenza token
- Refresh token

---

## 📁 Struttura del Progetto

\`\`\`
Domotica/
├── index.html              # Pagina principale
├── styles.css              # Stili dell'applicazione
├── app.js                  # Logica JavaScript
├── manifest.json           # Manifest PWA
├── service-worker.js       # Service Worker per offline
├── README.md               # Questa documentazione
├── images/
│   ├── icon-192.svg       # Icona 192x192
│   └── icon-512.svg       # Icona 512x512
└── .git/                   # Repository Git
\`\`\`

---

## ✅ Best Practice Implementate

### Architettura

- ✅ **Separazione delle responsabilità**: HTML, CSS, JS in file separati
- ✅ **Semantic HTML**: Uso di \`<button>\` invece di \`<div>\`
- ✅ **Progressive Web App**: Manifest + Service Worker
- ✅ **Configurazione centralizzata**: Oggetto CONFIG

### Sicurezza

- ✅ **Content Security Policy**: Protezione XSS
- ✅ **No credenziali hardcoded**: Rimosso admin/admin
- ✅ **Token-based auth**: Sistema autenticazione opzionale
- ✅ **HTTPS ready**: Documentazione completa
- ✅ **Input validation**: (da implementare lato server)

### Performance

- ✅ **Cache strategy**: Service Worker con cache-first
- ✅ **Rate limiting**: Debounce su richieste
- ✅ **Timeout management**: 5s timeout su fetch
- ✅ **Lazy loading**: Solo ciò che serve

### User Experience

- ✅ **Feedback visivo**: Toast notifications
- ✅ **Loading states**: Spinner durante richieste
- ✅ **Error handling**: Messaggi chiari
- ✅ **Responsive design**: Mobile-first
- ✅ **Accessibility**: ARIA labels, keyboard navigation

### Codice

- ✅ **Logging avanzato**: Console log strutturati
- ✅ **Error handling**: Try/catch su tutte le async
- ✅ **Code organization**: Moduli logici
- ✅ **Naming conventions**: Nomi descrittivi
- ✅ **Comments**: Documentazione inline

---

## 🔒 Sicurezza

### Problemi Risolti

| Problema | Soluzione Implementata |
|----------|------------------------|
| HTTP non crittografato | Documentazione HTTPS completa |
| Credenziali hardcoded | Rimosse dal codice |
| IP pubblico esposto | Configurazione centralizzata |
| Nessuna autenticazione | Sistema token-based opzionale |
| XSS | Content Security Policy |
| Popup bloccati | Sostituiti con Fetch API |

### Raccomandazioni Produzione

1. **HTTPS obbligatorio**: Configura SSL sul server
2. **Autenticazione server-side**: Non fidarti del client
3. **Firewall**: Limita accesso al server domotico
4. **VPN**: Accedi solo tramite VPN
5. **Two-Factor Auth**: Aggiungi 2FA
6. **Audit regolari**: Controlla log di accesso
7. **Rate limiting server**: Proteggi contro brute force
8. **IP whitelisting**: Solo IP fidati

---

## 🚀 Prossimi Passi Consigliati

### Sicurezza

- [ ] Implementare autenticazione lato server
- [ ] Configurare HTTPS sul server domotico
- [ ] Aggiungere Two-Factor Authentication
- [ ] Implementare IP whitelisting
- [ ] Configurare VPN per accesso remoto

### Funzionalità

- [ ] Aggiungere stato dei dispositivi (acceso/spento)
- [ ] Implementare timer programmabili
- [ ] Aggiungere notifiche push
- [ ] Storico azioni utente
- [ ] Dashboard con statistiche

### User Experience

- [ ] Temi personalizzabili (chiaro/scuro)
- [ ] Supporto multilingua
- [ ] Widget per screen principale
- [ ] Scorciatoie Siri/Google Assistant
- [ ] Conferma azioni critiche

---

## 📞 Supporto

Per problemi o domande:

1. Controlla la console del browser (F12)
2. Verifica il log del service worker
3. Testa con \`enableLogging: true\` in CONFIG
4. Verifica connessione al server domotico

---

## 📝 Licenza

Questo progetto è per uso personale. Modifica e usa come preferisci.

---

## 🙏 Credits

Sviluppato con le best practice di:
- Progressive Web Apps (Google)
- OWASP Security Guidelines
- W3C Accessibility Standards
- MDN Web Docs

---

**Ultimo aggiornamento**: 2026-01-22
**Versione**: 2.0
