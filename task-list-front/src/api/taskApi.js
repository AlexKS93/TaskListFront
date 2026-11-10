const API_BASE = 'http://localhost:8000'; // Ваш рабочий IP бэкенда

/**
 * Хелпер для сборки заголовков. 
 * Автоматически подмешивает JWT токен авторизации Bearer, если он есть.
 */
const getHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...extraHeaders };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const taskApi = {
    // Получить задачи с фильтрами
    // Измените метод getTasks в вашем taskApi:
  async getTasks({ limit, offset, search, statusFilter, objectFilter, dateFilter, monthFilter }) {
    let url = `${API_BASE}/tasks/?limit=${limit}&offset=${offset}`; 
    
    if (search) url += `&search=${encodeURIComponent(search)}`; 
    if (statusFilter) url += `&statusFilter=${encodeURIComponent(statusFilter)}`; 
    if (objectFilter) url += `&objectFilter=${objectFilter}`; 
    if (dateFilter) url += `&dateFilter=${encodeURIComponent(dateFilter)}`; 
    if (monthFilter) url += `&monthFilter=${encodeURIComponent(monthFilter)}`; // 👈 Передаем месяц
    
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    return res.json();
  },



  // Получить все объекты
  async getObjects() {
    const res = await fetch(`${API_BASE}/objects/`, {
      method: 'GET',
      headers: getHeaders() // Передаем заголовки с токеном
    });
    return res.json();
  },

  // Создать или обновить задачу
  async saveTask(taskData, id = null) {
    const method = id ? 'PUT' : 'POST'; //
    const url = id ? `${API_BASE}/tasks/${id}` : `${API_BASE}/tasks/`; //
    
    const res = await fetch(url, {
      method, //
      headers: getHeaders({ 'Content-Type': 'application/json' }), // Склеиваем Content-Type и наш JWT токен
      body: JSON.stringify({ ...taskData, object_id: parseInt(taskData.object_id) }) //
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Ошибка сохранения задачи'); //
    }
    return res.json();
  },

  // Удалить задачу
  async deleteTask(id) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { 
      method: 'DELETE', //
      headers: getHeaders() // Передаем заголовки с токеном
    });
    if (!res.ok) throw new Error('Ошибка удаления задачи'); //
    return res.json();
  },

  // Создать объект
  async createObject(name) {
    const res = await fetch(`${API_BASE}/objects/`, {
      method: 'POST', //
      headers: getHeaders({ 'Content-Type': 'application/json' }), // Склеиваем заголовки
      body: JSON.stringify({ name }) //
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Объект уже существует');
    }
    return res.json();
  },

  // Удалить объект
  async deleteObject(id) {
    const res = await fetch(`${API_BASE}/objects/${id}`, { 
      method: 'DELETE', //
      headers: getHeaders() // Передаем заголовки с токеном
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Не удалось удалить объект'); //
    }
    return res.json();
  }
};
