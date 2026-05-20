import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as lancamentoController from '../controllers/lancamento.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', lancamentoController.getLancamentos);
router.get('/:id', lancamentoController.getLancamento);
router.post('/', lancamentoController.createLancamento);
router.put('/:id', lancamentoController.updateLancamento);
router.delete('/:id', lancamentoController.deleteLancamento);

export default router;
