'use client'

import { useState, useCallback } from 'react'
import { Sparkles, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StepFlow } from '@/components/step-flow'
import { ResultsDashboard } from '@/components/results-dashboard'
import { UserSidebar } from '@/components/user-sidebar'
import { SearchBar } from '@/components/search-bar'
import type { TaxInputs, UserProfile } from '@/lib/tax-calculations'

type AppState = 'discovery' | 'results'

export default function TaxCopilotPage() {
  const [appState, setAppState] = useState<AppState>('discovery')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    age: 30,
    cityType: 'metro',
    advisorMode: 'growth',
  })
  
  // Tax Inputs
  const [taxInputs, setTaxInputs] = useState<TaxInputs>({
    ctc: 1800000,
    hasHRA: true,
    rentPaidMonthly: 30000,
    section80C: 0,
    section80D: 0,
    section80CCD: 0,
    employmentType: 'salaried',
  })

  const handleFlowComplete = useCallback(() => {
    setAppState('results')
  }, [])

  const handleBackToDiscovery = useCallback(() => {
    setAppState('discovery')
  }, [])

  const handleSearch = useCallback((query: string) => {
    console.log('[v0] Search query:', query)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[20%] -top-[20%] h-[60%] w-[60%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[20%] h-[60%] w-[60%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 ring-2 ring-primary/30">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground sm:text-xl">
                TaxCopilot AI
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Smart Tax Planner FY 26-27
              </p>
            </div>
          </div>

          {/* User Account */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="relative h-10 w-10 rounded-full bg-secondary/50 hover:bg-secondary"
          >
            <User className="h-5 w-5 text-muted-foreground" />
            {userProfile.name && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {userProfile.name.charAt(0).toUpperCase()}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {appState === 'discovery' && (
          <div className="py-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Let&apos;s optimize your taxes
              </h2>
              <p className="mt-2 text-muted-foreground">
                Answer a few questions to get personalized tax-saving recommendations
              </p>
            </div>
            <StepFlow
              inputs={taxInputs}
              onInputChange={setTaxInputs}
              onComplete={handleFlowComplete}
            />
          </div>
        )}

        {appState === 'results' && (
          <div className="py-4">
            <ResultsDashboard
              inputs={taxInputs}
              userProfile={userProfile}
              onBack={handleBackToDiscovery}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-background/80 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground">
            Tax calculations are indicative and based on FY 2026-27 rules.
            Consult a qualified CA for personalized advice.
          </p>
        </div>
      </footer>

      {/* User Sidebar */}
      <UserSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        profile={userProfile}
        onProfileChange={setUserProfile}
      />

      {/* Floating Search Bar */}
      <SearchBar onSearch={handleSearch} />
    </div>
  )
}
