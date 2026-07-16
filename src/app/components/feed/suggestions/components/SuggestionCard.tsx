"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ThumbsUp, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import {
  useSuggestionsStore,
  SuggestionResponse,
  useSuggestionVoteState,
  useSuggestionLoading,
} from "@/lib/stores/suggestions/useSuggestions";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import Dropdown from "../../../inputs/DynamicDropdown";
import { suggestionTitles } from "@/lib/utilities/indices/DropDownItems";
import { TextArea } from "../../../inputs/TextArea";
import AIAssistant from "../../../ai/AIAsistant";
import { getSuggestionOptions } from "./suggestionsPromptOptions";
import { toast } from "../../../toastify/Toastify";
import Button from "../../../buttons/Buttons";
import Link from "next/link";

interface SuggestionCardProps {
  suggestion: SuggestionResponse;
  isMine: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function SuggestionCard({ suggestion, isMine }: SuggestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(suggestion.title);
  const [editDescription, setEditDescription] = useState(suggestion.description);
  const [showActions, setShowActions] = useState(false);

  const { userInfo } = useUserSettings();
  const toggleVote = useSuggestionsStore((s) => s.toggleVote);
  const updateSuggestion = useSuggestionsStore((s) => s.updateSuggestion);
  const deleteSuggestion = useSuggestionsStore((s) => s.deleteSuggestion);

  const { voted, count } = useSuggestionVoteState(suggestion.id);
  const isVoting = useSuggestionLoading(`toggleVote:${suggestion.id}`);
  const isUpdating = useSuggestionLoading(`updateSuggestion:${suggestion.id}`);
  const isDeleting = useSuggestionLoading(`deleteSuggestion:${suggestion.id}`);
  const isOwn = suggestion.user_id === userInfo?.id

  const author = suggestion.user;
  const displayName = author?.firstname && author?.lastname
    ? `${author.firstname} ${author.lastname}`
    : author?.username || "Not Set";

  const handleToggleVote = () => {
    if (isOwn) return
    toggleVote(suggestion.id);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editDescription.trim()) return;
    const updated = await updateSuggestion(suggestion.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
    });
    if (updated) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this suggestion?")) return;
    await deleteSuggestion(suggestion.id);
  };

  const handleCancelEdit = () => {
    setEditTitle(suggestion.title);
    setEditDescription(suggestion.description);
    setIsEditing(false);
  };

  return (
    <article
      className="rounded-2xl border border-[var(--foreground)]/10 overflow-hidden transition-all duration-200 hover:shadow-md"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Link
            href={`/${author.username}`}
            className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/15 flex items-center justify-center overflow-hidden border-2 border-[var(--accent)]/20">
              {author?.profile_picture ? (
                <img
                  src={author.profile_picture}
                  alt={displayName || "User avatar"}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-[var(--accent)]">
                  {getInitials(displayName)}
                </span>
              )}
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Author + Time */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[var(--foreground)] text-sm">
                {displayName}
              </span>
              {author?.username && (
                <span className="text-xs text-[var(--foreground)]/40">
                  @{author.username}
                </span>
              )}
              <span className="text-xs text-[var(--foreground)]/30">
                · {formatRelativeTime(suggestion.created_at)}
              </span>
            </div>

            {/* Title & Description */}
            {isEditing ? (
              <div className="mt-2 space-y-2">
                <Dropdown
                  type="datalist"
                  value={editTitle}
                  onSelect={(e) => setEditTitle(e as string)}
                  options={suggestionTitles}
                  placeholder="Select a title"
                  label="Suggestion Title"
                  className="rounded-full outline focus:outline-[var(--accent)]"
                  includeQueryAsOption
                  includeNoneOption={false}
                />
                <div className="relative">
                  <TextArea
                    label="Description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e)}
                  />
                  {/* AI Assistant positioned absolutely within the textarea container */}
                  <div className="absolute bottom-2 right-2">
                    <AIAssistant
                      options={getSuggestionOptions(editDescription)}
                      onChange={(e) => setEditDescription(e)}
                      onEmptyClick={() => {
                        toast.info("Description is empty or doesn't contain valid words", {
                          title: "Suggestion options not available",
                          sound: true,
                        });
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSaveEdit}
                    disabled={isUpdating}
                    loading={isUpdating}
                    text="Save"
                    size="sm"
                  />
                  <Button
                    onClick={handleCancelEdit}
                    text="Cancel"
                    size="sm"
                    variant="outline"
                  />
                </div>
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-[var(--foreground)] mt-1 text-[15px]">
                  {suggestion.title}
                </h3>
                <p className="text-sm text-[var(--foreground)]/70 mt-1 leading-relaxed">
                  {suggestion.description}
                </p>
              </>
            )}

            {/* Actions Row — Vote only */}
            {!isEditing && (
              <div className="flex items-center mt-3">
                {/* Vote Button */}
                <button
                  onClick={handleToggleVote}
                  disabled={isVoting}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                    ${voted
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--foreground)]/5 text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/10"
                    }
                    disabled:opacity-50
                  `}
                >
                  <ThumbsUp size={14} fill={voted ? "currentColor" : "none"} />
                  <span>{count}</span>
                </button>
              </div>
            )}
          </div>

          {/* Mine — Actions Dropdown */}
          {isMine && !isEditing && (
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowActions((p) => !p)}
                className="p-1.5 rounded-full hover:bg-[var(--foreground)]/5 transition-colors text-[var(--foreground)]/40"
              >
                <MoreHorizontal size={16} />
              </button>

              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)] shadow-lg z-20 overflow-hidden">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowActions(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/5 transition-colors"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowActions(false);
                      }}
                      disabled={isDeleting}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/5 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}