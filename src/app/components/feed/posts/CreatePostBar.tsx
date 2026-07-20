"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { useContentStore } from "@/lib/stores/contents/useContentStore";
import { useContentTagStore } from "@/lib/stores/contents/useContentTagStore";
import { Send, Hash, ImagePlus, X } from "lucide-react";
import type { ContentTagResponse } from "@/lib/stores/contents/types/content.types";
import { TextArea } from "../../inputs/TextArea";
import Button from "../../buttons/Buttons";
import AIAssistant from "../../ai/AIAsistant";
import { getPromptOptions } from "./postPromptOptions";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

interface CreatePostBarProps {
  onPostCreated?: () => void;
}
export default function CreatePostBar({ onPostCreated }: CreatePostBarProps) {
  const { router } = useRouting()
  const { userInfo } = useUserSettings()
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagQuery, setTagQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedTagIndex, setSelectedTagIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createContent = useContentStore((s) => s.createContent);
  const fetchTags = useContentTagStore((s) => s.fetchTags);
  const tags = useContentTagStore((s) => s.tags);
  const isLoadingTags = useContentTagStore((s) => s.isLoading);

  // Extract hashtags from text
  const extractTags = useCallback((input: string): string[] => {
    const matches = input.match(/#[\w-]+/g);
    if (!matches) return [];
    return matches.map((t) => t.slice(1).toLowerCase());
  }, []);

  // Handle image selection
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow images
    if (!file.type.startsWith("image/")) {
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Remove selected image
  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Handle textarea input changes
  const handleTextChange = useCallback(
    (value: string) => {
      setText(value);

      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursor = textarea.selectionStart;
      setCursorPosition(cursor);

      const beforeCursor = value.slice(0, cursor);
      const afterCursor = value.slice(cursor);

      const hashBefore = beforeCursor.lastIndexOf("#");
      const spaceBefore = beforeCursor.lastIndexOf(" ");

      if (
        hashBefore !== -1 &&
        hashBefore > spaceBefore &&
        !afterCursor.includes(" ") &&
        !afterCursor.includes("\n")
      ) {
        const query = beforeCursor.slice(hashBefore + 1);
        if (query.length >= 0) {
          setTagQuery(query);
          setShowTagDropdown(true);
          setSelectedTagIndex(0);
          fetchTags({ search: query, is_trending: false, page_size: 100 });
        }
      } else {
        setShowTagDropdown(false);
        setTagQuery("");
      }
    },
    [fetchTags]
  );

  // Handle AI response
  const handleAIResponse = useCallback((response: string) => {
    setText(response);
    // Focus back on textarea after replacement
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        // Set cursor at the end of the new text
        const length = response.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    }, 0);
  }, []);

  // Handle tag selection
  const handleTagSelect = useCallback(
    (tag: ContentTagResponse) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const beforeCursor = text.slice(0, cursorPosition);
      const afterCursor = text.slice(cursorPosition);

      const hashBefore = beforeCursor.lastIndexOf("#");
      const newBefore = beforeCursor.slice(0, hashBefore) + "#" + tag.tag_name;
      const newText = newBefore + " " + afterCursor;

      setText(newText);
      setShowTagDropdown(false);
      setTagQuery("");

      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = newBefore.length + 1;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    },
    [text, cursorPosition]
  );

  // Keyboard navigation for tag dropdown
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showTagDropdown || tags.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedTagIndex((prev) => (prev + 1) % tags.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedTagIndex((prev) => (prev - 1 + tags.length) % tags.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        handleTagSelect(tags[selectedTagIndex]);
      } else if (e.key === "Escape") {
        setShowTagDropdown(false);
      }
    },
    [showTagDropdown, tags, selectedTagIndex, handleTagSelect]
  );

  const handleRouteToBlog = () => {
    router.push(`/${userInfo?.username}/blogs/create`)
  }

  // Submit post
  const handleSubmit = useCallback(async () => {
    if (!text.trim() && !selectedImage) return;

    setIsSubmitting(true);
    try {
      const extractedTags = extractTags(text);

      await createContent({
        title: text.slice(0, 100) || "Post",
        content_type: "POST",
        body: text,
        excerpt: text.slice(0, 200),
        tags: extractedTags.join(","),
        status: "PUBLISHED",
        is_public: true,
        allow_comments: true,
        allow_likes: true,
        allow_reshare: true,
        cover_image: selectedImage || undefined,
      });

      setText("");
      setShowTagDropdown(false);
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onPostCreated?.();
    } catch {
      // Error handled by store
    } finally {
      setIsSubmitting(false);
    }
  }, [text, selectedImage, createContent, extractTags, onPostCreated]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <div
        className="rounded-2xl border border-[var(--foreground)]/10 p-4"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 relative">
            <div className="relative">
              <TextArea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="What's on your mind?"
                className="modText min-h-[80px] resize-none pr-12"
              />

              {/* AI Assistant positioned absolutely within the textarea container */}
              <div className="absolute bottom-2 right-2">
                <AIAssistant
                  options={getPromptOptions(text)}
                  onChange={handleAIResponse}
                />
              </div>
            </div>

            {/* Tag Autocomplete Dropdown */}
            {showTagDropdown && (
              <div
                ref={dropdownRef}
                className="absolute z-50 left-0 right-0 mt-1 rounded-xl border custom-scrollbar border-[var(--foreground)]/10 shadow-xl overflow-hidden"
                style={{
                  backgroundColor: "var(--background)",
                  maxHeight: "240px",
                  overflowY: "auto",
                }}
              >
                {isLoadingTags && tags.length === 0 ? (
                  <div className="p-3 text-sm text-[var(--foreground)]/50 text-center">
                    Loading tags...
                  </div>
                ) : tags.length === 0 ? (
                  <div className="p-3 text-sm text-[var(--foreground)]/50 text-center">
                    No tags found
                  </div>
                ) : (
                  tags.map((tag, index) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagSelect(tag)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${index === selectedTagIndex
                        ? "bg-[var(--accent)]/10"
                        : "hover:bg-[var(--foreground)]/5"
                        }`}
                    >
                      <span className="block text-xs text-[var(--foreground)]/50">
                        #{tag.normalized_name}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative mt-3 inline-block">
            <div className="relative rounded-xl overflow-hidden border border-[var(--foreground)]/10">
              <img
                src={imagePreview}
                alt="Preview"
                width={400}
                height={192}
                className="max-h-48 w-auto object-cover"
                style={{ width: 'auto', height: 'auto' }}
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                title="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <Button
            text="Write a Blog/Article"
            onClick={handleRouteToBlog}
            size="sm"
            variant="outline"
            className="w-auto px-5"
          />
          <div className="flex items-center gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5 hover:text-[var(--accent)] transition-colors"
                title="Add image"
              >
                <ImagePlus size={18} />
                <span className="hidden sm:inline">Add Image</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
            <Button
              icon={<Send size={16} />}
              text="Post"
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={(!text.trim() && !selectedImage) || isSubmitting}
              size="sm"
              variant="primary"
              className="w-auto px-5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}