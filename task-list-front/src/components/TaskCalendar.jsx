import React, { useState, useEffect } from 'react';

export default function TaskCalendar({ tasks, onStatusChange, onDateChange, currentUser, onMonthChange }) {
  // Состояние текущего отображаемого года и месяца
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Уведомляем родительский компонент об изменении месяца для подгрузки данных
  useEffect(() => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    onMonthChange(monthStr);
  }, [year, month, onMonthChange]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Определяем день недели для первого числа месяца (0 - ВС, 1 - ПН, ... 6 - СБ)
  // Преобразуем к российскому стандарту (0 - ПН, ... 6 - ВС)
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  });

  // Добавляем пустые ячейки для правильного выравнивания сетки календаря
  const paddingDays = Array.from({ length: firstDayIndex }, (_, i) => null);

  const tasksByDate = tasks.reduce((acc, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {});

  const handleDragStart = (e, task) => {
    // 🔒 Защита: перетаскивать может только автор задачи
    if (task.who && task.who !== currentUser) {
      e.preventDefault();
      alert(`Вы не можете перемещать задачу пользователя ${task.who}`);
      return;
    }
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetDate) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (taskId) {
      onDateChange(taskId, targetDate);
    }
  };

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const toToday = () => setCurrentDate(new Date());

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white w-full rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Шапка календаря с навигацией */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            📅 {monthNames[month]} {year}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Управление задачами отдела АСУТП</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-sm transition">◀ Прошлый</button>
          <button onClick={toToday} className="px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium transition">Сегодня</button>
          <button onClick={nextMonth} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-sm transition">Следующий ▶</button>
        </div>
      </div>

      {/* Дни недели */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
        {weekdays.map((d, idx) => (
          <div key={d} className={idx >= 5 ? 'text-red-400/80' : ''}>{d}</div>
        ))}
      </div>

      {/* Основная сетка дней */}
      <div className="grid grid-cols-7 gap-2">
        {/* Рендерим пустые ячейки для сдвига начала месяца */}
        {paddingDays.map((_, idx) => (
          <div key={`pad-${idx}`} className="min-h-[140px] bg-gray-50/30 rounded-xl border border-gray-100/50"></div>
        ))}

        {/* Рендерим реальные дни */}
        {days.map((dateStr) => {
          const dateObj = new Date(dateStr);
          const dayNumber = dateObj.getDate();
          const dayOfWeek = (dateObj.getDay() + 6) % 7; 
          const dayTasks = tasksByDate[dateStr] || [];
          
          const isWeekend = dayOfWeek >= 5; 
          const isToday = dateStr === todayStr;

          return (
            <div
              key={dateStr}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, dateStr)}
              className={`min-h-[140px] border rounded-xl p-2.5 flex flex-col transition group relative ${
                isToday ? 'bg-blue-50/40 border-blue-300 ring-2 ring-blue-500/10' : 
                isWeekend ? 'bg-gray-100/60 border-gray-200/80' : 'bg-gray-50 border-gray-200'
              } hover:bg-gray-100/80`}
            >
              {/* Число */}
              <div className="text-xs font-bold mb-2 pb-1 border-b border-gray-200/50 flex justify-between items-center">
                <span className={isToday ? 'text-blue-600 font-extrabold text-sm' : isWeekend ? 'text-red-400' : 'text-gray-400'}>
                  {dayNumber}
                </span>
                {dayTasks.length > 0 && (
                  <span className="bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                    {dayTasks.length}
                  </span>
                )}
              </div>

              {/* Задачи внутри ячейки дня */}
              <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[120px] scrollbar-none">
                {dayTasks.map((task) => {
                  // Проверяем, имеет ли текущий пользователь право редактировать эту задачу
                  const hasAccess = !task.who || task.who === currentUser;

                  return (
                    <div
                      key={task.id}
                      draggable={hasAccess}
                      onDragStart={(e) => handleDragStart(e, task)}
                      className={`bg-white border rounded-lg p-2 shadow-xs transition ${
                        hasAccess 
                          ? 'cursor-grab active:cursor-grabbing border-gray-200 hover:border-blue-400' 
                          : 'opacity-75 border-gray-100 cursor-not-allowed bg-gray-50/50'
                      }`}
                      title={!hasAccess ? `Редактирование запрещено (Исполнитель: ${task.who})` : task.what_said}
                    >
                      <div className="text-[10px] font-bold text-blue-600 truncate">{task.object_name}</div>
                      <div className="text-xs text-gray-700 font-medium truncate">{task.what_said || '—'}</div>

                      {/* Статус и исполнитель */}
                      <div className="mt-1.5 pt-1 border-t border-gray-50 flex items-center justify-between gap-1">
                        <select
                          disabled={!hasAccess}
                          value={task.status}
                          onChange={(e) => onStatusChange(task, e.target.value)}
                          className={`text-[9px] font-bold rounded px-1 py-0.5 border focus:outline-none ${
                            !hasAccess ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'cursor-pointer'
                          } ${
                            task.status === 'Выполнено' ? 'bg-green-50 text-green-700 border-green-200' :
                            task.status === 'В работе' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          <option value="В работе">В работе</option>
                          <option value="Выполнено">Выполнено</option>
                          <option value="Запланировано">Запланировано</option>
                        </select>
                        <span className="text-[9px] text-gray-400 font-medium truncate max-w-[45px]">
                          {task.who || '—'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
