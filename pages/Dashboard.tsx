
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { useApp } from '../store';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  History,
  RefreshCw,
  Globe,
  FileText,
  MessageSquare,
  Zap,
  Bot,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { workspace, unifiedDashboardMetrics, fetchDashboardMetrics, isLoading } = useApp();
  const [sourceFilter, setSourceFilter] = useState('ALL');

  useEffect(() => {
    fetchDashboardMetrics(sourceFilter);
  }, [sourceFilter]);

  const kpis = unifiedDashboardMetrics?.kpis || {
    revenueToday: 0, revenue30d: 0, ordersToday: 0, orders30d: 0, newLeadsToday: 0, conversionRate: 0, totalLeads: 0
  };

  const chartData = [
    { name: 'Today', value: kpis.revenueToday },
    { name: 'Last 7d', value: kpis.revenue30d / 4 }, // Simulated trend
    { name: 'Last 30d', value: kpis.revenue30d },
  ];

  const statCards = [
    { 
      name: 'Revenue Today', 
      value: `$${kpis.revenueToday.toLocaleString()}`, 
      sub: `MTD: $${kpis.revenue30d.toLocaleString()}`,
      icon: <DollarSign size={20} />, 
      color: 'text-emerald-600', bg: 'bg-emerald-50' 
    },
    { 
      name: 'New Leads', 
      value: kpis.newLeadsToday.toString(), 
      sub: `Total: ${kpis.totalLeads}`,
      icon: <Users size={20} />, 
      color: 'text-blue-600', bg: 'bg-blue-50' 
    },
    { 
      name: 'Orders Today', 
      value: kpis.ordersToday.toString(), 
      sub: `30d: ${kpis.orders30d}`,
      icon: <ShoppingBag size={20} />, 
      color: 'text-indigo-600', bg: 'bg-indigo-50' 
    },
    { 
      name: 'Lead Conversion', 
      value: `${kpis.conversionRate}%`, 
      sub: 'Leads to Customer',
      icon: <Zap size={20} />, 
      color: 'text-orange-600', bg: 'bg-orange-50' 
    },
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'shopify': return <ShoppingBag size={14} className="text-emerald-600" />;
      case 'woocommerce': return <ShoppingBag size={14} className="text-indigo-600" />;
      case 'wordpress_form': return <Globe size={14} className="text-blue-600" />;
      default: return <Clock size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Source Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{workspace?.name} Operations Hub</h1>
          <p className="text-slate-500">Unified insights from all sales and lead channels.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
          {['ALL', 'SHOPIFY', 'WOOCOMMERCE', 'WP_FORM'].map(s => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sourceFilter === s ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {s === 'WP_FORM' ? 'FORMS' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Freshness Bar */}
      <div className="flex flex-wrap items-center gap-6 px-4 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
          Real-time Sync Active
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Clock size={12} />
          Last Webhook: <span className="text-white">{unifiedDashboardMetrics?.freshness.lastWebhookAt ? new Date(unifiedDashboardMetrics.freshness.lastWebhookAt).toLocaleTimeString() : 'Waiting...'}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw size={12} />
          Last Poll: <span className="text-white">{unifiedDashboardMetrics?.freshness.lastPollingAt ? new Date(unifiedDashboardMetrics.freshness.lastPollingAt).toLocaleTimeString() : 'N/A'}</span>
        </div>
        <button 
          onClick={() => fetchDashboardMetrics(sourceFilter)}
          className="ml-auto flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          Force Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} p-2 rounded-xl group-hover:scale-110 transition-transform`}>{stat.icon}</div>
              <ArrowUpRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.name}</p>
            <p className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{stat.value}</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-2">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-600" />
                Revenue Distribution
              </h3>
              <select className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none">
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Conversion Health</h3>
                <div className="relative w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Converted', value: kpis.conversionRate },
                          { name: 'Leads', value: 100 - kpis.conversionRate }
                        ]}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#6366f1" />
                        <Cell fill="#f1f5f9" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-slate-900">{kpis.conversionRate}%</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Rate</span>
                  </div>
                </div>
             </div>
             
             <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl text-white flex flex-col justify-between overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-12 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-500"></div>
                <h3 className="text-sm font-bold flex items-center gap-2"><Bot size={18} /> AI Ops Assistant</h3>
                <p className="text-xs text-indigo-100 mt-2 mb-4 leading-relaxed">I've noticed a 15% drop in Shopify conversion this morning. Should I audit your latest products?</p>
                <button className="w-full py-2 bg-white text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors shadow-lg">Run Diagnosis</button>
             </div>
          </div>
        </div>

        {/* Live Feed Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[650px] sticky top-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Activity size={18} className="text-indigo-600" />
              Live Operations Feed
            </h3>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold">LIVE</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {unifiedDashboardMetrics?.feed.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 italic">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                   <Clock size={20} className="text-slate-200" />
                </div>
                <p className="text-sm">Listening for events...</p>
              </div>
            ) : (
              unifiedDashboardMetrics?.feed.map((event) => (
                <div key={event.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 truncate uppercase tracking-tight">
                        {event.topic.replace('/', ' ')}
                      </p>
                      <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                       <span className={`w-1.5 h-1.5 rounded-full ${event.status === 'processed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                       <span className="text-[10px] font-bold text-slate-400 capitalize">{event.type.replace('_', ' ')} Event</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100">
             <Link to="/leads" className="block w-full py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">View All Activities →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
