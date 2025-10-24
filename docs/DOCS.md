# Jiwaku - AI-Powered Omnichannel CRM
## Dokumentasi Lengkap

Aplikasi Web Omnichannel CRM berbasis AI yang modern, responsif, dan user-friendly dengan integrasi komunikasi multi-channel dan otomatisasi berbasis kecerdasan buatan.

## 🎯 Fitur Utama

### 1. Softphone Terintegrasi
- ✅ Inbound/outbound calls via WebRTC
- ✅ Call recording + voice mail transcription
- ✅ Auto CRM screen pop saat panggilan
- ✅ DTMF support (IVR navigation)
- ✅ Real-time call analytics
- ✅ Predictive dialer + mobile-responsive dial pad

### 2. WhatsApp Cloud API Integration
- ✅ Multi-number untuk berbagai unit bisnis
- ✅ Template & session messages
- ✅ Media sharing (images, docs, audio)
- ✅ Webhook real-time message handling
- ✅ AI routing (Agent AI) untuk autoresponse
- ✅ Secure API credential management
- ✅ Template approval workflow
- ✅ Conversation history sync ke Firestore
- ✅ Bulk messaging dengan rate limiting

### 3. Omnichannel Chat Dashboard
- ✅ Integrasi: WhatsApp, Email, Web Chat
- ✅ Real-time message sync across agents/devices
- ✅ Threaded conversations dengan preserved context
- ✅ Customer profile + full interaction history
- ✅ Smart auto-routing (skill-based)
- ✅ AI-suggested canned responses

### 4. Multi-Agent Collaboration
- ✅ Role-based queue (Sales, Support, Billing)
- ✅ Internal notes & @mentions antar tim
- ✅ Agent availability tracking
- ✅ Conversation transfer with context
- ✅ SLA monitoring & team performance analytics

### 5. Smart Ticketing System
- ✅ Auto-ticket creation dari semua channel
- ✅ AI categorization & priority setting
- ✅ Custom ticket fields per business need
- ✅ SLA management & escalation
- ✅ Knowledge base integration
- ✅ CSAT (Customer Satisfaction) surveys

## 🏗️ Teknologi & Stack

### Frontend / Fullstack
- **Next.js 16** - React framework dengan App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Styling utility-first
- **Framer Motion** - Smooth animations
- **React Hook Form + Zod** - Form validation
- **PWA Support** - Progressive Web App capabilities

### Backend & Infrastruktur
- **Firebase Firestore** - Real-time database
- **Firebase Authentication** - Local auth with bcrypt
- **Firebase Storage** - File storage
- **TanStack Query** - State management & caching
- **Zustand** - Lightweight state management

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local

# 3. Run development
npm run dev

# 4. Build for production
npm run build
npm run start
```

## 📋 RBAC Roles

- **super_admin** - Full access
- **admin** - Team management
- **team_lead** - Team monitoring
- **agent** - Handle conversations
- **viewer** - Read-only access

---

**Built with ❤️ by Jiwaku Team**
