import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as dashboardService from '../services/dashboard.service';
import { success } from '../utils/response';

export async function getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const periodDays = req.query.period === '7d' ? 7 : 30;
    const metrics = await dashboardService.getDashboard(req.userId!, periodDays);
    return success(res, metrics);
  } catch (err) {
    next(err);
  }
}
