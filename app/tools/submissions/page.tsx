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
import { cn } from "@/lib/utils"

type Submission = {
  MRCTransFormID: string
  ServiceType: string
  StartDate: string | null
  EndDate: string | null
  ClientFName: string
  ClientLName: string
  ClientGender: string
  ClientLanguage: string
  ClientPhone: string
  ClientDOB: string | null
  ClientEmergencyContact: string
  ClientEmergencyPhone: string
  ClientEmergencyPhoneEXT: string
  PickUpAddress: string
  PickUpCity: string
  PickUpState: string
  PickUpZip: string
  TypeOfVehicle: string
  WCTypeSize: string
  Monitor: boolean
  DropOffFacilityName: string
  DropOffAddress: string
  DropOffCity: string
  DropOffState: string
  DropOffZip: string
  DropOffContact: string
  DropOffPhone: string
  DropOffPhoneEXT: string
  AltAddressFacilityName: string
  AltAddressCity: string
  AltAddressState: string
  AltAddressZip: string
  AltAddressContact: string
  AltAddressPhone: string
  AltAddressPhoneEXT: string
  SunArrivalTime: string | null
  SunDepartureTime: string | null
  MonArrivalTime: string | null
  MonDepartureTime: string | null
  TueArrivalTime: string | null
  TueDepartureTime: string | null
  WedArrivalTime: string | null
  WedDepartureTime: string | null
  ThuArrivalTime: string | null
  ThuDepartureTime: string | null
  FriArrivalTime: string | null
  FriDepartureTime: string | null
  SatArrivalTime: string | null
  SatDepartureTime: string | null
  Instructions: string
  MRCRequesterName: string
  MRCRequesterPhone: string
  MRCRequesterPhoneExt: string
  MRCRequestDistrict: string
  MRCDateSubmitted: string | null
  MRCApprover: string
  MRCApproverPhone: string
  MRCApproverPhoneExt: string
  HSTDateREcived: string | null
  HSTDateToBroker: string | null
  HSTStaff: string
  MARTDateRecived: string | null
  DateEmailSentToVendors: string | null
  VendorContactInfo: string
  VendorCode: string
  OneWayTripCost: number
  RoundTripCost: number
  SharedRideCost: number
  SharedRideWith: string
  Comments: string
  FormStatus: string
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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      setError(null)
      const response = await fetch('/api/submit-form')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch submissions')
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

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredSubmissions.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage)

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const downloadCSV = () => {
    const headers = [
      'Client Name',
      'Service Type',
      'Start Date',
      'End Date',
      'Gender',
      'Language',
      'Phone',
      'DOB',
      'Emergency Contact',
      'Emergency Phone',
      'Pickup Address',
      'Pickup City',
      'Pickup State',
      'Pickup Zip',
      'Vehicle Type',
      'Wheelchair Type',
      'Monitor Required',
      'Dropoff Facility',
      'Dropoff Address',
      'Dropoff City',
      'Dropoff State',
      'Status',
      'Requester',
      'District',
      'Submission Date',
      'HST Staff',
      'Vendor',
      'Cost'
    ]
    
    const csvData = filteredSubmissions.map(s => [
      `${s.ClientFName} ${s.ClientLName}`,
      s.ServiceType,
      formatDate(s.StartDate),
      formatDate(s.EndDate),
      s.ClientGender,
      s.ClientLanguage,
      s.ClientPhone,
      formatDate(s.ClientDOB),
      s.ClientEmergencyContact,
      s.ClientEmergencyPhone,
      s.PickUpAddress,
      s.PickUpCity,
      s.PickUpState,
      s.PickUpZip,
      s.TypeOfVehicle,
      s.WCTypeSize,
      s.Monitor ? 'Yes' : 'No',
      s.DropOffFacilityName,
      s.DropOffAddress,
      s.DropOffCity,
      s.DropOffState,
      s.FormStatus,
      s.MRCRequesterName,
      s.MRCRequestDistrict,
      formatDate(s.MRCDateSubmitted),
      s.HSTStaff,
      s.VendorCode,
      `$${s.RoundTripCost.toFixed(2)}`
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <AppSidebar />
          <main className="w-full lg:pl-64 pt-16 flex justify-center">
            <div className="container px-4 py-6 max-w-6xl">
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-5 text-white mb-6 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-6 w-6 text-blue-300" />
                  <h1 className="text-xl md:text-2xl font-bold">HST Management</h1>
                </div>
                <p className="text-gray-300 text-sm">
                  View and manage all member submissions and records
                </p>
              </div>
              
              <Card className="shadow-md rounded-lg border">
                <CardHeader className="border-b p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg font-bold">Member Records</CardTitle>
                      <CardDescription className="text-sm">
                        View and manage all submitted member information
                      </CardDescription>
                    </div>
                    <Button
                      onClick={downloadCSV}
                      variant="outline"
                      className="flex items-center gap-2 self-start sm:self-auto"
                      size="sm"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {error && (
                    <div className="m-4 p-3 border border-red-200 bg-red-50 rounded text-red-800 text-sm">
                      <h5 className="font-medium mb-1">Error</h5>
                      <div>{error}</div>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="max-w-xs relative mb-4">
                      <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="border-t">
                    <div className="overflow-x-auto">
                      <table className="w-full divide-y divide-gray-200 text-sm table-fixed">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Client Name</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Pickup Address</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Dropoff Facility</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Dropoff Address</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Service Type</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">Start Date</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">End Date</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[7%]">Status</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[7%]">Last Updated</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {isLoading ? (
                            <tr>
                              <td colSpan={9} className="text-center py-8">
                                <div className="flex justify-center items-center gap-2 text-primary">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="text-sm">Loading submissions...</span>
                                </div>
                              </td>
                            </tr>
                          ) : filteredSubmissions.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="text-center py-8 text-muted-foreground text-sm">
                                No submissions found
                              </td>
                            </tr>
                          ) : (
                            currentItems.map((submission) => (
                              <tr key={submission.MRCTransFormID} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-xs font-medium text-gray-900 truncate">
                                  {submission.ClientFName} {submission.ClientLName}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-500 truncate">{submission.PickUpAddress}</td>
                                <td className="px-3 py-2 text-xs text-gray-500 truncate">{submission.DropOffFacilityName}</td>
                                <td className="px-3 py-2 text-xs text-gray-500 truncate">{submission.DropOffAddress}</td>
                                <td className="px-3 py-2 text-xs text-gray-500 truncate">{submission.ServiceType}</td>
                                <td className="px-3 py-2 text-xs text-gray-500 truncate">{formatDate(submission.StartDate)}</td>
                                <td className="px-3 py-2 text-xs text-gray-500 truncate">{formatDate(submission.EndDate)}</td>
                                <td className="px-3 py-2">
                                  <span 
                                    className={cn(
                                      "inline-flex text-xs px-2 py-0.5 rounded-full font-medium",
                                      submission.FormStatus === "APPROVED" && "bg-green-100 text-green-800",
                                      submission.FormStatus === "REJECTED" && "bg-red-100 text-red-800",
                                      submission.FormStatus === "PENDING" && "bg-yellow-100 text-yellow-800"
                                    )}
                                  >
                                    {submission.FormStatus}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-500 truncate">
                                  {formatDate(submission.MRCDateSubmitted)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    {!isLoading && filteredSubmissions.length > 0 && (
                      <div className="flex justify-between items-center px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                        <div className="text-sm text-gray-700">
                          Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                          <span className="font-medium">
                            {Math.min(indexOfLastItem, filteredSubmissions.length)}
                          </span>{" "}
                          of <span className="font-medium">{filteredSubmissions.length}</span> results
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            variant="outline"
                            size="sm"
                            className="px-2 py-1"
                          >
                            Previous
                          </Button>
                          {Array.from({ length: totalPages }, (_, i) => (
                            <Button
                              key={i + 1}
                              onClick={() => paginate(i + 1)}
                              variant={currentPage === i + 1 ? "default" : "outline"}
                              size="sm"
                              className="px-3 py-1"
                            >
                              {i + 1}
                            </Button>
                          ))}
                          <Button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            size="sm"
                            className="px-2 py-1"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
} 