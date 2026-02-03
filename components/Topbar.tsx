
import React from 'react';
import { useApp } from '../store';
import { Bell, Search, MessageSquare, LogOut, ChevronDown } from 'lucide-react';

interface TopbarProps {
  onOpenAI: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onOpenAI }) => {
  const { user, logout } = useApp();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full hidden md:block">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            placeholder="Search tasks, leads, orders..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <button 
          onClick={onOpenAI}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold hover:bg-indigo-100 transition-colors"
        >
          <MessageSquare size={14} />
          <span>AI Assistant</span>
        </button>

        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 mx-1"></div>

        <div className="flex items-center gap-3 pl-1">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name}</p>
            <p className="text-[10px] font-medium text-slate-500 uppercase mt-1 tracking-wider">{user?.role}</p>
          </div>
          <div className="group relative">
            <button className="flex items-center gap-1">
              <img
                src={user?.avatar || 'https://picsum.photos/id/64/100/100'}
                alt="Avatar"
                className="w-9 h-9 rounded-full ring-2 ring-slate-100 group-hover:ring-indigo-100 transition-all"
              />
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50 py-1">
              <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Profile Settings</button>
              <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100">Workspace Settings</button>
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
