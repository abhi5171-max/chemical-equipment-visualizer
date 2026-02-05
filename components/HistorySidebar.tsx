
import React from 'react';
import { DatasetHistory } from '../types';
import { Clock, Beaker, ChevronRight, History } from 'lucide-react';

interface Props {
  history: DatasetHistory[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const HistorySidebar: React.FC<Props> = ({ history, selectedId, onSelect }) => {
  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-2 text-blue-600 mb-1">
          <div className="p-1.5 bg-blue-600 text-white rounded-lg">
            <Beaker size={20} />
          </div>
          <h1 className="text-xl font-black tracking-tighter">CHEM-VIS</h1>
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Equipment Analytics</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            <History size={12} className="mr-2" />
            User Upload Logs
          </h3>
          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-bold">
            {history.length}/5
          </span>
        </div>

        <div className="space-y-1">
          {history.length === 0 ? (
            <div className="mt-4 px-2 py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
              <Clock size={24} className="mx-auto text-gray-200 mb-2" />
              <p className="text-xs text-gray-400 font-medium">History is currently empty</p>
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`w-full group flex items-center justify-between p-3 rounded-xl text-left transition duration-200 ${
                  selectedId === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 border border-blue-500' 
                    : 'text-gray-600 hover:bg-gray-50 hover:translate-x-1'
                }`}
              >
                <div className="overflow-hidden">
                  <p className={`text-sm font-bold truncate ${selectedId === item.id ? 'text-white' : 'text-gray-800'}`}>
                    {item.filename}
                  </p>
                  <p className={`text-[10px] mt-0.5 font-medium ${selectedId === item.id ? 'text-blue-100' : 'text-gray-400'}`}>
                    {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
                <ChevronRight 
                  size={14} 
                  className={`transition-transform duration-300 ${selectedId === item.id ? 'text-white' : 'text-gray-300 group-hover:text-blue-400 group-hover:translate-x-0.5'}`} 
                />
              </button>
            ))
          )}
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-gray-100">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">System Integrity</span>
            <span className="text-[10px] font-bold text-green-500 uppercase">Secure</span>
          </div>
          <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full w-[100%]"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default HistorySidebar;
