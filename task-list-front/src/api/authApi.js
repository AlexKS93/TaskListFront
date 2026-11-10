const BASE_URL = 'http://localhost:8000'; // Укажите URL вашего FastAPI бэкенда

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
      
      // Сохраняем токен и имя пользователя в браузер
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('username', data.username);

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
  }
};
