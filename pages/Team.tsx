
import React, { useState } from 'react';
import { useApp } from '../store';
import { teamService } from '../teamService';
import { UserPlus, Trash2, Shield, X, MoreHorizontal, Loader2, AlertCircle, Copy, Check, Link as LinkIcon } from 'lucide-react';

const Team: React.FC = () => {
  const { team, activeWorkspaceId, user, setLastError } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ email: '', role: 'MEMBER' });
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Production base URL for invitation links
  const BASE_URL = "https://cmss-c2d4e.web.app";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspaceId) return;
    setIsSaving(true);
    setGeneratedLink(null);
    try {
      const inviteRef = await teamService.invite(activeWorkspaceId, formData.email, formData.role);
      // Using HashRouter compatible link with hardcoded production domain
      const link = `${BASE_URL}/#/accept-invite?inviteId=${inviteRef.id}`;
      setGeneratedLink(link);
      setFormData({ email: '', role: 'MEMBER' });
    } catch (err: any) {
      setLastError({ ...err, action: "Invite Member" });
    } finally { setIsSaving(false); }
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRemove = async (membershipId: string, memberUid: string) => {
    if (user?.role !== 'OWNER') {
      alert("Only the Workspace OWNER can remove members.");
      return;
    }
    if (memberUid === user.id) {
      alert("You cannot remove yourself. Transfer ownership first.");
      return;
    }
    if (!confirm("Are you sure you want to remove this member?")) return;
    try { await teamService.removeMember(membershipId); } 
    catch (err: any) { setLastError({ ...err, action: "Remove Member" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
          <p className="text-slate-500">Manage access for your workspace.</p>
        </div>
        <button onClick={() => { setShowModal(true); setGeneratedLink(null); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-md">
          <UserPlus size={18} /> Invite Member
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Member</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {team.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 border border-indigo-100 uppercase">
                      {m.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{m.user.name}</p>
                      <p className="text-xs text-slate-400">{m.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                    <Shield size={10} /> {m.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleRemove(m.id, m.user.id)} className="text-slate-300 hover:text-rose-600 p-2 transition-colors"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900">Invite New Member</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            
            {!generatedLink ? (
              <form onSubmit={handleInvite} className="space-y-4">
                <p className="text-xs text-slate-500 italic">No emails will be sent. You will get a link to share manually.</p>
                <input required type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} placeholder="colleague@company.com" className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" />
                <select value={formData.role} onChange={e => setFormData(p => ({...p, role: e.target.value}))} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm">
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SALES">Sales Agent</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                </select>
                <button disabled={isSaving} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">
                  {isSaving ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Generate Invite Link'}
                </button>
              </form>
            ) : (
              <div className="space-y-6 animate-in zoom-in-95">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                    <LinkIcon size={24} />
                  </div>
                  <h4 className="font-bold text-emerald-900">Invite Created!</h4>
                  <p className="text-xs text-emerald-700 mt-1">Copy the link below and send it to the member manually.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Shareable Link</label>
                  <div className="flex gap-2">
                    <input readOnly value={generatedLink} className="flex-1 px-4 py-2 bg-slate-50 border rounded-xl text-xs font-mono truncate" />
                    <button 
                      onClick={handleCopy}
                      className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => { setShowModal(false); setGeneratedLink(null); }}
                  className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
