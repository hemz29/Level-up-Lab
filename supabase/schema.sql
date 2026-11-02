-- Level-Up Lab database schema. Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Row-level security means each parent can only ever read or write their own children's rows.
-- The admin dashboard reads only child_stats (numbers), through a server function, never the
-- children's written work in child_state.

create table if not exists public.consents (
  parent_id uuid primary key references auth.users(id) on delete cascade,
  version text not null,
  accepted_at timestamptz not null default now()
);

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 30),
  created_at timestamptz not null default now()
);
create index if not exists children_parent_idx on public.children(parent_id);

-- The whole game state for one child (plan, logs, creature...). Private to the parent account.
create table if not exists public.child_state (
  child_id uuid primary key references public.children(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

-- Drawings from the art studio, as data URLs. Private to the parent account.
create table if not exists public.child_images (
  child_id uuid not null references public.children(id) on delete cascade,
  image_id text not null,
  data_url text not null check (char_length(data_url) < 3000000),
  created_at timestamptz not null default now(),
  primary key (child_id, image_id)
);

-- Numbers only (study days, minutes, recall rates...). This is all the admin dashboard can see.
create table if not exists public.child_stats (
  child_id uuid primary key references public.children(id) on delete cascade,
  stats jsonb not null,
  last_active date,
  updated_at timestamptz not null default now()
);

-- Weekly "is this helping?" answer from the child, sent to the Level-Up Lab team.
create table if not exists public.feedback (
  id bigserial primary key,
  child_id uuid not null references public.children(id) on delete cascade,
  week_start date not null,
  rating int not null check (rating between 1 and 4),
  comment text check (char_length(comment) <= 500),
  created_at timestamptz not null default now(),
  unique (child_id, week_start)
);

-- Used by the report function for rate limiting. No client access.
create table if not exists public.report_log (
  id bigserial primary key,
  parent_id uuid not null references auth.users(id) on delete cascade,
  sent_at timestamptz not null default now()
);

alter table public.consents enable row level security;
alter table public.children enable row level security;
alter table public.child_state enable row level security;
alter table public.child_images enable row level security;
alter table public.child_stats enable row level security;
alter table public.feedback enable row level security;
alter table public.report_log enable row level security;

create or replace function public.owns_child(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.children c where c.id = cid and c.parent_id = auth.uid());
$$;

drop policy if exists "own consent" on public.consents;
create policy "own consent" on public.consents for all
  using (parent_id = auth.uid()) with check (parent_id = auth.uid());

drop policy if exists "own children" on public.children;
create policy "own children" on public.children for all
  using (parent_id = auth.uid()) with check (parent_id = auth.uid());

drop policy if exists "own child state" on public.child_state;
create policy "own child state" on public.child_state for all
  using (public.owns_child(child_id)) with check (public.owns_child(child_id));

drop policy if exists "own child images" on public.child_images;
create policy "own child images" on public.child_images for all
  using (public.owns_child(child_id)) with check (public.owns_child(child_id));

drop policy if exists "own child stats" on public.child_stats;
create policy "own child stats" on public.child_stats for all
  using (public.owns_child(child_id)) with check (public.owns_child(child_id));

drop policy if exists "own feedback" on public.feedback;
create policy "own feedback" on public.feedback for all
  using (public.owns_child(child_id)) with check (public.owns_child(child_id));
-- report_log: RLS on with no policies = server (service role) only.

-- At most 6 children per parent account.
create or replace function public.limit_children() returns trigger
language plpgsql as $$
begin
  if (select count(*) from public.children where parent_id = new.parent_id) >= 6 then
    raise exception 'A family can have at most 6 children';
  end if;
  return new;
end $$;
drop trigger if exists limit_children on public.children;
create trigger limit_children before insert on public.children
  for each row execute function public.limit_children();
