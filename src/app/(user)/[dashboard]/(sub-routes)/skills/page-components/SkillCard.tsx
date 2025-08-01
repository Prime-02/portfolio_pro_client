import React, { useState } from "react";
import { Check, ChevronDown, ChevronUp, Pen } from "lucide-react";

export interface SkillsProp {
  id?: string;
  skill_name: string;
  proficiency_level: string;
  category?: string | null;
  subcategory?: string | null;
  description?: string | null;
  is_major?: boolean | null;
  created_at?: Date | string;
}

type Props = {
  skill: SkillsProp;
  onEdit?: () => void;
  className?: string;
};

const SkillCard = ({ skill, onEdit, className = "" }: Props) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`group relative bg-[var(--background)] rounded-lg p-3 hover:shadow-xl shadow-md  transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 ${className}`}
    >
      {/* Edit Button */}
      {onEdit && (
        <button
          onClick={onEdit}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 shadow- transition-opacity duration-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Edit skill"
        >
          <Pen size={16} className="" />
        </button>
      )}

      {/* Main Content (Always visible) */}
      <div className="mb-2">
        <h3 className="text-lg font-semibold ">{skill.skill_name}</h3>

        {skill.description && (
          <p className="text-sm opacity-65 mt-1">{skill.description}</p>
        )}
      </div>

      {/* Dropdown Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center text-sm  hover:text-gray-700 dark:hover:text-gray-300 w-full justify-end cursor-pointer"
      >
        {expanded ? (
          <>
            <ChevronUp size={16} />
          </>
        ) : (
          <>
            <ChevronDown size={16} />
          </>
        )}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {/* Proficiency Level */}
          <div>
            <h4 className="text-xs font-medium opacity-65  mb-1">
              Proficiency
            </h4>
            <p className="text-sm font-semibold uppercase ">{skill.proficiency_level}</p>
          </div>

          {/* Category and Subcategory */}
          {(skill.category || skill.subcategory) && (
            <div>
              <h4 className="text-xs font-medium opacity-65  mb-1">
                Categories
              </h4>
              <div className=" text-sm font-semibold flex flex-wrap gap-2">
                {skill.category && (
                  <span className=" text-sm font-semibold  ">
                    {skill.category}
                  </span>
                )}
                {skill.category && skill.subcategory && (
                  <span className=" text-sm font-semibold  ">|</span>
                )}
                {skill.subcategory && (
                  <span className="">{skill.subcategory}</span>
                )}
              </div>
            </div>
          )}

          {/* Major Skill Indicator */}
          {skill.is_major && (
            <div className="flex gap-1 items-center">
              <p className="text-xs">Core Skill</p>
              <p className="text-xs text-green-500">
                <Check size={16} />
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillCard;
