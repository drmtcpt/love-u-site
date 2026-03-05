-- c:\Users\Ali\Desktop\Love u\supabase_fix_profiles.sql

-- 1. Создаем профили для ВСЕХ существующих пользователей, у которых их нет
INSERT INTO public.profiles (id, username, avatar_url)
SELECT 
  id, 
  split_part(email, '@', 1), -- Используем часть email до @ как имя
  'https://api.dicebear.com/9.x/avataaars/svg?seed=' || id -- Генерируем аватарку
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 2. На всякий случай еще раз разрешаем доступ к профилям
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
