import React, { useState, useEffect, useCallback } from 'react';
import { taskApi } from './api/taskApi';
import { authApi } from './api/authApi'; // Импортируем сервис авторизации
import FilterBar from './components/FilterBar';
import TaskTable from './components/TaskTable';
import TaskModal from './components/TaskModal';
import ObjectModal from './components/ObjectModal';
import Login from './components/Login'; // Импортируем форму входа
import TaskCalendar from './components/TaskCalendar';

const INITIAL_FORM = {
  date: new Date().toISOString().split('T')[0],
  object_id: '',
  what_said: '',
  what_was: '',
  what_done: '',
  status: 'В работе',
  who: '',
  note: ''
};

export default function App() {
  // --- СОСТОЯНИЯ АВТОРИЗАЦИИ ---
  const [isAuthenticated, setIsAuthenticated] = useState(authApi.isAuthenticated());
  const [currentUser, setCurrentUser] = useState(authApi.getCurrentUser());

  // --- ОСНОВНЫЕ СОСТОЯНИЯ ---
  const [tasks, setTasks] = useState([]);
  const [objects, setObjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);

  // --- СОСТОЯНИЯ ПОИСКА С ДЕБАУНСОМ ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [objectFilter, setObjectFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // --- МОДАЛЬНЫЕ ОКНА ---
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isObjModalOpen, setIsObjModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const [newObjName, setNewObjName] = useState('');
  const [taskForm, setTaskForm] = useState(INITIAL_FORM);

  // Добавляем стейт переключения режимов отображения (таблица или календарь)
  const [viewMode, setViewMode] = useState('table'); 
  const [selectedMonth, setSelectedMonth] = useState('');

  // --- ЭФФЕКТ ДЛЯ ДЕБАУНСА ПОИСКА ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setOffset(0); // При поиске сбрасываем на 1-ю страницу
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // --- ЗАГРУЗКА ДАННЫХ (Вызывается только если пользователь авторизован) ---
  const loadTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await taskApi.getTasks({ 
        limit, 
        offset, 
        search: debouncedSearch, 
        statusFilter, 
        objectFilter, 
        dateFilter,
        monthFilter: viewMode === 'calendar' ? selectedMonth : '' // 👈 Передаем месяц только в режиме календаря
      });
      setTasks(data.results || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Ошибка загрузки задач:', err);
      if (err.message?.includes('401') || err.message?.includes('учетные данные')) {
        handleLogout();
      }
    }
  }, [limit, offset, debouncedSearch, statusFilter, objectFilter, dateFilter, isAuthenticated, viewMode, selectedMonth]);

  const loadObjects = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await taskApi.getObjects();
      setObjects(data || []);
    } catch (err) {
      console.error('Ошибка загрузки объектов:', err);
    }
  }, [isAuthenticated]);


    // Триггерим перезагрузку при изменении месяца или смене режима отображения
  //useEffect(() => { loadTasks(); }, [loadTasks]);
  useEffect(() => { loadTasks(); }, [loadTasks]);
  useEffect(() => { loadObjects(); }, [loadObjects]);
  useEffect(() => { setOffset(0); }, [statusFilter, objectFilter, dateFilter]);

  // --- ОБРАБОТЧИКИ АВТОРИЗАЦИИ ---
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setCurrentUser(authApi.getCurrentUser());
  };

  const handleLogout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    setCurrentUser('');
    // Сбрасываем данные в целях безопасности
    setTasks([]);
    setObjects([]);
  };

  // --- ХЕЛПЕР СБРОСА ФОРМЫ ---
  const resetTaskForm = (availableObjects) => {
    const defaultObjectId = availableObjects && availableObjects.length > 0 
      ? availableObjects[0].id.toString() 
      : '';
    
    setTaskForm({
      ...INITIAL_FORM,
      object_id: defaultObjectId,
      who: authApi.getCurrentUser() // Автоматически подставляем логин в поле "Кто"
    });
  };

  // Обработчик 1: Изменение статуса прямо из календаря
  const handleStatusChange = async (task, newStatus) => {
    try {
      await taskApi.saveTask({ ...task, status: newStatus }, task.id);
      loadTasks(); // Перезагружаем список
    } catch (err) {
      alert('Не удалось обновить статус: ' + err.message);
    }
  };

  // --- ДЕЙСТВИЯ С ЗАДАЧАМИ ---
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      await taskApi.saveTask(taskForm, editingTask?.id);
      setIsTaskModalOpen(false);
      setEditingTask(null);
      resetTaskForm(objects);
      loadTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Удалить эту запись?')) return;
    try {
      await taskApi.deleteTask(id);
      if (tasks.length === 1 && offset > 0) {
        setOffset(prev => Math.max(0, prev - limit));
      } else {
        loadTasks();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setTaskForm({
      date: task.date,
      object_id: task.object_id.toString(),
      what_said: task.what_said || '',
      what_was: task.what_was || '',
      what_done: task.what_done || '',
      status: task.status,
      who: task.who || '',
      note: task.note || ''
    });
    setIsTaskModalOpen(true);
  };

 // Обработчик 2: Изменение даты при перетаскивании (Drag and Drop)
  const handleDateChange = async (taskId, newDate) => {
    // Находим перетаскиваемую задачу в текущем массиве стейта, чтобы взять её старые данные
    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) return;

    try {
      await taskApi.saveTask({ ...currentTask, date: newDate }, taskId);
      loadTasks(); // Перезагружаем список, сетка перестроится автоматически
    } catch (err) {
      alert('Не удалось перенести задачу: ' + err.message);
    }
  };

  const handlePlusClick = () => {
    setEditingTask(null);
    resetTaskForm(objects);
    setIsTaskModalOpen(true);
  };

  // --- ДЕЙСТВИЯ С ОБЪЕКТАМИ ---
  const handleCreateObject = async (e) => {
    e.preventDefault();
    if (!newObjName.trim()) return;
    try {
      await taskApi.createObject(newObjName.trim());
      setNewObjName('');
      loadObjects();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteObject = async (id) => {
    if (!window.confirm('При удалении объекта связанные задачи могут отображаться некорректно. Продолжить?')) return;
    try {
      await taskApi.deleteObject(id);
      loadObjects();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- 🛑 ЭКРАН 1: Если НЕ авторизован — показываем только форму входа ---
  if (!isAuthenticated) {
    return <Login onAuthSuccess={handleAuthSuccess} />;
  }

  // --- 🟢 ЭКРАН 2: Если авторизован — показываем основное приложение ---
  return (
    <div className="min-h-screen w-full bg-gray-100 p-6 font-sans text-gray-800 overflow-x-hidden">
      
      {/* Шапка приложения */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Журнал отдела АСУТП</h1>
          {/* Показываем под чьей учеткой зашли в сеть */}
          <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
            {/*<span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>*/}
            <span>👷 <strong>{currentUser}</strong></span>
          </div>
        </div>
        
        {/* Кнопки управления и Логаут */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-end">
          <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              📋 Таблица
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${viewMode === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              📅 Календарь
          </button>
          <button 
            type="button"
            onClick={handlePlusClick} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition text-sm"
          >
            <span>➕</span> Добавить запись
          </button>
          
          <button 
            type="button"
            onClick={() => setIsObjModalOpen(true)} 
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition text-sm"
          >
            <span>⚙️</span> Объекты
          </button>

          <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>

          {/* Кнопка Выйти */}
          <button 
            type="button"
            onClick={handleLogout} 
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg font-medium transition text-sm border border-red-100"
          >
            <span>🚪</span> Выйти
          </button>
        </div>
      </div>

      {/* Панель фильтрации с дебаунс-стейтом */}
      <FilterBar 
        search={searchTerm} 
        setSearch={setSearchTerm} 
        objectFilter={objectFilter} 
        setObjectFilter={setObjectFilter} 
        statusFilter={statusFilter} 
        setStatusFilter={setStatusFilter} 
        objects={objects} 
        setDateFilter={setDateFilter}
        dateFilter={dateFilter}
      />
      
      {/* Динамическое отображение контента на основе выбранного режима */}
      {viewMode === 'table' ? (
        <TaskTable 
          tasks={tasks} total={total} limit={limit} offset={offset} setOffset={setOffset} 
          onEdit={handleEditClick} onDelete={handleDeleteTask} 
        />
      ) : (
        <TaskCalendar 
          tasks={tasks} 
          onStatusChange={handleStatusChange} 
          onDateChange={handleDateChange}
          currentUser={currentUser} // 👈 Передаем текущего юзера для контроля прав
          onMonthChange={setSelectedMonth} // 👈 Хендлер изменения месяца в календаре
        />
      )}

      {/* Модальные окна */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }} 
        onSubmit={handleTaskSubmit} 
        taskForm={taskForm} 
        setTaskForm={setTaskForm} 
        objects={objects} 
        isEditing={!!editingTask} 
      />

      <ObjectModal 
        isOpen={isObjModalOpen} 
        onClose={() => setIsObjModalOpen(false)} 
        objects={objects} 
        newObjName={newObjName} 
        setNewObjName={setNewObjName} 
        onCreate={handleCreateObject} 
        onDelete={handleDeleteObject} 
      />
    </div>
  );
}
