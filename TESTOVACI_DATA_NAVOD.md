# 🐾 Pet Management System - Kompletní návod na testovací data a obrázky

## 📋 Přehled

Tento návod popisuje, jak naplnit Pet Management System testovacími daty a nahrat skutečné obrázky zvířat. Systém automaticky vytvoří krásná testovací data s realistickými zvířaty a jejich fotografiemi.

## 🚀 Rychlé spuštění

### 1. Spuštění aplikace
```bash
cd d:\git\pet
docker-compose up -d
```

### 2. Naplnění databáze testovacími daty
```bash
docker-compose exec backend npm run seed
```

### 3. Upload skutečných obrázků
```bash
docker-compose exec backend npm run upload-images
```

### 4. Přístup k aplikaci
- **Veřejná stránka:** http://localhost:8080
- **Admin rozhraní:** http://localhost:8080/admin
- **API:** http://localhost:4444/api

## 🗄️ Testovací data

### 👥 Uživatelé (5 účtů)

| Jméno | Email | Heslo | Role | Popis |
|-------|-------|-------|------|-------|
| Admin User | `admin@petmanagement.cz` | `password123` | admin | Hlavní administrátor |
| Jana Novakova | `jana.novakova@email.cz` | `password123` | user | Veterinářka |
| Pavel Svoboda | `pavel.svoboda@gmail.com` | - | user | Google OAuth uživatel |
| Marie Dvořáková | `marie.dvorakova@email.cz` | `password123` | user | Chovatelka |
| Tomáš Procházka | `tomas.prochazka@email.cz` | `password123` | user | Běžný uživatel |

### 🐕 Druhy zvířat (8 druhů)

| Název | Vědecký název | Kategorie | Popis |
|-------|---------------|-----------|-------|
| Pes domácí | Canis lupus familiaris | Savec | Domestikovaný druh šelmy z čeledi psovitých |
| Kočka domácí | Felis catus | Savec | Domestikovaný druh šelmy z čeledi kočkovitých |
| Králík domácí | Oryctolagus cuniculus | Savec | Domestikovaný druh z čeledi zajícovitých |
| Andulka vlnkovaná | Melopsittacus undulatus | Pták | Malý papoušek původem z Austrálie |
| Morče domácí | Cavia porcellus | Savec | Domestikovaný hlodavec z čeledi prasátkovitých |
| Křeček zlatý | Mesocricetus auratus | Savec | Malý hlodavec původem ze Sýrie |
| Akvarijní rybka | Poecilia reticulata | Ryba | Gupka - oblíbená akvarijní rybka |
| Želva nádherná | Trachemys scripta elegans | Plaz | Vodní želva původem ze severní Ameriky |

### 🐾 Testovací zvířata (12 zvířat)

| Jméno | Druh | Majitel | Věk | Pohlaví | SEO URL | Popis |
|-------|------|---------|-----|---------|---------|-------|
| **Rex** | Pes domácí | Jana Novakova | 5 let | samec | `rex-nemecky-ovcak` | Nádherný německý ovčák, velmi přátelský a poslušný |
| **Bella** | Pes domácí | Pavel Svoboda | 4 roky | samice | `bella-zlaty-retrivr` | Krásná zlatá retrívr, velmi milá a energická |
| **Max** | Pes domácí | Marie Dvořáková | 6 let | samec | `max-rottweiler` | Statný rottweiler s obrovským srdcem |
| **Luna** | Kočka domácí | Jana Novakova | 4 roky | samice | `luna-perska-kocka` | Elegantní perská kočka s dlouhým hedvábným kožíškem |
| **Whiskers** | Kočka domácí | Tomáš Procházka | 5 let | samec | `whiskers-mainsky-myval` | Hravý mainský mýval s impozantní velikostí |
| **Bobík** | Králík domácí | Pavel Svoboda | 3 roky | samec | `bobik-lop-kralik` | Roztomilý lop králík s dlouhýma ušima |
| **Sněhurka** | Králík domácí | Marie Dvořáková | 3 roky | samice | `snehurka-bila-kralice` | Krásná bílá králice s růžovýma očima |
| **Pepíček** | Andulka vlnkovaná | Tomáš Procházka | 2 roky | samec | `pepicek-andulka-modra` | Veselá andulka s krásným modrým zbarvením |
| **Ořešek** | Morče domácí | Jana Novakova | 2 roky | samec | `oresek-morce-hnede` | Roztomilé morče s hnědým kožíškem |
| **Zlatíčko** | Křeček zlatý | Pavel Svoboda | 1 rok | samice | `zlaticko-krecek-zlaty` | Malý zlatý křeček s velkými tmavými očky |
| **Duhový** | Akvarijní rybka | Marie Dvořáková | 1 rok | samec | `duhovy-gupka-samec` | Krásná gupka s duhově přelivajícími se ploutkami |
| **Pomalka** | Želva nádherná | Tomáš Procházka | 7 let | samice | `pomalka-zelva-vodní` | Majestátní vodní želva s krásnými červenými skvrnami |

## 📸 Obrázky zvířat

Systém automaticky stáhne a zpracuje vysoké kvalitní obrázky z Unsplash:

### 🖼️ Zpracování obrázků
- **Hlavní obrázky:** Resize na max 800x600px, JPEG kvalita 85%
- **Thumbnails:** 200x150px, JPEG kvalita 80%
- **Automatické URL:** `/uploads/animals/{filename}`
- **Thumbnail URL:** `/uploads/animals/thumb_{filename}`

### 📊 Statistiky obrázků
- **Celkem obrázků:** 16 souborů
- **Celková velikost:** ~1.5MB
- **Formát:** JPEG s optimalizovanou kvalitou
- **Některá zvířata:** mají více fotografií (primární + sekundární)

## 🛠️ Způsoby spuštění

### A) Pomocí Docker (doporučeno)
```bash
# Naplnit databázi testovacími daty
docker-compose exec backend npm run seed

# Nahrát skutečné obrázky
docker-compose exec backend npm run upload-images

# Kombinované - vymazat vše a vytvořit nové
docker-compose exec backend npm run seed && docker-compose exec backend npm run upload-images
```

### B) Pomocí API (z admin rozhraní)
1. Přihlaste se jako admin: `admin@petmanagement.cz` / `password123`
2. Jděte na `/admin`
3. Klikněte na tlačítka v admin dashboardu

### C) Pomocí REST API
```bash
# Přihlášení a získání tokenu
curl -X POST http://localhost:4444/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@petmanagement.cz","password":"password123"}'

# Seed databáze (nutný admin token)
curl -X POST http://localhost:4444/api/admin/seed-database \
  -H "Authorization: Bearer YOUR_TOKEN"

# Upload obrázků (nutný admin token)
curl -X POST http://localhost:4444/api/admin/upload-images \
  -H "Authorization: Bearer YOUR_TOKEN"

# Získání statistik
curl -X GET http://localhost:4444/api/admin/database-stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📡 API Endpointy

### Admin endpointy (vyžadují admin oprávnění)
- `POST /api/admin/seed-database` - Vymaže databázi a naplní testovacími daty
- `POST /api/admin/upload-images` - Stáhne a nahraje skutečné obrázky
- `GET /api/admin/database-stats` - Vrátí statistiky databáze

### Veřejné endpointy
- `GET /api/animals` - Seznam všech zvířat s obrázky
- `GET /api/animals/:id` - Detail konkrétního zvířete
- `GET /api/animal/:seoUrl` - Detail zvířete podle SEO URL
- `GET /uploads/animals/:filename` - Přímý přístup k obrázkům

## 🔍 Testování

### 1. Veřejná galerie
- Navštivte http://localhost:8080
- Uvidíte galerii všech 12 zvířat s fotografiemi
- Klikněte na zvíře pro zobrazení detailu

### 2. Admin rozhraní
- Přihlaste se jako admin: `admin@petmanagement.cz` / `password123`
- Navštivte http://localhost:8080/admin
- Prohlédněte si dashboard se statistikami

### 3. API testování
```bash
# Test seznamu zvířat
curl http://localhost:4444/api/animals?limit=3

# Test konkrétního zvířete
curl http://localhost:4444/api/animal/rex-nemecky-ovcak

# Test obrázku
curl -I http://localhost:4444/uploads/animals/animal_1_primary.jpg
```

## 📁 Struktura souborů

```
backend/
├── src/
│   ├── scripts/
│   │   ├── seedDatabase.ts      # Vytvoření testovacích dat
│   │   └── uploadImages.ts      # Download a upload obrázků
│   ├── routes/
│   │   └── adminRoutes.ts       # Admin API endpointy
│   └── controllers/
│       └── animalController.ts  # Logika pro zvířata a obrázky
├── uploads/
│   └── animals/                 # Nahrané obrázky
└── package.json                 # npm scripty

frontend/
├── src/
│   └── components/
│       ├── AdminDashboard.tsx   # Admin GUI
│       ├── PublicHomePage.tsx   # Veřejná galerie
│       └── AnimalDetail.tsx     # Detail zvířete
```

## 🚨 Řešení problémů

### Chyba při seed databáze
```bash
# Restart backend a retry
docker-compose restart backend
docker-compose exec backend npm run seed
```

### Chyba při uploadu obrázků
```bash
# Zkontrolovat síťové připojení a retry
docker-compose exec backend npm run upload-images
```

### Obrázky se nezobrazují
```bash
# Zkontrolovat, zda jsou soubory na místě
docker-compose exec backend ls -la /app/uploads/animals/

# Restart backend pro správné URL generování
docker-compose restart backend
```

### Nedostupnost API
```bash
# Zkontrolovat, zda backend běží
docker-compose logs backend --tail=20

# Zkontrolovat porty
docker-compose ps
```

## 📊 Očekávané výsledky

Po úspěšném spuštění budete mít:

- ✅ **5 uživatelů** (1 admin + 4 běžní)
- ✅ **8 druhů zvířat** s vědeckými názvy
- ✅ **12 zvířat** s unikátními SEO URL
- ✅ **16 vysokých kvalitních obrázků** s thumbnails
- ✅ **Funkční veřejnou galerii** se všemi zvířaty
- ✅ **Admin dashboard** pro správu dat
- ✅ **REST API** se všemi daty a obrázky

## 🎯 Další kroky

1. **Experimentujte** s přidáním vlastních zvířat
2. **Testujte** upload vlastních obrázků
3. **Prozkoumejte** veřejné profily zvířat
4. **Upravte** testovací data podle potřeb
5. **Rozšiřte** funkcionalitu o vlastní features

---

**🎉 Gratulujeme! Váš Pet Management System je nyní naplněn krásnými testovacími daty a připraven k použití!**