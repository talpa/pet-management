# 🚀 Vercel Deployment se souvislou databází

## Problém s databází na Vercelu

Vercel podporuje pouze **serverless functions**, což znamená:
- ❌ Nelze spustit PostgreSQL databázi přímo na Vercelu
- ❌ Backend Docker kontejnery nejsou podporovány  
- ✅ **Řešení**: Externí spravovaná databáze

## 🎯 Doporučené řešení

### 1. Externí databáze + Vercel frontend

**Co deployujeme na Vercel:**
- ✅ React frontend (optimalizované statické soubory)
- ✅ Minimální API endpoints (serverless functions)
- ✅ Připojení k externí PostgreSQL databázi

**Co zůstává lokálně/na jiném serveru:**
- 🐳 Plný backend s Docker Compose (pro development)
- 🐳 Kompletní API funkcionalita
- 🐳 Databáze s plnou kontrolou

## 📋 Kroky pro deployment s databází

### Krok 1: Vytvořte externí databázi

**Doporučené služby:**
- **Neon** (Free tier) - https://neon.tech
- **Supabase** (Free tier) - https://supabase.com  
- **Vercel Postgres** ($20/měsíc)
- **Railway** ($5/měsíc)

### Krok 2: Spusťte database migrations

```sql
-- Spusťte v externí databázi
\i migrations/001_create_tables.sql
\i migrations/002_insert_data.sql
```

### Krok 3: Nastavte environment variables ve Vercelu

```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
NODE_ENV=production
```

### Krok 4: Aktivujte plnou API funkcionalita

```bash
# Nahraďte handler pro databázové operace
cp api/handler-with-db.js api/handler.js
```

### Krok 5: Deploy na Vercel

```bash
npm install -g vercel
vercel --prod
```

## 🔄 Hybrid setup (DOPORUČENO pro development)

### Lokální development:
```bash
# Plná funkcionalita s Docker
docker-compose up -d
# Frontend: http://localhost:8080  
# Backend API: http://localhost:4444
# Database: localhost:5432
```

### Produkční demo:
```bash  
# Statický frontend + externí DB
# Frontend: https://your-app.vercel.app
# API: https://your-app.vercel.app/api/*
# Database: Externí služba
```

## 📊 Porovnání řešení

| Řešení | Frontend | Backend | Databáze | Náklady | Složitost |
|--------|----------|---------|----------|---------|-----------|
| **Docker (současné)** | ✅ | ✅ | ✅ | 🆓 | 🟢 Nízká |
| **Vercel + Externí DB** | ✅ | ⚠️ Omezené | ✅ | 💰 $5-20/měsíc | 🟡 Střední |
| **Vercel Full** | ✅ | ✅ | ✅ | 💰💰 $50+/měsíc | 🔴 Vysoká |

## 🎮 Rychlé spuštění

### Pro okamžité demo na Vercelu:
```bash
# 1. Spusťte setup script
./setup-deployment.ps1

# 2. Deploy základní verzi (bez databáze)
vercel --prod
```

### Pro plnou funkcionalitu:
```bash
# 1. Vytvořte externí databázi (Neon/Supabase)
# 2. Spusťte migrations
# 3. Nastavte DATABASE_URL
# 4. Aktivujte databázové API
cp api/handler-with-db.js api/handler.js
# 5. Redeploy
vercel --prod
```

## ✅ Co funguje na Vercelu

**Bez databáze:**
- ✅ React frontend 
- ✅ Základní API endpoints (/health, /test)
- ✅ Rychlé načítání

**S externí databází:**  
- ✅ Všechno výše +
- ✅ Seznam zvířat (/api/animals)
- ✅ Druhy a štítky (/api/species, /api/tags)
- ✅ Statistiky (/api/statistics)
- ✅ SEO URL podpory (/api/animals/seo/:url)

## 🔧 Troubleshooting

**Problém:** API endpoints vracejí 503
**Řešení:** Zkontrolujte DATABASE_URL v Vercel environment variables

**Problém:** Databáze connection timeout  
**Řešení:** Povolte SSL: `?sslmode=require` v connection stringu

**Problém:** Vercel build fails
**Řešení:** Zkontrolujte že `api/package.json` má `pg` dependency

## 📝 Další kroky

1. **Ihned použitelné**: Deploy současné verze na Vercel (frontend only)
2. **Krátkodobě**: Přidat externí databázi (Neon free tier) 
3. **Dlouhodobě**: Rozhodnout mezi Vercel nebo dedikovaným serverem

Současný Docker setup zůstává **plně funkční** pro lokální development! 🐳