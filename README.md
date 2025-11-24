# AppNexus Chat

A real-time chat application built with React, Firebase Authentication, MongoDB, and Socket.IO.

## Features

- 🔐 **Authentication**: Email/Password and Google Sign-In via Firebase
- 💬 **Real-time Messaging**: Instant message delivery using Socket.IO
- 👥 **Online Status**: See who's online in real-time
- ⌨️ **Typing Indicators**: Know when someone is typing
- 🔄 **Password Reset**: Secure password reset via email
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend

- React 19
- Vite
- TailwindCSS
- Firebase Authentication
- Socket.IO Client
- React Router
- Framer Motion
- Material-UI

### Backend

- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- Firebase Admin SDK
- CORS enabled

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- Firebase project

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd appnexus
```

2. **Install frontend dependencies**

```bash
npm install
```

3. **Install backend dependencies**

```bash
cd backend
npm install
cd ..
```

4. **Configure environment variables**

Create `.env` in root:

```env
VITE_API_BASE=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your-mongodb-connection-string
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

5. **Run the application**

Terminal 1 (Backend):

```bash
cd backend
npm start
```

Terminal 2 (Frontend):

```bash
npm run dev
```

Visit `http://localhost:5173`

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions on deploying to Vercel (frontend) and Render (backend).

## Project Structure

```
appnexus/
├── src/                    # Frontend source
│   ├── Components/         # React components
│   ├── firebase/          # Firebase configuration
│   └── utils/             # Utility functions
├── backend/               # Backend source
│   ├── config/           # Database configuration
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── index.js          # Server entry point
├── public/               # Static assets
└── DEPLOYMENT_GUIDE.md   # Deployment instructions
```

## License

MIT
