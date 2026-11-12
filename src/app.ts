import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes.js';
import { campusRouter } from './routes/campus.routes.js';
import { productRouter } from './routes/product.routes.js';
import { orderRouter } from './routes/order.routes.js';
import { dispatchRouter } from './routes/dispatch.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { vendorRouter } from './routes/vendor.routes.js';

export const app = express();

// Security & Global Middlewares
app.disable('x-powered-by');
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health Check / Ping
app.get('/health', (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'online',
    platform: 'UniHive™ Campus Marketplace & Dispatch Network',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Core API v1 Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/campuses', campusRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/dispatch', dispatchRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/vendor', vendorRouter);

// 404 Handler
app.use((req: Request, res: Response): void => {
  res.status(404).json({
    error: 'NotFound',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('[UniHive API Error]:', err);
  res.status(err.status || 500).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected server error occurred',
  });
});
