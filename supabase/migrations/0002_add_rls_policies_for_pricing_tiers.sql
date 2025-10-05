-- Habilita a segurança em nível de linha para a tabela
alter table public.pricing_tiers enable row level security;

-- Remove políticas antigas se existirem, para evitar conflitos
drop policy if exists "Allow authenticated read access to pricing tiers" on public.pricing_tiers;
drop policy if exists "Allow public read access to pricing tiers" on public.pricing_tiers;
drop policy if exists "Allow admins and managers to manage pricing tiers" on public.pricing_tiers;

-- Política para permitir que qualquer usuário (autenticado ou anônimo) leia os níveis de preço
create policy "Allow public read access to pricing tiers"
on public.pricing_tiers for select
using (true);

-- Política para permitir que administradores e gerentes de operações criem, atualizem e excluam níveis de preço
create policy "Allow admins and managers to write to pricing tiers"
on public.pricing_tiers for insert, update, delete
using ( (select role from public.profiles where id = auth.uid()) in ('admin', 'operations_manager') )
with check ( (select role from public.profiles where id = auth.uid()) in ('admin', 'operations_manager') );