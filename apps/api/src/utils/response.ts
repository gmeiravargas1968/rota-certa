import { Response } from 'express';

export function success(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ data });
}

export function created(res: Response, data: unknown) {
  return success(res, data, 201);
}

export function notFound(res: Response, message = 'Recurso não encontrado') {
  return res.status(404).json({ error: message });
}

export function badRequest(res: Response, message: string) {
  return res.status(400).json({ error: message });
}
