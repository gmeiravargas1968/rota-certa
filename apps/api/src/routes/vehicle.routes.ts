import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as vehicleController from '../controllers/vehicle.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', vehicleController.getVehicle);
router.post('/', vehicleController.createVehicle);
router.put('/', vehicleController.updateVehicle);

export default router;
