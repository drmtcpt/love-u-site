// scripts/init-user.js
import { createClient } from '@supabase/supabase-js';

// Используем предоставленные ключи
const SUPABASE_URL = 'https://hxuwnevxsyqdskzqalxu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4dXduZXZ4c3lxZHNrenFhbHh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA3NzcyNSwiZXhwIjoyMDg2NjUzNzI1fQ.OGHXvN-9BleWz1UyHfPzWxhQ5mp849LT3GP2OeQEm_I';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function createUser() {
  const email = 'semya1618@love-u.site';
  const password = 'zayakisya';

  console.log(`Checking if user ${email} exists...`);

  // Сначала пробуем найти пользователя (через listUsers, так как getByEmail нет в админке напрямую в старых версиях, но createUser вернет ошибку если есть)
  // Проще всего попробовать создать, если существует - не страшно.
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true // Сразу подтверждаем email
  });

  if (error) {
    console.error('Error creating user:', error.message);
    if (error.message.includes('already registered')) {
        console.log('User already exists. Updating password just in case...');
        // Получаем ID пользователя, чтобы обновить пароль (если нужно)
        const { data: listData } = await supabase.auth.admin.listUsers();
        const user = listData.users.find(u => u.email === email);
        if (user) {
            const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { password: password });
            if (updateError) console.error('Error updating password:', updateError.message);
            else console.log('Password updated successfully.');
        }
    }
  } else {
    console.log('User created successfully:', data.user.id);
  }
}

createUser();
