import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Textinput } from "@/app/components/inputs/Textinput";
import { TextArea } from "@/app/components/inputs/TextArea";
import ImageCropper from "@/app/components/inputs/ImageUploader";
import { useGlobalState } from "@/app/globalStateProvider";
import { useContentStore } from "@/app/stores/posts_store/PostsHandler";
import CloseButton from "@/app/components/buttons/CloseButton";
import Button from "@/app/components/buttons/Buttons";

const PostsBodyParser = ({
  action,
  value,
  onChange,
  isOpen,
  onClose,
  save,
}: {
  action: string;
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onClose: () => void;
  save: (data: {
    file: File | null;
    croppedImage: string | null;
  }) => Promise<void>;
}) => {
  const { isLoading } = useGlobalState();
  const { currentContent } = useContentStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Auto-focus on the input/textarea when opened
      if (action.startsWith("media") || action.startsWith("header")) {
        inputRef.current?.focus();
      } else {
        textareaRef.current?.focus();
      }
    }
  }, [isOpen, action]);

  if (!isOpen) return null;

  const getPlaceholder = () => {
    if (action.startsWith("header")) return "Enter header...";
    if (action.startsWith("text")) return "Enter paragraph...";
    if (action.startsWith("quote")) return "Enter quote...";
    if (action.startsWith("media")) return "Enter image URL...";
    return "Enter content...";
  };

  const isHeader = action.startsWith("header");
  const isMedia = action.startsWith("media");
  return (
    <div className="absolute top-full left-0 w-full  z-40">
      {/* <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium capitalize">
          {action.replace(/[0-9]/g, "")}
        </span>
        <button
          onClick={onClose}
          className="p-0.5 hover:text-[var(--accent)] transition-colors rounded"
        >
          <X size={16} />
        </button>
      </div> */}

      {isHeader ? (
        <Textinput
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e)}
          label={getPlaceholder()}
        />
      ) : isMedia ? (
        <div>
          <ImageCropper
            onFinish={save}
            loading={isLoading(`updating_content_${currentContent?.id}`)}
            onFinishText="Upload and continue"
          />
        </div>
      ) : (
        <TextArea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e)}
          label={getPlaceholder()}
        />
      )}
      <div className="mt-2 w-32">
        <Button text="Cancel" variant="outline" onClick={onClose} />
      </div>
    </div>
  );
};

export default PostsBodyParser;
