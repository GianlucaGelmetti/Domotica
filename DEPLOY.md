# 🚀 Guida Deploy - Domotica Casa Lazise

## Opzione 1: Netlify Drop (2 minuti - Più Facile)

1. **Comprimi i file necessari**:
   - Crea una cartella con questi file:
     - index.html
     - styles.css
     - app.js
     - manifest.json
     - service-worker.js
     - images/ (cartella)

2. **Upload su Netlify**:
   - Vai su: https://app.netlify.com/drop
   - Trascina la cartella nella pagina
   - Ottieni subito il link tipo: `https://random-name-12345.netlify.app`
   - **FATTO!** ✅

3. **Link permanente** (opzionale):
   - Crea account gratuito su Netlify
   - Cambia il nome del sito in qualcosa di memorabile

---

## Opzione 2: GitHub Pages (5 minuti)

1. **Vai su GitHub**:
   - Apri il repository: https://github.com/GianlucaGelmetti/Domotica

2. **Abilita Pages**:
   - Click su "Settings"
   - Nel menu laterale, click su "Pages"
   - Source: "Deploy from a branch"
   - Branch: seleziona `claude/review-smart-home-app-9iIBL`
   - Folder: `/ (root)`
   - Click "Save"

3. **Attendi 1-2 minuti**:
   - GitHub costruirà il sito
   - Link sarà: `https://gianlucagelmetti.github.io/Domotica/`

---

## Opzione 3: Vercel (3 minuti)

1. **Vai su Vercel**:
   - https://vercel.com/new

2. **Import dal GitHub**:
   - Click "Import Git Repository"
   - Seleziona il repository "Domotica"
   - Click "Deploy"

3. **Link**:
   - Ottieni subito: `https://domotica-xyz.vercel.app`

---

## Opzione 4: Surge.sh (Via Terminale)

Se hai accesso al terminale:

```bash
# Dalla cartella del progetto
npx surge .

# Segui le istruzioni:
# - Email: (inserisci una email)
# - Password: (crea una password)
# - Domain: (premi INVIO per accettare il suggerito)
```

Link: `https://random-name.surge.sh`

---

## 📝 Dopo il Deploy

Dopo aver pubblicato, ricordati di:

1. **Testare l'app** sul link pubblico
2. **Verificare che i comandi funzionino**
3. **Aggiornare app.js se necessario** (se l'URL è cambiato)

---

## 🔐 Sicurezza

⚠️ **IMPORTANTE**: Il tuo server domotico è accessibile su HTTP pubblico.

Prima di usare in produzione:
- Configura HTTPS seguendo `README.md`
- Usa un reverse proxy (vedi `nginx.conf.example`)
- Considera VPN per accesso remoto

---

## 🆘 Problemi?

**Service Worker non si aggiorna?**
- Premi `Ctrl+Shift+R` (hard refresh)
- Oppure: DevTools > Application > Service Workers > "Unregister"

**Comandi non funzionano?**
- Verifica che il server sia raggiungibile da internet
- Controlla la console del browser (F12)

**CSS/JS non caricano?**
- Controlla che tutti i file siano nella stessa cartella
- Verifica i percorsi relativi (non devono iniziare con `/`)
