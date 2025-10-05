-- Habilita a segurança em nível de linha para a tabela
alter table public.pricing_tiers enable row level security;

-- Política para permitir que usuários autenticados leiam os níveis de preço
create policy "Allow authenticated read access to pricing tiers"
on public.pricing_tiers for select
to authenticated
using (true);

-- Política para permitir que administradores e gerentes de operações gerenciem os níveis de preço
create policy "Allow admins and managers to manage pricing tiers"
on public.pricing_tiers for all
using ( (select role from public.profiles where id = auth.uid()) in ('admin', 'operations_manager') )
with check ( (select role from public.profiles where id = auth.uid()) in ('admin', 'operations_manager') );