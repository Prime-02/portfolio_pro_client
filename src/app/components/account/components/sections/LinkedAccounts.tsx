import React, { useEffect } from 'react'
import { ASCard } from '../ui/Card'
import { ASSectionTitle } from '../ui/SectionTitle'
import { ASSectionDesc } from '../ui/SectionDesc'
import LinkedIn from './platformActions/LinkedIn'
import { useUserAccountStore } from '@/lib/stores/user/useUserAccountStore'
import GitHub from './platformActions/GitHub'
import Vercel from './platformActions/Vercel'

export const LinkedAccounts = () => {
    const { fetchLinkedPlatforms, linkedPlatforms } = useUserAccountStore()
    useEffect(() => {
        fetchLinkedPlatforms()
    }, [])

    return (
        <ASCard className='mb-6'>
            <ASSectionTitle>
                Linked Accounts
            </ASSectionTitle>
            <ASSectionDesc>
                {`Manage your social and professional accounts linked to Portfolio Pro`}
            </ASSectionDesc>
            <ASSectionDesc>
                <span className='text-amber-400'>
                    <strong>
                        Please Note:
                    </strong>
                    {`While we continue enhancing security, all platforms listed below must use the same email address associated with your Portfolio Pro account`}
                </span>
            </ASSectionDesc>
            <div className='flex flex-col mt-6 gap-y-3'>
                <LinkedIn linkedinData={linkedPlatforms?.linked_platforms["linkedin"] as Record<string, any>} />
                <GitHub  />
                <Vercel vercelData={linkedPlatforms?.linked_platforms["vercel"] as Record<string, any>} />
            </div>
        </ASCard>
    )
}
