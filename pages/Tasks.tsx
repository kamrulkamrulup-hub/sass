
import React, { useState, useMemo } from 'react';
import { useApp } from '../store';
import { tasksService } from '../tasksService';
import { STATUS_COLORS, PRIORITY_COLORS } from '../constants';
import { Plus, Filter, LayoutGrid, List as ListIcon, Calendar, CheckCircle2, Circle, X, AlertCircle, Loader2, User, UserCheck } from 'lucide-react';

const Tasks: React.FC = () => {
  const { tasks, team, projects, activeWorkspaceId, user, setLastError } = useApp();
  const [view, setView] = useState<'kanban' | 'list'>('list');
  const [filterMyTasks, setFilterMyTasks] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium', projectId: '', assigneeId: '', dueDate: '' });

  const filteredTasks = useMemo(() => {
    if (!filterMyTasks) return tasks;
    return tasks.filter(t => t.assigneeId === user?.id);
  }, [tasks, filterMyTasks, user]);

  const toggleTask = async (id: string, currentStatus: string) => {
    try {
      await tasksService.update(id, { status: currentStatus === 'done' ? 'todo' : 'done' });
    } catch (err: any) {
      setLastError({ ...err, action: "Toggle Task" });
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspaceId || !user) return;
    setIsSaving(true);
    setError(null);
    try {
      await tasksService.create(activeWorkspaceId, user.id, formData);
      setShowModal(false);
      setFormData({ title: '', description: '', priority: 'medium', projectId: '', assigneeId: '', dueDate: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      setLastError({ ...err, action: "Create Task" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Task Management</h1>
          <p className="text-slate-500">Track and manage operational tasks.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setFilterMyTasks(!filterMyTasks)}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all border shadow-sm ${filterMyTasks ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
          >
            <UserCheck size={18} /> {filterMyTasks ? 'All Tasks' : 'My Tasks'}
          </button>
          <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-sm active:scale-95">
            <Plus size={18} /> Add Task
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Task Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assignee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredTasks.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No tasks found.</td></tr>
            )}
            {filteredTasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleTask(task.id, task.status)} className={`${task.status === 'done' ? 'text-emerald-500' : 'text-slate-300'}`}>
                      {task.status === 'done' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>
                    <div>
                      <p className={`text-sm font-semibold ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{task.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{projects.find(p => p.id === task.projectId)?.name || 'General'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]}`}>{task.status}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}`}>{task.priority}</span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] border border-slate-200"><User size={12} /></div>
                    <span className="text-xs text-slate-600">{team.find(m => m.user.id === task.assigneeId)?.user.name || 'Unassigned'}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 space-y-6 overflow-hidden">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Create New Task</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            {error && <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs">{error}</div>}
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
                <input required value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Task Title" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                  <select value={formData.priority} onChange={e => setFormData(p => ({...p, priority: e.target.value}))} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                  <input type="date" value={formData.dueDate} onChange={e => setFormData(p => ({...p, dueDate: e.target.value}))} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Project</label>
                  <select value={formData.projectId} onChange={e => setFormData(p => ({...p, projectId: e.target.value}))} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none">
                    <option value="">General</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Assignee</label>
                  <select value={formData.assigneeId} onChange={e => setFormData(p => ({...p, assigneeId: e.target.value}))} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none">
                    <option value="">Unassigned</option>
                    {team.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
                  </select>
                </div>
              </div>

              <button disabled={isSaving} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700">
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Create Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
