import { EducationProps } from "@/app/components/types and interfaces/EducationsInterface";
import React from "react";
import { GraduationCap, Calendar, BookOpen, Edit, Trash2 } from "lucide-react";
import Button from "@/app/components/buttons/Buttons";
import { useEducationStore } from "@/app/stores/education_stores/EducationStore";
import Popover from "@/app/components/containers/divs/PopOver";
import { useGlobalState } from "@/app/globalStateProvider";

const EducationCard = (education: EducationProps) => {
  const { extendRouteWithQuery, accessToken, setLoading, isLoading } =
    useGlobalState();
  const {
    id,
    institution,
    degree,
    field_of_study,
    start_year,
    end_year,
    is_current,
    description,
  } = education;

  const { deleteEducation, setCurrentEducation } = useEducationStore();

  return (
    <div className="w-full border border-[var(--accent)]/20 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 mb-4">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-semibold  mb-1">{degree}</h3>
            <p className="text-lg opacity-80 mb-2">{institution}</p>

            {/* Field of Study */}
            <div className="flex items-center gap-2 opacity-65 mb-3">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">{field_of_study}</span>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 opacity-65">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {start_year} - {is_current ? "Present" : end_year}
              </span>
              {is_current && (
                <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                  Current
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            icon={<Edit size={16} />}
            onClick={() => {
              extendRouteWithQuery({ update: id });
              setCurrentEducation(education);
              console.log("Clicked Education : ", education);
            }}
            variant="ghost"
          />
          <Popover
            clicker={
              <Button
                icon={<Trash2 size={16} />}
                customColor="red"
                variant="ghost"
                loading={isLoading(`deleting_education_${id}`)}
                disabled={isLoading(`deleting_education_${id}`)}
              />
            }
            clickerClassName=""
            className=""
            clickerContainerClassName=""
          >
            <div className="flex flex-col gap-y-2 p-2">
              <p className="text-xs opacity-65 ">
                Are you sure you want to delete this record? You can click
                outside to cancel.
              </p>
              <Button
                text="Proceed"
                onClick={() => deleteEducation(accessToken, id, setLoading)}
                customColor="red"
                loading={isLoading(`deleting_education_${id}`)}
                disabled={isLoading(`deleting_education_${id}`)}
              />
            </div>
          </Popover>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm opacity-65 leading-relaxed">{description}</p>
        </div>
      )}
    </div>
  );
};

export default EducationCard;
