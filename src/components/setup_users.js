import { createClient } from '@supabase/supabase-js';

// !! ВАЖНО !!
// 1. Зайди в свой проект Supabase -> Project Settings -> API
// 2. Найди свой ключ "service_role" в разделе "Project API keys".
// 3. Вставь его сюда вместо 'PASTE_YOUR_SERVICE_ROLE_KEY_HERE'.
// 4. НЕ СОХРАНЯЙ ЭТОТ КЛЮЧ В GIT.
const SUPABASE_URL = 'https://hxuwnevxsyqdskzqalxu.supabase.co'; // Это из твоих логов, должно быть правильно
const SERVICE_ROLE_KEY = 'PASTE_YOUR_SERVICE_ROLE_KEY_HERE';

if (SERVICE_ROLE_KEY.includes('PASTE_YOUR')) {
  console.error('\x1b[31m%s\x1b[0m', 'ОШИБКА: Пожалуйста, вставь свой SERVICE_ROLE_KEY в scripts/setup_users.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const usersToSetup = [
  { email: 'zaya2009@our.love', password: '1801' },
  { email: 'kotya2007@our.love', password: '1801' } // Использую такой же пароль для простоты
];

async function setupUsers() {
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Ошибка получения списка пользователей:', listError.message);
    return;
  }

  for (const user of usersToSetup) {
    const existingUser = users.find(u => u.email === user.email);

    if (existingUser) {
      console.log(`Пользователь ${user.email} существует. Обновляю пароль...`);
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password: user.password }
      );
      if (updateError) console.error(`  -> Не удалось обновить пароль: ${updateError.message}`);
      else console.log(`  -> Пароль успешно обновлен.`);
    } else {
      console.log(`Пользователь ${user.email} не существует. Создаю...`);
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });
      if (createError) console.error(`  -> Не удалось создать пользователя: ${createError.message}`);
      else console.log(`  -> Пользователь успешно создан.`);
    }
  }
}

setupUsers();