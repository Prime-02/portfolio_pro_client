import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MessageSquare, Sparkles, X } from "lucide-react";
import { useAIStore } from "@/lib/stores/ai/useGoogleGemini";

export interface PromptOption {
    title: string;
    prompt: string;
    allowMarkdown?: boolean;
}

interface AIAssistantOrnamentProps {
    options: PromptOption[];
    onChange: (response: string) => void;
    onEmptyClick?: () => void;
    className?: string;
}

const PANEL_GAP = 8;
const VIEWPORT_MARGIN = 8;
const MAX_Z_INDEX = 2147483647;

interface PanelPosition {
    top: number;
    left: number;
    openedUpward: boolean;
}

export default function AIAssistant({
    options,
    onChange,
    onEmptyClick,
    className = "",
}: AIAssistantOrnamentProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loadingPrompt, setLoadingPrompt] = useState<string | null>(null);
    const [position, setPosition] = useState<PanelPosition | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const generateFromPrompt = useAIStore((state) => state.generateFromPrompt);

    const calculatePosition = useCallback(() => {
        if (!containerRef.current) return;

        const buttonRect = containerRef.current.getBoundingClientRect();
        const panelHeight = panelRef.current?.offsetHeight ?? 0;
        const panelWidth = panelRef.current?.offsetWidth ?? 220;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Space available below the button
        const spaceBelow = viewportHeight - buttonRect.bottom;
        // Space available above the button
        const spaceAbove = buttonRect.top;

        // If there's enough space below OR more space below than above, drop down
        // Otherwise, drop up
        const openedUpward = !(spaceBelow >= panelHeight || spaceBelow > spaceAbove);

        const top = openedUpward
            ? buttonRect.top - panelHeight - PANEL_GAP
            : buttonRect.bottom + PANEL_GAP;

        // Right-align the panel to the button, clamped so it stays on-screen
        let left = buttonRect.right - panelWidth;
        left = Math.max(
            VIEWPORT_MARGIN,
            Math.min(left, viewportWidth - panelWidth - VIEWPORT_MARGIN),
        );

        setPosition({ top, left, openedUpward });
    }, []);

    // Handle click outside - the panel now renders in a portal (outside
    // containerRef's DOM subtree), so it must be checked separately.
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const clickedContainer = containerRef.current?.contains(target);
            const clickedPanel = panelRef.current?.contains(target);

            if (!clickedContainer && !clickedPanel) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            // Calculate position after a brief delay to ensure panel is rendered
            // and its real dimensions are measurable.
            requestAnimationFrame(() => {
                calculatePosition();
            });

            // Recalculate on scroll (capture phase, so scrolling inside any
            // ancestor container - not just window - also repositions the
            // panel) or resize.
            window.addEventListener("scroll", calculatePosition, true);
            window.addEventListener("resize", calculatePosition);

            return () => {
                window.removeEventListener("scroll", calculatePosition, true);
                window.removeEventListener("resize", calculatePosition);
            };
        }

        setPosition(null);
    }, [isOpen, calculatePosition]);

    const handleToggle = useCallback(() => {
        if (options.length === 0 && onEmptyClick) {
            onEmptyClick();
            return;
        }
        setIsOpen(prev => !prev);
    }, [options.length, onEmptyClick]);

    const handlePromptClick = useCallback(
        async (option: PromptOption) => {
            setLoadingPrompt(option.title);

            const result = await generateFromPrompt(option.prompt, {
                allowMarkdown: option.allowMarkdown ?? false,
            });

            if (result?.content) {
                onChange(result.content);
            }

            setLoadingPrompt(null);
            setIsOpen(false);
        },
        [generateFromPrompt, onChange]
    );

    const panel = isOpen && options.length > 0 && (
        <div
            ref={panelRef}
            style={
                position
                    ? { position: "fixed", top: position.top, left: position.left, zIndex: MAX_Z_INDEX }
                    // Render off-screen (but still mounted, so we can measure
                    // its real size) until the first position is computed.
                    : { position: "fixed", top: -9999, left: -9999, visibility: "hidden", zIndex: MAX_Z_INDEX }
            }
            className={`bg-[var(--background)] text-[var(--foreground)] rounded-lg shadow-xl border border-[var(--foreground)]/10 p-3 min-w-[200px] max-w-[300px] ${position?.openedUpward
                ? "animate-in slide-in-from-bottom-2"
                : "animate-in slide-in-from-top-2"
                } duration-200`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--foreground)] opacity-70">
                    AI Assistant
                </span>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-[var(--foreground)]/10 rounded-full transition-colors"
                >
                    <X className="w-4 h-4 text-[var(--foreground)] opacity-50" />
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <button
                        type="button"
                        key={option.title}
                        onClick={() => handlePromptClick(option)}
                        disabled={loadingPrompt !== null}
                        className="px-3 py-1.5 text-sm bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20 
                 text-[var(--foreground)] rounded-full transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed
                 flex items-center gap-1.5"
                    >
                        {loadingPrompt === option.title ? (
                            <div className="w-3 h-3 border-2 border-[var(--foreground)]/40 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Sparkles className="w-3 h-3 text-purple-500" />
                        )}
                        {option.title}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Options Panel - portalled to <body> so it escapes any
               overflow-hidden/overflow-scroll ancestor and positions itself
               relative to the viewport instead of the nearest positioned
               ancestor. */}
            {typeof document !== "undefined" && panel
                ? createPortal(panel, document.body)
                : null}

            {/* Toggle Button */}
            <button
                type="button"
                onClick={handleToggle}
                className="w-10 h-10 bg-[var(--background)] text-[var(--foreground)] rounded-full shadow-lg border border-[var(--foreground)]/10 
                 flex items-center justify-center hover:bg-[var(--foreground)]/10 
                 transition-all duration-200 hover:scale-105 active:scale-95
                 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[var(--background)]"
                title="AI Assistant"
            >
                AI
            </button>
        </div>
    );
}