-- Só permite mudanças de status coerentes em excursões:
--   rascunho  -> publicada | cancelada
--   publicada -> encerrada | cancelada
-- Encerrada e cancelada são finais (evita reabrir uma excursão para burlar o limite do plano).
create or replace function private.excursao_transicao()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    if not (
      (old.status = 'rascunho'  and new.status in ('publicada', 'cancelada')) or
      (old.status = 'publicada' and new.status in ('encerrada', 'cancelada'))
    ) then
      raise exception 'Não é possível mudar a excursão de "%" para "%".', old.status, new.status
        using errcode = 'P0001';
    end if;
  end if;
  return new;
end; $$;

revoke all on function private.excursao_transicao() from public, anon, authenticated;

create trigger excursao_transicao before update of status on public.excursoes
  for each row execute function private.excursao_transicao();
