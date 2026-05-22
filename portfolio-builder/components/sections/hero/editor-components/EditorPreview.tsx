// portfolio-builder/components/sections/hero/editor-components/EditorPreview.tsx

import { HeroData } from "@/portfolio-builder/types/hero";
import HeroRenderer from "@/portfolio-builder/components/sections/hero/HeroRenderer";

interface EditorPreviewProps {
    data: HeroData;
}

export default function EditorPreview({ data }: EditorPreviewProps) {
    return (
        <div className="flex-1 min-w-0 bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-neutral-800 text-xs text-neutral-500 uppercase tracking-wide">
                Preview
            </div>
            <div className="h-[calc(100%-37px)] overflow-y-auto">
                <HeroRenderer data={data} />
            </div>
        </div>
    );
}