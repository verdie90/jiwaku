'use client';

import { FirestoreSyncService } from './firestoreSync.service';

/**
 * Import/Export Service
 * Handle data import and export operations
 */
export class ImportExportService {
  /**
   * Export entities to CSV format
   */
  static async exportToCSV(
    teamId: string,
    entityType: string,
    filters?: Array<{ field: string; operator: string; value: any }>
  ): Promise<string> {
    const entities = await FirestoreSyncService.getEntities(
      teamId,
      entityType,
      filters
    );

    if (entities.length === 0) {
      return '';
    }

    // Get all unique keys
    const allKeys = new Set<string>();
    entities.forEach((entity) => {
      Object.keys(entity).forEach((key) => allKeys.add(key));
    });

    const keys = Array.from(allKeys);

    // Create CSV header
    const header = keys.map((key) => `"${key}"`).join(',');

    // Create CSV rows
    const rows = entities.map((entity) => {
      return keys
        .map((key) => {
          const value = entity[key];
          if (value === null || value === undefined) {
            return '""';
          }

          const stringValue = String(value);
          // Escape quotes and wrap in quotes if contains special chars
          if (
            stringValue.includes(',') ||
            stringValue.includes('"') ||
            stringValue.includes('\n')
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }

          return `"${stringValue}"`;
        })
        .join(',');
    });

    return [header, ...rows].join('\n');
  }

  /**
   * Export entities to JSON format
   */
  static async exportToJSON(
    teamId: string,
    entityType: string,
    filters?: Array<{ field: string; operator: string; value: any }>
  ): Promise<string> {
    const entities = await FirestoreSyncService.getEntities(
      teamId,
      entityType,
      filters
    );

    return JSON.stringify(entities, null, 2);
  }

  /**
   * Import from CSV format
   */
  static async importFromCSV(
    teamId: string,
    entityType: string,
    csvContent: string,
    userId: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const lines = csvContent.trim().split('\n');

    if (lines.length < 2) {
      return { success: 0, failed: 0, errors: ['CSV file is empty'] };
    }

    const headers = this._parseCSVLine(lines[0]);
    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    const entities: Array<{ id: string; data: Record<string, any> }> = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this._parseCSVLine(lines[i]);
        const data: Record<string, any> = {};

        headers.forEach((header, index) => {
          if (index < values.length) {
            data[header] = this._parseValue(values[index]);
          }
        });

        // Validate required fields (id, at minimum)
        if (!data.id) {
          errors.push(`Row ${i + 1}: Missing required field 'id'`);
          failed++;
          continue;
        }

        entities.push({
          id: data.id,
          data,
        });

        success++;
      } catch (error) {
        errors.push(
          `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        failed++;
      }
    }

    // Perform bulk sync
    if (entities.length > 0) {
      try {
        await FirestoreSyncService.batchSyncEntities(
          teamId,
          entityType,
          entities,
          userId
        );
      } catch (error) {
        return {
          success: 0,
          failed: entities.length,
          errors: [
            `Sync error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ],
        };
      }
    }

    return { success, failed, errors };
  }

  /**
   * Import from JSON format
   */
  static async importFromJSON(
    teamId: string,
    entityType: string,
    jsonContent: string,
    userId: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const errors: string[] = [];

    try {
      const data = JSON.parse(jsonContent);

      if (!Array.isArray(data)) {
        return {
          success: 0,
          failed: 0,
          errors: ['JSON must contain an array of objects'],
        };
      }

      let success = 0;
      let failed = 0;

      const entities: Array<{ id: string; data: Record<string, any> }> = [];

      data.forEach((item, index) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          errors.push(`Item ${index + 1}: Must be an object`);
          failed++;
          return;
        }

        if (!item.id) {
          errors.push(`Item ${index + 1}: Missing required field 'id'`);
          failed++;
          return;
        }

        entities.push({
          id: item.id,
          data: item,
        });

        success++;
      });

      // Perform bulk sync
      if (entities.length > 0) {
        try {
          await FirestoreSyncService.batchSyncEntities(
            teamId,
            entityType,
            entities,
            userId
          );
        } catch (error) {
          return {
            success: 0,
            failed: entities.length,
            errors: [
              `Sync error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            ],
          };
        }
      }

      return { success, failed, errors };
    } catch (error) {
      return {
        success: 0,
        failed: 0,
        errors: [
          `JSON parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  /**
   * Download file helper
   */
  static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Parse CSV line handling quoted values
   */
  private static _parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Parse value from CSV/JSON
   */
  private static _parseValue(value: string | any): any {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();

    // Try to parse as JSON
    if (trimmed === 'null') return null;
    if (trimmed === 'undefined') return undefined;
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;

    // Try to parse as number
    if (!isNaN(Number(trimmed)) && trimmed !== '') {
      return Number(trimmed);
    }

    // Try to parse as JSON object/array
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return JSON.parse(trimmed);
      } catch {
        // Fall through to return as string
      }
    }

    return trimmed;
  }

  /**
   * Validate imported data
   */
  static validateImportData(
    data: Record<string, any>[],
    requiredFields: string[] = ['id']
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
      errors.push('Data must be an array');
      return { valid: false, errors };
    }

    data.forEach((item, index) => {
      requiredFields.forEach((field) => {
        if (!item[field]) {
          errors.push(`Item ${index + 1}: Missing required field '${field}'`);
        }
      });
    });

    return { valid: errors.length === 0, errors };
  }
}
