// Конфигурация пользователей с хешами адресов
// Адреса захешированы для безопасности

export const USERS = {
  // Владимир Овчаров
  '0xD44622956c2FC57c1bccd7C274DeE20059804031': {
    name: 'Владимир Овчаров',
    role: 'owner',
    permissions: ['deploy', 'manage_participants', 'start_vesting', 'claim_tokens']
  },
  // Максим Худик
  '0xcD9326574bCe00c288FFBBF6f190Fa936f2b9cA9': {
    name: 'Максим Худик',
    role: 'admin',
    permissions: ['manage_participants', 'start_vesting', 'claim_tokens']
  }
};

// Функция для проверки, является ли адрес авторизованным пользователем
export const isAuthorizedUser = (address) => {
  if (!address) return false;
  return USERS[address] !== undefined;
};

// Функция для получения информации о пользователе
export const getUserInfo = (address) => {
  if (!address) return null;
  return USERS[address] || null;
};

// Функция для проверки разрешений пользователя
export const hasPermission = (address, permission) => {
  const user = getUserInfo(address);
  if (!user) return false;
  return user.permissions.includes(permission);
};
