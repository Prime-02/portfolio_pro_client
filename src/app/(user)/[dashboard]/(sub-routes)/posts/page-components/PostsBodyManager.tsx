import CloseButton from "@/app/components/buttons/CloseButton";
import { CaseUpper, Minus, Quote, Text, Image } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import PostsBodyParser from "./PostsBodyParser";
import { useContentStore } from "@/app/stores/posts_store/PostsHandler";

const PostsBodyManager = ({
  body,
  setBody,
  save,
}: {
  body: Record<string, string>[] | undefined;
  setBody: (body: Record<string, string>[]) => void;
  save: (data: {
    file: File | null;
    croppedImage: string | null;
  }) => Promise<void>;
}) => {
  const { currentContent } = useContentStore();
  const [expand, setExpand] = useState(true);
  const [parserOpen, setParserOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState("");
  const [currentIndex, setCurrentIndex] = useState(-1);

  const countersRef = useRef({
    header: 0,
    text: 0,
    quote: 0,
    divider: 0,
    media: 0,
  });

  // CRITICAL: Initialize counters from existing body to prevent duplicate keys
  const initializeCounters = (
    bodyToScan: Record<string, string>[] | undefined
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
          const lastElementValue = Object.values(lastElement)[0];
          if (lastElementValue === "") {
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
      const lastElementValue = Object.values(lastElement)[0];

      if (lastElementValue === "") {
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

  return (
    <>
      <div className="sticky left-1/2 top-0 z-30 p-1">
        <div className="relative w-fit transition duration-300 p-1">
          <div
            className={`bg-[var(--background)] absolute left-1.5 top-1.5 rounded-full flex items-center justify-center w-auto h-auto transition-transform duration-300 ${
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
          <div
            className={`flex items-center transition-all duration-300 p-1 overflow-hidden ${
              expand
                ? "w-auto gap-x-5 pl-12 bg-[var(--background)] rounded-full border border-[var(--accent)]"
                : "w-0 gap-x-0 pl-0"
            }`}
          >
            <span
              className="flex-shrink-0 cursor-pointer hover:text-[var(--accent)] transition-colors"
              onClick={() => addBodyElement("header")}
            >
              <CaseUpper />
            </span>
            <span
              className="flex-shrink-0 cursor-pointer hover:text-[var(--accent)] transition-colors"
              onClick={() => addBodyElement("text")}
            >
              <Text />
            </span>
            <span
              className="flex-shrink-0 cursor-pointer hover:text-[var(--accent)] transition-colors"
              onClick={() => addBodyElement("quote")}
            >
              <Quote />
            </span>
            <span
              className="flex-shrink-0 cursor-pointer hover:text-[var(--accent)] transition-colors"
              onClick={() => addBodyElement("media")}
            >
              <Image />
            </span>
            <span
              className="flex-shrink-0 cursor-pointer hover:text-[var(--accent)] transition-colors"
              onClick={() => addBodyElement("divider")}
            >
              <Minus />
            </span>
          </div>
        </div>
      </div>
      <PostsBodyParser
        action={currentAction}
        value={getCurrentValue()}
        onChange={handleParserChange}
        isOpen={parserOpen}
        onClose={handleParserClose}
        save={save}
      />
    </>
  );
};

export default PostsBodyManager;
