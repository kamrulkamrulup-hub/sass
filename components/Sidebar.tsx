
import React, { useState } from 'react';
// @ts-ignore
import { NavLink, Link } from 'react-router-dom';
import { NAVIGATION } from '../constants';
import { useApp } from '../store';
import { Command, ChevronDown, Check } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { workspace, workspaces, switchWorkspace } = useApp();
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  
  return (
    <aside className="hidden lg:flex lg:flex-shrink-0 lg:w-64 lg:flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center h-16 px-6 border-b border-slate-100">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Command size={18} />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">OpsPilot</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-1">
        <div className="px-3 mb-6 relative">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Workspace</p>
          <button 
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className="w-full flex items-center justify-between gap-2 p-2 rounded-md bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 bg-emerald-500 rounded flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
                {workspace?.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-slate-700 truncate">{workspace?.name}</span>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isWorkspaceOpen ? 'rotate-180' : ''}`} />
          </button>

          {isWorkspaceOpen && (
            <div className="absolute left-3 right-3 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden py-1">
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => {
                    switchWorkspace(ws.id);
                    setIsWorkspaceOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center text-[8px] font-bold text-slate-500">
                      {ws.name.charAt(0)}
                    </div>
                    <span className="truncate">{ws.name}</span>
                  </div>
                  {workspace?.id === ws.id && <Check size={14} className="text-indigo-600 flex-shrink-0" />}
                </button>
              ))}
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button className="w-full text-left px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors">
                  + Create Workspace
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className="space-y-1">
          {NAVIGATION.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => 
                `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'} mr-3`}>
                    {item.icon}
                  </span>
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-indigo-600 rounded-xl p-4 text-white">
          <p className="text-sm font-semibold mb-1">Upgrade to Pro</p>
          <p className="text-xs text-indigo-100 mb-3">Get advanced RBAC & unlimited integrations.</p>
          <button className="w-full py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">
            View Pricing
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
