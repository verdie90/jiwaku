#!/usr/bin/env node

/**
 * Firestore Demo Data Seeding Script (Native Firebase SDK)
 * 
 * This script populates Firestore with comprehensive demo data for testing
 * the Jiwaku CRM Ticket Management System using Firebase API Key.
 * 
 * Usage:
 *   node scripts/seed-firestore.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);
const logError = (msg) => log(`❌ ${msg}`, 'red');
const logSuccess = (msg) => log(`✅ ${msg}`, 'green');
const logInfo = (msg) => log(`ℹ️  ${msg}`, 'cyan');
const logStep = (msg) => log(`\n${msg}`, 'bright');

// Initialize Firebase
function initializeFirebase() {
  logStep('🔧 Initializing Firebase with API Key...');
  
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  if (!config.apiKey || !config.projectId) {
    logError('Firebase configuration missing in .env.local');
    process.exit(1);
  }

  try {
    const app = initializeApp(config);
    const db = getFirestore(app);
    logSuccess('Firebase initialized');
    logInfo(`Project: ${config.projectId}`);
    return db;
  } catch (error) {
    logError(`Initialization failed: ${error.message}`);
    process.exit(1);
  }
}

// Helper to create past timestamps
function getDate(daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

// Demo data
const TEAMS = [{
  id: 'team-1',
  data: {
    name: 'Support Team',
    description: 'Customer support and issue management',
    ownerId: 'user-1',
    members: ['user-1', 'user-2', 'user-3', 'agent-1', 'agent-2', 'agent-3'],
    settings: { timezone: 'UTC', language: 'en', maxAgents: 10 },
    createdAt: getDate(30),
    updatedAt: new Date()
  }
}];

const CONTACTS = [
  {
    id: 'contact-1',
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@techcorp.com',
      phone: '+1-555-0101',
      company: 'Tech Corp',
      jobTitle: 'Engineering Manager',
      channels: [{ type: 'EMAIL', handle: 'john.doe@techcorp.com', verified: true }],
      conversationCount: 5,
      lastContactedAt: getDate(1),
      createdAt: getDate(7),
      updatedAt: new Date()
    }
  },
  {
    id: 'contact-2',
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@designstudio.com',
      phone: '+1-555-0102',
      company: 'Design Studio',
      jobTitle: 'UX Lead',
      channels: [
        { type: 'EMAIL', handle: 'jane.smith@designstudio.com', verified: true },
        { type: 'WHATSAPP', handle: '+1-555-0102', verified: true }
      ],
      conversationCount: 8,
      lastContactedAt: getDate(2),
      createdAt: getDate(14),
      updatedAt: new Date()
    }
  },
  {
    id: 'contact-3',
    data: {
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@marketinginc.com',
      phone: '+1-555-0103',
      company: 'Marketing Inc',
      jobTitle: 'Marketing Manager',
      channels: [{ type: 'EMAIL', handle: 'bob.johnson@marketinginc.com', verified: true }],
      conversationCount: 3,
      lastContactedAt: getDate(3),
      createdAt: getDate(21),
      updatedAt: new Date()
    }
  },
  {
    id: 'contact-4',
    data: {
      firstName: 'Alice',
      lastName: 'Williams',
      email: 'alice.williams@startupco.com',
      phone: '+1-555-0104',
      company: 'StartUp Co',
      jobTitle: 'Product Manager',
      channels: [
        { type: 'EMAIL', handle: 'alice.williams@startupco.com', verified: true },
        { type: 'WHATSAPP', handle: '+1-555-0104', verified: false }
      ],
      conversationCount: 12,
      lastContactedAt: getDate(0.5),
      createdAt: getDate(30),
      updatedAt: new Date()
    }
  },
  {
    id: 'contact-5',
    data: {
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie.brown@enterprise.com',
      phone: '+1-555-0105',
      company: 'Enterprise Solutions',
      jobTitle: 'CTO',
      channels: [{ type: 'EMAIL', handle: 'charlie.brown@enterprise.com', verified: true }],
      conversationCount: 15,
      lastContactedAt: getDate(1.5),
      createdAt: getDate(40),
      updatedAt: new Date()
    }
  }
];

const TICKETS = [
  {
    id: 'TKT-001',
    data: {
      teamId: 'team-1',
      contactId: 'contact-1',
      title: 'Login page not loading',
      description: 'Users unable to load the login page. Getting blank screen after clicking login button.',
      status: 'open',
      priority: 'high',
      tags: ['website', 'critical', 'frontend'],
      categories: ['Technical', 'Frontend'],
      comments: [
        { id: 'c1', authorId: 'agent-1', content: 'Investigating DNS and CDN', isInternal: false, createdAt: getDate(0.04) },
        { id: 'c2', authorId: 'user-1', content: 'Found CloudFlare DNS issue', isInternal: true, createdAt: getDate(0.02) }
      ],
      sla: { responseTime: 60, resolutionTime: 240, respondedAt: getDate(0.04), status: 'within' },
      createdAt: getDate(1),
      updatedAt: getDate(0.02)
    }
  },
  {
    id: 'TKT-002',
    data: {
      teamId: 'team-1',
      contactId: 'contact-2',
      title: 'Payment processing delays',
      description: 'Customers experiencing significant delays in payment confirmations.',
      status: 'in_progress',
      priority: 'urgent',
      assignedAgentId: 'agent-1',
      tags: ['payments', 'urgent', 'critical'],
      categories: ['Performance', 'Backend'],
      comments: [
        { id: 'c3', authorId: 'agent-1', content: 'Database query bottleneck identified', isInternal: true, createdAt: getDate(0.08) },
        { id: 'c4', authorId: 'user-2', content: 'Added database indexes', isInternal: true, createdAt: getDate(0.04) }
      ],
      sla: { responseTime: 15, resolutionTime: 120, respondedAt: getDate(0.08), status: 'within' },
      createdAt: getDate(2),
      updatedAt: getDate(0.04)
    }
  },
  {
    id: 'TKT-003',
    data: {
      teamId: 'team-1',
      contactId: 'contact-3',
      title: 'Email notifications not received',
      description: 'Users not receiving email notifications after account registration.',
      status: 'waiting',
      priority: 'medium',
      assignedAgentId: 'agent-2',
      tags: ['emails', 'notifications'],
      categories: ['Integration', 'Email'],
      comments: [
        { id: 'c5', authorId: 'agent-2', content: 'Checking email provider configuration', isInternal: false, createdAt: getDate(0.12) }
      ],
      sla: { responseTime: 120, resolutionTime: 480, respondedAt: getDate(0.12), status: 'within' },
      createdAt: getDate(3),
      updatedAt: getDate(0.12)
    }
  },
  {
    id: 'TKT-004',
    data: {
      teamId: 'team-1',
      contactId: 'contact-4',
      title: 'Mobile app crashes on startup',
      description: 'iOS app crashes immediately when launching on iOS 16+.',
      status: 'resolved',
      priority: 'high',
      assignedAgentId: 'agent-3',
      tags: ['mobile', 'ios', 'crash'],
      categories: ['Mobile', 'Bug'],
      comments: [
        { id: 'c6', authorId: 'agent-3', content: 'Memory leak in iOS initialization found', isInternal: true, createdAt: getDate(1) },
        { id: 'c7', authorId: 'user-3', content: 'Patch v2.1.1 released', isInternal: false, createdAt: getDate(0.5) }
      ],
      sla: { responseTime: 30, resolutionTime: 240, respondedAt: getDate(1), status: 'within' },
      createdAt: getDate(7),
      updatedAt: getDate(0.5),
      resolvedAt: getDate(0.5)
    }
  },
  {
    id: 'TKT-005',
    data: {
      teamId: 'team-1',
      contactId: 'contact-5',
      title: 'API rate limiting too restrictive',
      description: 'Requesting rate limit increase from 100 to 1000 req/min.',
      status: 'closed',
      priority: 'low',
      assignedAgentId: 'agent-1',
      tags: ['api', 'performance'],
      categories: ['API', 'Performance'],
      comments: [
        { id: 'c8', authorId: 'agent-1', content: 'Approved 500/min increase', isInternal: false, createdAt: getDate(2) },
        { id: 'c9', authorId: 'user-1', content: 'Changes applied', isInternal: true, createdAt: getDate(1) }
      ],
      sla: { responseTime: 240, resolutionTime: 1440, respondedAt: getDate(2), status: 'within' },
      createdAt: getDate(14),
      updatedAt: getDate(1),
      resolvedAt: getDate(1),
      closedAt: getDate(0.5)
    }
  },
  {
    id: 'TKT-006',
    data: {
      teamId: 'team-1',
      contactId: 'contact-1',
      title: 'Dashboard performance improvement',
      description: 'Dashboard takes 8+ seconds to load with 10k+ records.',
      status: 'open',
      priority: 'medium',
      assignedAgentId: 'agent-2',
      tags: ['performance', 'dashboard'],
      categories: ['Performance', 'Frontend'],
      comments: [],
      sla: { responseTime: 120, resolutionTime: 480, respondedAt: null, status: 'at_risk' },
      createdAt: getDate(4),
      updatedAt: new Date()
    }
  },
  {
    id: 'TKT-007',
    data: {
      teamId: 'team-1',
      contactId: 'contact-2',
      title: 'Two-factor authentication not working',
      description: 'Users receiving 2FA codes but codes are expired immediately.',
      status: 'in_progress',
      priority: 'high',
      assignedAgentId: 'agent-3',
      tags: ['security', 'authentication'],
      categories: ['Security', 'Auth'],
      comments: [
        { id: 'c10', authorId: 'agent-3', content: 'Clock skew issue on auth server', isInternal: true, createdAt: getDate(0.25) }
      ],
      sla: { responseTime: 30, resolutionTime: 120, respondedAt: getDate(0.25), status: 'within' },
      createdAt: getDate(5),
      updatedAt: getDate(0.25)
    }
  },
  {
    id: 'TKT-008',
    data: {
      teamId: 'team-1',
      contactId: 'contact-3',
      title: 'Documentation outdated',
      description: 'API documentation for v3.0 is not updated.',
      status: 'open',
      priority: 'low',
      tags: ['documentation', 'api'],
      categories: ['Documentation'],
      comments: [],
      sla: { responseTime: 240, resolutionTime: 1440, respondedAt: null, status: 'within' },
      createdAt: getDate(6),
      updatedAt: new Date()
    }
  }
];

const USERS = [
  { id: 'user-1', data: { email: 'admin@jiwaku.com', name: 'Admin User', role: 'admin', status: 'available', department: 'Management', createdAt: getDate(30), lastSeenAt: getDate(0.04) } },
  { id: 'user-2', data: { email: 'agent1@jiwaku.com', name: 'Support Agent 1', role: 'agent', status: 'available', department: 'Support', createdAt: getDate(21), lastSeenAt: getDate(0.02) } },
  { id: 'user-3', data: { email: 'agent2@jiwaku.com', name: 'Support Agent 2', role: 'agent', status: 'busy', department: 'Support', createdAt: getDate(14), lastSeenAt: getDate(0.007) } },
  { id: 'agent-1', data: { email: 'team-lead1@jiwaku.com', name: 'Team Lead 1', role: 'lead', status: 'available', department: 'Support', createdAt: getDate(30), lastSeenAt: getDate(0.004) } },
  { id: 'agent-2', data: { email: 'team-lead2@jiwaku.com', name: 'Team Lead 2', role: 'lead', status: 'available', department: 'Support', createdAt: getDate(21), lastSeenAt: getDate(0.08) } },
  { id: 'agent-3', data: { email: 'specialist@jiwaku.com', name: 'Technical Specialist', role: 'agent', status: 'available', department: 'Technical', createdAt: getDate(14), lastSeenAt: getDate(0.16) } }
];

const TEMPLATES = [
  {
    id: 'tpl-001',
    data: {
      name: 'Bug Report',
      description: 'Standard template for customer bug reports and technical issues',
      category: 'Technical Support',
      priority: 'high',
      status: 'open',
      tags: ['bug', 'support', 'technical'],
      categories: ['Technical', 'Bug Report'],
      responseTemplate: 'Thank you for reporting this bug. Our technical team will investigate and provide a fix shortly.',
      customFields: [
        { name: 'affected_version', type: 'text', label: 'Affected Version', required: true },
        { name: 'os', type: 'select', label: 'Operating System', required: false, options: [
          { label: 'Windows', value: 'windows' },
          { label: 'macOS', value: 'macos' },
          { label: 'Linux', value: 'linux' }
        ]},
        { name: 'reproduction_steps', type: 'text', label: 'Steps to Reproduce', required: true }
      ],
      defaultAssigneeId: 'agent-3',
      isFavorite: true,
      usageCount: 0,
      isActive: true,
      createdBy: 'user-1',
      createdAt: getDate(30),
      updatedAt: new Date()
    }
  },
  {
    id: 'tpl-002',
    data: {
      name: 'Feature Request',
      description: 'Template for feature requests and enhancement suggestions',
      category: 'Product',
      priority: 'medium',
      tags: ['feature', 'product'],
      categories: ['Feature Request', 'Enhancement'],
      responseTemplate: 'Thank you for your suggestion! We appreciate your feedback and will evaluate this feature request.',
      customFields: [
        { name: 'use_case', type: 'text', label: 'Use Case', required: true },
        { name: 'priority_level', type: 'select', label: 'Priority Level', required: false, options: [
          { label: 'Nice to Have', value: 'low' },
          { label: 'Important', value: 'medium' },
          { label: 'Critical', value: 'high' }
        ]},
        { name: 'estimated_impact', type: 'text', label: 'Estimated Impact', required: false }
      ],
      isFavorite: true,
      usageCount: 0,
      isActive: true,
      createdBy: 'user-1',
      createdAt: getDate(25),
      updatedAt: new Date()
    }
  },
  {
    id: 'tpl-003',
    data: {
      name: 'Billing Question',
      description: 'Template for billing-related inquiries and invoices',
      category: 'Billing',
      priority: 'medium',
      tags: ['billing', 'invoice', 'payment'],
      categories: ['Billing', 'Finance'],
      responseTemplate: 'We\'ll be happy to help with your billing inquiry. Our team will respond within 24 hours.',
      customFields: [
        { name: 'invoice_id', type: 'text', label: 'Invoice ID', required: false },
        { name: 'billing_period', type: 'date', label: 'Billing Period', required: false },
        { name: 'inquiry_type', type: 'select', label: 'Inquiry Type', required: true, options: [
          { label: 'Invoice Question', value: 'invoice' },
          { label: 'Payment Issue', value: 'payment' },
          { label: 'Subscription', value: 'subscription' }
        ]}
      ],
      defaultAssigneeId: 'agent-1',
      isFavorite: false,
      usageCount: 0,
      isActive: true,
      createdBy: 'user-1',
      createdAt: getDate(20),
      updatedAt: new Date()
    }
  },
  {
    id: 'tpl-004',
    data: {
      name: 'Onboarding Assistance',
      description: 'Template for new customer onboarding and setup assistance',
      category: 'Support',
      priority: 'medium',
      tags: ['onboarding', 'new-customer', 'setup'],
      categories: ['Onboarding', 'Support'],
      responseTemplate: 'Welcome! We\'re excited to help you get started. Here are the first steps to set up your account.',
      customFields: [
        { name: 'account_type', type: 'select', label: 'Account Type', required: true, options: [
          { label: 'Free Trial', value: 'trial' },
          { label: 'Starter', value: 'starter' },
          { label: 'Pro', value: 'pro' }
        ]},
        { name: 'integration_needed', type: 'checkbox', label: 'Integration Needed', required: false },
        { name: 'preferred_training', type: 'select', label: 'Training Type', required: false, options: [
          { label: 'Email', value: 'email' },
          { label: 'Video Call', value: 'video' },
          { label: 'Documentation', value: 'docs' }
        ]}
      ],
      isFavorite: true,
      usageCount: 0,
      isActive: true,
      createdBy: 'user-1',
      createdAt: getDate(15),
      updatedAt: new Date()
    }
  },
  {
    id: 'tpl-005',
    data: {
      name: 'Performance Issue',
      description: 'Template for performance-related problems and optimization requests',
      category: 'Technical Support',
      priority: 'high',
      tags: ['performance', 'optimization', 'technical'],
      categories: ['Performance', 'Technical'],
      responseTemplate: 'Thank you for reporting this performance issue. Our team will investigate and optimize your experience.',
      customFields: [
        { name: 'load_time', type: 'number', label: 'Current Load Time (seconds)', required: false },
        { name: 'expected_time', type: 'number', label: 'Expected Load Time (seconds)', required: false },
        { name: 'affected_feature', type: 'text', label: 'Affected Feature', required: true },
        { name: 'browser', type: 'select', label: 'Browser', required: false, options: [
          { label: 'Chrome', value: 'chrome' },
          { label: 'Firefox', value: 'firefox' },
          { label: 'Safari', value: 'safari' }
        ]}
      ],
      defaultAssigneeId: 'agent-3',
      isFavorite: false,
      usageCount: 0,
      isActive: true,
      createdBy: 'user-1',
      createdAt: getDate(10),
      updatedAt: new Date()
    }
  }
];

// Demo Automation Rules
const AUTOMATION_RULES = [
  {
    id: 'rule-001',
    data: {
      name: 'Auto-assign High Priority Tickets',
      description: 'Automatically assign high priority tickets to senior agents',
      isActive: true,
      priority: 9,
      triggers: [{ type: 'ticket_created' }],
      conditions: [{ id: 'cond-1', field: 'priority', operator: 'equals', value: 'high' }],
      actions: [{ type: 'assign', targetValue: 'agent-1' }],
      executeCount: 0,
      errorCount: 0,
      createdBy: 'user-1',
      createdAt: getDate(5),
      updatedAt: new Date()
    }
  },
  {
    id: 'rule-002',
    data: {
      name: 'Auto-tag Urgent Tickets',
      description: 'Automatically tag tickets with urgent status',
      isActive: true,
      priority: 8,
      triggers: [{ type: 'sla_warning' }],
      conditions: [],
      actions: [{ type: 'add_tag', targetValue: 'urgent' }],
      executeCount: 0,
      errorCount: 0,
      createdBy: 'user-1',
      createdAt: getDate(3),
      updatedAt: new Date()
    }
  },
  {
    id: 'rule-003',
    data: {
      name: 'Auto-categorize Technical Issues',
      description: 'Automatically categorize and tag technical support tickets',
      isActive: true,
      priority: 7,
      triggers: [{ type: 'ticket_created' }],
      conditions: [{ id: 'cond-2', field: 'tags', operator: 'contains', value: 'bug' }],
      actions: [
        { type: 'add_category', targetValue: 'Technical Support' },
        { type: 'add_tag', targetValue: 'requires-review' }
      ],
      executeCount: 0,
      errorCount: 0,
      createdBy: 'user-1',
      createdAt: getDate(2),
      updatedAt: new Date()
    }
  },
  {
    id: 'rule-004',
    data: {
      name: 'Set Priority for Support Tickets',
      description: 'Automatically set medium priority for new support tickets',
      isActive: false,
      priority: 5,
      triggers: [{ type: 'ticket_created' }],
      conditions: [],
      actions: [{ type: 'set_priority', targetValue: 'medium' }],
      executeCount: 0,
      errorCount: 0,
      createdBy: 'user-1',
      createdAt: getDate(1),
      updatedAt: new Date()
    }
  }
];

// Main seeding function
async function seedFirestore(db) {
  logStep('\n🌱 Starting Firestore Demo Data Seeding...\n');

  try {
    // Seed teams
    logStep('📁 Seeding Teams...');
    for (const team of TEAMS) {
      await setDoc(doc(db, 'teams', team.id), team.data);
      logSuccess(`Team "${team.data.name}" created`);
    }

    // Seed contacts
    logStep('👥 Seeding Contacts...');
    for (const contact of CONTACTS) {
      await setDoc(doc(db, 'teams/team-1/contacts', contact.id), contact.data);
      logSuccess(`Contact "${contact.data.firstName} ${contact.data.lastName}" created`);
    }

    // Seed tickets
    logStep('🎫 Seeding Tickets...');
    for (const ticket of TICKETS) {
      await setDoc(doc(db, 'teams/team-1/tickets', ticket.id), ticket.data);
      logSuccess(`Ticket "${ticket.data.title}" created`);
    }

    // Seed users
    logStep('👤 Seeding Users...');
    for (const user of USERS) {
      await setDoc(doc(db, 'teams/team-1/users', user.id), user.data);
      logSuccess(`User "${user.data.name}" created`);
    }

    // Seed templates
    logStep('📋 Seeding Ticket Templates...');
    for (const template of TEMPLATES) {
      await setDoc(doc(db, 'teams/team-1/ticketTemplates', template.id), template.data);
      logSuccess(`Template "${template.data.name}" created`);
    }

    // Seed automation rules
    logStep('🤖 Seeding Automation Rules...');
    for (const rule of AUTOMATION_RULES) {
      await setDoc(doc(db, 'automationRules', rule.id), rule.data);
      logSuccess(`Rule "${rule.data.name}" created (${rule.data.isActive ? 'active' : 'inactive'})`);
    }

    // Summary
    logStep('\n📊 Seeding Complete!\n');
    log('Summary:', 'bright');
    logInfo(`Teams: ${TEAMS.length}`);
    logInfo(`Contacts: ${CONTACTS.length}`);
    logInfo(`Tickets: ${TICKETS.length}`);
    logInfo(`Users: ${USERS.length}`);
    logInfo(`Templates: ${TEMPLATES.length}`);
    logInfo(`Automation Rules: ${AUTOMATION_RULES.length}`);
    
    logStep('\n✨ All demo data has been seeded to Firestore!\n');
    log('Next steps:', 'bright');
    log('1. Start dev server: npm run dev', 'cyan');
    log('2. Navigate to: http://localhost:3000/dashboard/tickets', 'cyan');
    log('3. You should see 8 demo tickets', 'cyan');
    
    process.exit(0);
  } catch (error) {
    logError(`Seeding failed: ${error.message}`);
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run
const db = initializeFirebase();
seedFirestore(db);
