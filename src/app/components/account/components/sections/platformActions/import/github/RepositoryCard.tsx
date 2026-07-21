"use client";

// RepositoryCard.tsx
// Individual repository card with selection, info display, and import action

import React from "react";
import {
  Card,
  CardContent,
  Button,
  Checkbox,
  Badge,
  Tooltip,
} from "./ui-components";
import { RepositoryCardProps } from "./types";
import { cn } from "@/lib/utilities/syncFunctions/syncs";

// Language color mapping
const languageColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-blue-400",
  Java: "bg-orange-500",
  Go: "bg-cyan-400",
  Rust: "bg-orange-700",
  "C++": "bg-pink-500",
  C: "bg-gray-500",
  "C#": "bg-purple-500",
  Ruby: "bg-red-500",
  PHP: "bg-indigo-400",
  Swift: "bg-orange-400",
  Kotlin: "bg-purple-400",
  Dart: "bg-teal-400",
  Vue: "bg-green-500",
  HTML: "bg-orange-600",
  CSS: "bg-blue-600",
  Shell: "bg-green-600",
  default: "bg-[var(--foreground)]/30",
};

const getLanguageColor = (lang?: string) => {
  if (!lang) return languageColors.default;
  return languageColors[lang] || languageColors.default;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
};

export const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repo,
  isSelected,
  isImporting,
  importStatus,
  onSelect,
  onImportSingle,
}) => {
  const isSuccess = importStatus === "success";
  const isError = importStatus === "error";

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        isSelected && "border-[var(--foreground)]/30 ring-1 ring-[var(--foreground)]/10",
        isSuccess && "border-green-200 bg-green-50/50",
        isError && "border-red-200 bg-red-50/50"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="pt-1">
            <Checkbox
              checked={isSelected}
              onChange={(e) => onSelect(repo.name, e.target.checked)}
              disabled={isImporting || isSuccess}
            />
          </div>

          {/* Repository Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-league-600 text-base text-[var(--foreground)] truncate">
                    {repo.name}
                  </h4>
                  {repo.private && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      Private
                    </Badge>
                  )}
                  {repo.archived && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      Archived
                    </Badge>
                  )}
                  {isSuccess && (
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">
                      Imported
                    </Badge>
                  )}
                </div>
                {repo.description && (
                  <p className="text-sm text-[var(--foreground)]/60 mt-1 line-clamp-2">
                    {repo.description}
                  </p>
                )}
              </div>

              {/* Import Button */}
              <Button
                variant={isSuccess ? "secondary" : "outline"}
                size="sm"
                className="shrink-0"
                onClick={() => onImportSingle(repo)}
                disabled={isImporting || isSuccess}
                isLoading={isImporting}
              >
                {isSuccess ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Done
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Import
                  </>
                )}
              </Button>
            </div>

            {/* Metadata Row */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {repo.language && (
                <Tooltip content={repo.language}>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("h-3 w-3 rounded-full", getLanguageColor(repo.language))} />
                    <span className="text-xs text-[var(--foreground)]/60">{repo.language}</span>
                  </div>
                </Tooltip>
              )}

              {repo.stargazers_count > 0 && (
                <Tooltip content={`${repo.stargazers_count} stars`}>
                  <div className="flex items-center gap-1 text-[var(--foreground)]/60">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-xs">{formatNumber(repo.stargazers_count)}</span>
                  </div>
                </Tooltip>
              )}

              {repo.forks_count > 0 && (
                <Tooltip content={`${repo.forks_count} forks`}>
                  <div className="flex items-center gap-1 text-[var(--foreground)]/60">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.287.696.287 1.093m0-1.093c-.18.324-.287.696-.287 1.093m0-1.093a2.25 2.25 0 000 2.186m0-2.186c.18.324.287.696.287 1.093m0-1.093c-.18.324-.287.696-.287 1.093m0-1.093a2.25 2.25 0 000 2.186m0-2.186c.18.324.287.696.287 1.093m0-1.093c-.18.324-.287.696-.287 1.093m0-1.093a2.25 2.25 0 000 2.186m0-2.186c.18.324.287.696.287 1.093m0-1.093c-.18.324-.287.696-.287 1.093m0-1.093a2.25 2.25 0 000 2.186m0-2.186c.18.324.287.696.287 1.093m0-1.093c-.18.324-.287.696-.287 1.093" />
                    </svg>
                    <span className="text-xs">{formatNumber(repo.forks_count)}</span>
                  </div>
                </Tooltip>
              )}

              {repo.updated_at && (
                <span className="text-xs text-[var(--foreground)]/40">
                  Updated {formatDate(repo.updated_at)}
                </span>
              )}

              {repo.size > 0 && (
                <span className="text-xs text-[var(--foreground)]/40">
                  {repo.size > 1024 ? `${(repo.size / 1024).toFixed(1)} MB` : `${repo.size} KB`}
                </span>
              )}
            </div>

            {/* Topics */}
            {repo.topics && repo.topics.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {repo.topics.slice(0, 4).map((topic) => (
                  <Badge key={topic} variant="outline" className="text-[10px] px-1.5 py-0">
                    {topic}
                  </Badge>
                ))}
                {repo.topics.length > 4 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    +{repo.topics.length - 4}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
