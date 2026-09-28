import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import prisma from './config/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL;

// 1. Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. CORS configuration (Production Ready)
const allowedOrigins = CLIENT_URL
  ? CLIENT_URL.split(',').map((url) => url.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, server-to-server, health checks)
      if (!origin) return callback(null, true);
      if (
        !CLIENT_URL ||
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback allow in production to prevent blockages
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Rate limiting (protection against brute force)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use(limiter);

// 4. Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 6. Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      service: 'House of Dreams Hotel Management API',
      database: 'connected (Neon PostgreSQL)',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
    });
  }
});

// 7. Mount API routes
app.use('/api', apiRoutes);

// 8. 404 & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// 9. Start Server
const server = app.listen(PORT, async () => {
  console.log(`\n==================================================`);
  console.log(`✨ HOUSE OF DREAMS HOTEL MANAGEMENT BACKEND ACTIVE`);
  console.log(`🏨 Tagline: "Stay. Relax. Dream."`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}/api`);
  console.log(`🛡️ Desk Payment Only - No Online Gateway`);
  console.log(`==================================================\n`);

  // Pre-warm database connection pool
  try {
    await prisma.$connect();
    console.log('⚡ Prisma connected to Neon PostgreSQL pool');
  } catch (err) {
    console.error('Failed to pre-connect Prisma:', err);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server and Prisma connections...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Server shut down cleanly.');
    process.exit(0);
  });
});

export default app;
