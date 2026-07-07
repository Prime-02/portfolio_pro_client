"use client"
import { useParams } from 'next/navigation';
import React from 'react'
import { ProjectsFeedPage } from '../../components/feed/projects';

const ProjectsAndProfessions = () => {
  const params = useParams();
    const tab = params.tab as "projects" | "professionals";

    if(tab === "projects") return <ProjectsFeedPage/>
    if(tab === "professionals") return <div>
      Professionals By rating
    </div>
 
}

export default ProjectsAndProfessions
