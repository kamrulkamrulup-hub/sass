
import React, { useState } from 'react';
import { useApp } from '../store';
import { leadsService } from '../leadsService';
import { LEAD_STAGES } from '../constants';
import { Plus, X, Mail, Phone, Layers, Zap, Loader2, User, ShoppingBag, MessageSquare, Globe } from 'lucide-react';

const Leads: React.FC = () => {
  const { leads, activeWorkspaceId, setLastError } = useApp();
  const [activeTab, setActiveTab] = useState<'board' | 'automation'>('board');
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', value: 0 });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspaceId) return;
    setIsSaving(true);
    try {
      await leadsService.create(activeWorkspaceId, formData);
      setShowModal(false);
      setFormData({ name: '', email: '', company: '', value: 0 });
    } catch (err: any) {
      setLastError({ ...err, action: "Create Lead" });
    } finally { setIsSaving(false); }
  };

  const updateStage = async (id: string, toStage: string) => {
    try { await leadsService.updateStage(id, toStage); } 
    catch (err: any) { setLastError({ ...err, action: "Move Lead" }); }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'SHOPIFY': return <ShoppingBag size={12} className="text-emerald-500" />;
      case 'WOOCOMMERCE': return <ShoppingBag size={12} className="text-indigo-500" />;
      case 'WP_FORM': return <MessageSquare size={12} className="text-blue-500" />;
      case 'AI_GENERATED': return <Globe size={12} className="text-purple-500" />;
      default: return <User size={12} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CRM Pipeline</h1>
          <p className="text-slate-500">Track and convert leads from all channels.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-md">
          <Plus size={18} /> New Lead
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 min-h-[600px] no-scrollbar">
        {LEAD_STAGES.map((stage) => {
          const stageLeads = leads.filter(l => l.stage === stage.id);
          return (
            <div key={stage.id} className="flex-shrink-0 w-72">
              <div className="mb-4 bg-white/50 p-2 rounded-xl flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-tight">{stage.label}</h3>
                <span className="text-[10px] font-bold text-slate-400">{stageLeads.length}</span>
              </div>
              <div className="space-y-4">
                {stageLeads.map((lead) => (
                  <div key={lead.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-500 uppercase">
                        {getSourceIcon(lead.source)} {lead.source}
                      </div>
                      <select value={lead.stage} onChange={(e) => updateStage(lead.id, e.target.value)} className="text-[9px] font-bold bg-slate-50 outline-none">
                        {LEAD_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{lead.name}</h4>
                    <p className="text-[10px] text-slate-400">{lead.company || 'Private Lead'}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                      <span className="text-xs font-bold text-slate-700">${lead.value?.toLocaleString()}</span>
                      <div className="flex gap-1">
                        <button className="p-1.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg border border-slate-100"><Mail size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900">Add New Lead</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input required value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} placeholder="Full Name" className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" />
              <input type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} placeholder="Email" className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" />
              <input value={formData.company} onChange={e => setFormData(p => ({...p, company: e.target.value}))} placeholder="Company" className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" />
              <button disabled={isSaving} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Create Lead'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
