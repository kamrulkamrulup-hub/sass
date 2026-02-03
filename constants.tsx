
import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Users, 
  Target, 
  Settings, 
  Link as LinkIcon,
  ShoppingBag,
  Globe,
  Bell,
  Search,
  Plus,
  MessageSquare,
  BookOpen
} from 'lucide-react';

export const NAVIGATION = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'Projects', href: '/projects', icon: <Briefcase size={20} /> },
  { name: 'Tasks', href: '/tasks', icon: <CheckSquare size={20} /> },
  { name: 'Leads (CRM)', href: '/leads', icon: <Target size={20} /> },
  { name: 'Team', href: '/team', icon: <Users size={20} /> },
  { name: 'Integrations', href: '/integrations', icon: <LinkIcon size={20} /> },
  { name: 'Setup Guide', href: '/setup-guide', icon: <BookOpen size={20} /> },
];

export const STATUS_COLORS = {
  todo: 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  review: 'bg-amber-100 text-amber-700',
  done: 'bg-emerald-100 text-emerald-700',
};

export const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600 font-semibold',
};

export const LEAD_STAGES = [
  { id: 'new', label: 'New Lead' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'closed-won', label: 'Won' },
];
