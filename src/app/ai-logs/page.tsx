/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useQueryLogs } from '@/hooks/useBackend'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Eye, Clock, Brain, FileText, ChevronRight } from 'lucide-react'

// Helper function to format dates
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

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

export default function AIQueryLogsPage() {
  const { logs, total, isLoading, error, fetchLogs } = useQueryLogs()
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [page, setPage] = useState(0)
  const limit = 20

  useEffect(() => {
    if (fetchLogs) {
      fetchLogs(limit, page * limit)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const getQueryTypeColor = (type: string) => {
    switch (type) {
      case 'loan_eligibility':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'chat':
      case 'general':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'explanation':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'matched':
        return 'success'
      case 'partial':
        return 'warning'
      case 'mismatch':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            AI Query Logs
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            View all your AI interactions and the data attributes used for transparency
          </p>
        </div>

        {error && (
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="text-sm text-red-600 dark:text-red-400">
                Error: {error}
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Logs List */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Query History ({total})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {logs.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">
                      No query logs found. Start chatting with AI to see logs here.
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div
                        key={log._id}
                        onClick={() => setSelectedLog(log)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedLog?._id === log._id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getQueryTypeColor(log.queryType)}>
                                {log.queryType.replace('_', ' ')}
                              </Badge>
                              {log.validationStatus && (
                                <Badge variant={getStatusColor(log.validationStatus) as any}>
                                  {log.validationStatus}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                              {log.queryText || 'Query'}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-neutral-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {log.timestamp ? formatDate(new Date(log.timestamp)) : 'Unknown'}
                              </span>
                              {log.processingTimeMs && (
                                <span>{Math.round(log.processingTimeMs)}ms</span>
                              )}
                              {log.validatedAttributes && (
                                <span>{log.validatedAttributes.length} attributes</span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-neutral-400" />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Pagination */}
              {total > limit && (
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Page {page + 1} of {Math.ceil(total / limit)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => p + 1)}
                    disabled={(page + 1) * limit >= total}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>

            {/* Log Details */}
            <div className="lg:col-span-1">
              {selectedLog ? (
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Log Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Query Info */}
                    <div>
                      <h4 className="font-semibold mb-2">Query</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {selectedLog.queryText}
                      </p>
                    </div>

                    {/* Query Type */}
                    <div>
                      <h4 className="font-semibold mb-2">Type</h4>
                      <Badge className={getQueryTypeColor(selectedLog.queryType)}>
                        {selectedLog.queryType.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Timestamp */}
                    {selectedLog.timestamp && (
                      <div>
                        <h4 className="font-semibold mb-2">Time</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {formatDate(new Date(selectedLog.timestamp))}
                        </p>
                      </div>
                    )}

                    {/* Processing Time */}
                    {selectedLog.processingTimeMs && (
                      <div>
                        <h4 className="font-semibold mb-2">Processing Time</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {Math.round(selectedLog.processingTimeMs)}ms
                        </p>
                      </div>
                    )}

                    {/* Attributes Used */}
                    {selectedLog.validatedAttributes && selectedLog.validatedAttributes.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          Data Attributes Used
                        </h4>
                        <div className="space-y-2">
                          {groupAttributesByCategory(selectedLog.validatedAttributes).map((group, groupIdx) => (
                            <div key={groupIdx} className="space-y-1">
                              {group.category && (
                                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 capitalize">
                                  {group.category}:
                                </p>
                              )}
                              <div className="flex flex-wrap gap-1.5 ml-2">
                                {group.attributes.map((attr: string, idx: number) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
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

                    {/* Validation Status */}
                    {selectedLog.validationStatus && (
                      <div>
                        <h4 className="font-semibold mb-2">Validation</h4>
                        <Badge variant={getStatusColor(selectedLog.validationStatus) as any}>
                          {selectedLog.validationStatus}
                        </Badge>
                      </div>
                    )}

                    {/* AI Response Preview */}
                    {selectedLog.aiResponse && (
                      <div>
                        <h4 className="font-semibold mb-2">AI Response</h4>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg max-h-40 overflow-y-auto">
                          {selectedLog.aiResponse.response || selectedLog.aiResponse.explanation || 'See full log for details'}
                        </div>
                      </div>
                    )}

                    {/* View Full Log */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // Open full log in new window or modal
                        console.log('Full log:', selectedLog)
                      }}
                    >
                      View Full Log
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-neutral-500">
                      <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Select a log to view details</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

