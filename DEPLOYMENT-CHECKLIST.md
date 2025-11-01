# 🎯 Finální Deployment Checklist

## ✅ Pre-deployment checklist

### 1. Docker Images Setup
- [ ] Oracle Container Registry (OCIR) access nakonfigurován
- [ ] Docker images úspěšně pushed do OCIR
- [ ] Image tags aktualizovány v Kubernetes manifestech

### 2. Oracle Cloud Prerequisites
- [ ] OKE cluster vytvořen a běžící
- [ ] kubectl nakonfigurován pro přístup ke clusteru
- [ ] Always Free tier limity ověřeny

### 3. Secrets a ConfigMaps
- [ ] OCIR pull secret vytvořen
- [ ] Database credentials nakonfigurovány
- [ ] OAuth2 keys přidány do secrets

## 🚀 Deployment Process

### Krok 1: Namespace
```bash
kubectl create namespace pet-management
```

### Krok 2: Database
```bash
kubectl apply -f k8s/01-postgres.yaml
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n pet-management
```

### Krok 3: Backend
```bash
kubectl apply -f k8s/02-backend.yaml
kubectl wait --for=condition=available --timeout=300s deployment/backend -n pet-management
```

### Krok 4: Frontend
```bash
kubectl apply -f k8s/03-frontend.yaml
```

### Krok 5: External Access
```bash
kubectl apply -f k8s/04-ingress.yaml
```

## 🔍 Verification Steps

### Check Pods Status
```bash
kubectl get pods -n pet-management
```
Očekávaný výstup:
```
NAME                        READY   STATUS    RESTARTS   AGE
backend-xxxx-xxxx           1/1     Running   0          5m
frontend-xxxx-xxxx          1/1     Running   0          3m
postgres-xxxx-xxxx          1/1     Running   0          10m
```

### Check Services
```bash
kubectl get services -n pet-management
```

### Check External IP
```bash
kubectl get service frontend-loadbalancer -n pet-management
kubectl get service backend-loadbalancer -n pet-management
```

### Application Health Check
```bash
# Backend health
kubectl exec -it deployment/backend -n pet-management -- curl localhost:4444/health

# Database connectivity
kubectl logs deployment/backend -n pet-management | grep -i database
```

## 🌐 Access Application

### Option 1: LoadBalancer IPs
1. Get external IPs:
```bash
kubectl get svc -n pet-management
```

2. Access:
   - Frontend: `http://[FRONTEND-EXTERNAL-IP]`
   - Backend API: `http://[BACKEND-EXTERNAL-IP]`

### Option 2: Port Forwarding (testing)
```bash
# Terminal 1 - Frontend
kubectl port-forward service/frontend-service 8080:80 -n pet-management

# Terminal 2 - Backend  
kubectl port-forward service/backend-service 4444:80 -n pet-management
```

Access: `http://localhost:8080`

## 📊 Monitoring Commands

```bash
# Pod status
kubectl get pods -n pet-management -w

# Logs
kubectl logs -f deployment/backend -n pet-management
kubectl logs -f deployment/frontend -n pet-management
kubectl logs -f deployment/postgres -n pet-management

# Resource usage
kubectl top pods -n pet-management
kubectl top nodes

# Events
kubectl get events --sort-by=.metadata.creationTimestamp -n pet-management
```

## 🚨 Troubleshooting

### Pods Not Starting
```bash
kubectl describe pod [POD-NAME] -n pet-management
kubectl logs [POD-NAME] -n pet-management
```

### Image Pull Errors
1. Verify OCIR secret:
```bash
kubectl get secret ocir-secret -n pet-management -o yaml
```

2. Test manual pull:
```bash
docker pull [YOUR-OCIR-IMAGE]
```

### Database Connection Issues
```bash
# Check PostgreSQL logs
kubectl logs deployment/postgres -n pet-management

# Test connection from backend pod
kubectl exec -it deployment/backend -n pet-management -- nc -zv postgres-service 5432
```

### Resource Constraints (Always Free)
```bash
# Check node resources
kubectl describe nodes

# Check resource requests vs limits
kubectl describe pod [POD-NAME] -n pet-management
```

## 🎉 Success Criteria

- [ ] All pods in `Running` state
- [ ] Frontend accessible via external IP/LoadBalancer
- [ ] Backend API responding to health checks
- [ ] Database connection successful
- [ ] Application login/registration working
- [ ] Animal management features functional
- [ ] Tag/hashtag system operational

## 🔄 Post-deployment Tasks

### 1. SSL Setup (Optional)
```bash
# Install cert-manager
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Configure DNS and update ingress with your domain
```

### 2. Monitoring Setup
```bash
# Basic monitoring
kubectl get pods -n pet-management --watch
```

### 3. Backup Strategy
```bash
# PostgreSQL backup
kubectl exec deployment/postgres -n pet-management -- pg_dump -U petuser petdb > backup.sql
```

## 📱 Application Features to Test

1. **Authentication**:
   - [ ] User registration
   - [ ] Email/password login
   - [ ] OAuth2 login (Google/Facebook)

2. **Animal Management**:
   - [ ] Create new animal
   - [ ] Edit animal details
   - [ ] Delete animal
   - [ ] View animal list/grid

3. **Hashtag System**:
   - [ ] Add tags to animals
   - [ ] Filter animals by tags
   - [ ] Search functionality

4. **Admin Features**:
   - [ ] User role management
   - [ ] Admin dashboard access

**🚀 Deployment Complete! Your Pet Management app is now running in Oracle Cloud! 🎉**