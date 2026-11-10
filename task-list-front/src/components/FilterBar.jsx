import React from 'react';

export default function FilterBar({ search, setSearch, dateFilter, setDateFilter, objectFilter, setObjectFilter, statusFilter, setStatusFilter, objects }) {
  return (
    <div className="bg-white p-4 w-full rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center mb-6">
      <div className="relative flex-1 min-w-[240px]">
        <input 
          type="text" 
          placeholder="🔍 Поиск по тексту, исполнителю..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-1">
        <input 
          type="date" 
          value={dateFilter} 
          onChange={e => setDateFilter(e.target.value)} 
          className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        {dateFilter && (
          <button 
            type="button" 
            onClick={() => setDateFilter('')} 
            className="p-2 text-gray-400 hover:text-gray-600 text-sm"
            title="Очистить дату"
          >
            ✖
          </button>
        )}
      </div>
      <select 
        value={objectFilter} 
        onChange={(e) => setObjectFilter(e.target.value)}
        className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Все объекты</option>
        {objects && objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
      <select 
        value={statusFilter} 
        onChange={(e) => setStatusFilter(e.target.value)}
        className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Все статусы</option>
        <option value="В работе">В работе</option>
        <option value="Выполнено">Выполнено</option>
        <option value="Запланировано">Запланировано</option>
      </select>
    </div>
  );
}
