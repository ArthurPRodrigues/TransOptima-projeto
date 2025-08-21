import express from 'express';
import transportadorasRouter from './routes/transportadoras';
import relatoriosRouter from './routes/relatorios'; 
import registrosRouter from './routes/registros';
import adminRouter from './routes/admin';
import { startEmailNotifier } from './jobs/emailNotifier';

export function buildApp() {
  const app = express();
  app.use(express.json());

  app.get('/', (_req, res) => res.send(`<h1>TransOptima API</h1>
    <ul>
      <li>GET <a href="/health">/health</a></li>
      <li>GET <a href="/transportadoras">/transportadoras</a></li>
      <li>POST /admin/notify-now</li>
    </ul>`));

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/transportadoras', transportadorasRouter);
  app.use('/registros', registrosRouter);
  app.use('/admin', adminRouter);
  app.use('/relatorios', relatoriosRouter);

  // inicia o cron
  startEmailNotifier();

  // servir front estático (ver abaixo)
  app.use(express.static('public'));

  return app;
}
