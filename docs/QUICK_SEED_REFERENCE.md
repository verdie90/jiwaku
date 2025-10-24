# Firestore Data Seeding - Quick Reference

## ⚡ 60-Second Setup

### 1. Get Service Account Key
```
Firebase Console → ⚙️ Settings → Service Accounts → Generate New Private Key
```

### 2. Set Environment Variable

**Windows PowerShell:**
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\serviceAccountKey.json"
```

**macOS/Linux:**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

### 3. Run Seed Script
```bash
node scripts/seed-firestore.js
```

### 4. Verify
```bash
npm run dev
# Navigate to http://localhost:3000/dashboard/tickets
# You should see 8 demo tickets!
```

---

## 📦 What Gets Created

| Type | Count | Examples |
|------|-------|----------|
| Teams | 1 | "Support Team" |
| Contacts | 5 | John Doe, Jane Smith, Bob Johnson |
| Tickets | 8 | TKT-001, TKT-002, ... TKT-008 |
| Users/Agents | 6 | Admin, Leads, Specialists |
| Comments | 9 | Mix of internal & external |

---

## 🎯 Ticket Statuses in Demo Data

```
Open: 3 tickets (TKT-001, TKT-006, TKT-008)
In Progress: 2 tickets (TKT-002, TKT-007)
Waiting: 1 ticket (TKT-003)
Resolved: 1 ticket (TKT-004)
Closed: 1 ticket (TKT-005)
```

---

## ❌ Troubleshooting

| Error | Fix |
|-------|-----|
| `GOOGLE_APPLICATION_CREDENTIALS not set` | `$env:GOOGLE_APPLICATION_CREDENTIALS = "path"` |
| `Service account key not found` | Verify absolute path exists |
| `Permission denied` | Check Firestore security rules allow writes |
| `Cannot find module firebase-admin` | `npm install firebase-admin` |
| `Dashboard shows Loading...` | Clear cache, refresh browser |

---

## 🔄 Reset Data

```bash
# Delete and reseed
firebase firestore:delete teams --recursive
node scripts/seed-firestore.js
```

---

## 📍 Important Paths

| File | Purpose |
|------|---------|
| `scripts/seed-firestore.js` | Main seeding script |
| `SEED_DATA_GUIDE.md` | This guide (detailed version) |
| `FIRESTORE_INTEGRATION_GUIDE.md` | API documentation |
| `FIRESTORE_SETUP_GUIDE.md` | Initial setup guide |

---

## ✅ Verification Checklist

- [ ] Service account key saved locally
- [ ] Environment variable set
- [ ] Firebase Admin SDK installed (`npm list firebase-admin`)
- [ ] Seed script executed successfully
- [ ] "✨ All demo data has been seeded!" message appears
- [ ] Dashboard displays 8 tickets
- [ ] Can create/update/delete tickets
- [ ] Firestore Console shows `teams/team-1` collection

---

## 🚀 Next Steps

1. **Test CRUD Operations**
   - Create a new ticket
   - Update ticket status
   - Add a comment
   - Delete a ticket

2. **Explore Features**
   - Search tickets by keyword
   - Filter by status/priority
   - View agent workload
   - Check SLA metrics

3. **Continue Development**
   - Implement Phase 3C features
   - Build analytics dashboard
   - Create automation rules

---

## 📚 Related Guides

- **FIRESTORE_SETUP_GUIDE.md** - Firebase Console setup, security rules, environment config
- **FIRESTORE_INTEGRATION_GUIDE.md** - API documentation, React hooks, troubleshooting
- **SEED_DATA_GUIDE.md** - This detailed guide with examples

---

## 💡 Pro Tips

1. **Keep seed script simple** - Modify `DEMO_DATA` object for custom test data
2. **Use batch operations** - Scripts run faster with batch writes
3. **Test with production rules** - Set proper security rules before going live
4. **Monitor Firestore reads/writes** - Check Firebase Console for usage stats
5. **Version your data schema** - Keep demo data in sync with your models

---

## ⏱️ Typical Timeline

| Task | Duration |
|------|----------|
| Get service account key | 2 min |
| Set environment variable | 1 min |
| Run seed script | 10 sec |
| Verify in Firestore Console | 30 sec |
| Test in dashboard | 5 min |
| **Total** | **~10 minutes** |

---

**Questions?** Check the detailed guides or Firebase documentation:
- https://firebase.google.com/docs/firestore
- https://firebase.google.com/docs/firestore/quickstart
