# 🚀 Database Deployment Guide

## Nastavení externí databáze pro Pet Management System

### Option 1: Vercel Postgres (DOPORUČENÉ)

#### 1. Vytvořte Vercel Postgres databázi
```bash
# V Vercel Dashboard
1. Jděte do Storage > Create Database
2. Vyberte Postgres
3. Pojmenujte: pet-management-db
4. Vyberte region: Washington D.C.
5. Klikněte Create
```

#### 2. Získejte connection string
```bash
# V Vercel Database Dashboard
1. Zkopírujte POSTGRES_URL
2. Přidejte do Environment Variables vašeho Vercel projektu
```

#### 3. Spusťte migrations
```bash
# Připojte se k databázi a spusťte:
psql "your-postgres-url-here"

# Spusťte migration soubory
\i migrations/001_create_tables.sql
\i migrations/002_insert_data.sql
```

### Option 2: Neon Database

#### 1. Vytvořte účet na neon.tech
```bash
1. Registrace na https://neon.tech
2. Create project: pet-management
3. Region: US East (Ohio)
4. Postgres version: 15
```

#### 2. Získejte connection string
```bash
# Z Neon Dashboard
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
```

#### 3. Spusťte migrations
```bash
# Použijte psql nebo Neon SQL Editor
# Importujte migrations/001_create_tables.sql
# Importujte migrations/002_insert_data.sql
```

### Option 3: Supabase

#### 1. Vytvořte projekt na supabase.com
```bash
1. Create new project
2. Name: pet-management
3. Database password: [silné heslo]
4. Region: West US
```

#### 2. Získejte connection string
```bash
# Z Project Settings > Database
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

### Option 4: Railway

#### 1. Deploy na Railway
```bash
1. Připojte GitHub repo
2. Add PostgreSQL service
3. Získejte DATABASE_URL z variables
```

## Environment Variables pro Vercel

Přidejte tyto proměnné do Vercel Project Settings:

```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
NODE_ENV=production
JWT_SECRET=your-jwt-secret-here
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

## Aktualizace API Handleru

Po nastavení databáze aktualizujte `api/handler.js`:

```javascript
// Přidejte databázové operace
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Přidejte API endpoints pro databázové operace
app.get('/api/animals', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM animals WHERE is_public = true');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Testování připojení

```bash
# Test connection
curl https://your-vercel-app.vercel.app/api/health
curl https://your-vercel-app.vercel.app/api/animals
```

## Migrace dat z lokální databáze

```bash
# Export dat z Docker databáze
docker exec fullstack_postgres pg_dump -U postgres -d fullstack_db --data-only --inserts > export-data.sql

# Import do externí databáze
psql "external-database-url" < export-data.sql
```

## Monitoring a zálohy

- **Vercel Postgres**: Automatické zálohy
- **Neon**: Branch-based development
- **Supabase**: Real-time monitoring
- **Railway**: Automated backups

## Bezpečnost

1. Používejte connection pooling
2. Nastavte SSL connections
3. Omezte database přístup pouze z Vercel
4. Pravidelně rotujte database credentials
5. Monitorujte database logs

## Ceny (přibližné)

- **Vercel Postgres**: $20/měsíc (Pro plan)
- **Neon**: Free tier + $19/měsíc
- **Supabase**: Free tier + $25/měsíc
- **Railway**: $5/měsíc + usage