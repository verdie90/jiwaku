# 🚀 Jiwaku CRM - Getting Started Guide

Panduan lengkap untuk memulai development pada Jiwaku CRM Platform.

## 📋 Prerequisites

Sebelum memulai, pastikan Anda memiliki:

- **Node.js**: v18 atau lebih tinggi
  ```bash
  node --version  # v18.0.0 atau lebih tinggi
  ```

- **npm**: v9 atau lebih tinggi (atau yarn/pnpm)
  ```bash
  npm --version  # v9.0.0 atau lebih tinggi
  ```

- **Git**: Untuk version control
  ```bash
  git --version
  ```

- **Firebase Account**: Untuk database dan authentication
  - Buat project di [Firebase Console](https://console.firebase.google.com)
  - Enable Firestore Database
  - Enable Authentication (Email/Password)

## 🛠️ Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/jiwaku.git
cd jiwaku
```

### 2. Install Dependencies

```bash
npm install
# atau jika menggunakan yarn
yarn install
# atau jika menggunakan pnpm
pnpm install
```

> **Tip**: Jika ada peer dependency warnings, gunakan `--legacy-peer-deps`
> ```bash
> npm install --legacy-peer-deps
> ```

### 3. Setup Environment Variables

Copy `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` dan isi dengan credentials Anda:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Application
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Twilio (optional untuk now)
NEXT_PUBLIC_TWILIO_ACCOUNT_SID=your_account_sid
NEXT_PUBLIC_TWILIO_AUTH_TOKEN=your_auth_token
NEXT_PUBLIC_TWILIO_PHONE_NUMBER=+1234567890

# Environment
NODE_ENV=development
```

### 4. Firebase Setup

1. Buat Firebase project:
   - Pergi ke [Firebase Console](https://console.firebase.google.com)
   - Klik "Create Project"
   - Beri nama project (misal: "jiwaku-dev")

2. Enable Firestore Database:
   - Di Firebase Console, pilih "Firestore Database"
   - Klik "Create Database"
   - Pilih "Start in test mode" (untuk development)
   - Pilih region terdekat

3. Enable Authentication:
   - Di "Authentication", klik "Get Started"
   - Pilih "Email/Password"
   - Enable "Email/Password"

4. Copy credentials:
   - Di "Project Settings", copy semua Firebase config
   - Paste ke `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Server akan berjalan di [http://localhost:3000](http://localhost:3000)

### 6. Test Login

1. Buka [http://localhost:3000](http://localhost:3000)
2. Klik "Get Started" atau "Sign In"
3. Buat akun baru dengan email dan password
4. Anda akan diarahkan ke dashboard

## 📁 Project Structure Navigation

```
jiwaku/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Home page (landing)
│   ├── layout.tsx           # Root layout dengan providers
│   ├── globals.css          # Global styles & design tokens
│   ├── login/
│   │   └── page.tsx         # Login page
│   ├── dashboard/
│   │   ├── page.tsx         # Dashboard home
│   │   ├── layout.client.tsx
│   │   └── [feature]/       # Sub-pages (messages, calls, etc)
│   └── api/                 # API routes
│
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── badge.tsx
│   ├── layout/              # Layout components
│   │   ├── sidebar.tsx      # Main navigation
│   │   └── header.tsx       # Top header
│   ├── features/            # Feature-specific components
│   │   ├── messaging/
│   │   ├── calls/
│   │   ├── tickets/
│   │   └── contacts/
│   └── providers.tsx        # App providers setup
│
├── config/                  # Configuration files
│   ├── firebase.ts          # Firebase config & collections
│   └── constants.ts         # Enums, roles, permissions
│
├── lib/                     # Utilities & libraries
│   ├── firebase/
│   │   ├── client.ts        # Firebase client initialization
│   │   └── admin.ts         # Firebase admin setup
│   ├── utils/
│   │   └── helpers.ts       # Helper functions
│   └── react-query.ts       # React Query configuration
│
├── hooks/                   # Custom hooks
│   └── useAuth.ts           # Authentication hook
│
├── services/                # Business logic services
│   ├── auth.service.ts      # Authentication service
│   ├── message.service.ts   # Messaging service
│   └── [other].service.ts
│
├── store/                   # State management (Zustand)
│   └── app.store.ts         # Global app state
│
├── types/                   # TypeScript types
│   └── index.ts             # All type definitions
│
├── constants/               # App constants
│   └── app.ts
│
├── public/                  # Static assets
│   ├── favicon.ico
│   ├── manifest.json        # PWA manifest
│   └── images/
│
├── .env.example             # Environment template
├── .env.local               # Environment variables (local)
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── tailwind.config.ts       # Tailwind CSS config
├── next.config.ts           # Next.js config
├── middleware.ts            # Route middleware
├── DOCS.md                  # Quick reference
├── PROJECT_SETUP.md         # Setup details
├── IMPLEMENTATION_CHECKLIST.md # Feature checklist
└── README.md                # Project overview
```

## 🔧 Available Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)

# Building
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm run type-check      # Check TypeScript types

# Testing (when available)
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

## 🎨 Design System

### Colors
- **Primary**: `#0066FF` (Blue)
- **Secondary**: `#F5F7FA` (Light Gray)
- **Destructive**: `#FF3B3B` (Red)
- **Success**: `#10B981` (Green)
- **Warning**: `#F59E0B` (Orange)

Semua warna didefinisikan di `app/globals.css` dan dapat diakses via CSS variables.

### Using Components

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Input label="Email" type="email" />
        <Button variant="primary" size="lg">
          Click me
        </Button>
      </CardContent>
    </Card>
  );
}
```

## 🔐 Authentication Flow

### Registration
1. User mengisi email dan password
2. Firebase membuat user account
3. Password di-hash dengan bcrypt
4. User document dibuat di Firestore
5. User diarahkan ke dashboard

### Login
1. User memasukkan email dan password
2. Firebase verifikasi credentials
3. Session token dibuat
4. User diarahkan ke dashboard
5. Protected routes accessible

### Logout
1. User klik "Sign Out"
2. Session terminated
3. Redirected ke login page

## 🚀 Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/amazing-feature
```

### 2. Start Development
```bash
npm run dev
```

### 3. Make Changes
- Edit files sesuai kebutuhan
- TypeScript akan error jika ada type mismatch
- Browser live reload otomatis

### 4. Commit Changes
```bash
git add .
git commit -m "feat: add amazing feature"
```

### 5. Push dan Create Pull Request
```bash
git push origin feature/amazing-feature
```

## 🐛 Troubleshooting

### Dependencies Issue
```bash
# Clear cache dan reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# Change port
npm run dev -- -p 3001
```

### TypeScript Errors
```bash
# Check all type errors
npm run type-check

# The errors akan ditampilkan di terminal
```

### Firebase Connection Failed
- Verify `.env.local` memiliki credentials yang benar
- Check internet connection
- Pastikan Firestore database sudah di-enable

### Hot Reload Not Working
- Restart dev server: `Ctrl+C` kemudian `npm run dev`
- Clear `.next` folder: `rm -rf .next && npm run dev`

## 📚 Learning Resources

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Tutorials](https://nextjs.org/learn)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Basics](https://www.typescriptlang.org/docs/handbook/basic-types.html)

### React
- [React Documentation](https://react.dev)
- [React Patterns](https://reactpatterns.com/)

### Firebase
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)

### Tailwind CSS
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)

### State Management
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query Documentation](https://tanstack.com/query/latest)

## 📦 Folder Creation Checklist

Untuk menambah feature baru, ikuti struktur ini:

```
components/features/[feature]/
├── [Feature]List.tsx          # List view
├── [Feature]Detail.tsx        # Detail view
├── [Feature]Form.tsx          # Create/Edit form
├── [Feature]Card.tsx          # Card component
└── index.tsx                  # Barrel export

services/
├── [feature].service.ts       # Business logic

hooks/
├── use[Feature]s.ts           # Custom hook

app/dashboard/[feature]/
└── page.tsx                   # Page component
```

## 🎯 Next Steps

1. **Explore Codebase**: Baca semua file di `components/ui/` untuk memahami pattern
2. **Create First Component**: Buat komponen baru untuk practice
3. **Study Architecture**: Pahami flow dari authentication hingga dashboard
4. **Read Documentation**: Pelajari DOCS.md dan PROJECT_SETUP.md
5. **Start Building**: Ikuti IMPLEMENTATION_CHECKLIST untuk features

## 💡 Pro Tips

- **Use TypeScript**: Manfaatkan type checking untuk avoid bugs
- **Component Composition**: Break down UI menjadi small, reusable components
- **Proper Naming**: Gunakan nama yang descriptive untuk clarity
- **DRY Principle**: Don't Repeat Yourself - extract common logic
- **Error Handling**: Always handle errors gracefully dengan proper messages
- **Testing**: Write tests untuk critical business logic
- **Performance**: Monitor bundle size dan use code splitting

## ❓ FAQ

### Q: Bagaimana cara add new UI component?
A: Buat file baru di `components/ui/`, ikuti pattern dari button/input, export di index.

### Q: Bagaimana cara create new page?
A: Buat folder di `app/dashboard/[page-name]/` dengan file `page.tsx`.

### Q: Bagaimana cara add new route?
A: Next.js menggunakan file-based routing, jadi cukup create folder dan file `page.tsx`.

### Q: Bagaimana cara deploy?
A: Lihat dokumentasi Vercel atau Firebase Hosting di DOCS.md.

### Q: Bagaimana cara setup database?
A: Follow Firebase Setup section di Getting Started ini.

## 📞 Support

- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Tanya-tanya di GitHub Discussions  
- **Documentation**: Baca DOCS.md dan PROJECT_SETUP.md
- **Examples**: Lihat component examples di components/ui/

---

**Happy Coding! 🎉**

*Jangan ragu untuk bertanya atau share ideas di team*
