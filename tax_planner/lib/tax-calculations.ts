// Tax calculation utilities for FY 25-26 India

export interface TaxInputs {
  ctc: number
  hasHRA: boolean
  rentPaidMonthly: number
  section80C: number
  section80D: number
  section80CCD: number // NPS
  employmentType: 'salaried' | 'freelance'
}

export interface UserProfile {
  name: string
  age: number
  cityType: 'metro' | 'non-metro'
  advisorMode: 'conservative' | 'growth'
}

export interface DeductionGap {
  section80C: number // max 150000
  section80D: number // max 25000
  section80CCD: number // max 50000
  total: number
}

export interface OptimizationPlan {
  recommendations: Recommendation[]
  totalInvestmentNeeded: number
  projectedTax: number
  canAchieveZeroTax: boolean
}

export interface Recommendation {
  section: string
  amount: number
  instrument: string
  description: string
}

export interface InvestmentOption {
  name: string
  type: 'mutual-fund' | 'stock' | 'etf' | 'insurance' | 'ppf' | 'nps' | 'fd'
  category: string
  expectedReturn: string
  risk: 'low' | 'medium' | 'high'
  lockIn: string
  minInvestment: number
  description: string
}

export interface InvestmentBreakdown {
  section: string
  amount: number
  options: InvestmentOption[]
  timingAdvice: string
  isTaxSaving: boolean // true = reduces tax, false = wealth building only
}

export interface DetailedInvestmentPlan {
  breakdowns: InvestmentBreakdown[]
  totalInvestment: number
  projectedTaxSavings: number
  finalTax: number
  timingStrategy: string[]
}

export interface TaxResult {
  oldRegimeTax: number
  newRegimeTax: number
  recommendation: 'old' | 'new'
  savings: number
  hraExemption: number
  totalDeductions: number
  taxableIncomeOld: number
  taxableIncomeNew: number
  deductionGaps: DeductionGap
  optimizationPlan: OptimizationPlan
  // 44ADA fields for freelancers
  is44ADAApplied: boolean
  grossIncome: number
  presumptiveExpenses: number // 50% write-off
  netTaxableBusinessIncome: number
}

// Deduction limits
export const LIMITS = {
  section80C: 150000,
  section80D: 25000,
  section80CCD: 50000,
  standardDeductionOld: 50000,
  standardDeductionNew: 75000,
  rebateThresholdNew: 1200000, // 12L taxable income for zero tax
  rebateThresholdOld: 500000, // 5L taxable income for zero tax
}

// Calculate HRA Exemption for Old Regime
export function calculateHRAExemption(
  basicSalary: number,
  hraReceived: number,
  rentPaidAnnual: number,
  cityType: 'metro' | 'non-metro' = 'metro'
): number {
  if (rentPaidAnnual === 0) return 0
  
  const percentOfBasic = cityType === 'metro' ? 0.5 : 0.4
  const percentBasic = basicSalary * percentOfBasic
  const rentMinusTenPercentBasic = Math.max(0, rentPaidAnnual - basicSalary * 0.1)
  
  return Math.min(hraReceived, percentBasic, rentMinusTenPercentBasic)
}

// New Regime Tax Slabs FY 25-26
// ₹75k standard deduction
// 0-4L (0%), 4-8L (5%), 8-12L (10%), 12-16L (15%), 16-20L (20%), >20L (30%)
// Rebate u/s 87A: No tax if taxable income <= 12L
export function calculateNewRegimeTax(grossIncome: number): { tax: number; taxableIncome: number } {
  const standardDeduction = LIMITS.standardDeductionNew
  const taxableIncome = Math.max(0, grossIncome - standardDeduction)
  
  // Rebate under 87A - no tax if taxable income <= 12L
  if (taxableIncome <= LIMITS.rebateThresholdNew) {
    return { tax: 0, taxableIncome }
  }
  
  let tax = 0
  
  if (taxableIncome > 2000000) {
    tax += (taxableIncome - 2000000) * 0.30
    tax += 400000 * 0.20 // 16-20L
    tax += 400000 * 0.15 // 12-16L
    tax += 400000 * 0.10 // 8-12L
    tax += 400000 * 0.05 // 4-8L
  } else if (taxableIncome > 1600000) {
    tax += (taxableIncome - 1600000) * 0.20
    tax += 400000 * 0.15 // 12-16L
    tax += 400000 * 0.10 // 8-12L
    tax += 400000 * 0.05 // 4-8L
  } else if (taxableIncome > 1200000) {
    tax += (taxableIncome - 1200000) * 0.15
    tax += 400000 * 0.10 // 8-12L
    tax += 400000 * 0.05 // 4-8L
  } else if (taxableIncome > 800000) {
    tax += (taxableIncome - 800000) * 0.10
    tax += 400000 * 0.05 // 4-8L
  } else if (taxableIncome > 400000) {
    tax += (taxableIncome - 400000) * 0.05
  }
  
  // Add 4% cess
  tax = tax * 1.04
  
  return { tax: Math.round(tax), taxableIncome }
}

// Old Regime Tax Slabs FY 25-26
// ₹50k standard deduction + HRA + 80C + 80D + 80CCD deductions
// 0-2.5L (0%), 2.5-5L (5%), 5-10L (20%), >10L (30%)
// Rebate u/s 87A: No tax if taxable income <= 5L
export function calculateOldRegimeTax(
  grossIncome: number,
  hraExemption: number,
  section80C: number,
  section80D: number,
  section80CCD: number
): { tax: number; taxableIncome: number; totalDeductions: number } {
  const standardDeduction = LIMITS.standardDeductionOld
  const totalDeductions = standardDeduction + hraExemption + section80C + section80D + section80CCD
  const taxableIncome = Math.max(0, grossIncome - totalDeductions)
  
  // Rebate under 87A - no tax if taxable income <= 5L
  if (taxableIncome <= LIMITS.rebateThresholdOld) {
    return { tax: 0, taxableIncome, totalDeductions }
  }
  
  let tax = 0
  
  if (taxableIncome > 1000000) {
    tax += (taxableIncome - 1000000) * 0.30
    tax += 500000 * 0.20 // 5-10L
    tax += 250000 * 0.05 // 2.5-5L
  } else if (taxableIncome > 500000) {
    tax += (taxableIncome - 500000) * 0.20
    tax += 250000 * 0.05 // 2.5-5L
  } else if (taxableIncome > 250000) {
    tax += (taxableIncome - 250000) * 0.05
  }
  
  // Add 4% cess
  tax = tax * 1.04
  
  return { tax: Math.round(tax), taxableIncome, totalDeductions }
}

// Calculate unused deduction limits (Gap Finder)
export function calculateDeductionGaps(
  section80C: number,
  section80D: number,
  section80CCD: number
): DeductionGap {
  const gap80C = Math.max(0, LIMITS.section80C - section80C)
  const gap80D = Math.max(0, LIMITS.section80D - section80D)
  const gap80CCD = Math.max(0, LIMITS.section80CCD - section80CCD)
  
  return {
    section80C: gap80C,
    section80D: gap80D,
    section80CCD: gap80CCD,
    total: gap80C + gap80D + gap80CCD,
  }
}

// Optimization Algorithm - fills 80C first, then 80D, then NPS
export function calculateOptimizationPlan(
  grossIncome: number,
  currentDeductions: { hraExemption: number; section80C: number; section80D: number; section80CCD: number },
  advisorMode: 'conservative' | 'growth' = 'growth'
): OptimizationPlan {
  const recommendations: Recommendation[] = []
  const gaps = calculateDeductionGaps(
    currentDeductions.section80C,
    currentDeductions.section80D,
    currentDeductions.section80CCD
  )
  
  // Calculate current taxable income (old regime)
  const standardDeduction = LIMITS.standardDeductionOld
  let currentTotalDeductions = 
    standardDeduction + 
    currentDeductions.hraExemption + 
    currentDeductions.section80C + 
    currentDeductions.section80D + 
    currentDeductions.section80CCD
  
  let taxableIncome = Math.max(0, grossIncome - currentTotalDeductions)
  
  // Target: reduce taxable income to 5L (rebate threshold) or as low as possible
  const targetTaxableIncome = LIMITS.rebateThresholdOld
  let amountToReduce = Math.max(0, taxableIncome - targetTaxableIncome)
  let totalInvestmentNeeded = 0
  
  // Fill 80C first (up to 1.5L)
  if (amountToReduce > 0 && gaps.section80C > 0) {
    const invest80C = Math.min(gaps.section80C, amountToReduce)
    if (invest80C > 0) {
      recommendations.push({
        section: '80C',
        amount: invest80C,
        instrument: advisorMode === 'conservative' ? 'PPF (Public Provident Fund)' : 'ELSS Mutual Funds (e.g., Quant Tax Plan)',
        description: advisorMode === 'conservative' 
          ? 'Safe, government-backed with 7.1% returns and 15-year lock-in'
          : 'Higher growth potential with 3-year lock-in and market-linked returns',
      })
      amountToReduce -= invest80C
      totalInvestmentNeeded += invest80C
    }
  }
  
  // Fill 80D next (up to 25k)
  if (amountToReduce > 0 && gaps.section80D > 0) {
    const invest80D = Math.min(gaps.section80D, amountToReduce)
    if (invest80D > 0) {
      recommendations.push({
        section: '80D',
        amount: invest80D,
        instrument: 'Health Insurance Premium',
        description: 'Essential coverage for self and family with tax benefits',
      })
      amountToReduce -= invest80D
      totalInvestmentNeeded += invest80D
    }
  }
  
  // Fill 80CCD/NPS last (up to 50k additional)
  if (amountToReduce > 0 && gaps.section80CCD > 0) {
    const invest80CCD = Math.min(gaps.section80CCD, amountToReduce)
    if (invest80CCD > 0) {
      recommendations.push({
        section: '80CCD(1B)',
        amount: invest80CCD,
        instrument: 'NPS (National Pension System)',
        description: 'Additional 50k deduction over 80C limit for retirement savings',
      })
      amountToReduce -= invest80CCD
      totalInvestmentNeeded += invest80CCD
    }
  }
  
  // Calculate projected tax after optimization
  const projectedTaxableIncome = Math.max(0, taxableIncome - totalInvestmentNeeded)
  let projectedTax = 0
  
  if (projectedTaxableIncome > LIMITS.rebateThresholdOld) {
    // Calculate tax on projected taxable income
    if (projectedTaxableIncome > 1000000) {
      projectedTax += (projectedTaxableIncome - 1000000) * 0.30
      projectedTax += 500000 * 0.20
      projectedTax += 250000 * 0.05
    } else if (projectedTaxableIncome > 500000) {
      projectedTax += (projectedTaxableIncome - 500000) * 0.20
      projectedTax += 250000 * 0.05
    } else if (projectedTaxableIncome > 250000) {
      projectedTax += (projectedTaxableIncome - 250000) * 0.05
    }
    projectedTax = Math.round(projectedTax * 1.04)
  }
  
  return {
    recommendations,
    totalInvestmentNeeded,
    projectedTax,
    canAchieveZeroTax: projectedTaxableIncome <= LIMITS.rebateThresholdOld,
  }
}

// Main calculation function
export function calculateTax(inputs: TaxInputs, userProfile?: UserProfile): TaxResult {
  const { ctc, hasHRA, rentPaidMonthly, section80C, section80D, section80CCD, employmentType } = inputs
  const cityType = userProfile?.cityType || 'metro'
  const advisorMode = userProfile?.advisorMode || 'growth'
  const isFreelance = employmentType === 'freelance'
  
  // For freelancers: Apply Section 44ADA - 50% presumptive taxation
  // Gross income is treated as business receipts, 50% is automatically expense
  const grossIncome = ctc
  const presumptiveExpenses = isFreelance ? Math.round(ctc * 0.5) : 0
  const netTaxableBusinessIncome = isFreelance ? grossIncome - presumptiveExpenses : ctc
  
  // Calculate derived values (only for salaried)
  const basicSalary = isFreelance ? 0 : ctc * 0.5 // 50% of CTC
  const hraReceived = isFreelance ? 0 : ctc * 0.2 // 20% of CTC
  const rentPaidAnnual = (hasHRA && !isFreelance) ? rentPaidMonthly * 12 : 0
  
  // Calculate HRA exemption (only for salaried with HRA)
  const hraExemption = (hasHRA && !isFreelance)
    ? calculateHRAExemption(basicSalary, hraReceived, rentPaidAnnual, cityType)
    : 0
  
  // For freelancers, use net taxable business income (after 44ADA)
  const incomeForTax = isFreelance ? netTaxableBusinessIncome : ctc
  
  // Calculate taxes for both regimes
  // For freelancers: New regime gets standard deduction, Old regime gets 80C/80D/NPS deductions
  const newRegimeResult = isFreelance 
    ? calculateNewRegimeTaxForFreelance(netTaxableBusinessIncome)
    : calculateNewRegimeTax(ctc)
  
  const oldRegimeResult = isFreelance
    ? calculateOldRegimeTaxForFreelance(netTaxableBusinessIncome, section80C, section80D, section80CCD)
    : calculateOldRegimeTax(ctc, hraExemption, section80C, section80D, section80CCD)
  
  // Calculate deduction gaps (applicable to both, but based on net income for freelancers)
  const deductionGaps = calculateDeductionGaps(section80C, section80D, section80CCD)
  
  // Calculate optimization plan
  const optimizationPlan = calculateOptimizationPlan(
    incomeForTax,
    { hraExemption: isFreelance ? 0 : hraExemption, section80C, section80D, section80CCD },
    advisorMode
  )
  
  // Determine recommendation
  const recommendation = oldRegimeResult.tax <= newRegimeResult.tax ? 'old' : 'new'
  const savings = Math.abs(newRegimeResult.tax - oldRegimeResult.tax)
  
  return {
    oldRegimeTax: oldRegimeResult.tax,
    newRegimeTax: newRegimeResult.tax,
    recommendation,
    savings,
    hraExemption,
    totalDeductions: oldRegimeResult.totalDeductions,
    taxableIncomeOld: oldRegimeResult.taxableIncome,
    taxableIncomeNew: newRegimeResult.taxableIncome,
    deductionGaps,
    optimizationPlan,
    // 44ADA fields
    is44ADAApplied: isFreelance,
    grossIncome,
    presumptiveExpenses,
    netTaxableBusinessIncome,
  }
}

// New Regime Tax for Freelancers (no standard deduction, just slabs on net income)
function calculateNewRegimeTaxForFreelance(netIncome: number): { tax: number; taxableIncome: number } {
  const taxableIncome = netIncome
  
  // Rebate under 87A - no tax if taxable income <= 12L
  if (taxableIncome <= LIMITS.rebateThresholdNew) {
    return { tax: 0, taxableIncome }
  }
  
  let tax = 0
  
  if (taxableIncome > 2000000) {
    tax += (taxableIncome - 2000000) * 0.30
    tax += 400000 * 0.20
    tax += 400000 * 0.15
    tax += 400000 * 0.10
    tax += 400000 * 0.05
  } else if (taxableIncome > 1600000) {
    tax += (taxableIncome - 1600000) * 0.20
    tax += 400000 * 0.15
    tax += 400000 * 0.10
    tax += 400000 * 0.05
  } else if (taxableIncome > 1200000) {
    tax += (taxableIncome - 1200000) * 0.15
    tax += 400000 * 0.10
    tax += 400000 * 0.05
  } else if (taxableIncome > 800000) {
    tax += (taxableIncome - 800000) * 0.10
    tax += 400000 * 0.05
  } else if (taxableIncome > 400000) {
    tax += (taxableIncome - 400000) * 0.05
  }
  
  tax = tax * 1.04
  return { tax: Math.round(tax), taxableIncome }
}

// Old Regime Tax for Freelancers (with 80C/80D/NPS deductions on net income)
function calculateOldRegimeTaxForFreelance(
  netIncome: number,
  section80C: number,
  section80D: number,
  section80CCD: number
): { tax: number; taxableIncome: number; totalDeductions: number } {
  // No standard deduction for freelancers, but they get 80C/80D/NPS
  const totalDeductions = section80C + section80D + section80CCD
  const taxableIncome = Math.max(0, netIncome - totalDeductions)
  
  // Rebate under 87A - no tax if taxable income <= 5L
  if (taxableIncome <= LIMITS.rebateThresholdOld) {
    return { tax: 0, taxableIncome, totalDeductions }
  }
  
  let tax = 0
  
  if (taxableIncome > 1000000) {
    tax += (taxableIncome - 1000000) * 0.30
    tax += 500000 * 0.20
    tax += 250000 * 0.05
  } else if (taxableIncome > 500000) {
    tax += (taxableIncome - 500000) * 0.20
    tax += 250000 * 0.05
  } else if (taxableIncome > 250000) {
    tax += (taxableIncome - 250000) * 0.05
  }
  
  tax = tax * 1.04
  return { tax: Math.round(tax), taxableIncome, totalDeductions }
}

// Calculate tax with additional investment
// Calculate tax with additional investment
// Investment fills 80C -> 80D -> 80CCD gaps, reducing Old Regime tax only.
// New Regime is unaffected. Final tax changes when Old Regime beats New Regime.
export function calculateTaxWithInvestment(
  inputs: TaxInputs,
  additionalInvestment: number,
  userProfile?: UserProfile
): TaxResult {
  const gaps = calculateDeductionGaps(inputs.section80C, inputs.section80D, inputs.section80CCD)

  let remaining = additionalInvestment
  let new80C = inputs.section80C
  let new80D = inputs.section80D
  let new80CCD = inputs.section80CCD

  // Fill 80C first
  if (remaining > 0 && gaps.section80C > 0) {
    const add80C = Math.min(gaps.section80C, remaining)
    new80C += add80C
    remaining -= add80C
  }

  // Fill 80D next
  if (remaining > 0 && gaps.section80D > 0) {
    const add80D = Math.min(gaps.section80D, remaining)
    new80D += add80D
    remaining -= add80D
  }

  // Fill 80CCD last
  if (remaining > 0 && gaps.section80CCD > 0) {
    const add80CCD = Math.min(gaps.section80CCD, remaining)
    new80CCD += add80CCD
    remaining -= add80CCD
  }

  // Recalculate with boosted deductions - only Old Regime benefits.
  // New Regime ignores 80C/80D/80CCD, so its tax stays constant.
  // Math.min in the dashboard will flip the winner when Old < New.
  return calculateTax(
    { ...inputs, section80C: new80C, section80D: new80D, section80CCD: new80CCD },
    userProfile
  )
}

// Get the allocation breakdown for a given investment amount
export function getInvestmentAllocation(
  inputs: TaxInputs,
  investmentAmount: number
): { section80C: number; section80D: number; section80CCD: number; wealthBuilding: number } {
  const gaps = calculateDeductionGaps(inputs.section80C, inputs.section80D, inputs.section80CCD)
  
  let remaining = investmentAmount
  let alloc80C = 0
  let alloc80D = 0
  let alloc80CCD = 0
  
  // Fill 80C first
  if (remaining > 0 && gaps.section80C > 0) {
    alloc80C = Math.min(gaps.section80C, remaining)
    remaining -= alloc80C
  }
  
  // Fill 80D next
  if (remaining > 0 && gaps.section80D > 0) {
    alloc80D = Math.min(gaps.section80D, remaining)
    remaining -= alloc80D
  }
  
  // Fill 80CCD last
  if (remaining > 0 && gaps.section80CCD > 0) {
    alloc80CCD = Math.min(gaps.section80CCD, remaining)
    remaining -= alloc80CCD
  }
  
  return {
    section80C: alloc80C,
    section80D: alloc80D,
    section80CCD: alloc80CCD,
    wealthBuilding: remaining, // Any remaining goes to wealth building (no tax benefit)
  }
}

// Format currency in Indian format
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format number with Indian comma separators
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount)
}

// Investment options database
const INVESTMENT_OPTIONS: Record<string, InvestmentOption[]> = {
  '80C': [
    {
      name: 'Quant Tax Plan Direct Growth',
      type: 'mutual-fund',
      category: 'ELSS',
      expectedReturn: '18-22% CAGR',
      risk: 'high',
      lockIn: '3 years',
      minInvestment: 500,
      description: 'Top-performing ELSS fund with aggressive growth strategy. Best for investors with high risk appetite.',
    },
    {
      name: 'Parag Parikh Tax Saver Fund',
      type: 'mutual-fund',
      category: 'ELSS',
      expectedReturn: '14-18% CAGR',
      risk: 'medium',
      lockIn: '3 years',
      minInvestment: 500,
      description: 'Diversified ELSS with international exposure. Balanced approach to growth and stability.',
    },
    {
      name: 'Mirae Asset Tax Saver Fund',
      type: 'mutual-fund',
      category: 'ELSS',
      expectedReturn: '15-19% CAGR',
      risk: 'medium',
      lockIn: '3 years',
      minInvestment: 500,
      description: 'Large-cap focused ELSS with consistent performance. Good for moderate risk takers.',
    },
    {
      name: 'Public Provident Fund (PPF)',
      type: 'ppf',
      category: 'Government Scheme',
      expectedReturn: '7.1% (guaranteed)',
      risk: 'low',
      lockIn: '15 years',
      minInvestment: 500,
      description: 'Safe government-backed investment with tax-free returns. Ideal for conservative investors.',
    },
    {
      name: '5-Year Tax Saving FD',
      type: 'fd',
      category: 'Bank Deposit',
      expectedReturn: '6.5-7.5%',
      risk: 'low',
      lockIn: '5 years',
      minInvestment: 1000,
      description: 'Fixed returns with capital protection. Suitable for risk-averse investors.',
    },
  ],
  '80D': [
    {
      name: 'HDFC Ergo Health Insurance',
      type: 'insurance',
      category: 'Health Insurance',
      expectedReturn: 'N/A (Protection)',
      risk: 'low',
      lockIn: '1 year policy',
      minInvestment: 5000,
      description: 'Comprehensive health cover for self and family with cashless treatment at 13,000+ hospitals.',
    },
    {
      name: 'Star Health Family Floater',
      type: 'insurance',
      category: 'Health Insurance',
      expectedReturn: 'N/A (Protection)',
      risk: 'low',
      lockIn: '1 year policy',
      minInvestment: 8000,
      description: 'Family floater plan with no room rent capping and wide network of hospitals.',
    },
    {
      name: 'ICICI Lombard Complete Health',
      type: 'insurance',
      category: 'Health Insurance',
      expectedReturn: 'N/A (Protection)',
      risk: 'low',
      lockIn: '1 year policy',
      minInvestment: 6000,
      description: 'Comprehensive coverage including day-care procedures and pre/post hospitalization.',
    },
  ],
  '80CCD': [
    {
      name: 'NPS Tier 1 - Aggressive (Equity 75%)',
      type: 'nps',
      category: 'Pension Scheme',
      expectedReturn: '10-14% CAGR',
      risk: 'medium',
      lockIn: 'Till age 60',
      minInvestment: 500,
      description: 'High equity allocation for young investors. Additional Rs 50,000 deduction over 80C.',
    },
    {
      name: 'NPS Tier 1 - Moderate (Equity 50%)',
      type: 'nps',
      category: 'Pension Scheme',
      expectedReturn: '8-11% CAGR',
      risk: 'medium',
      lockIn: 'Till age 60',
      minInvestment: 500,
      description: 'Balanced allocation between equity and debt. Good for moderate risk tolerance.',
    },
    {
      name: 'NPS Tier 1 - Conservative (Equity 25%)',
      type: 'nps',
      category: 'Pension Scheme',
      expectedReturn: '7-9% CAGR',
      risk: 'low',
      lockIn: 'Till age 60',
      minInvestment: 500,
      description: 'Debt-heavy allocation for capital preservation. Suitable for conservative investors.',
    },
  ],
  'STOCKS': [
    {
      name: 'HDFC Bank Ltd',
      type: 'stock',
      category: 'Large Cap - Banking',
      expectedReturn: '12-15% CAGR',
      risk: 'medium',
      lockIn: 'None (but hold 1+ year for LTCG)',
      minInvestment: 1600,
      description: 'India\'s largest private bank with strong fundamentals. Good for long-term wealth creation.',
    },
    {
      name: 'Reliance Industries Ltd',
      type: 'stock',
      category: 'Large Cap - Conglomerate',
      expectedReturn: '10-14% CAGR',
      risk: 'medium',
      lockIn: 'None (but hold 1+ year for LTCG)',
      minInvestment: 1300,
      description: 'Diversified conglomerate with energy, retail, and telecom businesses.',
    },
    {
      name: 'Infosys Ltd',
      type: 'stock',
      category: 'Large Cap - IT',
      expectedReturn: '12-16% CAGR',
      risk: 'medium',
      lockIn: 'None (but hold 1+ year for LTCG)',
      minInvestment: 1500,
      description: 'Leading IT services company with global presence. Benefits from digital transformation.',
    },
    {
      name: 'Nifty 50 ETF (UTI/SBI)',
      type: 'etf',
      category: 'Index ETF',
      expectedReturn: '11-13% CAGR',
      risk: 'medium',
      lockIn: 'None',
      minInvestment: 200,
      description: 'Low-cost way to invest in top 50 Indian companies. Perfect for passive investing.',
    },
    {
      name: 'Nippon India Small Cap Fund',
      type: 'mutual-fund',
      category: 'Small Cap',
      expectedReturn: '18-25% CAGR',
      risk: 'high',
      lockIn: 'None (but hold 3+ years)',
      minInvestment: 500,
      description: 'High-growth potential with higher volatility. For long-term aggressive investors.',
    },
  ],
}

// Generate detailed investment plan
export function generateDetailedInvestmentPlan(
  inputs: TaxInputs,
  investmentAmount: number,
  userProfile?: UserProfile
): DetailedInvestmentPlan {
  const gaps = calculateDeductionGaps(inputs.section80C, inputs.section80D, inputs.section80CCD)
  const advisorMode = userProfile?.advisorMode || 'growth'
  
  const breakdowns: InvestmentBreakdown[] = []
  let remaining = investmentAmount
  let totalTaxSaving = 0
  
  // Calculate current tax
  const currentResult = calculateTax(inputs, userProfile)
  const currentTax = Math.min(currentResult.oldRegimeTax, currentResult.newRegimeTax)
  
  // Fill 80C first (up to 1.5L)
  if (remaining > 0 && gaps.section80C > 0) {
    const amount80C = Math.min(gaps.section80C, remaining)
    const options = INVESTMENT_OPTIONS['80C'].filter(opt => {
      if (advisorMode === 'conservative') {
        return opt.risk === 'low' || opt.risk === 'medium'
      }
      return true
    })
    
    breakdowns.push({
      section: '80C - Tax Saving',
      amount: amount80C,
      options: options.slice(0, 3),
      timingAdvice: 'Start SIP immediately for rupee cost averaging. For lump sum, invest before March 31st for current FY benefit.',
      isTaxSaving: true,
    })
    remaining -= amount80C
  }
  
  // Fill 80D next (up to 25k)
  if (remaining > 0 && gaps.section80D > 0) {
    const amount80D = Math.min(gaps.section80D, remaining)
    
    breakdowns.push({
      section: '80D - Tax Saving',
      amount: amount80D,
      options: INVESTMENT_OPTIONS['80D'],
      timingAdvice: 'Buy health insurance at the start of FY (April) for full year coverage. Compare plans and choose one with adequate sum insured.',
      isTaxSaving: true,
    })
    remaining -= amount80D
  }
  
  // Fill 80CCD/NPS last (up to 50k additional)
  if (remaining > 0 && gaps.section80CCD > 0) {
    const amount80CCD = Math.min(gaps.section80CCD, remaining)
    const npsOptions = INVESTMENT_OPTIONS['80CCD'].filter(opt => {
      const age = userProfile?.age || 30
      if (age > 45) {
        return opt.risk !== 'high'
      }
      return true
    })
    
    breakdowns.push({
      section: '80CCD(1B) - Tax Saving',
      amount: amount80CCD,
      options: npsOptions,
      timingAdvice: 'Invest before March 31st for current FY deduction. Consider employer NPS contribution for additional benefits.',
      isTaxSaving: true,
    })
    remaining -= amount80CCD
  }
  
  // Add stock recommendations for remaining wealth building (not for tax saving)
  // Always show wealth building options if user is investing a reasonable amount
  if (investmentAmount >= 25000) {
    const stockOptions = INVESTMENT_OPTIONS['STOCKS'].filter(opt => {
      if (advisorMode === 'conservative') {
        return opt.risk !== 'high'
      }
      return true
    })
    
    breakdowns.push({
      section: 'Wealth Building',
      amount: remaining > 0 ? remaining : 0, // Allocate remaining to wealth building
      options: stockOptions.slice(0, 4),
      timingAdvice: 'Buy on market dips for better entry. For mutual funds, start SIPs immediately for rupee cost averaging.',
      isTaxSaving: false,
    })
  }
  
  // Calculate projected tax after investment
  const projectedResult = calculateTaxWithInvestment(inputs, investmentAmount, userProfile)
  const finalTax = Math.min(projectedResult.oldRegimeTax, projectedResult.newRegimeTax)
  const projectedTaxSavings = currentTax - finalTax
  
  const currentMonth = new Date().getMonth()
  const timingStrategy: string[] = []
  
  if (currentMonth >= 0 && currentMonth <= 2) {
    // Jan-Mar
    timingStrategy.push('Invest before March 31st to claim deductions for current FY 2025-26.')
    timingStrategy.push('For ELSS, even a lump sum now will start the 3-year lock-in period immediately.')
  } else if (currentMonth >= 3 && currentMonth <= 5) {
    // Apr-Jun
    timingStrategy.push('Great time to start! Full financial year ahead for systematic investments.')
    timingStrategy.push('Set up SIPs now for automatic monthly investments throughout the year.')
  } else if (currentMonth >= 6 && currentMonth <= 8) {
    // Jul-Sep
    timingStrategy.push('Mid-year check: Review progress and increase SIP amounts if behind target.')
    timingStrategy.push('Consider lump sum investments if you receive mid-year bonuses.')
  } else {
    // Oct-Dec
    timingStrategy.push('Year-end push: Calculate remaining investment needed for full deduction.')
    timingStrategy.push('Avoid last-minute rush in March - start now for better planning.')
  }
  
  timingStrategy.push('For stocks and equity funds, stagger investments over 2-3 months to reduce timing risk.')
  timingStrategy.push('Health insurance: Buy in April for full-year coverage alignment with financial year.')
  
  return {
    breakdowns,
    totalInvestment: investmentAmount,
    projectedTaxSavings,
    finalTax,
    timingStrategy,
  }
}
