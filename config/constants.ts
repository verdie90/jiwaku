// User Roles and Permissions
export type UserRole = "super_admin" | "admin" | "team_lead" | "agent" | "viewer";

export interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  admin: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, Record<string, Permission>> = {
  super_admin: {
    users: { view: true, create: true, edit: true, delete: true, export: true, admin: true },
    teams: { view: true, create: true, edit: true, delete: true, export: true, admin: true },
    conversations: { view: true, create: true, edit: true, delete: true, export: true, admin: true },
    tickets: { view: true, create: true, edit: true, delete: true, export: true, admin: true },
    analytics: { view: true, create: true, edit: true, delete: true, export: true, admin: true },
    settings: { view: true, create: true, edit: true, delete: true, export: true, admin: true },
    billing: { view: true, create: true, edit: true, delete: true, export: true, admin: true },
  },
  admin: {
    users: { view: true, create: true, edit: true, delete: true, export: true, admin: false },
    teams: { view: true, create: true, edit: true, delete: false, export: true, admin: false },
    conversations: { view: true, create: true, edit: true, delete: true, export: true, admin: false },
    tickets: { view: true, create: true, edit: true, delete: true, export: true, admin: false },
    analytics: { view: true, create: false, edit: false, delete: false, export: true, admin: false },
    settings: { view: true, create: true, edit: true, delete: false, export: false, admin: false },
    billing: { view: true, create: false, edit: false, delete: false, export: true, admin: false },
  },
  team_lead: {
    users: { view: true, create: false, edit: false, delete: false, export: true, admin: false },
    teams: { view: true, create: false, edit: true, delete: false, export: false, admin: false },
    conversations: { view: true, create: true, edit: true, delete: false, export: true, admin: false },
    tickets: { view: true, create: true, edit: true, delete: false, export: true, admin: false },
    analytics: { view: true, create: false, edit: false, delete: false, export: true, admin: false },
    settings: { view: true, create: false, edit: false, delete: false, export: false, admin: false },
    billing: { view: false, create: false, edit: false, delete: false, export: false, admin: false },
  },
  agent: {
    users: { view: false, create: false, edit: false, delete: false, export: false, admin: false },
    teams: { view: true, create: false, edit: false, delete: false, export: false, admin: false },
    conversations: { view: true, create: true, edit: true, delete: false, export: false, admin: false },
    tickets: { view: true, create: true, edit: true, delete: false, export: false, admin: false },
    analytics: { view: true, create: false, edit: false, delete: false, export: false, admin: false },
    settings: { view: false, create: false, edit: false, delete: false, export: false, admin: false },
    billing: { view: false, create: false, edit: false, delete: false, export: false, admin: false },
  },
  viewer: {
    users: { view: false, create: false, edit: false, delete: false, export: false, admin: false },
    teams: { view: true, create: false, edit: false, delete: false, export: false, admin: false },
    conversations: { view: true, create: false, edit: false, delete: false, export: false, admin: false },
    tickets: { view: true, create: false, edit: false, delete: false, export: false, admin: false },
    analytics: { view: true, create: false, edit: false, delete: false, export: false, admin: false },
    settings: { view: false, create: false, edit: false, delete: false, export: false, admin: false },
    billing: { view: false, create: false, edit: false, delete: false, export: false, admin: false },
  },
};

// Channel Types
export enum ChannelType {
  WHATSAPP = "whatsapp",
  EMAIL = "email",
  PHONE = "phone",
  WEB_CHAT = "web_chat",
  SMS = "sms",
}

// Message Status
export enum MessageStatus {
  SENDING = "sending",
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
}

// Ticket Status
export enum TicketStatus {
  OPEN = "open",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  WAITING = "waiting",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

// Ticket Priority
export enum TicketPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

// Call Status
export enum CallStatus {
  IDLE = "idle",
  RINGING = "ringing",
  CONNECTED = "connected",
  ON_HOLD = "on_hold",
  DISCONNECTED = "disconnected",
}

// Agent Status
export enum AgentStatus {
  ONLINE = "online",
  AWAY = "away",
  BUSY = "busy",
  OFFLINE = "offline",
  ON_BREAK = "on_break",
}

// SLA Status
export enum SLAStatus {
  WITHIN = "within",
  AT_RISK = "at_risk",
  BREACHED = "breached",
}
