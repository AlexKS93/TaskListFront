import React, { useState, useEffect } from 'react';

export default function TaskCalendar({ 
  tasks, onStatusChange, onDateChange, currentUser, sysUser, isBoss,
  onMonthChange, onAddClick, onEditClick, onDeleteClick, onCopyTask
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);
  const [dropConfirm, setDropConfirm] = useState(null); // { task, targetDate }
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const checkAccess = (task) => {
    if (isBoss) return true;
    if (!task.who) return true;
    
    const taskOwner = task.who.trim().toLowerCase();
    const login = (sysUser || '').trim().toLowerCase();
    const fullName = (currentUser || '').trim().toLowerCase();
    
    // Разрешаем доступ, если автор совпадает с логином ИЛИ с полным ФИО
    return taskOwner === login || taskOwner === fullName;
  };
  useEffect(() => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    onMonthChange(monthStr);
  }, [year, month, onMonthChange]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  });

  const paddingDays = Array.from({ length: firstDayIndex }, (_, i) => null);

  const tasksByDate = tasks.reduce((acc, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {});

  const handleDragStart = (e, task) => {
    // Разрешаем начать перетаскивание всем (для копирования), но запоминаем задачу
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDrop = (e, targetDate) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    const draggedTask = tasks.find(t => t.id === taskId);
    
    // Если задачу бросили на тот же самый день — ничего не делаем
    if (!draggedTask || draggedTask.date === targetDate) return;

    // Открываем окно выбора действия
    setDropConfirm({ task: draggedTask, targetDate });
  };

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white w-full rounded-xl shadow-sm border border-gray-100 p-6 relative">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">📅 {monthNames[month]} {year}</h2>
          <p className="text-xs text-gray-500 mt-0.5">Кликните на день для управления. </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-sm transition">◀</button>
          <button type="button" onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium transition">Сегодня</button>
          <button type="button" onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-sm transition">▶</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-gray-400 uppercase">
        {weekdays.map((d, idx) => <div key={d} className={idx >= 5 ? 'text-red-400/80' : ''}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {paddingDays.map((_, idx) => <div key={`pad-${idx}`} className="min-h-[140px] bg-gray-50/30 rounded-xl border border-gray-100/50"></div>)}
        {days.map((dateStr) => {
          const dateObj = new Date(dateStr);
          const dayTasks = tasksByDate[dateStr] || [];
          const isWeekend = ((dateObj.getDay() + 6) % 7) >= 5;
          return (
            <div
              key={dateStr}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, dateStr)}
              onClick={() => setSelectedDayDetails(dateStr)}
              className={`min-h-[140px] border rounded-xl p-2.5 flex flex-col transition cursor-pointer select-none ${dateStr === todayStr ? 'bg-blue-50/40 border-blue-300 ring-2 ring-blue-500/10' : isWeekend ? 'bg-gray-100/60 border-gray-200/80' : 'bg-gray-50 border-gray-200'} hover:bg-gray-100/80`}
            >
              <div className="text-xs font-bold mb-2 pb-1 border-b border-gray-200/50 flex justify-between items-center">
                <span className={dateStr === todayStr ? 'text-blue-600 font-extrabold text-sm' : isWeekend ? 'text-red-400' : 'text-gray-400'}>{dateObj.getDate()}</span>
                {dayTasks.length > 0 && <span className="bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-semibold">{dayTasks.length}</span>}
              </div>
              <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[120px] scrollbar-none">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable={true}
                    onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, task); }}
                    onClick={(e) => e.stopPropagation()}
                    className={`bg-white border rounded-lg p-2 shadow-xs text-left text-ellipsis overflow-hidden ${checkAccess(task) ? 'cursor-grab border-gray-200 hover:border-blue-400' : 'opacity-75 cursor-not-allowed bg-gray-50/50'}`}
                  >
                    <div className="text-[10px] font-bold text-blue-600 truncate">{task.object_name}</div>
                    <div className="text-xs text-gray-700 font-medium truncate">{task.what_said || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* ==================== Модальное окно просмотра дня ==================== */}
      {selectedDayDetails && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" onClick={() => setSelectedDayDetails(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-gray-900">Задачи на {new Date(selectedDayDetails).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                <p className="text-xs text-gray-500">Всего записей: {(tasksByDate[selectedDayDetails] || []).length}</p>
              </div>
              <button type="button" onClick={() => { onAddClick(selectedDayDetails); setSelectedDayDetails(null); }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition">➕ Создать задачу</button>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto space-y-3">
              {!tasksByDate[selectedDayDetails] || tasksByDate[selectedDayDetails].length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-8">Задач на этот день не запланировано</div>
              ) : (
                tasksByDate[selectedDayDetails].map(task => {
                  const hasAccess = checkAccess(task);
                  return (
                    <div key={task.id} className={`p-3 border rounded-xl bg-gray-50/50 flex flex-col gap-2 relative ${!hasAccess ? 'border-dashed border-gray-200' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[11px] font-bold text-blue-600 block">{task.object_name}</span>
                          <p className="text-sm font-medium text-gray-800 mt-0.5">{task.what_said || '—'}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" disabled={!hasAccess} onClick={() => { onEditClick(task); setSelectedDayDetails(null); }} className={`p-1 rounded text-sm ${hasAccess ? 'hover:bg-gray-200 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`} title="Редактировать">✏️</button>
                          <button type="button" disabled={!hasAccess} onClick={() => { onDeleteClick(task.id); setSelectedDayDetails(null); }} className={`p-1 rounded text-sm ${hasAccess ? 'hover:bg-red-50 text-red-500' : 'text-gray-300 cursor-not-allowed'}`} title="Удалить">❌</button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                        <select
                          disabled={!hasAccess}
                          value={task.status}
                          onChange={(e) => onStatusChange(task, e.target.value)}
                          className={`text-xs font-bold rounded px-2 py-1 border focus:outline-none ${!hasAccess ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'cursor-pointer bg-white'} ${task.status === 'Выполнено' ? 'bg-green-50 text-green-700 border-green-200' : task.status === 'В работе' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'text-gray-700 border-gray-200'}`}
                        >
                          <option value="В работе">В работе</option>
                          <option value="Выполнено">Выполнено</option>
                          <option value="Запланировано">Запланировано</option>
                        </select>
                        <span className="text-gray-400 font-medium">Исполнитель: <strong className="text-gray-600">{task.who || '—'}</strong></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button type="button" onClick={() => setSelectedDayDetails(null)} className="px-4 py-1.5 text-xs bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition shadow-xs">Закрыть</button>
            </div>
          </div>
        </div>
      )}
      {/* ==================== Модальное окно выбора: Перенести или Скопировать ==================== */}
      {dropConfirm && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          onClick={() => setDropConfirm(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-base font-bold text-gray-900">Действие с задачей</h3>
              <p className="text-xs text-gray-500 mt-1">
                Вы перетащили задачу «<span className="font-semibold text-gray-700">{dropConfirm.task.what_said || dropConfirm.task.object_name}</span>» на{' '}
                <span className="font-bold text-blue-600">
                  {new Date(dropConfirm.targetDate).toLocaleDateString('ru-RU')}
                </span>.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {/* Кнопка Перенести (доступна только если есть права на редактирование этой задачи) */}
              <button
                type="button"
                disabled={!checkAccess(dropConfirm.task)}
                onClick={() => {
                  onDateChange(dropConfirm.task.id, dropConfirm.targetDate);
                  setDropConfirm(null);
                }}
                title={!checkAccess(dropConfirm.task) ? 'Переносить чужую задачу может только начальник' : ''}
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition ${
                  checkAccess(dropConfirm.task)
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>➡️</span> Перенести на эту дату
              </button>

              {/* Кнопка Скопировать (доступна всем) */}
              <button
                type="button"
                onClick={() => {
                  onCopyTask(dropConfirm.task.id, dropConfirm.targetDate);
                  setDropConfirm(null);
                }}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>📋</span> Создать копию на эту дату
              </button>

              {/* Кнопка Отмена */}
              <button
                type="button"
                onClick={() => setDropConfirm(null)}
                className="w-full py-2 px-4 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition mt-1"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
}
