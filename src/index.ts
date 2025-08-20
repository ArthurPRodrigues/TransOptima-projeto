import { buildApp } from "./app";
import { env } from "./config/env";
import { recalcAll } from "./services/availability";
import cron from "node-cron";

const app = buildApp();

app.listen(env.PORT, async () => {
  console.log(`TransOptima API ouvindo na porta ${env.PORT}`);
  // Recalcula disponibilidade ao subir
  try { await recalcAll(); } catch (e) { console.warn("recalcAll falhou:", e); }
});

// Agendamento diário às 03:00 America/Sao_Paulo
cron.schedule("0 0 3 * * *", async () => {
  try {
    console.log("[cron] Recalculando disponibilidade...");
    await recalcAll();
    console.log("[cron] OK");
  } catch (e) {
    console.error("[cron] falhou", e);
  }
}, { timezone: "America/Sao_Paulo" });