import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import vehicleRoutes from './routes/vehicle.routes';
import lancamentoRoutes from './routes/lancamento.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/lancamentos', lancamentoRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handler (deve ser o último)
app.use(errorHandler);

export { app };
