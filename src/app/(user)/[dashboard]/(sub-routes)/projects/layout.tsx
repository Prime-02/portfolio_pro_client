"use client";

import { PathUtil } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import { useProjectsStore } from "@/app/stores/project_stores/ProjectsStore";
import { useEffect } from "react";

export default function ConnectLayout({
  children,
  connect,
}: {
  children: React.ReactNode;
  connect: React.ReactNode;
}) {
  const { currentUser, currentPath, checkValidId } = useGlobalState();
  const { addProjectName, removeProjectName } = useProjectsStore();
  const projectId = PathUtil.getLastSegment(currentPath);
  const isProjectPage = projectId ? checkValidId(projectId) : false;

  useEffect(() => {
    if (isProjectPage && !currentUser && projectId) {
      addProjectName(projectId);
    }

    // Cleanup when component unmounts or projectId changes
    return () => {
      if (projectId) {
        removeProjectName(projectId);
      }
    };
  }, [isProjectPage, projectId, currentUser]);

  return (
    <div>
      {children}
      {connect || null}
    </div>
  );
}
