import Button from '@/app/components/buttons/Buttons'
import Popover from '@/app/components/containers/divs/PopOver'
import { ContentStatus, ContentType } from '@/app/components/types and interfaces/Posts'
import { useGlobalState } from '@/app/globalStateProvider'
import { useContentStore } from '@/app/stores/posts_store/PostsHandler'
import { ChevronDown } from 'lucide-react'
import React, { useState, useRef, useEffect } from 'react'

type Tab = "all" | "my" | "drafted"
const allowedTabs: Tab[] = ["all", "my", "drafted"]

const ContentsFilter = () => {
    const { filters, setFilters } = useContentStore()
    const { userData } = useGlobalState()
    const [activeTab, setActiveTab] = useState<Tab>("all")

    const tabRefs = useRef<(HTMLSpanElement | null)[]>([])
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const activeIndex = allowedTabs.indexOf(activeTab)
        const activeEl = tabRefs.current[activeIndex]
        const containerEl = containerRef.current

        if (activeEl && containerEl) {
            const containerRect = containerEl.getBoundingClientRect()
            const tabRect = activeEl.getBoundingClientRect()
            setIndicatorStyle({
                left: tabRect.left - containerRect.left,
                width: tabRect.width,
            })
        }
    }, [activeTab, allowedTabs, filters])  // added filters so indicator resizes when label changes

    const getTabLabel = (tab: Tab): string => {
        if (tab === "drafted") {
            if (filters.status === ContentStatus.PUBLISHED) return "Published Contents"
            if (filters.status === ContentStatus.ARCHIVED) return "Archived Contents"
            if (filters.status === ContentStatus.DELETED) return "Deleted Contents"
            return "Drafted Contents"
        }

        const prefix = tab === "my" ? "My" : "All"

        if (filters.content_type === ContentType.POST) return `${prefix} Posts`
        if (filters.content_type === ContentType.REEL) return `${prefix} Reels`
        if (filters.content_type === ContentType.ARTICLE) return `${prefix} Articles`

        return `${prefix} Contents`
    }

    const ContentTypesPopover = ({ tab }: { tab: Tab }) => {
        const prefix = tab === "my" ? "My" : "All"
        return (
            <div className='flex flex-col gap-y-2'>
                <Button
                    variant="ghost"
                    size="sm"
                    text={`${prefix} Contents`}
                    disabled={filters.content_type === undefined}
                    onClick={() => {
                        setFilters({ ...filters, content_type: undefined })
                    }}
                />
                <Button
                    variant="ghost"
                    size="sm"
                    text={`${prefix} Posts`}
                    disabled={filters.content_type === ContentType.POST}
                    onClick={() => {
                        setFilters({ ...filters, content_type: ContentType.POST })
                    }}
                />
                <Button
                    variant="ghost"
                    size="sm"
                    text={`${prefix} Reels`}
                    disabled={filters.content_type === ContentType.REEL}
                    onClick={() => {
                        setFilters({ ...filters, content_type: ContentType.REEL })
                    }}
                />
                <Button
                    variant="ghost"
                    size="sm"
                    text={`${prefix} Articles`}
                    disabled={filters.content_type === ContentType.ARTICLE}
                    onClick={() => {
                        setFilters({ ...filters, content_type: ContentType.ARTICLE })
                    }}
                />
            </div>
        )
    }

    const tabAndFiltersHandler = (tab: Tab) => {
        setActiveTab(tab)
        if (tab === "my") {
            setFilters({ ...filters, username: userData?.username, content_type: undefined, status: undefined })
        }
        if (tab === "all") {
            setFilters({ ...filters, username: undefined, content_type: undefined, status: undefined })
        }
        if (tab === "drafted") {
            setFilters({ ...filters, status: ContentStatus.DRAFT, username: userData?.username, content_type: undefined })
        }
    }

    const ContentStatusPopover = () => {
        return (
            <div className='flex flex-col gap-y-2'>
                <Button
                    variant="ghost"
                    size="sm"
                    text="Drafted"
                    disabled={filters.status === ContentStatus.DRAFT}
                    onClick={() => {
                        setFilters({ ...filters, status: ContentStatus.DRAFT })
                    }}
                />
                <Button
                    variant="ghost"
                    size="sm"
                    text="Published"
                    disabled={filters.status === ContentStatus.PUBLISHED}
                    onClick={() => {
                        setFilters({ ...filters, status: ContentStatus.PUBLISHED })
                    }}
                />
                <Button
                    variant="ghost"
                    size="sm"
                    text="Archived"
                    disabled={filters.status === ContentStatus.ARCHIVED}
                    onClick={() => {
                        setFilters({ ...filters, status: ContentStatus.ARCHIVED })
                    }}
                />
                <Button
                    variant="ghost"
                    size="sm"
                    text="Deleted"
                    disabled={filters.status === ContentStatus.DELETED}
                    onClick={() => {
                        setFilters({ ...filters, status: ContentStatus.DELETED })
                    }}
                />
            </div>
        )
    }

    return (
        <div className='mb-3 pb-3 flex md:flex-row flex-col gap-y-3 w-full border-b border-[var(--foreground)]/30 md:justify-around justify-center items-center'>
            <div
                ref={containerRef}
                className='w-full md:w-[70%] flex items-center justify-between relative'
            >
                {allowedTabs.map((tab, i) => (
                    <span
                        key={i}
                        ref={el => { tabRefs.current[i] = el }}
                        className={`flex items-center gap-x-1 text-sm md:text-lg cursor-pointer pb-2 transition-colors duration-200 ${activeTab === tab ? "text-[var(--foreground)]" : "text-[var(--foreground)]/30"}`}
                    >
                        <p onClick={() => tabAndFiltersHandler(tab)}>
                            {getTabLabel(tab)}
                        </p>
                        <Popover
                            clicker={<ChevronDown onClick={() => tabAndFiltersHandler(tab)} size={16} />}
                            className=""
                            clickerContainerClassName=""
                            clickerClassName=""
                        >
                            {tab === "drafted" ? <ContentStatusPopover /> : <ContentTypesPopover tab={tab} />}
                        </Popover>
                    </span>
                ))}

                {/* Sliding indicator */}
                <span
                    className='absolute bottom-0 h-[2px] translate-y-3.5 bg-[var(--foreground)] rounded-full transition-all duration-300 ease-in-out'
                    style={{
                        left: indicatorStyle.left,
                        width: indicatorStyle.width,
                    }}
                />
            </div>

            <div className='flex items-center justify-between rounded-lg mt-3 md:mt-0 bg-[var(--accent)]/20 gap-x-2 p-0.5'>
                <Button
                    size='sm'
                    variant={filters.sort_order === "desc" ? "primary" : "ghost"}
                    text="Latest"
                    onClick={() => {
                        if (filters.sort_order === "desc") return;
                        setFilters({ ...filters, sort_order: "desc" })
                    }}
                />
                <Button
                    size='sm'
                    variant={filters.sort_order === "asc" ? "primary" : "ghost"}
                    text="Oldest"
                    onClick={() => {
                        if (filters.sort_order === "asc") return;
                        setFilters({ ...filters, sort_order: "asc" })
                    }}
                />
            </div>
        </div>
    )
}

export default ContentsFilter