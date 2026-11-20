-- Corrige criar_excursao: o INSERT ... RETURNING falhava na RLS porque
-- private.eh_dono_excursao() não enxerga a linha da própria gravação em andamento.
-- Solução: gerar o id antes e gravar sem RETURNING.
create or replace function public.criar_excursao(
  p_titulo text, p_descricao text, p_data_ida date, p_data_volta date, p_vagas integer,
  p_pacotes jsonb, p_embarques jsonb
) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  v_excursionista uuid;
  v_excursao uuid := gen_random_uuid();
begin
  select id into v_excursionista from public.excursionistas where usuario_id = (select auth.uid());
  if v_excursionista is null then
    raise exception 'Complete seu perfil de excursionista antes de criar excursões.' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_pacotes) is distinct from 'array' or jsonb_array_length(p_pacotes) = 0 then
    raise exception 'Informe pelo menos um pacote.' using errcode = 'P0001';
  end if;

  insert into public.excursoes (id, excursionista_id, titulo, descricao, data_ida, data_volta, vagas)
    values (v_excursao, v_excursionista, trim(p_titulo), nullif(trim(p_descricao), ''), p_data_ida, p_data_volta, p_vagas);

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
