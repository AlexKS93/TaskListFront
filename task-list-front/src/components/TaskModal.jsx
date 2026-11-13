import React, { useState, useEffect, useRef } from 'react';

export default function TaskModal({ 
  isOpen, onClose, onSubmit, taskForm, setTaskForm, objects, usersList = [], isEditing, isBoss 
}) {
  const [objectSearch, setObjectSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Синхронизируем текст в поле поиска с выбранным объектом при открытии окна
  useEffect(() => {
    if (isOpen) {
      const selectedObj = objects.find(o => o.id.toString() === taskForm.object_id?.toString());
      setObjectSearch(selectedObj ? selectedObj.name : '');
      setIsDropdownOpen(false);
    }
  }, [isOpen, taskForm.object_id, objects]);

  // Закрываем выпадающий список при клике вне его области
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
        // Возвращаем название реально выбранного объекта, если пользователь стер текст и ушел
        const selectedObj = objects.find(o => o.id.toString() === taskForm.object_id?.toString());
        setObjectSearch(selectedObj ? selectedObj.name : '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [taskForm.object_id, objects]);

  if (!isOpen) return null;

  // Фильтруем объекты по введенному тексту
  const filteredObjects = objects.filter(obj =>
    obj.name.toLowerCase().includes(objectSearch.toLowerCase())
  );

  const handleSelectObject = (obj) => {
    setTaskForm({ ...taskForm, object_id: obj.id.toString() });
    setObjectSearch(obj.name);
    setIsDropdownOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? '✏️ Редактировать запись' : '➕ Новая запись в журнал'}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>

        <form onSubmit={onSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Поле Дата */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Дата *</label>
              <input
                type="date"
                required
                value={taskForm.date}
                onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Поле Объект с живым поиском */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Объект (Установка) *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Начните вводить название..."
                  value={objectSearch}
                  onFocus={() => {
                    setIsDropdownOpen(true);
                    setObjectSearch(''); // Очищаем поле при клике для удобного поиска
                  }}
                  onChange={(e) => {
                    setObjectSearch(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  className="w-full border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="absolute right-2.5 top-2.5 text-gray-400 text-xs pointer-events-none">▼</span>
              </div>

              {/* Выпадающий список результатов */}
              {isDropdownOpen && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredObjects.length === 0 ? (
                    <li className="px-3 py-2 text-xs text-gray-400 text-center">Объекты не найдены</li>
                  ) : (
                    filteredObjects.map((obj) => (
                      <li
                        key={obj.id}
                        onClick={() => handleSelectObject(obj)}
                        className={`px-3 py-2 text-sm cursor-pointer transition ${
                          obj.id.toString() === taskForm.object_id?.toString()
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {obj.name}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>
                    <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Что сказали (Заявка / Проблема)</label>
            <textarea
              rows="2"
              value={taskForm.what_said}
              onChange={(e) => setTaskForm({ ...taskForm, what_said: e.target.value })}
              placeholder="Описание проблемы от технологов или оператора..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Что было (Причина)</label>
              <textarea
                rows="2"
                value={taskForm.what_was}
                onChange={(e) => setTaskForm({ ...taskForm, what_was: e.target.value })}
                placeholder="Выявленная неисправность..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Что сделано (Решение)</label>
              <textarea
                rows="2"
                value={taskForm.what_done}
                onChange={(e) => setTaskForm({ ...taskForm, what_done: e.target.value })}
                placeholder="Выполненные работы..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Статус</label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="В работе">В работе</option>
                <option value="Выполнено">Выполнено</option>
                <option value="Запланировано">Запланировано</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Исполнитель {!isBoss && <span className="text-gray-400 font-normal normal-case">(только для чтения)</span>}
              </label>
              <input
                type="text"
                list="executors-list"
                disabled={!isBoss}
                value={taskForm.who}
                onChange={(e) => setTaskForm({ ...taskForm, who: e.target.value })}
                placeholder={isBoss ? "Выберите или введите ФИО..." : "ФИО или логин"}
                title={!isBoss ? 'Изменять исполнителя может только начальник' : ''}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${
                  !isBoss
                    ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500'
                }`}
              />
              {/* Выпадающий список подсказок для начальника */}
              {isBoss && (
                <datalist id="executors-list">
                  {usersList.map((user, idx) => (
                    <option key={idx} value={user} />
                  ))}
                </datalist>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Примечание</label>
            <input
              type="text"
              value={taskForm.note}
              onChange={(e) => setTaskForm({ ...taskForm, note: e.target.value })}
              placeholder="Дополнительная информация..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition">
              Отмена
            </button>
            <button type="submit" disabled={!taskForm.object_id} className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium shadow-xs transition">
              {isEditing ? 'Сохранить изменения' : 'Добавить задачу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
