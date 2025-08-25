import { useEffect, useState } from "react";

type Tipo = { id: string; nome: string; slug: string };

export default function UploadDocumento({ cnpj }: { cnpj: string }) {
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [tipoSlug, setTipoSlug] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [validade, setValidade] = useState("");

  useEffect(() => {
    fetch("/api/tipos-documento")
      .then((r) => r.json())
      .then(setTipos)
      .catch(() => setTipos([]));
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !tipoSlug) return alert("Selecione o arquivo e o tipo");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("tipoSlug", tipoSlug);
    if (validade) fd.append("validade", validade);

    const resp = await fetch(`/api/transportadoras/${cnpj}/documentos`, {
      method: "POST",
      body: fd,
    });

    if (!resp.ok) {
      let msg = "Erro no upload";
      try {
        const err = await resp.json();
        msg = err.error || msg;
      } catch {}
      alert(msg);
      return;
    }
    alert("Documento enviado!");
  }

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-3">
      <select value={tipoSlug} onChange={(e) => setTipoSlug(e.target.value)}>
        <option value="">Selecione o tipo</option>
        {tipos.map((t) => (
          <option key={t.id} value={t.slug}>
            {t.nome}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={validade}
        onChange={(e) => setValidade(e.target.value)}
        placeholder="Validade (opcional)"
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        accept=".pdf,.png,.jpg,.jpeg"
      />
      <button type="submit">Enviar documento</button>
    </form>
  );
}
