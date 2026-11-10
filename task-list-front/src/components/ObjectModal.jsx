import React from 'react';

export default function ObjectModal({ isOpen, onClose, objects, newObjName, setNewObjName, onCreate, onDelete }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Справочник объектов</h2>
        </div>
        <div className="p-6 space-y-4">
          
          {/* Форма добавления нового объекта */}
          <form onSubmit={onCreate} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Новый объект..." 
              value={newObjName}
              onChange={e => setNewObjName(e.target.value)}
              className="flex-1 border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              Создать
            </button>
          </form>

          {/* Список существующих объектов */}
          <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100">
            {!objects || objects.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">Список объектов пуст</div>
            ) : (
              objects.map(obj => (
                <div key={obj.id} className="p-3 flex justify-between items-center hover:bg-gray-50 transition">
                  <span className="text-sm font-medium text-gray-700">{obj.name}</span>
                  <button 
                    type="button" 
                    onClick={() => onDelete(obj.id)} 
                    className="p-1 text-gray-400 hover:text-red-500 transition text-base" 
                    title="Удалить объект"
                  >
                    ❌
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Кнопка закрытия */}
          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition"
            >
              Закрыть
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
