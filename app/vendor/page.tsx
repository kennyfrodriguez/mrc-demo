'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, FileCheck, Search, Briefcase, Building2, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/Header"
import { AppSidebar } from "@/components/Sidebar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { SidebarProvider } from "@/components/ui/sidebar"
import { toast, Toaster } from "sonner"
import { cn } from "@/lib/utils"

// Define the Submission type to match the data from the API
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

interface TransportRequest {
  id: string
  clientName: string
  serviceType: string
  startDate: string
  endDate: string
  status: 'PENDING' | 'SUBMITTED' | 'AWARDED' | 'REJECTED'
  bidDeadline: string
  pickupLocation: string
  dropoffLocation: string
  schedule: {
    days: string[]
    arrivalTime: string
    departureTime: string
    detailedSchedule: Array<{
      day: string
      arrival: string
      departure: string
    }>
  }
  specialRequirements: {
    vehicleType: string
    wheelchairNeeded: boolean
    monitorRequired: boolean
  }
}

interface Bid {
  MRCTransFormID: string
  VendorCode: string
  BidSendDate: string
  BidReceivedDate: string
  OneWayTripCost: number
  RoundTripCost: number
  SharedRideCost?: number
  SharedRideWith?: string
  Awarded: boolean
  BidComments?: string
}

// Add a new interface for the bid data from the API
interface BidData extends Bid {
  // Add any additional fields that might come from the API
}

export default function VendorDashboard() {
  const [selectedRequest, setSelectedRequest] = useState<TransportRequest | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [bidDialogOpen, setBidDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [bidFormData, setBidFormData] = useState<Partial<Bid>>({
    VendorCode: 'V001', // Default vendor code for testing
    BidSendDate: new Date().toISOString().split('T')[0],
    OneWayTripCost: 0,
    RoundTripCost: 0,
    SharedRideCost: undefined,
    SharedRideWith: '',
    BidComments: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Add state for submissions data
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Add state for bids data
  const [bids, setBids] = useState<BidData[]>([])
  const [isLoadingBids, setIsLoadingBids] = useState(true)
  const [bidError, setBidError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("active")

  // Function to fetch submissions data
  const fetchSubmissions = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/submit-form')
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      setSubmissions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      console.error('Error fetching submissions:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Function to fetch bids data
  const fetchBids = async () => {
    setIsLoadingBids(true)
    setBidError(null)
    
    try {
      // For now, we're fetching all bids, but in a real app you'd filter by the current vendor
      const response = await fetch('/api/bids')
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      setBids(data)
    } catch (err) {
      setBidError(err instanceof Error ? err.message : 'An unknown error occurred')
      console.error('Error fetching bids:', err)
    } finally {
      setIsLoadingBids(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }
  
  // Format time for display
  const formatTime = (timeString: string | null): string => {
    if (!timeString) return 'N/A';
    
    try {
      const date = new Date(timeString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A';
      
      // Format time as "1:30 PM"
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'N/A';
    }
  }
  
  // Format currency for display
  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  // Get schedule days from submission
  const getScheduleDays = (submission: Submission) => {
    const days = []
    if (submission.SunArrivalTime) days.push('Sun')
    if (submission.MonArrivalTime) days.push('Mon')
    if (submission.TueArrivalTime) days.push('Tue')
    if (submission.WedArrivalTime) days.push('Wed')
    if (submission.ThuArrivalTime) days.push('Thu')
    if (submission.FriArrivalTime) days.push('Fri')
    if (submission.SatArrivalTime) days.push('Sat')
    return days
  }

  // Get arrival and departure times
  const getScheduleTimes = (submission: Submission) => {
    // Find the first day with times set
    let arrivalTime = null;
    let departureTime = null;
    
    if (submission.MonArrivalTime && submission.MonDepartureTime) {
      arrivalTime = submission.MonArrivalTime;
      departureTime = submission.MonDepartureTime;
    } else if (submission.TueArrivalTime && submission.TueDepartureTime) {
      arrivalTime = submission.TueArrivalTime;
      departureTime = submission.TueDepartureTime;
    } else if (submission.WedArrivalTime && submission.WedDepartureTime) {
      arrivalTime = submission.WedArrivalTime;
      departureTime = submission.WedDepartureTime;
    } else if (submission.ThuArrivalTime && submission.ThuDepartureTime) {
      arrivalTime = submission.ThuArrivalTime;
      departureTime = submission.ThuDepartureTime;
    } else if (submission.FriArrivalTime && submission.FriDepartureTime) {
      arrivalTime = submission.FriArrivalTime;
      departureTime = submission.FriDepartureTime;
    } else if (submission.SatArrivalTime && submission.SatDepartureTime) {
      arrivalTime = submission.SatArrivalTime;
      departureTime = submission.SatDepartureTime;
    } else if (submission.SunArrivalTime && submission.SunDepartureTime) {
      arrivalTime = submission.SunArrivalTime;
      departureTime = submission.SunDepartureTime;
    }
    
    return { 
      arrivalTime, 
      departureTime,
      formattedArrivalTime: formatTime(arrivalTime),
      formattedDepartureTime: formatTime(departureTime)
    };
  }

  // Get detailed schedule with specific times for each day
  const getDetailedSchedule = (submission: Submission) => {
    const schedule = [];
    
    if (submission.SunArrivalTime && submission.SunDepartureTime) {
      schedule.push({
        day: 'Sunday',
        arrival: formatTime(submission.SunArrivalTime),
        departure: formatTime(submission.SunDepartureTime)
      });
    }
    
    if (submission.MonArrivalTime && submission.MonDepartureTime) {
      schedule.push({
        day: 'Monday',
        arrival: formatTime(submission.MonArrivalTime),
        departure: formatTime(submission.MonDepartureTime)
      });
    }
    
    if (submission.TueArrivalTime && submission.TueDepartureTime) {
      schedule.push({
        day: 'Tuesday',
        arrival: formatTime(submission.TueArrivalTime),
        departure: formatTime(submission.TueDepartureTime)
      });
    }
    
    if (submission.WedArrivalTime && submission.WedDepartureTime) {
      schedule.push({
        day: 'Wednesday',
        arrival: formatTime(submission.WedArrivalTime),
        departure: formatTime(submission.WedDepartureTime)
      });
    }
    
    if (submission.ThuArrivalTime && submission.ThuDepartureTime) {
      schedule.push({
        day: 'Thursday',
        arrival: formatTime(submission.ThuArrivalTime),
        departure: formatTime(submission.ThuDepartureTime)
      });
    }
    
    if (submission.FriArrivalTime && submission.FriDepartureTime) {
      schedule.push({
        day: 'Friday',
        arrival: formatTime(submission.FriArrivalTime),
        departure: formatTime(submission.FriDepartureTime)
      });
    }
    
    if (submission.SatArrivalTime && submission.SatDepartureTime) {
      schedule.push({
        day: 'Saturday',
        arrival: formatTime(submission.SatArrivalTime),
        departure: formatTime(submission.SatDepartureTime)
      });
    }
    
    return schedule;
  };

  // Convert Submission to TransportRequest for UI compatibility
  const mapSubmissionToTransportRequest = (submission: Submission): TransportRequest => {
    const days = getScheduleDays(submission);
    const { formattedArrivalTime, formattedDepartureTime } = getScheduleTimes(submission);
    const detailedSchedule = getDetailedSchedule(submission);
    
    // Convert FormStatus to the appropriate TransportRequest status
    let status: 'PENDING' | 'SUBMITTED' | 'AWARDED' | 'REJECTED';
    
    switch(submission.FormStatus) {
      case "APPROVED":
        status = 'AWARDED';
        break;
      case "REJECTED":
        status = 'REJECTED';
        break;
      case "PENDING":
        status = 'PENDING';
        break;
      default:
        status = 'SUBMITTED';
    }
    
    return {
      id: submission.MRCTransFormID,
      clientName: `${submission.ClientFName} ${submission.ClientLName}`,
      serviceType: submission.ServiceType,
      startDate: submission.StartDate || '',
      endDate: submission.EndDate || '',
      status,
      bidDeadline: submission.MRCDateSubmitted || new Date().toISOString().split('T')[0],
      pickupLocation: `${submission.PickUpAddress}, ${submission.PickUpCity}, ${submission.PickUpState} ${submission.PickUpZip}`,
      dropoffLocation: `${submission.DropOffFacilityName}, ${submission.DropOffAddress}, ${submission.DropOffCity}, ${submission.DropOffState} ${submission.DropOffZip}`,
      schedule: {
        days: days,
        arrivalTime: formattedArrivalTime,
        departureTime: formattedDepartureTime,
        detailedSchedule: detailedSchedule || []
      },
      specialRequirements: {
        vehicleType: submission.TypeOfVehicle,
        wheelchairNeeded: submission.WCTypeSize !== '',
        monitorRequired: submission.Monitor
      }
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchSubmissions()
    fetchBids()
  }, [])
  
  // Fetch bids when the active tab changes to "submitted"
  useEffect(() => {
    if (activeTab === "submitted") {
      fetchBids()
    }
  }, [activeTab])

  // Filter submissions based on search query and status filter
  const filteredSubmissions = submissions
    .filter(submission => {
      const fullName = `${submission.ClientFName} ${submission.ClientLName}`.toLowerCase()
      const searchLower = searchQuery.toLowerCase()
      
      return fullName.includes(searchLower) || 
             submission.MRCTransFormID.toLowerCase().includes(searchLower) ||
             submission.ServiceType.toLowerCase().includes(searchLower) ||
             submission.PickUpAddress.toLowerCase().includes(searchLower) ||
             submission.DropOffFacilityName.toLowerCase().includes(searchLower)
    })
    .filter(submission => {
      if (statusFilter === 'all') return true
      return submission.FormStatus === statusFilter
    })
    .map(mapSubmissionToTransportRequest)

  // Update the handleBidSubmit function to handle submission better
  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRequest) return;
    
    // Validate form data
    if (!bidFormData.VendorCode) {
      toast.error("Vendor Code is required");
      return;
    }
    
    if (bidFormData.OneWayTripCost === undefined || bidFormData.OneWayTripCost === null || bidFormData.OneWayTripCost < 0) {
      toast.error("One Way Trip Cost must be a valid number");
      return;
    }
    
    if (bidFormData.RoundTripCost === undefined || bidFormData.RoundTripCost === null || bidFormData.RoundTripCost < 0) {
      toast.error("Round Trip Cost must be a valid number");
      return;
    }
    
    // Validate MRCTransFormID
    if (!selectedRequest.id) {
      toast.error("Invalid request ID");
      return;
    }
    
    setIsSubmitting(true);
    
    // Create the bid data object
    const mrcTransFormID = String(selectedRequest.id).trim();
    console.log("MRCTransFormID:", mrcTransFormID, "Type:", typeof mrcTransFormID);
    
    const bidData = {
      MRCTransFormID: mrcTransFormID,
      VendorCode: String(bidFormData.VendorCode).trim(),
      BidSendDate: bidFormData.BidSendDate || new Date().toISOString().split('T')[0],
      BidReceivedDate: new Date().toISOString().split('T')[0],
      OneWayTripCost: Number(bidFormData.OneWayTripCost),
      RoundTripCost: Number(bidFormData.RoundTripCost),
      SharedRideCost: bidFormData.SharedRideCost !== undefined ? Number(bidFormData.SharedRideCost) : null,
      SharedRideWith: bidFormData.SharedRideWith || null,
      Awarded: false,
      BidComments: bidFormData.BidComments || null
    }
    
    console.log("Submitting bid data:", bidData);
    
    try {
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bidData)
      })
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to submit bid');
      }
      
      // Show success message
      toast.success(responseData.message || "Bid submitted successfully");
      
      // Close the dialog
      setBidDialogOpen(false);
      
      // Reset the form data
      setBidFormData({
        VendorCode: 'V001', // Default vendor code for testing
        BidSendDate: new Date().toISOString().split('T')[0],
        OneWayTripCost: 0,
        RoundTripCost: 0,
        SharedRideCost: undefined,
        SharedRideWith: '',
        BidComments: ''
      });
      
      // Refresh the bids data
      fetchBids();
      
      // Switch to the "My Bids" tab
      setActiveTab("submitted");
      
    } catch (error) {
      console.error("Bid submission error:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit bid');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <AppSidebar />
        <div className="absolute left-64 right-0 top-16 p-6">
          {/* Add a max-width container */}
          <div className="mx-auto max-w-[1800px] w-[75%]">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white mb-6 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-7 w-7 text-blue-300" />
                <h1 className="text-2xl md:text-3xl font-bold">Vendor Transportation Portal</h1>
              </div>
              <p className="text-gray-300">
                View available transportation requests and submit your bids
              </p>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="active" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="active">Available Requests</TabsTrigger>
                <TabsTrigger value="submitted">My Bids</TabsTrigger>
                <TabsTrigger value="awarded">Awarded Contracts</TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                <Card>
                  <CardHeader className="border-b bg-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <CardTitle>Transportation Requests</CardTitle>
                      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Input 
                            placeholder="Search requests..." 
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <Select onValueChange={setStatusFilter} defaultValue="all">
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Requests</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {error && (
                      <div className="m-4 p-3 border border-red-200 bg-red-50 rounded text-red-800 text-sm">
                        <h5 className="font-medium mb-1">Error</h5>
                        <div>{error}</div>
                      </div>
                    )}
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Service Period</TableHead>
                          <TableHead>Schedule</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <div className="flex justify-center items-center gap-2 text-primary">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Loading requests...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : filteredSubmissions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                              No requests found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSubmissions.map(request => (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium">
                                {request.clientName}
                                <div className="text-sm text-muted-foreground">
                                  #{request.id}
                                </div>
                              </TableCell>
                              <TableCell>
                                {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                <div className="text-sm text-muted-foreground">
                                  Deadline: {formatDate(request.bidDeadline)}
                                </div>
                              </TableCell>
                              <TableCell>
                                {request.schedule.days.join(', ') || 'N/A'}
                                <div className="text-sm text-muted-foreground">
                                  {request.schedule.detailedSchedule && request.schedule.detailedSchedule.length > 0 
                                    ? `${request.schedule.detailedSchedule.length} day schedule` 
                                    : 'No schedule available'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  request.status === 'AWARDED' ? 'default' :
                                  request.status === 'REJECTED' ? 'destructive' : 'secondary'
                                }
                                className={cn(
                                  "text-xs",
                                  request.status === 'AWARDED' && "bg-green-100 text-green-800",
                                  request.status === 'REJECTED' && "bg-red-100 text-red-800",
                                  request.status === 'PENDING' && "bg-yellow-100 text-yellow-800"
                                )}>
                                  {request.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedRequest(request)
                                      setDetailsDialogOpen(true)
                                    }}
                                  >
                                    Details
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedRequest(request)
                                      setBidDialogOpen(true)
                                    }}
                                  >
                                    Bid
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* My Bids Tab */}
              <TabsContent value="submitted">
                <Card>
                  <CardHeader className="border-b">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <CardTitle>My Submitted Bids</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={fetchBids}
                        className="flex items-center gap-2"
                      >
                        <FileCheck className="h-4 w-4" />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {bidError && (
                      <div className="m-4 p-3 border border-red-200 bg-red-50 rounded text-red-800 text-sm">
                        <h5 className="font-medium mb-1">Error</h5>
                        <div>{bidError}</div>
                      </div>
                    )}
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request ID</TableHead>
                          <TableHead>Vendor Code</TableHead>
                          <TableHead>Bid Date</TableHead>
                          <TableHead>One-Way Cost</TableHead>
                          <TableHead>Round-Trip Cost</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingBids ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <div className="flex justify-center items-center gap-2 text-primary">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Loading bids...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : bids.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                              No bids found
                            </TableCell>
                          </TableRow>
                        ) : (
                          bids.map((bid) => (
                            <TableRow key={`${bid.MRCTransFormID}-${bid.VendorCode}`}>
                              <TableCell className="font-medium">
                                {bid.MRCTransFormID}
                              </TableCell>
                              <TableCell>{bid.VendorCode}</TableCell>
                              <TableCell>{formatDate(bid.BidSendDate)}</TableCell>
                              <TableCell>{formatCurrency(bid.OneWayTripCost)}</TableCell>
                              <TableCell>{formatCurrency(bid.RoundTripCost)}</TableCell>
                              <TableCell>
                                <Badge variant={bid.Awarded ? "default" : "secondary"}>
                                  {bid.Awarded ? "Awarded" : "Pending"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Awarded Contracts Tab */}
              <TabsContent value="awarded">
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle>Awarded Contracts</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request ID</TableHead>
                          <TableHead>Vendor Code</TableHead>
                          <TableHead>Bid Date</TableHead>
                          <TableHead>One-Way Cost</TableHead>
                          <TableHead>Round-Trip Cost</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingBids ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <div className="flex justify-center items-center gap-2 text-primary">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Loading contracts...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          bids.filter(bid => bid.Awarded).length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                                No awarded contracts found
                              </TableCell>
                            </TableRow>
                          ) : (
                            bids.filter(bid => bid.Awarded).map((bid) => (
                              <TableRow key={`${bid.MRCTransFormID}-${bid.VendorCode}`}>
                                <TableCell className="font-medium">
                                  {bid.MRCTransFormID}
                                </TableCell>
                                <TableCell>{bid.VendorCode}</TableCell>
                                <TableCell>{formatDate(bid.BidSendDate)}</TableCell>
                                <TableCell>{formatCurrency(bid.OneWayTripCost)}</TableCell>
                                <TableCell>{formatCurrency(bid.RoundTripCost)}</TableCell>
                                <TableCell>
                                  <Badge variant="default">
                                    Awarded
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          )
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Updated Bid Dialog */}
        {selectedRequest && (
          <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Bid for Request #{selectedRequest.id}</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleBidSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vendor Code</label>
                    <Input
                      required
                      value={bidFormData.VendorCode}
                      onChange={(e) => setBidFormData({...bidFormData, VendorCode: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bid Send Date</label>
                    <Input
                      type="date"
                      required
                      value={bidFormData.BidSendDate}
                      onChange={(e) => setBidFormData({...bidFormData, BidSendDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">One Way Trip Cost ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={bidFormData.OneWayTripCost || ''}
                      onChange={(e) => setBidFormData({...bidFormData, OneWayTripCost: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Round Trip Cost ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      value={bidFormData.RoundTripCost || ''}
                      onChange={(e) => setBidFormData({...bidFormData, RoundTripCost: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Shared Ride Cost ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={bidFormData.SharedRideCost || ''}
                      onChange={(e) => setBidFormData({...bidFormData, SharedRideCost: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Shared Ride With</label>
                    <Input
                      value={bidFormData.SharedRideWith || ''}
                      onChange={(e) => setBidFormData({...bidFormData, SharedRideWith: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Bid Comments</label>
                    <Input
                      value={bidFormData.BidComments || ''}
                      onChange={(e) => setBidFormData({...bidFormData, BidComments: e.target.value})}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Bid'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Details Dialog */}
        {selectedRequest && (
          <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Request Details #{selectedRequest.id}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Client Information</h3>
                    <p className="text-sm">Client: {selectedRequest.clientName}</p>
                    <p className="text-sm">Service Type: {selectedRequest.serviceType}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Schedule</h3>
                    {selectedRequest.schedule.detailedSchedule && selectedRequest.schedule.detailedSchedule.length > 0 ? (
                      <div className="space-y-1">
                        {selectedRequest.schedule.detailedSchedule.map((daySchedule, index) => (
                          <p key={index} className="text-sm">
                            <span className="font-medium">{daySchedule.day}:</span> {daySchedule.arrival} - {daySchedule.departure}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No schedule information available</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Locations</h3>
                  <p className="text-sm"><strong>Pickup:</strong> {selectedRequest.pickupLocation}</p>
                  <p className="text-sm"><strong>Dropoff:</strong> {selectedRequest.dropoffLocation}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Vehicle Type: {selectedRequest.specialRequirements.vehicleType || 'Not specified'}</li>
                    {selectedRequest.specialRequirements.wheelchairNeeded && (
                      <li>Wheelchair Access Required</li>
                    )}
                    {selectedRequest.specialRequirements.monitorRequired && (
                      <li>Monitor Required</li>
                    )}
                  </ul>
                </div>

                <DialogFooter>
                  <Button 
                    onClick={() => {
                      setDetailsDialogOpen(false)
                      setBidDialogOpen(true)
                    }}
                  >
                    Bid
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Toaster />
      </div>
    </SidebarProvider>
  )
} 