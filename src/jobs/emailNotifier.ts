import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendMail } from '../lib/mailer';

const prisma = new PrismaClient();

/** Calcula diferença em dias (ignorando horário). */
function diffInDays(from: Date, to: Date) {
  const A = new Date(from); A.setHours(0,0,0,0);
  const B = new Date(to);   B.setHours(0,0,0,0);
  return Math.round((B.getTime() - A.getTime()) / (1000*60*60*24));
}

/** Executa a verificação e envia 1 e-mail resumo. */
export async function runExpiringCheck() {
  const today = new Date(); today.setHours(0,0,0,0);

  // Busca registros que vencem nos próximos 60 dias (cap) e junta com documento/transportadora
  const registros = await prisma.registroDocumento.findMany({
    where: { validade: { gte: today } },
    include: { documento: true, transportadora: true },
  });

  // antes de enviar:
  const pendentes = registros.filter(r => {
    if (!r.validade) return false;
    const dias = diffInDays(today, new Date(r.validade));
    return dias === 7; // 7 dias fixos
  });


  if (pendentes.length === 0) return { sent: false, count: 0 };

  // Monta HTML simples
  const rows = pendentes.map(r => {
    const t = r.transportadora;
    const d = r.documento;
    return `<tr>
      <td>${t?.id ?? ''}</td>
      <td>${t?.razaoSocial ?? '(sem nome)'}</td>
      <td>${d?.nome ?? '(doc)'}</td>
      <td>${new Date(r.validade).toISOString().slice(0,10)}</td>
    </tr>`;
  }).join('');

  const html = `
    <h2>Documentos com vencimento próximo</h2>
    <p>Os registros abaixo vencem em <strong>dias iguais ao aviso</strong> definido no catálogo.</p>
    <table border="1" cellpadding="6" cellspacing="0">
      <thead><tr><th>ID Transp.</th><th>Transportadora</th><th>Documento</th><th>Validade</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  const recipients = (process.env.ALERT_RECIPIENTS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (recipients.length === 0) return { sent: false, count: pendentes.length };

  await sendMail(recipients, 'TransOptima — Aviso de vencimento de documentos', html);
  return { sent: true, count: pendentes.length };
}

/** Agenda diária às 08:00 America/Sao_Paulo. */
export function startEmailNotifier() {
  cron.schedule('0 8 * * *', async () => {
    try {
      const r = await runExpiringCheck();
      console.log(`[emailNotifier] sent=${r.sent} count=${r.count}`);
    } catch (e) {
      console.error('[emailNotifier] erro:', e);
    }
  }, { timezone: 'America/Sao_Paulo' });
}