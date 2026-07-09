"use client"
import { useParams } from 'next/navigation';
import React from 'react'
import { ProjectsFeedPage } from '../../components/feed/projects';
import { ProfessionalsFeedPage } from '../../components/feed/professionals';
import { SuggestionsFeedPage } from '../../components/feed/suggestions';

const ProjectsAndProfessions = () => {
  const params = useParams();
    const tab = params.tab as "projects" | "professionals" | "whats-new";

    if(tab === "projects") return <ProjectsFeedPage/>
  if (tab === "professionals") return <ProfessionalsFeedPage/>
  if (tab === "whats-new") return <SuggestionsFeedPage/>
 
}

export default ProjectsAndProfessions
