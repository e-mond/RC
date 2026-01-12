# Deployment Guide - RentalConnects Frontend

**Version:** 1.0.0  
**Date:** January 11, 2026

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Production backend API running
- Environment variables configured

### Build for Production

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

Create a `.env.production` file with:

```env
# API Configuration
VITE_API_BASE_URL=https://api.rentalconnects.com/api

# Mock Mode (MUST be false in production)
VITE_USE_MOCK=false

# Paystack (Production)
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

### 2. Build Verification

```bash
# Run tests
npm test

# Check for linting errors
npm run lint

# Build production bundle
npm run build

# Verify build output
ls -la dist/
```

### 3. Backend Integration

Ensure your Django backend:
- ✅ Has all required endpoints implemented
- ✅ CORS configured for your frontend domain
- ✅ JWT authentication working
- ✅ All API contracts match frontend expectations

---

## 🌐 Deployment Options

### Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all production environment variables

### Netlify

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

3. **Configure Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

### Traditional Server (Nginx)

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Upload dist/ folder to server**

3. **Configure Nginx:**
   ```nginx
   server {
       listen 80;
       server_name rentalconnects.com;
       root /var/www/rentalconnects/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

---

## 🔒 Security Checklist

- [ ] `VITE_USE_MOCK=false` in production
- [ ] All API endpoints use HTTPS
- [ ] JWT tokens stored securely (not in localStorage for sensitive data)
- [ ] CORS properly configured on backend
- [ ] Environment variables not exposed in client code
- [ ] Paystack keys are production keys
- [ ] Cloudinary credentials are production credentials

---

## 📊 Post-Deployment Verification

### 1. Functional Testing

- [ ] Login/Logout works
- [ ] Property listings load
- [ ] Property creation works
- [ ] Booking requests work
- [ ] Payments process correctly
- [ ] Messaging works
- [ ] Reviews can be submitted
- [ ] Admin functions work

### 2. Performance Testing

- [ ] Page load times < 3 seconds
- [ ] Images load correctly
- [ ] Service worker caching works
- [ ] PWA installation works

### 3. Browser Testing

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🐛 Troubleshooting

### Build Fails

**Error:** Module not found
- **Solution:** Run `npm install` to ensure all dependencies are installed

**Error:** Environment variable not found
- **Solution:** Check `.env.production` file exists and has all required variables

### Runtime Errors

**Error:** API calls failing
- **Solution:** Verify `VITE_API_BASE_URL` is correct and backend is accessible

**Error:** CORS errors
- **Solution:** Configure CORS on backend to allow your frontend domain

**Error:** JWT token issues
- **Solution:** Verify token storage and refresh logic

---

## 📈 Monitoring

### Recommended Tools

1. **Error Tracking:** Sentry, LogRocket
2. **Analytics:** Google Analytics, Plausible
3. **Performance:** Lighthouse, WebPageTest
4. **Uptime:** UptimeRobot, Pingdom

### Key Metrics to Monitor

- Page load times
- API response times
- Error rates
- User engagement
- Conversion rates (signups, upgrades)

---

## 🔄 Updates & Maintenance

### Updating the Application

1. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Build:**
   ```bash
   npm run build
   ```

5. **Deploy:**
   ```bash
   vercel --prod
   ```

### Rollback Procedure

If deployment fails:

1. **Revert to previous version:**
   ```bash
   git checkout <previous-commit>
   npm run build
   vercel --prod
   ```

2. **Or use Vercel rollback:**
   - Go to Vercel Dashboard → Deployments
   - Select previous successful deployment
   - Click "Promote to Production"

---

## 📞 Support

For deployment issues:
- Check `FRONTEND_OVERVIEW.md` for architecture details
- Check `FRONTEND_API_CONTRACTS.md` for API requirements
- Review error logs in deployment platform

---

**Last Updated:** January 11, 2026

