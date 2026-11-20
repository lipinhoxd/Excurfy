"use client";

import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { criarExcursao, type ExcursaoState } from "./actions";

type Pacote = { id: number; nome: string; preco: string };
type Embarque = { id: number; local: string; horario: string };

export function ExcursaoForm() {
  const [estado, action] = useActionState<ExcursaoState, FormData>(criarExcursao, {});
  const proximoId = useRef(2);
  const [pacotes, setPacotes] = useState<Pacote[]>([{ id: 1, nome: "", preco: "" }]);
  const [embarques, setEmbarques] = useState<Embarque[]>([{ id: 1, local: "", horario: "" }]);
  const e = estado.errosCampo ?? {};
  const [base, setBase] = useState({ titulo: "", descricao: "", data_ida: "", data_volta: "", vagas: "" });
  // Campos controlados: o React 19 limpa campos não controlados após o envio do formulário.
  const campo = (nome: keyof typeof base) => ({
    name: nome,
    value: base[nome],
    onChange: (ev: React.ChangeEvent<HTMLInputElement>) => setBase((b) => ({ ...b, [nome]: ev.target.value })),
  });

  if (estado.ok) {
    return (
      <div className="card" style={{ maxWidth: 560 }}>
        <p className="msg msg--ok" role="status" style={{ margin: 0 }}>Excursão criada como rascunho.</p>
        <p className="card__meta">Abra a excursão na lista para publicá-la quando estiver pronta.</p>
        <div><a className="btn" href="/painel/excursoes">Ver excursões</a></div>
      </div>
    );
  }

  return (
    <form action={action} style={{ maxWidth: 560 }}>
      {estado.erro && <p className="msg msg--erro" role="alert">{estado.erro}</p>}

      <Input label="Título" {...campo("titulo")} required maxLength={120} erro={e.titulo} placeholder="[Nome da excursão]" />
      <Input label="Descrição (opcional)" {...campo("descricao")} maxLength={2000} erro={e.descricao} />
      <Input label="Data de ida" {...campo("data_ida")} type="date" required erro={e.data_ida} />
      <Input label="Data de volta (opcional)" {...campo("data_volta")} type="date" erro={e.data_volta} />
      <Input label="Vagas" {...campo("vagas")} type="number" min={1} max={1000} step={1} required inputMode="numeric" erro={e.vagas} />

      <fieldset style={{ border: 0, padding: 0, margin: "0 0 24px" }}>
        <legend style={{ fontFamily: "var(--font-sora)", fontWeight: 600, fontSize: 18, padding: 0, marginBottom: 8 }}>Pacotes</legend>
        {e.pacotes && <p className="field__erro" role="alert">{e.pacotes}</p>}
        {pacotes.map((p, i) => (
          <div key={p.id} className="card" style={{ marginBottom: 8 }}>
            <Input label={`Pacote ${i + 1}: nome`} name="pacote_nome" value={p.nome} maxLength={60} placeholder="Ex.: [Pacote]"
              onChange={(ev) => setPacotes((l) => l.map((x) => (x.id === p.id ? { ...x, nome: ev.target.value } : x)))} />
            <Input label="Preço (R$)" name="pacote_preco" value={p.preco} inputMode="decimal" placeholder="[R$]" erro={e[`pacote_${i}`]}
              onChange={(ev) => setPacotes((l) => l.map((x) => (x.id === p.id ? { ...x, preco: ev.target.value } : x)))} />
            {pacotes.length > 1 && (
              <Button type="button" variant="ghost" onClick={() => setPacotes((l) => l.filter((x) => x.id !== p.id))}>
                Remover pacote {i + 1}
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => setPacotes((l) => [...l, { id: proximoId.current++, nome: "", preco: "" }])}>
          Adicionar pacote
        </Button>
      </fieldset>

      <fieldset style={{ border: 0, padding: 0, margin: "0 0 24px" }}>
        <legend style={{ fontFamily: "var(--font-sora)", fontWeight: 600, fontSize: 18, padding: 0, marginBottom: 8 }}>Pontos de embarque</legend>
        {embarques.map((p, i) => (
          <div key={p.id} className="card" style={{ marginBottom: 8 }}>
            <Input label={`Embarque ${i + 1}: local`} name="embarque_local" value={p.local} maxLength={120} placeholder="[Local de embarque]"
              onChange={(ev) => setEmbarques((l) => l.map((x) => (x.id === p.id ? { ...x, local: ev.target.value } : x)))} />
            <Input label="Horário" name="embarque_horario" type="time" value={p.horario} erro={e[`embarque_${i}`]}
              onChange={(ev) => setEmbarques((l) => l.map((x) => (x.id === p.id ? { ...x, horario: ev.target.value } : x)))} />
            {embarques.length > 1 && (
              <Button type="button" variant="ghost" onClick={() => setEmbarques((l) => l.filter((x) => x.id !== p.id))}>
                Remover embarque {i + 1}
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => setEmbarques((l) => [...l, { id: proximoId.current++, local: "", horario: "" }])}>
          Adicionar embarque
        </Button>
      </fieldset>

      <SubmitButton>Criar excursão</SubmitButton>
    </form>
  );
}
