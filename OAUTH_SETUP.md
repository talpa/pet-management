# OAuth2 Autentizace - Návod na nastavení

Váš fullstack TypeScript projekt nyní podporuje přihlašování přes Google, Facebook a Microsoft. Zde je návod na kompletní nastavení.

## 🔧 Backend konfigurace

### 1. Environment proměnné

Zkopírujte `.env.example` do `.env` a vyplňte OAuth credentials:

```bash
cp .env.example .env
```

### 2. OAuth Provider nastavení

#### Google OAuth Setup
1. Jděte na [Google Cloud Console](https://console.cloud.google.com/)
2. Vytvořte nový projekt nebo vyberte existující
3. Aktivujte Google+ API
4. Vytvořte OAuth 2.0 credentials
5. Přidejte authorized redirect URI: `http://localhost:4444/api/auth/google/callback`
6. Zkopírujte Client ID a Client Secret do `.env`

#### Facebook OAuth Setup
1. Jděte na [Facebook Developers](https://developers.facebook.com/)
2. Vytvořte novou aplikaci
3. Přidejte Facebook Login product
4. Nastavte Valid OAuth Redirect URIs: `http://localhost:4444/api/auth/facebook/callback`
5. Zkopírujte App ID a App Secret do `.env`

#### Microsoft OAuth Setup
1. Jděte na [Azure Portal](https://portal.azure.com/)
2. Registrujte novou aplikaci v Azure AD
3. Přidejte redirect URI: `http://localhost:5000/api/auth/microsoft/callback`
4. Vytvořte client secret
5. Zkopírujte Application ID a Client Secret do `.env`

### 3. Databázové změny

OAuth fields byly přidány do User modelu:
- `provider` - typ OAuth providera (google, facebook, microsoft, local)
- `providerId` - ID uživatele u OAuth providera
- `avatar` - URL avataru z OAuth providera
- `refreshToken` - refresh token pro OAuth

## 🎨 Frontend komponenty

### Nové komponenty:
- `Login.tsx` - Přihlašovací stránka s OAuth tlačítky
- `ProtectedRoute.tsx` - Wrapper pro chráněné stránky
- `UserMenu.tsx` - Menu s informacemi o přihlášeném uživateli

### Redux Auth State:
- `authSlice.ts` - Správa autentizačního stavu
- Automatické ověření tokenu při startu
- Logout funkčnost

## 🚀 Jak to funguje

### OAuth Flow:
1. Uživatel klikne na OAuth tlačítko (Google/Facebook/Microsoft)
2. Přesměrování na OAuth provider
3. Po úspěšném přihlášení návrat na `/api/auth/{provider}/callback`
4. Backend vytvoří/aktualizuje uživatele a vygeneruje JWT token
5. Přesměrování na frontend s úspěšným stavem
6. Frontend ověří token a přihlásí uživatele

### JWT Token:
- Ukládá se v HTTP-only cookie
- Platnost 7 dní (konfigurovatelné)
- Obsahuje základní informace o uživateli

### Backward Compatibility:
- Stále podporuje původní `x-user-id` header
- Postupný přechod na JWT autentizaci

## 🔒 Security Features

- CORS nakonfigurován pouze pro frontend domain
- HTTP-only cookies pro tokeny
- Session management s Passport.js
- Validace tokenů na každém requestu
- Secure cookies v production

## 🧪 Testování

1. Spusťte aplikaci: `docker-compose up --build`
2. Otevřete `http://localhost:3300`
3. Klikněte na "Přihlásit se"
4. Vyberte OAuth providera
5. Dokončete přihlášení
6. Ověřte přesměrování zpět do aplikace

## 📝 Poznámky

- Pro production je potřeba nastavit správné redirect URIs u providerů
- Změňte `SESSION_SECRET` a `JWT_SECRET` v production
- Nastavte `NODE_ENV=production` pro production build
- HTTPS je doporučeno pro production

## 🔧 Možná rozšíření

- Přidání dalších OAuth providerů (GitHub, LinkedIn)
- Two-factor authentication
- Account linking (spojení více OAuth účtů)
- Role-based access control rozšíření
- Email verification pro lokální účty