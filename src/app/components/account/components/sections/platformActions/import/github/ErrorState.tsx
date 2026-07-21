"use client";

// ErrorState.tsx
// Displayed when an error occurs during fetching or importing

import React from "react";
import { Button, Alert, AlertTitle, AlertDescription } from "./ui-components";
import { ErrorStateProps } from "./types";

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <Alert variant="destructive" className="mb-6">
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 mt-0.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        <div className="flex-1">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="mt-1">{error}</AlertDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="shrink-0 border-red-200 hover:bg-red-50"
        >
          <svg
            className="h-4 w-4 mr-1"
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
          Retry
        </Button>
      </div>
    </Alert>
  );
};
