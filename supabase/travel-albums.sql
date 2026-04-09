create extension if not exists pgcrypto;

create table if not exists public.profiles (
	user_id uuid primary key references auth.users (id) on delete cascade,
	username text not null unique check (username ~ '^[a-z0-9_]{3,32}$'),
	display_name text not null check (char_length(trim(display_name)) between 1 and 80),
	bio text check (bio is null or char_length(trim(bio)) <= 280),
	avatar_path text,
	created_at timestamptz not null default timezone('utc', now()),
	updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.travel_albums (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users (id) on delete cascade,
	title text not null check (char_length(trim(title)) between 1 and 80),
	cover_path text,
	created_at timestamptz not null default timezone('utc', now()),
	updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.travel_album_photos (
	id uuid primary key default gen_random_uuid(),
	album_id uuid not null references public.travel_albums (id) on delete cascade,
	storage_path text not null unique,
	sort_order integer not null default 0 check (sort_order >= 0),
	created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.visited_countries (
	user_id uuid not null references auth.users (id) on delete cascade,
	country_code text not null check (country_code ~ '^[A-Z]{2}$'),
	created_at timestamptz not null default timezone('utc', now()),
	primary key (user_id, country_code)
);

create table if not exists public.user_trips (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users (id) on delete cascade,
	destination text not null check (char_length(trim(destination)) between 1 and 120),
	start_date date not null,
	end_date date not null,
	places_to_sleep text[] not null default '{}',
	places_to_eat text[] not null default '{}',
	places_to_visit text[] not null default '{}',
	created_at timestamptz not null default timezone('utc', now()),
	updated_at timestamptz not null default timezone('utc', now()),
	check (end_date >= start_date)
);

create table if not exists public.user_friendships (
	id uuid primary key default gen_random_uuid(),
	user_a_id uuid not null references auth.users (id) on delete cascade,
	user_b_id uuid not null references auth.users (id) on delete cascade,
	created_at timestamptz not null default timezone('utc', now()),
	check (user_a_id <> user_b_id),
	check (user_a_id < user_b_id),
	unique (user_a_id, user_b_id)
);

create table if not exists public.user_messages (
	id uuid primary key default gen_random_uuid(),
	sender_user_id uuid not null references auth.users (id) on delete cascade,
	recipient_user_id uuid not null references auth.users (id) on delete cascade,
	content_ciphertext text not null,
	content_iv text not null,
	content_tag text not null,
	created_at timestamptz not null default timezone('utc', now()),
	check (sender_user_id <> recipient_user_id)
);

create table if not exists public.user_friend_requests (
	id uuid primary key default gen_random_uuid(),
	sender_user_id uuid not null references auth.users (id) on delete cascade,
	recipient_user_id uuid not null references auth.users (id) on delete cascade,
	created_at timestamptz not null default timezone('utc', now()),
	check (sender_user_id <> recipient_user_id),
	unique (sender_user_id, recipient_user_id)
);

create index if not exists travel_albums_user_id_created_at_idx on public.travel_albums (user_id, created_at desc);
create index if not exists travel_album_photos_album_id_sort_order_idx on public.travel_album_photos (album_id, sort_order);
create index if not exists visited_countries_user_id_created_at_idx on public.visited_countries (user_id, created_at desc);
create index if not exists user_trips_user_id_start_date_idx on public.user_trips (user_id, start_date asc);
create index if not exists user_friendships_user_a_id_created_at_idx on public.user_friendships (user_a_id, created_at desc);
create index if not exists user_friendships_user_b_id_created_at_idx on public.user_friendships (user_b_id, created_at desc);
create index if not exists user_friend_requests_sender_user_id_created_at_idx on public.user_friend_requests (sender_user_id, created_at desc);
create index if not exists user_friend_requests_recipient_user_id_created_at_idx on public.user_friend_requests (recipient_user_id, created_at desc);
create index if not exists user_messages_sender_user_id_created_at_idx on public.user_messages (sender_user_id, created_at asc);
create index if not exists user_messages_recipient_user_id_created_at_idx on public.user_messages (recipient_user_id, created_at asc);

create or replace function public.set_travel_album_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at := timezone('utc', now());
	return new;
end;
$$;

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at := timezone('utc', now());
	return new;
end;
$$;

create or replace function public.set_user_trip_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at := timezone('utc', now());
	return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_profile_updated_at();

drop trigger if exists travel_albums_set_updated_at on public.travel_albums;

create trigger travel_albums_set_updated_at
before update on public.travel_albums
for each row
execute function public.set_travel_album_updated_at();

drop trigger if exists user_trips_set_updated_at on public.user_trips;

create trigger user_trips_set_updated_at
before update on public.user_trips
for each row
execute function public.set_user_trip_updated_at();

alter table public.profiles enable row level security;
alter table public.travel_albums enable row level security;
alter table public.travel_album_photos enable row level security;
alter table public.visited_countries enable row level security;
alter table public.user_friendships enable row level security;
alter table public.user_friend_requests enable row level security;
alter table public.user_messages enable row level security;
alter table public.user_trips enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read their travel albums" on public.travel_albums;
create policy "Users can read their travel albums"
on public.travel_albums
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their travel albums" on public.travel_albums;
create policy "Users can create their travel albums"
on public.travel_albums
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their travel albums" on public.travel_albums;
create policy "Users can update their travel albums"
on public.travel_albums
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their travel albums" on public.travel_albums;
create policy "Users can delete their travel albums"
on public.travel_albums
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read their travel album photos" on public.travel_album_photos;
create policy "Users can read their travel album photos"
on public.travel_album_photos
for select
using (
	exists (
		select 1
		from public.travel_albums albums
		where albums.id = travel_album_photos.album_id
		and albums.user_id = auth.uid()
	)
);

drop policy if exists "Users can create their travel album photos" on public.travel_album_photos;
create policy "Users can create their travel album photos"
on public.travel_album_photos
for insert
with check (
	exists (
		select 1
		from public.travel_albums albums
		where albums.id = travel_album_photos.album_id
		and albums.user_id = auth.uid()
	)
);

drop policy if exists "Users can update their travel album photos" on public.travel_album_photos;
create policy "Users can update their travel album photos"
on public.travel_album_photos
for update
using (
	exists (
		select 1
		from public.travel_albums albums
		where albums.id = travel_album_photos.album_id
		and albums.user_id = auth.uid()
	)
)
with check (
	exists (
		select 1
		from public.travel_albums albums
		where albums.id = travel_album_photos.album_id
		and albums.user_id = auth.uid()
	)
);

drop policy if exists "Users can delete their travel album photos" on public.travel_album_photos;
create policy "Users can delete their travel album photos"
on public.travel_album_photos
for delete
using (
	exists (
		select 1
		from public.travel_albums albums
		where albums.id = travel_album_photos.album_id
		and albums.user_id = auth.uid()
	)
);

drop policy if exists "Users can read their visited countries" on public.visited_countries;
create policy "Users can read their visited countries"
on public.visited_countries
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their visited countries" on public.visited_countries;
create policy "Users can create their visited countries"
on public.visited_countries
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their visited countries" on public.visited_countries;
create policy "Users can delete their visited countries"
on public.visited_countries
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read their trips" on public.user_trips;
create policy "Users can read their trips"
on public.user_trips
for select
using (auth.uid() = user_id);

drop policy if exists "Users can read their friendships" on public.user_friendships;
create policy "Users can read their friendships"
on public.user_friendships
for select
using (auth.uid() = user_a_id or auth.uid() = user_b_id);

drop policy if exists "Users can create their friendships" on public.user_friendships;
create policy "Users can create their friendships"
on public.user_friendships
for insert
with check (auth.uid() = user_a_id or auth.uid() = user_b_id);

drop policy if exists "Users can delete their friendships" on public.user_friendships;
create policy "Users can delete their friendships"
on public.user_friendships
for delete
using (auth.uid() = user_a_id or auth.uid() = user_b_id);

drop policy if exists "Users can read their friend requests" on public.user_friend_requests;
create policy "Users can read their friend requests"
on public.user_friend_requests
for select
using (auth.uid() = sender_user_id or auth.uid() = recipient_user_id);

drop policy if exists "Users can create their friend requests" on public.user_friend_requests;
create policy "Users can create their friend requests"
on public.user_friend_requests
for insert
with check (auth.uid() = sender_user_id);

drop policy if exists "Users can delete their friend requests" on public.user_friend_requests;
create policy "Users can delete their friend requests"
on public.user_friend_requests
for delete
using (auth.uid() = sender_user_id or auth.uid() = recipient_user_id);

drop policy if exists "Users can read their messages" on public.user_messages;
create policy "Users can read their messages"
on public.user_messages
for select
using (auth.uid() = sender_user_id or auth.uid() = recipient_user_id);

drop policy if exists "Users can create their messages" on public.user_messages;
create policy "Users can create their messages"
on public.user_messages
for insert
with check (
	auth.uid() = sender_user_id
	and exists (
		select 1
		from public.user_friendships friendships
		where friendships.user_a_id = least(sender_user_id, recipient_user_id)
		and friendships.user_b_id = greatest(sender_user_id, recipient_user_id)
	)
);

drop policy if exists "Users can create their trips" on public.user_trips;
create policy "Users can create their trips"
on public.user_trips
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their trips" on public.user_trips;
create policy "Users can update their trips"
on public.user_trips
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their trips" on public.user_trips;
create policy "Users can delete their trips"
on public.user_trips
for delete
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
	'profile-images',
	'profile-images',
	true,
	5242880,
	array['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
on conflict (id) do update
set public = excluded.public,
	file_size_limit = excluded.file_size_limit,
	allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
	'travel-albums',
	'travel-albums',
	true,
	10485760,
	array['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
on conflict (id) do update
set public = excluded.public,
	file_size_limit = excluded.file_size_limit,
	allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view travel album images" on storage.objects;
create policy "Public can view travel album images"
on storage.objects
for select
using (bucket_id = 'travel-albums');

drop policy if exists "Public can view profile images" on storage.objects;
create policy "Public can view profile images"
on storage.objects
for select
using (bucket_id = 'profile-images');

drop policy if exists "Users can upload their profile images" on storage.objects;
create policy "Users can upload their profile images"
on storage.objects
for insert
with check (
	bucket_id = 'profile-images'
	and auth.uid() is not null
	and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update their profile images" on storage.objects;
create policy "Users can update their profile images"
on storage.objects
for update
using (
	bucket_id = 'profile-images'
	and auth.uid() is not null
	and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
	bucket_id = 'profile-images'
	and auth.uid() is not null
	and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete their profile images" on storage.objects;
create policy "Users can delete their profile images"
on storage.objects
for delete
using (
	bucket_id = 'profile-images'
	and auth.uid() is not null
	and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can upload their travel album images" on storage.objects;
create policy "Users can upload their travel album images"
on storage.objects
for insert
with check (
	bucket_id = 'travel-albums'
	and auth.uid() is not null
	and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update their travel album images" on storage.objects;
create policy "Users can update their travel album images"
on storage.objects
for update
using (
	bucket_id = 'travel-albums'
	and auth.uid() is not null
	and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
	bucket_id = 'travel-albums'
	and auth.uid() is not null
	and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete their travel album images" on storage.objects;
create policy "Users can delete their travel album images"
on storage.objects
for delete
using (
	bucket_id = 'travel-albums'
	and auth.uid() is not null
	and (storage.foldername(name))[1] = auth.uid()::text
);