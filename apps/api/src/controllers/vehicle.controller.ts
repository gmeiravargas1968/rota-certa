import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as vehicleService from '../services/vehicle.service';
import { vehicleConfigSchema } from '@rota-certa/shared';
import { success, created, notFound } from '../utils/response';

export async function getVehicle(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const config = await vehicleService.getVehicleConfig(req.userId!);
    if (!config) return notFound(res, 'Configuração do veículo não encontrada');
    return success(res, config);
  } catch (err) {
    next(err);
  }
}

export async function createVehicle(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = vehicleConfigSchema.parse(req.body);
    const config = await vehicleService.createVehicleConfig(req.userId!, input);
    return created(res, config);
  } catch (err) {
    next(err);
  }
}

export async function updateVehicle(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = vehicleConfigSchema.parse(req.body);
    const config = await vehicleService.updateVehicleConfig(req.userId!, input);
    return success(res, config);
  } catch (err) {
    next(err);
  }
}
