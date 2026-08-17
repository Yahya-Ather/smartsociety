# Smart Society Management - Complete Backend Architecture Guide

A production-ready, enterprise-grade backend REST API for a residential society management system built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)** using **ECMAScript (ES) Modules**.

---

## Table of Contents
1. [Architecture & Design Pattern](#1-architecture--design-pattern)
2. [Project Structure](#2-project-structure)
3. [Environment Configuration](#3-environment-configuration)
4. [Step-by-Step Codebase Walkthrough](#4-step-by-step-codebase-walkthrough)
   - [4.1 Entry Point & Application Bootstrap](#41-entry-point--application-bootstrap)
   - [4.2 Database & Third-Party Configuration](#42-database--third-party-configuration)
   - [4.3 Middleware Pipeline](#43-middleware-pipeline)
   - [4.4 Data Layer (Mongoose Models)](#44-data-layer-mongoose-models)
   - [4.5 Controller Layer (Business Logic)](#45-controller-layer-business-logic)
   - [4.6 Routing Layer (HTTP Endpoints)](#46-routing-layer-http-endpoints)
5. [Role-Based Access Control (RBAC) Matrix](#5-role-based-access-control-rbac-matrix)
6. [API Endpoints Reference](#6-api-endpoints-reference)
7. [Installation & Setup](#7-installation--setup)

---

## 1. Architecture & Design Pattern

This project follows a strict **Model-View-Controller (MVC)** architectural pattern adapted for REST APIs:

```
[ Client Request ]
       │
       ▼
[ Express Middleware Pipeline ] ── (CORS, Body Parsers)
       │
       ▼
[ Authentication & Role Guard ] ── (JWT Verification & RBAC)
       │
       ▼
[ Route Dispatcher ] ───────────── (routes/*.js)
       │
       ▼
[ Business Controller ] ────────── (controllers/*.js)
       │
       ▼
[ Data Layer / Models ] ────────── (models/*.js <-> MongoDB)
       │
       ▼
[ Standardized Response ] ──────── (JSON output / Error Handler)
```

### Core Architecture Principles:
- **ES Modules Everywhere**: Native `import`/`export` syntax enabled via `"type": "module"` in `package.json`.
- **Explicit File Extensions**: All relative imports include `.js` extensions for native Node.js ESM runtime compatibility.
- **Strict Separation of Concerns**: Routes only map URLs to handlers; Controllers contain pure business logic; Models enforce database schema rules and hooks.
- **Fail-Safe Global Error Boundary**: Uncaught controller exceptions are passed to Express `next(error)` and transformed into consistent JSON responses.

---

## 2. Project Structure

```text
smart/
├── .env.example                # Blueprint for environment variables
├── .gitignore                  # Git ignore rules for node_modules and secrets
├── package.json                # Project manifest, scripts, and dependencies
├── README.md                   # Complete architectural guide and documentation
└── src/
    ├── server.js               # Application bootstrap and port listener
    ├── app.js                  # Express app initialization and middleware stack
    ├── config/
    │   ├── db.js               # MongoDB Mongoose connection handler
    │   └── cloudinary.js       # Cloudinary SDK & Multer storage configuration
    ├── middlewares/
    │   ├── authMiddleware.js   # JWT token verification and user extraction
    │   ├── roleMiddleware.js   # Dynamic Role-Based Access Control (RBAC) guard
    │   └── errorMiddleware.js  # Global centralized error handler
    ├── models/
    │   ├── User.js             # User accounts, role definitions, password hashing
    │   ├── Flat.js             # Housing units, blocks, and occupancy types
    │   ├── Visitor.js          # Pre-approved and walk-in visitor logs
    │   ├── Complaint.js        # Resident tickets with Cloudinary image attachments
    │   ├── Bill.js             # Flat maintenance billing records
    │   └── Notice.js           # Admin society notices and announcements
    ├── controllers/
    │   ├── authController.js   # Authentication and token issuance logic
    │   ├── adminController.js  # Flats, resident onboarding, bulk billing, notices
    │   ├── residentController.js # Bills, simulated payments, passes, complaints
    │   └── securityController.js # Pass validation, walk-ins, active visitor tracking
    └── routes/
        ├── authRoutes.js       # /api/auth
        ├── adminRoutes.js      # /api/admin
        ├── residentRoutes.js   # /api/resident
        └── securityRoutes.js   # /api/security
```

---

## 3. Environment Configuration

The application requires specific environment variables to run. Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/smart_society
JWT_SECRET=super_secret_jwt_key_society_management_2026
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Variable Breakdown:
- `PORT`: Port on which the HTTP server listens (default: `5000`).
- `MONGO_URI`: MongoDB connection string (local or MongoDB Atlas cluster).
- `JWT_SECRET`: Secret key used for signing and verifying JSON Web Tokens.
- `CLOUDINARY_*`: API credentials for Cloudinary image upload storage.

---

## 4. Step-by-Step Codebase Walkthrough

---

### 4.1 Entry Point & Application Bootstrap

#### 1. `src/server.js`
The main entry point of the Node process. It connects to the database before binding to the HTTP port.

```javascript
import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
```
- **Line-by-Line Purpose**:
  - `dotenv.config({ quiet: true })`: Loads `.env` variables cleanly without diagnostic console noise.
  - `await connectDB()`: Ensures database connectivity before opening the network port, preventing requests from hitting an unconnected database.
  - `app.listen(PORT, ...)`: Binds Express to the specified port and logs the clickable localhost URL.

#### 2. `src/app.js`
Initializes Express, configures global parsing and security middlewares, mounts domain routes, and installs error boundaries.

```javascript
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import residentRoutes from './routes/residentRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Society Management API is operational'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Society Management API is operational.'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resident', residentRoutes);
app.use('/api/security', securityRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

app.use(errorMiddleware);

export default app;
```
- **Key Concepts**:
  - `cors()`: Allows Cross-Origin Resource Sharing for frontend web clients.
  - `express.json()` & `express.urlencoded()`: Automatically parses incoming JSON and URL-encoded request payloads into `req.body`.
  - `404 Handler`: Catches any unmatched route and returns a clean JSON error.
  - `errorMiddleware`: Sits at the very bottom to catch any error passed through `next(err)`.

---

### 4.2 Database & Third-Party Configuration

#### 1. `src/config/db.js`
Handles MongoDB connection using Mongoose.

```javascript
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
```
- **Key Concepts**:
  - `mongoose.connect(process.env.MONGO_URI)`: Creates an asynchronous connection pool to MongoDB.
  - `process.exit(1)`: Terminates the Node runtime immediately if database connection fails.

#### 2. `src/config/cloudinary.js`
Configures Cloudinary v2 and provides a Multer storage engine for direct cloud file uploads.

```javascript
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'smart_society/complaints',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

export const upload = multer({ storage });
export { cloudinary };
```
- **Key Concepts**:
  - `CloudinaryStorage`: Streams uploaded files directly to Cloudinary without storing temporary files on local disk.
  - `upload.single('photo')`: Multer middleware attached to complaint routes to process multipart/form-data.

---

### 4.3 Middleware Pipeline

#### 1. `src/middlewares/authMiddleware.js`
Protects private routes by validating JWT Bearer tokens.

```javascript
import jwt from 'jsonwebtoken';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization denied: No token provided or invalid format.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};
```
- **How It Works**:
  1. Inspects the `Authorization` HTTP header for `Bearer <JWT>`.
  2. Decodes and verifies the signature using `jwt.verify()`.
  3. Attaches the decoded payload (`id`, `username`, `role`, `flat_id`) to `req.user`.
  4. Calls `next()` to pass execution to the next middleware/controller.

#### 2. `src/middlewares/roleMiddleware.js`
Enforces Role-Based Access Control (RBAC).

```javascript
export const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] role(s).`
      });
    }

    next();
  };
};
```
- **How It Works**:
  - Higher-order function returning a custom middleware for given roles (e.g., `roleMiddleware(['Admin'])`).
  - Returns `403 Forbidden` if `req.user.role` is not present in `allowedRoles`.

#### 3. `src/middlewares/errorMiddleware.js`
Centralized error handling middleware.

```javascript
export const errorMiddleware = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err.statusCode || 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};
```
- **How It Works**:
  - Express recognizes 4 arguments `(err, req, res, next)` as an error handler.
  - Ensures client always receives a standardized JSON format: `{ success: false, message: ... }`.

---

### 4.4 Data Layer (Mongoose Models)

#### 1. `src/models/Flat.js`
Defines individual residential apartments.
- Fields: `block_name` (String), `flat_number` (String), `occupancy_type` ('Owner' | 'Tenant').
- Includes automatic `timestamps` (`createdAt`, `updatedAt`).

#### 2. `src/models/User.js`
Defines application users across all three roles.
- Fields: `username` (unique String), `password` (hashed String), `role` ('Admin' | 'Resident' | 'Guard'), `flat_id` (ObjectId reference to `Flat`).
- **Pre-Save Hook**: Automatically hashes `password` using `bcrypt.genSalt(10)` and `bcrypt.hash()` whenever the password field is modified.
- **Instance Method `matchPassword`**: Uses `bcrypt.compare()` for secure login verification.

#### 3. `src/models/Visitor.js`
Tracks pre-approved guest passes and security walk-in logs.
- Fields: `visitor_name`, `phone`, `vehicle_number`, `flat_id` (reference), `gate_pass_code` (6-digit numeric string), `entry_timestamp` (Date), `status` ('Pre-Approved' | 'Entered' | 'Exited').

#### 4. `src/models/Complaint.js`
Resident maintenance and issue tickets.
- Fields: `resident_id` (reference to User), `category` (Plumbing, Electrical, Noise, etc.), `description`, `photo_url` (Cloudinary URL), `status` ('Pending' | 'In-Progress' | 'Resolved'), `created_at`.

#### 5. `src/models/Bill.js`
Monthly maintenance bills per flat.
- Fields: `flat_id` (reference to Flat), `amount_due` (Number), `due_date` (Date), `payment_status` ('Pending' | 'Paid').

#### 6. `src/models/Notice.js`
Society-wide announcements and emergency broadcasts.
- Fields: `title`, `description`, `created_by` (reference to Admin User), `created_at`.

---

### 4.5 Controller Layer (Business Logic)

#### 1. `src/controllers/authController.js`
- `login(req, res, next)`:
  1. Validates presence of `username` and `password`.
  2. Queries User model for matching username.
  3. Verifies password hash using `user.matchPassword(password)`.
  4. Generates a signed JWT with 7-day expiration containing `{ id, username, role, flat_id }`.
  5. Returns JWT token and sanitized user profile.

#### 2. `src/controllers/adminController.js`
- `createFlat`: Validates uniqueness of block and flat number, creates record in `Flat`.
- `onboardResident`: Verifies flat exists, verifies username availability, creates User with `role: 'Resident'`, and links `flat_id`.
- `generateBills`: Queries all flats in the society and performs a bulk insert (`Bill.insertMany`) for monthly maintenance dues.
- `broadcastNotice`: Creates a society notice authored by the authenticated Admin (`req.user.id`).

#### 3. `src/controllers/residentController.js`
- `getBills`: Finds all maintenance bills belonging to the resident's flat (`req.user.flat_id`) with populated flat details.
- `payBill`: Verifies the target bill belongs to the resident's flat and simulates payment by updating `payment_status` to `'Paid'`.
- `generateVisitorPass`: Generates a random 6-digit PIN (`Math.floor(100000 + Math.random() * 900000)`), creates a `Visitor` record with `'Pre-Approved'` status.
- `raiseComplaint`: Takes category, description, and attached photo from Cloudinary (`req.file.path`), creating a new `Complaint`.

#### 4. `src/controllers/securityController.js`
- `verifyPass`: Looks up `gate_pass_code`. If valid and in `'Pre-Approved'` state, updates status to `'Entered'` and records `entry_timestamp`.
- `logWalkInVisitor`: Logs an unplanned visitor for a flat directly into `'Entered'` status with an active timestamp.
- `getActiveVisitors`: Queries all visitors currently on premises (`status: 'Entered'`) sorted by entry time descending.

---

### 4.6 Routing Layer (HTTP Endpoints)

#### 1. `src/routes/authRoutes.js`
```javascript
import express from 'express';
import { login } from '../controllers/authController.js';

const router = express.Router();
router.post('/login', login);
export default router;
```

#### 2. `src/routes/adminRoutes.js`
Protected with `authMiddleware` and `roleMiddleware(['Admin'])`:
- `POST /api/admin/flat` -> `createFlat`
- `POST /api/admin/resident` -> `onboardResident`
- `POST /api/admin/bills` -> `generateBills`
- `POST /api/admin/notice` -> `broadcastNotice`

#### 3. `src/routes/residentRoutes.js`
Protected with `authMiddleware` and `roleMiddleware(['Resident'])`:
- `GET /api/resident/bills` -> `getBills`
- `POST /api/resident/bills/:id/pay` -> `payBill`
- `POST /api/resident/visitor-pass` -> `generateVisitorPass`
- `POST /api/resident/complaints` -> `upload.single('photo')` + `raiseComplaint`

#### 4. `src/routes/securityRoutes.js`
Protected with `authMiddleware` and `roleMiddleware(['Guard'])`:
- `POST /api/security/verify-pass` -> `verifyPass`
- `POST /api/security/walk-in` -> `logWalkInVisitor`
- `GET /api/security/active-visitors` -> `getActiveVisitors`

---

## 5. Role-Based Access Control (RBAC) Matrix

| Endpoint | HTTP Method | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Authenticates credentials and returns JWT |
| `/api/admin/flat` | `POST` | `Admin` | Adds a new flat unit |
| `/api/admin/resident` | `POST` | `Admin` | Creates a resident user and links flat |
| `/api/admin/bills` | `POST` | `Admin` | Bulk generates bills for all flats |
| `/api/admin/notice` | `POST` | `Admin` | Publishes a society notice |
| `/api/resident/bills` | `GET` | `Resident` | Fetches bills for the resident's flat |
| `/api/resident/bills/:id/pay` | `POST` | `Resident` | Marks a bill as paid |
| `/api/resident/visitor-pass` | `POST` | `Resident` | Generates 6-digit visitor pass |
| `/api/resident/complaints` | `POST` | `Resident` | Submits complaint with photo |
| `/api/security/verify-pass` | `POST` | `Guard` | Validates gate pass and admits visitor |
| `/api/security/walk-in` | `POST` | `Guard` | Registers walk-in visitor |
| `/api/security/active-visitors`| `GET` | `Guard` | Lists all visitors currently inside |

---

## 6. API Endpoints Reference

### 1. Authentication
#### `POST /api/auth/login`
- **Request Body**:
```json
{
  "username": "admin_user",
  "password": "Password123"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66bc8d...",
    "username": "admin_user",
    "role": "Admin",
    "flat_id": null
  }
}
```

---

### 2. Admin Actions

#### `POST /api/admin/flat`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Request Body**:
```json
{
  "block_name": "A",
  "flat_number": "101",
  "occupancy_type": "Owner"
}
```

#### `POST /api/admin/resident`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Request Body**:
```json
{
  "username": "john_resident",
  "password": "SecurePassword123",
  "flat_id": "66bc8d1234567890abcdef12"
}
```

#### `POST /api/admin/bills`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Request Body**:
```json
{
  "amount_due": 2500,
  "due_date": "2026-09-01"
}
```

#### `POST /api/admin/notice`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Request Body**:
```json
{
  "title": "Water Tank Cleaning Notice",
  "description": "Water supply will be suspended tomorrow from 10:00 AM to 2:00 PM for tank maintenance."
}
```

---

### 3. Resident Actions

#### `GET /api/resident/bills`
- **Headers**: `Authorization: Bearer <Resident_JWT>`

#### `POST /api/resident/bills/:id/pay`
- **Headers**: `Authorization: Bearer <Resident_JWT>`

#### `POST /api/resident/visitor-pass`
- **Headers**: `Authorization: Bearer <Resident_JWT>`
- **Request Body**:
```json
{
  "visitor_name": "Alice Smith",
  "phone": "9876543210",
  "vehicle_number": "MH12AB1234"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Visitor pass generated successfully.",
  "data": {
    "_id": "66bc9e...",
    "visitor_name": "Alice Smith",
    "phone": "9876543210",
    "vehicle_number": "MH12AB1234",
    "flat_id": "66bc8d1234567890abcdef12",
    "gate_pass_code": "482915",
    "status": "Pre-Approved"
  }
}
```

#### `POST /api/resident/complaints`
- **Headers**: `Authorization: Bearer <Resident_JWT>`, `Content-Type: multipart/form-data`
- **Form Data Fields**:
  - `category`: `Plumbing`
  - `description`: `Pipe leakage under the kitchen sink.`
  - `photo`: `[Binary Image File]`

---

### 4. Security Guard Actions

#### `POST /api/security/verify-pass`
- **Headers**: `Authorization: Bearer <Guard_JWT>`
- **Request Body**:
```json
{
  "gate_pass_code": "482915"
}
```

#### `POST /api/security/walk-in`
- **Headers**: `Authorization: Bearer <Guard_JWT>`
- **Request Body**:
```json
{
  "visitor_name": "Delivery Executive",
  "phone": "9123456780",
  "vehicle_number": "MH12CD5678",
  "flat_id": "66bc8d1234567890abcdef12"
}
```

#### `GET /api/security/active-visitors`
- **Headers**: `Authorization: Bearer <Guard_JWT>`

---

## 7. Installation & Setup

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd smart
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

The application will start on:
```text
Server running on http://localhost:5000
```
