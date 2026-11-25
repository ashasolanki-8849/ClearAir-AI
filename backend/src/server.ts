import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import airQualityRoutes from './routes/airQualityRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import dailyPlannerRoutes from './routes/dailyPlannerRoutes.js';
import indoorRoutes from './routes/indoorRoutes.js';
import indoorDeviceRoutes from './routes/indoorDeviceRoutes.js';
import travelRoutes from './routes/travelRoutes.js';
import forecastRoutes from './routes/forecastRoutes.js';
import sustainabilityRoutes from './routes/sustainabilityRoutes.js';
import { communityRouter, pollutionReportRouter } from './routes/communityRoutes.js';
import impactRouter from './routes/impactRoutes.js';
import simulationRouter from './routes/simulationRoutes.js';
import { reviewRoutes } from './routes/reviewRoutes.js';
import { contactRoutes } from './routes/contactRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

// Request logger for API calls
app.use((req, _res, next) => {
  if (!req.path.startsWith('/health')) {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ClearAir AI Backend - Module 1 Core',
    version: '1.0.0',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/air-quality', airQualityRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/planner', dailyPlannerRoutes);
app.use('/api/indoor/devices', indoorDeviceRoutes);
app.use('/api/indoor', indoorRoutes);
app.use('/api/travel', travelRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/sustainability', sustainabilityRoutes);
app.use('/api/communities', communityRouter);
app.use('/api/community-reports', pollutionReportRouter);
app.use('/api/impact', impactRouter);
app.use('/api/simulator', simulationRouter);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(` ClearAir AI Server listening on http://localhost:${PORT}`);
      console.log(` API Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (err: any) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
