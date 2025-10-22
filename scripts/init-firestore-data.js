#!/usr/bin/env node

/**
 * Firestore Data Initialization Script
 * 
 * Usage:
 *   node scripts/init-firestore-data.js
 * 
 * This script initializes sample data in Firebase Firestore
 * for development and testing purposes.
 * 
 * Requirements:
 * - Firebase Admin SDK installed
 * - GOOGLE_APPLICATION_CREDENTIALS environment variable set
 * - Firestore database created in Firebase Console
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccountPath) {
  console.error('ERROR: GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
  console.error('Set it to: export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json');
  process.exit(1);
}

try {
  const serviceAccount = require(path.resolve(serviceAccountPath));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.error('ERROR: Failed to initialize Firebase Admin SDK');
  console.error('Make sure GOOGLE_APPLICATION_CREDENTIALS points to valid service account key');
  process.exit(1);
}

const db = admin.firestore();

/**
 * Sample tickets data
 */
const SAMPLE_TICKETS = [
  {
    teamId: 'team-1',
    contactId: 'contact-1',
    title: 'Login page not loading',
    description: 'Users are unable to load the login page on the website. Getting blank screen.',
    status: 'open',
    priority: 'high',
    tags: ['website', 'critical', 'frontend'],
    categories: ['Technical', 'Frontend'],
    comments: [
      {
        id: 'comment-1',
        authorId: 'user-1',
        content: 'Investigating the DNS issues',
        isInternal: false,
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T10:30:00')),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T10:30:00'))
      }
    ],
    sla: {
      responseTime: 60,
      resolutionTime: 240,
      respondedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T09:15:00')),
      status: 'within'
    },
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T08:00:00')),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T08:00:00')),
    resolvedAt: null,
    closedAt: null
  },
  {
    teamId: 'team-1',
    contactId: 'contact-2',
    title: 'Payment processing delays',
    description: 'Customers experiencing delayed payment confirmations. Takes 5 minutes instead of 30 seconds.',
    status: 'in_progress',
    priority: 'urgent',
    assignedAgentId: 'agent-1',
    tags: ['payments', 'urgent', 'critical'],
    categories: ['Performance', 'Backend'],
    comments: [
      {
        id: 'comment-2',
        authorId: 'user-2',
        content: 'Identified database query bottleneck in payment service. Working on optimization.',
        isInternal: true,
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T08:00:00')),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T08:00:00'))
      }
    ],
    sla: {
      responseTime: 15,
      resolutionTime: 120,
      respondedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-14T16:45:00')),
      status: 'within'
    },
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-14T08:00:00')),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T08:00:00')),
    resolvedAt: null,
    closedAt: null
  },
  {
    teamId: 'team-1',
    contactId: 'contact-3',
    title: 'Email notification not received',
    description: 'Users not receiving email notifications after account registration.',
    status: 'waiting',
    priority: 'medium',
    assignedAgentId: 'agent-2',
    tags: ['emails', 'notifications'],
    categories: ['Integration', 'Email'],
    comments: [],
    sla: {
      responseTime: 120,
      resolutionTime: 480,
      respondedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-14T14:30:00')),
      status: 'within'
    },
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-14T12:00:00')),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-14T14:30:00')),
    resolvedAt: null,
    closedAt: null
  },
  {
    teamId: 'team-1',
    contactId: 'contact-4',
    title: 'Mobile app crashes on startup',
    description: 'iOS app crashes when launching on devices running iOS 16 and above.',
    status: 'resolved',
    priority: 'high',
    assignedAgentId: 'agent-1',
    tags: ['mobile', 'ios', 'crash'],
    categories: ['Mobile', 'Bug'],
    comments: [
      {
        id: 'comment-3',
        authorId: 'user-1',
        content: 'Fixed compatibility issue. Releasing patch v2.1.1',
        isInternal: true,
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T11:00:00')),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T11:00:00'))
      }
    ],
    sla: {
      responseTime: 30,
      resolutionTime: 240,
      respondedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-13T09:30:00')),
      status: 'within'
    },
    createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-13T08:00:00')),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T11:00:00')),
    resolvedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T11:00:00')),
    closedAt: null
  }
];

/**
 * Initialize Firestore with sample data
 */
async function initializeFirestoreData() {
  console.log('🚀 Starting Firestore data initialization...\n');

  try {
    // Create team document
    console.log('📁 Creating team document...');
    await db.collection('teams').doc('team-1').set({
      name: 'Development Team',
      description: 'Sample development team',
      ownerId: 'user-1',
      members: ['user-1', 'user-2', 'agent-1', 'agent-2'],
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
    console.log('✅ Team created\n');

    // Add tickets
    console.log('🎫 Adding sample tickets...');
    const ticketPromises = SAMPLE_TICKETS.map((ticket, index) => {
      const ticketId = `TKT-${String(index + 1).padStart(3, '0')}`;
      return db.collection('teams').doc(ticket.teamId).collection('tickets').doc(ticketId).set(ticket);
    });

    await Promise.all(ticketPromises);
    console.log(`✅ ${SAMPLE_TICKETS.length} tickets created\n`);

    // Add sample contacts
    console.log('👥 Adding sample contacts...');
    const contacts = [
      {
        id: 'contact-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0101',
        company: 'Tech Corp',
        jobTitle: 'Engineering Manager'
      },
      {
        id: 'contact-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0102',
        company: 'Design Studio',
        jobTitle: 'UX Designer'
      },
      {
        id: 'contact-3',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        phone: '+1-555-0103',
        company: 'Marketing Inc',
        jobTitle: 'Marketing Manager'
      },
      {
        id: 'contact-4',
        firstName: 'Alice',
        lastName: 'Williams',
        email: 'alice.williams@example.com',
        phone: '+1-555-0104',
        company: 'StartUp Co',
        jobTitle: 'Product Manager'
      }
    ];

    const contactPromises = contacts.map(contact =>
      db.collection('teams').doc('team-1').collection('contacts').doc(contact.id).set({
        ...contact,
        channels: [],
        conversationCount: 0,
        lastContactedAt: admin.firestore.Timestamp.now(),
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      })
    );

    await Promise.all(contactPromises);
    console.log(`✅ ${contacts.length} contacts created\n`);

    // Add sample users/agents
    console.log('👤 Adding sample users...');
    const users = [
      {
        id: 'user-1',
        email: 'agent1@jiwaku.com',
        name: 'Agent One',
        role: 'agent',
        status: 'available'
      },
      {
        id: 'user-2',
        email: 'agent2@jiwaku.com',
        name: 'Agent Two',
        role: 'agent',
        status: 'available'
      },
      {
        id: 'agent-1',
        email: 'lead1@jiwaku.com',
        name: 'Team Lead One',
        role: 'lead',
        status: 'available'
      },
      {
        id: 'agent-2',
        email: 'lead2@jiwaku.com',
        name: 'Team Lead Two',
        role: 'lead',
        status: 'available'
      }
    ];

    const userPromises = users.map(user =>
      db.collection('teams').doc('team-1').collection('users').doc(user.id).set({
        ...user,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      })
    );

    await Promise.all(userPromises);
    console.log(`✅ ${users.length} users created\n`);

    console.log('✨ Firestore initialization complete!\n');
    console.log('📊 Summary:');
    console.log(`  • Team: team-1`);
    console.log(`  • Tickets: ${SAMPLE_TICKETS.length}`);
    console.log(`  • Contacts: ${contacts.length}`);
    console.log(`  • Users: ${users.length}`);
    console.log('\n🎉 All sample data has been added to Firestore!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
    process.exit(1);
  }
}

// Run initialization
initializeFirestoreData();
