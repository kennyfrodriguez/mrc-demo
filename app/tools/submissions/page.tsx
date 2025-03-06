'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { AppSidebar } from '@/components/Sidebar'
import { SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, Loader2, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Submission = {
  id: string
  ClientFName: string
  ClientLName: string
  ServiceType: string
  StartDate: string | null
  EndDate: string | null
  FormStatus: string
  LastChangeDate: string | null
  PickUpAddress: string
  DropOffFacilityName: string
  DropOffAddress: string
}

// Add these styles at the top of your component
const tableStyles = {
  header: "bg-gray-100 hover:bg-gray-100/80",
  cell: "px-4 py-3",
  headerCell: "px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider",
  row: "hover:bg-blue-50/50 transition-colors",
  badge: {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    APPROVED: "bg-green-100 text-green-800 border-green-200",
    REJECTED: "bg-red-100 text-red-800 border-red-200",
    default: "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      setError(null)
      const response = await fetch('/api/mrc-transform')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch submissions')
      }
      const data = await response.json()
      setSubmissions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch submissions')
      setSubmissions([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSubmissions = submissions.filter(submission => {
    const searchString = searchTerm.toLowerCase()
    return (
      submission.ClientFName?.toLowerCase().includes(searchString) ||
      submission.ClientLName?.toLowerCase().includes(searchString) ||
      submission.ServiceType?.toLowerCase().includes(searchString) ||
      submission.FormStatus?.toLowerCase().includes(searchString)
    )
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const downloadCSV = () => {
    const headers = ['Client Name', 'Service Type', 'Start Date', 'End Date', 'Status', 'Last Updated']
    const csvData = filteredSubmissions.map(s => [
      `${s.ClientFName} ${s.ClientLName}`,
      s.ServiceType,
      formatDate(s.StartDate),
      formatDate(s.EndDate),
      s.FormStatus,
      formatDate(s.LastChangeDate)
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'submissions.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex flex-1 pt-16">
          <AppSidebar />
          <div className="flex-1 p-0 w-full md:ml-64 mt-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white mb-6 shadow-md mx-0 mt-0 pt-16">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-7 w-7 text-blue-300" />
                <h1 className="text-2xl md:text-3xl font-bold">HST Management</h1>
              </div>
              <p className="text-gray-300">
                View and manage all member submissions and records
              </p>
            </div>
            
            <Card className="shadow-md border-none rounded-none">
              <CardHeader className="border-b">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold">Member Records</CardTitle>
                    <CardDescription>
                      View and manage all submitted member information
                    </CardDescription>
                  </div>
                  <Button
                    onClick={downloadCSV}
                    variant="outline"
                    className="flex items-center gap-2 self-start md:self-auto"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {error && (
                  <div className="m-6 p-4 border border-red-200 bg-red-50 rounded-lg text-red-800">
                    <h5 className="font-medium mb-1">Error</h5>
                    <div className="text-sm">{error}</div>
                  </div>
                )}

                <div className="relative w-full p-6">
                  <Search className="absolute left-9 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12"
                  />
                </div>

                <div className="border-t">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-sm font-medium whitespace-nowrap px-6 py-3">Client Name</TableHead>
                        <TableHead className="text-sm font-medium whitespace-nowrap px-6 py-3">Pickup Address</TableHead>
                        <TableHead className="text-sm font-medium whitespace-nowrap px-6 py-3">Dropoff Facility</TableHead>
                        <TableHead className="text-sm font-medium whitespace-nowrap px-6 py-3">Dropoff Address</TableHead>
                        <TableHead className="text-sm font-medium whitespace-nowrap px-6 py-3">Service Type</TableHead>
                        <TableHead className="text-sm font-medium whitespace-nowrap px-6 py-3">Start Date</TableHead>
                        <TableHead className="text-sm font-medium whitespace-nowrap px-6 py-3">End Date</TableHead>
                        <TableHead className="text-sm font-medium whitespace-nowrap px-6 py-3">Status</TableHead>
                        <TableHead className="text-sm font-medium whitespace-nowrap px-6 py-3">Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            <div className="flex justify-center items-center gap-2 text-primary">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading submissions...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredSubmissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No submissions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSubmissions.map((submission) => (
                          <TableRow key={submission.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium whitespace-nowrap px-6 py-4">
                              {submission.ClientFName} {submission.ClientLName}
                            </TableCell>
                            <TableCell className="text-muted-foreground px-6 py-4">{submission.PickUpAddress}</TableCell>
                            <TableCell className="text-muted-foreground px-6 py-4">{submission.DropOffFacilityName}</TableCell>
                            <TableCell className="text-muted-foreground px-6 py-4">{submission.DropOffAddress}</TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap px-6 py-4">{submission.ServiceType}</TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap px-6 py-4">{formatDate(submission.StartDate)}</TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap px-6 py-4">{formatDate(submission.EndDate)}</TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge 
                                variant={
                                  submission.FormStatus === "APPROVED" ? "default" :
                                  submission.FormStatus === "REJECTED" ? "destructive" :
                                  "secondary"
                                }
                                className="text-xs"
                              >
                                {submission.FormStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap px-6 py-4">{formatDate(submission.LastChangeDate)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
} 