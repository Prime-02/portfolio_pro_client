import React from "react";
import { ExternalLink, Code, Layers, Tag } from "lucide-react";
import BasicHeader from "@/app/components/containers/divs/header/BasicHeader";
import Button from "@/app/components/buttons/Buttons";
import { useGlobalState } from "@/app/globalStateProvider";
import Link from "next/link";

interface ProjectBasicInfoProps {
  project_name: string;
  project_description: string;
  project_platform: string;
  project_category: string;
  project_url: string;
  stack: string[];
  tags: string[];
}

const ProjectBasicInfo = ({
  project_name = "",
  project_description = "",
  project_platform = "",
  project_category = "",
  project_url = "",
  stack = [],
  tags = [],
}: ProjectBasicInfoProps) => {
  const { router } = useGlobalState();
  return (
    <div className="w-full flex flex-col space-y-3">
      <header className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6 py-4 px-4 sm:px-6">
        <div className="flex-1 min-w-0">
          <BasicHeader
            heading={project_name || "Not Provided"}
            subHeading={project_description || "Not Provided"}
            subHeadingClass="opacity-80"
          />
          <ul className="flex flex-wrap gap-1">
            {tags.length > 0 &&
              tags.map((tag, i) => (
                <li className="opacity-60 text-sm" key={i}>
                  #{tag}
                </li>
              ))}
          </ul>
          <ul className="flex flex-wrap gap-2 mt-1">
            {stack.map((stack, i) => (
              <li
                className="text-xs flex items-center gap-x-1 bg-[var(--accent)]/10 px-2 py-1 rounded cursor-pointer hover:bg-[var(--accent)]/20"
                key={i}
              >
                <span>{stack}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-shrink-0 w-full sm:w-auto">
          <Link
            href={project_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full sm:w-auto"
          >
            <Button
              text="Visit Project"
              icon2={<ExternalLink size={16} />}
              className="w-full sm:w-auto justify-center"
            />
          </Link>
        </div>
      </header>
    </div>
  );
};

export default ProjectBasicInfo;
