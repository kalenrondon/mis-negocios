-- ============================================
-- Tablas para Mis Negocios
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Pollos de Engorde
create table pollos_lotes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  nombre text not null,
  raza text not null,
  cantidad integer not null,
  fecha_inicio date not null default current_date,
  costo_total numeric not null default 0,
  activo boolean not null default true,
  created_at timestamptz default now()
);
alter table pollos_lotes enable row level security;
create policy "Users can CRUD own lotes" on pollos_lotes for all using (auth.uid() = user_id);

create table pollos_bajas (
  id uuid default gen_random_uuid() primary key,
  lote_id uuid references pollos_lotes on delete cascade not null,
  cantidad integer not null,
  fecha date not null default current_date,
  created_at timestamptz default now()
);
alter table pollos_bajas enable row level security;
create policy "Users can CRUD own bajas" on pollos_bajas for all using (
  exists (select 1 from pollos_lotes where id = lote_id and user_id = auth.uid())
);

create table pollos_pesajes (
  id uuid default gen_random_uuid() primary key,
  lote_id uuid references pollos_lotes on delete cascade not null,
  peso_promedio numeric not null,
  fecha date not null default current_date,
  created_at timestamptz default now()
);
alter table pollos_pesajes enable row level security;
create policy "Users can CRUD own pesajes" on pollos_pesajes for all using (
  exists (select 1 from pollos_lotes where id = lote_id and user_id = auth.uid())
);

create table pollos_ventas (
  id uuid default gen_random_uuid() primary key,
  lote_id uuid references pollos_lotes on delete cascade not null,
  tipo text not null check (tipo in ('vivo','empacado')),
  cantidad integer not null,
  precio_unitario numeric not null,
  total numeric not null,
  comprador text,
  fiado boolean not null default false,
  pagado numeric not null default 0,
  fecha date not null default current_date,
  created_at timestamptz default now()
);
alter table pollos_ventas enable row level security;
create policy "Users can CRUD own ventas" on pollos_ventas for all using (
  exists (select 1 from pollos_lotes where id = lote_id and user_id = auth.uid())
);

create table pollos_empacados (
  id uuid default gen_random_uuid() primary key,
  lote_id uuid references pollos_lotes on delete cascade not null,
  cantidad integer not null,
  peso_paquete numeric not null,
  fecha date not null default current_date,
  created_at timestamptz default now()
);
alter table pollos_empacados enable row level security;
create policy "Users can CRUD own empacados" on pollos_empacados for all using (
  exists (select 1 from pollos_lotes where id = lote_id and user_id = auth.uid())
);

create table pollos_gastos (
  id uuid default gen_random_uuid() primary key,
  lote_id uuid references pollos_lotes on delete cascade not null,
  descripcion text not null,
  monto numeric not null,
  fecha date not null default current_date,
  created_at timestamptz default now()
);
alter table pollos_gastos enable row level security;
create policy "Users can CRUD own gastos" on pollos_gastos for all using (
  exists (select 1 from pollos_lotes where id = lote_id and user_id = auth.uid())
);

-- Gallinas Ponedoras
create table ponedoras_lotes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  nombre text not null,
  raza text not null,
  cantidad integer not null,
  fecha_inicio date not null default current_date,
  costo_total numeric not null default 0,
  activo boolean not null default true,
  created_at timestamptz default now()
);
alter table ponedoras_lotes enable row level security;
create policy "Users can CRUD own ponedoras" on ponedoras_lotes for all using (auth.uid() = user_id);

create table ponedoras_posturas (
  id uuid default gen_random_uuid() primary key,
  lote_id uuid references ponedoras_lotes on delete cascade not null,
  cantidad integer not null,
  fecha date not null default current_date,
  created_at timestamptz default now()
);
alter table ponedoras_posturas enable row level security;
create policy "Users can CRUD own posturas" on ponedoras_posturas for all using (
  exists (select 1 from ponedoras_lotes where id = lote_id and user_id = auth.uid())
);

create table ponedoras_bajas (
  id uuid default gen_random_uuid() primary key,
  lote_id uuid references ponedoras_lotes on delete cascade not null,
  cantidad integer not null,
  fecha date not null default current_date,
  created_at timestamptz default now()
);
alter table ponedoras_bajas enable row level security;
create policy "Users can CRUD own bajas" on ponedoras_bajas for all using (
  exists (select 1 from ponedoras_lotes where id = lote_id and user_id = auth.uid())
);

create table ponedoras_ventas (
  id uuid default gen_random_uuid() primary key,
  lote_id uuid references ponedoras_lotes on delete cascade not null,
  cantidad integer not null,
  precio_unitario numeric not null,
  total numeric not null,
  comprador text,
  fiado boolean not null default false,
  pagado numeric not null default 0,
  fecha date not null default current_date,
  created_at timestamptz default now()
);
alter table ponedoras_ventas enable row level security;
create policy "Users can CRUD own ventas" on ponedoras_ventas for all using (
  exists (select 1 from ponedoras_lotes where id = lote_id and user_id = auth.uid())
);

create table ponedoras_gastos (
  id uuid default gen_random_uuid() primary key,
  lote_id uuid references ponedoras_lotes on delete cascade not null,
  descripcion text not null,
  monto numeric not null,
  etapa text not null default 'cria' check (etapa in ('cria','postura')),
  fecha date not null default current_date,
  created_at timestamptz default now()
);
alter table ponedoras_gastos enable row level security;
create policy "Users can CRUD own gastos" on ponedoras_gastos for all using (
  exists (select 1 from ponedoras_lotes where id = lote_id and user_id = auth.uid())
);

-- Tilapias
create table tilapias_lotes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  nombre text not null,
  cantidad integer not null,
  peso_promedio_estimado numeric not null default 0,
  costo_total numeric not null default 0,
  fecha_inicio date not null default current_date,
  activo boolean not null default true,
  created_at timestamptz default now()
);
alter table tilapias_lotes enable row level security;
create policy "Users can CRUD own tilapias" on tilapias_lotes for all using (auth.uid() = user_id);

create table tilapias_bajas (
  id uuid default gen_random_uuid() primary key,
  lote_id uuid references tilapias_lotes on delete cascade not null,
  cantidad integer not null,
  fecha date not null default current_date,
  created_at timestamptz default now()
);
alter table tilapias_bajas enable row level security;
create policy "Users can CRUD own bajas" on tilapias_bajas for all using (
  exists (select 1 from tilapias_lotes where id = lote_id and user_id = auth.uid())
);

create table tilapias_cosechas (
  id uuid default gen_random_uuid() primary key,
  lote_id uuid references tilapias_lotes on delete cascade not null,
  cantidad integer not null,
  peso_total numeric not null,
  precio_venta numeric not null default 0,
  fecha date not null default current_date,
  created_at timestamptz default now()
);
alter table tilapias_cosechas enable row level security;
create policy "Users can CRUD own cosechas" on tilapias_cosechas for all using (
  exists (select 1 from tilapias_lotes where id = lote_id and user_id = auth.uid())
);

create table tilapias_gastos (
  id uuid default gen_random_uuid() primary key,
  lote_id uuid references tilapias_lotes on delete cascade not null,
  descripcion text not null,
  monto numeric not null,
  fecha date not null default current_date,
  created_at timestamptz default now()
);
alter table tilapias_gastos enable row level security;
create policy "Users can CRUD own gastos" on tilapias_gastos for all using (
  exists (select 1 from tilapias_lotes where id = lote_id and user_id = auth.uid())
);

-- Ganado Vacuno
create table vacuno_lotes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  nombre text not null,
  cantidad integer not null,
  costo_total numeric not null default 0,
  fecha_inicio date not null default current_date,
  activo boolean not null default true,
  created_at timestamptz default now()
);
alter table vacuno_lotes enable row level security;
create policy "Users can CRUD own vacuno" on vacuno_lotes for all using (auth.uid() = user_id);

create table vacuno_bajas (
  id uuid default gen_random_uuid() primary key,
  lote_id uuid references vacuno_lotes on delete cascade not null,
  cantidad integer not null,
  fecha date not null default current_date,
  created_at timestamptz default now()
);
alter table vacuno_bajas enable row level security;
create policy "Users can CRUD own bajas" on vacuno_bajas for all using (
  exists (select 1 from vacuno_lotes where id = lote_id and user_id = auth.uid())
);

create table vacuno_ventas (
  id uuid default gen_random_uuid() primary key,
  lote_id uuid references vacuno_lotes on delete cascade not null,
  cantidad integer not null,
  precio_unitario numeric not null,
  total numeric not null,
  comprador text,
  fiado boolean not null default false,
  pagado numeric not null default 0,
  fecha date not null default current_date,
  created_at timestamptz default now()
);
alter table vacuno_ventas enable row level security;
create policy "Users can CRUD own ventas" on vacuno_ventas for all using (
  exists (select 1 from vacuno_lotes where id = lote_id and user_id = auth.uid())
);

create table vacuno_gastos (
  id uuid default gen_random_uuid() primary key,
  lote_id uuid references vacuno_lotes on delete cascade not null,
  descripcion text not null,
  monto numeric not null,
  fecha date not null default current_date,
  created_at timestamptz default now()
);
alter table vacuno_gastos enable row level security;
create policy "Users can CRUD own gastos" on vacuno_gastos for all using (
  exists (select 1 from vacuno_lotes where id = lote_id and user_id = auth.uid())
);

-- Trading
create table trading_operaciones (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  tipo text not null check (tipo in ('ganada','perdida')),
  activo text not null,
  monto numeric not null,
  fecha date not null default current_date,
  created_at timestamptz default now()
);
alter table trading_operaciones enable row level security;
create policy "Users can CRUD own operations" on trading_operaciones for all using (auth.uid() = user_id);

-- Recordatorios
create table recordatorios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  titulo text not null,
  descripcion text,
  fecha date not null,
  hora text not null default '12:00',
  prioridad text not null default 'media' check (prioridad in ('alta','media','baja')),
  completado boolean not null default false,
  created_at timestamptz default now()
);
alter table recordatorios enable row level security;
create policy "Users can CRUD own recordatorios" on recordatorios for all using (auth.uid() = user_id);

-- Notas
create table notas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  titulo text not null,
  contenido text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table notas enable row level security;
create policy "Users can CRUD own notas" on notas for all using (auth.uid() = user_id);

-- Gastos Personales
create table gastos_personales (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  fecha date not null default current_date,
  tipo text not null check (tipo in ('ingreso','gasto')),
  categoria text not null,
  descripcion text not null,
  monto numeric not null,
  created_at timestamptz default now()
);
alter table gastos_personales enable row level security;
create policy "Users can CRUD own gastos_personales" on gastos_personales for all using (auth.uid() = user_id);

create table gastos_presupuestos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  mes text not null,
  monto numeric not null,
  unique(user_id, mes)
);
alter table gastos_presupuestos enable row level security;
create policy "Users can CRUD own presupuestos" on gastos_presupuestos for all using (auth.uid() = user_id);
