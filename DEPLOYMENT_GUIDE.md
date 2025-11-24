# Deployment Guide - Vercel + Render

## ⚠️ CRITICAL: Firebase Configuration First!

**Before deploying, you MUST add your Vercel domain to Firebase, or Google Sign-In will fail!**

### Add Your Domain to Firebase (Do This Now!)

1. Go to https://console.firebase.google.com/
2. Select your project: **appnexus-4c007**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click "Add domain"
5. Add: `messenger-app-dun.vercel.app` (or your actual Vercel domain)
   - **Don't include** `https://` or trailing slashes
   - Just the domain name

---

## 🚀 Deploy Backend to Render

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Create Render Web Service

1. Go to https://render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `appnexus-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Add Environment Variables on Render

Go to Environment tab and add:

```
PORT=5000
MONGO_URI=mongodb+srv://omkarchillal99_db_user:Thd2M76XZdKFZuw2@omkar.ktnzbmd.mongodb.net/appnexus?retryWrites=true&w=majority&appName=omkar
FRONTEND_URL=https://messenger-app-dun.vercel.app
NODE_ENV=production
```

**Important**: Update `FRONTEND_URL` with your actual Vercel URL!

### Step 4: Deploy

Click "Create Web Service" and wait for deployment.

**Your backend URL**: `https://your-service-name.onrender.com`

---

## 🌐 Deploy Frontend to Vercel

### Step 1: Update .env with Backend URL

Update `.env` file:

```env
VITE_API_BASE=https://your-backend-name.onrender.com
VITE_GOOGLE_CLIENT_ID=1023004623236-8ek639f309365lk8v71nt9bh0qtvpm2r.apps.googleusercontent.com
```

**Important**: Use your Render URL (without `:5000`)!

### Step 2: Deploy to Vercel

1. Go to https://vercel.com/
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variables on Vercel

Go to Settings → Environment Variables and add:

```
VITE_API_BASE=https://your-backend-name.onrender.com
VITE_GOOGLE_CLIENT_ID=1023004623236-8ek639f309365lk8v71nt9bh0qtvpm2r.apps.googleusercontent.com
```

### Step 4: Deploy

Click "Deploy" and wait.

**Your frontend URL**: `https://messenger-app-dun.vercel.app` (or similar)

---

## 🔄 Update Backend with Frontend URL

After deploying to Vercel:

1. Go to **Render Dashboard**
2. Select your backend service
3. Go to **Environment** tab
4. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://messenger-app-dun.vercel.app
   ```
5. Save (auto-redeploys)

---

## ✅ Testing Checklist

### Authentication

- [ ] Sign up with email/password
- [ ] Login with email/password
- [ ] **Google Sign-In** (will fail if domain not added to Firebase!)
- [ ] Forgot password
- [ ] Reset password
- [ ] Logout

### Chat

- [ ] Send messages
- [ ] Receive messages in real-time
- [ ] See online users
- [ ] Typing indicators

---

## 🐛 Common Issues & Solutions

### Issue: "Domain not authorized for OAuth operations"

**Solution**:

1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add your Vercel domain: `messenger-app-dun.vercel.app`
3. Wait 1-2 minutes for changes to propagate
4. Clear browser cache and try again

### Issue: CORS Error

**Solution**:

- Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
- No trailing slash
- Must start with `https://`

### Issue: Socket.IO not connecting

**Solution**:

- Check browser console for errors
- Verify backend is running on Render
- Check that WebSocket connections aren't blocked

### Issue: API calls fail (404 or 500)

**Solution**:

- Check `VITE_API_BASE` in Vercel environment variables
- Make sure it doesn't have `:5000` at the end
- Verify backend is running: visit `https://your-backend.onrender.com/`

### Issue: Password reset doesn't work

**Solution**:

- Add Vercel domain to Firebase Authorized Domains
- Check Firebase email template configuration

---

## 📝 Important Notes

1. **Free Tier Limitations**:

   - Render: Backend sleeps after 15 min inactivity (first request ~30s to wake)
   - Vercel: Generous limits for most use cases

2. **Environment Variables**:

   - Never commit `.env` files
   - Always redeploy after changing environment variables

3. **HTTPS**: Both platforms provide free SSL automatically

4. **Firebase Domain**: This is the #1 cause of deployment issues - make sure it's added!

---

## 🎉 Deployment Complete!

Your app is live at:

- **Frontend**: https://messenger-app-dun.vercel.app
- **Backend**: https://your-backend.onrender.com

**Don't forget to add your Vercel domain to Firebase Authorized Domains!**
