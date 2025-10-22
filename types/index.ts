import {
  UserRole,
  ChannelType,
  MessageStatus,
  TicketStatus,
  TicketPriority,
  CallStatus,
  AgentStatus,
  SLAStatus,
} from "@/config/constants";

export type { ChannelType } from "@/config/constants";

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  phoneNumber?: string;
  department?: string;
  teamId: string;
  status: AgentStatus;
  createdAt: Date;
  updatedAt: Date;
  lastSeenAt?: Date;
  metadata?: Record<string, any>;
}

// Team Types
export interface Team {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  ownerId: string;
  members: string[]; // User IDs
  createdAt: Date;
  updatedAt: Date;
  settings?: TeamSettings;
}

export interface TeamSettings {
  timezone: string;
  language: string;
  defaultTeamLead?: string;
  maxAgents: number;
  features: string[];
  customBranding?: {
    primaryColor: string;
    logoUrl: string;
    brandName: string;
  };
}

// Contact Types
export interface Contact {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  channels: ChannelContact[];
  company?: string;
  jobTitle?: string;
  lastContactedAt?: Date;
  conversationCount: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface ChannelContact {
  type: ChannelType;
  handle: string; // e.g., WhatsApp number, email, etc.
  verified: boolean;
  lastMessageAt?: Date;
}

// Conversation Types
export interface Conversation {
  id: string;
  teamId: string;
  contactId: string;
  channel: ChannelType;
  participants: string[]; // Agent IDs
  status: "active" | "archived" | "closed";
  lastMessage?: Message;
  lastMessageAt: Date;
  messageCount: number;
  unreadCount: number;
  assignedAgentId?: string;
  tags?: string[];
  ticketId?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

// Message Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string; // User ID or Contact ID
  senderType: "user" | "contact";
  content: string;
  contentType: "text" | "image" | "audio" | "video" | "file" | "template";
  status: MessageStatus;
  attachments?: MessageAttachment[];
  replyTo?: string; // Message ID
  reactions?: MessageReaction[];
  editedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  readBy?: {
    userId: string;
    readAt: Date;
  }[];
  metadata?: Record<string, any>;
}

export interface MessageAttachment {
  id: string;
  url: string;
  type: string; // MIME type
  name: string;
  size: number; // in bytes
  uploadedAt: Date;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt: Date;
}

// Ticket Types
export interface Ticket {
  id: string;
  teamId: string;
  conversationId?: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedAgentId?: string;
  contactId: string;
  tags?: string[];
  categories?: string[];
  customFields?: Record<string, any>;
  attachments?: MessageAttachment[];
  comments?: TicketComment[];
  sla?: SLAInfo;
  relatedTickets?: string[]; // Ticket IDs
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  metadata?: Record<string, any>;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  isInternal: boolean;
  attachments?: MessageAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SLAInfo {
  responseTime: number; // in minutes
  resolutionTime: number; // in minutes
  respondedAt?: Date;
  status: SLAStatus;
  breachedAt?: Date;
}

// Call Types
export interface CallRecord {
  id: string;
  teamId: string;
  agentId: string;
  contactId: string;
  direction: "inbound" | "outbound";
  status: CallStatus;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  recordingUrl?: string;
  voicemail?: Voicemail;
  dialpadInput?: string;
  notes?: string;
  transcription?: CallTranscription;
  metadata?: Record<string, any>;
}

export interface Voicemail {
  id: string;
  audioUrl: string;
  duration: number;
  transcription?: string;
  createdAt: Date;
}

export interface CallTranscription {
  text: string;
  confidence: number;
  segments: {
    speaker: "agent" | "customer";
    text: string;
    startTime: number;
    endTime: number;
  }[];
  keywords: string[];
  sentiment?: {
    overall: "positive" | "negative" | "neutral";
    score: number;
  };
}

// Analytics Types
export interface AnalyticsMetrics {
  teamId: string;
  date: Date;
  periodType: "daily" | "weekly" | "monthly";
  totalConversations: number;
  totalMessages: number;
  totalCalls: number;
  totalTickets: number;
  averageResponseTime: number; // in minutes
  averageResolutionTime: number; // in minutes
  customerSatisfaction: number; // 0-100
  agentProductivity: Record<string, AgentMetrics>;
  channelMetrics: Record<ChannelType, ChannelMetrics>;
}

export interface AgentMetrics {
  agentId: string;
  handledConversations: number;
  handledTickets: number;
  averageHandleTime: number;
  customerRating: number;
  slaCompliance: number; // percentage
}

export interface ChannelMetrics {
  channel: ChannelType;
  messageCount: number;
  conversationCount: number;
  averageResponseTime: number;
  satisfactionScore: number;
}

// Template Types
export interface MessageTemplate {
  id: string;
  teamId: string;
  name: string;
  category?: string;
  content: string;
  variables?: TemplateVariable[];
  channels: ChannelType[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  defaultValue?: string;
  placeholder: string;
  required: boolean;
}

// Ticket Template Types
export interface TicketTemplate {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  category: string;
  priority: TicketPriority;
  status?: TicketStatus;
  tags?: string[];
  categories?: string[];
  defaultAssigneeId?: string;
  customFields?: TicketTemplateField[];
  responseTemplate?: string;
  slaOverride?: SLAInfo;
  isActive: boolean;
  isFavorite: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface TicketTemplateField {
  name: string;
  type: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  defaultValue?: any;
  options?: Array<{ label: string; value: string }>;
}

// Advanced Filter Types
export interface FilterCriteria {
  id: string;
  name: string;
  description?: string;
  status: TicketStatus[];
  priority: TicketPriority[];
  assignedAgentId?: string[];
  contactId?: string[];
  tags?: string[];
  categories?: string[];
  dateRange?: DateRange;
  slaStatus?: SLAStatus[];
  customFields?: CustomFieldFilter[];
  searchQuery?: string;
  isDefault?: boolean;
  isPinned?: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DateRange {
  startDate?: Date;
  endDate?: Date;
  type?: 'created' | 'updated' | 'resolved' | 'closed';
}

export interface CustomFieldFilter {
  fieldName: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between';
  value: any;
  value2?: any;
}

export interface FilterPreset {
  id: string;
  teamId: string;
  name: string;
  criteria: FilterCriteria;
  resultCount?: number;
  lastUsedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterResult {
  tickets: Ticket[];
  total: number;
  appliedFilters: string[];
  executedAt: Date;
}

// Automation Rule Types
export interface AutomationRule {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number; // 1-10, higher = execute first
  triggers: RuleTrigger[];
  conditions: RuleCondition[];
  actions: RuleAction[];
  executionLog?: RuleExecution[];
  lastExecutedAt?: Date;
  executeCount: number;
  errorCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export type RuleTriggerType = 'ticket_created' | 'ticket_updated' | 'ticket_assigned' | 'ticket_status_changed' | 'sla_warning' | 'sla_breached' | 'comment_added' | 'tag_added';

export interface RuleTrigger {
  type: RuleTriggerType;
  delay?: number; // in minutes
  metadata?: Record<string, any>;
}

export type RuleConditionOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'starts_with' | 'ends_with';

export interface RuleCondition {
  id: string;
  field: string; // ticket.priority, ticket.status, ticket.assignedAgentId, etc.
  operator: RuleConditionOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR'; // for multi-condition logic
}

export type RuleActionType = 'assign' | 'set_priority' | 'set_status' | 'add_tag' | 'remove_tag' | 'add_category' | 'send_notification' | 'set_custom_field' | 'create_related_ticket' | 'update_sla';

export interface RuleAction {
  type: RuleActionType;
  targetValue?: any; // what to assign/set/add
  notificationTemplate?: string;
  customData?: Record<string, any>;
}

export interface RuleExecution {
  id: string;
  ruleId: string;
  ticketId: string;
  triggeredAt: Date;
  status: 'success' | 'failed' | 'skipped';
  executedActions: number;
  failedActions: number;
  error?: string;
  metadata?: Record<string, any>;
}

// Integration Types
export interface Integration {
  id: string;
  teamId: string;
  type: string; // "whatsapp", "email", "twilio", etc.
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  credentials?: IntegrationCredentials;
  createdAt: Date;
  updatedAt: Date;
  lastSyncAt?: Date;
}

export interface IntegrationCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  webhookUrl?: string;
  encryptedAt?: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: Date;
  requestId: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Auth Types
export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number; // in seconds
}

export interface Session {
  user: User;
  token: AuthToken;
  expiresAt: Date;
}

// Error Types
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "AppError";
  }
}

// State Management Types
export interface AppState {
  isLoading: boolean;
  error: AppError | null;
  notification: Notification | null;
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
