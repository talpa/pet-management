# 🚀 Vercel Deployment Guide

Kompletní návod pro nasazení Pet Management aplikace na **Vercel** - zcela zdarma!

## 🆓 Vercel Free Tier

### Co dostanete zdarma:
- **100GB bandwidth/měsíc**
- **Unlimited static sites**
- **Serverless functions**
- **Custom domains**
- **Automatic SSL**
- **Deploy preview pro každý commit**

## 📋 Požadavky

### 1. Databáze (externí)
Vercel nenabízí databázi, doporučuji:

**🥇 Supabase (ZDARMA)**:
- PostgreSQL databáze zdarma
- 500MB storage
- 50MB file uploads
- Real-time subscriptions
- Registrace: https://supabase.com

**🥈 PlanetScale (ZDARMA)**:
- MySQL databáze
- 1GB storage
- 1 milion reads/měsíc
- Registrace: https://planetscale.com

**🥉 Railway PostgreSQL**:
- $5 kredit/měsíc zdarma
- PostgreSQL included

## 🛠 Setup Process

### Krok 1: Příprava projektu

Ujistěte se, že máte tyto soubory (již vytvořeny):
```
├── vercel.json              # Vercel konfigurace
├── .env.vercel             # Environment variables template
├── backend/api/index.ts    # Serverless wrapper
└── build-frontend.sh       # Frontend build script
```

### Krok 2: Setup databáze

#### Option A: Supabase
1. Jděte na https://supabase.com a vytvořte účet
2. Vytvořte nový projekt
3. V Settings → Database získejte connection string:
```
postgresql://postgres:[password]@[host]:5432/postgres
```

#### Option B: PlanetScale 
1. Registrace na https://planetscale.com
2. Vytvořte databázi
3. Získejte connection string:
```
mysql://[username]:[password]@[host]/[database]?sslaccept=strict
```

### Krok 3: Deploy na Vercel

#### Způsob A: GitHub Integration (doporučeno)
1. Push váš kód na GitHub
2. Jděte na https://vercel.com
3. Klikněte "Import Project"
4. Vyberte váš GitHub repository
5. Vercel automaticky detekuje konfiguraci

#### Způsob B: Vercel CLI
```bash
# Instalace Vercel CLI
npm i -g vercel

# Deploy
vercel

# Následujte instrukce v terminálu
```

### Krok 4: Environment Variables

V Vercel dashboard nastavte tyto proměnné:

```bash
# Databáze
DATABASE_URL=postgresql://user:pass@host:5432/db

# JWT
JWT_SECRET=your-super-secret-jwt-key-generate-new-one

# OAuth2 - Google
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret

# OAuth2 - Facebook
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# URLs (upravte na vaši Vercel doménu)
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://your-app.vercel.app/api

# Production
NODE_ENV=production
```

### Krok 5: Aktualizace OAuth2 redirect URLs

#### Google OAuth2:
1. Google Cloud Console → APIs & Services → Credentials
2. Upravte OAuth2 client
3. Authorized redirect URIs:
```
https://your-app.vercel.app/auth/google/callback
```

#### Facebook OAuth2:
1. Facebook for Developers → Your App → Facebook Login
2. Valid OAuth Redirect URIs:
```
https://your-app.vercel.app/auth/facebook/callback
```

## 🔧 Automatické nasazení

Po nastavení se každý push do main větve automaticky nasadí:

```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main

# Vercel automaticky:
# 1. Stáhne změny
# 2. Sestaví frontend
# 3. Deploy serverless functions
# 4. Aktualizuje live site
```

## 📊 Monitoring

### Vercel Dashboard:
- **Functions**: Monitoring serverless funkcí
- **Analytics**: Traffic a performance
- **Deployments**: Historie všech deploymentů

### Logs:
```bash
# Real-time logs
vercel logs your-app.vercel.app

# Function logs
vercel logs your-app.vercel.app/api
```

## 🚨 Troubleshooting

### Problem: Function timeout
```javascript
// V vercel.json zvyšte timeout
{
  "functions": {
    "backend/api/index.ts": {
      "maxDuration": 30
    }
  }
}
```

### Problem: Environment variables
```bash
# Verify v Vercel dashboard
vercel env ls

# Pull env do local
vercel env pull .env.local
```

### Problem: Database connection
```bash
# Test connection
vercel logs your-app.vercel.app/api/health
```

### Problem: CORS errors
- Zkontrolujte CORS headers v `backend/api/index.ts`
- Ujistěte se, že FRONTEND_URL je správně nastaveno

## 🎯 Custom Domain (volitelně)

1. V Vercel dashboard → Settings → Domains
2. Přidejte vaši doménu
3. Nakonfigurujte DNS záznamy u vašeho poskytovatele
4. Vercel automaticky vygeneruje SSL certifikát

## 💰 Náklady

### Vercel Free Tier pokryje:
- ✅ Personal projekty
- ✅ Demo aplikace
- ✅ Malé business aplikace
- ✅ Až 100GB traffic/měsíc

### Platba pouze při překročení:
- $20/měsíc za Pro tier
- Extra bandwidth: $40/TB

## 📈 Výhody Vercel

- **⚡ Bleskově rychlé**: Global CDN
- **🔄 Zero downtime deployments**: Atomic deployments
- **📊 Built-in analytics**: Performance monitoring  
- **🔧 Git integration**: Auto-deploy z GitHub
- **🌐 Edge functions**: Serverless na okraji sítě
- **📱 Preview deployments**: Náhled každé větve

**🎉 Hotovo! Vaše Pet Management aplikace poběží na Vercel zdarma s profesionální infrastrukturou!**

URL: `https://your-app.vercel.app`