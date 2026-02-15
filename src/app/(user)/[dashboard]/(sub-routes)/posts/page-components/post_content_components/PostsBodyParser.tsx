import React, { useState, useEffect, useRef } from "react";
import { TextArea } from "@/app/components/inputs/TextArea";
import ImageCropper from "@/app/components/inputs/ImageUploader";
import { useContentStore } from "@/app/stores/posts_store/PostsHandler";
import { useGlobalState } from "@/app/globalStateProvider";
import TextColorPreset from "./TextColorPreset";
import CloseButton from "@/app/components/buttons/CloseButton";
import PostBodyRenderer from "./PostBodyRenderer";

const PostsBodyParser = ({
  setBody,
  body,
  action,
  value,
  onChange,
  isOpen,
  onClose,
  save,
  setActiveAction,
}: {
  setBody: (body: Record<string, string>[]) => void;
  body: Record<string, string>[] | undefined;
  action: string;
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onClose: () => void;
  save: (data: {
    file: File | null;
    croppedImage: string | null;
  }) => Promise<void>;
  setActiveAction: (index: number) => void;
}) => {
  const { currentContent } = useContentStore();
  const { isLoading } = useGlobalState();
  const [color, setColor] = useState<string>("#000000");
  const [localText, setLocalText] = useState<string>("");
  const firstActionRef = useRef<boolean>(true);

  // Parse initial value to extract text and color
  useEffect(() => {
    if (value) {
      const hexMatch = value.match(/#[0-9a-fA-F]{6}$/);
      if (hexMatch) {
        const hexCode = hexMatch[0];
        const textWithoutColor = value.slice(0, -7); // Remove hex code
        setLocalText(textWithoutColor);
        setColor(hexCode);
      } else {
        setLocalText(value);
      }
    }
  }, [value]);

  // Reset local values when `action` changes (but not on initial mount)
  useEffect(() => {
    if (firstActionRef.current) {
      firstActionRef.current = false;
      return;
    }
    setLocalText("");
    onChange("");
  }, [action]);

  // Handle text change
  const handleTextChange = (newText: string) => {
    setLocalText(newText);
    // Update parent with text + color
    onChange(`${newText}${color}`);
  };

  // Handle color change
  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    // Update parent with text + new color
    onChange(`${localText}${newColor}`);
  };

  return (
    <div className="relative h-auto ">
      <PostBodyRenderer
        setBody={setBody}
        save={save}
        onClose={onClose}
        setActiveAction={setActiveAction}
        body={body}
        action={action}
        value={value}
        onChange={onChange}
        isOpen={isOpen}
        activeTab={
          <div className="min-h-[50dvh] h-auto items-center justify-center flex flex-col text-3xl font-bold w-full">
            {!isOpen && (
              <h1 className="md:text-5xl text-3xl font-bold opacity-35 text-center h-full flex items-center justify-center">
                Select an action to add to post
              </h1>
            )}
            {action.startsWith("text") && (
              <div className="w-full h-full flex items-center justify-center">
                <TextArea
                  value={localText}
                  className={`modText md:text-5xl text-3xl h-full text-white font-bold text-center border-none w-full`}
                  placeholder="What's on your mind?"
                  onChange={handleTextChange}
                  showLimit
                  maxLength={500}
                  style={{ backgroundColor: color }}
                />
              </div>
            )}
            {action.startsWith("media") && (
              <div>
                <div className="mt-2 absolute top-0  z-50 right-0 flex gap-3 items-center ">
                  <CloseButton onClick={onClose} />
                </div>
                <ImageCropper
                  onFinish={save}
                  loading={isLoading(`updating_content_${currentContent?.id}`)}
                  onFinishText="Upload and continue"
                  className="w-full h-full"
                />
              </div>
            )}
            {action.startsWith("text") && (
              <div className="mt-2 absolute top-0  z-50 right-0 flex gap-3 items-center ">
                <TextColorPreset color={color} setColor={handleColorChange} />
                <CloseButton onClick={onClose} />
              </div>
            )}
          </div>
        }
      />
    </div>
  );
};

export default PostsBodyParser;
