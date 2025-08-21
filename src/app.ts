import express from 'express';
import transportadorasRouter from './routes/transportadoras';
import registrosRouter from './routes/registro';  // << novo

export function buildApp() {
  const app = express();
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.send(`
      <h1>TransOptima API</h1>
      <ul>
        <li>GET <a href="/health">/health</a></li>
        <li>GET <a href="/transportadoras">/transportadoras</a></li>
        <li>GET <a href="/transportadoras?uf=SC&produto=quimico">/transportadoras?uf=SC&produto=quimico</a></li>
      </ul>
    `);
  });

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/transportadoras', transportadorasRouter);
  app.use('/registros', registrosRouter);           // << novo

  return app;
}
