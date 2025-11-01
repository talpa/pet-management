# 🔐 Kompletní návod na nastavení OAuth2 (Google + Facebook)

## 📋 Současný stav portů a URL

### Produkční porty (Docker):
- **Frontend**: http://localhost:8080 (port 8080 → container 3000)
- **Backend**: http://localhost:4444 (port 4444 → container 4444)
- **Database**: localhost:5432

### Development porty (npm start):
- **Frontend**: http://localhost:3000 (přímý npm start)
- **Backend**: http://localhost:4444 (přímý npm start)

## 🔧 1. Backend konfigurace je již nastavena

### Současný .env template:
```bash
CLIENT_URL=http://localhost:8080  # Správně nakonfigurováno pro Docker
CORS_ORIGIN=http://localhost:8080
PORT=4444
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

## 🌍 2. Google Cloud Console - Ověření nastavení

### Aktuální nastavení by mělo být:

1. **Authorized JavaScript origins:**
   ```
   http://localhost:8080
   http://localhost:3000
   http://localhost:4444
   ```

2. **Authorized redirect URIs:**
   ```
   http://localhost:4444/api/auth/google/callback
   ```

### Postup nastavení Google OAuth:

1. **Jděte na [Google Cloud Console](https://console.cloud.google.com/)**
2. **Vyberte váš projekt s Client ID: 501401955633...**
3. **APIs & Services → Credentials → Váš OAuth 2.0 Client**
4. **Ověřte Authorized redirect URIs:**
   - ✅ `http://localhost:4444/api/auth/google/callback`
5. **Ověřte Authorized JavaScript origins:**
   - ✅ `http://localhost:8080` (pro Docker frontend)
   - ✅ `http://localhost:3000` (pro development frontend)

## 📘 3. Facebook Developers - Ověření nastavení

### Aktuální Facebook App ID: 1399356702198931

1. **Jděte na [Facebook Developers](https://developers.facebook.com/)**
2. **Vyberte aplikaci s ID: 1399356702198931**
3. **Facebook Login → Settings**
4. **Ověřte Valid OAuth Redirect URIs:**
   - ✅ `http://localhost:4444/api/auth/facebook/callback`

### Pokud aplikace neexistuje, vytvořte novou:

1. **Create App → Consumer**
2. **Add Product → Facebook Login**
3. **Client OAuth Settings:**
   ```
   Valid OAuth Redirect URIs:
   http://localhost:4444/api/auth/facebook/callback
   ```
4. **App Review → Make app public (pro produkci)**

## 🚀 4. Testování OAuth flow

### Spuštění aplikace:

```bash
# V kořenovém adresáři projektu
docker-compose up --build

# Nebo pokud už běží:
docker-compose restart backend frontend
```

### Test URLs:

1. **Frontend aplikace:** http://localhost:8080
2. **Backend API:** http://localhost:4444/api
3. **Google OAuth test:** http://localhost:4444/api/auth/google
4. **Facebook OAuth test:** http://localhost:4444/api/auth/facebook

### Postup testování:

1. ✅ Otevřete http://localhost:8080
2. ✅ Klikněte na "Přihlásit se"
3. ✅ Zkuste Google nebo Facebook login
4. ✅ Měl by se otevřít popup s OAuth providery
5. ✅ Po přihlášení by se popup měl zavřít a vy byste měli být přihlášeni

## 🔍 5. Debugging OAuth problémů

### Zkontrolujte browser console:
```javascript
// Otevřete Developer Tools (F12)
// Console tab - měli byste vidět:
"🚀 Starting OAuth login for google/facebook"
"📱 Popup opened"
"✅ OAuth success message received"
```

### Zkontrolujte Network tab:
1. **OAuth request:** `GET /api/auth/google` → Status 302 (redirect)
2. **Callback:** `GET /api/auth/google/callback` → Status 200 (HTML response)

### Common issues a řešení:

**1. Popup se nezavírá:**
- Zkontrolujte CORS_ORIGIN v .env
- Ověřte, že CLIENT_URL je http://localhost:8080

**2. "OAuth Error" v console:**
- Zkontrolujte Google/Facebook credentials
- Ověřte redirect URIs v OAuth providers

**3. "Popup blocked":**
- Povolte popups pro localhost:8080
- Nebo použijte redirect místo popup

## 🔧 6. Troubleshooting příkazy

### Restartování services:
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Zobrazení logů:
```bash
docker-compose logs backend -f
docker-compose logs frontend -f
```

### Test OAuth endpointů:
```bash
# Test Google OAuth (očekává redirect)
curl -I http://localhost:4444/api/auth/google

# Test API dostupnosti
curl http://localhost:4444/api/health
```

## ✅ 7. Validace úspěšného nastavení

### Checklist:
- [ ] Docker kontejnery běží (docker-compose ps)
- [ ] Frontend dostupný na http://localhost:8080
- [ ] Backend API dostupný na http://localhost:4444/api
- [ ] Google Console má správné redirect URIs
- [ ] Facebook App má správné redirect URIs
- [ ] OAuth popup se otevírá a zavírá
- [ ] Po přihlášení jste přesměrováni na hlavní stránku

### Úspěšný OAuth flow znamená:
1. ✅ Popup se otevře s Google/Facebook login
2. ✅ Po přihlášení se popup zavře
3. ✅ Jste přihlášeni v aplikaci
4. ✅ V pravém horním rohu vidíte své jméno/avatar

## 📞 Pokud stále nefunguje:

1. **Zkontrolujte browser konzoli** pro chyby
2. **Zkontrolujte docker logy** `docker-compose logs backend`
3. **Ověřte porty** `netstat -an | grep 8080`
4. **Test v incognito režimu** pro vyloučení cache problémů

Váš současný setup vypadá správně nakonfigurovaný! 🎉