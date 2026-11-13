// Берем адрес из .env фронтенда или используем localhost по умолчанию
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...extraHeaders };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Единая обертка с автоматическим разлогином при 401
async function authFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('sys_username');
    window.location.reload(); 
    throw new Error('Сессия истекла. Выполняется выход...');
  }

  return response;
}

export const taskApi = {
  async getTasks({ limit, offset, search, statusFilter, objectFilter, dateFilter, monthFilter }) {
    let url = `${API_BASE}/tasks/?limit=${limit}&offset=${offset}`; 
    
    if (search) url += `&search=${encodeURIComponent(search)}`; 
    if (statusFilter) url += `&statusFilter=${encodeURIComponent(statusFilter)}`; 
    if (objectFilter) url += `&objectFilter=${objectFilter}`; 
    if (dateFilter) url += `&dateFilter=${encodeURIComponent(dateFilter)}`; 
    if (monthFilter) url += `&monthFilter=${encodeURIComponent(monthFilter)}`;
    
    const res = await authFetch(url, { method: 'GET' });
    if (!res.ok) throw new Error('Ошибка загрузки задач');
    return res.json();
  },

  async getObjects() {
    const res = await authFetch(`${API_BASE}/objects/`, { method: 'GET' });
    if (!res.ok) throw new Error('Ошибка загрузки объектов');
    return res.json();
  },

  async saveTask(taskData, id = null) {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/tasks/${id}` : `${API_BASE}/tasks/`;
    
    const res = await authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...taskData, object_id: parseInt(taskData.object_id) })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка сохранения задачи');
    }
    return res.json();
  },

  async deleteTask(id) {
    const res = await authFetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка удаления задачи');
    }
    return res.json();
  },

  async createObject(name) {
    const res = await authFetch(`${API_BASE}/objects/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Объект уже существует');
    }
    return res.json();
  },

  async deleteObject(id) {
    const res = await authFetch(`${API_BASE}/objects/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Не удалось удалить объект');
    }
    return res.json();
  },

  async getAnalytics(period = 'month') {
    const res = await authFetch(`${API_BASE}/tasks/analytics/?period=${period}`, { method: 'GET' });
    if (!res.ok) throw new Error('Ошибка при загрузке аналитики');
    return res.json();
  },

  async getUsers() {
    const res = await authFetch(`${API_BASE}/users/list/`, { method: 'GET' });
    if (!res.ok) throw new Error('Ошибка загрузки списка сотрудников');
    return res.json();
  },

  async exportTasks({ search, statusFilter, objectFilter, dateFilter, monthFilter }) {
    let url = `${API_BASE}/tasks/?limit=10000&offset=0`; 
    
    if (search) url += `&search=${encodeURIComponent(search)}`; 
    if (statusFilter) url += `&statusFilter=${encodeURIComponent(statusFilter)}`; 
    if (objectFilter) url += `&objectFilter=${objectFilter}`; 
    if (dateFilter) url += `&dateFilter=${encodeURIComponent(dateFilter)}`; 
    if (monthFilter) url += `&monthFilter=${encodeURIComponent(monthFilter)}`;
    
    const res = await authFetch(url, { method: 'GET' });
    if (!res.ok) throw new Error('Ошибка получения данных для экспорта');
    const data = await res.json();
    return data.results || [];
  },

};
