import React, { useRef, useEffect, useState } from "react";
import PostBodyElement from "./PostBodyElement";

const PostBodyRenderer = ({
  setBody,
  body,
  action,
  value,
  onChange,
  isOpen,
  setActiveAction,
  activeTab,
  onClose,
  save,
}: {
  setBody: (body: Record<string, string>[]) => void;
  body: Record<string, string>[] | undefined;
  action: string;
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  setActiveAction: (index: number) => void;
  activeTab: React.ReactNode;
  onClose: () => void;
  save: (data: {
    file: File | null;
    croppedImage: string | null;
  }) => Promise<void>;
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const elementRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const isScrollingRef = useRef(false);

  // Calculate total number of items (body elements + active tab)
  const totalItems = (body?.length || 0) + 1;

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Don't auto-center if user is actively scrolling
        if (isScrollingRef.current) return;

        entries.forEach((entry) => {
          // Check if element is at least 51% visible
          if (entry.intersectionRatio >= 0.51) {
            const index = elementRefs.current.indexOf(
              entry.target as HTMLDivElement,
            );
            if (index !== -1) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: scrollContainer,
        threshold: Array.from({ length: 101 }, (_, i) => i / 100), // More granular thresholds
      },
    );

    // Observe all elements
    elementRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    // Handle scroll end to snap to nearest element
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      isScrollingRef.current = true;
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        isScrollingRef.current = false;

        // Find the most visible element after scrolling stops
        let maxVisibility = 0;
        let mostVisibleIndex = 0;

        elementRefs.current.forEach((el, index) => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const containerRect = scrollContainer!.getBoundingClientRect();

          const visibleWidth =
            Math.min(rect.right, containerRect.right) -
            Math.max(rect.left, containerRect.left);
          const visibility = visibleWidth / rect.width;

          if (visibility > maxVisibility) {
            maxVisibility = visibility;
            mostVisibleIndex = index;
          }
        });

        // Snap to the most visible element
        const element = elementRefs.current[mostVisibleIndex];
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
          setActiveIndex(mostVisibleIndex);
        }
      }, 150); // Wait 150ms after scroll stops
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      scrollContainer.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [body?.length]);

  const handleBreadcrumbClick = (index: number) => {
    const element = elementRefs.current[index];
    if (element) {
      isScrollingRef.current = false; // Allow programmatic scroll to center
      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });

      // If clicking on a body element, set it as active
      if (index < (body?.length || 0)) {
        setActiveAction(index);
      }

      setActiveIndex(index);
    }
  };

  const setRef = (index: number) => (el: HTMLDivElement | null) => {
    elementRefs.current[index] = el;
  };

  return (
    <div className="relative h-auto min-h-full overflow-hidden">
      {/* Horizontal scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex h-full overflow-x-auto snap-x snap-proximity scroll-smooth scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Body elements */}
        {body &&
          body.length > 0 &&
          body.map((item, index) => (
            <div
              key={Object.keys(item)[0]}
              ref={setRef(index)}
              className="w-full flex-shrink-0 snap-center"
            >
              <PostBodyElement
              save={save}
                onClose={onClose}
                action={action}
                item={item}
                index={index}
                isActive={activeIndex === index}
                setActiveAction={setActiveAction}
                onUpdate={(updatedValue: string) => {
                  if (setBody) {
                    const newBody = body ? [...body] : [];
                    const key = Object.keys(item)[0];
                    newBody[index] = { [key]: updatedValue };
                    setBody(newBody);
                  }
                }}
              />
            </div>
          ))}

        {/* Active tab / Editor */}
        <div
          ref={setRef(body?.length || 0)}
          className="w-full flex-shrink-0 h-auto bg-[var(--background)] snap-center"
        >
          {activeTab}
        </div>
      </div>

      {/* Breadcrumb Navigation - Bottom Center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
        {Array.from({ length: totalItems }).map((_, index) => {
          const isLast = index === totalItems - 1;
          const isActive = activeIndex === index;

          return (
            <React.Fragment key={index}>
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`transition-all duration-200 ${
                  isActive
                    ? "w-8 h-2 bg-white"
                    : "w-2 h-2 bg-white/40 hover:bg-white/60"
                } rounded-full`}
                aria-label={
                  isLast ? "Active editor tab" : `Element ${index + 1}`
                }
              />
              {!isLast && index < totalItems - 1 && (
                <div className="w-1 h-1 bg-white/20 rounded-full" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default PostBodyRenderer;
