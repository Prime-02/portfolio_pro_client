import CloseButton from "@/app/components/buttons/CloseButton";
import {
  CaseUpper,
  Minus,
  Quote,
  Text,
  SendHorizonal,
  ImagePlus,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import ArticleBodyParser from "./ArticleBodyParser";
import { useContentStore } from "@/app/stores/posts_store/PostsHandler";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { getLoader } from "@/app/components/loaders/Loader";
import { useGlobalState } from "@/app/globalStateProvider";
import { ContentType } from "@/app/components/types and interfaces/Posts";
import PostsBodyParser from "./post_content_components/PostsBodyParser";

const ContentBodyManager = ({
  body,
  setBody,
  save,
  contentType,
}: {
  body: Record<string, string>[] | undefined;
  setBody: (body: Record<string, string>[]) => void;
  save: (data?: {
    file: File | null;
    croppedImage: string | null;
  }) => Promise<void>;
  contentType: ContentType;
}) => {
  const { currentContent } = useContentStore();
  const { isLoading } = useGlobalState();
  const { loader, accentColor } = useTheme();
  const [expand, setExpand] = useState(true);
  const [parserOpen, setParserOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState("");
  const [currentIndex, setCurrentIndex] = useState(-1);
  const LoaderComponent = getLoader(loader) || null;

  const countersRef = useRef({
    header: 0,
    text: 0,
    quote: 0,
    divider: 0,
    media: 0,
  });

  // CRITICAL: Initialize counters from existing body to prevent duplicate keys
  const initializeCounters = (
    bodyToScan: Record<string, string>[] | undefined,
  ) => {
    const counters = { header: 0, text: 0, quote: 0, divider: 0, media: 0 };

    if (!bodyToScan || bodyToScan.length === 0) {
      countersRef.current = counters;
      console.log("Reset counters to zero:", counters);
      return;
    }

    bodyToScan.forEach((item) => {
      const key = Object.keys(item)[0];
      const match = key.match(/^(header|text|quote|divider|media)(\d+)$/);
      if (match) {
        const [, type, num] = match;
        const number = parseInt(num, 10);
        if (number > counters[type as keyof typeof counters]) {
          counters[type as keyof typeof counters] = number;
        }
      }
    });

    countersRef.current = counters;
    console.log("Initialized counters:", counters);
  };

  // Initialize counters when body changes
  useEffect(() => {
    initializeCounters(body);
  }, [body]);

  // ALSO initialize when currentContent changes (in case body hasn't propagated yet)
  useEffect(() => {
    if (currentContent?.body) {
      initializeCounters(currentContent.body);
    }
  }, [currentContent?.body]);

  useEffect(() => {
    console.log("Current body:", body);
  }, [body]);

  // Auto-append a text block for POST content types when needed
  const appendTextIfPost = () => {
    if (contentType !== ContentType.POST) return;

    const hasBody = body && body.length > 0;
    if (hasBody) {
      const lastElement = body![body!.length - 1];
      // treat empty string and text elements that are only 6-digit hex colors as "empty"
      const lastKey = Object.keys(lastElement)[0];
      const lastValue = Object.values(lastElement)[0];
      const isTextHex =
        lastKey.startsWith("text") && /^#[0-9A-Fa-f]{6}$/.test(lastValue);
      if (lastValue === "" || isTextHex) return;
    }

    initializeCounters(body);
    countersRef.current.text += 1;
    const actionKey = `text${countersRef.current.text}`;
    const newElement: Record<string, string> = { [actionKey]: "" };
    const newBody = [...(body || []), newElement];
    setBody(newBody);

    // ADD THESE LINES to open the parser:
    setCurrentAction(actionKey);
    setCurrentIndex(newBody.length - 1);
    setParserOpen(true);
  };

  const addBodyElement = (type: string) => {
    // RE-INITIALIZE counters right before adding to be absolutely safe
    initializeCounters(body);

    let newElement: Record<string, string>;
    let actionKey = "";

    switch (type) {
      case "header":
        countersRef.current.header += 1;
        actionKey = `header${countersRef.current.header}`;
        newElement = { [actionKey]: "" };
        console.log(`Adding ${actionKey}`);
        break;
      case "text":
        countersRef.current.text += 1;
        actionKey = `text${countersRef.current.text}`;
        newElement = { [actionKey]: "" };
        console.log(`Adding ${actionKey}`);
        break;
      case "quote":
        countersRef.current.quote += 1;
        actionKey = `quote${countersRef.current.quote}`;
        newElement = { [actionKey]: "" };
        console.log(`Adding ${actionKey}`);
        break;
      case "divider":
        countersRef.current.divider += 1;
        actionKey = `divider${countersRef.current.divider}`;
        newElement = { [actionKey]: actionKey };
        console.log(`Adding ${actionKey}`);
        // Dividers don't need editing, so just add and return
        let updatedBodyDivider = [...(body || [])];
        if (updatedBodyDivider.length > 0) {
          const lastElement = updatedBodyDivider[updatedBodyDivider.length - 1];
          const lastKey = Object.keys(lastElement)[0];
          const lastElementValue = Object.values(lastElement)[0];
          const isTextHex =
            lastKey.startsWith("text") &&
            /^#[0-9A-Fa-f]{6}$/.test(lastElementValue);
          if (lastElementValue === "" || isTextHex) {
            console.log("Removing empty element:", lastElement);
            updatedBodyDivider = updatedBodyDivider.slice(0, -1);
          }
        }
        setBody([...updatedBodyDivider, newElement]);
        return;
      case "media":
        countersRef.current.media += 1;
        actionKey = `media${countersRef.current.media}`;
        newElement = { [actionKey]: "" };
        console.log(`Adding ${actionKey}`);
        break;
      default:
        return;
    }

    // Check if the last element in body has an empty value
    let updatedBody = [...(body || [])];

    if (updatedBody.length > 0) {
      const lastElement = updatedBody[updatedBody.length - 1];
      const lastKey = Object.keys(lastElement)[0];
      const lastElementValue = Object.values(lastElement)[0];
      const isTextHex =
        lastKey.startsWith("text") &&
        /^#[0-9A-Fa-f]{6}$/.test(lastElementValue);

      if (lastElementValue === "" || isTextHex) {
        console.log("Removing empty element:", lastElement);
        updatedBody = updatedBody.slice(0, -1);
      }
    }

    // Append new element
    const newBody = [...updatedBody, newElement];
    setBody(newBody);

    // Open parser for the new element
    setCurrentAction(actionKey);
    setCurrentIndex(newBody.length - 1);
    setParserOpen(true);
  };

  const handleParserChange = (value: string) => {
    if (currentIndex >= 0 && body) {
      const updatedBody = [...body];
      updatedBody[currentIndex] = { [currentAction]: value };
      setBody(updatedBody);
    }
  };

  const handleParserClose = () => {
    setParserOpen(false);
    setCurrentAction("");
    setCurrentIndex(-1);
  };

  const getCurrentValue = () => {
    if (currentIndex >= 0 && body && body[currentIndex]) {
      return body[currentIndex][currentAction] || "";
    }
    return "";
  };

  const setActiveAction = (index: number) => {
    if (index >= 0 && body && body[index]) {
      const actionKey = Object.keys(body[index])[0];
      setCurrentIndex(index);
      setCurrentAction(actionKey);
      setParserOpen(true);
    }
  };

  return (
    <>
      <div className="absolute w-full top-0 z-30 p-1">
        <div className="relative w-full mx-auto">
          {/* Container that slides in/out */}
          <div
            className={`relative flex items-center transition-all duration-300 ease-in-out ${
              expand ? "w-auto opacity-100" : "w-10 opacity-100"
            }`}
          >
            {/* Close button - always visible */}
            <div
              className={`bg-[var(--background)] rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                !expand ? "rotate-45" : "rotate-0"
              }`}
            >
              <CloseButton
                onClick={() => {
                  setExpand(!expand);
                }}
                className="flex-shrink-0 p-1 hover:text-[var(--accent)] hover:bg-[var(--background)] rounded-full transition-colors duration-150"
              />
            </div>

            {/* Toolbar that slides in/out */}
            <div
              className={`flex items-center transition-all duration-300 ease-in-out overflow-hidden ${
                expand
                  ? "ml-2 gap-x-5 w-auto opacity-100 px-4 py-1 bg-[var(--background)] rounded-full border border-[var(--accent)]"
                  : "ml-0 gap-x-0 w-0 opacity-0 px-0 py-0"
              }`}
            >
              {/**
               * Apply a staggered roll-out animation similar to TextColorPreset.
               * We use fixed index positions (0..5) which match the visual order.
               * If an item is conditionally omitted, the delay gaps are harmless.
               */}
              {contentType !== ContentType.POST && (
                <span
                  className="flex-shrink-0 cursor-pointer hover:text-[var(--accent)] transition-colors"
                  onClick={() => addBodyElement("header")}
                  title="New Heading"
                  style={{
                    transition:
                      "transform 260ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease",
                    transitionDelay: expand ? `0ms` : `${(5 - 0) * 20}ms`,
                    transform: expand ? "translateY(0)" : "translateY(-8px)",
                    opacity: expand ? 1 : 0,
                    pointerEvents: expand ? "auto" : "none",
                  }}
                >
                  <CaseUpper />
                </span>
              )}
              <span
                title="New Paragraph"
                className="flex-shrink-0 cursor-pointer hover:text-[var(--accent)] transition-colors"
                onClick={() => addBodyElement("text")}
                style={{
                  transition:
                    "transform 260ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease",
                  transitionDelay: expand ? `40ms` : `${(5 - 1) * 20}ms`,
                  transform: expand ? "translateY(0)" : "translateY(-8px)",
                  opacity: expand ? 1 : 0,
                  pointerEvents: expand ? "auto" : "none",
                }}
              >
                <Text />
              </span>
              {contentType !== ContentType.POST && (
                <span
                  title="New Quote"
                  className="flex-shrink-0 cursor-pointer hover:text-[var(--accent)] transition-colors"
                  onClick={() => addBodyElement("quote")}
                  style={{
                    transition:
                      "transform 260ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease",
                    transitionDelay: expand ? `80ms` : `${(5 - 2) * 20}ms`,
                    transform: expand ? "translateY(0)" : "translateY(-8px)",
                    opacity: expand ? 1 : 0,
                    pointerEvents: expand ? "auto" : "none",
                  }}
                >
                  <Quote />
                </span>
              )}
              <span
                className="flex-shrink-0 cursor-pointer hover:text-[var(--accent)] transition-colors"
                onClick={() => addBodyElement("media")}
                title="New Media"
                style={{
                  transition:
                    "transform 260ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease",
                  transitionDelay: expand ? `120ms` : `${(5 - 3) * 20}ms`,
                  transform: expand ? "translateY(0)" : "translateY(-8px)",
                  opacity: expand ? 1 : 0,
                  pointerEvents: expand ? "auto" : "none",
                }}
              >
                <ImagePlus />
              </span>
              {contentType !== ContentType.POST && (
                <span
                  className="flex-shrink-0 cursor-pointer hover:text-[var(--accent)] transition-colors"
                  onClick={() => addBodyElement("divider")}
                  title="Add Divider"
                  style={{
                    transition:
                      "transform 260ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease",
                    transitionDelay: expand ? `160ms` : `${(5 - 4) * 20}ms`,
                    transform: expand ? "translateY(0)" : "translateY(-8px)",
                    opacity: expand ? 1 : 0,
                    pointerEvents: expand ? "auto" : "none",
                  }}
                >
                  <Minus />
                </span>
              )}
              {isLoading(`updating_content_${currentContent?.id}`) ||
              isLoading(`creating_content`) ? (
                LoaderComponent && (
                  <span
                    className="flex-shrink-0"
                    title="Saving..."
                    style={{
                      transition:
                        "transform 260ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease",
                      transitionDelay: expand ? `200ms` : `${(5 - 5) * 20}ms`,
                      transform: expand ? "translateY(0)" : "translateY(-8px)",
                      opacity: expand ? 1 : 0,
                      pointerEvents: expand ? "auto" : "none",
                    }}
                  >
                    <LoaderComponent size={16} color={accentColor.color} />
                  </span>
                )
              ) : // If this is a POST and there is no body, hide the send button
              contentType === ContentType.POST &&
                (!body || body.length === 0) ? null : (
                <span
                  className="flex-shrink-0 cursor-pointer hover:text-[var(--accent)] transition-colors"
                  onClick={() => save()}
                  title="Save Post"
                  style={{
                    transition:
                      "transform 260ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease",
                    transitionDelay: expand ? `200ms` : `${(5 - 5) * 20}ms`,
                    transform: expand ? "translateY(0)" : "translateY(-8px)",
                    opacity: expand ? 1 : 0,
                    pointerEvents: expand ? "auto" : "none",
                  }}
                >
                  <SendHorizonal />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      {contentType === ContentType.ARTICLE ? (
        <ArticleBodyParser
          action={currentAction}
          value={getCurrentValue()}
          onChange={handleParserChange}
          isOpen={parserOpen}
          onClose={handleParserClose}
          save={save}
        />
      ) : (
        contentType === ContentType.POST && (
          <PostsBodyParser
            setActiveAction={setActiveAction}
            body={body}
            setBody={setBody}
            action={currentAction}
            value={getCurrentValue()}
            onChange={handleParserChange}
            isOpen={parserOpen}
            onClose={handleParserClose}
            save={save}
          />
        )
      )}
    </>
  );
};

export default ContentBodyManager;
