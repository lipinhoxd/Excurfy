"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { salvarPerfil, type PerfilState } from "./actions";

type Props = {
  inicial: { nome: string; slug: string; documento: string; cadastur: string };
  jaExiste: boolean;
};

export function PerfilForm({ inicial, jaExiste }: Props) {
  const [estado, action] = useActionState<PerfilState, FormData>(salvarPerfil, { valores: undefined });
  const v = estado.valores ?? inicial;
  const e = estado.errosCampo ?? {};

  return (
    <form action={action} style={{ maxWidth: 480 }}>
      {estado.erro && <p className="msg msg--erro" role="alert">{estado.erro}</p>}
      {estado.ok && <p className="msg msg--ok" role="status">Perfil salvo.</p>}

      <Input label="Nome do organizador" name="nome" defaultValue={v.nome} erro={e.nome} required maxLength={80}
        ajuda="Aparece para os viajantes. Ex.: [Nome da sua excursão ou empresa]." />
      <Input label="Endereço público" name="slug" defaultValue={v.slug} erro={e.slug} readOnly={jaExiste}
        required={jaExiste} maxLength={50} autoCapitalize="none" spellCheck={false}
        ajuda={jaExiste ? "O endereço não pode ser alterado." : "Deixe em branco para gerar a partir do nome. Só letras minúsculas, números e hífen. Não poderá ser alterado depois."} />
      <Input label="CPF ou CNPJ" name="documento" defaultValue={v.documento} erro={e.documento} required inputMode="numeric"
        autoComplete="off" ajuda="Não é exibido publicamente." />
      <Input label="Cadastur (opcional por enquanto)" name="cadastur" defaultValue={v.cadastur} erro={e.cadastur} maxLength={30}
        ajuda="Obrigatório para publicar excursões." />

      <SubmitButton>Salvar perfil</SubmitButton>
    </form>
  );
}
