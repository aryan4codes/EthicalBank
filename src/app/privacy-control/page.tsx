'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'
import { useDataAccessControl } from '@/hooks/useBackend'
import { useUser } from '@clerk/nextjs'
import { 
  Shield, 
  Eye, 
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bell,
  Lock,
  Database,
  Users,
  FileText,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Loader2,
  Save,
  Info,
  Brain
} from 'lucide-react'

export default function PrivacyControl() {
  const { user, isLoaded } = useUser()
  const {
    attributes,
    permissions,
    consentHistory,
    privacyScore,
    isLoading,
    error,
    fetchAll,
    updatePermissions,
  } = useDataAccessControl()

  const [localPermissions, setLocalPermissions] = useState<Record<string, boolean>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['user', 'accounts', 'transactions']))

  useEffect(() => {
    if (isLoaded && user) {
      fetchAll()
    }
  }, [isLoaded, user, fetchAll])

  useEffect(() => {
    if (permissions?.permissions) {
      setLocalPermissions(permissions.permissions)
      setHasChanges(false)
    }
  }, [permissions])

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleAttribute = (attributeId: string) => {
    setLocalPermissions(prev => ({
      ...prev,
      [attributeId]: !prev[attributeId]
    }))
    setHasChanges(true)
  }

  const toggleCategoryAll = (categoryId: string, allow: boolean) => {
    if (!attributes?.attributes) return
    
    const category = attributes.attributes[categoryId]
    if (!category) return

    const newPermissions = { ...localPermissions }
    category.attributes.forEach((attr: any) => {
      newPermissions[attr.id] = allow
    })
    
    setLocalPermissions(newPermissions)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!hasChanges) return
    
    try {
      const permissionsArray = Object.entries(localPermissions).map(([attributeId, allowed]) => ({
        attributeId,
        allowed,
      }))
      
      await updatePermissions(permissionsArray)
      setHasChanges(false)
    } catch (err) {
      console.error('Failed to save permissions:', err)
    }
  }

  const handleReset = () => {
    if (permissions?.permissions) {
      setLocalPermissions(permissions.permissions)
      setHasChanges(false)
    }
  }

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    )
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
              Privacy & Data Control Center
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Please sign in to manage your data privacy settings.
            </p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const allowedCount = Object.values(localPermissions).filter(Boolean).length
  const totalAttributes = Object.keys(localPermissions).length || (attributes?.totalAttributes || 0)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Privacy & Data Control Center
            </h1>
            <p className="text-neutral-800 dark:text-neutral-200">
              Control which data attributes AI can access for decision-making and recommendations
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Reset
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => fetchAll()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
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

        {/* Privacy Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Privacy Score</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {privacyScore?.score || 0}%
              </div>
              <p className="text-xs text-neutral-700 dark:text-neutral-300">
                {privacyScore?.message || 'Privacy protection level'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attributes Allowed</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{allowedCount} / {totalAttributes}</div>
              <p className="text-xs text-neutral-700 dark:text-neutral-300">
                {totalAttributes > 0 ? `${Math.round((allowedCount / totalAttributes) * 100)}% enabled` : 'No attributes configured'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attributes Restricted</CardTitle>
              <Lock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {totalAttributes - allowedCount}
              </div>
              <p className="text-xs text-neutral-700 dark:text-neutral-300">
                Restricted from AI access
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <FileText className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {permissions?.lastUpdated 
                  ? formatDateTime(new Date(permissions.lastUpdated))
                  : 'Never'}
              </div>
              <p className="text-xs text-neutral-700 dark:text-neutral-300">
                Since last change
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Attribute Permissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  AI Data Access Permissions
                </CardTitle>
                <CardDescription>
                  Control which data attributes AI can use for decisions and recommendations. 
                  Granting access enables personalized insights while restricting maintains privacy.
                </CardDescription>
              </div>
              {hasChanges && (
                <Badge variant="warning" className="animate-pulse">
                  Unsaved Changes
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading && !attributes ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-3 text-neutral-800 dark:text-neutral-200">Loading data attributes...</span>
              </div>
            ) : attributes?.attributes ? (
              Object.entries(attributes.attributes).map(([categoryId, category]: [string, any]) => {
                const categoryAllowed = category.attributes.every((attr: any) => localPermissions[attr.id])
                const categoryRestricted = category.attributes.every((attr: any) => !localPermissions[attr.id])
                const categoryCount = category.attributes.length
                const allowedInCategory = category.attributes.filter((attr: any) => localPermissions[attr.id]).length

                return (
                  <div key={categoryId} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg capitalize">
                            {category.category}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {allowedInCategory} / {categoryCount} allowed
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-800 dark:text-neutral-200">
                          Control access to {category.category.toLowerCase()} data
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCategoryAll(categoryId, true)}
                          disabled={categoryAllowed}
                        >
                          Allow All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCategoryAll(categoryId, false)}
                          disabled={categoryRestricted}
                        >
                          Restrict All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategory(categoryId)}
                        >
                          {expandedCategories.has(categoryId) ? 'Collapse' : 'Expand'}
                        </Button>
                      </div>
                    </div>

                    {expandedCategories.has(categoryId) && (
                      <div className="space-y-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                        {category.attributes.map((attr: any) => {
                          const isAllowed = localPermissions[attr.id] ?? true
                          
                          return (
                            <div
                              key={attr.id}
                              className={`flex items-start justify-between p-3 rounded-lg border ${
                                isAllowed
                                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
                                  : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
                              }`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{attr.name}</h4>
                                  <Badge variant={isAllowed ? 'success' : 'destructive'} className="text-xs">
                                    {isAllowed ? 'Allowed' : 'Restricted'}
                                  </Badge>
                                </div>
                                <p className="text-xs text-neutral-800 dark:text-neutral-200 mb-1">
                                  {attr.description}
                                </p>
                                <code className="text-xs text-neutral-700 dark:text-neutral-300 font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">
                                  {attr.id}
                                </code>
                              </div>
                              <div className="ml-4">
                                <button
                                  onClick={() => toggleAttribute(attr.id)}
                                  className={`flex items-center transition-colors ${
                                    isAllowed ? 'text-green-600' : 'text-red-400'
                                  }`}
                                  title={isAllowed ? 'Click to restrict' : 'Click to allow'}
                                >
                                  {isAllowed ? (
                                    <ToggleRight className="h-6 w-6" />
                                  ) : (
                                    <ToggleLeft className="h-6 w-6" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12 text-neutral-700 dark:text-neutral-300">
                No data attributes available
              </div>
            )}

            {hasChanges && (
              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-4 -mx-6 -mb-6 rounded-b-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-neutral-800 dark:text-neutral-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span>You have unsaved changes</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReset}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Important Note */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  How This Works
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• <strong>Allowed attributes</strong> can be used by AI for personalized recommendations, insights, and decision-making</li>
                  <li>• <strong>Restricted attributes</strong> are excluded from AI analysis - AI will not access this data</li>
                  <li>• <strong>Fraud detection</strong> and essential security features may still access restricted data for account protection</li>
                  <li>• Changes take effect immediately - AI recommendations will reflect your new preferences</li>
                  <li>• You can see which attributes were used in any AI decision in the AI Insights page</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consent History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Consent Change History
            </CardTitle>
            <CardDescription>
              View your complete history of privacy consent changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && consentHistory.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : consentHistory.length > 0 ? (
              <div className="space-y-4">
                {consentHistory.map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {record.status === 'granted' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{record.purpose}</p>
                        <p className="text-sm text-neutral-800 dark:text-neutral-200">
                          {formatDateTime(new Date(record.createdAt))}
                        </p>
                        {record.dataTypes && record.dataTypes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {record.dataTypes.slice(0, 3).map((dt: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {dt}
                              </Badge>
                            ))}
                            {record.dataTypes.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{record.dataTypes.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={record.status === 'granted' ? 'success' : 'destructive'}>
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-700 dark:text-neutral-300">
                No consent history available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Export & Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Your Data Rights
            </CardTitle>
            <CardDescription>
              Exercise your rights to access, export, or manage your personal data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Eye className="h-6 w-6 mb-2" />
                View My Profile
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Database className="h-6 w-6 mb-2" />
                Export My Data
              </Button>
              <Button variant="outline" className="h-20 flex-col text-red-600 border-red-200 hover:bg-red-50">
                <AlertTriangle className="h-6 w-6 mb-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
