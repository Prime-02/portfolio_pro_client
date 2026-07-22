"use client";

// ImportStatus.tsx
// Shows import progress, results, and status updates

import React from "react";
import {
  Card,
  CardContent,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
} from "./ui-components";
import { ImportStatusProps } from "./types";
import { cn } from "@/lib/utilities/syncFunctions/syncs";

export const ImportStatus: React.FC<ImportStatusProps> = ({
  batchResult,
  isImportingBatch,
  batchError,
  singleResults,
}) => {
  const hasSingleResults = Object.keys(singleResults).length > 0;
  const successCount = Object.values(singleResults).filter((r) => r.success).length;
  const errorCount = Object.values(singleResults).filter((r) => !r.success).length;

  // Don't show anything if no activity
  if (!batchResult && !isImportingBatch && !batchError && !hasSingleResults) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Batch Import Progress */}
      {isImportingBatch && (
        <Card className="border-blue-200 ">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg
                  className="animate-spin h-5 w-5 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-[var(--foreground)]">
                  Importing repositories...
                </p>
                <p className="text-xs text-[var(--foreground)]/60">
                  This may take a moment depending on the number of repositories.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Import Result */}
      {batchResult && !isImportingBatch && (
        <Card
          className={cn(
            batchResult.errors > 0
              ? "border-yellow-200 "
              : "border-green-200 "
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {batchResult.errors > 0 ? (
                  <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm text-[var(--foreground)]">
                    Import {batchResult.errors > 0 ? "completed with issues" : "completed successfully"}
                  </p>
                  <Badge variant={batchResult.errors > 0 ? "destructive" : "success"} className="text-[10px]">
                    {batchResult.imported} imported
                  </Badge>
                  {batchResult.skipped > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      {batchResult.skipped} skipped
                    </Badge>
                  )}
                  {batchResult.errors > 0 && (
                    <Badge variant="destructive" className="text-[10px]">
                      {batchResult.errors} errors
                    </Badge>
                  )}
                </div>
                {/* <p className="text-xs text-[var(--foreground)]/60 mt-1">
                  {batchResult.message}
                </p> */}
                {batchResult.error_messages && batchResult.error_messages.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {batchResult.error_messages.map((msg, idx) => (
                      <p key={idx} className="text-xs text-red-600">
                        &bull; {msg}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Single Import Results Summary */}
      {hasSingleResults && !batchResult && (
        <Card className={errorCount > 0 ? "border-yellow-200 " : "border-green-200 "}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {errorCount > 0 ? (
                  <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm text-[var(--foreground)]">
                    {errorCount > 0 ? "Some imports completed" : "Import completed"}
                  </p>
                  <Badge variant="success" className="text-[10px]">
                    {successCount} success
                  </Badge>
                  {errorCount > 0 && (
                    <Badge variant="destructive" className="text-[10px]">
                      {errorCount} failed
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-[var(--foreground)]/60 mt-1">
                  {Object.keys(singleResults).length} repositories processed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Error */}
      {batchError && (
        <Alert variant="destructive">
          <AlertTitle>Import failed</AlertTitle>
          <AlertDescription>{batchError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
