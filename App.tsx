
import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
// @ts-ignore
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './store';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Leads from './pages/Leads';
import Team from './pages/Team';
import Integrations from './pages/Integrations';
import SetupDocs from './pages/SetupDocs';
import Auth from './pages/Auth';
import AcceptInvite from './pages/AcceptInvite';
import AIAssistant from './components/AIAssistant';
import DebugPanel from './components/DebugPanel';
import { AlertCircle, RefreshCcw, Loader2 } from 'lucide-react';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("OpsPilot Runtime Crash:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-slate-900">Application Error</h1>
              <p className="text-sm text-slate-500">OpsPilot encountered a critical runtime error.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl text-left font-mono text-xs text-rose-600 break-words">
              {this.state.error?.message || "Unknown error"}
            </div>
            <button onClick={() => window.location.reload()} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
              <RefreshCcw size={18} /> Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppLayout: React.FC = () => {
  const { user, isInitialLoading, isWorkspaceLoading, activeWorkspaceId } = useApp();
  const [isAiOpen, setIsAiOpen] = useState(false);

  if (isInitialLoading || (user && isWorkspaceLoading)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="text-slate-500 font-medium text-sm">
          {isWorkspaceLoading ? "Loading workspace..." : "Resuming session..."}
        </p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!activeWorkspaceId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
        <h2 className="text-lg font-bold text-slate-900">Initializing Workspace...</h2>
        <p className="text-slate-500 text-sm mt-2">Hang tight, we're setting up your operational hub.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onOpenAI={() => setIsAiOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <AIAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
      <DebugPanel />
    </div>
  );
};

const RouterContent = () => {
  const { user, isInitialLoading } = useApp();
  return (
    <Routes>
      <Route path="/login" element={(!isInitialLoading && user) ? <Navigate to="/dashboard" replace /> : <Auth mode="login" />} />
      <Route path="/register" element={(!isInitialLoading && user) ? <Navigate to="/dashboard" replace /> : <Auth mode="register" />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/team" element={<Team />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/setup-guide" element={<SetupDocs />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <HashRouter>
          <RouterContent />
        </HashRouter>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
