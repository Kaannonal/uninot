-- Extensions
create extension if not exists "uuid-ossp";

-- Universities
create table universities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  city text not null,
  slug text unique not null
);

-- Faculties
create table faculties (
  id uuid primary key default uuid_generate_v4(),
  university_id uuid references universities(id) on delete cascade,
  name text not null
);

-- Departments
create table departments (
  id uuid primary key default uuid_generate_v4(),
  faculty_id uuid references faculties(id) on delete cascade,
  name text not null,
  code text not null
);

-- Courses
create table courses (
  id uuid primary key default uuid_generate_v4(),
  department_id uuid references departments(id) on delete cascade,
  code text not null,
  name text not null,
  language text default 'tr'
);

-- Profiles (auth.users ile bağlı)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  university_id uuid references universities(id),
  department_id uuid references departments(id),
  role text default 'user' check (role in ('user', 'admin')),
  status text default 'active' check (status in ('active', 'banned')),
  created_at timestamptz default now()
);

-- Notes
create table notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id),
  title text not null,
  description text,
  file_url text not null,
  note_type text check (note_type in ('vize','final','ozet','formul','diger')),
  term text,
  page_count int,
  status text default 'pending' check (status in ('pending','approved','rejected','under_review','removed')),
  avg_rating numeric default 0,
  view_count int default 0,
  download_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Note views
create table note_views (
  id uuid primary key default uuid_generate_v4(),
  note_id uuid references notes(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  duration_seconds int default 0,
  is_valid boolean default false,
  viewed_at timestamptz default now()
);

-- Note downloads
create table note_downloads (
  id uuid primary key default uuid_generate_v4(),
  note_id uuid references notes(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  is_valid boolean default false,
  downloaded_at timestamptz default now()
);

-- Reviews
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  note_id uuid references notes(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- Earnings
create table earnings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  note_id uuid references notes(id) on delete cascade,
  month text not null,
  valid_views int default 0,
  valid_downloads int default 0,
  performance_score numeric default 0,
  creator_net_earning numeric default 0,
  status text default 'estimated' check (status in ('estimated','confirmed','paid','withheld'))
);

-- Reports
create table reports (
  id uuid primary key default uuid_generate_v4(),
  note_id uuid references notes(id) on delete cascade,
  reporter_id uuid references profiles(id) on delete cascade,
  reason text not null,
  status text default 'open' check (status in ('open','resolved','dismissed')),
  created_at timestamptz default now()
);

-- Favorites
create table favorites (
  id uuid primary key default uuid_generate_v4(),
  note_id uuid references notes(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(note_id, user_id)
);

-- Indexes
create index on notes(status);
create index on notes(course_id);
create index on note_views(note_id, is_valid);
create index on earnings(user_id, month);

-- RLS
alter table profiles enable row level security;
alter table notes enable row level security;
alter table note_views enable row level security;
alter table note_downloads enable row level security;
alter table reviews enable row level security;
alter table earnings enable row level security;
alter table reports enable row level security;
alter table favorites enable row level security;

-- RLS Policies
create policy "Herkes approved notları görebilir" on notes for select using (status = 'approved');
create policy "Kullanıcı kendi notunu yönetir" on notes for all using (auth.uid() = user_id);
create policy "Kullanıcı kendi profilini görür" on profiles for select using (auth.uid() = id);
create policy "Kullanıcı kendi profilini günceller" on profiles for update using (auth.uid() = id);
create policy "Kullanıcı kendi kazançlarını görür" on earnings for select using (auth.uid() = user_id);
create policy "Kullanıcı rapor oluşturabilir" on reports for insert with check (auth.uid() = reporter_id);
create policy "Kullanıcı favori ekleyebilir" on favorites for all using (auth.uid() = user_id);

-- Auto profile oluşturma trigger
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
