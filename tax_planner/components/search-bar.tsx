'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, Sparkles, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchBarProps {
  onSearch: (query: string) => void
}

const SUGGESTIONS = [
  'What is Section 80C?',
  'How does HRA exemption work?',
  'What is the 80CCD NPS benefit?',
  'Old vs New regime comparison',
  'What is Section 44ADA?',
  'How do freelancers save tax?',
]

const QUICK_ANSWERS: Record<string, string> = {
  '80c': 'Section 80C allows deductions up to Rs 1.5 lakh for investments in PPF, ELSS, LIC, PF, NSC, home loan principal, tuition fees, etc.',
  '80d': 'Section 80D provides deductions for health insurance premiums - up to Rs 25,000 for self/family and additional Rs 25,000 for parents.',
  'hra': 'HRA exemption is the minimum of: (1) Actual HRA received, (2) 50%/40% of basic salary for metro/non-metro, (3) Rent paid minus 10% of basic salary.',
  'nps': 'Section 80CCD(1B) provides an additional Rs 50,000 deduction for NPS contributions, over and above the 80C limit.',
  '87a': 'Rebate u/s 87A: Under New Regime, if taxable income ≤ Rs 12 lakh, tax is nil. Under Old Regime, if taxable income ≤ Rs 5 lakh, tax is nil.',
  'new regime': 'New Regime (FY 25-26): Rs 75k standard deduction. Slabs: 0-4L (0%), 4-8L (5%), 8-12L (10%), 12-16L (15%), 16-20L (20%), >20L (30%).',
  'old regime': 'Old Regime allows multiple deductions: 80C (1.5L), 80D (25k), NPS (50k), HRA exemption, home loan interest (2L), etc. Slabs: 0-2.5L (0%), 2.5-5L (5%), 5-10L (20%), >10L (30%).',
  '44ada': 'Section 44ADA is the biggest tax hack for freelancers! It allows presumptive taxation where 50% of your gross income is automatically treated as expenses - no receipts needed. Only the remaining 50% is taxable. You can then apply 80C, 80D, and NPS deductions on this reduced income.',
  'freelance': 'As a freelancer, your biggest tax advantage is Section 44ADA. It automatically writes off 50% of your income as business expenses. Combined with ELSS investments under 80C, you can potentially bring your tax to zero!',
  'presumptive': 'Presumptive taxation under Section 44ADA allows professionals to declare only 50% of gross receipts as taxable income. The remaining 50% is deemed as expenses for software, internet, workspace, etc. No need to maintain expense records!',
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSearch = (searchQuery: string) => {
    const lowerQuery = searchQuery.toLowerCase()
    
    // Find matching answer
    for (const [key, value] of Object.entries(QUICK_ANSWERS)) {
      if (lowerQuery.includes(key)) {
        setAnswer(value)
        onSearch(searchQuery)
        return
      }
    }
    
    // No match found
    setAnswer('I can help you with tax-related questions about 80C, 80D, HRA, NPS, and regime comparisons. Try asking about a specific section!')
    onSearch(searchQuery)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      handleSearch(query)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
  }

  return (
    <>
      {/* Floating Search Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transform"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3 rounded-full border border-border bg-card/90 px-6 py-3 shadow-lg backdrop-blur-xl transition-all hover:border-primary/50 hover:shadow-primary/20">
          <Search className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Ask me anything (e.g., &quot;What is Section 80CCD?&quot;)
          </span>
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      </motion.button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false)
                setAnswer(null)
                setQuery('')
              }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-2xl p-4 sm:bottom-auto sm:top-1/3 sm:-translate-y-1/2"
            >
              <div className="glass-card rounded-2xl p-4 shadow-2xl">
                {/* Search Input */}
                <form onSubmit={handleSubmit} className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about tax sections, deductions, or regimes..."
                    className="h-14 w-full rounded-xl border border-border bg-secondary/50 pl-12 pr-24 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
                    {query && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery('')
                          setAnswer(null)
                        }}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="submit"
                      className="rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>

                {/* Answer */}
                <AnimatePresence mode="wait">
                  {answer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4"
                    >
                      <div className="rounded-xl bg-primary/10 p-4">
                        <div className="flex items-start gap-3">
                          <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                          <p className="text-sm text-foreground">{answer}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Suggestions */}
                {!answer && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      POPULAR QUESTIONS
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="rounded-lg border border-border bg-secondary/30 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/50 hover:bg-secondary/50 hover:text-foreground"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Close hint */}
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Press Esc or click outside to close
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
