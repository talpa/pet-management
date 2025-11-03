# 🛡️ Anti-Spam Protection Guide

## Přehled implementovaných funkcí

Aplikace nyní obsahuje kompletní anti-spam ochranu pro manuální registraci uživatelů:

### 🔒 Implementované bezpečnostní opatření

#### 1. **Rate Limiting** (Omezení frekvence)
- **Registrace**: Maximálně 3 pokusy za 15 minut
- **Přihlášení**: Maximálně 10 pokusů za 5 minut
- Blokuje automatizované útoky a nadměrné pokusy

#### 2. **CAPTCHA System** (Matematické ověření)
- Generuje matematické příklady (např. "5 + 3 = ?")
- Token-based validace s omezenou životností
- Automatické obnovení při chybách
- Uživatelsky přívětivé UI s možností obnovit

#### 3. **Honeypot Fields** (Skryté pasti)
- Neviditelná pole, která by měla zůstat prázdná
- Automatické odmítnutí, pokud jsou vyplněna boty
- Transparentní pro skutečné uživatele

#### 4. **Intelligent Spam Detection**
- **Disposable email blocking**: Blokuje dočasné a jednorázové e-maily
- **Suspicious pattern detection**: Detekuje podezřelé vzory v emailech a jménech
- **Comprehensive validation**: Pokročilá validace všech vstupních dat

### 📁 Implementované soubory

#### Backend Middleware:
- `backend/src/middleware/rateLimiter.ts` - Rate limiting systém
- `backend/src/middleware/spamProtection.ts` - Detekce spamu a validace
- `backend/src/middleware/captcha.ts` - CAPTCHA generování a validace

#### Frontend komponenty:
- `frontend/src/components/ClassicLogin.tsx` - Aktualizovaný s CAPTCHA UI
- `frontend/src/services/api.ts` - Rozšířeno o CAPTCHA endpoint

### 🚀 Jak to funguje

#### Pro uživatele:
1. **Normální registrace**: Vyplní jméno, email, heslo
2. **CAPTCHA ověření**: Vyřeší jednoduchý matematický příklad
3. **Submis formuláře**: Všechna data se odešlou najednou

#### Pro vývojáře:
```javascript
// Rate limiting automaticky blokuje nadměrné pokusy
app.use('/api/auth/register', registerRateLimit);

// Spam protection validuje všechna data
app.use('/api/auth/register', validateHoneypot, validateRegistrationData);

// CAPTCHA zajišťuje lidské ověření
app.use('/api/auth/register', validateCaptcha);
```

### 🧪 Testování

#### Test 1: Normální registrace
1. Otevřete http://localhost:3300
2. Přejděte na tab "Registrace"
3. Vyplňte validní údaje
4. Vyřešte CAPTCHA
5. Odešlete formulář

#### Test 2: Rate limiting
1. Pokuste se registrovat 3x rychle za sebou
2. Čtvrtý pokus by měl být blokován s hláškou o limitu

#### Test 3: Spam detekce
- Zkuste použít disposable email (např. `test@10minutemail.com`)
- Zkuste jméno s podezřelými znaky (např. `admin_bot_test`)

#### Test 4: CAPTCHA validace
- Zkuste odeslat formulář bez vyřešení CAPTCHA
- Zkuste zadat špatnou odpověď

### 🔧 Konfigurace

Rate limity lze upravit v `backend/src/middleware/rateLimiter.ts`:

```typescript
// Registrace: 3 pokusy za 15 minut
export const registerRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 3, // maximálně 3 pokusy
  message: 'Příliš mnoho pokusů o registraci. Zkuste to za 15 minut.'
});
```

### 📊 Monitorování

Všechny aktivity jsou logovány v audit tabulce s informacemi o:
- IP adresách
- User-Agent strings
- Časových razítkách
- Výsledcích validace

### ✅ Výhody implementace

1. **Multi-layer protection**: Kombinace různých ochranných mechanismů
2. **User-friendly**: Minimální dopad na uživatelský zážitek
3. **Configurable**: Snadno upravitelné limity a pravidla
4. **Auditable**: Kompletní logování pro analýzu
5. **Scalable**: Efektivní in-memory implementace

### 🚨 Důležité poznámky

- Anti-spam ochrana je aktivní pouze pro **manuální registraci**
- OAuth registrace (Google/Facebook) nejsou ovlivněny
- Systém je navržen tak, aby neobtěžoval legitimní uživatele
- Všechna data jsou validována jak na frontend, tak backend straně

## 🎯 Další možná vylepšení

1. **Redis integration**: Pro lepší škálování rate limitingu
2. **IP reputation**: Kontrola proti známým spam IP adresám
3. **Advanced CAPTCHA**: Implementace složitějších CAPTCHA typů
4. **ML detection**: Machine learning pro detekci spam vzorů
5. **Geographical filtering**: Omezení podle geografické polohy

---

✅ **Anti-spam ochrana je nyní plně implementována a funkční!**