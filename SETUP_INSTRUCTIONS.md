# 🚀 AppNexus Chat Application - Setup Instructions

## ✅ What's Included

This is a complete real-time chat application with:

- **Frontend:** React + Vite (in `appnexus/`)
- **Backend:** Node.js + Express + Socket.IO (in `appnexus/backend/`)
- **Authentication:** Firebase Authentication (Email/Password + Google Sign-In)
- **Database:** MongoDB (users and messages collections)
- **Real-time:** Socket.IO for instant messaging

---

## 📦 Installation

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

---

## 🔧 Configuration

### Backend Configuration (`appnexus/backend/.env`)

Already configured with:

```env
PORT=5000
MONGO_URI=mongodb+srv://omkarchillal99_db_user:Thd2M76XZdKFZuw2@omkar.ktnzbmd.mongodb.net/appnexus?retryWrites=true&w=majority&appName=omkar
```

**Database:** `appnexus`
**Collections:** `users` and `messages` (created automatically)

### Frontend Configuration (`appnexus/.env`)

Already configured with:

```env
VITE_API_BASE=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=1023004623236-8ek639f309365lk8v71nt9bh0qtvpm2r.apps.googleusercontent.com
```

### Firebase Configuration (`appnexus/src/firebase/firebase.js`)

Already configured with your Firebase project:

```javascript
{
  apiKey: "AIzaSyC2u4j6PQ0jsMJzMocMo5JECbbz2305kuA",
  authDomain: "appnexus-4c007.firebaseapp.com",
  projectId: "appnexus-4c007",
  storageBucket: "appnexus-4c007.firebasestorage.app",
  messagingSenderId: "1023004623236",
  appId: "1:1023004623236:web:ed4ab6279b785dbd25ddd1",
  measurementId: "G-B7HHFFTPET"
}
```

**Web Client ID:** `1023004623236-8ek639f309365lk8v71nt9bh0qtvpm2r.apps.googleusercontent.com`

---

## 🚀 Running the Application

### Option 1: Manual Start (Recommended for First Time)

**Terminal 1 - Backend:**

```bash
cd appnexus/backend
npm run dev
```

You should see:

```
✅ MongoDB connected successfully
📡 Host: omkar.ktnzbmd.mongodb.net
📘 Database: appnexus
🚀 AppNexus Chat Server running on port 5000
```

**Terminal 2 - Frontend:**

```bash
cd appnexus
npm run dev
```

You should see:

```
VITE v7.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Option 2: Quick Start Script (Windows)

```bash
# From the root directory
START_APPNEXUS.bat
```

---

## 🌐 Access the Application

Open your browser to: **http://localhost:5173**

---

## 📝 How to Use

### 1. Sign Up

**Option A: Email/Password**

1. Click "Sign up" or go to `/signup`
2. Enter your full name, email, and password
3. Click "Sign Up"
4. User is created in Firebase and synced to MongoDB

**Option B: Google Sign-In**

1. Click "Continue with Google"
2. Select your Google account
3. User is created in Firebase and synced to MongoDB

### 2. Login

**Option A: Email/Password**

1. Go to `/login`
2. Enter your email and password
3. Click "Log In"

**Option B: Google Sign-In**

1. Click "Continue with Google"
2. Select your Google account

### 3. Start Chatting

1. After login, you'll see a list of all registered users
2. Click on any user to start a conversation
3. Type your message and press Enter or click Send
4. Messages are delivered in real-time via Socket.IO

---

## 🗄️ Database Structure

### MongoDB Collections

**Collection: `users`**

```javascript
{
  uid: String (Firebase UID),
  fullName: String,
  email: String,
  photoURL: String (optional),
  provider: String ('password' or 'google'),
  online: Boolean,
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Collection: `messages`**

```javascript
{
  senderId: String (Firebase UID),
  receiverId: String (Firebase UID),
  content: String,
  timestamp: Date
}
```

---

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/sync` - Sync Firebase user to MongoDB
- `GET /api/auth/ping` - Health check

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:uid` - Get user by Firebase UID

### Messages

- `GET /api/messages/:senderId/:receiverId` - Get message history
- `POST /api/messages` - Send new message

---

## 🌐 Socket.IO Events

### Client → Server

- `join_room(uid)` - Join user's room
- `send_message({ senderId, receiverId, content })` - Send message
- `typing({ senderId, receiverId, isTyping })` - Typing status

### Server → Client

- `get_online_users(uids[])` - List of online users
- `receive_message(message)` - New message received
- `typing_status({ senderId, isTyping })` - Typing notification

---

## 🧪 Testing

### Test Real-time Chat

1. Open app in **Browser 1** (e.g., Chrome)
2. Sign up/Login as **User A**
3. Open app in **Browser 2** (e.g., Firefox or Incognito)
4. Sign up/Login as **User B**
5. In Browser 1, click on User B
6. Send a message
7. Watch it appear instantly in Browser 2! ✨

### Test Google Sign-In

1. Click "Continue with Google"
2. Select your Google account
3. Should redirect to chat page
4. Check MongoDB - user should be created with `provider: 'google'`

---

## 🐛 Troubleshooting

### Backend won't start

- **Error:** `EADDRINUSE: address already in use :::5000`

  - **Solution:** Port 5000 is in use. Kill the process or change PORT in `.env`

- **Error:** `MongoDB connection failed`
  - **Solution:** Check internet connection and verify MONGO_URI

### Frontend can't connect to backend

- **Error:** `Network request failed`
  - **Solution:** Ensure backend is running on port 5000
  - Verify `VITE_API_BASE` in `.env`

### Firebase Authentication errors

- **Error:** `Firebase: Error (auth/invalid-api-key)`

  - **Solution:** Verify Firebase config in `firebase.js`

- **Error:** `Firebase: Error (auth/unauthorized-domain)`
  - **Solution:** Add `localhost` to authorized domains in Firebase Console

### Google Sign-In not working

- **Error:** `popup_closed_by_user`

  - **Solution:** User closed the popup, try again

- **Error:** `auth/popup-blocked`
  - **Solution:** Allow popups for localhost in browser settings

---

## 📊 Project Structure

```
appnexus/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Message.js            # Message schema
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── userRoutes.js         # /api/users/*
│   │   └── messageRoutes.js      # /api/messages/*
│   ├── index.js                  # Express + Socket.IO server
│   ├── package.json
│   └── .env
├── src/
│   ├── Components/
│   │   ├── chat.jsx              # Main chat UI
│   │   ├── ChatLogin.jsx         # Login page
│   │   └── ChatSignup.jsx        # Signup page
│   ├── firebase/
│   │   └── firebase.js           # Firebase config
│   ├── assets/
│   │   └── data-analysis-case-study.svg
│   ├── App.jsx                   # Routes
│   └── main.jsx
├── package.json
├── .env
└── SETUP_INSTRUCTIONS.md (this file)
```

---

## ✅ Verification Checklist

- [ ] Backend dependencies installed (`npm install` in `backend/`)
- [ ] Frontend dependencies installed (`npm install` in root)
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connection successful
- [ ] Can access signup page
- [ ] Can create account with email/password
- [ ] Can sign up with Google
- [ ] Can login
- [ ] Can see user list
- [ ] Can send messages
- [ ] Messages appear in real-time
- [ ] Online status works

---

## 🎉 Success!

If all steps are completed, you now have a fully functional real-time chat application with Firebase authentication and MongoDB storage!

**Frontend:** http://localhost:5173
**Backend:** http://localhost:5000
**Database:** MongoDB Atlas (appnexus database)
**Auth:** Firebase Authentication

---

## 📝 Important Notes

### Firebase Configuration

- All Firebase credentials are already configured
- Web Client ID is set for Google Sign-In
- No additional Firebase setup needed

### MongoDB Configuration

- Database name: `appnexus`
- Collections: `users` and `messages` (auto-created)
- Connection string is already configured

### Authentication Flow

1. User signs up/logs in via Firebase
2. Firebase returns user data (UID, email, name, photo)
3. Frontend syncs user to MongoDB via `/api/auth/sync`
4. User data is stored in MongoDB `users` collection
5. Messages use Firebase UID as sender/receiver IDs

### No Changes Needed

- RJ_Omkar_Chillal folder is untouched
- BE_Omkar_Chillal folder is untouched
- This is a completely standalone copy

---

**Created:** November 23, 2025
**Source:** RJ_Omkar_Chillal (Project 4)
**Destination:** appnexus (Standalone Application)
**Status:** ✅ Ready to Use
