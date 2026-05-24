// portfolio-builder/components/sections/hero/editor-components/EditorPreview.tsx

import { HeroData } from "@/portfolio-builder/types/hero";
import HeroRenderer from "@/portfolio-builder/components/sections/hero/HeroRenderer";
import { ResolvedTheme } from "@/portfolio-builder/hooks/usePortfolioTheme";

interface EditorPreviewProps {
    data: HeroData;
    theme: ResolvedTheme;
}

export default function EditorPreview({ data, theme }: EditorPreviewProps) {
    return (
        <div className="flex-1 min-w-0 bg-[var(--pb-background)] border border-[var(--pb-border)] rounded-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-[var(--pb-border)] text-xs text-[var(--pb-text-muted)] uppercase tracking-wide">
                Preview
            </div>
            <div className="h-[calc(100%-37px)] overflow-y-auto">
                <HeroRenderer data={data} theme={theme} />
            </div>
        </div>
    );
}