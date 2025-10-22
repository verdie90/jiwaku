// Aplikasi Constants
export const APP_NAME = "Jiwaku CRM";
export const APP_DESCRIPTION = "AI-Powered Omnichannel CRM Platform";

// API Endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Timeouts
export const QUERY_TIMEOUT = 10000; // 10 seconds
export const REQUEST_TIMEOUT = 30000; // 30 seconds
export const SOCKET_TIMEOUT = 5000; // 5 seconds

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Search
export const MIN_SEARCH_LENGTH = 2;
export const MAX_SEARCH_RESULTS = 50;

// File Upload
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "video/mp4",
  "video/mpeg",
  "audio/mpeg",
  "audio/wav",
];

// Cache Duration (in seconds)
export const CACHE_DURATION = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 15 * 60, // 15 minutes
  LONG: 60 * 60, // 1 hour
  VERY_LONG: 24 * 60 * 60, // 24 hours
};

// Retry Configuration
export const RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

// Real-time Events
export const REAL_TIME_EVENTS = {
  MESSAGE_CREATED: "message:created",
  MESSAGE_UPDATED: "message:updated",
  MESSAGE_DELETED: "message:deleted",
  CONVERSATION_CREATED: "conversation:created",
  CONVERSATION_UPDATED: "conversation:updated",
  AGENT_STATUS_CHANGED: "agent:status_changed",
  TICKET_CREATED: "ticket:created",
  TICKET_UPDATED: "ticket:updated",
  CALL_STARTED: "call:started",
  CALL_ENDED: "call:ended",
  USER_JOINED: "user:joined",
  USER_LEFT: "user:left",
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",
} as const;

// Phone Format
export const PHONE_REGEX = /^(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
export const PHONE_FORMAT_PLACEHOLDER = "+1 (555) 000-0000";

// Email Validation
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// URL Validation
export const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

// Breakpoints
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

// Z-Index Scale
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  modal: 1100,
  popover: 1200,
  tooltip: 1300,
  notification: 1400,
};
