'use client';

import {
  useMutation,
  UseMutationResult,
} from '@tanstack/react-query';
import { ImportExportService } from '@/services/importExport.service';

/**
 * Hook for exporting entities to CSV
 */
export function useExportToCSV(
  teamId: string
): UseMutationResult<
  string,
  Error,
  {
    entityType: string;
    filters?: Array<{ field: string; operator: string; value: any }>;
  }
> {
  return useMutation({
    mutationFn: async ({ entityType, filters }) => {
      const csv = await ImportExportService.exportToCSV(
        teamId,
        entityType,
        filters
      );
      return csv;
    },
  });
}

/**
 * Hook for exporting entities to JSON
 */
export function useExportToJSON(
  teamId: string
): UseMutationResult<
  string,
  Error,
  {
    entityType: string;
    filters?: Array<{ field: string; operator: string; value: any }>;
  }
> {
  return useMutation({
    mutationFn: async ({ entityType, filters }) => {
      const json = await ImportExportService.exportToJSON(
        teamId,
        entityType,
        filters
      );
      return json;
    },
  });
}

/**
 * Hook for importing entities from CSV
 */
export function useImportFromCSV(
  teamId: string
): UseMutationResult<
  { success: number; failed: number; errors: string[] },
  Error,
  {
    entityType: string;
    csvContent: string;
    userId: string;
  }
> {
  return useMutation({
    mutationFn: async ({ entityType, csvContent, userId }) => {
      const result = await ImportExportService.importFromCSV(
        teamId,
        entityType,
        csvContent,
        userId
      );
      return result;
    },
  });
}

/**
 * Hook for importing entities from JSON
 */
export function useImportFromJSON(
  teamId: string
): UseMutationResult<
  { success: number; failed: number; errors: string[] },
  Error,
  {
    entityType: string;
    jsonContent: string;
    userId: string;
  }
> {
  return useMutation({
    mutationFn: async ({ entityType, jsonContent, userId }) => {
      const result = await ImportExportService.importFromJSON(
        teamId,
        entityType,
        jsonContent,
        userId
      );
      return result;
    },
  });
}

/**
 * Hook for validating import data
 */
export function useValidateImportData(): UseMutationResult<
  { valid: boolean; errors: string[] },
  Error,
  {
    data: Record<string, any>[];
    requiredFields?: string[];
  }
> {
  return useMutation({
    mutationFn: async ({ data, requiredFields }) => {
      const result = ImportExportService.validateImportData(
        data,
        requiredFields
      );
      return result;
    },
  });
}

/**
 * Hook for downloading CSV file
 */
export function useDownloadCSV(): UseMutationResult<
  void,
  Error,
  {
    content: string;
    filename: string;
  }
> {
  return useMutation({
    mutationFn: async ({ content, filename }) => {
      ImportExportService.downloadFile(
        content,
        filename,
        'text/csv;charset=utf-8;'
      );
    },
  });
}

/**
 * Hook for downloading JSON file
 */
export function useDownloadJSON(): UseMutationResult<
  void,
  Error,
  {
    content: string;
    filename: string;
  }
> {
  return useMutation({
    mutationFn: async ({ content, filename }) => {
      ImportExportService.downloadFile(
        content,
        filename,
        'application/json;charset=utf-8;'
      );
    },
  });
}
