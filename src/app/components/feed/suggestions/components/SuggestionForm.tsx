"use client";

import React, { useState } from "react";
import { Plus, X, Send } from "lucide-react";
import { useSuggestionsStore } from "@/lib/stores/suggestions/useSuggestions";
import Dropdown from "../../../inputs/DynamicDropdown";
import { suggestionTitles } from "@/lib/utilities/indices/DropDownItems";
import { TextArea } from "../../../inputs/TextArea";
import AIAssistant from "../../../ai/AIAsistant";
import { getSuggestionOptions } from "./suggestionsPromptOptions";
import { toast } from "../../../../../context/Toastify";
import Button from "../../../buttons/Buttons";

export default function SuggestionForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createSuggestion = useSuggestionsStore((s) => s.createSuggestion);
  const isCreating = useSuggestionsStore((s) => s.loading["createSuggestion"] ?? false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const created = await createSuggestion({
      title: title.trim(),
      description: description.trim(),
    });

    if (created) {
      setTitle("");
      setDescription("");
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-[var(--foreground)]/15 text-[var(--foreground)]/50 hover:border-[var(--accent)]/30 hover:text-[var(--accent)] transition-all duration-200 text-sm font-medium"
      >
        <Plus size={16} />
        Submit a Suggestion
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--foreground)]/10 p-5 space-y-3"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          New Suggestion
        </h3>
        <button
          type="button"
          onClick={handleCancel}
          className="p-1 rounded-full hover:bg-[var(--foreground)]/5 text-[var(--foreground)]/40 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <Dropdown
        onSelect={(e) => setTitle(e as string)}
        type="datalist"
        options={suggestionTitles}
        value={title}
        placeholder="Select a title"
        label="Suggestion Title"
        className="rounded-full outline focus:outline-[var(--accent)]"
        includeQueryAsOption
        includeNoneOption={false}
      />
      <div className="relative">
        <TextArea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e)}
        />
        {/* AI Assistant positioned absolutely within the textarea container */}
        <div className="absolute bottom-2 right-2">
          <AIAssistant
            options={getSuggestionOptions(description)}
            onChange={(e) => setDescription(e)}
            onEmptyClick={() => {
              toast.info("Description is empty or doesn't contain valid words", {
                title: "Suggestion options not available",
                sound: true,
              });
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          onClick={handleCancel}
          text="Cancel"
          type="button"
          variant="outline"
          size="sm"
        />
        <Button
          disabled={isCreating || !title.trim() || !description.trim()}
          loading={isCreating}
          type="submit"
          size="sm"
          text="Submit"
        />
      </div>
    </form>
  );
}
