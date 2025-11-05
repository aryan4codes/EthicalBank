'use client'

import { useState } from 'react'
import { useAIChat } from '@/hooks/useBackend'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Send, Sparkles, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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

export function AIChatbot() {
  const [query, setQuery] = useState('')
  const [history, setHistory] = useState<Array<{ query: string; response: any }>>([])
  const { sendQuery, isLoading, error } = useAIChat()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return

    const userQuery = query.trim()
    setQuery('')

    try {
      const response = await sendQuery(userQuery)
      
      setHistory(prev => [...prev, {
        query: userQuery,
        response: response,
      }])
    } catch (err) {
      console.error('Chat error:', err)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Banking Assistant
        </CardTitle>
        <CardDescription>
          Ask me anything about your banking - loans, accounts, transactions, offers, and more!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat History */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {history.map((item, idx) => (
            <div key={idx} className="space-y-2">
              {/* User Query */}
              <div className="flex justify-end">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm">{item.query}</p>
                </div>
              </div>
              
              {/* AI Response */}
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm mb-2">{item.response.response}</p>
                  
                  {/* Attributes Used */}
                  {item.response.attributes_used && item.response.attributes_used.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-700">
                      <p className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Data Attributes Used:
                      </p>
                      <div className="space-y-1">
                        {groupAttributesByCategory(item.response.attributes_used).map((group, groupIdx) => (
                          <div key={groupIdx} className="space-y-1">
                            {group.category && (
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-500 capitalize">
                                {group.category}:
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1.5 ml-2">
                              {group.attributes.map((attr: string, i: number) => (
                                <Badge 
                                  key={i} 
                                  variant="outline" 
                                  className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                >
                                  {formatAttributeName(attr)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Query Type */}
                  {item.response.query_type && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.response.query_type}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask me anything... (e.g., 'What bank offers do I qualify for?')"
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !query.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400">
            Error: {error}
          </div>
        )}

        {/* Example Queries */}
        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Try asking:</p>
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
                className="text-xs"
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

