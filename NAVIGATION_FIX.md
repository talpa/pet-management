# Oprava navigace po přihlášení

## Problém
Po úspěšném přihlášení nebo registraci se aplikace snažila přesměrovat na `/dashboard`, která ale neexistuje v routing konfiguraci.

## Řešení
Upravena navigace v `frontend/src/components/ClassicLogin.tsx`:

```typescript
// PŘED:
if (isAuthenticated) {
  navigate('/dashboard');
}

// PO:
if (isAuthenticated) {
  navigate('/');
}
```

## Dopad změny

### 🎯 Po přihlášení/registraci:
- **PŘED**: Uživatel byl přesměrován na `/dashboard` (neexistující route)
- **PO**: Uživatel je přesměrován na `/` (PublicHomePage)

### 📍 Routing struktura:
- `/` - Veřejná domovská stránka (`PublicHomePage`)
- `/login` - Přihlašovací stránka
- `/admin` - Admin dashboard (pro administrátory) 
- `/my-animals` - Moje zvířata (pro přihlášené uživatele)
- `/profile` - Profil uživatele

### ✅ Ověření:
1. Backend již správně redirectuje OAuth na root URL
2. Žádné další odkazy na `/dashboard` v kódu
3. Routing správně definován v `App.tsx`

## Test
1. Otevřete http://localhost:8080
2. Přihlaste se přes formulář nebo OAuth
3. Měli byste být přesměrováni na domovskou stránku (`/`)

**Status**: ✅ Opraveno a připraveno k testování