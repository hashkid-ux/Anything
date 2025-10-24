#!/bin/bash

echo "🚀 Launch AI - Production Deployment Script"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed${NC}"
    exit 1
fi

# Check if we're in a git repo
if [ ! -d .git ]; then
    echo -e "${RED}❌ Not a git repository${NC}"
    exit 1
fi

echo -e "${BLUE}📝 Step 1: Committing changes...${NC}"
git add .
read -p "Enter commit message: " commit_msg
git commit -m "$commit_msg"

echo -e "${GREEN}✅ Changes committed${NC}"
echo ""

echo -e "${BLUE}📤 Step 2: Pushing to GitHub...${NC}"
git push origin main

echo -e "${GREEN}✅ Pushed to GitHub${NC}"
echo ""

echo -e "${BLUE}🚂 Step 3: Deploying Backend to Railway...${NC}"
if command -v railway &> /dev/null; then
    cd backend
    railway up
    cd ..
    echo -e "${GREEN}✅ Backend deployed to Railway${NC}"
else
    echo -e "${RED}⚠️  Railway CLI not installed${NC}"
    echo "Install: npm install -g @railway/cli"
    echo "Then run: railway login && railway link"
fi

echo ""

echo -e "${BLUE}▲ Step 4: Deploying Frontend to Vercel...${NC}"
if command -v vercel &> /dev/null; then
    cd frontend
    vercel --prod
    cd ..
    echo -e "${GREEN}✅ Frontend deployed to Vercel${NC}"
else
    echo -e "${RED}⚠️  Vercel CLI not installed${NC}"
    echo "Install: npm install -g vercel"
    echo "Then run: vercel login"
fi

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Visit your frontend URL to test"
echo "2. Check Railway logs for backend"
echo "3. Test payment flow with Razorpay"
echo ""