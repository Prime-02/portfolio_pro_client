import React from "react";
import { UserAssocProps } from "@/app/components/types and interfaces/ProjectsAndPortfolios";
import Image from "next/image";
import { getImageSrc } from "@/app/components/utilities/syncFunctions/syncs";
import Button from "@/app/components/buttons/Buttons";
import { useGlobalState } from "@/app/globalStateProvider";

interface ProjectCollaboratorsProps {
  ProjectCollaboratorsData: UserAssocProps[];
}

const ProjectCollaborators: React.FC<ProjectCollaboratorsProps> = ({
  ProjectCollaboratorsData,
}) => {
  const { router } = useGlobalState();
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "creator":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "owner":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "contributor":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-200";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="space-y-4">
        {ProjectCollaboratorsData.map((collaborator) => (
          <div
            key={collaborator.user_id}
            className="shadow-md border border-[var(--accent)]/20 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start gap-4">
              <Image
                src={
                  getImageSrc(
                    collaborator.user?.profile_picture,
                    collaborator.user?.username
                  ) || ""
                }
                width={1000}
                height={1000}
                alt={collaborator.user?.username || ""}
                className="w-14 h-14 rounded-full object-cover border-2 border-[var(--accent)]/20"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold  truncate">
                    {collaborator.user?.username || ""}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(collaborator.role)}`}
                  >
                    {collaborator.role}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium opacity-70">
                    {collaborator.contribution}
                  </p>
                  <p className="text-sm opacity-60 mt-1">
                    {collaborator.contribution_description}
                  </p>
                </div>
              </div>
            </div>
            <Button
              text={`Visit ${collaborator.user?.username}'s Profile `}
              className="w-full mt-3 "
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(`/${collaborator.user?.username}/profile`)
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectCollaborators;
