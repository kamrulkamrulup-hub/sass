
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User as UserIcon, Sparkles, Terminal } from 'lucide-react';
import { getGeminiResponse } from '../geminiService';
import { useApp } from '../store';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const { projects, tasks, leads, workspace } = useApp();
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; content: string }[]>([
    { role: 'ai', content: "Hello! I'm OpsPilot AI. I can now perform actions like creating tasks or moving leads directly through this chat. How can I help?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    // Build lean context for the server
    const context = {
      workspaceName: workspace?.name,
      projectCount: projects.length,
      taskCount: tasks.length,
      leadCount: leads.length,
      recentLeads: leads.slice(0, 5).map(l => ({ id: l.id, name: l.name, stage: l.stage, value: l.value })),
      recentTasks: tasks.filter(t => t.status !== 'done').slice(0, 5).map(t => ({ id: t.id, title: t.title, status: t.status }))
    };

    const responseText = await getGeminiResponse(userMsg, context);
    
    setMessages(prev => [...prev, { role: 'ai', content: responseText }]);
    setIsTyping(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-[100] border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-indigo-600 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">OpsPilot AI</h3>
            <div className="flex items-center gap-1.5 text-[10px] opacity-80">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              Server-side Agent Active
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border ${m.role === 'ai' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-200'}`}>
                {m.role === 'ai' ? <Sparkles size={16} /> : <UserIcon size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'ai' 
                  ? 'bg-white shadow-sm border border-slate-100 rounded-tl-none text-slate-700' 
                  : 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-200'
              }`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
              <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processing...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button 
            onClick={() => setInput("Create a task for Q4 planning")}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-lg text-[10px] font-bold text-slate-600 transition-all flex items-center gap-1.5"
          >
            <Terminal size={12} />
            Create Task
          </button>
          <button 
            onClick={() => setInput("What are my current sales metrics?")}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-lg text-[10px] font-bold text-slate-600 transition-all flex items-center gap-1.5"
          >
            <Terminal size={12} />
            Fetch Metrics
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask OpsPilot to perform an action..."
            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 text-[9px] text-slate-400 font-medium">
          <ShieldCheck size={10} />
          <span>Encrypted Server-Side Logic • Gemini 3 Pro</span>
        </div>
      </div>
    </div>
  );
};

// Re-using icon for small footer
const ShieldCheck = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default AIAssistant;
