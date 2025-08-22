// src/app.ts (trecho final)
import fs from 'fs';
import path from 'path';

// ...

export function buildApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // suas rotas...
  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/transportadoras', transportadorasRouter);
  app.use('/registros', registrosRouter);
  app.use('/admin/transportadoras', adminTransportadoras);
  app.use('/admin/documentos', adminDocumentos);
  app.use('/relatorios', relatoriosRouter);

  // Só servir o React buildado em PRODUÇÃO e se a pasta existir
  const distPath = path.join(process.cwd(), 'web', 'dist');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  return app;
}
