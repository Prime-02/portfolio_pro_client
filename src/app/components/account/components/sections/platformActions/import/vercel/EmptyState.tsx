"use client";

// EmptyState.tsx
// Displayed when no Vercel projects are found

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
              d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.377 0-4.485-.352-6.291-1.002m12.582 0c1.042.52 1.989 1.177 2.81 1.945M12 3a8.997 8.997 0 00-7.843 4.582"
            />
          </svg>
        </div>
        <h3 className="font-league-600 text-lg text-[var(--foreground)] mb-2">
          No Vercel projects found
        </h3>
        <p className="text-sm text-[var(--foreground)]/60 max-w-sm mb-6">
          We couldn&apos;t find any Vercel projects to import. Make sure your Vercel account is connected and has active projects.
        </p>
        <Button variant="outline" onClick={onRefresh} isLoading={isLoading}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Refresh projects
        </Button>
      </CardContent>
    </Card>
  );
};
