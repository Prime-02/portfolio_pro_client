import React from "react";
import { CanvaProjectsProps } from "./ProjectsDisplay";
import ImageCard from "@/app/components/containers/cards/ImageCard";
import { getImageSrc } from "@/app/components/utilities/syncFunctions/syncs";
import { useProjectsStore } from "@/app/stores/project_stores/ProjectsStore";

const ProjectsCard = (props: CanvaProjectsProps) => {
  const { toggleProjectName, projectsNames } = useProjectsStore();

  return (
    <ImageCard
      image_url={getImageSrc(props.thumbnail.url, props.title)}
      id={props.id}
      contentPosition="overlay"
      showContent={true}
      title={props.title}
      contentPadding="xs"
      titleLines={2}
      shadow="none"
      overlayOpacity={50}
      onClick={() => toggleProjectName(props.title)}
      borderWidth={projectsNames.includes(props.title) ? 2 : 0}
    />
  );
};

export default ProjectsCard;
