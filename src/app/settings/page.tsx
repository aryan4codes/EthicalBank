'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useBackendProfile } from '@/hooks/useBackend'
import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useUser()
  const { profile, isLoading, error, fetchProfile, updateProfile, checkCompletion } = useBackendProfile()
  const [formData, setFormData] = useState({
    income: '',
    dateOfBirth: '',
    phoneNumber: '',
    employmentStatus: '',
    creditScore: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  })
  const [completionStatus, setCompletionStatus] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchProfile()
      checkCompletion().then(setCompletionStatus)
    }
  }, [user?.id, fetchProfile, checkCompletion])

  useEffect(() => {
    if (profile) {
      setFormData({
        income: profile.income?.toString() || '',
        dateOfBirth: profile.dateOfBirth?.split('T')[0] || '',
        phoneNumber: profile.phoneNumber || '',
        employmentStatus: profile.employmentStatus || '',
        creditScore: profile.creditScore?.toString() || '',
        address: profile.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        }
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    try {
      await updateProfile({
        income: formData.income ? parseFloat(formData.income) : undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        employmentStatus: formData.employmentStatus || undefined,
        creditScore: formData.creditScore ? parseInt(formData.creditScore) : undefined,
        address: formData.address.street ? formData.address : undefined,
      })
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      
      // Refresh completion status
      const status = await checkCompletion()
      setCompletionStatus(status)
    } catch (err) {
      console.error('Failed to update profile:', err)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Complete your profile to access all EthicalBank features
          </p>
        </div>

        {/* Completion Status */}
        {completionStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {completionStatus.profileCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completion</span>
                  <Badge variant={completionStatus.profileCompleted ? "default" : "secondary"}>
                    {completionStatus.completionPercentage.toFixed(0)}%
                  </Badge>
                </div>
                {completionStatus.missingFields.length > 0 && (
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    <p className="font-semibold mb-1">Missing fields:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {completionStatus.missingFields.map((field: string, idx: number) => (
                        <li key={idx}>{field}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your profile information. All fields are required for full access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Income */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Annual Income (INR) *
                </label>
                <Input
                  type="number"
                  value={formData.income}
                  onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                  placeholder="1500000"
                  required
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date of Birth *
                </label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+91 9876543210"
                  required
                />
              </div>

              {/* Employment Status */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Employment Status *
                </label>
                <select
                  value={formData.employmentStatus}
                  onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 dark:border-neutral-800 dark:bg-neutral-950"
                  required
                >
                  <option value="">Select status</option>
                  <option value="employed">Employed</option>
                  <option value="self_employed">Self Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="retired">Retired</option>
                </select>
              </div>

              {/* Credit Score */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Credit Score (300-850) *
                </label>
                <Input
                  type="number"
                  min="300"
                  max="850"
                  value={formData.creditScore}
                  onChange={(e) => setFormData({ ...formData, creditScore: e.target.value })}
                  placeholder="750"
                  required
                />
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address (Optional)</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Street</label>
                  <Input
                    value={formData.address.street}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value }
                    })}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <Input
                      value={formData.address.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value }
                      })}
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <Input
                      value={formData.address.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value }
                      })}
                      placeholder="Maharashtra"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Zip Code</label>
                    <Input
                      value={formData.address.zipCode}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, zipCode: e.target.value }
                      })}
                      placeholder="400001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <Input
                      value={formData.address.country}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, country: e.target.value }
                      })}
                      placeholder="India"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                {saved && (
                  <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Saved successfully!
                  </span>
                )}
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  Error: {error}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
