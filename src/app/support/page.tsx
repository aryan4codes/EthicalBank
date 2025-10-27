'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'
import { 
  MessageCircle,
  Phone,
  Mail,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Book,
  HelpCircle,
  FileText,
  Video,
  Brain
} from 'lucide-react'
import { useState } from 'react'

export default function Support() {
  const [searchTerm, setSearchTerm] = useState('')

  const supportTickets = [
    {
      id: '1',
      subject: 'Question about AI loan decision',
      status: 'Open',
      priority: 'Medium',
      createdAt: new Date('2024-10-26T14:30:00'),
      lastUpdate: new Date('2024-10-26T16:45:00'),
      channel: 'WebForm',
      category: 'AI Transparency'
    },
    {
      id: '2',
      subject: 'Unable to access privacy settings',
      status: 'In Progress',
      priority: 'High',
      createdAt: new Date('2024-10-25T09:15:00'),
      lastUpdate: new Date('2024-10-26T11:30:00'),
      channel: 'Chat',
      category: 'Technical Support'
    },
    {
      id: '3',
      subject: 'Request for transaction explanation',
      status: 'Resolved',
      priority: 'Low',
      createdAt: new Date('2024-10-23T16:20:00'),
      lastUpdate: new Date('2024-10-24T10:15:00'),
      channel: 'Phone',
      category: 'AI Transparency'
    }
  ]

  const faqItems = [
    {
      question: 'How does AI make decisions about my account?',
      category: 'AI Transparency',
      answer: 'Our AI systems use machine learning algorithms to analyze various factors including your credit history, spending patterns, and risk profile. All decisions are explainable and you can request detailed explanations through your AI Transparency dashboard.'
    },
    {
      question: 'Can I opt out of AI-driven services?',
      category: 'Privacy & Control',
      answer: 'Yes, you have granular control over how AI uses your data. Visit the Privacy & Control Center to manage your consent for different AI services. Note that some essential security features like fraud detection may be required for account protection.'
    },
    {
      question: 'Why was my transaction flagged by AI?',
      category: 'AI Transparency',
      answer: 'Transactions are flagged when our AI detects unusual patterns such as spending in uncommon locations, at unusual times, or with merchants outside your typical categories. You can view detailed explanations in your Transaction History.'
    },
    {
      question: 'How accurate is the AI fraud detection?',
      category: 'Security',
      answer: 'Our AI fraud detection system maintains a 99.8% accuracy rate with continuous learning and improvement. False positives are rare, and our system is designed to minimize inconvenience while maximizing security.'
    },
    {
      question: 'Can I request changes to my AI profile?',
      category: 'AI Transparency',
      answer: 'Absolutely! You can review your AI profile in the AI Insights section and request corrections if you believe any information is inaccurate. Our team will review and update your profile accordingly.'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'warning'
      case 'In Progress':
        return 'default'
      case 'Resolved':
        return 'success'
      case 'Closed':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'destructive'
      case 'Medium':
        return 'warning'
      case 'Low':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const filteredFAQ = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Support Center
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Get help with your account, AI features, and banking services
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Ticket
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">Live Chat</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Chat with our support team
                </p>
                <Badge variant="success">Available now</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">Phone Support</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Call us at 1-800-ETHICAL
                </p>
                <Badge variant="secondary">24/7 available</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-3">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-1">AI Assistant</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Get instant AI-powered help
                </p>
                <Badge variant="default">Ask anything</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-3">
                  <Mail className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-1">Email Support</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Send us detailed inquiries
                </p>
                <Badge variant="secondary">Response in 24h</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              My Support Tickets
            </CardTitle>
            <CardDescription>
              Track the status of your support requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supportTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                        {ticket.subject}
                      </h3>
                      <Badge variant={getStatusColor(ticket.status) as any}>
                        {ticket.status}
                      </Badge>
                      <Badge variant={getPriorityColor(ticket.priority) as any}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
                      <span>#{ticket.id}</span>
                      <span>•</span>
                      <span>{ticket.category}</span>
                      <span>•</span>
                      <span>Created {formatDateTime(ticket.createdAt)}</span>
                      <span>•</span>
                      <span>Last update {formatDateTime(ticket.lastUpdate)}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}

              {supportTickets.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">No support tickets yet.</p>
                  <Button className="mt-3">Create Your First Ticket</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Find answers to common questions about AI banking and transparency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md border border-neutral-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredFAQ.map((item, index) => (
                <div key={index} className="border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                        {item.question}
                      </h3>
                      <Badge variant="secondary">{item.category}</Badge>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))}

              {filteredFAQ.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-neutral-600 dark:text-neutral-400">No FAQ items found matching your search.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Book className="h-5 w-5 mr-2 text-blue-600" />
              Additional Resources
            </CardTitle>
            <CardDescription>
              Guides, tutorials, and documentation to help you get the most out of ethical banking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Brain className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">AI Transparency Guide</h3>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Learn how our AI systems work and how to understand AI-driven decisions.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Read Guide
                </Button>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold">Privacy Controls Tutorial</h3>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Step-by-step guide to managing your data privacy and AI consent settings.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Watch Tutorial
                </Button>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Video className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Getting Started Videos</h3>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Video series covering all features of our ethical banking platform.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Videos
                </Button>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold">API Documentation</h3>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Technical documentation for developers integrating with our services.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Docs
                </Button>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="font-semibold">Security Best Practices</h3>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Learn how to keep your account secure and protect your financial information.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Learn More
                </Button>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold">Community Forum</h3>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Connect with other users and share experiences with ethical banking.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Join Forum
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Multiple ways to reach our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">Phone Support</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  24/7 customer service
                </p>
                <p className="font-medium">1-800-ETHICAL</p>
                <p className="text-xs text-neutral-500">(1-800-384-4225)</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">Email Support</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  Response within 24 hours
                </p>
                <p className="font-medium">support@ethicalbank.com</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-1">Live Chat</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  Instant help available
                </p>
                <p className="font-medium">Available 24/7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
