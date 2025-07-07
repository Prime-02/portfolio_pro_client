"use client"

import { useTheme } from '@/app/components/theme/ThemeContext '
import { UserProfile } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  const { theme, accentColor } = useTheme()
  const { foreground, background } = theme
  const { color } = accentColor

  return (
    <div 
      className="min-h-screen p-6 transition-colors duration-300"
      style={{ 
        backgroundColor: background,
        color: foreground 
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold mb-2 transition-colors duration-300"
            style={{ color: color }}
          >
            Your Profile
          </h1>
          <p 
            className="text-lg opacity-80 transition-colors duration-300"
            style={{ color: foreground }}
          >
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Container */}
        <div 
          className="rounded-3xl border shadow-lg p-8 transition-all duration-300"
          style={{ 
            backgroundColor: background,
            borderColor: color + '20', // Adding transparency to accent color
            boxShadow: `0 10px 25px -5px ${color}10, 0 4px 6px -2px ${color}05`
          }}
        >
          <UserProfile 
            appearance={{
              baseTheme: undefined,
              variables: {
                colorPrimary: color,
                colorText: foreground,
                colorTextSecondary: foreground + 'cc',
                colorBackground: background,
                colorInputBackground: background,
                colorInputText: foreground,
                borderRadius: '0.75rem',
                fontFamily: 'inherit',
              },
              elements: {
                rootBox: {
                  backgroundColor: background,
                  color: foreground,
                },
                card: {
                  backgroundColor: background,
                  border: `1px solid ${color}30`,
                  borderRadius: '0.75rem',
                  boxShadow: `0 4px 6px -1px ${color}10`,
                },
                headerTitle: {
                  color: foreground,
                },
                headerSubtitle: {
                  color: foreground + 'cc',
                },
                socialButtonsBlockButton: {
                  backgroundColor: background,
                  border: `1px solid ${color}40`,
                  color: foreground,
                  borderRadius: '0.5rem',
                  '&:hover': {
                    backgroundColor: color + '10',
                    borderColor: color,
                  }
                },
                formButtonPrimary: {
                  backgroundColor: color,
                  borderRadius: '0.5rem',
                  '&:hover': {
                    backgroundColor: color + 'dd',
                  },
                  '&:focus': {
                    boxShadow: `0 0 0 2px ${color}40`,
                  }
                },
                formFieldInput: {
                  backgroundColor: background,
                  borderColor: color + '30',
                  color: foreground,
                  borderRadius: '0.5rem',
                  '&:focus': {
                    borderColor: color,
                    boxShadow: `0 0 0 2px ${color}20`,
                  }
                },
                formFieldLabel: {
                  color: foreground,
                },
                tabButton: {
                  color: foreground + 'aa',
                  '&[data-state="active"]': {
                    color: color,
                    borderBottomColor: color,
                  }
                },
                navbar: {
                  backgroundColor: background,
                },
                navbarButton: {
                  color: foreground + 'aa',
                  borderRadius: '0.5rem',
                  '&[data-state="active"]': {
                    color: color,
                    backgroundColor: color + '10',
                  },
                  '&:hover': {
                    backgroundColor: color + '05',
                  }
                },
                profileSection: {
                  backgroundColor: background,
                },
                profileSectionTitle: {
                  color: foreground,
                },
                profileSectionContent: {
                  backgroundColor: background,
                },
                accordionTriggerButton: {
                  color: foreground,
                  '&:hover': {
                    backgroundColor: color + '05',
                  }
                },
                accordionContent: {
                  backgroundColor: background,
                },
                badge: {
                  backgroundColor: color + '20',
                  color: color,
                  borderRadius: '0.25rem',
                }
              }
            }}
          />
        </div>

        {/* Optional: Add some decorative elements */}
        <div className="mt-8 flex justify-center">
          <div 
            className="w-16 h-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  )
}

export default page