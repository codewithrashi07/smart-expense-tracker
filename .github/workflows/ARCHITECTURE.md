# Architecture Overview

This document describes the high-level architecture, system design, and technical decisions for the Smart Expense Tracker application.

## Table of Contents

- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Directory Structure](#directory-structure)
- [Data Flow](#data-flow)
- [Database Schema](#database-schema)
- [API Architecture](#api-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Authentication Flow](#authentication-flow)
- [Deployment Architecture](#deployment-architecture)
- [Security Architecture](#security-architecture)
- [Performance Optimization](#performance-optimization)

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         React Frontend (Vite)                             │  │
│  │  ├─ Components (UI)                                       │  │
│  │  ├─ Context API (State Management)                        │  │
│  │  ├─ React Router (Navigation)                             │  │
│  │  └─ Axios (HTTP Client)                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    (HTTPS REST API Calls)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              Express.js Backend (Node.js)                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Routes & Controllers                                    │  │
│  │  ├─ Authentication Routes (/api/auth)                    │  │
│  │  ├─ Transaction Routes (/api/transactions)               │  │
│  │  ├─ Budget Routes (/api/budgets)                         │  │
│  │  └─ Analytics Routes (/api/analytics)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Middleware Layer                                        │  │
│  │  ├─ Authentication (JWT)                                 │  │
│  │  ├─ Error Handling                                       │  │
│  │  ├─ Request Validation                                   │  │
│  │  └─ CORS Configuration                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Business Logic (Services/Controllers)                   │  │
│  │  ├─ User Service                                         │  │
│  │  ├─ Transaction Service                                  │  │
│  │  ├─ Budget Service                                       │  │
│  │  └─ Analytics Service                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Data Access Layer (Models/Mongoose)                     │  │
│  │  ├─ User Model                                           │  │
│  │  ├─ Transaction Model                                    │  │
│  │  └─ Budget Model                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    (MongoDB Queries)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│           MongoDB Atlas (Cloud Database)                         │
│                                                                   │
│  ├─ Users Collection                                             │
│  ├─ Transactions Collection                                      │
│  ├─ Budgets Collection                                           │
│  └─ Indexes for Performance                                      │
└─────────────────────────────────────────────────────────────────┘

External Services:
├─ Cloudinary (Image Storage & Processing)
└─ Vercel/Render (Deployment & Hosting)
```

---

## Technology Stack

### Frontend Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Framework** | React 19 | Component-based UI |
| **Build Tool** | Vite | Fast build & dev server |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Routing** | React Router v6 | Client-side routing |
| **HTTP Client** | Axios | REST API calls |
| **State Management** | Context API | Global state management |
| **Forms** | React Hook Form | Efficient form handling |
| **Charts** | Recharts | Data visualization |
| **Animations** | Framer Motion | Smooth animations |
| **Package Manager** | npm | Dependency management |

### Backend Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js | JavaScript runtime |
| **Framework** | Express.js | Web server framework |
| **Database** | MongoDB + Mongoose | NoSQL database & ODM |
| **Authentication** | JWT + Bcrypt | Secure auth & encryption |
| **File Upload** | Multer + Cloudinary | Image upload handling |
| **Environment** | dotenv | Environment variables |
| **CORS** | cors package | Cross-origin requests |
| **Package Manager** | npm | Dependency management |

### Deployment Stack

| Component | Service | Region |
|-----------|---------|--------|
| **Frontend** | Vercel | Edge globally |
| **Backend** | Render | US/EU regions |
| **Database** | MongoDB Atlas | AWS/Azure/Google Cloud |
| **Storage** | Cloudinary | CDN globally |

---

## Directory Structure

### Frontend (`client/`)

```
client/
├── src/
│   ├── components/
│   │   ├── Auth/                    # Login, Register, Password Reset
│   │   ├── Dashboard/               # Dashboard widgets & overview
│   │   ├── Transactions/            # Transaction CRUD components
│   │   ├── Budget/                  # Budget planning & tracking
│   │   ├── Analytics/               # Charts & reports
│   │   ├── Common/                  # Navbar, Sidebar, Footer
│   │   └── UI/                      # Reusable UI components
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx            # Login page
│   │   ├── RegisterPage.jsx         # Registration page
│   │   ├── DashboardPage.jsx        # Main dashboard
│   │   ├── TransactionsPage.jsx     # Transactions management
│   │   ├── BudgetPage.jsx           # Budget management
│   │   ├── AnalyticsPage.jsx        # Analytics & reports
│   │   ├── ProfilePage.jsx          # User profile
│   │   └── NotFoundPage.jsx         # 404 page
│   │
│   ├── hooks/
│   │   ├── useAuth.js               # Authentication hook
│   │   ├── useTransactions.js       # Transactions hook
│   │   ├── useBudget.js             # Budget hook
│   │   ├── useTheme.js              # Theme toggle hook
│   │   └── useFetch.js              # Generic fetch hook
│   │
│   ├── services/
│   │   ├── authService.js           # Auth API calls
│   │   ├── transactionService.js    # Transaction API calls
│   │   ├── budgetService.js         # Budget API calls
│   │   └── analyticsService.js      # Analytics API calls
│   │
│   ├── context/
│   │   ├── AuthContext.jsx          # Auth state provider
│   │   ├── ThemeContext.jsx         # Theme state provider
│   │   └── TransactionContext.jsx   # Transaction state provider
│   │
│   ├── utils/
│   │   ├── axiosConfig.js           # Axios instance & interceptors
│   │   ├── formatters.js            # Data formatting utilities
│   │   ├── validators.js            # Form validation helpers
│   │   └── constants.js             # App constants
│   │
│   ├── assets/
│   │   ├── images/                  # Images & icons
│   │   └── fonts/                   # Custom fonts
│   │
│   ├── App.jsx                      # Main App component
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles
│
├── public/                          # Static files
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── .env.example
```

### Backend (`server/`)

```
server/
├── config/
│   ├── database.js                  # MongoDB connection
│   ├── cloudinary.js                # Cloudinary setup
│   └── constants.js                 # App constants
│
├── controllers/
│   ├── authController.js            # Auth logic (register, login)
│   ├── transactionController.js     # Transaction operations
│   ├── budgetController.js          # Budget operations
│   ├── analyticsController.js       # Analytics calculations
│   └── userController.js            # User profile operations
│
├── models/
│   ├── User.js                      # User schema
│   ├── Transaction.js               # Transaction schema
│   ├── Budget.js                    # Budget schema
│   └── index.js                     # Model exports
│
├── middleware/
│   ├── auth.js                      # JWT authentication
│   ├── errorHandler.js              # Global error handling
│   ├── validation.js                # Input validation
│   ├── upload.js                    # File upload config
│   └── cors.js                      # CORS configuration
│
├── routes/
│   ├── authRoutes.js                # /api/auth routes
│   ├── transactionRoutes.js         # /api/transactions routes
│   ├── budgetRoutes.js              # /api/budgets routes
│   ├── analyticsRoutes.js           # /api/analytics routes
│   └── userRoutes.js                # /api/user routes
│
├── utils/
│   ├── errorHandler.js              # Error handling utilities
│   ├── responseFormatter.js         # Response formatting
│   ├── validators.js                # Validation helpers
│   └── helpers.js                   # General helpers
│
├── uploads/                         # Temporary file storage
│
├── app.js                           # Express app setup
├── server.js                        # Server entry point
├── package.json
└── .env.example
```

---

## Data Flow

### User Authentication Flow

```
1. User enters email/password on login form
   ↓
2. Frontend sends POST /api/auth/login
   ↓
3. Backend validates credentials
   ↓
4. Backend checks password hash with bcrypt
   ↓
5. On success: Generate JWT token
   ↓
6. Return token to frontend
   ↓
7. Frontend stores token in localStorage
   ↓
8. Frontend sets Authorization header for future requests
   ↓
9. User can now access protected routes
```

### Transaction Creation Flow

```
1. User fills transaction form (amount, category, description, receipt)
   ↓
2. Frontend validates form input
   ↓
3. If receipt: Upload image to Cloudinary via Multer
   ↓
4. Frontend sends POST /api/transactions with data + JWT token
   ↓
5. Backend middleware verifies JWT token
   ↓
6. Backend validates input data
   ↓
7. Backend creates new Transaction document in MongoDB
   ↓
8. Backend returns created transaction with ID
   ↓
9. Frontend adds transaction to local state
   ↓
10. Frontend updates dashboard & refreshes charts
   ↓
11. Toast notification shown to user
```

### Analytics Data Flow

```
1. User navigates to Analytics page
   ↓
2. Frontend sends GET /api/analytics/monthly
   ↓
3. Backend receives request with user ID from JWT
   ↓
4. Backend queries MongoDB for user's transactions
   ↓
5. Backend aggregates data by month/category
   ↓
6. Backend calculates totals and percentages
   ↓
7. Backend returns formatted data
   ↓
8. Frontend receives data and caches it
   ↓
9. Recharts renders visualization
   ↓
10. User can interact with charts
```

---

## Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  profileImage: String (Cloudinary URL),
  dateOfBirth: Date,
  currency: String (default: 'USD'),
  theme: String (default: 'light'),
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  isActive: Boolean (default: true)
}
```

### Transaction Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (Reference to User),
  type: String (enum: ['income', 'expense']),
  amount: Number,
  category: String (enum: ['salary', 'food', 'transport', ...]),
  description: String,
  date: Date,
  receiptImage: String (Cloudinary URL, optional),
  tags: [String],
  notes: String,
  createdAt: Date,
  updatedAt: Date,
  
  // Indexes for performance
  // Index: userId, date
  // Index: userId, category
  // Index: userId, type
}
```

### Budget Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (Reference to User),
  month: Date (first day of month),
  category: String,
  budgetAmount: Number,
  spentAmount: Number (calculated from transactions),
  alerts: {
    emailAlert: Boolean,
    notificationAlert: Boolean,
    threshold: Number (percentage, default: 80)
  },
  createdAt: Date,
  updatedAt: Date,
  
  // Index: userId, month
}
```

### Indexes for Performance

```javascript
// User indexes
db.users.createIndex({ email: 1 }, { unique: true })

// Transaction indexes
db.transactions.createIndex({ userId: 1, date: -1 })
db.transactions.createIndex({ userId: 1, category: 1 })
db.transactions.createIndex({ userId: 1, type: 1 })

// Budget indexes
db.budgets.createIndex({ userId: 1, month: -1 })
```

---

## API Architecture

### Base URL
```
Backend: https://smart-expense-tracker-api.onrender.com
API Base: https://smart-expense-tracker-api.onrender.com/api
```

### Authentication Endpoints

```
POST /api/auth/register
  Body: { name, email, password, confirmPassword }
  Response: { userId, token, user }
  Status: 201

POST /api/auth/login
  Body: { email, password }
  Response: { token, user }
  Status: 200

POST /api/auth/logout
  Headers: { Authorization: Bearer <token> }
  Response: { message: 'Logged out successfully' }
  Status: 200

POST /api/auth/refresh-token
  Headers: { Authorization: Bearer <token> }
  Response: { token }
  Status: 200

POST /api/auth/forgot-password
  Body: { email }
  Response: { message: 'Reset link sent to email' }
  Status: 200
```

### Transaction Endpoints

```
GET /api/transactions
  Headers: { Authorization: Bearer <token> }
  Query: { page=1, limit=10, category=food, startDate=..., endDate=... }
  Response: { transactions: [], total, hasMore }
  Status: 200

GET /api/transactions/:id
  Headers: { Authorization: Bearer <token> }
  Response: { transaction }
  Status: 200

POST /api/transactions
  Headers: { Authorization: Bearer <token> }
  Body: { type, amount, category, description, date, receiptImage (optional) }
  Response: { transaction }
  Status: 201

PATCH /api/transactions/:id
  Headers: { Authorization: Bearer <token> }
  Body: { amount, category, description, date, ... }
  Response: { transaction }
  Status: 200

DELETE /api/transactions/:id
  Headers: { Authorization: Bearer <token> }
  Response: { message: 'Deleted successfully' }
  Status: 200
```

### Budget Endpoints

```
GET /api/budgets
  Headers: { Authorization: Bearer <token> }
  Query: { month=2024-08 }
  Response: { budgets: [] }
  Status: 200

POST /api/budgets
  Headers: { Authorization: Bearer <token> }
  Body: { category, budgetAmount, month, alertThreshold }
  Response: { budget }
  Status: 201

PATCH /api/budgets/:id
  Headers: { Authorization: Bearer <token> }
  Body: { budgetAmount, alertThreshold, ... }
  Response: { budget }
  Status: 200

DELETE /api/budgets/:id
  Headers: { Authorization: Bearer <token> }
  Response: { message: 'Deleted successfully' }
  Status: 200
```

### Analytics Endpoints

```
GET /api/analytics/monthly
  Headers: { Authorization: Bearer <token> }
  Query: { month=2024-08 }
  Response: { income, expenses, savings, categories: {} }
  Status: 200

GET /api/analytics/yearly
  Headers: { Authorization: Bearer <token> }
  Query: { year=2024 }
  Response: { monthlyData: [] }
  Status: 200

GET /api/analytics/category
  Headers: { Authorization: Bearer <token> }
  Response: { categoryDistribution: {} }
  Status: 200

GET /api/analytics/summary
  Headers: { Authorization: Bearer <token> }
  Response: { totalIncome, totalExpenses, netSavings, avgExpense }
  Status: 200
```

---

## Frontend Architecture

### Component Hierarchy

```
App
├── AuthContext Provider
├── ThemeContext Provider
├── ProtectedRoute Wrapper
│   ├── MainLayout
│   │   ├── Navbar
│   │   ├── Sidebar
│   │   └── Main Content
│   │       ├── Dashboard Page
│   │       │   ├── BalanceCard
│   │       │   ├── RecentTransactions
│   │       │   ├── BudgetOverview
│   │       │   └── Charts
│   │       │
│   │       ├── Transactions Page
│   │       │   ├── TransactionList
│   │       │   ├── TransactionForm
│   │       │   ├── FilterBar
│   │       │   └── SearchBar
│   │       │
│   │       ├── Budget Page
│   │       │   ├── BudgetForm
│   │       │   └── BudgetList
│   │       │
│   │       ├── Analytics Page
│   │       │   ├── MonthlyChart
│   │       │   ├── CategoryChart
│   │       │   ├── TrendAnalysis
│   │       │   └── Reports
│   │       │
│   │       └── Profile Page
│   │           ├── ProfileForm
│   │           └── Settings
│   │
│   └── Footer
│
└── Public Routes
    ├── Login Page
    ├── Register Page
    └── 404 Page
```

### State Management (Context API)

```javascript
// AuthContext
- user: { id, name, email, ... }
- token: JWT token
- isAuthenticated: boolean
- login(): void
- logout(): void
- register(): void

// ThemeContext
- theme: 'light' | 'dark'
- toggleTheme(): void

// TransactionContext
- transactions: Transaction[]
- loading: boolean
- error: string | null
- addTransaction(): void
- updateTransaction(): void
- deleteTransaction(): void
- fetchTransactions(): void
```

---

## Authentication Flow

### Registration Flow

```
User Input → Frontend Validation → 
  ↓
POST /api/auth/register → 
  ↓
Backend Validation → 
  ↓
Hash Password (bcrypt) → 
  ↓
Save User to DB → 
  ↓
Generate JWT Token → 
  ↓
Return Token + User Data → 
  ↓
Store Token in localStorage → 
  ↓
Redirect to Dashboard
```

### Login Flow

```
User Input → Frontend Validation → 
  ↓
POST /api/auth/login → 
  ↓
Backend: Find User by Email → 
  ↓
Compare Password with Hash → 
  ↓
On Match: Generate JWT Token → 
  ↓
Return Token + User Data → 
  ↓
Store Token in localStorage → 
  ↓
Set Authorization Header → 
  ↓
Redirect to Dashboard
```

### Token Management

```
JWT Structure:
{
  Header: { alg: 'HS256', typ: 'JWT' }
  Payload: { 
    userId: '...',
    email: '...',
    iat: timestamp,
    exp: timestamp (7 days)
  }
  Signature: HMAC-SHA256(secret)
}

Axios Interceptor Flow:
Request → Add Authorization Header → 
  ↓
Response → Check for 401 Unauthorized → 
  ↓
If 401: Try Refresh Token → 
  ↓
If Refresh Success: Retry Original Request → 
  ↓
If Refresh Fails: Redirect to Login
```

---

## Deployment Architecture

### Frontend Deployment (Vercel)

```
GitHub Repository
    ↓
Push to main branch
    ↓
Vercel Webhook Triggered
    ↓
Clone Repository
    ↓
Install Dependencies (npm install)
    ↓
Build Project (npm run build)
    ↓
Run Tests (if configured)
    ↓
Deploy to Edge Network
    ↓
Set Environment Variables (VITE_API_BASE_URL)
    ↓
Accessible at: https://smart-expense-tracker-phi.vercel.app
```

### Backend Deployment (Render)

```
GitHub Repository
    ↓
Push to main branch
    ↓
Render Webhook Triggered
    ↓
Clone Repository
    ↓
Install Dependencies (npm install)
    ↓
Build if applicable
    ↓
Start Service (npm run dev or npm start)
    ↓
Set Environment Variables (PORT, MONGO_URI, etc.)
    ↓
Accessible at: https://smart-expense-tracker-api.onrender.com
```

### Database Deployment (MongoDB Atlas)

```
MongoDB Cloud Account
    ↓
Create Cluster
    ↓
Configure Network Access (IP Whitelist)
    ↓
Create Database User (username + password)
    ↓
Generate Connection String (MONGO_URI)
    ↓
Backend connects via Mongoose
    ↓
Data persisted in cloud
```

---

## Security Architecture

### Authentication Security

```
✅ Password Encryption
   └─ bcrypt with 10 salt rounds
   └─ Passwords never stored in plain text

✅ JWT Tokens
   └─ Signed with HMAC-SHA256
   └─ 7-day expiration
   └─ Stored in localStorage (frontend)
   └─ Sent in Authorization header

✅ Protected Routes
   └─ Middleware validates JWT on every request
   └─ Invalid/expired tokens rejected
   └─ User can only access own data
```

### Data Protection

```
✅ HTTPS/TLS
   └─ All communications encrypted
   └─ SSL certificates on Vercel & Render

✅ Input Validation
   └─ Frontend validation (UX)
   └─ Backend validation (Security)
   └─ Sanitization of inputs

✅ CORS Configuration
   └─ Only allowed origins accepted
   └─ Prevents cross-site attacks

✅ Environment Variables
   └─ Secrets never in code
   └─ Loaded from .env file
   └─ Different per environment
```

### Database Security

```
✅ MongoDB Atlas
   └─ Network access restrictions
   └─ IP whitelisting
   └─ SSL encryption for connections
   └─ Database user authentication

✅ Data Isolation
   └─ Each user only sees own data
   └─ userId in all queries
   └─ No global admin queries
```

---

## Performance Optimization

### Frontend Optimization

```
✅ Code Splitting
   └─ React Router lazy loading
   └─ Separate bundles per route

✅ Image Optimization
   └─ Cloudinary transformations
   └─ Automatic compression
   └─ WebP format support

✅ Caching
   └─ Browser cache headers
   └─ Service worker (PWA ready)
   └─ API response caching

✅ Bundle Size
   └─ Minification & compression
   └─ Tree shaking
   └─ Gzip compression (~35KB)

✅ Rendering Optimization
   └─ React.memo for components
   └─ useCallback for event handlers
   └─ Virtual scrolling for lists
```

### Backend Optimization

```
✅ Database Indexing
   └─ Indexed on userId
   └─ Indexed on dates
   └─ Composite indexes for queries

✅ Query Optimization
   └─ Projection (select specific fields)
   └─ Pagination (limit + skip)
   └─ Aggregation pipeline for analytics

✅ Caching Strategy
   └─ Redis ready (future enhancement)
   └─ Response caching headers

✅ Connection Pooling
   └─ MongoDB connection pool
   └─ Reuse connections

✅ API Response
   └─ Average response time: <200ms
   └─ Gzip compression enabled
   └─ JSON minification
```

### Monitoring & Logging

```
✅ Error Tracking
   └─ Global error handler
   └─ Console error logging
   └─ Error monitoring service (future)

✅ Performance Monitoring
   └─ Lighthouse scores
   └─ API response times
   └─ Database query times

✅ User Analytics
   └─ Page views
   └─ Feature usage (future)
   └─ User engagement
```

---

## Future Architecture Improvements

- [ ] Implement Redis for caching
- [ ] Add message queue (RabbitMQ/Bull)
- [ ] Microservices architecture
- [ ] GraphQL API alternative
- [ ] Real-time updates with WebSockets
- [ ] Mobile app (React Native)
- [ ] PWA with offline sync
- [ ] AI service integration
- [ ] Multi-tenant support
- [ ] Advanced monitoring & alerting

---

## References

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Introduction](https://jwt.io/introduction)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Last Updated:** August 24, 2024

For questions or suggestions about the architecture, please open an issue or discussion on GitHub.
