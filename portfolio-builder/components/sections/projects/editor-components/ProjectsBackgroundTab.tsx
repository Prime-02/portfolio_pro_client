// portfolio-builder/components/sections/projects/editor-components/ProjectsBackgroundTab.tsx

import { ProjectsData } from "@/portfolio-builder/types/projects";
import BackgroundTab from "@/portfolio-builder/components/shared/editor/BackgroundTab";
import { SectionBackgroundType } from "@/portfolio-builder/types/sectionBackground";

interface ProjectsBackgroundTabProps {
  data: ProjectsData;
  onUpdate: (value: Partial<ProjectsData["background"]>) => void;
  allowedTypes?: SectionBackgroundType[];
}

export default function ProjectsBackgroundTab({ data, onUpdate, allowedTypes }: ProjectsBackgroundTabProps) {
  return (
    <BackgroundTab
      data={{ background: data.background }}
      onUpdate={(value) => onUpdate(value)}
      allowedTypes={allowedTypes}
    />
  );
}
