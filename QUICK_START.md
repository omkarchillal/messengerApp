# 🚀 AppNexus Chat - Quick Start

## ⚡ Installation (First Time Only)

### 1. Install Backend Dependencies

```bash
cd appnexus/backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd appnexus
npm install
```

## 🎯 Running the Application

### Start Backend (Terminal 1)

```bash
cd appnexus/backend
npm run dev
```

**Expected Output:**

```
✅ MongoDB connected successfully
📡 Host: omkar.ktnzbmd.mongodb.net
📘 Database: appnexus
🚀 AppNexus Chat Server running on port 5000
```

### Start Frontend (Terminal 2)

```bash
cd appnexus
npm run dev
```

**Expected Output:**

```
VITE v7.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

## 🌐 Access the App

Open your browser to: **http://localhost:5173**

You'll be redirected to the login page.

## 📝 First Time Use

### Create an Account

**Option 1: Email/Password**

1. Click "Sign up" link
2. Enter:
   - Full Name: Your Name
   - Email: your@email.com
   - Password: (minimum 6 characters)
   - Confirm Password
3. Click "Sign Up"
4. You'll be redirected to login page
5. Login with your credentials

**Option 2: Google Sign-In**

1. Click "Continue with Google"
2. Select your Google account
3. You'll be automatically logged in

### Start Chatting

1. After login, you'll see the chat interface
2. Left sidebar shows all registered users
3. Click on any user to start chatting
4. Type your message and press Enter or click Send
5. Messages appear instantly!

## 🧪 Test Real-time Chat

1. Open app in **Browser 1** (e.g., Chrome)
2. Login as **User A**
3. Open app in **Browser 2** (e.g., Firefox or Incognito)
4. Signup/Login as **User B**
5. In Browser 1, click on User B
6. Send a message
7. Watch it appear instantly in Browser 2! ✨

## 🔑 What's Already Configured

✅ Firebase Authentication (Email/Password + Google)
✅ MongoDB Database (appnexus)
✅ Socket.IO Real-time Messaging
✅ All API Keys and Credentials
✅ Backend Routes
✅ Frontend Routes

## 🐛 Troubleshooting

### Backend won't start?

- Check if port 5000 is free
- Verify internet connection (for MongoDB)

### Frontend won't start?

- Check if backend is running first
- Verify port 5173 is free

### Can't login?

- Make sure you created an account first
- Check backend terminal for errors

### Messages not appearing?

- Check if both backend and frontend are running
- Check browser console for errors
- Verify Socket.IO connection

## 📚 More Information

- **Complete Setup Guide:** `SETUP_INSTRUCTIONS.md`
- **Full Summary:** `APPNEXUS_FINAL_SUMMARY.md`

## ✅ Success Checklist

- [ ] Backend installed and running
- [ ] Frontend installed and running
- [ ] Can access http://localhost:5173
- [ ] Can signup/login
- [ ] Can see user list
- [ ] Can send messages
- [ ] Messages appear in real-time

---

**That's it! You're ready to chat! 💬**
