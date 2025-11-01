# 🚀 Vercel Deployment Checklist

## ✅ Pre-deployment Checklist

### 1. Projekt připraven
- [ ] Git repository na GitHubu
- [ ] `vercel.json` konfigurace vytvořena
- [ ] Serverless wrapper `backend/api/index.ts` připraven
- [ ] Frontend build optimalizován

### 2. Databáze setup
- [ ] Supabase/PlanetScale účet vytvořen
- [ ] Databáze vytvořena
- [ ] Connection string získán

### 3. OAuth2 providers
- [ ] Google OAuth2 credentials
- [ ] Facebook OAuth2 credentials
- [ ] Redirect URLs připraveny pro update

## 🚀 Deployment Steps

### Krok 1: Vercel Account
```bash
# Registrace na vercel.com
# Připojení GitHub účtu
```

### Krok 2: Import Project
1. Vercel Dashboard → Import Git Repository
2. Vyberte váš pet-management repo
3. Configure project:
   - **Framework**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/build`

### Krok 3: Environment Variables
V Vercel Dashboard → Settings → Environment Variables:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=generate-new-super-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret  
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://your-app.vercel.app/api
NODE_ENV=production
```

### Krok 4: Deploy
```bash
# Automatic deploy při push do main
git push origin main

# Nebo manual deploy
vercel --prod
```

### Krok 5: Update OAuth2 URLs
Po získání Vercel URL aktualizujte:

**Google Console**: 
- Authorized redirect URIs: `https://your-app.vercel.app/auth/google/callback`

**Facebook Console**:
- Valid OAuth Redirect URIs: `https://your-app.vercel.app/auth/facebook/callback`

## 🔍 Verification

### Check Deployment Status
- [ ] Frontend dostupný na Vercel URL
- [ ] API endpoints respondují: `/api/health`
- [ ] Database připojení funkční
- [ ] Login/registrace funguje
- [ ] OAuth2 login funguje

### Test Core Features
- [ ] Animal CRUD operations
- [ ] Tag system funguje
- [ ] Admin panel přístupný
- [ ] Responsive design

## 📊 Performance

### Vercel Analytics
- [ ] Page load times < 2s
- [ ] Function execution < 10s
- [ ] Zero errors v function logs

### Optimization
- [ ] Images optimalizovány
- [ ] Bundle size < 2MB
- [ ] Source maps disabled pro production

## 🚨 Troubleshooting

### Common Issues:

**Function Timeout**:
```bash
# Check logs
vercel logs your-app.vercel.app

# Increase timeout in vercel.json
```

**Database Connection**:
```bash
# Verify connection string
# Check firewall settings
# Test from local
```

**OAuth2 Errors**:
```bash
# Verify redirect URLs
# Check client IDs/secrets
# Test authentication flow
```

## 🎯 Success Criteria

- [ ] ✅ Application deployed and accessible
- [ ] ✅ All core features working
- [ ] ✅ Database operations successful  
- [ ] ✅ Authentication systems functional
- [ ] ✅ Performance metrics good
- [ ] ✅ No console errors
- [ ] ✅ Mobile responsive

## 💡 Next Steps

### Custom Domain (Optional)
- [ ] Purchase domain
- [ ] Configure DNS
- [ ] Add to Vercel project
- [ ] Update OAuth2 redirect URLs

### Monitoring
- [ ] Setup error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Setup backup strategy

**🎉 Deployment Complete! Pet Management app running on Vercel! 🚀**