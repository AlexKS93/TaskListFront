import React, { useState, useEffect } from 'react';
import { taskApi } from '../api/taskApi';

export default function TaskStats() {
  const [period, setPeriod] = useState('month'); 
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError('');
    try {
      const stats = await taskApi.getAnalytics(period);
      setData(stats);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить данные статистики');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
        🔄 Загрузка аналитики за выбранный период...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-700 text-sm">
        ⚠️ {error}
      </div>
    );
  }

  const maxObjectCount = data?.by_objects?.reduce((max, item) => item.count > max ? item.count : max, 1) || 1;
  const maxUserCount = data?.by_users?.reduce((max, item) => item.count > max ? item.count : max, 1) || 1;

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">📊 Сводная статистика журнала</h2>
          <p className="text-xs text-gray-500 mt-0.5">Данные распределения задач отдела АСУТП</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => setPeriod('month')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${period === 'month' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            📅 За текущий месяц
          </button>
          <button
            type="button"
            onClick={() => setPeriod('year')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${period === 'year' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            📆 За текущий год
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Всего задач</span>
          <span className="text-3xl font-extrabold text-gray-900 mt-2">{data?.total_tasks}</span>
        </div>
        {data?.by_statuses.map(statusItem => (
          <div key={statusItem.status} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Статус "{statusItem.status}"</span>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-3xl font-extrabold text-gray-900">{statusItem.count}</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                {data.total_tasks > 0 ? Math.round((statusItem.count / data.total_tasks) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Установки и объекты */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">🏭 По объектам (Установкам)</h3>
          {!data?.by_objects || data.by_objects.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Нет данных за этот период</p>
          ) : (
            <div className="space-y-4">
              {data.by_objects.map(item => (
                <div key={item.object_name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-700 truncate max-w-[80%]">{item.object_name}</span>
                    <span className="text-gray-900 font-bold">{item.count} шт.</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${(item.count / maxObjectCount) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Сотрудники */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">👷 По сотрудникам (Исполнителям)</h3>
          {!data?.by_users || data.by_users.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Нет данных за этот период</p>
          ) : (
            <div className="space-y-4">
              {data.by_users.map(item => (
                <div key={item.who} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-700 truncate max-w-[80%]">👷 {item.who}</span>
                    <span className="text-gray-900 font-bold">{item.count} шт.</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${(item.count / maxUserCount) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
