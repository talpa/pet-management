# 🚀 SUPABASE QUICK START - Krok za krokem

## 📋 Příprava (5 minut)

### 1. Supabase projekt
1. Jděte na https://supabase.com
2. **Sign up** (ideálně přes GitHub)
3. **Create new project**:
   - Name: `pet-management`
   - Password: **Vygenerujte silné heslo a uložte!**
   - Region: `West US (Oregon)`
   - Plan: `Free`

### 2. Získejte connection string
1. V dashboardu: **Settings** → **Database**
2. Zkopírujte **Connection string**
3. Bude vypadat: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`

## 🔄 Import dat (10 minut)

### Možnost A: Automatický import (pokud máte psql)
```powershell
# Spusťte v PowerShell ve složce projektu
./supabase-import.ps1 -DatabaseUrl "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"

# Ověřte import
./supabase-verify.ps1 -DatabaseUrl "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
```

### Možnost B: Manuální import (doporučeno)
1. **Supabase dashboard** → **SQL Editor**
2. **Nový query** → Zkopírujte obsah `migrations/001_create_tables.sql` → **Run**
3. **Nový query** → Zkopírujte obsah `migrations/002_insert_data.sql` → **Run**
4. **Nový query** → Zkopírujte obsah `supabase-disable-rls.sql` → **Run**

### Ověření importu
V **Table Editor** byste měli vidět:
- ✅ `animals` (3 záznamy)
- ✅ `animal_species` (7 záznamy) 
- ✅ `animal_tags` (8 záznamů)
- ✅ `permissions` (12 záznamů)
- ✅ `user_groups` (4 záznamy)

## ⚡ Aktivace API (5 minut)

### 1. Lokálně v projektu
```bash
# Aktivujte plnou databázovou API
cp api/handler-with-db.js api/handler.js

# Commitujte změny
git add . && git commit -m "Activate Supabase database API"
git push
```

### 2. Vercel konfigurace
1. **Vercel Dashboard** → Váš projekt → **Settings** → **Environment Variables**
2. **Add new**:
   - Name: `DATABASE_URL`
   - Value: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`
3. **Save**

### 3. Redeploy
```bash
vercel --prod
```

## ✅ Testování (2 minuty)

Po deployment testujte:
```bash
# Zdraví API + databáze
curl https://your-app.vercel.app/api/health

# Seznam zvířat  
curl https://your-app.vercel.app/api/animals

# Druhy zvířat
curl https://your-app.vercel.app/api/species

# Statistiky
curl https://your-app.vercel.app/api/statistics
```

**Očekávané odpovědi:**
- `/health` → `{"status":"ok","database":"connected"}`
- `/animals` → Array s 3 ukázkovými zvířaty
- `/species` → Array s 7 druhy (Pes, Kočka, Králík...)
- `/statistics` → `{"totalAnimals":3,"totalSpecies":7,...}`

## 🎉 Hotovo!

Pokud všechny testy projdou, máte:
- ✅ **Frontend** na Vercelu
- ✅ **API** s plnou databázovou funkcionalitou  
- ✅ **PostgreSQL** databázi na Supabase
- ✅ **Ukázková data** připravená

## 🔧 Troubleshooting

**Problém:** API vrací 503 "Database not available"
**Řešení:** Zkontrolujte DATABASE_URL ve Vercel environment variables

**Problém:** RLS blokuje queries
**Řešení:** Spusťte `supabase-disable-rls.sql` v SQL Editoru

**Problém:** Import selhal
**Řešení:** Zkuste manuální import přes Supabase SQL Editor

## 📊 Monitoring

V Supabase dashboard sledujte:
- **Database** → Query performance
- **API** → Request logs  
- **Settings** → Usage (storage/bandwidth)

**Free tier limity:**
- 500 MB storage
- 2 GB bandwidth/měsíc
- 50,000 monthly active users

## 🚀 Další kroky

1. **Konfigurace:** Nastavte OAuth (Facebook/Google)
2. **Rozšíření:** Přidejte více funkcí do API
3. **Monitoring:** Nastavte alerty pro limity
4. **Zálohy:** Pravidelný export dat
5. **Škálování:** Upgrade na Pro plan při růstu

---

**⚡ Celkový čas setup: ~22 minut**
**💰 Náklady: FREE (Supabase free tier)**
**🎯 Výsledek: Plně funkční produkční aplikace!**