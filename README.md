# Fullstack TypeScript Application

Kompletní fullstack aplikace postavená na React + TypeScript frontendu s Redux Toolkit, Node.js + Express backend s PostgreSQL databází, vše kontejnerizované pomocí Docker.

## 🚀 Technologie

### Frontend
- **React 18** s TypeScript
- **Redux Toolkit** pro state management
- **Material-UI (MUI)** pro komponenty a design
- **React Router** pro navigaci
- **Axios** pro HTTP požadavky

### Backend
- **Node.js** s **Express**
- **TypeScript**
- **Sequelize ORM** s PostgreSQL
- **Swagger** dokumentace API
- Validace pomocí **express-validator**

### DevOps
- **Docker & Docker Compose**
- **PostgreSQL** databáze
- VS Code debugging konfigurace

## 📁 Struktura projektu

```
├── frontend/               # React TypeScript aplikace
│   ├── src/
│   │   ├── components/     # React komponenty
│   │   ├── store/          # Redux store a slices
│   │   ├── services/       # API služby (Axios)
│   │   └── types/          # TypeScript typy
│   ├── Dockerfile
│   └── package.json
├── backend/                # Node.js Express API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Sequelize modely
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── config/         # Konfigurace databáze
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── init.sql           # Inicializační SQL skripty
├── .vscode/               # VS Code konfigurace
│   ├── launch.json        # Debug konfigurace
│   └── tasks.json         # Úkoly pro VS Code
└── docker-compose.yml     # Docker orchestrace
```

## 🛠️ Instalace a spuštění

### Předpoklady
- Docker a Docker Compose
- Node.js 18+ (pro lokální development)
- VS Code (doporučeno)

### 1. Spuštění pomocí Docker (doporučeno)

```bash
# Klonování a přechod do projektového adresáře
git clone <repository-url>
cd fullstack-typescript-app

# Spuštění všech služeb
docker-compose up -d

# Sledování logů
docker-compose logs -f
```

**Aplikace budou dostupné na:**
- Frontend: http://localhost:3300
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

### 2. Lokální development

```bash
# Instalace závislostí
npm run install:all  # nebo ručně ve frontend/ a backend/

# Spuštění PostgreSQL
docker-compose up postgres -d

# Spuštění backend (v novém terminálu)
cd backend
npm run dev

# Spuštění frontend (v novém terminálu)
cd frontend
npm start
```

## 🐛 Debugging v VS Code

### Debug konfigurace
Projekt obsahuje připravené debug konfigurace pro VS Code:

1. **Debug Backend in Docker** - Připojení k backend kontejneru
2. **Debug Frontend in Docker** - Debug React aplikace
3. **Debug Backend Local** - Lokální debug backend
4. **Debug Full Stack** - Kombinace frontend + backend

### Postup pro debug:

1. Spusťte Docker služby:
   ```bash
   docker-compose up -d
   ```

2. Ve VS Code:
   - Otevřete panel Debug (Ctrl+Shift+D)
   - Vyberte konfiguraci (např. "Debug Full Stack")
   - Stiskněte F5 pro spuštění

3. Nastavte breakpointy ve svém kódu
4. Aplikace se zastaví na breakpointech

### Debug backend v kontejneru:

Pro debug backend v Docker kontejneru je potřeba upravit `docker-compose.yml`:

```yaml
backend:
  # ... ostatní konfigurace
  ports:
    - "5000:5000"
    - "9229:9229"  # Debug port
  command: npm run dev:debug
```

A přidat do `backend/package.json`:
```json
{
  "scripts": {
    "dev:debug": "nodemon --inspect=0.0.0.0:9229 src/server.ts"
  }
}
```

## 📊 API Dokumentace

Backend poskytuje Swagger dokumentaci dostupnou na:
- http://localhost:5000/api-docs

### Hlavní API endpointy:

- `GET /api/health` - Health check
- `GET /api/users` - Získání seznamu uživatelů (s paginací, vyhledáváním)
- `POST /api/users` - Vytvoření nového uživatele
- `GET /api/users/:id` - Získání uživatele podle ID
- `PUT /api/users/:id` - Aktualizace uživatele
- `DELETE /api/users/:id` - Smazání uživatele

## 🎨 Frontend features

### Komponenty
- **HomePage** - Hlavní stránka s přehledem
- **DataTable** - Pokročilá tabulka s funkcemi:
  - Vyhledávání
  - Řazení
  - Paginace
  - CRUD operace
  - Filtrování

### Redux Store
- **userSlice** - Správa uživatelských dat
- **dataSlice** - Správa stavu tabulky (filtry, řazení, paginace)

## 🗄️ Databáze

### Modely
- **User** - Uživatelský model s poli:
  - id, name, email, phone, company, role, status
  - Automatické timestamps (createdAt, updatedAt)

### Inicializace
Databáze se automaticky inicializuje s ukázkovými daty při prvním spuštění.

## 🔧 Užitečné příkazy

```bash
# Docker příkazy
docker-compose up -d              # Spustit všechny služby
docker-compose down               # Zastavit všechny služby
docker-compose logs -f backend    # Sledovat logy backend
docker-compose restart frontend   # Restartovat frontend

# Databáze příkazy
docker-compose exec postgres psql -U postgres -d fullstack_db
docker-compose exec postgres pg_dump -U postgres fullstack_db > backup.sql

# Development příkazy
npm run build                     # Build projekt
npm run test                      # Spustit testy
npm run lint                      # Kontrola kódu
```

## 🚨 Řešení problémů

### Frontend se nespustí
- Zkontrolujte, zda jsou nainstalovány závislosti: `cd frontend && npm install --legacy-peer-deps`
- Ověřte, že backend běží na portu 5000

### Backend se nespustí
- Zkontrolujte připojení k databázi
- Ověřte environment proměnné
- Zkontrolujte logy: `docker-compose logs backend`

### Databáze se nepřipojí
- Zkontrolujte, zda běží PostgreSQL kontejner: `docker-compose ps`
- Ověřte konfigurace v `docker-compose.yml`

### Debug nefunguje
- Zkontrolujte, zda jsou exposované správné porty
- Ověřte VS Code launch konfiguraci
- Restartujte VS Code a Docker kontejnery

## 📝 TODO / Budoucí vylepšení

- [ ] Autentifikace a autorizace (JWT)
- [ ] Unit a integration testy
- [ ] CI/CD pipeline
- [ ] Production Docker konfigurace
- [ ] Monitoring a logging
- [ ] API rate limiting
- [ ] Caching layer (Redis)
- [ ] File upload functionality

## 👥 Přispívání

1. Fork repository
2. Vytvořte feature branch (`git checkout -b feature/nova-funkcionalita`)
3. Commitněte změny (`git commit -am 'Přidat novou funkcionalitu'`)
4. Push do branch (`git push origin feature/nova-funkcionalita`)
5. Vytvořte Pull Request

## 📄 Licence

MIT License - viz [LICENSE](LICENSE) soubor.