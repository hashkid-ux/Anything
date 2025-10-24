# Quick Deploy Commands

## First Time Setup

### 1. Install CLIs
```bash
npm install -g @railway/cli vercel
```

### 2. Login
```bash
railway login
vercel login
```

### 3. Link Projects
```bash
# Backend
cd backend
railway init
railway link

# Frontend
cd frontend
vercel link
```

## Deploy Updates

### Deploy Everything
```bash
./scripts/deploy.sh
```

### Deploy Backend Only
```bash
cd backend
railway up
```

### Deploy Frontend Only
```bash
cd frontend
vercel --prod
```

## Monitor

### View Backend Logs
```bash
cd backend
railway logs
```

### View Frontend Logs
```
# Go to vercel.com dashboard
```

## Rollback

### Backend
```bash
railway rollback
```

### Frontend
```bash
vercel rollback
```