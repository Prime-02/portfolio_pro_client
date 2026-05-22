"use client";

// FolderTree.tsx — recursive collapsible folder navigation

import { useState } from "react";
import type { FolderNode } from "./types";

interface FolderTreeProps {
    node: FolderNode;
    currentPath: string;
    onNavigate: (path: string) => void;
    level?: number;
}

function FolderTreeItem({ node, currentPath, onNavigate, level = 0 }: FolderTreeProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const isActive = node.path === currentPath;
    const hasChildren = node.subfolders.length > 0;

    return (
        <div>
            <button
                onClick={() => {
                    onNavigate(node.path);
                    if (hasChildren) setIsExpanded((e) => !e);
                }}
                className="w-full text-left flex items-center gap-1.5 py-1 px-2 rounded-sm transition-all duration-150 font-mono text-[11px]"
                style={{
                    paddingLeft: `${level * 12 + 8}px`,
                    backgroundColor: isActive ? "rgba(var(--foreground-rgb, 255,255,255), 0.08)" : "transparent",
                    color: isActive ? "var(--foreground)" : "rgba(var(--foreground-rgb, 255,255,255), 0.5)",
                    fontWeight: isActive ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "rgba(var(--foreground-rgb, 255,255,255), 0.04)";
                }}
                onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                }}
            >
                {hasChildren && (
                    <span
                        className="text-[9px] inline-block w-3 text-center transition-transform duration-150"
                        style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", opacity: 0.4 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded((e) => !e);
                        }}
                    >
                        ▶
                    </span>
                )}
                {!hasChildren && <span className="inline-block w-3" />}
                <span style={{ opacity: 0.6 }}>📁</span>
                <span className="truncate">{node.name}</span>
            </button>

            {isExpanded && hasChildren && (
                <div>
                    {node.subfolders.map((child) => (
                        <FolderTreeItem
                            key={child.path}
                            node={child}
                            currentPath={currentPath}
                            onNavigate={onNavigate}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface FolderTreePanelProps {
    folderTree: FolderNode | null;
    currentPath: string;
    onNavigate: (path: string) => void;
    isLoading: boolean;
}

export function FolderTreePanel({
    folderTree,
    currentPath,
    onNavigate,
    isLoading,
}: FolderTreePanelProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3">
                <span
                    className="text-[10px] tracking-[0.15em] font-mono"
                    style={{ color: "var(--foreground)", opacity: 0.4 }}
                >
                    FOLDERS
                </span>
                <div
                    className="flex-1 h-px"
                    style={{ backgroundColor: "var(--foreground)", opacity: 0.1 }}
                />
            </div>

            {isLoading && (
                <div className="text-[10px] font-mono py-4 text-center" style={{ opacity: 0.3 }}>
                    Loading folders…
                </div>
            )}

            {folderTree && (
                <div className="flex-1 overflow-y-auto">
                    <FolderTreeItem
                        node={folderTree}
                        currentPath={currentPath}
                        onNavigate={onNavigate}
                    />
                </div>
            )}
        </div>
    );
}