-- Cria a linha em public.usuarios quando alguém se cadastra no Supabase Auth
create or replace function private.criar_usuario_no_cadastro()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.usuarios (id, nome, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nome'), ''), split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.criar_usuario_no_cadastro() from public, anon, authenticated;

create trigger ao_criar_usuario_auth
  after insert on auth.users
  for each row execute function private.criar_usuario_no_cadastro();
