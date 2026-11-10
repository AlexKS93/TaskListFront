import React from 'react';

export default function TaskModal({ isOpen, onClose, onSubmit, taskForm, setTaskForm, objects, isEditing }) {
  // Если окно закрыто, ничего не рендерим
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 w-full bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        
        {/* Шапка модального окна записи */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? '📝 Редактирование записи в журнале' : '➕ Добавление новой записи в журнал'}
          </h2>
        </div>
        
        {/* Форма добавления/редактирования */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Дата</label>
              <input 
                type="date" 
                required 
                value={taskForm.date} 
                onChange={e => setTaskForm({...taskForm, date: e.target.value})} 
                className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Объект</label>
              <select 
                required 
                value={taskForm.object_id} 
                onChange={e => setTaskForm({...taskForm, object_id: e.target.value})} 
                className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Выберите объект из списка...</option>
                {objects && objects.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Что сказали</label>
              <textarea 
                rows="2" 
                value={taskForm.what_said} 
                onChange={e => setTaskForm({...taskForm, what_said: e.target.value})} 
                className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Что было</label>
              <textarea 
                rows="2" 
                value={taskForm.what_was} 
                onChange={e => setTaskForm({...taskForm, what_was: e.target.value})} 
                className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Что сделал</label>
            <textarea 
              rows="2" 
              value={taskForm.what_done} 
              onChange={e => setTaskForm({...taskForm, what_done: e.target.value})} 
              className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Статус выполнения</label>
              <select 
                value={taskForm.status} 
                onChange={e => setTaskForm({...taskForm, status: e.target.value})} 
                className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="В работе">В работе</option>
                <option value="Выполнено">Выполнено</option>
                <option value="Запланировано">Запланировано</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Кто (Исполнитель)</label>
              <input 
                type="text" 
                value={taskForm.who} 
                onChange={e => setTaskForm({...taskForm, who: e.target.value})} 
                className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Примечание</label>
            <input 
              type="text" 
              value={taskForm.note} 
              onChange={e => setTaskForm({...taskForm, note: e.target.value})} 
              className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Подвал с кнопками */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition"
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-sm transition"
            >
              Сохранить запись
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
