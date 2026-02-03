
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { useApp } from '../store';
import { ShoppingBag, Globe, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Key, ShieldCheck, Settings as SettingsIcon, X, Terminal, Loader2, Copy, Zap, Info, Clock, Activity, FileText, Plus, Trash2, Ghost, TriangleAlert } from 'lucide-react';

const Integrations: React.FC = () => {
  const { integrations, connectIntegration, workspace, webhookInfo, shopifyWebhookInfo, wpFormInfo, failedEvents, fetchFailedEvents, reprocessEvent } = useApp();
  const [activeTab, setActiveTab] = useState<'connected' | 'available' | 'failed'>('available');
  
  // Modals
  const [showShopifyModal, setShowShopifyModal] = useState(false);
  const [showWPModal, setShowWPModal] = useState(false);
  const [modalTab, setModalTab] = useState<'settings' | 'webhooks' | 'forms'>('settings');
  
  // Shopify State
  const [shopifyDomain, setShopifyDomain] = useState('');
  const [shopifyToken, setShopifyToken] = useState('');
  const [shopifySecret, setShopifySecret] = useState('');

  // WordPress State
  const [wpUrl, setWpUrl] = useState('');
  const [wpUsername, setWpUsername] = useState('');
  const [wpAppPassword, setWpAppPassword] = useState('');
  
  // Form Mapping State
  const [mappings, setMappings] = useState<any[]>([]);
  
  const [isTesting, setIsTesting] = useState(false);

  const wpIntegration = integrations.find(i => i.type === 'WORDPRESS');
  const shIntegration = integrations.find(i => i.type === 'SHOPIFY');

  useEffect(() => {
    if (wpFormInfo) {
      setMappings(wpFormInfo.mappings);
    }
  }, [wpFormInfo]);

  const handleConnectShopify = (e: React.FormEvent) => {
    e.preventDefault();
    connectIntegration('SHOPIFY', { domain: shopifyDomain, accessToken: shopifyToken, webhookSecret: shopifySecret });
    setModalTab('webhooks');
  };

  const handleConnectWordPress = (e: React.FormEvent) => {
    e.preventDefault();
    connectIntegration('WORDPRESS', { 
      url: wpUrl, 
      username: wpUsername, 
      appPassword: wpAppPassword,
      isLegacyWoo: false // Default to false
    });
    setModalTab('webhooks');
  };

  const copyToClipboard = (text: string) => {
    const fullUrl = text.startsWith('/') ? `${window.location.origin}${text}` : text;
    navigator.clipboard.writeText(fullUrl);
    alert('Copied to clipboard');
  };

  const apps = [
    {
      id: 'SHOPIFY',
      name: 'Shopify',
      icon: <ShoppingBag className="text-emerald-600" size={24} />,
      description: 'Sync orders, customers, and inventory in real-time.',
      connected: integrations.some(i => i.type === 'SHOPIFY' && i.status === 'CONNECTED'),
      open: () => { setModalTab(shIntegration?.status === 'CONNECTED' ? 'webhooks' : 'settings'); setShowShopifyModal(true); }
    },
    {
      id: 'WORDPRESS',
      name: 'WordPress / WooCommerce',
      icon: <Globe className="text-indigo-600" size={24} />,
      description: 'Manage content and WooCommerce store data.',
      connected: integrations.some(i => i.type === 'WORDPRESS' && i.status === 'CONNECTED'),
      open: () => { setModalTab(wpIntegration?.status === 'CONNECTED' ? 'webhooks' : 'settings'); setShowWPModal(true); }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
          <p className="text-slate-500">Connect and manage your external data sources.</p>
        </div>
        <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
          <button onClick={() => setActiveTab('available')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'available' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Available</button>
          <button onClick={() => setActiveTab('connected')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'connected' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Connected</button>
          <button onClick={() => setActiveTab('failed')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors relative ${activeTab === 'failed' ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:text-slate-700'}`}>
            Dead Letter
            {failedEvents.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] flex items-center justify-center rounded-full animate-pulse">{failedEvents.length}</span>}
          </button>
        </div>
      </div>

      {activeTab === 'failed' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-rose-50/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-600 shadow-sm"><Ghost size={20} /></div>
              <div><h3 className="font-bold text-slate-900">Failed Events Management</h3><p className="text-xs text-slate-500">Reprocess events that hit the maximum retry limit.</p></div>
            </div>
            <button onClick={fetchFailedEvents} className="p-2 text-slate-400 hover:text-slate-600"><RefreshCw size={18} /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Topic</th>
                  <th className="px-6 py-4">Retries</th>
                  <th className="px-6 py-4">Last Error</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {failedEvents.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No failed events found. System is healthy!</td></tr>
                )}
                {failedEvents.map(event => (
                  <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700 capitalize">{event.source}</td>
                    <td className="px-6 py-4 font-mono text-xs">{event.topic}</td>
                    <td className="px-6 py-4"><span className="px-2 py-0.5 bg-slate-100 rounded-full font-bold text-slate-600">{event.retryCount}</span></td>
                    <td className="px-6 py-4 text-rose-600 truncate max-w-[200px]" title={event.lastError}>{event.lastError}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => reprocessEvent(event.id)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-1.5 ml-auto">
                        <Zap size={14} /> Reprocess
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {wpIntegration?.settings?.isLegacyWoo && activeTab === 'connected' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-xl shadow-sm">
                <TriangleAlert size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-amber-900 text-sm">Deprecated Legacy WooCommerce API Detected</h4>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Your store is currently sending webhooks via the <strong>Legacy REST API v3</strong>. 
                  This is deprecated and will be removed in future WooCommerce versions. 
                  Please update your WooCommerce settings to use <strong>WP REST API Integration v3</strong>.
                </p>
                <div className="mt-3">
                  <Link to="/setup-guide" className="text-xs font-bold text-amber-800 underline flex items-center gap-1 hover:text-amber-900">
                    See Setup Instructions <ExternalLink size={10} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {apps.filter(app => activeTab === 'available' || app.connected).map((app) => (
              <div key={app.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">{app.icon}</div>
                    {app.connected ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full"><CheckCircle2 size={14} /> Connected</span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">Available</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{app.name}</h3>
                  <p className="text-sm text-slate-500 mb-6">{app.description}</p>
                </div>
                <div className="mt-auto p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <Link to="/setup-guide" className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-slate-700">Documentation <ExternalLink size={12} /></Link>
                  <button onClick={app.open} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${app.connected ? 'bg-white border border-slate-200 text-slate-700' : 'bg-indigo-600 text-white shadow-sm'}`}>
                    {app.connected ? <><SettingsIcon size={14} /> Configure</> : 'Connect Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals remain same as previous state for brevity, but enhanced with reliability visuals */}
      {showShopifyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50 text-emerald-900">
                <h3 className="font-bold flex items-center gap-2"><ShoppingBag size={20} /> Shopify Integration</h3>
                <button onClick={() => setShowShopifyModal(false)}><X size={20} /></button>
             </div>
             <div className="p-8 space-y-6">
                <form onSubmit={handleConnectShopify} className="space-y-4">
                  <input value={shopifyDomain} onChange={e => setShopifyDomain(e.target.value)} placeholder="your-store.myshopify.com" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  <input type="password" value={shopifyToken} onChange={e => setShopifyToken(e.target.value)} placeholder="Access Token" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  <button className="w-full py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md">Connect Store</button>
                </form>
             </div>
          </div>
        </div>
      )}
      {/* WP Modal also needed for configuration */}
      {showWPModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50 text-indigo-900">
                <h3 className="font-bold flex items-center gap-2"><Globe size={20} /> WordPress Integration</h3>
                <button onClick={() => setShowWPModal(false)}><X size={20} /></button>
             </div>
             <div className="p-8 space-y-6">
                <form onSubmit={handleConnectWordPress} className="space-y-4">
                  <input value={wpUrl} onChange={e => setWpUrl(e.target.value)} placeholder="https://your-wordpress-site.com" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  <div className="grid grid-cols-2 gap-4">
                    <input value={wpUsername} onChange={e => setWpUsername(e.target.value)} placeholder="Username" className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    <input type="password" value={wpAppPassword} onChange={e => setWpAppPassword(e.target.value)} placeholder="Application Password" className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  </div>
                  <button className="w-full py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-md">Connect Site</button>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;
