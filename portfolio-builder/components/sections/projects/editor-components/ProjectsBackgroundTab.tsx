// portfolio-builder/components/sections/projects/editor-components/ProjectsBackgroundTab.tsx

import { ProjectsData } from "@/portfolio-builder/types/projects";
import BackgroundTab from "@/portfolio-builder/components/shared/background/editor/BackgroundTab";

interface ProjectsBackgroundTabProps {
  data: ProjectsData;
  onUpdate: (value: Partial<ProjectsData["background"]>) => void;
}

export default function ProjectsBackgroundTab({ data, onUpdate }: ProjectsBackgroundTabProps) {
  return (
    <BackgroundTab
      data={{ background: data.background }}
      onUpdate={(value) => onUpdate(value)}
    />
  );
}
