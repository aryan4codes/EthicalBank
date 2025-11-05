'use client'

import { useState } from 'react'
import { useLoanEligibility } from '@/hooks/useBackend'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react'

// Helper function to format attribute names
function formatAttributeName(attr: string): string {
  const parts = attr.split('.')
  if (parts.length === 2) {
    const [category, field] = parts
    const formattedField = field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
    return formattedField
  }
  return attr
}

// Helper function to group attributes by category
function groupAttributesByCategory(attributes: string[]): Array<{ category: string; attributes: string[] }> {
  const groups: Record<string, string[]> = {}
  
  attributes.forEach(attr => {
    const parts = attr.split('.')
    if (parts.length === 2) {
      const category = parts[0]
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(attr)
    } else {
      if (!groups['other']) {
        groups['other'] = []
      }
      groups['other'].push(attr)
    }
  })
  
  return Object.entries(groups).map(([category, attrs]) => ({
    category: category === 'other' ? '' : category,
    attributes: attrs.sort()
  }))
}

export function LoanEligibilityChecker() {
  const [loanAmount, setLoanAmount] = useState('')
  const [loanType, setLoanType] = useState('personal')
  const { checkEligibility, result, isLoading, error } = useLoanEligibility()

  const handleCheck = async () => {
    if (!loanAmount) return
    await checkEligibility(parseFloat(loanAmount), loanType)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check Loan Eligibility</CardTitle>
        <CardDescription>
          Get instant AI-powered loan eligibility assessment with full transparency
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Loan Amount (INR)</label>
            <Input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="700000"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Loan Type</label>
            <select
              value={loanType}
              onChange={(e) => setLoanType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
            >
              <option value="personal">Personal Loan</option>
              <option value="home">Home Loan</option>
              <option value="car">Car Loan</option>
              <option value="education">Education Loan</option>
            </select>
          </div>
        </div>

        <Button onClick={handleCheck} disabled={isLoading || !loanAmount} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking Eligibility...
            </>
          ) : (
            'Check Eligibility'
          )}
        </Button>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
            Error: {error}
          </div>
        )}

        {result && (
          <div className="space-y-4 mt-4">
            {/* Decision */}
            <div className={`p-4 rounded-lg ${
              result.decision === 'approved' ? 'bg-green-50 dark:bg-green-950' :
              result.decision === 'denied' ? 'bg-red-50 dark:bg-red-950' :
              'bg-yellow-50 dark:bg-yellow-950'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.decision === 'approved' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : result.decision === 'denied' ? (
                  <XCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <h3 className="font-semibold capitalize">{result.decision}</h3>
                {result.confidence && (
                  <Badge variant="secondary" className="ml-auto">
                    {Math.round(result.confidence * 100)}% confidence
                  </Badge>
                )}
              </div>
              <p className="text-sm">{result.explanation}</p>
            </div>

            {/* Factors */}
            {result.factors && result.factors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Decision Factors</h4>
                <div className="space-y-2">
                  {result.factors.map((factor: any, idx: number) => (
                    <div key={idx} className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{factor.name}</span>
                        <Badge variant={factor.impact === 'positive' ? 'default' : 'destructive'}>
                          {factor.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {factor.reason}
                      </p>
                      <div className="mt-2 text-xs text-neutral-500">
                        Weight: {Math.round(factor.weight * 100)}% | Value: {factor.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes Used */}
            {result.attributes_used && result.attributes_used.length > 0 && (
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Data Attributes Used
                </h4>
                <div className="space-y-3">
                  {groupAttributesByCategory(result.attributes_used).map((group, groupIdx) => (
                    <div key={groupIdx} className="space-y-2">
                      {group.category && (
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize">
                          {group.category}:
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 ml-2">
                        {group.attributes.map((attr: string, idx: number) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                          >
                            {formatAttributeName(attr)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {result.queryLogId && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
                    View full audit log: {result.queryLogId}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

