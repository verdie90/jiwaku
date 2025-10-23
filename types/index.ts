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

// Webhook Types
export type WebhookEventType = 
  | 'ticket.created'
  | 'ticket.updated'
  | 'ticket.status_changed'
  | 'ticket.priority_changed'
  | 'ticket.assigned'
  | 'ticket.commented'
  | 'ticket.resolved'
  | 'ticket.closed'
  | 'contact.created'
  | 'contact.updated'
  | 'contact.deleted'
  | 'conversation.started'
  | 'conversation.ended'
  | 'automation_rule.executed'
  | 'automation_rule.failed'
  | 'message.received'
  | 'message.sent'
  | 'sla.breached';

export interface WebhookEndpoint {
  id: string;
  teamId: string;
  name: string;
  url: string;
  description?: string;
  events: WebhookEventType[];
  isActive: boolean;
  isVerified: boolean;
  headers?: Record<string, string>;
  secret?: string; // HMAC secret for signing
  maxRetries: number;
  retryDelaySeconds: number;
  timeout: number; // milliseconds
  rateLimit: number; // requests per minute
  filters?: WebhookFilter[];
  metadata?: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastTriggeredAt?: Date;
  lastErrorAt?: Date;
  lastErrorMessage?: string;
}

export interface WebhookFilter {
  field: string; // e.g., 'ticket.priority', 'ticket.status'
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'regex';
  value: any;
}

export interface WebhookPayload {
  id: string;
  timestamp: Date;
  event: WebhookEventType;
  teamId: string;
  data: Record<string, any>;
  previousData?: Record<string, any>; // For update events
  metadata?: {
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  payloadId: string;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  attempt: number;
  maxAttempts: number;
  requestBody?: string;
  responseStatus?: number;
  responseBody?: string;
  error?: string;
  nextRetryAt?: Date;
  createdAt: Date;
  deliveredAt?: Date;
  duration?: number; // milliseconds
}

export interface WebhookSignature {
  timestamp: number;
  signature: string;
}

export interface WebhookTest {
  id: string;
  webhookId: string;
  eventType: WebhookEventType;
  payload: WebhookPayload;
  status: 'success' | 'failed' | 'timeout';
  responseStatus?: number;
  responseBody?: string;
  error?: string;
  duration: number; // milliseconds
  createdAt: Date;
}

// Analytics Types
export interface TicketMetrics {
  teamId: string;
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  
  // Volume Metrics
  totalTickets: number;
  createdTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  reopenedTickets: number;
  
  // Status Distribution
  statusDistribution: Record<TicketStatus, number>;
  
  // Priority Distribution
  priorityDistribution: Record<TicketPriority, number>;
  
  // Time Metrics
  avgResolutionTime: number; // milliseconds
  avgResponseTime: number; // milliseconds
  medianResolutionTime: number;
  medianResponseTime: number;
  
  // SLA Metrics
  slaComplianceRate: number; // percentage
  slaBreachCount: number;
  
  // Category Metrics
  topCategories: Array<{ category: string; count: number }>;
  
  // Tag Metrics
  topTags: Array<{ tag: string; count: number }>;
  
  // Agent Performance
  agentPerformance: AgentMetric[];
  
  // Satisfaction (if available)
  avgSatisfactionScore?: number;
  totalSurveyResponses?: number;
}

export interface AgentMetric {
  agentId: string;
  agentName: string;
  ticketsAssigned: number;
  ticketsResolved: number;
  ticketsClosed: number;
  avgResolutionTime: number;
  slaComplianceRate: number;
  satisfactionScore?: number;
}

export interface KPIMetric {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  type: 'count' | 'percentage' | 'time' | 'average' | 'ratio';
  category: 'volume' | 'performance' | 'quality' | 'sla' | 'satisfaction';
  
  // Current Value
  currentValue: number;
  previousValue: number;
  change: number; // absolute change
  changePercent: number; // percentage change
  trend: 'up' | 'down' | 'stable';
  
  // Thresholds
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  status: 'healthy' | 'warning' | 'critical';
  
  // Calculation
  formula?: string;
  lastCalculatedAt: Date;
}

export interface AnalyticsReport {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  type: 'summary' | 'detailed' | 'comparison' | 'trend';
  metrics: TicketMetrics;
  kpis: KPIMetric[];
  
  // Report Details
  generatedBy: string;
  generatedAt: Date;
  period: {
    startDate: Date;
    endDate: Date;
    label: string;
  };
  
  // Sharing
  isPublic: boolean;
  sharedWith?: string[];
  
  // Customization
  filters?: AnalyticsFilter[];
  groupBy?: 'day' | 'week' | 'month' | 'priority' | 'agent' | 'category';
  
  metadata?: Record<string, any>;
}

export interface AnalyticsFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;
}

export interface TrendData {
  date: Date;
  value: number;
  cumulative?: number;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  fill?: boolean;
  tension?: number;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  title: string;
  labels: string[];
  datasets: ChartDataset[];
  options?: Record<string, any>;
}

export interface AnalyticsDateRange {
  period: 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate: Date;
  endDate: Date;
  label: string;
}

// ==================== CUSTOMER PORTAL TYPES (Phase 4 Part 1) ====================

// Portal User - Customer/Client representation
export interface PortalUser {
  id: string;
  teamId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  company?: string;
  role: 'customer' | 'manager' | 'admin'; // Portal-specific roles
  status: 'active' | 'inactive' | 'suspended';
  
  // Portal Access
  portalAccessEnabled: boolean;
  portalPassword?: string; // Hash
  portalLastLogin?: Date;
  portalLoginAttempts: number;
  
  // Preferences
  preferences?: PortalUserPreferences;
  
  // Metadata
  linkedContactId?: string; // Link to Contact entity
  linkedUserId?: string; // Link to internal User
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface PortalUserPreferences {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  ticketUpdateNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  showCompletedTickets: boolean;
  itemsPerPage: number;
}

// Portal Ticket - Customer view of ticket
export interface PortalTicket {
  id: string;
  teamId: string;
  ticketId: string; // Link to internal ticket
  portalUserId: string;
  
  // Basic Info
  title: string;
  description: string;
  category?: string;
  
  // Status & Progress
  status: TicketStatus;
  priority: TicketPriority;
  progress: number; // 0-100
  
  // SLA Information
  slaStatus?: SLAStatus;
  slaDeadline?: Date;
  slaBreached: boolean;
  
  // Communication
  commentCount: number;
  lastComment?: {
    author: string;
    authorType: 'customer' | 'agent';
    content: string;
    createdAt: Date;
  };
  lastUpdateAt: Date;
  
  // Assignment
  assignedAgentId?: string;
  assignedAgentName?: string;
  
  // Visibility
  visibility: 'public' | 'private'; // Can customer see ticket details
  allowComments: boolean;
  
  // Attachments
  attachmentCount: number;
  
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

// Portal Ticket Comment
export interface PortalTicketComment {
  id: string;
  ticketId: string;
  portalTicketId: string;
  teamId: string;
  
  authorId: string;
  authorType: 'customer' | 'agent';
  authorName: string;
  
  content: string;
  isInternal: boolean; // Invisible to customers if true
  
  attachments?: string[]; // File URLs
  
  status: 'published' | 'draft' | 'deleted';
  
  createdAt: Date;
  updatedAt: Date;
}

// Portal Feedback/Survey
export interface PortalFeedback {
  id: string;
  teamId: string;
  ticketId: string;
  portalUserId: string;
  
  // Rating
  overallRating: number; // 1-5
  responseTimeRating?: number;
  resolutionQualityRating?: number;
  professionalismnRating?: number;
  
  // Comments
  comment?: string;
  improvementSuggestions?: string;
  
  // Sentiment
  sentiment?: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  
  // NPS
  npsScore?: number; // 0-10
  recommendationLikelihood?: string; // Would recommend reason
  
  status: 'submitted' | 'pending' | 'reviewed';
  reviewedBy?: string;
  reviewedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// Portal Settings - Team configuration for customer portal
export interface PortalSettings {
  id: string;
  teamId: string;
  
  // Portal Access
  portalEnabled: boolean;
  portalUrl: string;
  
  // Branding
  portalName: string;
  portalLogo?: string;
  portalHeaderColor: string;
  portalFooterText?: string;
  
  // Features
  enableSelfService: boolean;
  enableFAQ: boolean;
  enableKnowledgeBase: boolean;
  enableCommunity: boolean;
  enableFeedback: boolean;
  enableSelfServiceTicketCreation: boolean;
  
  // Registration
  requireApproval: boolean;
  allowSignup: boolean;
  defaultRole: 'customer' | 'manager';
  
  // Communication
  defaultLanguage: string;
  supportedLanguages: string[];
  emailNotificationEnabled: boolean;
  
  // Policies
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
  passwordRequireSpecialChar: boolean;
  maxLoginAttempts: number;
  
  // Navigation
  showTicketHistory: boolean;
  showKnowledgeBase: boolean;
  showSupportContact: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// Portal Dashboard Stats
export interface PortalDashboardStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  pendingTickets: number;
  averageResolutionTime: number;
  lastTicketCreated?: Date;
  unreadCommentsCount: number;
  averageRating?: number;
}

// Portal Activity Log
export interface PortalActivity {
  id: string;
  teamId: string;
  portalUserId: string;
  
  action: 'login' | 'logout' | 'create_ticket' | 'comment' | 'upload' | 'download' | 'view' | 'submit_feedback';
  actionDescription: string;
  
  resourceType?: string; // 'ticket', 'comment', 'feedback'
  resourceId?: string;
  
  ipAddress?: string;
  userAgent?: string;
  
  success: boolean;
  errorMessage?: string;
  
  createdAt: Date;
}

// Portal Notification
export interface PortalNotification {
  id: string;
  teamId: string;
  portalUserId: string;
  
  type: 'ticket_update' | 'comment' | 'status_change' | 'sla_warning' | 'feedback_request' | 'system';
  title: string;
  message: string;
  
  relatedTicketId?: string;
  actionUrl?: string;
  
  isRead: boolean;
  readAt?: Date;
  
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  createdAt: Date;
  expiresAt?: Date;
}

// Self-Service FAQ/Knowledge Base
export interface PortalKnowledgeBase {
  id: string;
  teamId: string;
  
  title: string;
  slug: string;
  category: string;
  description: string;
  content: string;
  
  // Metadata
  author: string;
  tags: string[];
  searchKeywords: string[];
  
  // Engagement
  views: number;
  helpful: number;
  notHelpful: number;
  
  // Status
  status: 'published' | 'draft' | 'archived';
  featured: boolean;
  
  // Related
  relatedArticles?: string[]; // KB IDs
  relatedCategories?: string[];
  
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// Self-Service Ticket Form
export interface PortalTicketForm {
  id: string;
  teamId: string;
  
  name: string;
  description?: string;
  
  // Form Fields
  fields: PortalFormField[];
  
  // Routing
  autoAssignCategory?: string;
  autoAssignPriority?: TicketPriority;
  
  // Status
  enabled: boolean;
  
  // Analytics
  submissionCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface PortalFormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'phone' | 'select' | 'checkbox' | 'file' | 'date';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[]; // For select type
  validation?: PortalFieldValidation;
  order: number;
}

export interface PortalFieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customValidator?: string;
}

// ============================================================================
// SLA CONFIGURATION SYSTEM
// ============================================================================

// SLA Policy Definition
export interface SLAPolicy {
  id: string;
  teamId: string;
  
  // Basic Info
  name: string;
  description?: string;
  
  // Conditions
  applicable: {
    priorityLevels: TicketPriority[]; // Which priorities this applies to
    channels?: ChannelType[]; // Which channels
    categories?: string[]; // Ticket categories
    customerSegments?: string[]; // Customer types
  };
  
  // Response & Resolution Times
  responseTime: {
    value: number; // in minutes
    priority: 'high' | 'medium' | 'low';
  };
  
  resolutionTime: {
    value: number; // in minutes
    priority: 'high' | 'medium' | 'low';
  };
  
  // Escalation Rules
  escalationRules: EscalationRule[];
  
  // Notifications
  notifyOnApproach: boolean;
  notifyOnBreach: boolean;
  notificationThreshold: number; // % before deadline
  
  // Status
  enabled: boolean;
  isDefault?: boolean;
  
  // Auditing
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// Escalation Rule for SLA breaches
export interface EscalationRule {
  id: string;
  
  // Trigger
  triggerEvent: 'response_warning' | 'response_breach' | 'resolution_warning' | 'resolution_breach' | 'manual' | 'time_based';
  triggerCondition?: {
    field?: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
    value?: any;
  };
  
  // Timeline
  delayMinutes: number; // Wait X minutes before escalating
  
  // Actions
  actions: EscalationAction[];
  
  // Status
  enabled: boolean;
  order: number;
  
  // Auditing
  createdAt: Date;
  updatedAt: Date;
}

// Actions triggered on escalation
export interface EscalationAction {
  id: string;
  type: 'assign_to_manager' | 'notify_manager' | 'notify_team' | 'priority_increase' | 'send_email' | 'webhook' | 'create_task';
  
  // Configuration by type
  config: {
    targetUserId?: string; // For assign/notify
    emailTemplate?: string; // For email
    webhookUrl?: string; // For webhook
    increaseBy?: number; // For priority increase (1-5)
    taskTemplate?: string; // For task creation
    customMessage?: string;
  };
  
  // Status
  enabled: boolean;
  order: number;
}

// SLA Email Template
export interface SLAEmailTemplate {
  id: string;
  teamId: string;
  
  // Basic Info
  name: string;
  description?: string;
  
  // Email Content
  subject: string;
  htmlBody: string;
  plainTextBody?: string;
  
  // Template Variables
  availableVariables: string[]; // {{ticket.id}}, {{customer.name}}, {{sla.name}}, etc
  
  // Usage
  triggerType: 'response_warning' | 'response_breach' | 'resolution_warning' | 'resolution_breach' | 'escalation' | 'custom';
  usedByPolicies: string[]; // SLA Policy IDs
  
  // Status
  enabled: boolean;
  isDefault?: boolean;
  
  // Auditing
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// SLA Metrics & Tracking
export interface SLAMetrics {
  id: string;
  teamId: string;
  ticketId: string;
  
  // Policy Applied
  policyId: string;
  policyName: string;
  
  // Deadlines
  responseDeadline: Date;
  resolutionDeadline: Date;
  
  // Status
  responseMetSLA: boolean;
  responseMetAt?: Date; // When response SLA was met
  
  resolutionMetSLA: boolean;
  resolutionMetAt?: Date; // When resolution SLA was met
  
  // Violations
  responseBreached: boolean;
  responseBreachAt?: Date;
  responseBreachDurationMinutes?: number;
  
  resolutionBreached: boolean;
  resolutionBreachAt?: Date;
  resolutionBreachDurationMinutes?: number;
  
  // Escalations
  escalationsTriggered: SLAEscalationLog[];
  
  // Current Status
  status: 'pending' | 'at_risk' | 'met' | 'breached' | 'resolved';
  progressPercentage: number; // 0-100% towards deadline
  
  // Warning Status
  isWarningIssued: boolean;
  warningIssuedAt?: Date;
  
  // Auditing
  createdAt: Date;
  updatedAt: Date;
}

// Log of SLA escalations
export interface SLAEscalationLog {
  id: string;
  
  // Escalation Details
  ruleId: string;
  ruleName: string;
  reason: 'response_warning' | 'response_breach' | 'resolution_warning' | 'resolution_breach' | 'manual' | 'time_based';
  
  // Actions Taken
  actionsTaken: {
    type: string;
    config: Record<string, any>;
    result: 'success' | 'failed' | 'pending';
    resultMessage?: string;
  }[];
  
  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  
  // Metadata
  triggeredBy: string; // User ID or 'system'
  createdAt: Date;
  completedAt?: Date;
}

// SLA Dashboard Statistics
export interface SLADashboardStats {
  id: string;
  teamId: string;
  
  // Overview
  totalTicketsWithSLA: number;
  slaMetTickets: number;
  slaBreachedTickets: number;
  atRiskTickets: number;
  
  // Performance
  overallSLAComplianceRate: number; // 0-100%
  averageResponseTimeMinutes: number;
  averageResolutionTimeMinutes: number;
  
  // By Priority
  byPriority: {
    priority: TicketPriority;
    totalTickets: number;
    metSLA: number;
    breachedSLA: number;
    complianceRate: number;
  }[];
  
  // By Policy
  byPolicy: {
    policyId: string;
    policyName: string;
    totalTickets: number;
    metSLA: number;
    breachedSLA: number;
    complianceRate: number;
  }[];
  
  // Trends
  trend: {
    date: Date;
    complianceRate: number;
    ticketsCreated: number;
    breaches: number;
  }[];
  
  // Time Period
  periodStart: Date;
  periodEnd: Date;
  
  // Last Updated
  updatedAt: Date;
}

// SLA History/Audit
export interface SLAAuditLog {
  id: string;
  teamId: string;
  ticketId?: string;
  policyId?: string;
  
  // Action
  action: 'create_policy' | 'update_policy' | 'delete_policy' | 'enable_policy' | 'disable_policy' | 'breach_detected' | 'escalation_triggered' | 'create_template' | 'update_template' | 'delete_template';
  
  // Details
  details: Record<string, any>;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  
  // User Info
  performedBy: string;
  performedByRole?: UserRole;
  
  // Timestamp
  createdAt: Date;
}

// SLA Configuration Settings
export interface SLAConfiguration {
  id: string;
  teamId: string;
  
  // Global Settings
  slaEnabled: boolean;
  defaultResponseTimeMinutes: number;
  defaultResolutionTimeMinutes: number;
  
  // Escalation
  enableEscalation: boolean;
  escalationNotifyManagers: boolean;
  escalationNotifyTeam: boolean;
  
  // Notifications
  enableBreachNotifications: boolean;
  enableWarningNotifications: boolean;
  warningThresholdPercentage: number; // Notify when X% towards deadline
  
  // Timezone
  businessHoursOnly: boolean; // Only count business hours
  timezone: string;
  businessHours: {
    dayOfWeek: number; // 0-6, Monday-Sunday
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  }[];
  
  // Holidays
  holidays: string[]; // ISO dates to exclude from SLA calculations
  
  // Reporting
  enableSLAReports: boolean;
  reportGenerationFrequency: 'daily' | 'weekly' | 'monthly';
  reportRecipients: string[]; // Email addresses
  
  // Audit
  auditLogRetentionDays: number;
  
  // Status
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

// ============================================================================
// CUSTOM REPORTS SYSTEM
// ============================================================================

// Report Template/Definition
export interface Report {
  id: string;
  teamId: string;
  
  // Basic Info
  name: string;
  description?: string;
  category: 'tickets' | 'agents' | 'customers' | 'sla' | 'revenue' | 'custom';
  
  // Metrics Selection
  metrics: ReportMetric[];
  
  // Filtering
  filters: ReportFilter[];
  
  // Grouping & Aggregation
  groupBy?: 'daily' | 'weekly' | 'monthly' | 'priority' | 'agent' | 'category' | 'channel' | 'custom';
  aggregation?: 'sum' | 'average' | 'count' | 'min' | 'max' | 'percentage';
  
  // Chart Configuration
  chartType: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'table' | 'heatmap' | 'none';
  chartConfig?: ReportChartConfig;
  
  // Comparison
  compareWith?: 'previous_period' | 'previous_year' | 'custom_date_range';
  comparisonDateRange?: {
    start: Date;
    end: Date;
  };
  
  // Scheduling
  schedule?: ReportSchedule;
  
  // Recipients
  recipients: string[]; // Email addresses
  
  // Export Options
  exportFormats: ('pdf' | 'excel' | 'csv' | 'json')[];
  
  // Status
  enabled: boolean;
  isTemplate: boolean;
  
  // Auditing
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Report Metric
export interface ReportMetric {
  id: string;
  name: string;
  type: 'count' | 'sum' | 'average' | 'percentage' | 'duration' | 'rate' | 'custom';
  dataSource: 'tickets' | 'agents' | 'customers' | 'sla' | 'revenue' | 'webhook' | 'custom';
  field: string; // Field to aggregate (e.g., 'createdAt', 'priority', 'status')
  
  // Calculations
  calculation?: {
    operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'percentage_change';
    operand?: number;
    relativeMetricId?: string;
  };
  
  // Formatting
  format?: 'number' | 'currency' | 'percentage' | 'duration' | 'date' | 'text';
  formatOptions?: {
    decimalPlaces?: number;
    currencySymbol?: string;
    includeThousandsSeparator?: boolean;
  };
  
  // Display
  displayName: string;
  description?: string;
  order: number;
  visible: boolean;
  width?: number; // For table columns
}

// Report Filter
export interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in' | 'is_null' | 'is_not_null';
  value?: any;
  values?: any[]; // For 'in' and 'not_in' operators
  rangeStart?: any; // For 'between'
  rangeEnd?: any;
  
  // Logical
  logicalOperator?: 'and' | 'or';
  order: number;
}

// Report Chart Configuration
export interface ReportChartConfig {
  title?: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showGridLines?: boolean;
  showValues?: boolean;
  colors?: string[]; // Custom color scheme
  stacked?: boolean;
  responsive?: boolean;
  height?: number;
  showTrendline?: boolean;
  animation?: boolean;
}

// Report Schedule
export interface ReportSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  dayOfWeek?: number; // 0-6 for weekly, 1-7 for monthly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:mm format
  timezone: string;
  recipients: string[]; // Override default recipients
  includeAttachment: boolean;
  messageTemplate?: string;
  enabled_: boolean;
  nextRunTime?: Date;
}

// Generated Report/Execution
export interface ReportExecution {
  id: string;
  teamId: string;
  reportId: string;
  
  // Metadata
  reportName: string;
  generatedAt: Date;
  generatedBy: string;
  
  // Time Period
  startDate: Date;
  endDate: Date;
  
  // Data
  data: ReportData;
  
  // Summary
  summary: ReportSummary;
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  
  // File References
  fileUrls?: {
    pdf?: string;
    excel?: string;
    csv?: string;
    json?: string;
  };
  
  // Audit
  executionTime: number; // milliseconds
  rowsProcessed: number;
}

// Report Data (Results)
export interface ReportData {
  rows: Record<string, any>[];
  columns: ReportColumn[];
  metadata: {
    totalRows: number;
    filteredRows: number;
    groupCount?: number;
  };
}

// Report Column Definition
export interface ReportColumn {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'currency';
  sortable: boolean;
  filterable: boolean;
  width?: number;
}

// Report Summary Statistics
export interface ReportSummary {
  totalRecords: number;
  filteredRecords: number;
  averageValues?: Record<string, number>;
  sumValues?: Record<string, number>;
  minValues?: Record<string, number>;
  maxValues?: Record<string, number>;
  percentageChange?: Record<string, number>;
  comparisonData?: {
    previousPeriodTotal: number;
    percentageChangeFromPrevious: number;
    trend: 'up' | 'down' | 'neutral';
  };
  keyInsights?: string[]; // AI-generated insights
}

// Report Visualization
export interface ReportVisualization {
  id: string;
  teamId: string;
  reportId: string;
  executionId: string;
  
  // Chart Data
  chartType: string;
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }[];
  };
  
  // Metrics
  metrics: {
    name: string;
    value: number;
    format: string;
    trend?: 'up' | 'down' | 'neutral';
    percentageChange?: number;
  }[];
  
  // Table Data (for table charts)
  tableData?: {
    headers: string[];
    rows: (string | number)[][];
  };
  
  // Created
  createdAt: Date;
}

// Report Scheduling History
export interface ReportScheduleExecution {
  id: string;
  teamId: string;
  scheduleId: string;
  reportId: string;
  
  // Execution Details
  executionTime: Date;
  completedAt?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  errorMessage?: string;
  
  // Results
  executionId?: string;
  emailsSent?: number;
  emailsFailed?: number;
  
  // Log
  logs: {
    timestamp: Date;
    message: string;
    level: 'info' | 'warning' | 'error';
  }[];
}

// Report Settings (Team-level)
export interface ReportSettings {
  id: string;
  teamId: string;
  
  // Global Settings
  reportsEnabled: boolean;
  maxReportsPerTeam: number;
  maxScheduledReports: number;
  
  // Default Formats
  defaultExportFormat: 'pdf' | 'excel' | 'csv' | 'json';
  defaultChartType: 'line' | 'bar' | 'pie';
  
  // Scheduling
  enableScheduling: boolean;
  maxScheduledExecutionsPerDay: number;
  
  // Performance
  maxRowsPerReport: number;
  defaultCacheTime: number; // minutes
  
  // Recipients
  maxRecipientsPerReport: number;
  allowExternalRecipients: boolean;
  
  // Storage
  reportRetentionDays: number;
  
  // Audit
  auditReportAccess: boolean;
  
  // Status
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

// Report Access Log
export interface ReportAccessLog {
  id: string;
  teamId: string;
  reportId: string;
  executionId?: string;
  
  // Access Info
  accessedBy: string;
  accessedAt: Date;
  
  // Action
  action: 'view' | 'download' | 'edit' | 'delete' | 'schedule' | 'share' | 'export';
  
  // Details
  format?: string; // For download/export
  ipAddress?: string;
  userAgent?: string;
  
  // Status
  success: boolean;
  errorMessage?: string;
}

// ============================================================================
// INTEGRATION TYPES EXTENSIONS (Phase 4 Part 4)
// ============================================================================

/**
 * API Key Interface
 * For managing API access to the system
 */
export interface APIKey {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  key: string; // Hashed key (only shown at creation)
  prefix: string; // Public prefix for identification
  
  // Permissions
  scopes: APIScope[];
  
  // Rate Limiting
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  
  // Usage
  lastUsedAt?: Date;
  usageCount: number;
  
  // Status
  enabled: boolean;
  expiresAt?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  ipWhitelist?: string[];
}

/**
 * API Scope - Permission level for API keys
 */
export type APIScope = 
  | 'reports:read'
  | 'reports:write'
  | 'reports:execute'
  | 'reports:export'
  | 'reports:schedule'
  | 'contacts:read'
  | 'contacts:write'
  | 'tickets:read'
  | 'tickets:write'
  | 'tickets:comment'
  | 'tickets:resolve'
  | 'agents:read'
  | 'agents:write'
  | 'webhooks:manage'
  | 'integrations:read'
  | 'integrations:write'
  | 'admin:full';

/**
 * Third-Party OAuth
 * For OAuth-based integrations
 */
export interface ThirdPartyOAuth {
  id: string;
  teamId: string;
  provider: 'salesforce' | 'hubspot' | 'slack' | 'microsoft' | 'google' | 'custom';
  
  // OAuth Tokens
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  
  // User Info
  userEmail: string;
  userId: string;
  userName?: string;
  
  // Expiration
  expiresAt: Date;
  isExpired: boolean;
  
  // Scope
  scopes: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
}

/**
 * Integration Request Log
 * Audit trail for integration requests
 */
export interface IntegrationRequestLog {
  id: string;
  teamId: string;
  integrationId: string;
  
  // Request
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  path?: string;
  
  // Details
  requestSize?: number;
  responseSize?: number;
  statusCode?: number;
  
  // Performance
  startTime: Date;
  endTime: Date;
  durationMs: number;
  
  // Error Info
  error?: {
    code: string;
    message: string;
  };
  
  // Status
  success: boolean;
  
  // Metadata
  userId: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * REST API Endpoint
 * Configuration for exposing REST API
 */
export interface RESTAPIEndpoint {
  id: string;
  teamId: string;
  
  // Endpoint Definition
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  name: string;
  description?: string;
  
  // Access Control
  requiredScopes: APIScope[];
  rateLimit?: {
    requestsPerMinute: number;
  };
  
  // Request/Response
  requestSchema?: Record<string, any>;
  responseSchema?: Record<string, any>;
  
  // Handler
  handlerFunction: string;
  
  // Status
  enabled: boolean;
  public: boolean; // If true, no API key required
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  version?: string;
}

/**
 * GraphQL API Definition
 * For GraphQL endpoint configuration
 */
export interface GraphQLSchema {
  id: string;
  teamId: string;
  
  // Schema
  typeDefs: string;
  resolvers?: Record<string, any>;
  
  // Access Control
  requiredScopes: APIScope[];
  
  // Settings
  maxComplexity?: number;
  maxDepth?: number;
  enabled: boolean;
  
  // Introspection
  introspectionEnabled: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  version?: string;
}

/**
 * Integration Marketplace Item
 * For discovering available integrations
 */
export interface IntegrationMarketplaceItem {
  id: string;
  name: string;
  description: string;
  category: 'crm' | 'communication' | 'payment' | 'analytics' | 'automation' | 'other';
  
  // Metadata
  icon?: string;
  thumbnail?: string;
  website?: string;
  documentation?: string;
  
  // Setup
  setupUrl?: string;
  setupGuide?: string;
  
  // Status
  available: boolean;
  beta: boolean;
  
  // Integration Type
  integrationType: string;
  
  // Rating
  rating?: number; // 1-5
  reviewCount?: number;
  
  // Cost
  free: boolean;
  pricingUrl?: string;
}

/**
 * Sync Configuration
 * For bidirectional data synchronization
 */
export interface SyncConfiguration {
  id: string;
  teamId: string;
  integrationId: string;
  
  // Source and Target
  sourceResource: 'tickets' | 'contacts' | 'reports' | 'agents' | 'custom';
  targetResource: string;
  
  // Sync Settings
  direction: 'inbound' | 'outbound' | 'bidirectional';
  frequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'manual';
  
  // Field Mapping
  fieldMappings: SyncFieldMapping[];
  
  // Filtering
  filters?: {
    sourceFilters?: Record<string, any>;
    targetFilters?: Record<string, any>;
  };
  
  // Conflict Resolution
  conflictResolution: 'source-wins' | 'target-wins' | 'manual-review' | 'merge';
  
  // Status
  enabled: boolean;
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  
  // Metrics
  totalSyncAttempts: number;
  successfulSyncs: number;
  failedSyncs: number;
  
  // Error Handling
  errorHandling: 'skip' | 'block' | 'quarantine';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sync Field Mapping
 * Maps fields between source and target
 */
export interface SyncFieldMapping {
  sourceField: string;
  targetField: string;
  transformer?: string; // Function name or expression
  bidirectional: boolean;
  required: boolean;
}

