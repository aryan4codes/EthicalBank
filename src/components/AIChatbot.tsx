/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useRef, useEffect } from 'react'
import { useAIChat } from '@/hooks/useBackend'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Send, Sparkles, Eye, Bot, User, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Helper function to format attribute names
function formatAttributeName(attr: string): string {
  const parts = attr.split('.')
  if (parts.length >= 2) {
    const [category, ...fieldParts] = parts
    // Remove duplicate prefixes (e.g., "savings_accounts.savings_accounts.balance" -> "savings_accounts.balance")
    let cleanField = fieldParts.join('.')
    cleanField = cleanField.replace(/^savings_accounts\./, '').replace(/^savings_goals\./, '')
    const formattedField = cleanField
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
    return formattedField
  }
  return attr.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Helper function to clean and deduplicate attributes
function cleanAttributes(attributes: string[]): string[] {
  const seen = new Set<string>()
  const cleaned: string[] = []
  
  attributes.forEach(attr => {
    // Remove duplicate prefixes like "savings_accounts.savings_accounts.balance"
    let cleanAttr = attr
    if (cleanAttr.includes('savings_accounts.savings_accounts')) {
      cleanAttr = cleanAttr.replace('savings_accounts.savings_accounts', 'savings_accounts')
    }
    if (cleanAttr.includes('savings_goals.savings_goals')) {
      cleanAttr = cleanAttr.replace('savings_goals.savings_goals', 'savings_goals')
    }
    
    // Normalize attribute format
    const normalized = cleanAttr.toLowerCase().trim()
    
    if (!seen.has(normalized)) {
      seen.add(normalized)
      cleaned.push(cleanAttr)
    }
  })
  
  return cleaned.sort()
}

// Helper function to group attributes by category
function groupAttributesByCategory(attributes: string[]): Array<{ category: string; attributes: string[] }> {
  const groups: Record<string, string[]> = {}
  
  const cleaned = cleanAttributes(attributes)
  
  cleaned.forEach(attr => {
    const parts = attr.split('.')
    if (parts.length >= 2) {
      const category = parts[0]
      if (!groups[category]) {
        groups[category] = []
      }
      // Only add unique attributes
      if (!groups[category].includes(attr)) {
        groups[category].push(attr)
      }
    } else {
      if (!groups['other']) {
        groups['other'] = []
      }
      if (!groups['other'].includes(attr)) {
        groups['other'].push(attr)
      }
    }
  })
  
  return Object.entries(groups)
    .map(([category, attrs]) => ({
      category: category === 'other' ? '' : category,
      attributes: attrs.sort()
    }))
    .filter(group => group.attributes.length > 0)
}

export function AIChatbot() {
  const [query, setQuery] = useState('')
  const [history, setHistory] = useState<Array<{ query: string; response: any; timestamp: Date }>>([])
  const [expandedAttributes, setExpandedAttributes] = useState<Set<number>>(new Set())
  const [isLoadingResponse, setIsLoadingResponse] = useState(false)
  const { sendQuery, isLoading, error } = useAIChat()
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const toggleAttributes = (idx: number) => {
    const newExpanded = new Set(expandedAttributes)
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx)
    } else {
      newExpanded.add(idx)
    }
    setExpandedAttributes(newExpanded)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading || isLoadingResponse) return

    const userQuery = query.trim()
    setQuery('')
    setIsLoadingResponse(true)

    // Add user message immediately
    setHistory(prev => [...prev, {
      query: userQuery,
      response: null,
      timestamp: new Date()
    }])

    try {
      const response = await sendQuery(userQuery)
      
      setHistory(prev => {
        const updated = [...prev]
        const lastIdx = updated.length - 1
        if (updated[lastIdx] && updated[lastIdx].response === null) {
          updated[lastIdx] = {
            ...updated[lastIdx],
            response: response,
          }
        }
        return updated
      })
    } catch (err: any) {
      console.error('Chat error:', err)
      const errorMessage = err?.message || 'Failed to get response. Please check if the backend is running and try again.'
      
      // Update the last message with error info
      setHistory(prev => {
        const updated = [...prev]
        const lastIdx = updated.length - 1
        if (updated[lastIdx] && updated[lastIdx].response === null) {
          updated[lastIdx] = {
            ...updated[lastIdx],
            response: {
              response: `**Please try again later!**`,
              error: true
            }
          }
        }
        return updated
      })
    } finally {
      setIsLoadingResponse(false)
    }
  }

  return (
    <Card className="w-full max-w-5xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 12rem)', minHeight: '600px' }}>
      <CardHeader className="border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          AI Banking Assistant
        </CardTitle>
        <CardDescription>
          Ask me anything about your banking - loans, accounts, transactions, offers, and more!
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1 overflow-hidden p-0">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {history.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Start a conversation
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md">
                Ask me anything about your banking - loans, accounts, transactions, offers, and more!
              </p>
            </div>
          )}
          
          {history.map((item, idx) => (
            <div key={idx} className="space-y-4">
              {/* User Query */}
              <div className="flex justify-end">
                <div className="flex items-start gap-3 max-w-[85%]">
                  <div className="flex-1 flex flex-col items-end">
                    <div className="bg-blue-600 dark:bg-blue-700 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {item.query}
                      </p>
                    </div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 px-2">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
              
              {/* AI Response */}
              {item.response ? (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3 max-w-[85%]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 flex flex-col space-y-3">
                      <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-neutral-200 dark:border-neutral-700">
                        <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed text-neutral-900 dark:text-neutral-100">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              strong: ({ children }) => <strong className="font-semibold text-neutral-900 dark:text-neutral-100">{children}</strong>,
                              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 ml-2">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 ml-2">{children}</ol>,
                              li: ({ children }) => <li className="ml-1">{children}</li>,
                              h2: ({ children }) => <h2 className="text-base font-semibold mt-4 mb-2 first:mt-0">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-1.5 first:mt-0">{children}</h3>,
                              code: ({ children }) => <code className="bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                              blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-3 italic my-2 text-neutral-700 dark:text-neutral-300">{children}</blockquote>,
                            }}
                          >
                            {typeof item.response === 'string' 
                              ? item.response 
                              : (item.response?.response || 'No response available')}
                          </ReactMarkdown>
                        </div>
                        
                        {/* Query Type Badge */}
                        {item.response.query_type && (
                          <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                            <Badge variant="secondary" className="text-xs">
                              {item.response.query_type.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Attributes Used - Collapsible */}
                      {item.response.attributes_used && item.response.attributes_used.length > 0 && (
                        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                          <button
                            onClick={() => toggleAttributes(idx)}
                            className="w-full px-4 py-2 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                Data Attributes Used ({item.response.attributes_used.length})
                              </span>
                            </div>
                            {expandedAttributes.has(idx) ? (
                              <ChevronUp className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                            )}
                          </button>
                          
                          {expandedAttributes.has(idx) && (
                            <div className="px-4 pb-4 pt-2 space-y-3 border-t border-neutral-200 dark:border-neutral-700">
                              {groupAttributesByCategory(item.response.attributes_used).map((group, groupIdx) => (
                                <div key={groupIdx} className="space-y-2">
                                  {group.category && (
                                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                                      {group.category.replace(/_/g, ' ')}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap gap-1.5">
                                    {group.attributes.map((attr: string, i: number) => (
                                      <Badge 
                                        key={i} 
                                        variant="outline" 
                                        className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-mono"
                                      >
                                        {formatAttributeName(attr)}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 px-1">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3 max-w-[85%]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-4 flex-shrink-0 bg-white dark:bg-neutral-900">
          {error && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">
                Error: {error}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything... (e.g., 'What bank offers do I qualify for?')"
              disabled={isLoading || isLoadingResponse}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e as any)
                }
              }}
            />
            <Button 
              type="submit" 
              disabled={isLoading || isLoadingResponse || !query.trim()}
              className="px-4"
            >
              {isLoading || isLoadingResponse ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>

          {/* Example Queries */}
          {history.length === 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "What bank offers do I qualify for?",
                  "Am I eligible for a loan?",
                  "Explain my spending patterns",
                  "What's my account balance?"
                ].map((example, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(example)}
                    className="text-xs h-7"
                    disabled={isLoading || isLoadingResponse}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
