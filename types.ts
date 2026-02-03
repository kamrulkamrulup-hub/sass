
export type Role = 'OWNER' | 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_LEAD' | 'MEMBER' | 'SALES';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  workspaceAccess: string[]; 
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'on-hold';
  members: string[]; 
  createdAt: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  dueDate?: string;
  createdAt: string;
}

export type LeadSource = 'MANUAL' | 'SHOPIFY' | 'WOOCOMMERCE' | 'WP_FORM' | 'AI_GENERATED';
export type LifecycleStage = 'LEAD' | 'CUSTOMER';
export type LeadTemperature = 'HOT' | 'WARM' | 'COLD';

export interface Lead {
  id: string;
  workspaceId: string;
  name: string;
  company?: string;
  email: string;
  emailNormalized?: string;
  phone?: string;
  phoneNormalized?: string;
  sourceRef?: string;
  value: number;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  source: LeadSource;
  lifecycle: LifecycleStage;
  totalOrders: number;
  totalRevenue: number;
  score: number;
  temperature: LeadTemperature;
  lastOrderAt?: string;
  lastSourceEventAt?: string;
  assignedTo?: string; 
  lastActivity?: string;
  externalId?: string; 
  createdAt: string;
}

export interface LeadAutomationConfig {
  workspaceId: string;
  autoQualifyScore: number;
  enableRoundRobin: boolean;
  createFollowUpTasks: boolean;
  notifyOnHotLead: boolean;
}

export interface InboundEvent {
  id: string;
  workspaceId: string;
  source: 'woocommerce' | 'shopify' | 'wordpress_form' | 'manual';
  externalEventId?: string;
  topic: string;
  payload: any;
  receivedAt: string;
  processedAt?: string;
  status: 'pending' | 'processed' | 'failed';
  retryCount: number;
  lastError?: string;
  correlationId: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'note' | 'call' | 'email' | 'task' | 'status_change' | 'order_event' | 'form_event';
  content: string;
  metadata?: any;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'TASK' | 'PROJECT' | 'LEAD' | 'USER' | 'WORKSPACE' | 'INTEGRATION';
  entityId: string;
  details: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Integration {
  id: string;
  workspaceId: string;
  type: 'SHOPIFY' | 'WORDPRESS' | 'WOOCOMMERCE';
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastSync?: string;
  lastError?: string;
  settings: Record<string, any>;
}
