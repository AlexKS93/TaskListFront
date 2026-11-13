const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const authApi = {
  /**
   * Авторизация пользователя через LDAP
   * @param {string} username - Корпоративный логин
   * @param {string} password - Пароль сети
   */
  login: async (username, password) => {
    try {
      // URLSearchParams автоматически кодирует данные в формат x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка авторизации');
      }

      const data = await response.json();
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('sys_username', data.sys_username);
      localStorage.setItem('is_boss', data.is_boss ? 'true' : 'false');

      return data;
    } catch (error) {
      console.error('Auth API Login Error:', error);
      throw error;
    }
  },

  /**
   * Выход из системы (очистка токенов)
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('sys_username');
    localStorage.removeItem('is_boss');
  },

  /**
   * Проверка, авторизован ли пользователь в данный момент
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Получение имени текущего пользователя
   */
  getCurrentUser: () => {
    return localStorage.getItem('username') || '';
  },
  getSysUser: () => {
  return localStorage.getItem('sys_username') || '';
  },
  getIsBoss: () => {
    return localStorage.getItem('is_boss') === 'true';
  },
};
