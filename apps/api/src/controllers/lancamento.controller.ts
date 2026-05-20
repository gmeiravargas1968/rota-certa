import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as lancamentoService from '../services/lancamento.service';
import { lancamentoSchema, lancamentoUpdateSchema, periodFilterSchema } from '@rota-certa/shared';
import { success, created, notFound } from '../utils/response';

export async function getLancamentos(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const filter = periodFilterSchema.parse(req.query);
    const result = await lancamentoService.getLancamentos(req.userId!, filter);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getLancamento(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const lancamento = await lancamentoService.getLancamentoById(req.userId!, id);
    if (!lancamento) return notFound(res, 'Lançamento não encontrado');
    return success(res, lancamento);
  } catch (err) {
    next(err);
  }
}

export async function createLancamento(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = lancamentoSchema.parse(req.body);
    const lancamento = await lancamentoService.createLancamento(req.userId!, input);
    return created(res, lancamento);
  } catch (err) {
    next(err);
  }
}

export async function updateLancamento(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const input = lancamentoUpdateSchema.parse(req.body);
    const lancamento = await lancamentoService.updateLancamento(req.userId!, id, input);
    if (!lancamento) return notFound(res, 'Lançamento não encontrado');
    return success(res, lancamento);
  } catch (err) {
    next(err);
  }
}

export async function deleteLancamento(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await lancamentoService.deleteLancamento(req.userId!, id);
    return success(res, { message: 'Lançamento excluído com sucesso' });
  } catch (err) {
    next(err);
  }
}
