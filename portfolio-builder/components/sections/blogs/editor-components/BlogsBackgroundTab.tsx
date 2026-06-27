// portfolio-builder/components/sections/blogs/editor-components/BlogsBackgroundTab.tsx

import { BlogsData } from "@/portfolio-builder/types/blogs";
import BackgroundTab from "@/portfolio-builder/components/shared/editor/BackgroundTab";
import { SectionBackgroundType } from "@/portfolio-builder/types/sectionBackground";

interface BlogsBackgroundTabProps {
  data: BlogsData;
  onUpdate: (value: Partial<BlogsData["background"]>) => void;
  allowedTypes?: SectionBackgroundType[];
}

export default function BlogsBackgroundTab({ data, onUpdate, allowedTypes }: BlogsBackgroundTabProps) {
  return (
    <BackgroundTab
      data={{ background: data.background }}
      onUpdate={(value) => onUpdate(value)}
      allowedTypes={allowedTypes}
    />
  );
}
