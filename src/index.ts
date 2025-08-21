import { buildApp } from './app';

const app = buildApp();
const PORT = Number(process.env.PORT || 8080);

app.listen(PORT, () => {
  console.log(`TransOptima API ouvindo em http://localhost:${PORT}`);
});
