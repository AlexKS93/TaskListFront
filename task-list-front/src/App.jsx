import React, { useState, useEffect, useCallback } from 'react';
import { taskApi } from './api/taskApi';
import { authApi } from './api/authApi'; 
import FilterBar from './components/FilterBar';
import TaskTable from './components/TaskTable';
import TaskModal from './components/TaskModal';
import ObjectModal from './components/ObjectModal';
import Login from './components/Login'; 
import TaskCalendar from './components/TaskCalendar';
import TaskStats from './components/TaskStats'; 
import * as XLSX from 'xlsx';

const INITIAL_FORM = {
  date: new Date().toISOString().split('T')[0],
  object_id: '', what_said: '', what_was: '', what_done: '',
  status: 'В работе', who: '', note: ''
};

export default function App() {
  const [usersList, setUsersList] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(authApi.isAuthenticated());
  const [sysUser, setSysUser] = useState(authApi.getSysUser());
  const [currentUser, setCurrentUser] = useState(authApi.getCurrentUser());

  const [tasks, setTasks] = useState([]);
  const [objects, setObjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [objectFilter, setObjectFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isObjModalOpen, setIsObjModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newObjName, setNewObjName] = useState('');
  const [taskForm, setTaskForm] = useState(INITIAL_FORM);

  const [viewMode, setViewMode] = useState('table'); 
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isBoss, setIsBoss] = useState(authApi.getIsBoss());

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setOffset(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await taskApi.getTasks({ 
        limit, offset, search: debouncedSearch, statusFilter, 
        objectFilter, dateFilter,
        monthFilter: viewMode === 'calendar' ? selectedMonth : '' 
      });
      setTasks(data.results || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Ошибка загрузки задач:', err);
      if (err.message?.includes('401') || err.message?.includes('учетные данные')) handleLogout();
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

  const loadUsers = useCallback(async () => {
      if (!isAuthenticated) return;
      try {
        const data = await taskApi.getUsers();
        setUsersList(data || []);
      } catch (err) {
        console.error('Ошибка загрузки сотрудников:', err);
      }
    }, [isAuthenticated]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  useEffect(() => { loadTasks(); }, [loadTasks]);
  useEffect(() => { loadObjects(); }, [loadObjects]);
  useEffect(() => { setOffset(0); }, [statusFilter, objectFilter, dateFilter]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const intervalId = setInterval(() => { loadTasks(); }, 60000); 
    return () => clearInterval(intervalId);
  }, [loadTasks, isAuthenticated]);
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setCurrentUser(authApi.getCurrentUser());
    setSysUser(authApi.getSysUser());
    setIsBoss(authApi.getIsBoss());
  };

  const handleLogout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    setCurrentUser('');
    setSysUser('');
    setTasks([]);
    setObjects([]);
    setIsBoss(false);
    setUsersList([]);
  };

  const resetTaskForm = (availableObjects) => {
    const defaultObjectId = availableObjects && availableObjects.length > 0 ? availableObjects[0].id.toString() : '';
    setTaskForm({ ...INITIAL_FORM, object_id: defaultObjectId, who: authApi.getCurrentUser() });
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await taskApi.saveTask({ ...task, status: newStatus }, task.id);
      loadTasks();
    } catch (err) {
      alert('Не удалось обновить статус: ' + err.message);
    }
  };

  const handleDateChange = async (taskId, newDate) => {
    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) return;
    try {
      await taskApi.saveTask({ ...currentTask, date: newDate }, taskId);
      loadTasks();
    } catch (err) {
      alert('Не удалось перенести задачу: ' + err.message);
    }
  };

  const handleMonthChange = useCallback((monthStr) => {
    setSelectedMonth(monthStr);
    setOffset(0);
  }, []);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      await taskApi.saveTask(taskForm, editingTask?.id);
      setIsTaskModalOpen(false);
      setEditingTask(null);
      resetTaskForm(objects);
      loadTasks();
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Удалить эту запись?')) return;
    try {
      await taskApi.deleteTask(id);
      if (tasks.length === 1 && offset > 0) setOffset(prev => Math.max(0, prev - limit));
      else loadTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setTaskForm({
      date: task.date, object_id: task.object_id.toString(),
      what_said: task.what_said || '', what_was: task.what_was || '',
      what_done: task.what_done || '', status: task.status,
      who: task.who || '', note: task.note || ''
    });
    setIsTaskModalOpen(true);
  };

  const handlePlusClick = () => {
    setEditingTask(null);
    resetTaskForm(objects);
    setIsTaskModalOpen(true);
  };

  const handleCalendarAddClick = (dateString) => {
    setEditingTask(null);
    setTaskForm({ ...INITIAL_FORM, date: dateString, who: authApi.getCurrentUser() });
    setIsTaskModalOpen(true);
  };

  const handleCreateObject = async (e) => {
    e.preventDefault();
    if (!newObjName.trim()) return;
    try {
      await taskApi.createObject(newObjName.trim());
      setNewObjName('');
      loadObjects();
    } catch (err) { alert(err.message); }
  };

  const handleDeleteObject = async (id) => {
    if (!window.confirm('При удалении объекта связанные задачи могут отображаться некорректно. Продолжить?')) return;
    try {
      await taskApi.deleteObject(id);
      loadObjects();
    } catch (err) { alert(err.message); }
  };

   const handleCopyTask = async (taskId, newDate) => {
    const sourceTask = tasks.find(t => t.id === taskId);
    if (!sourceTask) return;

    try {
      // Создаем копию без id, чтобы бэкенд создал новую запись
      const { id, object_name, ...taskData } = sourceTask;
      await taskApi.saveTask({ 
        ...taskData, 
        date: newDate,
        status: 'Запланировано' // Для копии логично ставить статус "Запланировано"
      });
      loadTasks();
    } catch (err) {
      alert('Не удалось скопировать задачу: ' + err.message);
    }
  };

  const handleExportExcel = async () => {
    try {
      // Запрашиваем все задачи с учетом текущих фильтров
      const allFilteredTasks = await taskApi.exportTasks({
        search: debouncedSearch,
        statusFilter,
        objectFilter,
        dateFilter,
        monthFilter: viewMode === 'calendar' ? selectedMonth : ''
      });

      if (allFilteredTasks.length === 0) {
        alert('Нет данных для выгрузки по выбранным фильтрам.');
        return;
      }

      // Формируем строки для таблицы Excel (названия колонок совпадают с нашим скриптом импорта)
      const excelRows = allFilteredTasks.map(task => ({
        'Дата': new Date(task.date).toLocaleDateString('ru-RU'),
        'Объект': task.object_name || '',
        'Что сказали': task.what_said || '',
        'Что было': task.what_was || '',
        'Что сделано': task.what_done || '',
        'Статус': task.status || '',
        'Исполнитель': task.who || '',
        'Примечание': task.note || ''
      }));

      // Создаем лист и книгу Excel
      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      
      // Настраиваем комфортную ширину столбцов
      worksheet['!cols'] = [
        { wch: 12 }, // Дата
        { wch: 25 }, // Объект
        { wch: 35 }, // Что сказали
        { wch: 30 }, // Что было
        { wch: 35 }, // Что сделано
        { wch: 15 }, // Статус
        { wch: 25 }, // Исполнитель
        { wch: 25 }  // Примечание
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Журнал АСУТП');

      // Генерируем имя файла с текущей датой
      const today = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `Журнал_АСУТП_${today}.xlsx`);
    } catch (err) {
      alert('Ошибка выгрузки в Excel: ' + err.message);
    }
  };

  if (!isAuthenticated) return <Login onAuthSuccess={handleAuthSuccess} />;

  return (
    <div className="min-h-screen w-full bg-gray-100 p-6 font-sans text-gray-800 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Журнал отдела АСУТП</h1>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
            <span>👷 <strong>{currentUser}</strong></span>
          </div>
        </div>
        
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-end">
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 mr-2">
            <button type="button" onClick={() => setViewMode('table')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>📋 Таблица</button>
            <button type="button" onClick={() => { setViewMode('calendar'); setDateFilter(''); setOffset(0); }} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${viewMode === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>📅 Календарь</button>
            <button type="button" onClick={() => setViewMode('stats')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${viewMode === 'stats' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>📊 Статистика</button>
          </div>

          {viewMode !== 'stats' && (
            <>
              <button 
                type="button" 
                onClick={handlePlusClick} 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition text-sm"
              >
                <span>➕</span> Добавить запись
              </button>
              <button 
                type="button" 
                onClick={handleExportExcel} 
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition text-sm"
                title="Выгрузить текущий список задач в Excel"
              >
                <span>📥</span> В Excel
              </button>
            </>
          )}
          <button type="button" onClick={() => setIsObjModalOpen(true)} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition text-sm"><span>⚙️</span> Объекты</button>
          <button type="button" onClick={handleLogout} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg font-medium transition text-sm border border-red-100"><span>🚪</span> Выйти</button>
        </div>
      </div>

      {viewMode !== 'stats' && (
        <FilterBar search={searchTerm} setSearch={setSearchTerm} objectFilter={objectFilter} setObjectFilter={setObjectFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} objects={objects} setDateFilter={setDateFilter} dateFilter={dateFilter} />
      )}
      
      {viewMode === 'table' && <TaskTable tasks={tasks} 
          total={total} 
          limit={limit} 
          offset={offset} 
          setOffset={setOffset} 
          onEdit={handleEditClick} 
          onDelete={handleDeleteTask}
          currentUser={currentUser}
          sysUser={sysUser}
          isBoss={isBoss} />}
      {viewMode === 'calendar' && <TaskCalendar tasks={tasks} currentUser={currentUser} sysUser={sysUser} isBoss={isBoss}
                                    onStatusChange={handleStatusChange} onDateChange={handleDateChange} 
                                    onMonthChange={handleMonthChange} onAddClick={handleCalendarAddClick}
                                    onEditClick={handleEditClick} onDeleteClick={handleDeleteTask} 
                                    onCopyTask={handleCopyTask}
                                    />
      }
      {viewMode === 'stats' && <TaskStats />}

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }} 
        onSubmit={handleTaskSubmit} 
        taskForm={taskForm} 
        setTaskForm={setTaskForm} 
        objects={objects} 
        usersList={usersList}
        isEditing={!!editingTask}
        isBoss={isBoss} />
      <ObjectModal isOpen={isObjModalOpen} onClose={() => setIsObjModalOpen(false)} objects={objects} newObjName={newObjName} setNewObjName={setNewObjName} onCreate={handleCreateObject} onDelete={handleDeleteObject} />
    </div>
  );
}
