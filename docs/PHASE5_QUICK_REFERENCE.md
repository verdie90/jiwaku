# Phase 5 Quick Reference Guide

## 🚀 Quick Start

### Access Customization Page
```
Navigate to: /app/settings/customization
```

### Import Custom Fields Service
```typescript
import { CustomFieldsService } from '@/services/customFields.service';
import { useCustomFields, useCreateCustomField } from '@/hooks/useCustomFields';
```

### Import Firestore Sync Service
```typescript
import { FirestoreSyncService } from '@/services/firestoreSync.service';
import { useSyncEntity, useEntities } from '@/hooks/useFirestoreSync';
```

### Import Import/Export Service
```typescript
import { ImportExportService } from '@/services/importExport.service';
import { useExportToCSV, useImportFromJSON } from '@/hooks/useImportExport';
```

## 📋 Common Tasks

### Create a Custom Field
```typescript
const createMutation = useCreateCustomField(teamId);

await createMutation.mutateAsync({
  name: 'department',
  label: 'Department',
  type: 'select',
  required: true,
  options: [
    { id: '1', label: 'Sales', value: 'sales' },
    { id: '2', label: 'Support', value: 'support' }
  ]
});
```

### Set Custom Field Value
```typescript
const setValueMutation = useSetCustomFieldValue(teamId);

await setValueMutation.mutateAsync({
  entityType: 'contact',
  fieldId: fieldId,
  value: 'sales',
  userId: user.id
});
```

### Sync Entity to Firestore
```typescript
const syncMutation = useSyncEntity(teamId);

await syncMutation.mutateAsync({
  entityType: 'contact',
  entityId: contactId,
  data: contactData,
  userId: user.id
});
```

### Bulk Sync Entities
```typescript
const batchSyncMutation = useBatchSyncEntities(teamId);

await batchSyncMutation.mutateAsync({
  entityType: 'contact',
  entities: [
    { id: '1', data: { name: 'John', email: 'john@example.com' } },
    { id: '2', data: { name: 'Jane', email: 'jane@example.com' } }
  ],
  userId: user.id
});
```

### Get Entities
```typescript
const { data: entities, isLoading } = useEntities(
  teamId,
  'contact',
  [{ field: 'active', operator: '==', value: true }]
);
```

### Search Entities
```typescript
const { data: results } = useSearchEntities(
  teamId,
  'contact',
  'email',
  'john'
);
```

### Export to CSV
```typescript
const exportCSVMutation = useExportToCSV(teamId);
const downloadCSVMutation = useDownloadCSV();

const csvContent = await exportCSVMutation.mutateAsync({
  entityType: 'contact'
});

await downloadCSVMutation.mutateAsync({
  content: csvContent,
  filename: 'contacts.csv'
});
```

### Import from JSON
```typescript
const importJSONMutation = useImportFromJSON(teamId);

const result = await importJSONMutation.mutateAsync({
  entityType: 'contact',
  jsonContent: fileContent,
  userId: user.id
});

console.log(`Imported: ${result.success}, Failed: ${result.failed}`);
```

### Get Sync Statistics
```typescript
const { data: stats } = useSyncStats(teamId);
console.log(`Total: ${stats.total}, Contacts: ${stats.byType.contacts}`);
```

## 🎯 Field Type Reference

| Type | Description | Validation |
|------|-------------|-----------|
| `text` | Short text field | minLength, maxLength, pattern |
| `number` | Numeric value | min, max |
| `email` | Email address | pattern |
| `phone` | Phone number | minLength (10 digits) |
| `date` | Date value | none |
| `select` | Single option | options array |
| `multiselect` | Multiple options | options array |
| `checkbox` | Boolean flag | none |
| `textarea` | Long text | minLength, maxLength |
| `json` | JSON object | none |

## 📊 Collection Structure Quick Reference

```
teams/{teamId}/
  contacts/{id}
  tickets/{id}
  agents/{id}
  companies/{id}
  deals/{id}

global/
  contacts/{id}
  tickets/{id}
  agents/{id}
  companies/{id}
  deals/{id}
```

## 🔍 Query Examples

### Get All Custom Fields
```typescript
const fields = await CustomFieldsService.getCustomFields(teamId);
```

### Get Field by ID
```typescript
const field = await CustomFieldsService.getCustomField(teamId, fieldId);
```

### Get Custom Field Values for Entity
```typescript
const values = await CustomFieldsService.getCustomFieldValues(
  teamId,
  'contact',
  contactId
);
```

### Validate Field Value
```typescript
const result = CustomFieldsService.validateFieldValue(
  field,
  'test@example.com'
);
if (result.valid) {
  // Value is valid
}
```

### Get Entity from Firestore
```typescript
const entity = await FirestoreSyncService.getEntity(
  teamId,
  'contact',
  contactId
);
```

### Search with Filters
```typescript
const entities = await FirestoreSyncService.getEntities(
  teamId,
  'contact',
  [
    { field: 'status', operator: '==', value: 'active' },
    { field: 'createdAt', operator: '>=', value: new Date() }
  ]
);
```

## 🛡️ Error Handling

### Service Errors
```typescript
try {
  await FirestoreSyncService.syncEntity(teamId, 'contact', id, data, userId);
} catch (error) {
  console.error('Sync failed:', error.message);
}
```

### Hook Errors
```typescript
const mutation = useSyncEntity(teamId);
const { mutateAsync, error, isPending } = mutation;

if (error) {
  console.error('Mutation failed:', error.message);
}
```

### Import Errors
```typescript
const result = await ImportExportService.importFromJSON(
  teamId,
  'contact',
  jsonContent,
  userId
);

result.errors.forEach(err => console.error(err));
```

## ⚡ Performance Tips

1. **Use Batch Operations** - For multiple entities
   ```typescript
   await FirestoreSyncService.batchSyncEntities(teamId, type, entities, userId);
   ```

2. **Leverage Query Caching** - React Query handles it automatically
   ```typescript
   const { data, isLoading } = useEntities(teamId, type);
   ```

3. **Filter Early** - Pass filters to reduce data
   ```typescript
   const filtered = await FirestoreSyncService.getEntities(
     teamId,
     'contact',
     [{ field: 'status', operator: '==', value: 'active' }]
   );
   ```

4. **Use Search for Large Datasets** - Efficient range queries
   ```typescript
   const results = await FirestoreSyncService.searchEntities(
     teamId,
     'contact',
     'email',
     'john'
   );
   ```

## 📱 Responsive Components

All Phase 5 components are fully responsive:
- Mobile: Works on screens < 640px
- Tablet: Optimized for 640px - 1024px
- Desktop: Full features on 1024px+

## 🌙 Dark Mode

All components automatically support dark mode:
- `dark:bg-slate-900` - Dark backgrounds
- `dark:text-slate-100` - Dark text
- `dark:border-slate-700` - Dark borders

## 📚 File Reference

| File | Purpose | LOC |
|------|---------|-----|
| `types/customFields.ts` | Type definitions | 180 |
| `services/customFields.service.ts` | Custom fields logic | 300 |
| `services/firestoreSync.service.ts` | Firestore sync | 400 |
| `services/importExport.service.ts` | Import/export logic | 220 |
| `hooks/useCustomFields.ts` | Custom fields hooks | 160 |
| `hooks/useFirestoreSync.ts` | Sync hooks | 200 |
| `hooks/useImportExport.ts` | Import/export hooks | 130 |
| `components/.../CustomFieldsBuilder.tsx` | UI builder | 350 |
| `components/.../DataImportExport.tsx` | Import/export UI | 380 |
| `app/settings/customization/page.tsx` | Settings page | 280 |

## 🔗 Related Documentation

- Full API: `PHASE5_DOCUMENTATION.md`
- Summary: `PHASE5_SUMMARY.md`
- Main Project: `README.md`

## ❓ FAQ

**Q: How do I add validation to a custom field?**
```typescript
{
  type: 'email',
  validation: {
    pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
  }
}
```

**Q: Can I export and import data?**
Yes! Both CSV and JSON formats are supported.

**Q: Is data synced automatically?**
Use `useSyncEntity` or `useBatchSyncEntities` to sync manually. Auto-sync can be toggled in settings.

**Q: How many custom fields can I create?**
Unlimited - each field is independently stored in Firestore.

**Q: What happens to custom field values when I delete a field?**
The field definition is deleted, but values remain (orphaned). You can manually clean them up.

**Q: Can I reorder custom fields?**
Yes, use the `metadata.position` property when creating/updating fields.

---

**Last Updated**: Phase 5 Complete
**Version**: 1.0
**Status**: Production Ready ✅
