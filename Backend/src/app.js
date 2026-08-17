import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import residentRoutes from './routes/residentRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import amenityRoutes from './routes/amenityRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import emergencyContactRoutes from './routes/emergencyContactRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import directoryRoutes from './routes/directoryRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();

// FRONTEND_URL restricts CORS to the deployed site in production; without
// it (e.g. local dev) every origin is allowed, matching prior behavior.
app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// express.json()/urlencoded() leave req.body as `undefined` (not `{}`) when a
// request carries no body/Content-Type at all — e.g. a PATCH sent with no
// data, like the "mark bill paid" action. Every controller destructures
// req.body directly, so normalize it once here instead of guarding 29
// individual call sites.
app.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

// Serves locally-stored complaint photos when Cloudinary isn't configured
// (see config/cloudinary.js for the fallback logic).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

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
app.use('/api/amenities', amenityRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/emergency-contacts', emergencyContactRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/family', familyRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

app.use(errorMiddleware);

export default app;
