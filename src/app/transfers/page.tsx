'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Send,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Clock,
  CheckCircle,
  User,
  Building,
  CreditCard,
  Search,
  Filter,
  History
} from 'lucide-react'
import { useState } from 'react'

export default function Transfers() {
  const [transferType, setTransferType] = useState('internal')
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')

  const recentTransfers = [
    {
      id: '1',
      type: 'Internal Transfer',
      from: 'Checking ****1234',
      to: 'Savings ****5678',
      amount: 500.00,
      date: new Date('2024-10-26T14:30:00'),
      status: 'Completed',
      reference: 'Monthly savings transfer'
    },
    {
      id: '2',
      type: 'External Transfer',
      from: 'Checking ****1234',
      to: 'John Doe - Chase Bank',
      amount: 250.00,
      date: new Date('2024-10-25T16:20:00'),
      status: 'Completed',
      reference: 'Rent split payment'
    },
    {
      id: '3',
      type: 'Wire Transfer',
      from: 'Checking ****1234',
      to: 'ABC Real Estate LLC',
      amount: 2500.00,
      date: new Date('2024-10-24T10:15:00'),
      status: 'Pending',
      reference: 'Security deposit'
    }
  ]

  const savedPayees = [
    {
      id: '1',
      name: 'John Doe',
      nickname: 'Roommate John',
      type: 'External Account',
      lastUsed: new Date('2024-10-25')
    },
    {
      id: '2',
      name: 'Property Management LLC',
      nickname: 'Landlord',
      type: 'External Account',
      lastUsed: new Date('2024-10-01')
    },
    {
      id: '3',
      name: 'Savings Account',
      nickname: 'My Savings',
      type: 'Internal Account',
      lastUsed: new Date('2024-10-26')
    }
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Transfers & Payments
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Send money, pay bills, and manage your transfer history
            </p>
          </div>
          <Badge variant="success" className="text-sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            Secure transfers enabled
          </Badge>
        </div>

        {/* Quick Transfer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2 text-blue-600" />
              Send Money
            </CardTitle>
            <CardDescription>
              Transfer funds between accounts or to external recipients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Transfer Type Selection */}
              <div className="flex space-x-4">
                <Button
                  variant={transferType === 'internal' ? 'default' : 'outline'}
                  onClick={() => setTransferType('internal')}
                  className="flex-1"
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Between My Accounts
                </Button>
                <Button
                  variant={transferType === 'external' ? 'default' : 'outline'}
                  onClick={() => setTransferType('external')}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  To Someone Else
                </Button>
                <Button
                  variant={transferType === 'wire' ? 'default' : 'outline'}
                  onClick={() => setTransferType('wire')}
                  className="flex-1"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Wire Transfer
                </Button>
              </div>

              {/* Transfer Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">From Account</label>
                    <select className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
                      <option>Checking ****1234 - {formatCurrency(3247.89)}</option>
                      <option>Savings ****5678 - {formatCurrency(9300.00)}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {transferType === 'internal' ? 'To Account' : 'Recipient'}
                    </label>
                    {transferType === 'internal' ? (
                      <select className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
                        <option>Savings ****5678 - High-Yield Savings</option>
                        <option>CD ****3456 - Certificate of Deposit</option>
                      </select>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="Search saved payees or enter new recipient"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          className="w-full rounded-md border border-neutral-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full rounded-md border border-neutral-200 bg-white pl-8 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">When to Send</label>
                    <select className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
                      <option>Now</option>
                      <option>Tomorrow</option>
                      <option>Choose date...</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Reference/Memo</label>
                    <input
                      type="text"
                      placeholder="Optional note for this transfer"
                      className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    />
                  </div>

                  {transferType !== 'internal' && (
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Transfer Fee</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {transferType === 'wire' ? '$25.00 wire transfer fee' : 'No fee for ACH transfers'}
                      </p>
                    </div>
                  )}

                  <Button className="w-full" size="lg">
                    <Send className="h-4 w-4 mr-2" />
                    Send Transfer
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saved Payees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Saved Payees
              </div>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Payee
              </Button>
            </CardTitle>
            <CardDescription>
              Quickly send money to your frequently used recipients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {savedPayees.map((payee) => (
                <div key={payee.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      {payee.type === 'Internal Account' ? (
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      ) : (
                        <User className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                        {payee.nickname}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {payee.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-neutral-500 mb-3">
                    <span>{payee.type}</span>
                    <span>Last used {formatDate(payee.lastUsed)}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Send Money
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transfers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="h-5 w-5 mr-2 text-blue-600" />
              Recent Transfers
            </CardTitle>
            <CardDescription>
              View your recent transfer activity and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransfers.map((transfer) => (
                <div key={transfer.id} className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      {transfer.type === 'Internal Transfer' ? (
                        <ArrowUpRight className="h-5 w-5 text-blue-600" />
                      ) : transfer.type === 'Wire Transfer' ? (
                        <Building className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Send className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                        {transfer.reference}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        From {transfer.from} → {transfer.to}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatDate(transfer.date)} • {transfer.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      -{formatCurrency(transfer.amount)}
                    </div>
                    <Badge variant={transfer.status === 'Completed' ? 'success' : 'warning'}>
                      {transfer.status === 'Completed' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {transfer.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transfer Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Transfer Limits & Information</CardTitle>
            <CardDescription>
              Daily and monthly transfer limits for your security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Internal Transfers</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Daily limit:</span>
                    <span>{formatCurrency(50000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Used today:</span>
                    <span>{formatCurrency(500)}</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mt-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '1%'}}></div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-semibold mb-2">ACH Transfers</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Daily limit:</span>
                    <span>{formatCurrency(10000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Used today:</span>
                    <span>{formatCurrency(250)}</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '2.5%'}}></div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-semibold mb-2">Wire Transfers</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Daily limit:</span>
                    <span>{formatCurrency(100000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Used today:</span>
                    <span>{formatCurrency(0)}</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mt-2">
                    <div className="bg-neutral-300 dark:bg-neutral-600 h-2 rounded-full" style={{width: '0%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
