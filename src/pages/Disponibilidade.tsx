import TransportadorasPage from "./Transportadoras";
// Reutiliza a tabela de transportadoras com os filtros. Em V2, podemos
// aplicar preset de filtro (ex.: só indisponíveis). Por ora, reaproveite.
export default function DisponibilidadePage() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Disponibilidade para Frete</h2>
      <TransportadorasPage />
    </div>
  );
}
