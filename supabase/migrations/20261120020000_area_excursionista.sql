-- Etapa 4: área do excursionista.
-- Segurança: CPF/CNPJ privado, plano e selo de verificação só pela plataforma,
-- limite de excursões por plano, Cadastur para publicar e rascunhos não públicos.

-- 1) Perfil público: nome de exibição e selo de verificação (só a plataforma altera)
alter table public.excursionistas add column nome_publico text;
alter table public.excursionistas add column cadastur_verificado boolean not null default false;
alter table public.excursionistas alter column nome_publico set not null;
alter table public.excursionistas
  add constraint excursionistas_nome_publico_tam check (char_length(nome_publico) between 2 and 80),
  add constraint excursionistas_slug_formato check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 50);

-- 2) CPF/CNPJ em tabela privada (visível só ao dono)
create table public.excursionistas_privado (
  excursionista_id uuid primary key references public.excursionistas (id) on delete cascade,
  cnpj_cpf text not null check (char_length(cnpj_cpf) between 11 and 18)
);
insert into public.excursionistas_privado (excursionista_id, cnpj_cpf)
  select id, cnpj_cpf from public.excursionistas where cnpj_cpf is not null;
alter table public.excursionistas drop column cnpj_cpf;

alter table public.excursionistas_privado enable row level security;
create policy "dono gerencia dados privados" on public.excursionistas_privado
  for all to authenticated
  using (exists (select 1 from public.excursionistas x
                 where x.id = excursionista_id and x.usuario_id = (select auth.uid())))
  with check (exists (select 1 from public.excursionistas x
                      where x.id = excursionista_id and x.usuario_id = (select auth.uid())));

revoke all on public.excursionistas_privado from anon, authenticated;
grant select, insert, update on public.excursionistas_privado to authenticated;

-- 3) Permissões por coluna em excursionistas (plano e verificação ficam fora)
revoke all on public.excursionistas from anon, authenticated;
grant select (id, usuario_id, plano_id, nome_publico, cadastur, cadastur_verificado, slug, criado_em)
  on public.excursionistas to anon, authenticated;
grant insert (usuario_id, nome_publico, cadastur, slug) on public.excursionistas to authenticated;
grant update (nome_publico, cadastur) on public.excursionistas to authenticated;

-- 4) Gatilhos em excursionistas
create or replace function private.excursionista_antes_inserir()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.plano_id := coalesce(new.plano_id, (select id from public.planos where nome = 'Grátis' limit 1));
  return new;
end; $$;

create or replace function private.excursionista_antes_atualizar()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.cadastur is distinct from old.cadastur then
    new.cadastur_verificado := false;
  end if;
  return new;
end; $$;

revoke all on function private.excursionista_antes_inserir() from public, anon, authenticated;
revoke all on function private.excursionista_antes_atualizar() from public, anon, authenticated;

create trigger excursionista_antes_inserir before insert on public.excursionistas
  for each row execute function private.excursionista_antes_inserir();
create trigger excursionista_antes_atualizar before update on public.excursionistas
  for each row execute function private.excursionista_antes_atualizar();

-- 5) Excursões: datas coerentes, limite do plano e Cadastur para publicar
alter table public.excursoes
  add constraint excursoes_datas_coerentes check (data_volta is null or data_volta >= data_ida);

create or replace function private.excursao_validar()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  limite integer;
  ativas integer;
  cad text;
begin
  select p.limite_excursoes, x.cadastur into limite, cad
    from public.excursionistas x join public.planos p on p.id = x.plano_id
    where x.id = new.excursionista_id;

  -- Limite de excursões ativas (rascunho ou publicada) do plano
  if new.status in ('rascunho', 'publicada')
     and (tg_op = 'INSERT' or old.status not in ('rascunho', 'publicada'))
     and limite is not null then
    select count(*) into ativas from public.excursoes
      where excursionista_id = new.excursionista_id and status in ('rascunho', 'publicada')
        and id is distinct from new.id;
    if ativas >= limite then
      raise exception 'Seu plano permite % excursão(ões) ativa(s). Encerre uma excursão ou mude de plano.', limite
        using errcode = 'P0001';
    end if;
  end if;

  -- Cadastur obrigatório para publicar
  if new.status = 'publicada' and (tg_op = 'INSERT' or old.status is distinct from 'publicada')
     and coalesce(trim(cad), '') = '' then
    raise exception 'Informe seu número do Cadastur no perfil para publicar excursões.' using errcode = 'P0001';
  end if;

  return new;
end; $$;

revoke all on function private.excursao_validar() from public, anon, authenticated;
create trigger excursao_validar before insert or update of status on public.excursoes
  for each row execute function private.excursao_validar();

-- 6) Pacotes e embarques seguem a visibilidade da excursão (rascunhos não vazam)
drop policy "pacotes públicos" on public.pacotes;
drop policy "embarques públicos" on public.embarques;
create policy "pacotes de excursões visíveis" on public.pacotes for select
  using (exists (select 1 from public.excursoes e where e.id = excursao_id));
create policy "embarques de excursões visíveis" on public.embarques for select
  using (exists (select 1 from public.excursoes e where e.id = excursao_id));

-- 7) Criação atômica de excursão + pacotes + embarques (respeita RLS do chamador)
create or replace function public.criar_excursao(
  p_titulo text, p_descricao text, p_data_ida date, p_data_volta date, p_vagas integer,
  p_pacotes jsonb, p_embarques jsonb
) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  v_excursionista uuid;
  v_excursao uuid;
begin
  select id into v_excursionista from public.excursionistas where usuario_id = (select auth.uid());
  if v_excursionista is null then
    raise exception 'Complete seu perfil de excursionista antes de criar excursões.' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_pacotes) is distinct from 'array' or jsonb_array_length(p_pacotes) = 0 then
    raise exception 'Informe pelo menos um pacote.' using errcode = 'P0001';
  end if;

  insert into public.excursoes (excursionista_id, titulo, descricao, data_ida, data_volta, vagas)
    values (v_excursionista, trim(p_titulo), nullif(trim(p_descricao), ''), p_data_ida, p_data_volta, p_vagas)
    returning id into v_excursao;

  insert into public.pacotes (excursao_id, nome, preco)
    select v_excursao, trim(x.nome), x.preco
    from jsonb_to_recordset(p_pacotes) as x(nome text, preco numeric);

  if jsonb_typeof(p_embarques) = 'array' and jsonb_array_length(p_embarques) > 0 then
    insert into public.embarques (excursao_id, local, horario)
      select v_excursao, trim(x.local), x.horario
      from jsonb_to_recordset(p_embarques) as x(local text, horario time);
  end if;

  return v_excursao;
end; $$;

revoke all on function public.criar_excursao(text, text, date, date, integer, jsonb, jsonb) from public, anon;
grant execute on function public.criar_excursao(text, text, date, date, integer, jsonb, jsonb) to authenticated;
