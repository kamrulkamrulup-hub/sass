
import React, { useState } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { useApp } from '../store';
import { projectsService } from '../projectsService';
import { Plus, MoreVertical, ExternalLink, Calendar, X, Users as UsersIcon, Loader2, AlertCircle, Check, UserPlus } from 'lucide-react';

const Projects: React.FC = () => {
  const { projects, team, activeWorkspaceId, setLastError } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState<{ id: string, members: string[] } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', members: [] as string[] });
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspaceId) return;
    setIsSaving(true);
    setError(null);
    try {
      await projectsService.create(activeWorkspaceId, formData);
      setShowModal(false);
      setFormData({ name: '', description: '', members: [] });
    } catch (err: any) {
      setError(err.message || "Failed to create project");
      setLastError({ ...err, action: "Create Project" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMembers = async (projectId: string, memberIds: string[]) => {
    setIsSaving(true);
    try {
      await projectsService.updateMembers(projectId, memberIds);
      setShowMembersModal(null);
    } catch (err: any) {
      setLastError({ ...err, action: "Update Project Members" });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMemberInForm = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500">Manage high-level company initiatives.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md active:scale-95"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <Plus size={48} className="mb-4 opacity-20" />
            <p className="font-bold">No projects yet</p>
            <p className="text-sm">Click the button above to start your first project.</p>
          </div>
        )}
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <Calendar size={24} />
              </div>
              <div className="relative group/menu">
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <MoreVertical size={20} />
                </button>
                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:pointer-events-auto transition-all z-50 py-1">
                  <button 
                    onClick={() => setShowMembersModal({ id: project.id, members: project.members || [] })}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <UserPlus size={14} /> Manage Members
                  </button>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">{project.name}</h3>
            <p className="text-sm text-slate-500 mb-6 line-clamp-2">{project.description}</p>
            
            <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {(project.members || []).slice(0, 3).map(uid => {
                    const m = team.find(t => t.user.id === uid);
                    return (
                      <div key={uid} className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-600" title={m?.user.name}>
                        {m?.user.name.charAt(0) || '?'}
                      </div>
                    );
                  })}
                  {project.members && project.members.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                      +{project.members.length - 3}
                    </div>
                  )}
                  {(!project.members || project.members.length === 0) && (
                    <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                      <UsersIcon size={12} />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {project.members?.length || 0} Members
                </span>
              </div>
              <Link to={`/tasks?project=${project.id}`} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700">
                View Tasks
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Create New Project</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Project Name</label>
                <input required value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. Q4 Website Refresh" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none" placeholder="What is this project about?" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Assign Team Members</label>
                <div className="max-h-40 overflow-y-auto p-2 border border-slate-100 bg-slate-50/50 rounded-xl space-y-1">
                  {team.map(m => (
                    <button
                      key={m.user.id}
                      type="button"
                      onClick={() => toggleMemberInForm(m.user.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${formData.members.includes(m.user.id) ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 text-slate-700'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${formData.members.includes(m.user.id) ? 'bg-white text-indigo-600' : 'bg-indigo-100 text-indigo-600'}`}>
                          {m.user.name.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold">{m.user.name}</span>
                      </div>
                      {formData.members.includes(m.user.id) && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              <button disabled={isSaving} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all mt-4 flex items-center justify-center gap-2">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Create Project'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showMembersModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-900">Manage Members</h3>
                <p className="text-xs text-slate-500">Update project access for your team.</p>
              </div>
              <button onClick={() => setShowMembersModal(null)}><X size={20} /></button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {team.map(m => {
                const isSelected = showMembersModal.members.includes(m.user.id);
                return (
                  <button
                    key={m.user.id}
                    onClick={() => {
                      const newMembers = isSelected
                        ? showMembersModal.members.filter(id => id !== m.user.id)
                        : [...showMembersModal.members, m.user.id];
                      setShowMembersModal({ ...showMembersModal, members: newMembers });
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 bg-slate-50 hover:border-indigo-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-indigo-600">
                        {m.user.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-900">{m.user.name}</p>
                        <p className="text-[10px] text-slate-500">{m.role}</p>
                      </div>
                    </div>
                    {isSelected && <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white"><Check size={12} /></div>}
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setShowMembersModal(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
              <button 
                onClick={() => handleUpdateMembers(showMembersModal.id, showMembersModal.members)}
                disabled={isSaving}
                className="flex-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
