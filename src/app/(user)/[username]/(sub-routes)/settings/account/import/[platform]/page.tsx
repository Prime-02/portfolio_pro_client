"use client"
import { GitHubImportPage } from '@/src/app/components/account/components/sections/platformActions/import/github';
import { VercelImportPage } from '@/src/app/components/account/components/sections/platformActions/import/vercel';
import { useParams } from 'next/navigation';
import React from 'react'

const ImportPage = () => {
    const params = useParams();
    const platform = params.platform as "vercel" | "github";


    if(platform === "vercel") return <VercelImportPage/>
    if(platform === "github") return <GitHubImportPage/>
}

export default ImportPage
