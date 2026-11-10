import React, { useState } from 'react';
import { authApi } from '../api/authApi';

export default function Login({ onAuthSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setIsLoading(true);
    try {
      // Отправляем запрос на бэкенд через наш authApi
      await authApi.login(username.trim(), password);
      // Если всё успешно, вызываем колбэк для обновления состояния в App.jsx
      onAuthSuccess();
    } catch (err) {
      // Выводим ошибку, пришедшую от бэкенда (например, "Неверный логин или пароль")
      setError(err.message || 'Произошла ошибка при подключении к серверу');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        
        {/* Шапка формы */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 text-blue-600 rounded-xl mb-3 text-2xl">
            🔐
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Вход в систему</h2>
          <p className="text-sm text-gray-500 mt-1">
            Используйте вашу корпоративную учетную запись LDAP
          </p>
        </div>

        {/* Вывод ошибки */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Форма авторизации */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Учетная запись (Логин)
            </label>
            <input
              type="text"
              placeholder="ivanov_ii"
              disabled={isLoading}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Пароль сети
            </label>
            <input
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 rounded-lg font-medium text-sm shadow-sm transition flex items-center justify-center gap-2 ${
              isLoading
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading ? (
              <>
                {/* Простой CSS-спиннер загрузки */}
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Проверка в домене...
              </>
            ) : (
              'Войти'
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
