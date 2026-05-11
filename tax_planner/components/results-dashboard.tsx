'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingDown, 
  Target, 
  Sparkles, 
  ChevronRight,
  ArrowLeft,
  Scale,
  Zap,
  Wallet,
  Calendar,
  TrendingUp,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PiggyBank,
  BarChart3,
  Building2,
  Landmark,
  Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { 
  formatCurrency, 
  calculateTax, 
  calculateTaxWithInvestment,
  generateDetailedInvestmentPlan,
  getInvestmentAllocation,
  type TaxInputs, 
  type TaxResult,
  type UserProfile,
  type InvestmentOption,
  type InvestmentBreakdown 
} from '@/lib/tax-calculations'

interface ResultsDashboardProps {
  inputs: TaxInputs
  userProfile: UserProfile
  onBack: () => void
}

export function ResultsDashboard({ inputs, userProfile, onBack }: ResultsDashboardProps) {
  const taxResult = useMemo(() => calculateTax(inputs, userProfile), [inputs, userProfile])
  
  const [investmentAmount, setInvestmentAmount] = useState(
    taxResult.optimizationPlan.totalInvestmentNeeded
  )
  const [showBreakdown, setShowBreakdown] = useState(false)
  
  const projectedResult = useMemo(
    () => calculateTaxWithInvestment(inputs, investmentAmount, userProfile),
    [inputs, investmentAmount, userProfile]
  )
  
  const investmentPlan = useMemo(
    () => generateDetailedInvestmentPlan(inputs, investmentAmount, userProfile),
    [inputs, investmentAmount, userProfile]
  )
  
  const currentTax = Math.min(taxResult.oldRegimeTax, taxResult.newRegimeTax)
  const projectedTax = Math.min(projectedResult.oldRegimeTax, projectedResult.newRegimeTax)
  const maxInvestment = taxResult.deductionGaps.total

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Edit Inputs
      </Button>

      {/* 44ADA Success Banner for Freelancers */}
      {taxResult.is44ADAApplied && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-gradient-to-r from-primary/20 via-emerald-500/20 to-primary/20 border border-primary/30 p-6"
        >
          <div className="flex items-center justify-center gap-2 text-primary font-bold text-lg">
            <Sparkles className="h-5 w-5" />
            Section 44ADA Applied
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {formatCurrency(taxResult.presumptiveExpenses)} Written Off!
          </p>
          <p className="mt-2 text-muted-foreground">
            50% of your gross income ({formatCurrency(taxResult.grossIncome)}) is legally considered as business expenses - 
            software, internet, workspace, equipment. <span className="text-primary font-medium">No receipts needed!</span>
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <div className="rounded-lg bg-secondary/50 px-3 py-2">
              <span className="text-muted-foreground">Gross Income:</span>{' '}
              <span className="font-medium text-foreground">{formatCurrency(taxResult.grossIncome)}</span>
            </div>
            <TrendingDown className="h-4 w-4 text-primary" />
            <div className="rounded-lg bg-primary/10 px-3 py-2">
              <span className="text-muted-foreground">Net Taxable:</span>{' '}
              <span className="font-medium text-primary">{formatCurrency(taxResult.netTaxableBusinessIncome)}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* The Verdict Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: taxResult.is44ADAApplied ? 0.1 : 0 }}
        className={`rounded-2xl p-6 text-center ${
          taxResult.recommendation === 'new'
            ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30'
            : 'bg-gradient-to-r from-primary/20 to-emerald-500/20 border border-primary/30'
        }`}
      >
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
          <Scale className="h-4 w-4" />
          THE VERDICT
        </div>
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
          Current Best Regime:{' '}
          <span className={taxResult.recommendation === 'new' ? 'text-blue-400' : 'text-primary'}>
            {taxResult.recommendation === 'new' ? 'New Regime' : 'Old Regime'}
          </span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Your current tax liability:{' '}
          <span className="font-bold text-foreground">{formatCurrency(currentTax)}</span>
        </p>
        {taxResult.savings > 0 && (
          <p className="mt-2 text-sm text-primary">
            You save {formatCurrency(taxResult.savings)} by choosing{' '}
            {taxResult.recommendation === 'new' ? 'New' : 'Old'} Regime
          </p>
        )}
      </motion.div>

      {/* Regime Comparison */}
      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`glass-card rounded-xl p-5 ${
            taxResult.recommendation === 'old' ? 'ring-2 ring-primary' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">Old Regime</h3>
            {taxResult.recommendation === 'old' && (
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                Recommended
              </span>
            )}
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {formatCurrency(taxResult.oldRegimeTax)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Taxable Income: {formatCurrency(taxResult.taxableIncomeOld)}
          </p>
          <p className="text-xs text-muted-foreground">
            Total Deductions: {formatCurrency(taxResult.totalDeductions)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`glass-card rounded-xl p-5 ${
            taxResult.recommendation === 'new' ? 'ring-2 ring-blue-400' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">New Regime</h3>
            {taxResult.recommendation === 'new' && (
              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                Recommended
              </span>
            )}
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {formatCurrency(taxResult.newRegimeTax)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Taxable Income: {formatCurrency(taxResult.taxableIncomeNew)}
          </p>
          <p className="text-xs text-muted-foreground">
            Standard Deduction: {formatCurrency(75000)}
          </p>
        </motion.div>
      </div>

      {/* Zero-Tax Optimizer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">The Roadmap to Zero Tax</h2>
            <p className="text-sm text-muted-foreground">
              Optimize your investments to minimize taxes
            </p>
          </div>
        </div>

        {/* AI Recommendations */}
        {taxResult.optimizationPlan.recommendations.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              AI RECOMMENDATIONS
            </div>
            {taxResult.optimizationPlan.recommendations.map((rec, index) => (
              <motion.div
                key={rec.section}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                className="rounded-xl border border-border bg-secondary/30 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                        {rec.section}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{rec.instrument}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{formatCurrency(rec.amount)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Investment Slider */}
        {maxInvestment > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                How much are you willing to invest today?
              </Label>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(investmentAmount)}
              </span>
            </div>
            
            <Slider
              value={[investmentAmount]}
              onValueChange={([value]) => setInvestmentAmount(value)}
              min={0}
              max={maxInvestment}
              step={5000}
              className="py-2"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(0)}</span>
              <span>Max: {formatCurrency(maxInvestment)}</span>
            </div>

            {/* Projected Tax Counter */}
            <motion.div
              key={projectedTax}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="mt-4 rounded-xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/30 p-6 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-primary" />
                PROJECTED TAX AFTER INVESTMENT
              </div>
              <p className="mt-2 text-4xl font-bold text-foreground">
                {formatCurrency(projectedTax)}
              </p>
              {projectedTax === 0 && (
                <p className="mt-2 text-sm font-medium text-primary">
                  Congratulations! You qualify for zero tax under rebate u/s 87A
                </p>
              )}
              {currentTax > projectedTax && projectedTax > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  You save{' '}
                  <span className="font-bold text-primary">
                    {formatCurrency(currentTax - projectedTax)}
                  </span>{' '}
                  in taxes
                </p>
              )}
            </motion.div>

            {/* Invest Now Button */}
            {investmentAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mt-6"
              >
                <Button
                  onClick={() => setShowBreakdown(true)}
                  className="w-full gap-2 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-white font-semibold py-6 text-lg"
                  size="lg"
                >
                  <Wallet className="h-5 w-5" />
                  Show Investment Breakdown
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </div>
        )}

        {/* Already Optimized */}
        {maxInvestment === 0 && (
          <div className="mt-6 rounded-xl bg-primary/10 p-6 text-center">
            <TrendingDown className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-3 font-medium text-foreground">
              You have maximized all available deductions!
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Consider the New Regime for its simplified tax structure.
            </p>
          </div>
        )}
      </motion.div>

      {/* Deduction Gaps Summary */}
      {taxResult.deductionGaps.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card rounded-xl p-5"
        >
          <h3 className="font-medium text-foreground">Unused Deduction Limits</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {taxResult.deductionGaps.section80C > 0 && (
              <div className="rounded-lg bg-secondary/30 p-3">
                <p className="text-xs text-muted-foreground">80C Gap</p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(taxResult.deductionGaps.section80C)}
                </p>
              </div>
            )}
            {taxResult.deductionGaps.section80D > 0 && (
              <div className="rounded-lg bg-secondary/30 p-3">
                <p className="text-xs text-muted-foreground">80D Gap</p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(taxResult.deductionGaps.section80D)}
                </p>
              </div>
            )}
            {taxResult.deductionGaps.section80CCD > 0 && (
              <div className="rounded-lg bg-secondary/30 p-3">
                <p className="text-xs text-muted-foreground">80CCD Gap</p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(taxResult.deductionGaps.section80CCD)}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Investment Breakdown Panel */}
      <AnimatePresence>
        {showBreakdown && (
          <InvestmentBreakdownPanel
            plan={investmentPlan}
            currentTax={currentTax}
            onClose={() => setShowBreakdown(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}

// Risk badge component
function RiskBadge({ risk }: { risk: 'low' | 'medium' | 'high' }) {
  const config = {
    low: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: Shield },
    medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: TrendingUp },
    high: { bg: 'bg-red-500/20', text: 'text-red-400', icon: AlertTriangle },
  }
  const { bg, text, icon: Icon } = config[risk]
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${bg} ${text}`}>
      <Icon className="h-3 w-3" />
      {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
    </span>
  )
}

// Investment type icon
function InvestmentIcon({ type }: { type: string }) {
  const icons: Record<string, typeof PiggyBank> = {
    'mutual-fund': BarChart3,
    'stock': TrendingUp,
    'etf': BarChart3,
    'insurance': Heart,
    'ppf': Landmark,
    'nps': PiggyBank,
    'fd': Building2,
  }
  const Icon = icons[type] || PiggyBank
  return <Icon className="h-4 w-4" />
}

// Investment Breakdown Panel
interface InvestmentBreakdownPanelProps {
  plan: ReturnType<typeof generateDetailedInvestmentPlan>
  currentTax: number
  onClose: () => void
}

function InvestmentBreakdownPanel({ plan, currentTax, onClose }: InvestmentBreakdownPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 backdrop-blur-sm p-4 pt-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="relative w-full max-w-4xl rounded-2xl border border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-border bg-card/95 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Your Investment Plan</h2>
              <p className="text-sm text-muted-foreground">
                Detailed breakdown with specific recommendations
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6 p-6">
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-primary/10 border border-primary/30 p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Investment</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(plan.totalInvestment)}</p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center">
              <p className="text-sm text-muted-foreground">Tax Savings</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(plan.projectedTaxSavings)}</p>
            </div>
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-4 text-center">
              <p className="text-sm text-muted-foreground">Final Tax Payable</p>
              <p className="text-2xl font-bold text-blue-400">{formatCurrency(plan.finalTax)}</p>
            </div>
          </div>

          {/* Tax-Saving Investments Category */}
          {plan.breakdowns.filter(b => b.isTaxSaving).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Category 1: Tax-Saving Investments</h3>
                  <p className="text-xs text-muted-foreground">These reduce your Final Tax Payable</p>
                </div>
              </div>
              
              {plan.breakdowns.filter(b => b.isTaxSaving).map((breakdown, idx) => (
                <motion.div
                  key={breakdown.section}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="rounded-xl border border-primary/30 bg-primary/5 overflow-hidden"
                >
                  {/* Section Header */}
                  <div className="flex items-center justify-between border-b border-primary/20 bg-primary/10 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-primary/20 px-3 py-1 text-sm font-bold text-primary">
                        {breakdown.section}
                      </span>
                      {breakdown.amount > 0 && (
                        <span className="text-lg font-bold text-foreground">
                          {formatCurrency(breakdown.amount)}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                      <CheckCircle2 className="h-3 w-3" />
                      Reduces Tax
                    </span>
                  </div>

                  {/* Timing Advice */}
                  <div className="flex items-start gap-2 border-b border-primary/20 bg-amber-500/5 px-5 py-3">
                    <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                    <p className="text-sm text-amber-200">{breakdown.timingAdvice}</p>
                  </div>

                  {/* Investment Options */}
                  <div className="divide-y divide-border">
                    {breakdown.options.map((option) => (
                      <div key={option.name} className="p-4 hover:bg-secondary/40 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                                <InvestmentIcon type={option.type} />
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground">{option.name}</h4>
                                <p className="text-xs text-muted-foreground">{option.category}</p>
                              </div>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{option.description}</p>
                            
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <RiskBadge risk={option.risk} />
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                                <TrendingUp className="h-3 w-3" />
                                {option.expectedReturn}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Lock-in: {option.lockIn}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Min. Investment</p>
                            <p className="font-medium text-foreground">{formatCurrency(option.minInvestment)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Wealth-Building Investments Category */}
          {plan.breakdowns.filter(b => !b.isTaxSaving).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Category 2: Wealth-Building Investments</h3>
                  <p className="text-xs text-muted-foreground">For long-term growth (does NOT reduce current tax)</p>
                </div>
              </div>

              {/* Disclaimer Badge */}
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                  <p className="text-sm text-amber-200">
                    <span className="font-medium">Note:</span> Direct stocks and non-ELSS mutual funds do not offer tax deductions under Section 80C. 
                    These are recommended for long-term, post-tax wealth creation after maximizing your tax-saving investments.
                  </p>
                </div>
              </div>
              
              {plan.breakdowns.filter(b => !b.isTaxSaving).map((breakdown, idx) => (
                <motion.div
                  key={breakdown.section}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                  className="rounded-xl border border-border bg-secondary/30 overflow-hidden"
                >
                  {/* Section Header */}
                  <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-blue-500/20 px-3 py-1 text-sm font-bold text-blue-400">
                        {breakdown.section}
                      </span>
                      {breakdown.amount > 0 && (
                        <span className="text-lg font-bold text-foreground">
                          {formatCurrency(breakdown.amount)}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      No Tax Benefit
                    </span>
                  </div>

                  {/* Timing Advice */}
                  <div className="flex items-start gap-2 border-b border-border bg-amber-500/5 px-5 py-3">
                    <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                    <p className="text-sm text-amber-200">{breakdown.timingAdvice}</p>
                  </div>

              {/* Investment Options */}
                  <div className="divide-y divide-border">
                    {breakdown.options.map((option) => (
                      <div key={option.name} className="p-4 hover:bg-secondary/40 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                                <InvestmentIcon type={option.type} />
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground">{option.name}</h4>
                                <p className="text-xs text-muted-foreground">{option.category}</p>
                              </div>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{option.description}</p>
                            
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <RiskBadge risk={option.risk} />
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                                <TrendingUp className="h-3 w-3" />
                                {option.expectedReturn}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Lock-in: {option.lockIn}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Min. Investment</p>
                            <p className="font-medium text-foreground">{formatCurrency(option.minInvestment)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Timing Strategy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-emerald-500/5 p-5"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-4">
              <Calendar className="h-4 w-4 text-primary" />
              WHEN TO INVEST - Timing Strategy
            </div>
            <ul className="space-y-3">
              {plan.timingStrategy.map((strategy, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">{strategy}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Final Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="rounded-xl bg-gradient-to-r from-primary/20 to-emerald-500/20 border border-primary/30 p-6 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              FINAL TAX AFTER INVESTMENTS
            </div>
            <p className="text-5xl font-bold text-foreground">{formatCurrency(plan.finalTax)}</p>
            <div className="mt-3 flex items-center justify-center gap-4 text-sm">
              <span className="text-muted-foreground">
                Current Tax: <span className="line-through">{formatCurrency(currentTax)}</span>
              </span>
              <span className="text-primary font-medium">
                You Save: {formatCurrency(plan.projectedTaxSavings)}
              </span>
            </div>
            {plan.finalTax === 0 && (
              <p className="mt-3 text-sm font-medium text-primary">
                Congratulations! You qualify for zero tax under rebate u/s 87A
              </p>
            )}
          </motion.div>

          {/* Close Button */}
          <div className="flex justify-center pt-4">
            <Button onClick={onClose} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
