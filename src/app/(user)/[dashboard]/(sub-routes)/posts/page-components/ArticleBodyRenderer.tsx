import ImageCard from "@/app/components/containers/cards/ImageCard";
import TextFormatter from "@/app/components/containers/TextFormatters/TextFormatter";
import React from "react";

const ArticleBodyRenderer = ({
  body,
}: {
  body: Record<string, string>[] | undefined;
}) => {
  if (!body || body.length === 0) {
    return (
      <div className="text-gray-400 italic text-center py-8">
        No content added yet
      </div>
    );
  }

  const renderElement = (item: Record<string, string>, index: number) => {
    const key = Object.keys(item)[0];
    const value = item[key];
    const type = key.match(/^(header|text|quote|divider|media)/)?.[1];

    switch (type) {
      case "header":
        return (
          <h2
            key={key}
            className="text-3xl font-bold mb-4 mt-6 text-[var(--foreground)]"
          >
            {value || "Untitled Header"}
          </h2>
        );

      case "text":
        return (
          <TextFormatter
            key={key}
            className="text-base leading-relaxed mb-4 text-[var(--foreground)] whitespace-pre-wrap"
            showSeeMore={false}
          >
            {value || "Empty text block"}
          </TextFormatter>
        );

      case "quote":
        return (
          <blockquote
            key={key}
            className="border-l-4 border-[var(--accent)] pl-4 py-2 mb-4 italic text-[var(--foreground)] bg-[var(--accent)]/5"
          >
            {value || "Empty quote"}
          </blockquote>
        );

      case "divider":
        return (
          <hr
            key={key}
            className="border-t-2 border-[var(--accent)] my-6 w-full"
          />
        );

      case "media":
        if (!value) {
          return (
            <div
              key={key}
              className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 text-center text-gray-400"
            >
              No media added
            </div>
          );
        }
        return (
          <div key={key} className="mb-4 rounded-lg overflow-hidden">
            <ImageCard
              image_url={value.split(" | ")[0]}
              id={value}
              alt="Post media"
              className="w-full h-auto object-cover"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {body.map((item, index) => renderElement(item, index))}
    </div>
  );
};

export default ArticleBodyRenderer;
