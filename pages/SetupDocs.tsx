
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { 
  ShoppingBag, Globe, Terminal, Copy, CheckCircle2, AlertCircle, Key, Webhook, Zap, Play, Book, Info, ShieldCheck, Activity, RefreshCw, Layers, TriangleAlert
} from 'lucide-react';

const SetupDocs: React.FC = () => {
  const { workspace, webhookInfo, shopifyWebhookInfo, wpFormInfo, runSystemTests } = useApp();
  const [activeTab, setActiveTab] = useState<'woo' | 'shopify' | 'forms' | 'system'>('woo');
  const [testStatus, setTestStatus] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({
    woo: 'idle', shopify: 'idle', forms: 'idle'
  });
  const [systemReport, setSystemReport] = useState<any>(null);
  const [isTestingSystem, setIsTestingSystem] = useState(false);

  const copyToClipboard = (text: string) => {
    const fullUrl = text.startsWith('/') ? `${window.location.origin}${text}` : text;
    navigator.clipboard.writeText(fullUrl);
    alert('Copied to clipboard');
  };

  const runTest = async (type: 'shopify' | 'woocommerce' | 'wp_form', simulate_error = false, simulate_legacy = false) => {
    const tabKey = type === 'wp_form' ? 'forms' : (type === 'woocommerce' ? 'woo' : 'shopify');
    setTestStatus(prev => ({ ...prev, [tabKey]: 'loading' }));
    try {
      const res = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, workspaceId: workspace?.id, simulate_error, simulate_legacy })
      });
      if (res.ok) {
        setTestStatus(prev => ({ ...prev, [tabKey]: simulate_error ? 'idle' : 'success' }));
        setTimeout(() => setTestStatus(prev => ({ ...prev, [tabKey]: 'idle' })), 3000);
      } else throw new Error();
    } catch (err) {
      setTestStatus(prev => ({ ...prev, [tabKey]: 'error' }));
    }
  };

  const handleRunSystemTests = async () => {
    setIsTestingSystem(true);
    const report = await runSystemTests();
    setSystemReport(report);
    setIsTestingSystem(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Reliability Hub</h1>
          <p className="text-lg text-slate-500 mt-2">Verify integrations, run logic tests, and monitor health.</p>
        </div>
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
           <Activity size={18} className="animate-pulse" />
           <span className="text-sm font-bold">API Status: Healthy</span>
        </div>
      </div>

      <div className="flex bg-white p-1 border border-slate-200 rounded-2xl shadow-sm w-fit overflow-x-auto no-scrollbar">
        {[
          { id: 'woo', icon: <ShoppingBag size={18} />, label: 'WooCommerce' },
          { id: 'shopify', icon: <ShoppingBag size={18} />, label: 'Shopify' },
          { id: 'forms', icon: <Globe size={18} />, label: 'WP Forms' },
          { id: 'system', icon: <ShieldCheck size={18} />, label: 'System Health' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'system' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <Layers size={22} className="text-indigo-600" />
                    Internal Reliability Checks
                  </h2>
                  <button 
                    onClick={handleRunSystemTests}
                    disabled={isTestingSystem}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isTestingSystem ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />} Run Diagnostic Suite
                  </button>
                </div>

                <div className="space-y-4">
                  {!systemReport && <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl italic">Run diagnostics to verify lead deduplication, workspace scoping, and signature logic.</div>}
                  {systemReport?.results.map((res: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${res.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {res.passed ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{res.name}</span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${res.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {res.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
                 <h3 className="font-bold flex items-center gap-2 mb-4"><Zap size={18} className="text-amber-400" /> Retry Policy Explained</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Max Retries</p>
                       <p className="text-2xl font-bold">5 Attempts</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mechanism</p>
                       <p className="text-2xl font-bold">Exp. Backoff</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Queue Protection</p>
                       <p className="text-2xl font-bold">Rate Limited</p>
                    </div>
                 </div>
              </div>
            </div>
          ) : activeTab === 'woo' ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Book size={20} className="text-indigo-600" />
                  WooCommerce Configuration (wc/v3)
                </h2>
                <p className="text-slate-500 text-sm mt-1">Setup real-time sync for orders using the modern WP REST API endpoints.</p>
              </div>
              <div className="p-8 space-y-8">
                <section className="p-6 bg-amber-50 rounded-2xl border border-amber-200">
                  <div className="flex items-center gap-3 mb-2">
                    <TriangleAlert size={20} className="text-amber-600" />
                    <h4 className="text-amber-900 font-bold text-sm">Do Not Use Legacy API</h4>
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Ensure the <strong>API Version</strong> is set to <code>WP REST API Integration v3</code>. 
                    The "Legacy REST API v3" option is deprecated and lacks support for modern data mapping used in OpsPilot.
                  </p>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm border border-indigo-200">1</span>
                    <h3 className="font-bold text-slate-800">Navigate to Webhooks</h3>
                  </div>
                  <p className="text-slate-600 text-sm ml-11 leading-relaxed">
                    Go to <span className="font-bold bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600">WooCommerce > Settings > Advanced > Webhooks</span>.
                  </p>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm border border-indigo-200">2</span>
                    <h3 className="font-bold text-slate-800">Add Webhook Details</h3>
                  </div>
                  <div className="ml-11 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery URL</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-indigo-600 bg-white border border-slate-200 px-2 py-1 rounded-md">{`${window.location.origin}/webhooks/woocommerce/orders`}</code>
                        <button onClick={() => copyToClipboard('/webhooks/woocommerce/orders')} className="p-1.5 text-slate-400 hover:text-indigo-600"><Copy size={14} /></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secret</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-indigo-600 bg-white border border-slate-200 px-2 py-1 rounded-md">{webhookInfo?.secret || 'Generating...'}</code>
                        <button onClick={() => copyToClipboard(webhookInfo?.secret || '')} className="p-1.5 text-slate-400 hover:text-indigo-600"><Copy size={14} /></button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8 space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Configure Webhooks</h2>
              <p className="text-slate-500 text-sm">Follow the instructions to connect your {activeTab} endpoint.</p>
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                 <h4 className="font-bold text-slate-900 mb-2">Endpoint URL</h4>
                 <div className="flex gap-2">
                    <input readOnly value={`${window.location.origin}/webhooks/${activeTab}/orders`} className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono" />
                    <button onClick={() => copyToClipboard(`/webhooks/${activeTab}/orders`)} className="p-2 bg-white border border-slate-200 rounded-xl hover:text-indigo-600"><Copy size={16} /></button>
                 </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Terminal size={16} className="text-slate-400" /> Webhook Testing
             </h3>
             <div className="space-y-3">
                <button 
                  onClick={() => runTest('woocommerce', false)}
                  disabled={testStatus.woo === 'loading'}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl group hover:border-indigo-300 transition-all"
                >
                  <span className="text-xs font-bold text-slate-700">Test Woo (Modern)</span>
                  {testStatus.woo === 'loading' ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} className="text-indigo-500" />}
                </button>

                <button 
                  onClick={() => runTest('woocommerce', false, true)}
                  disabled={testStatus.woo === 'loading'}
                  className="w-full flex items-center justify-between px-4 py-3 bg-rose-50 border border-rose-100 rounded-2xl group hover:border-rose-300 transition-all"
                >
                  <span className="text-xs font-bold text-rose-700">Test Woo (Legacy)</span>
                  {testStatus.woo === 'loading' ? <RefreshCw size={14} className="animate-spin" /> : <TriangleAlert size={14} className="text-rose-500" />}
                </button>
             </div>
             <p className="text-[10px] text-slate-400 mt-4 leading-relaxed italic">
               The "Legacy" test will trigger a warning banner in the Integrations dashboard to help you identify outdated stores.
             </p>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
             <h3 className="font-bold mb-3 flex items-center gap-2 tracking-tight">Lead Dedupe Tests</h3>
             <p className="text-xs text-indigo-100 mb-4">Our lead ingestion engine verifies uniqueness across:</p>
             <ul className="space-y-2 text-[10px] font-bold text-indigo-50 uppercase tracking-widest">
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-400" /> Normalized Email</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-400" /> Cleaned Phone</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-400" /> External Reference ID</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupDocs;
