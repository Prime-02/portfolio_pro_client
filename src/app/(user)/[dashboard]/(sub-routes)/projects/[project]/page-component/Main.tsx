"use client" 
import { PathUtil } from '@/app/components/utilities/syncFunctions/syncs'
import { useGlobalState } from '@/app/globalStateProvider'
import {
  AllProjectsDisplayCardProps,
  ProjectStatusProps,
} from "@/app/components/types and interfaces/ProjectsAndPortfolios";
import React, { useState } from 'react'
import { GetAllData } from '@/app/components/utilities/asyncFunctions/lib/crud';
import { V1_BASE_URL } from '@/app/components/utilities/indices/urls';

const Main = () => {
    const {currentPath, loading, setLoading, accessToken} = useGlobalState()
    const [projectData, setProjectData] = useState({})
const projectId = PathUtil.getLastSegment(currentPath) 

const getProjectData = async () => {
    setLoading("fetching_project_data")
    try {
        const projectDataRes = await GetAllData({
          access: accessToken,
          url: `${V1_BASE_URL}`
        })
    } catch (error) {
        
    } finally {
            setLoading("fetching_project_data")

    }
}
  return (
    <div>{projectId}</div>
  )
}

export default Main