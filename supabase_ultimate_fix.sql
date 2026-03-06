-- c:\Users\Ali\Desktop\Love u\supabase_ultimate_fix.sql
-- This is the definitive script to fix all permission and data sharing issues.

-- 1. Создаем профили для ВСЕХ существующих пользователей, у которых их нет.
INSERT INTO public.profiles (id, username, avatar_url)
SELECT
  id,
  split_part(email, '@', 1),
  'https://api.dicebear.com/9.x/avataaars/svg?seed=' || id
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 2. Включаем RLS для всех таблиц
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- 3. Сносим ВСЕ старые политики
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view posts." ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts." ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts." ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts." ON public.posts;
DROP POLICY IF EXISTS "View all posts" ON public.posts;
DROP POLICY IF EXISTS "Insert own posts" ON public.posts;
DROP POLICY IF EXISTS "Delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can view likes." ON public.likes;
DROP POLICY IF EXISTS "Users can insert their own likes." ON public.likes;
DROP POLICY IF EXISTS "Users can delete their own likes." ON public.likes;
DROP POLICY IF EXISTS "View all likes" ON public.likes;
DROP POLICY IF EXISTS "Insert own likes" ON public.likes;
DROP POLICY IF EXISTS "Delete own likes" ON public.likes;
DROP POLICY IF EXISTS "Authenticated users can view and send messages." ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can view all messages." ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages." ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages." ON public.chat_messages;
DROP POLICY IF EXISTS "View all messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Insert own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Delete own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view own plans" ON public.plans;
DROP POLICY IF EXISTS "Authenticated users can view all plans" ON public.plans;
DROP POLICY IF EXISTS "View all plans" ON public.plans;
DROP POLICY IF EXISTS "Users can insert own plans" ON public.plans;
DROP POLICY IF EXISTS "Insert plans" ON public.plans;
DROP POLICY IF EXISTS "Users can update own plans" ON public.plans;
DROP POLICY IF EXISTS "Authenticated users can update all plans" ON public.plans;
DROP POLICY IF EXISTS "Update plans" ON public.plans;
DROP POLICY IF EXISTS "Update any plan" ON public.plans;
DROP POLICY IF EXISTS "Users can delete own plans" ON public.plans;
DROP POLICY IF EXISTS "Authenticated users can delete all plans" ON public.plans;
DROP POLICY IF EXISTS "Delete plans" ON public.plans;
DROP POLICY IF EXISTS "Delete any plan" ON public.plans;
DROP POLICY IF EXISTS "Users can view own calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Authenticated users can view all calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "View all events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can insert own calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Insert events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update own calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Update events" ON public.calendar_events;
DROP POLICY IF EXISTS "Update any event" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete own calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Authenticated users can delete any calendar event" ON public.calendar_events;
DROP POLICY IF EXISTS "Delete events" ON public.calendar_events;
DROP POLICY IF EXISTS "Delete any event" ON public.calendar_events;

-- 4. Создаем НОВЫЕ, РАБОЧИЕ политики

-- Профили
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Галерея (Посты)
CREATE POLICY "View all posts" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert own posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete any posts" ON public.posts FOR DELETE TO authenticated USING (true);

-- Лайки
CREATE POLICY "View all likes" ON public.likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert own likes" ON public.likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own likes" ON public.likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Чат
CREATE POLICY "View all messages" ON public.chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert own messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own messages" ON public.chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Планы (ОБЩИЕ)
CREATE POLICY "View all plans" ON public.plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert plans" ON public.plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update any plan" ON public.plans FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete any plan" ON public.plans FOR DELETE TO authenticated USING (true);

-- Календарь (ОБЩИЙ)
CREATE POLICY "View all events" ON public.calendar_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert events" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update any event" ON public.calendar_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Delete any event" ON public.calendar_events FOR DELETE TO authenticated USING (true);

-- 5. ХРАНИЛИЩЕ (STORAGE)

-- Создаем бакеты
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('Music', 'Music', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('voice_messages', 'voice_messages', true) ON CONFLICT (id) DO UPDATE SET public = true;

-- Сносим старые политики хранилища
DROP POLICY IF EXISTS "Public Access Gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Music" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Voice" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Gallery" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Music" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Voice" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated downloads from photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated to read Music" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to Music" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload to Gallery" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload to Music" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload to Voice" ON storage.objects;

-- Разрешаем ВСЕМ (даже без входа) смотреть файлы
CREATE POLICY "Public Access Gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Public Access Music" ON storage.objects FOR SELECT USING (bucket_id = 'Music');
CREATE POLICY "Public Access Voice" ON storage.objects FOR SELECT USING (bucket_id = 'voice_messages');

-- Разрешаем АВТОРИЗОВАННЫМ загружать файлы
CREATE POLICY "Authenticated Upload to Gallery" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated Upload to Music" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'Music' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated Upload to Voice" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'voice_messages' AND auth.uid() IS NOT NULL);

-- 6. REALTIME
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Table public.chat_messages is already in publication supabase_realtime.';
END
$$;
