-- Вставь этот код в Supabase SQL Editor и нажми RUN

-- 1. Убедимся, что таблица существует (на всякий случай)
CREATE TABLE IF NOT EXISTS public.photos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  path text NOT NULL,
  filename text,
  created_at timestamptz DEFAULT now()
);

-- 0. Сброс старых политик (чтобы избежать ошибок "policy already exists")
-- Теперь это безопасно, так как таблица точно существует
DROP POLICY IF EXISTS "Users can view own photos" ON public.photos;
DROP POLICY IF EXISTS "Users can insert own photos" ON public.photos;
DROP POLICY IF EXISTS "Users can delete own photos" ON public.photos;
DROP POLICY IF EXISTS "Allow authenticated uploads to photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated downloads from photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated to read Music" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to Music" ON storage.objects;

-- 2. Включаем защиту (RLS) для таблицы photos
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Политика: Разрешить пользователям видеть ТОЛЬКО свои записи
CREATE POLICY "Users can view own photos" ON public.photos
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Политика: Разрешить пользователям добавлять записи (только за себя)
CREATE POLICY "Users can insert own photos" ON public.photos
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Политика: Разрешить удалять свои записи
CREATE POLICY "Users can delete own photos" ON public.photos
FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- 3. Политики для Хранилища (Storage)

-- Разрешить загрузку в бакет 'photos', если папка совпадает с ID пользователя
CREATE POLICY "Allow authenticated uploads to photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (lower(bucket_id) = 'photos' AND name LIKE (auth.uid() || '/%'));

-- Разрешить просмотр файлов в бакете 'photos' (своих)
CREATE POLICY "Allow authenticated downloads from photos" ON storage.objects
FOR SELECT TO authenticated
USING (lower(bucket_id) = 'photos' AND name LIKE (auth.uid() || '/%'));

-- Разрешить прослушивание музыки из бакета 'Music' (всем авторизованным)
CREATE POLICY "Allow authenticated to read Music" ON storage.objects
FOR SELECT TO authenticated
USING (lower(bucket_id) = 'music');

-- Разрешить загрузку музыки в бакет 'Music' (всем авторизованным)
CREATE POLICY "Allow authenticated uploads to Music" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (lower(bucket_id) = 'music');

-- 4. Добавляем колонку для подписей (выполни это в SQL Editor)
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS caption text;