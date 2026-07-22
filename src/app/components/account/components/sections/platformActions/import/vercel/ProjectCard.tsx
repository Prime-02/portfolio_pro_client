"use client";

// ProjectCard.tsx
// Individual Vercel project card with selection, info display, and import action

import React from "react";
import { Card, CardContent, Button, Badge, Tooltip } from "./ui-components";
import { ProjectCardProps } from "./types";
import { cn } from "@/lib/utilities/syncFunctions/syncs";
import CheckBox from "@/src/app/components/inputs/CheckBox";

// Framework icon mapping
const frameworkIcons: Record<string, string> = {
  nextjs: "Next.js",
  react: "React",
  vue: "Vue",
  nuxt: "Nuxt",
  svelte: "Svelte",
  angular: "Angular",
  gatsby: "Gatsby",
  remix: "Remix",
  astro: "Astro",
  hexo: "Hexo",
  hugo: "Hugo",
  jekyll: "Jekyll",
  eleventy: "11ty",
  docusaurus: "Docusaurus",
  parcel: "Parcel",
  preact: "Preact",
  solid: "Solid",
  dojo: "Dojo",
  ember: "Ember",
  polymer: "Polymer",
  sapper: "Sapper",
  scully: "Scully",
  stencil: "Stencil",
  gridsome: "Gridsome",
  umijs: "UmiJS",
  vite: "Vite",
  cra: "Create React App",
};

const getFrameworkDisplay = (framework?: string) => {
  if (!framework) return null;
  return frameworkIcons[framework.toLowerCase()] || framework;
};

const formatDate = (timestamp?: number) => {
  if (!timestamp) return "Unknown";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getDeploymentStatusColor = (state?: string) => {
  switch (state?.toLowerCase()) {
    case "ready":
    case "success":
      return "text-green-500";
    case "error":
    case "failed":
      return "text-red-500";
    case "building":
    case "queued":
      return "text-yellow-500";
    default:
      return "text-[var(--foreground)]/40";
  }
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isSelected,
  isImporting,
  importStatus,
  onSelect,
  onImportSingle,
}) => {
  const isSuccess = importStatus === "success";
  const isError = importStatus === "error";
  const frameworkDisplay = getFrameworkDisplay(project.framework);

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200",
        isSelected && "border-[var(--foreground)]/30 ring-1 ring-[var(--foreground)]/10",
        isSuccess && "border-green-200",
        isError && "border-red-200"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="pt-1">
            <CheckBox
              isChecked={isSelected}
              setIsChecked={(e) => onSelect(project.name, e)}
              disabled={isImporting || isSuccess}
            />
          </div>

          {/* Project Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-league-600 text-base text-[var(--foreground)] truncate">
                    {project.name}
                  </h4>
                  {project.live && (
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">
                      Live
                    </Badge>
                  )}
                  {project.sso_protected && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      SSO
                    </Badge>
                  )}
                  {isSuccess && (
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">
                      Imported
                    </Badge>
                  )}
                </div>
                {project.production_url && (
                  <a
                    href={project.production_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline truncate block mt-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {project.production_url}
                  </a>
                )}
              </div>

              {/* Import Button */}
              <Button
                variant={isSuccess ? "secondary" : "outline"}
                size="sm"
                className="shrink-0"
                onClick={() => onImportSingle(project)}
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
              {frameworkDisplay && (
                <Tooltip content={frameworkDisplay}>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {frameworkDisplay}
                  </Badge>
                </Tooltip>
              )}

              {project.node_version && (
                <span className="text-xs text-[var(--foreground)]/60">
                  Node {project.node_version}
                </span>
              )}

              {project.latest_deployment && (
                <div className="flex items-center gap-1.5">
                  <span className={cn("h-2 w-2 rounded-full", getDeploymentStatusColor(project.latest_deployment.ready_state))} />
                  <span className="text-xs text-[var(--foreground)]/60">
                    {project.latest_deployment.ready_state || "Unknown"}
                  </span>
                </div>
              )}

              {project.updated_at && (
                <span className="text-xs text-[var(--foreground)]/40">
                  Updated {formatDate(project.updated_at)}
                </span>
              )}

              {project.created_at && (
                <span className="text-xs text-[var(--foreground)]/40">
                  Created {formatDate(project.created_at)}
                </span>
              )}
            </div>

            {/* GitHub Link */}
            {project.github_link && (
              <div className="mt-2 flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-[var(--foreground)]/40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <a
                  href={project.github_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {project.github_link.replace("https://github.com/", "")}
                </a>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
