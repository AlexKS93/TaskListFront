import React from 'react';

export default function TaskTable({ tasks, total, limit, offset, setOffset, onEdit, onDelete }) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="bg-white w-full rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="p-4 w-16">№</th>
              <th className="p-4 w-28">Дата</th>
              <th className="p-4">Объект</th>
              <th className="p-4">Что сказали</th>
              
              <th className="p-4">Что сделал</th>
              <th className="p-4">Статус</th>
              <th className="p-4">Кто</th>
              <th className="p-4">Примечание</th>
              <th className="p-4 text-right w-24">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {!tasks || tasks.length === 0 ? (
              <tr>
                <td colSpan="10" className="p-8 text-center text-gray-400">Записи не найдены</td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50/70 transition">
                  <td className="p-4 font-medium text-gray-400">#{task.id}</td>
                  <td className="p-4 whitespace-nowrap">{task.date}</td>
                  <td className="p-4 font-medium text-blue-600">{task.object_name}</td>
                  <td className="p-4 max-w-xs truncate" title={task.what_said}>{task.what_said || '—'}</td>
                  
                  <td className="p-4 max-w-xs truncate" title={task.what_done}>{task.what_done || '—'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'Выполнено' ? 'bg-green-50 text-green-700 border border-green-200' :
                      task.status === 'В работе' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">{task.who || '—'}</td>
                  <td className="p-4 max-w-xs truncate text-gray-500" title={task.note}>{task.note || '—'}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onEdit(task)} className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100 transition" title="Редактировать">
                        ✏️
                      </button>
                      <button onClick={() => onDelete(task.id)} className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 transition" title="Удалить">
                        ❌
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <span className="text-xs text-gray-500">Показано {tasks.length} из {total} записей</span>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setOffset(offset - limit)}
              className="px-2 py-1 text-sm rounded border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
            >
              ◀
            </button>
            <span className="text-sm font-medium">Страница {currentPage} из {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setOffset(offset + limit)}
              className="px-2 py-1 text-sm rounded border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
