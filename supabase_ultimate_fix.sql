-- c:\Users\Ali\Desktop\Love u\supabase_ultimate_fix.sql

-- 1. Включаем RLS для всех таблиц (на всякий случай)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- 2. Сносим ВСЕ старые политики (чтобы не мешали)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

DROP POLICY IF EXISTS "Authenticated users can view posts." ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts." ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts." ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts." ON public.posts;

DROP POLICY IF EXISTS "Authenticated users can view likes." ON public.likes;
DROP POLICY IF EXISTS "Users can insert their own likes." ON public.likes;
DROP POLICY IF EXISTS "Users can delete their own likes." ON public.likes;

DROP POLICY IF EXISTS "Authenticated users can view and send messages." ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can view all messages." ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages." ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages." ON public.chat_messages;

DROP POLICY IF EXISTS "Users can view own plans" ON public.plans;
DROP POLICY IF EXISTS "Authenticated users can view all plans" ON public.plans;
DROP POLICY IF EXISTS "Users can insert own plans" ON public.plans;
DROP POLICY IF EXISTS "Users can update own plans" ON public.plans;
DROP POLICY IF EXISTS "Authenticated users can update all plans" ON public.plans;
DROP POLICY IF EXISTS "Users can delete own plans" ON public.plans;
DROP POLICY IF EXISTS "Authenticated users can delete all plans" ON public.plans;

DROP POLICY IF EXISTS "Users can view own calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Authenticated users can view all calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can insert own calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update own calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete own calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Authenticated users can delete any calendar event" ON public.calendar_events;

-- 3. Создаем НОВЫЕ, РАБОЧИЕ политики

-- Профили
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Галерея (Посты) - Видят все, добавляют свои, удаляют свои
CREATE POLICY "View all posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Лайки - Видят все, ставят свои
CREATE POLICY "View all likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Insert own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Чат - Видят все, пишут свои
CREATE POLICY "View all messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Insert own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

-- Планы - ОБЩИЕ (любой может менять всё)
CREATE POLICY "View all plans" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Insert plans" ON public.plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Update plans" ON public.plans FOR UPDATE USING (true);
CREATE POLICY "Delete plans" ON public.plans FOR DELETE USING (true);

-- Календарь - ОБЩИЙ (любой может менять всё)
CREATE POLICY "View all events" ON public.calendar_events FOR SELECT USING (true);
CREATE POLICY "Insert events" ON public.calendar_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Update events" ON public.calendar_events FOR UPDATE USING (true);
CREATE POLICY "Delete events" ON public.calendar_events FOR DELETE USING (true);

-- 4. ХРАНИЛИЩЕ (STORAGE) - Самое важное для фото и музыки

-- Создаем бакеты, если их нет (и делаем публичными)
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

-- Разрешаем ВСЕМ (даже без входа) смотреть файлы (чтобы плеер и картинки работали)
CREATE POLICY "Public Access Gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Public Access Music" ON storage.objects FOR SELECT USING (bucket_id = 'Music');
CREATE POLICY "Public Access Voice" ON storage.objects FOR SELECT USING (bucket_id = 'voice_messages');

-- Разрешаем АВТОРИЗОВАННЫМ загружать файлы
CREATE POLICY "Authenticated Upload Gallery" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "Authenticated Upload Music" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'Music');
CREATE POLICY "Authenticated Upload Voice" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'voice_messages');
