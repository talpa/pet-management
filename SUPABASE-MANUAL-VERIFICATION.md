# 🔍 Manuální ověření Supabase importu

## Problém s automatickým testem

Pokud automatické skripty selhávají kvůli síťovým problémům nebo konfiguraci firewallu, 
ověřte import manuálně přes Supabase Dashboard.

## ✅ Krok za krokem ověření

### 1. Otevřete Supabase Dashboard
- Jděte na https://app.supabase.com
- Vyberte váš projekt `pet-management`

### 2. Zkontrolujte tabulky
V **Table Editor** byste měli vidět tyto tabulky:

#### Tabulky s daty:
- ✅ **animal_species** - 7 záznamů (Pes, Kočka, Králík, Chomík, Morče, Papoušek, Kanárek)
- ✅ **animal_tags** - 8 záznamů (Přátelský, Hravý, Klidný, Energický, Chytrý, Společenský, Nezávislý, Učenlivý)
- ✅ **permissions** - 12 záznamů (read_own_animals, write_own_animals, etc.)
- ✅ **user_groups** - 4 záznamy (Administrátoři, Moderátoři, Registrovaní uživatelé, Hosté)
- ✅ **animals** - 3 záznamy (Rex, Míca, Bobík)
- ✅ **group_permissions** - Přiřazení oprávnění skupinám

#### Prázdné tabulky (OK):
- ⚪ **users** - prázdná (uživatelé se registrují přes OAuth)
- ⚪ **animal_images** - prázdná (obrázky se nahrávají přes API)
- ⚪ **user_permissions** - prázdná (individuální oprávnění)
- ⚪ **audit_logs** - prázdná (logy aktivit)
- ⚪ **statistics** - prázdná (agregované statistiky)

### 3. Test SQL dotazů
V **SQL Editor** spusťte tyto dotazy:

```sql
-- Test 1: Počty záznamů
SELECT 
  'animal_species' as table_name, COUNT(*) as count FROM animal_species
UNION ALL
SELECT 'animal_tags', COUNT(*) FROM animal_tags
UNION ALL  
SELECT 'permissions', COUNT(*) FROM permissions
UNION ALL
SELECT 'user_groups', COUNT(*) FROM user_groups
UNION ALL
SELECT 'animals', COUNT(*) FROM animals;
```

**Očekávaný výsledek:**
```
animal_species | 7
animal_tags    | 8  
permissions    | 12
user_groups    | 4
animals        | 3
```

```sql
-- Test 2: Ukázková data
SELECT name, description FROM animal_species ORDER BY name;
```

**Očekávaný výsledek:**
```
Chomík    | Zlatý chomík (Mesocricetus auratus)
Kanárek   | Domácí kanárek (Serinus canaria)  
Kočka     | Domácí kočka (Felis catus)
Králík    | Domácí králík (Oryctolagus cuniculus)
Morče     | Domácí morče (Cavia porcellus)
Papoušek  | Různé druhy papoušků
Pes       | Domácí pes (Canis lupus familiaris)
```

```sql
-- Test 3: Zvířata s druhy
SELECT a.name, a.description, s.name as species 
FROM animals a 
JOIN animal_species s ON a.species_id = s.id;
```

**Očekávaný výsledek:**
```
Rex   | Přátelský zlatý retrívr | Pes
Míca  | Krásná perská kočka     | Kočka  
Bobík | Malý bílý králíček      | Králík
```

### 4. Konfigurace RLS (Row Level Security)
Spusťte v **SQL Editor**:

```sql
-- Vypnutí RLS pro veřejné API
ALTER TABLE animals DISABLE ROW LEVEL SECURITY;
ALTER TABLE animal_species DISABLE ROW LEVEL SECURITY;
ALTER TABLE animal_tags DISABLE ROW LEVEL SECURITY;

-- Kontrola RLS statusu
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**Očekávaný výsledek:** `rowsecurity = false` pro main tabulky

## 🚀 Aktivace API po úspěšném ověření

### 1. Zkopírujte connection string
V **Settings** > **Database** zkopírujte **Connection string**

### 2. Lokálně aktivujte databázové API
```bash
# Aktivujte plnou API
cp api/handler-with-db.js api/handler.js

# Commitujte
git add . && git commit -m "Activate Supabase database API"
git push
```

### 3. Nastavte Vercel environment
**Vercel Dashboard** > **Settings** > **Environment Variables**:
- Name: `DATABASE_URL`  
- Value: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`

### 4. Redeploy
```bash
vercel --prod
```

## 🔧 Test produkční API

Po deployment testujte:
```bash
curl https://your-app.vercel.app/api/health
curl https://your-app.vercel.app/api/animals  
curl https://your-app.vercel.app/api/species
```

## ✅ Očekávané odpovědi

### /api/health
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-11-03T...",
  "environment": "production"
}
```

### /api/animals
```json
{
  "animals": [
    {
      "id": 1,
      "name": "Rex", 
      "description": "Přátelský zlatý retrívr",
      "species_name": "Pes",
      "is_public": true,
      "seo_url": "rex-zlaty-retrivr"
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 10, 
    "total": 3,
    "pages": 1
  }
}
```

### /api/species
```json
[
  {"id": 1, "name": "Pes", "description": "Domácí pes..."},
  {"id": 2, "name": "Kočka", "description": "Domácí kočka..."},
  ...
]
```

## 🎉 Potvrzení úspěchu

Pokud všechny testy projdou, máte **plně funkční produkční aplikaci** s:
- ✅ React frontend na Vercelu
- ✅ Serverless API s databází
- ✅ PostgreSQL na Supabase 
- ✅ Ukázková data připravená