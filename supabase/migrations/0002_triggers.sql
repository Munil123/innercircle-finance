-- handle_new_user trigger function and trigger
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_circle_id uuid := uuid_generate_v4();
begin
  insert into public.circles(id, name, created_by)
  values (new_circle_id, 'My Inner Circle', new.id);

  insert into public.user_profiles(id, name, referral_code, default_circle_id)
  values (new.id, split_part(new.email,'@',1), encode(gen_random_bytes(4), 'hex'), new_circle_id);

  insert into public.circle_members(circle_id, user_id, role)
  values (new_circle_id, new.id, 'owner');

  -- copy default categories into this circle
  insert into public.categories(circle_id, type, name, subcategories, is_default, created_by)
  select new_circle_id, type, name, subcategories, true, new.id
  from public.categories where circle_id is null;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS Policies

-- Circles: Only members of a circle can select
create policy "circles_owner_read"
  on public.circles for select
  using (exists (select 1 from public.circle_members cm where cm.circle_id = id and cm.user_id = auth.uid()));

-- Circle Members: Only self access
create policy "circle_members_read_write"
  on public.circle_members for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- User Profile: Only self access
create policy "user_profiles_self"
  on public.user_profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- Categories: Only members can select/insert
create policy "by_circle_member_categories"
  on public.categories for all
  using (exists (select 1 from public.circle_members cm where cm.circle_id = circle_id and cm.user_id = auth.uid()))
  with check (exists (select 1 from public.circle_members cm where cm.circle_id = circle_id and cm.user_id = auth.uid()));

-- Transactions
create policy "by_circle_member_transactions"
  on public.transactions for all
  using (exists (select 1 from public.circle_members cm where cm.circle_id = circle_id and cm.user_id = auth.uid()))
  with check (exists (select 1 from public.circle_members cm where cm.circle_id = circle_id and cm.user_id = auth.uid()));

-- Investments
create policy "by_circle_member_investments"
  on public.investments for all
  using (exists (select 1 from public.circle_members cm where cm.circle_id = circle_id and cm.user_id = auth.uid()))
  with check (exists (select 1 from public.circle_members cm where cm.circle_id = circle_id and cm.user_id = auth.uid()));

-- Investment_splits
create policy "by_investment_circle_member_splits"
  on public.investment_splits for all
  using (exists (select 1 from public.investments i join public.circle_members cm on cm.circle_id=i.circle_id where i.id=investment_id and cm.user_id=auth.uid()))
  with check (exists (select 1 from public.investments i join public.circle_members cm on cm.circle_id=i.circle_id where i.id=investment_id and cm.user_id=auth.uid()));

-- Lending/Borrowing
create policy "by_circle_member_lend_borrow"
  on public.lend_borrow for all
  using (exists (select 1 from public.circle_members cm where cm.circle_id = circle_id and cm.user_id = auth.uid()))
  with check (exists (select 1 from public.circle_members cm where cm.circle_id = circle_id and cm.user_id = auth.uid()));

-- Payments
create policy "by_related_payment"
  on public.payments for all
  using (
    (parent_type='investment_split' and exists (
      select 1 from public.investment_splits s join public.investments i on i.id=s.investment_id
      join public.circle_members cm on cm.circle_id=i.circle_id
      where s.id=parent_id and cm.user_id=auth.uid()
    ))
    or
    (parent_type='lend_borrow' and exists (
      select 1 from public.lend_borrow lb join public.circle_members cm on cm.circle_id=lb.circle_id
      where lb.id=parent_id and cm.user_id=auth.uid()
    ))
  )
  with check (true);

-- Reports
create policy "reports_by_circle"
  on public.reports for all
  using (exists (select 1 from public.circle_members cm where cm.circle_id = circle_id and cm.user_id = auth.uid()))
  with check (exists (select 1 from public.circle_members cm where cm.circle_id = circle_id and cm.user_id = auth.uid()));

-- OAuth tokens table
create policy "oauth_tokens_self"
  on public.oauth_tokens for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
