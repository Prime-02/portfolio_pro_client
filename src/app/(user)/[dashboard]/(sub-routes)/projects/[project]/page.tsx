"use client" 
import { PathUtil } from '@/app/components/utilities/syncFunctions/syncs'
import { useGlobalState } from '@/app/globalStateProvider'
import React from 'react'

const page = () => {
    const {currentPath, loading, setLoading, accessToken} = useGlobalState()
const projectId = PathUtil.getLastSegment(currentPath) 

const getProjectData = async () => {
    setLoading("fetching_project_data")
    try {
        
    } catch (error) {
        
    } finally {
            setLoading("fetching_project_data")

    }
}
  return (
    <div>page</div>
  )
}

export default page