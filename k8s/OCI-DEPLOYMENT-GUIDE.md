# Oracle Cloud Infrastructure Deployment Guide

Toto je kompletní návod pro nasazení aplikace Pet Management na Oracle Cloud Infrastructure (OKE).

## 1. Příprava Oracle Cloud Account

### Registrace Oracle Cloud (ZDARMA navždy)
1. Jděte na https://www.oracle.com/cloud/free/
2. Klikněte na "Start for free"
3. Vyplňte registrační formulář
4. Ověřte email a telefonní číslo
5. Po registraci získáte:
   - 30 dní $300 kredit pro testování
   - **ALWAYS FREE** služby - navždy zdarma:
     - 2x AMD Compute instances (1/8 OCPU, 1GB RAM každý)
     - Kubernetes cluster (OKE)
     - Block Storage 200GB
     - Load Balancer

## 2. Vytvoření OKE Kubernetes Clusteru

### Přes Oracle Cloud Console:
1. Přihlaste se do Oracle Cloud Console
2. Menu → Developer Services → Kubernetes Clusters (OKE)
3. Klikněte "Create Cluster"
4. Vyberte "Quick Create" pro automatické nastavení
5. Konfigurace pro Always Free:
   - **Cluster Name**: pet-management-cluster
   - **Kubernetes Version**: nejnovější dostupná
   - **Node Pool**:
     - **Shape**: VM.Standard.A1.Flex (Always Free eligible)
     - **Node Count**: 2
     - **OCPU per node**: 1/8 (0.125)
     - **Memory per node**: 1GB
   - **Networking**: použijte default VCN nebo vytvořte novou
6. Klikněte "Create Cluster"
7. Čekejte 10-15 minut než se cluster vytvoří

### Ověření Always Free limitu:
```bash
# Po připojení ke clusteru zkontrolujte resources
kubectl describe nodes
```

## 3. Přístup ke clusteru

### Instalace kubectl (pokud nemáte):
```powershell
# Windows PowerShell
winget install Kubernetes.kubectl

# Nebo přes Chocolatey
choco install kubernetes-cli
```

### Konfigurace kubectl pro OKE:
1. V Oracle Cloud Console jděte na váš cluster
2. Klikněte "Access Cluster"
3. Zkopírujte příkaz podobný tomuto:
```bash
oci ce cluster create-kubeconfig --cluster-id ocid1.cluster.oc1... --file $HOME/.kube/config --region us-phoenix-1 --token-version 2.0.0 --kube-endpoint PUBLIC_ENDPOINT
```

### Test připojení:
```bash
kubectl get nodes
kubectl get namespaces
```

## 4. Příprava Docker Images

### Setup Oracle Container Registry (OCIR):
1. Oracle Cloud Console → Developer Services → Container Registry
2. Vytvořte namespace (pokud neexistuje)
3. Poznamenejte si region kód (např. `phx` pro Phoenix)

### Získání Auth Token:
1. User menu (vpravo nahoře) → User Settings
2. Auth Tokens → Generate Token
3. Název: "docker-push"
4. Zkopírujte vygenerovaný token (zobrazí se jen jednou!)

### Docker login do OCIR:
```bash
# Format: docker login <region-key>.ocir.io
# Username: <tenancy-namespace>/<username>
# Password: <auth-token>

docker login phx.ocir.io
# Username: axabcdefghij/ales.pavel@example.com
# Password: [váš auth token]
```

### Build a push images:
```bash
# Spusťte script pro build
chmod +x k8s/build-and-push.sh
./k8s/build-and-push.sh
```

Nebo manuálně:
```bash
# Backend
cd backend
docker build -t phx.ocir.io/axabcdefghij/pet-management/backend:latest .
docker push phx.ocir.io/axabcdefghij/pet-management/backend:latest

# Frontend
cd ../frontend
docker build -t phx.ocir.io/axabcdefghij/pet-management/frontend:latest .
docker push phx.ocir.io/axabcdefghij/pet-management/frontend:latest
```

## 5. Úprava Kubernetes manifestů

### Aktualizujte image registry v manifestech:
V souborech `02-backend.yaml` a `03-frontend.yaml` změňte:
```yaml
# Z:
image: pet-management/backend:latest
# Na:
image: phx.ocir.io/axabcdefghij/pet-management/backend:latest
```

### Vytvořte secret pro OCIR pull:
```bash
kubectl create secret docker-registry ocir-secret \
  --docker-server=phx.ocir.io \
  --docker-username="axabcdefghij/ales.pavel@example.com" \
  --docker-password="[AUTH_TOKEN]" \
  --namespace=pet-management
```

Nebo pomocí YAML:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ocir-secret
  namespace: pet-management
type: kubernetes.io/dockerconfigjson
data:
  .dockerconfigjson: [base64 encoded docker config]
```

## 6. Nasazení aplikace

### Vytvoření namespace:
```bash
kubectl create namespace pet-management
```

### Nasazení všech komponent:
```bash
# PostgreSQL
kubectl apply -f k8s/01-postgres.yaml

# Čekejte než se PostgreSQL spustí
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n pet-management

# Backend
kubectl apply -f k8s/02-backend.yaml

# Čekejte než se backend spustí
kubectl wait --for=condition=available --timeout=300s deployment/backend -n pet-management

# Frontend
kubectl apply -f k8s/03-frontend.yaml

# Volitelně - Ingress/LoadBalancer
kubectl apply -f k8s/04-ingress.yaml
```

### Ověření nasazení:
```bash
kubectl get pods -n pet-management
kubectl get services -n pet-management
kubectl logs -f deployment/backend -n pet-management
```

## 7. Přístup k aplikaci

### Varianta A: LoadBalancer (automatická externí IP)
```bash
# Zjistěte externí IP
kubectl get service frontend-loadbalancer -n pet-management
kubectl get service backend-loadbalancer -n pet-management

# Aplikace bude dostupná na externí IP na portu 80
```

### Varianta B: Port forwarding (pro testování)
```bash
# Frontend
kubectl port-forward service/frontend-service 8080:80 -n pet-management

# Backend (v novém terminálu)
kubectl port-forward service/backend-service 4444:80 -n pet-management
```

### Varianta C: Custom doména + SSL
1. Nakonfigurujte DNS záznamy na Oracle Cloud nebo externí DNS provider
2. Upravte `04-ingress.yaml` s vaší doménou
3. Nainstalujte cert-manager pro SSL:
```bash
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

## 8. Monitoring a údržba

### Základní monitoring:
```bash
# Status clusteru
kubectl get nodes
kubectl get pods --all-namespaces

# Logování
kubectl logs -f deployment/backend -n pet-management
kubectl logs -f deployment/frontend -n pet-management

# Resources
kubectl top nodes
kubectl top pods -n pet-management
```

### Aktualizace aplikace:
```bash
# Build nové verze
docker build -t phx.ocir.io/axabcdefghij/pet-management/backend:v2 backend/
docker push phx.ocir.io/axabcdefghij/pet-management/backend:v2

# Rolling update
kubectl set image deployment/backend backend=phx.ocir.io/axabcdefghij/pet-management/backend:v2 -n pet-management
```

### Scaling (v rámci Always Free limitů):
```bash
# Můžete škálovat pouze v rámci dostupných resources
kubectl scale deployment backend --replicas=1 -n pet-management
kubectl scale deployment frontend --replicas=1 -n pet-management
```

## 9. Troubleshooting

### Časté problémy:

**Pods se nespouštějí:**
```bash
kubectl describe pod [POD_NAME] -n pet-management
kubectl logs [POD_NAME] -n pet-management
```

**Image pull errors:**
- Zkontrolujte OCIR credentials
- Ověřte správný název image registry
- Ujistěte se, že je secret `ocir-secret` aplikován

**Resource limits:**
```bash
# Zkontrolujte dostupné resources
kubectl describe nodes
kubectl get events --sort-by=.metadata.creationTimestamp -n pet-management
```

**Database connection issues:**
- Ověřte, že je PostgreSQL běžící: `kubectl get pods -n pet-management`
- Zkontrolujte connection string v ConfigMap
- Logování backend podu: `kubectl logs deployment/backend -n pet-management`

## 10. Náklady a limity

### Always Free tier limits:
- **Compute**: 2x VM.Standard.A1.Flex (1/8 OCPU, 1GB RAM)
- **Storage**: 200GB Block Storage celkem
- **Network**: 10TB odchozího trafficu/měsíc
- **Load Balancer**: 1x 10Mbps

### Optimalizace pro Always Free:
- Udržujte celkové resource requests pod limitami
- Používejte persistent volumes efektivně
- Monitorujte network traffic

**🎉 Gratulujeme! Vaše Pet Management aplikace běží v cloudu zdarma!**

Aplikace by měla být dostupná na externí IP adrese vašeho LoadBalanceru nebo na vaší custom doméně.