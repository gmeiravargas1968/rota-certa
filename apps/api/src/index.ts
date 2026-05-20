import { app } from './app';
import { env } from './config/env';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 ROTA CERTA API rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${env.NODE_ENV}`);
});
