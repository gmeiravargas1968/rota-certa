import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// Erros de negócio com status code apropriado
const BUSINESS_ERRORS: Record<string, number> = {
  'Já existe um lançamento para esta data': 409,
  'KM Final deve ser maior que KM Inicial': 422,
  'Configuração do veículo não encontrada': 404,
  'Lançamento não encontrado': 404,
};

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Erro:', err.message);

  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => e.message);
    return res.status(422).json({
      error: 'Dados inválidos',
      details: messages,
    });
  }

  // Verificar se é um erro de negócio conhecido
  const statusCode = BUSINESS_ERRORS[err.message];
  if (statusCode) {
    return res.status(statusCode).json({ error: err.message });
  }

  return res.status(500).json({
    error: 'Erro interno do servidor',
  });
}
