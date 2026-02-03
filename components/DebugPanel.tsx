
import React from 'react';
import { useApp } from '../store';
import { Terminal, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

const DebugPanel: React.FC = () => {
  const { user, activeWorkspaceId, workspaces, team, lastError } = useApp();

  return (
    <div className="fixed bottom-4 left-4 z-[9999] group">
      <div className="p-2 bg-slate-900 text-white rounded-full shadow-lg cursor-help">
        <Terminal size={20} />
      </div>
      <div className="absolute bottom-full mb-2 left-0 w-80 bg-slate-900 text-white rounded-2xl shadow-2xl p-4 border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-95 group-hover:scale-100 origin-bottom-left">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-white/10 pb-2 flex items-center gap-2">
          <ShieldCheck size={12} className="text-indigo-400" />
          OpsPilot Diagnostics
        </h4>
        
        <div className="space-y-3 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 uppercase">Auth UID</span>
            <span className="font-mono text-indigo-400 truncate max-w-[120px]">{user?.id || 'null'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 uppercase">Active WS</span>
            <span className="font-mono text-emerald-400 truncate max-w-[120px]">{activeWorkspaceId || 'null'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 uppercase">Workspaces</span>
            <span className="font-bold">{workspaces.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 uppercase">Team Size</span>
            <span className="font-bold">{team.length}</span>
          </div>

          {lastError && (
            <div className="mt-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold uppercase text-[9px]">
                <AlertCircle size={10} />
                Last Error ({lastError.action || 'Unknown'})
              </div>
              <p className="text-[10px] text-rose-200 mt-1 leading-relaxed">
                [{lastError.code}] {lastError.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
