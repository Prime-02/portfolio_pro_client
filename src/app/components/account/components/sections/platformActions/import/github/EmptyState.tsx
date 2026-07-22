"use client";

// EmptyState.tsx
// Displayed when no repositories are found

import React from "react";
import { Button, Card, CardContent } from "./ui-components";
import { EmptyStateProps } from "./types";

export const EmptyState: React.FC<EmptyStateProps> = ({ onRefresh, isLoading }) => {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-[var(--foreground)]/5 p-4">
          <svg
            className="h-8 w-8 text-[var(--foreground)]/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 6.375c0 2.278-3.714 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.714-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.714 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.536 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.714 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
            />
          </svg>
        </div>
        <h3 className="font-league-600 text-lg text-[var(--foreground)] mb-2">
          No repositories found
        </h3>
        <p className="text-sm text-[var(--foreground)]/60 max-w-sm mb-6">
          We couldn&apos;t find any repositories to import. This could mean your GitHub account has no projects, or the connection needs to be refreshed.
        </p>
        <Button
          variant="outline"
          onClick={onRefresh}
          isLoading={isLoading}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
            />
          </svg>
          Refresh repositories
        </Button>
      </CardContent>
    </Card>
  );
};
