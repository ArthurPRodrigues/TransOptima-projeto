// src/index.ts
import express from 'express';
import transportadorasRouter from './transportadoras';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/transportadoras', transportadorasRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`TransOptima API ouvindo em http://localhost:${PORT}`);
});
