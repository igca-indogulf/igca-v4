-- =========================================================
-- IGCA PLATFORM — CORE SCHEMA
-- Run in order: 01_schema.sql -> 02_rls.sql -> 03_storage.sql -> 04_seed.sql
-- =========================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ---------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------
create type account_type as enum
  ('investor','founder','professional','business_owner','advisor','industry_expert','student','other');

create type enrollment_status as enum ('enrolled','in_progress','completed');

create type connection_request_status as enum ('pending','accepted','rejected');

create type notification_type as enum
  ('connection_request','connection_accepted','research_published','course_update','system');

create type whatsapp_status as enum ('pending','queued','sent','delivered','failed','retry');

create type whatsapp_category as enum ('research','snapshot_share','learning','account');

create type share_channel as enum ('whatsapp','link','copy');

create type learning_video_category as enum ('industry','country','network');

-- ---------------------------------------------------------
-- REFERENCE TABLES
-- ---------------------------------------------------------
create table industries (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique
);

create table countries (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  code text not null unique
);

create table topics (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique
);

-- ---------------------------------------------------------
-- PROFILES  (1:1 with auth.users)
-- ---------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text not null unique,
  account_type account_type not null default 'professional',
  headline text,
  bio text,
  avatar_url text,
  location text,
  industry_id uuid references industries(id) on delete set null,
  country_id uuid references countries(id) on delete set null,
  expertise text[] default '{}',
  interests text[] default '{}',
  company_name text,
  website text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_profiles_industry on profiles(industry_id);
create index idx_profiles_country on profiles(country_id);
create index idx_profiles_username on profiles(username);

-- ---------------------------------------------------------
-- RESEARCH
-- ---------------------------------------------------------
create table research_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique
);

create table research_items (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  summary text not null,
  executive_summary text not null,
  body_sections jsonb not null default '[]',   -- [{heading, content}]
  conclusion text,
  category_id uuid references research_categories(id) on delete set null,
  industry_id uuid references industries(id) on delete set null,
  country_id uuid references countries(id) on delete set null,
  topic_id uuid references topics(id) on delete set null,
  featured boolean not null default false,
  published boolean not null default true,
  published_at timestamptz not null default now(),
  cover_image text,
  reading_time int not null default 5,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_research_industry on research_items(industry_id);
create index idx_research_country on research_items(country_id);
create index idx_research_topic on research_items(topic_id);
create index idx_research_featured on research_items(featured) where featured = true;
create index idx_research_published on research_items(published, published_at desc);

create table research_highlights (
  id uuid primary key default uuid_generate_v4(),
  research_id uuid not null references research_items(id) on delete cascade,
  title text not null,
  description text not null,
  metric_value text,
  sort_order int not null default 0
);
create index idx_highlights_research on research_highlights(research_id);

create table research_snapshots (
  id uuid primary key default uuid_generate_v4(),
  research_id uuid not null references research_items(id) on delete cascade,
  headline text not null,
  executive_summary text not null,
  key_findings text[] not null default '{}',
  key_opportunity text,
  key_risk text,
  conclusion text not null,
  created_at timestamptz not null default now()
);
create index idx_snapshots_research on research_snapshots(research_id);

-- ---------------------------------------------------------
-- LEARNING
-- ---------------------------------------------------------
create table learning_videos (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  thumbnail_url text,
  video_url text not null,
  duration_seconds int not null default 300,
  category learning_video_category not null,
  industry_id uuid references industries(id) on delete set null,
  country_id uuid references countries(id) on delete set null,
  published_at timestamptz not null default now()
);
create index idx_videos_category on learning_videos(category);
create index idx_videos_industry on learning_videos(industry_id);
create index idx_videos_country on learning_videos(country_id);

create table courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  instructor text not null,
  thumbnail_url text,
  level text not null default 'beginner',
  total_modules int not null default 0,
  offers_certification boolean not null default false,
  created_at timestamptz not null default now()
);

create table course_modules (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  sort_order int not null default 0,
  duration_minutes int not null default 10
);
create index idx_modules_course on course_modules(course_id);

create table course_enrollments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  status enrollment_status not null default 'enrolled',
  progress_percent int not null default 0,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(user_id, course_id)
);
create index idx_enrollments_user on course_enrollments(user_id);

create table learning_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  module_id uuid not null references course_modules(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  unique(user_id, module_id)
);
create index idx_progress_user on learning_progress(user_id);

create table certifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  issued_at timestamptz not null default now(),
  credential_code text not null unique
);
create index idx_certifications_user on certifications(user_id);

-- ---------------------------------------------------------
-- NETWORKING
-- ---------------------------------------------------------
create table connection_requests (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references profiles(id) on delete cascade,
  receiver_id uuid not null references profiles(id) on delete cascade,
  status connection_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (sender_id <> receiver_id),
  unique(sender_id, receiver_id)
);
create index idx_conn_req_receiver on connection_requests(receiver_id, status);
create index idx_conn_req_sender on connection_requests(sender_id, status);

create table connections (
  id uuid primary key default uuid_generate_v4(),
  user_a uuid not null references profiles(id) on delete cascade,
  user_b uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a < user_b),
  unique(user_a, user_b)
);
create index idx_connections_a on connections(user_a);
create index idx_connections_b on connections(user_b);

-- ---------------------------------------------------------
-- MESSAGING
-- ---------------------------------------------------------
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  last_message_at timestamptz
);

create table conversation_members (
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);
create index idx_conv_members_user on conversation_members(user_id);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  seen_at timestamptz
);
create index idx_messages_conversation on messages(conversation_id, created_at);

-- ---------------------------------------------------------
-- NOTIFICATIONS (internal, always shown regardless of WhatsApp)
-- ---------------------------------------------------------
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on notifications(user_id, read, created_at desc);

create table notification_preferences (
  user_id uuid primary key references profiles(id) on delete cascade,
  email_enabled boolean not null default true,
  push_enabled boolean not null default true
);

-- ---------------------------------------------------------
-- WHATSAPP  (value-only distribution channel)
-- ---------------------------------------------------------
create table whatsapp_preferences (
  user_id uuid primary key references profiles(id) on delete cascade,
  phone_number text,
  opted_in boolean not null default false,
  allow_research_updates boolean not null default true,
  allow_snapshot_shares boolean not null default true,
  allow_learning_updates boolean not null default false,
  allow_account_updates boolean not null default true,
  updated_at timestamptz not null default now()
);

create table whatsapp_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  category whatsapp_category not null,
  payload jsonb not null default '{}',
  status whatsapp_status not null default 'pending',
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index idx_whatsapp_msgs_user on whatsapp_messages(user_id, created_at desc);
create index idx_whatsapp_msgs_status on whatsapp_messages(status);

create table whatsapp_delivery_logs (
  id uuid primary key default uuid_generate_v4(),
  whatsapp_message_id uuid not null references whatsapp_messages(id) on delete cascade,
  status whatsapp_status not null,
  detail text,
  created_at timestamptz not null default now()
);
create index idx_whatsapp_logs_msg on whatsapp_delivery_logs(whatsapp_message_id);

-- User-initiated "share this snapshot on WhatsApp to a client" events
create table share_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  snapshot_id uuid not null references research_snapshots(id) on delete cascade,
  channel share_channel not null,
  created_at timestamptz not null default now()
);
create index idx_share_events_user on share_events(user_id);
create index idx_share_events_snapshot on share_events(snapshot_id);

-- ---------------------------------------------------------
-- updated_at TRIGGER HELPER
-- ---------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger trg_research_updated_at before update on research_items
  for each row execute function set_updated_at();

-- ---------------------------------------------------------
-- Auto-create profile row when a new auth user signs up
-- ---------------------------------------------------------
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, username, account_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce((new.raw_user_meta_data->>'account_type')::account_type, 'professional')
  );
  insert into public.whatsapp_preferences (user_id) values (new.id);
  insert into public.notification_preferences (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------
-- Keep conversations.last_message_at fresh
-- ---------------------------------------------------------
create or replace function touch_conversation()
returns trigger as $$
begin
  update conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_touch_conversation after insert on messages
  for each row execute function touch_conversation();

-- ---------------------------------------------------------
-- Auto notification + WhatsApp-eligibility hook on connection request
-- (WhatsApp is intentionally NOT triggered here — rule #7)
-- ---------------------------------------------------------
create or replace function notify_connection_request()
returns trigger as $$
begin
  insert into notifications (user_id, type, title, body, link)
  values (
    new.receiver_id,
    'connection_request',
    'New connection request',
    (select full_name from profiles where id = new.sender_id) || ' wants to connect with you.',
    '/network/' || new.sender_id
  );
  return new;
end;
$$ language plpgsql;

create trigger trg_notify_connection_request after insert on connection_requests
  for each row execute function notify_connection_request();

create or replace function notify_connection_accepted()
returns trigger as $$
begin
  if new.status = 'accepted' and old.status <> 'accepted' then
    insert into notifications (user_id, type, title, body, link)
    values (
      new.sender_id,
      'connection_accepted',
      'Connection accepted',
      (select full_name from profiles where id = new.receiver_id) || ' accepted your connection request.',
      '/network/' || new.receiver_id
    );
    insert into connections (user_a, user_b)
    values (least(new.sender_id, new.receiver_id), greatest(new.sender_id, new.receiver_id))
    on conflict do nothing;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_notify_connection_accepted after update on connection_requests
  for each row execute function notify_connection_accepted();
