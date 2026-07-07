"use client"
import { useRouting } from '@/lib/hooks/routing/useRouting';
import { useUIStore } from '@/lib/stores/ui/useUIStore'
import { useParams } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react'
import { Textinput } from '../inputs/Textinput';
import { Home, Briefcase, Users, Search, X } from 'lucide-react';

const NavBar = () => {
  const params = useParams();
  const { router, pathname, checkParams, clearQueryParam } = useRouting()
  const { isMobile, isTablet, isDesktop } = useUIStore()
  const [activeTab, setActiveTab] = useState(params.tab as string || "")
  const [showSearch, setShowSearch] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  // Sync activeTab with URL params
  useEffect(() => {
    setActiveTab(params.tab as string || "")
  }, [pathname])

  // Sync search value with URL query param
  useEffect(() => {
    const searchParam = checkParams('search')
    if (searchParam) {
      setSearchValue(searchParam)
    } else {
      setSearchValue("")
    }
  }, [pathname])

  // Focus search input when overlay opens
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  const tabs = [
    { id: "", label: "FYP", icon: Home },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "professionals", label: "Professionals", icon: Users },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      // Update URL with search query without clearing the input
      router.push(`/feed/${activeTab}?search=${encodeURIComponent(searchValue.trim())}`)
    } else {
      // If search is empty, clear the search param
      clearQueryParam(['search'])
    }
  }

  const handleClearSearch = () => {
    setSearchValue("")
    clearQueryParam(['search'])
    // Focus back on input after clearing
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  // Handle tab change - preserve search query if it exists
  const handleTabChange = (tabId: string) => {
    const searchParam = checkParams('search')
    if (searchParam) {
      router.push(`/feed/${tabId}?search=${encodeURIComponent(searchParam)}`)
    } else {
      router.push(`/feed/${tabId}`)
    }
  }

  // Mobile Floating Action Bar with Search
  if (isMobile) {
    return (
      <>
        {/* Search Overlay */}
        {showSearch && (
          <div className="fixed inset-0 z-50 bg-[var(--background)]/95 backdrop-blur-xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--foreground)]/10">
                <form onSubmit={handleSearch} className="flex-1">
                  <Textinput
                    ref={searchInputRef}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e)}
                    label={`Search in ${tabs.find(t => t.id === activeTab)?.label || 'feed'}...`}
                    className="w-full"
                  />
                </form>
                <button
                  onClick={() => {
                    setShowSearch(false)
                    // Don't clear search value when closing overlay
                  }}
                  className="p-2 rounded-full hover:bg-[var(--foreground)]/10 
                    transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-[var(--foreground)]" />
                </button>
              </div>

              {/* Quick suggestions or recent searches could go here */}
              <div className="flex-1 px-4 py-6">
                <p className="text-sm text-[var(--foreground)]/40 font-league-500">
                  Search for content, projects, or professionals...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Floating Navigation Bar */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl 
            bg-[var(--background)]/90 backdrop-blur-xl border border-[var(--foreground)]/10 
            shadow-lg shadow-black/5">

            {/* Search Button */}
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center justify-center w-10 h-10 rounded-xl
                bg-[var(--foreground)]/5 text-[var(--foreground)]/60 
                hover:bg-[var(--foreground)]/10 hover:text-[var(--foreground)]
                transition-all duration-300"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-[var(--foreground)]/10" />

            {/* Tab Buttons */}
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 rounded-xl
                    transition-all duration-300 ease-out
                    font-league-500 text-sm
                    ${isActive
                      ? 'bg-[var(--foreground)] text-[var(--background)] shadow-md'
                      : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                  <span className={`
                    transition-all duration-300
                    ${isActive ? 'opacity-100 max-w-[100px]' : 'opacity-0 max-w-0 overflow-hidden'}
                  `}>
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Bottom padding to prevent content from being hidden behind nav */}
        <div className="h-24" />
      </>
    )
  }

  // Desktop & Tablet Navigation
  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--foreground)]/10 
      bg-[var(--background)]/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {isDesktop && (
            <div className="flex items-center gap-1 rounded-full 
              bg-[var(--foreground)]/5 p-1 backdrop-blur-sm shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    relative px-6 py-2 text-sm font-medium transition-all duration-200
                    font-league-500
                    ${activeTab === tab.id
                      ? 'text-[var(--background)]'
                      : 'text-[var(--foreground)]/70 hover:text-[var(--foreground)]'
                    }
                  `}
                >
                  {activeTab === tab.id && (
                    <span className="absolute inset-0 rounded-full 
                      bg-[var(--foreground)] shadow-sm"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          )}

          {isTablet && (
            <div className="flex items-center gap-2 shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    px-4 py-2 text-sm font-medium transition-all duration-200
                    font-league-500 rounded-full
                    ${activeTab === tab.id
                      ? 'bg-[var(--foreground)] text-[var(--background)]'
                      : 'text-[var(--foreground)]/70'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Search - always visible on desktop & tablet */}
          <form
            onSubmit={handleSearch}
            className={`flex items-center gap-2 flex-1 ${isDesktop ? 'max-w-md' : 'max-w-xs'} ml-auto`}
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 
                text-[var(--foreground)]/40 pointer-events-none" />
              <Textinput
                ref={searchInputRef}
                value={searchValue}
                onChange={(e) => setSearchValue(e)}
                label={`Search in ${tabs.find(t => t.id === activeTab)?.label || 'feed'}...`}
                className="w-full pl-9 pr-8"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-1 py-0.5 rounded-full 
                    hover:bg-[var(--foreground)]/10 text-xs transition-colors duration-200"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </nav>
  )
}

export default NavBar