# Audit Logging a Statistiky

Tento systém poskytuje kompletní audit logging a statistiky pro Pet Management aplikaci.

## 🎯 Funkcionalita

### Audit Logging
- **Automatické logování** všech HTTP requestů
- **User action tracking** s session management
- **IP adresa** a user agent sledování
- **Response time** monitoring
- **Sanitizace citlivých dat** (hesla, tokeny)
- **Metadata** s detaily o requestech a responses

### Statistiky
- **Návštěvnost stránek** - nejpopulárnější stránky, denní/týdenní trendy
- **Statistiky zvířat** - podle druhů, věku, oblíbená jména
- **Lokace uživatelů** - města, kontaktní informace
- **Systémové statistiky** - aktivní uživatelé, registrace, chyby

### Scheduled Tasks
- **Denní cleanup** starých audit logů (90 dní retention)
- **Denní agregace** statistik
- **Týdenní sumarizace** dat  
- **Měsíční archivace** dlouhodobých trendů

## 🚀 API Endpointy

### Statistiky (pouze admin)
```
GET /api/statistics/system           # Systémové statistiky
GET /api/statistics/page-visits      # Návštěvnost stránek  
GET /api/statistics/animals          # Statistiky zvířat
GET /api/statistics/locations        # Lokace uživatelů
POST /api/statistics/save            # Uložení statistiky
GET /api/statistics/stored           # Uložené statistiky
```

### Scheduled Tasks (pouze admin)
```
GET /api/tasks/status                # Stav všech úloh
POST /api/tasks/run/:taskName        # Manuální spuštění úlohy
POST /api/tasks/stop-all             # Zastavení všech úloh
POST /api/tasks/restart              # Restart všech úloh
```

## 📊 Frontend Dashboard

Kompletní admin dashboard s:
- **4 hlavní záložky** - Systém, Návštěvnost, Zvířata, Lokace
- **Filtry podle období** - 1 den, 7 dní, 30 dní
- **Real-time refresh** dat
- **Responsive design** pro všechna zařízení

### Přístup
- URL: `/statistics` (pouze pro adminy)
- Menu: Admin → Statistiky

## 🛠️ Databázové tabulky

### audit_logs
```sql
- id (PK)
- user_id (FK to users)
- session_id (UUID)
- action (VARCHAR)
- resource (VARCHAR) 
- ip_address (INET)
- user_agent (TEXT)
- method (VARCHAR)
- url (TEXT)
- status_code (INTEGER)
- response_time (INTEGER)
- metadata (JSONB)
- created_at (TIMESTAMP)
```

### statistics  
```sql
- id (PK)
- date (DATE)
- metric (VARCHAR)
- category (VARCHAR)
- value (DECIMAL)
- metadata (JSONB)
- created_at/updated_at (TIMESTAMP)
- UNIQUE(date, metric, category)
```

## ⚙️ Konfigurace

### Environment Variables
```bash
# Audit Log Retention (dny)
AUDIT_LOG_RETENTION_DAYS=90

# Povolit/zakázat scheduled tasks
ENABLE_SCHEDULED_TASKS=true
```

### Scheduled Tasks Schedule
```
02:00 každý den  - Cleanup audit logů
03:00 každý den  - Agregace denních statistik  
04:00 každou neděli - Týdenní sumarizace
05:00 1. den měsíce - Měsíční archivace
```

## 🔧 Použití

### Manuální spuštění úloh
```bash
# Přes API (admin token required)
POST /api/tasks/run/audit-cleanup
POST /api/tasks/run/daily-stats
POST /api/tasks/run/weekly-stats
POST /api/tasks/run/monthly-archive
```

### Sledování stavu
```bash
GET /api/tasks/status
```

Response:
```json
{
  "tasks": [
    {
      "name": "daily-audit-cleanup",
      "running": true,
      "nextRun": "2024-12-16T02:00:00.000Z"
    }
  ],
  "enabled": true
}
```

## 📈 Monitoring a Performance

### Indexy pro optimální výkon
- `audit_logs`: user_id, action, resource, created_at, ip_address, session_id
- `statistics`: date, metric, category, unique(date,metric,category)

### Audit Log Cleanup
- Automatické mazání záznamů starších než 90 dní
- Zachování agregovaných statistik
- Logování cleanup operací

### Memory Management
- Batch processing pro velké datasety
- Optimalizované Sequelize queries
- Sankce citlivých dat před uložením

## 🚨 Bezpečnost

### Admin Only Access
- Všechny statistiky endpointy pouze pro adminy
- Audit middleware loguje admin akce
- Session tracking pro bezpečnostní audit

### Data Sanitization
- Automatické odstranění hesel z audit logů
- Sanitizace citlivých polí (token, secret, key)
- IP anonymizace možná pro GDPR compliance

## 🎉 Kompletní implementace

✅ **Backend**
- AuditLog a Statistics modely
- Audit middleware pro automatické logování
- Statistics API endpointy
- Scheduled tasks service
- Database migrace a indexy

✅ **Frontend**  
- StatisticsDashboard komponenta
- Statistics API service
- Admin menu integrace
- Responsive Material-UI design

✅ **Infrastructure**
- Docker compatible
- Environment based konfigurace
- Production ready scheduled tasks
- Comprehensive error handling