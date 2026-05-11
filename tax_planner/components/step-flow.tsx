'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Wallet, Home, PiggyBank, Check, Briefcase, User, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { formatCurrency, formatNumber, LIMITS, type TaxInputs } from '@/lib/tax-calculations'

interface StepFlowProps {
  inputs: TaxInputs
  onInputChange: (inputs: TaxInputs) => void
  onComplete: () => void
}

const STEPS = [
  { id: 1, title: 'Employment Type', icon: Briefcase },
  { id: 2, title: 'Income Details', icon: Wallet },
  { id: 3, title: 'HRA Check', icon: Home },
  { id: 4, title: 'Investments', icon: PiggyBank },
]

export function StepFlow({ inputs, onInputChange, onComplete }: StepFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)

  const handleNext = () => {
    // Skip HRA step if freelance
    if (currentStep === 2 && inputs.employmentType === 'freelance') {
      setCurrentStep(4) // Skip to investments
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    // Skip HRA step if freelance
    if (currentStep === 4 && inputs.employmentType === 'freelance') {
      setCurrentStep(2) // Skip back to income details
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCTCChange = (value: string) => {
    const numValue = parseInt(value.replace(/,/g, '')) || 0
    onInputChange({ ...inputs, ctc: numValue })
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    currentStep > step.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : currentStep === step.id
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-border bg-secondary/50 text-muted-foreground'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-16 sm:w-24 transition-all duration-300 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Employment Type */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">What describes you best?</h2>
                <p className="mt-2 text-muted-foreground">
                  This helps us apply the right tax rules for you
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => onInputChange({ ...inputs, employmentType: 'salaried', hasHRA: true })}
                  className={`relative rounded-xl border-2 p-6 text-left transition-all ${
                    inputs.employmentType === 'salaried'
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-secondary/30 hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      inputs.employmentType === 'salaried' ? 'bg-primary/20' : 'bg-secondary'
                    }`}>
                      <User className={`h-6 w-6 ${inputs.employmentType === 'salaried' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${inputs.employmentType === 'salaried' ? 'text-primary' : 'text-foreground'}`}>
                        Salaried
                      </h3>
                      <p className="text-sm text-muted-foreground">Working for a company</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
                    <li>Standard Deduction of Rs 75k (New) / Rs 50k (Old)</li>
                    <li>HRA exemption if paying rent</li>
                    <li>Form 16 from employer</li>
                  </ul>
                  {inputs.employmentType === 'salaried' && (
                    <div className="absolute right-3 top-3">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => onInputChange({ ...inputs, employmentType: 'freelance', hasHRA: false, rentPaidMonthly: 0 })}
                  className={`relative rounded-xl border-2 p-6 text-left transition-all ${
                    inputs.employmentType === 'freelance'
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-secondary/30 hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      inputs.employmentType === 'freelance' ? 'bg-primary/20' : 'bg-secondary'
                    }`}>
                      <Briefcase className={`h-6 w-6 ${inputs.employmentType === 'freelance' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${inputs.employmentType === 'freelance' ? 'text-primary' : 'text-foreground'}`}>
                        Freelancer / Professional
                      </h3>
                      <p className="text-sm text-muted-foreground">Self-employed or consultant</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
                    <li>Section 44ADA: 50% presumptive deduction</li>
                    <li>No HRA, but huge expense write-off</li>
                    <li>ITR-4 (Sugam) filing</li>
                  </ul>
                  {inputs.employmentType === 'freelance' && (
                    <div className="absolute right-3 top-3">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </button>
              </div>

              {inputs.employmentType === 'freelance' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-primary/10 border border-primary/30 p-4"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium text-primary">Section 44ADA Unlocked!</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        As a freelancer, 50% of your gross income is automatically considered as business expenses - no receipts needed!
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 2: Income Details */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">
                  {inputs.employmentType === 'freelance' ? 'What is your Annual Gross Income?' : 'What is your Annual CTC?'}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {inputs.employmentType === 'freelance' 
                    ? 'Enter your total business receipts for FY 2025-26'
                    : 'Enter your total Cost to Company for FY 2025-26'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                    INR
                  </span>
                  <Input
                    type="text"
                    value={formatNumber(inputs.ctc)}
                    onChange={(e) => handleCTCChange(e.target.value)}
                    className="h-16 bg-secondary/50 pl-14 text-2xl font-semibold text-foreground"
                    placeholder="18,00,000"
                  />
                </div>

                <Slider
                  value={[inputs.ctc]}
                  onValueChange={([value]) => onInputChange({ ...inputs, ctc: value })}
                  min={300000}
                  max={10000000}
                  step={50000}
                  className="py-4"
                />

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>3 LPA</span>
                  <span>1 Cr</span>
                </div>
              </div>

              <div className="rounded-lg bg-secondary/30 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {inputs.employmentType === 'freelance' ? 'Monthly Income (approx)' : 'Monthly Take-home (approx)'}
                  </span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(Math.round(inputs.ctc / 12 * (inputs.employmentType === 'freelance' ? 1 : 0.7)))}
                  </span>
                </div>
              </div>

              {/* 44ADA Banner for Freelancers */}
              {inputs.employmentType === 'freelance' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl bg-gradient-to-r from-primary/20 to-emerald-500/20 border border-primary/30 p-5"
                >
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Sparkles className="h-5 w-5" />
                    Section 44ADA Applied
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {formatCurrency(Math.round(inputs.ctc * 0.5))} Written Off!
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    50% of your income ({formatCurrency(Math.round(inputs.ctc * 0.5))}) is legally considered as business expenses - 
                    software, internet, workspace, equipment. No receipts needed!
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-primary">
                    <Check className="h-4 w-4" />
                    Taxable Income reduced to {formatCurrency(Math.round(inputs.ctc * 0.5))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: HRA Check (Salaried Only) */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">
                  Does your salary structure include HRA?
                </h2>
                <p className="mt-2 text-muted-foreground">
                  HRA exemption can significantly reduce your Old Regime tax
                </p>
              </div>

              <div className="flex items-center justify-center gap-8 py-4">
                <button
                  onClick={() => onInputChange({ ...inputs, hasHRA: false })}
                  className={`rounded-xl border-2 px-8 py-4 transition-all ${
                    !inputs.hasHRA
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                  }`}
                >
                  <span className="text-lg font-semibold">No</span>
                </button>
                <button
                  onClick={() => onInputChange({ ...inputs, hasHRA: true })}
                  className={`rounded-xl border-2 px-8 py-4 transition-all ${
                    inputs.hasHRA
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                  }`}
                >
                  <span className="text-lg font-semibold">Yes</span>
                </button>
              </div>

              {inputs.hasHRA && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <Label htmlFor="rent" className="text-sm text-muted-foreground">
                    Monthly Rent Paid
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      INR
                    </span>
                    <Input
                      id="rent"
                      type="text"
                      value={formatNumber(inputs.rentPaidMonthly)}
                      onChange={(e) => {
                        const value = parseInt(e.target.value.replace(/,/g, '')) || 0
                        onInputChange({ ...inputs, rentPaidMonthly: value })
                      }}
                      className="h-14 bg-secondary/50 pl-14 text-xl font-semibold"
                      placeholder="30,000"
                    />
                  </div>

                  <Slider
                    value={[inputs.rentPaidMonthly]}
                    onValueChange={([value]) => onInputChange({ ...inputs, rentPaidMonthly: value })}
                    min={0}
                    max={200000}
                    step={1000}
                    className="py-4"
                  />

                  <div className="rounded-lg bg-primary/10 p-4">
                    <p className="text-sm text-primary">
                      Annual HRA Exemption potential:{' '}
                      <span className="font-bold">{formatCurrency(inputs.ctc * 0.2)}</span>
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 4: Existing Investments */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">Your Existing Investments</h2>
                <p className="mt-2 text-muted-foreground">
                  {inputs.employmentType === 'freelance' 
                    ? 'These deductions apply to your net income after 44ADA'
                    : 'Tell us about your current tax-saving investments'}
                </p>
              </div>

              <div className="space-y-6">
                {/* Section 80C */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">
                      Section 80C (PPF, ELSS, LIC, etc.)
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Limit: {formatCurrency(LIMITS.section80C)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      INR
                    </span>
                    <Input
                      type="text"
                      value={formatNumber(inputs.section80C)}
                      onChange={(e) => {
                        const value = Math.min(LIMITS.section80C, parseInt(e.target.value.replace(/,/g, '')) || 0)
                        onInputChange({ ...inputs, section80C: value })
                      }}
                      className="bg-secondary/50 pl-14"
                    />
                  </div>
                  <Slider
                    value={[inputs.section80C]}
                    onValueChange={([value]) => onInputChange({ ...inputs, section80C: value })}
                    min={0}
                    max={LIMITS.section80C}
                    step={5000}
                  />
                </div>

                {/* Section 80D */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">
                      Section 80D (Health Insurance)
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Limit: {formatCurrency(LIMITS.section80D)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      INR
                    </span>
                    <Input
                      type="text"
                      value={formatNumber(inputs.section80D)}
                      onChange={(e) => {
                        const value = Math.min(LIMITS.section80D, parseInt(e.target.value.replace(/,/g, '')) || 0)
                        onInputChange({ ...inputs, section80D: value })
                      }}
                      className="bg-secondary/50 pl-14"
                    />
                  </div>
                  <Slider
                    value={[inputs.section80D]}
                    onValueChange={([value]) => onInputChange({ ...inputs, section80D: value })}
                    min={0}
                    max={LIMITS.section80D}
                    step={1000}
                  />
                </div>

                {/* Section 80CCD */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">
                      Section 80CCD(1B) - NPS
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Limit: {formatCurrency(LIMITS.section80CCD)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      INR
                    </span>
                    <Input
                      type="text"
                      value={formatNumber(inputs.section80CCD)}
                      onChange={(e) => {
                        const value = Math.min(LIMITS.section80CCD, parseInt(e.target.value.replace(/,/g, '')) || 0)
                        onInputChange({ ...inputs, section80CCD: value })
                      }}
                      className="bg-secondary/50 pl-14"
                    />
                  </div>
                  <Slider
                    value={[inputs.section80CCD]}
                    onValueChange={([value]) => onInputChange({ ...inputs, section80CCD: value })}
                    min={0}
                    max={LIMITS.section80CCD}
                    step={5000}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-secondary/30 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Deductions Claimed</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(inputs.section80C + inputs.section80D + inputs.section80CCD)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button onClick={handleNext} className="gap-2">
            {currentStep === 4 ? 'See My Results' : 'Continue'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
