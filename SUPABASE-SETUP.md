# 🐾 Supabase Setup Guide pro Pet Management System

## Krok 1: Vytvořte Supabase účet a projekt

1. **Jděte na https://supabase.com**
2. **Sign up** pomocí GitHub účtu (doporučeno)
3. **Create a new project:**
   - Project name: `pet-management`
   - Database password: Vygenerujte silné heslo (uložte si ho!)
   - Region: `West US (Oregon)` nebo `Central US (Iowa)`
   - Pricing plan: `Free tier` (500MB storage, 2GB bandwidth)

## Krok 2: Získejte connection details

Po vytvoření projektu:
1. Jděte do **Settings** > **Database**
2. Zkopírujte **Connection string**:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## Krok 3: Spusťte migrations v Supabase

### Možnost A: SQL Editor (DOPORUČENO)
1. V Supabase dashboard jděte do **SQL Editor**
2. Vytvořte nový query
3. Zkopírujte a spusťte obsah `migrations/001_create_tables.sql`
4. Zkopírujte a spusťte obsah `migrations/002_insert_data.sql`

### Možnost B: psql command line
```bash
# Nastavte environment variable
$env:DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Spusťte migrations
psql $env:DATABASE_URL -f migrations/001_create_tables.sql
psql $env:DATABASE_URL -f migrations/002_insert_data.sql
```

## Krok 4: Ověřte import

V Supabase **Table Editor** byste měli vidět:
- ✅ animals (3 ukázkové záznamy)
- ✅ animal_species (7 druhů)
- ✅ animal_tags (8 štítků) 
- ✅ permissions (12 oprávnění)
- ✅ user_groups (4 skupiny)
- ✅ všechny ostatní tabulky

## Krok 5: Konfigurace pro Vercel

1. **V Vercel Dashboard:**
   - Jděte do vašeho projektu
   - Settings > Environment Variables
   - Přidejte: `DATABASE_URL` s Supabase connection string

2. **Aktivujte plnou API:**
   ```bash
   # Lokálně v projektové složce
   cp api/handler-with-db.js api/handler.js
   git add . && git commit -m "Activate full database API for Supabase"
   git push
   ```

3. **Redeploy na Vercel:**
   ```bash
   vercel --prod
   ```

## Krok 6: Testování

Po deployment testujte endpoints:
```bash
# Health check s databází
curl https://your-app.vercel.app/api/health

# Seznam zvířat
curl https://your-app.vercel.app/api/animals

# Statistiky  
curl https://your-app.vercel.app/api/statistics
```

## 🔧 Supabase specifické nastavení

### RLS (Row Level Security)
Supabase má automaticky zapnuté RLS. Pro veřejné API jej dočasně vypněte:

```sql
-- V Supabase SQL Editor spusťte:
ALTER TABLE animals DISABLE ROW LEVEL SECURITY;
ALTER TABLE animal_species DISABLE ROW LEVEL SECURITY;
ALTER TABLE animal_tags DISABLE ROW LEVEL SECURITY;
-- Opakujte pro všechny tabulky které API používá
```

### Connection Pool
Supabase má vestavěný connection pooling, takže náš `pg.Pool` bude fungovat perfektně.

### SSL
Supabase automaticky používá SSL, náš handler má správně nastavenou SSL konfiguraci.

## 🎉 Výsledek

Po dokončení budete mít:
- ✅ React frontend na Vercelu
- ✅ Plně funkční API s databází
- ✅ PostgreSQL databázi na Supabase
- ✅ Všechny ukázkové data importované
- ✅ Real-time monitoring v Supabase dashboard

## 💡 Supabase výhody

- 🆓 **Free tier**: 500MB storage, 2GB bandwidth
- 🔄 **Real-time**: Automatické WebSocket API
- 🛡️ **Security**: Built-in authentication a RLS
- 📊 **Dashboard**: Grafické rozhraní pro data
- 🔍 **Monitoring**: Query performance insights
- 🔌 **API**: Automatické REST API pro všechny tabulky

## 🔧 Troubleshooting

**Problém**: Migration fails s permission error
**Řešení**: Ujistěte se, že používáte `postgres` user a správné heslo

**Problém**: API vrací 503
**Řešení**: Zkontrolujte DATABASE_URL ve Vercel environment variables

**Problém**: RLS blokuje queries
**Řešení**: Dočasně vypněte RLS pro veřejné tabulky (viz výše)

## 📈 Monitoring

V Supabase dashboard můžete sledovat:
- Database usage (storage/bandwidth)
- Query performance
- Real-time connections
- API requests