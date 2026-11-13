import React from 'react';

export default function TaskTable({ 
  tasks, total, limit, offset, setOffset, 
  onEdit, onDelete, currentUser, sysUser, isBoss 
}) {
  // Функция проверки прав доступа (идентична логике в календаре)
  const checkAccess = (task) => {
    if (isBoss) return true;
    if (!task.who) return true;

    const taskOwner = task.who.trim().toLowerCase();
    const login = (sysUser || '').trim().toLowerCase();
    const fullName = (currentUser || '').trim().toLowerCase();

    return taskOwner === login || taskOwner === fullName;
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="p-4">Дата</th>
              <th className="p-4">Объект</th>
              <th className="p-4">Что сказали</th>
              <th className="p-4">Что было</th>
              <th className="p-4">Что сделано</th>
              <th className="p-4">Статус</th>
              <th className="p-4">Исполнитель</th>
              <th className="p-4">Примечание</th>
              <th className="p-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-8 text-center text-gray-400">
                  Записей не найдено
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const hasAccess = checkAccess(task);

                return (
                  <tr key={task.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-4 whitespace-nowrap font-medium text-gray-900">
                      {new Date(task.date).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="p-4 font-semibold text-blue-600">{task.object_name}</td>
                    <td className="p-4 text-gray-700 max-w-xs break-words">{task.what_said || '—'}</td>
                    <td className="p-4 text-gray-600 max-w-xs break-words">{task.what_was || '—'}</td>
                    <td className="p-4 text-gray-600 max-w-xs break-words">{task.what_done || '—'}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          task.status === 'Выполнено'
                            ? 'bg-green-100 text-green-700'
                            : task.status === 'В работе'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-gray-700 font-medium">
                      {task.who || '—'}
                    </td>
                    <td className="p-4 text-gray-500 text-xs max-w-xs break-words">
                      {task.note || '—'}
                    </td>
                    <td className="p-4 whitespace-nowrap text-right space-x-2">
                      <button
                        type="button"
                        disabled={!hasAccess}
                        onClick={() => onEdit(task)}
                        title={hasAccess ? 'Редактировать' : 'Изменять задачу может только исполнитель или начальник'}
                        className={`p-1.5 rounded-lg transition ${
                          hasAccess
                            ? 'text-blue-600 hover:bg-blue-50 cursor-pointer'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        disabled={!hasAccess}
                        onClick={() => onDelete(task.id)}
                        title={hasAccess ? 'Удалить' : 'Удалять задачу может только исполнитель или начальник'}
                        className={`p-1.5 rounded-lg transition ${
                          hasAccess
                            ? 'text-red-500 hover:bg-red-50 cursor-pointer'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {total > limit && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
          <span>
            Показано {offset + 1}–{Math.min(offset + limit, total)} из {total}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              ◀ Назад
            </button>
            <span className="px-3 py-1.5 font-semibold">
              Стр. {currentPage} из {totalPages}
            </span>
            <button
              type="button"
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              Вперед ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
