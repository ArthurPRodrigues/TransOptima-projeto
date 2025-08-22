// src/app.ts
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

// Rotas da casa
import transportadorasRouter from './routes/transportadoras';
import registrosRouter from './routes/registros';

// Rotas Admin (CRUD)
import adminTransportadoras from './routes/admin.transportadoras';
import adminDocumentos from './routes/admin.documentos';

// Relatórios
import relatoriosRouter from './routes/relatorios';

export function buildApp() {
  const app = express();

  // Middlewares básicos
  app.use(cors());                // em dev, o Vite usa proxy; em prod, manter simples
  app.use(express.json());        // JSON body

  // Health
  app.get('/health', (_req, res) => res.json({ ok: true }));

  // Rotas públicas
  app.use('/transportadoras', transportadorasRouter);
  app.use('/registros', registrosRouter);

  // Admin (CRUD)
  app.use('/admin/transportadoras', adminTransportadoras);
  app.use('/admin/documentos', adminDocumentos);

  // Relatórios
  app.use('/relatorios', relatoriosRouter);

  // Servir o React SÓ em produção e se existir web/dist
  const distPath = path.join(process.cwd(), 'web', 'dist');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  return app;
}
