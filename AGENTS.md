# PROJECT OVERVIEW

> AI Coding Agent Guidelines for ChatIn - Real-Time Chat Application

---

## 1. Project Overview

### What the Application Does

**ChatIn** is a full-stack real-time chat application that enables users to:
- Register and authenticate with email/password (JWT-based)
- Add contacts by email address
- Send and receive instant messages via WebSocket
- Share text messages and file attachments (images, documents)
- Upload profile pictures and chat media to Cloudinary
- Share profiles via QR code for easy connections
- Email verification for signup (production only)

### Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend Framework** | React | 18.3.1 |
| **Build Tool** | Vite | 5.4.10 |
| **Routing** | React Router DOM | 6.27.0 |
| **State Management** | TanStack React Query | 5.62.7 |
| **Real-Time** | Socket.io Client | 4.8.1 |
| **Styling** | Tailwind CSS | 4.2.2 |
| **HTTP Client** | Axios | 1.7.7 |
| **Backend Framework** | Express.js | 4.21.1 |
| **WebSocket Server** | Socket.io | 4.8.1 |
| **ORM** | Sequelize | 6.37.5 |
| **Database** | PostgreSQL | (pg 8.13.1) |
| **Authentication** | Passport.js + JWT | 0.7.0 / 9.0.2 |
| **Password Hashing** | bcrypt | 5.1.1 |
| **File Upload** | Multer + Cloudinary | 2.0.2 / 2.7.0 |
| **Email Service** | Google APIs (Gmail) | 144.0.0 |

### Core Features

1. **Authentication System** - JWT with HTTP-only cookies, Passport.js strategy
2. **Real-Time Messaging** - Socket.io for instant message delivery with toast notifications
3. **Contact Management** - Add contacts by email, bidirectional connection flow
4. **File Attachments** - Cloudinary-based media storage with signed uploads
5. **Profile Management** - Update name, profile picture with cloud storage
6. **QR Code Sharing** - Generate scannable QR codes for easy profile sharing
7. **Email Verification** - Gmail OAuth-based verification (production only)

---

## 2. Project Structure

```
ChatIn/
├── package.json                             # Root monorepo scripts
├── README.md                                # Project documentation
├── AGENTS.md                                # Project overview, structure, commands, and critical patterns
├── client/                                  # Frontend React application
│   ├── AGENTS.md                            # Frontend React, TanStack Query, Axios, and styling patterns
│   ├── package.json                         # Frontend dependencies
│   ├── vite.config.js                       # Vite build configuration
│   ├── eslint.config.js                     # ESLint rules
│   ├── index.html                           # HTML entry point
│   ├── .env.example                         # Environment template
│   ├── dist/                                # Production build output
│   └── src/
│       ├── main.jsx                         # React entry with provider hierarchy
│       ├── App.jsx                          # Router configuration
│       ├── styles.css                       # Global styles + Tailwind theme
│       ├── lib/                             # Shared utility functions and libraries (utils.js)
│       ├── components/                      # Reusable UI components
│       │   ├── ui/                          # Generic UI primitives (emoji-picker.jsx, popover.jsx)
│       │   ├── ChatPanel.jsx                # Main chat interface
│       │   ├── Loading.jsx                  # Loading indicator
│       │   ├── NoChat.jsx                   # Empty chat state
│       │   └── ProfileQRCodeModal.jsx
│       ├── pages/                           # Page-level components
│       │   ├── Home.jsx                     # Main chat page
│       │   ├── Profile.jsx                  # User profile
│       │   ├── SignIn.jsx                   # Login
│       │   ├── SignUp.jsx                   # Registration
│       │   ├── EmailVerify.jsx              # Email verification
│       │   └── NotFound.jsx                 # 404 page
│       └── utils/
│           ├── ProtectedRoute.jsx           # Auth guard component
│           ├── actions/                     # Async action utilities
│           │   └── upload.actions.js
│           ├── apis/                        # API configuration
│           │   └── axios.jsx
│           ├── contexts/                    # React Context providers
│           │   ├── AuthContext.jsx
│           │   ├── ResourceContext.jsx
│           │   └── SocketContext.jsx
│           ├── controllers/                 # React Query hooks
│           │   ├── addContact.jsx
│           │   ├── fetchContacts.jsx
│           │   ├── fetchMessages.jsx
│           │   ├── reactToMessage.jsx
│           │   └── sendMessage.jsx
│           └── hooks/                       # Custom React hooks
│               ├── useAuth.jsx
│               ├── useResource.jsx
│               ├── useSocket.jsx
│               └── useValidate.jsx
│
└── server/                                  # Backend Express application
    ├── AGENTS.md                            # Backend Express, Sequelize, Socket.io, and middleware patterns
    ├── package.json                         # Backend dependencies
    ├── index.js                             # Express app entry point
    ├── socket.js                            # Socket.io setup
    ├── middlewares.js                       # Auth + upload middlewares
    ├── .env.example                         # Environment template
    ├── config/                              # Service configurations
    │   ├── sequelize.config.js              # PostgreSQL/Sequelize
    │   ├── passport.config.js               # JWT authentication
    │   └── cloudinary.config.js             # Cloudinary setup
    ├── models/                              # Sequelize models
    │   ├── user.models.js
    │   ├── connection.models.js
    │   └── message.models.js
    ├── controllers/                         # Route handlers
    │   ├── authorize.controllers.js
    │   ├── connection.controllers.js
    │   ├── message.controllers.js
    │   ├── profile.controllers.js
    │   ├── upload.controllers.js
    │   └── verification.controllers.js
    └── routes/                              # Express routes
        ├── authorize.routes.js
        ├── connection.routes.js
        ├── message.routes.js
        ├── profile.routes.js
        ├── upload.routes.js
        └── verification.routes.js
```

---

## 3. Development Setup & Commands

### Client Commands (`client/`)

```bash
npm run dev      # Start Vite dev server (port 3000)
npm run build    # Production build to dist/
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Server Commands (`server/`)

```bash
npm run dev      # Start with nodemon + dotenv (hot reload)
npm start        # Production start
```

### Quick Start for Local Development

```bash
# Terminal 1 - Start PostgreSQL database (if not running)
# Ensure PostgreSQL is running on localhost:5432

# Terminal 2 - Start backend
cd server
cp .env.example .env  # Configure environment variables
npm install
npm run dev

# Terminal 3 - Start frontend
cd client
cp .env.example .env  # Configure environment variables
npm install
npm run dev
```

### Required Environment Variables

**Client (`client/.env`):**
```env
# Environment mode
VITE_NODE_ENV=development              # 'development' or 'production'

# Cloudinary (for direct browser uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

**Server (`server/.env`):**
```env
# App Configuration
APP_ORIGIN=https://your-app-url.com    # Production URL (not needed in dev)
NODE_ENV=development                    # 'development' or 'production'
PORT=4000                               # Server port

# Database
PG_URI_DEV=postgres://user:pass@localhost:5432/chatin_dev
PG_URI_PROD=your_cloud_postgres_uri     # Production database

# Authentication
JWT_SECRET=your_secure_jwt_secret       # Minimum 32 characters recommended

# Cloudinary (file storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gmail OAuth (production email verification only)
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REDIRECT_URI=https://developers.google.com/oauthplayground
GMAIL_REFRESH_TOKEN=your_refresh_token
SENDER_EMAIL=your_email@gmail.com
```

---

## 4. File Naming Conventions

| Type | Convention | Examples |
|------|------------|----------|
| React Components | `PascalCase.jsx` | `ChatPanel.jsx`, `SignIn.jsx` |
| Hooks | `useCamelCase.jsx` | `useAuth.jsx`, `useValidate.jsx` |
| Contexts | `PascalCaseContext.jsx` | `AuthContext.jsx`, `SocketContext.jsx` |
| Controllers (client) | `camelCase.jsx` | `fetchContacts.jsx`, `sendMessage.jsx` |
| Controllers (server) | `domain.controllers.js` | `message.controllers.js` |
| Routes (server) | `domain.routes.js` | `message.routes.js` |
| Models (server) | `domain.models.js` | `user.models.js` |
| Config files | `domain.config.js` | `sequelize.config.js` |
| Actions | `domain.actions.js` | `upload.actions.js` |

### Import Organization

Follow this import order (observed from `client/src/pages/Home.jsx`):

```jsx
// 1. React and React hooks
import React, { useRef, useState, useEffect } from "react";

// 2. Third-party libraries
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from "react-router-dom";

// 3. Components
import NoChat from "../components/NoChat";
import ChatPanel from "../components/ChatPanel";

// 4. Custom hooks
import useAuth from "../utils/hooks/useAuth";

// 5. Controllers/API functions
import addContact from "../utils/controllers/addContact";
import fetchContacts from "../utils/controllers/fetchContacts";

// 6. Utils/actions/APIs
import axios from "../utils/apis/axios";
```

---

## 5. Critical Patterns to Follow

### Always Use

1. **Error handling** with `try/catch` and proper error logging
2. **Toast notifications** for user feedback (`react-toastify`)
3. **React Query** for server state, not local state
4. **Axios instance** from `utils/apis/axios.jsx` (never raw axios)
5. **useCallback** for event handlers passed as props
6. **PropTypes** for context providers
7. **Tailwind theme colors** (`bg-primary-white`, `text-primary-black`, etc.)

### Never Do

1. Don't use raw `fetch()` for API calls - use configured Axios
2. Don't store server state in `useState` - use React Query
3. Don't create new axios instances - use shared one
4. Don't use inline colors - use theme variables
5. Don't forget `withCredentials: true` for auth requests
6. Don't emit socket events without checking socket connection

### Socket Event Names

| Event | Direction | Payload |
|-------|-----------|---------|
| `newConnection` | Server → Client | Connection object |
| `newMessage` | Server → Client | Message object with sender |

### API Route Structure

| Route | Auth Required | Description |
|-------|--------------|-------------|
| `POST /api/authorize/login` | No | User login |
| `POST /api/authorize/register` | No | User registration |
| `POST /api/authorize/logout` | No | User logout |
| `GET /api/authorize/status` | Yes | Check auth status |
| `GET /api/connections/:userId` | Yes | Get user contacts |
| `POST /api/connections/:userId` | Yes | Add new contact |
| `GET /api/messages/:connectionId` | Yes | Get messages |
| `POST /api/messages/send` | Yes | Send message |
| `GET /api/profile/:userId` | Yes | Get profile |
| `PUT /api/profile/:userId` | Yes | Update profile |
| `POST /api/upload/sign` | Yes | Get avatar upload signature |
| `POST /api/upload/sign-media` | Yes | Get media upload signature |

---

## 6. Common Tasks Reference

### Adding a New Page

1. Create component in `client/src/pages/NewPage.jsx`
2. Add route in `client/src/App.jsx`:
   ```jsx
   <Route path="new-page" element={<NewPage />} />
   ```
3. If protected, nest under `<Route element={<ProtectedRoute />}>`

### Adding a New API Endpoint

1. Create controller in `server/controllers/domain.controllers.js`
2. Create route in `server/routes/domain.routes.js`
3. Mount in `server/index.js` (protected or public)
4. Create React Query hook in `client/src/utils/controllers/`

### Adding a New Context

1. Create context in `client/src/utils/contexts/NewContext.jsx`
2. Create hook in `client/src/utils/hooks/useNew.jsx`
3. Add provider to hierarchy in `client/src/main.jsx`

### Adding Real-Time Feature

1. Add socket event handler in `server/socket.js` or controller
2. Emit event: `io.to(socketId).emit("eventName", data)`
3. Listen in `SocketContext.jsx`:
   ```jsx
   socketInstance.on("eventName", (data) => {
     queryClient.invalidateQueries(["queryKey"]);
   });
   ```
