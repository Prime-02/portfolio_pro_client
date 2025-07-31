export interface SkillsProp {
  id?: string;
  skill_name: string;
  proficiency_level: string;
  category?: string | null;
  subcategory?: string | null;
  description?: string | null;
  is_trending?: boolean | null;
  difficulty_level?: string | null;
  is_major?: boolean | null;
  created_at?: Date | string; 
}

import React from "react";

type Props = {};

const SkillCard = (props: Props) => {
  return <div>SkillCard</div>;
};
