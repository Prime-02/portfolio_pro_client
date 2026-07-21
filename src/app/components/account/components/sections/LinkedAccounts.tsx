import React, { useEffect } from 'react'
import { ASCard } from '../ui/Card'
import { ASSectionTitle } from '../ui/SectionTitle'
import { ASSectionDesc } from '../ui/SectionDesc'
import LinkedIn from './platformActions/LinkedIn'
import { useUserAccountStore } from '@/lib/stores/user/useUserAccountStore'

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
            <div className='flex flex-col mt-6 gap-y-3'>
                <LinkedIn linkedinData={linkedPlatforms?.linked_platforms["linkedin"] as Record<string, any>} />
            </div>
        </ASCard>
    )
}
