'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, FileCheck, Search, Briefcase, Building2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/Header"
import { AppSidebar } from "@/components/Sidebar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { SidebarProvider } from "@/components/ui/sidebar"
import { toast, Toaster } from "sonner"

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

// Mock data
const MOCK_REQUESTS: TransportRequest[] = [
  {
    id: "TR001",
    clientName: "John Smith",
    serviceType: "Regular Transport",
    startDate: "2024-04-01",
    endDate: "2024-12-31",
    status: "PENDING",
    bidDeadline: "2024-03-25",
    pickupLocation: "123 Main St, Worcester, MA",
    dropoffLocation: "Worcester Medical Center",
    schedule: {
      days: ["Mon", "Wed", "Fri"],
      arrivalTime: "09:00",
      departureTime: "14:00"
    },
    specialRequirements: {
      vehicleType: "Van",
      wheelchairNeeded: true,
      monitorRequired: false
    }
  },
  // Add more mock data as needed
]

export default function VendorDashboard() {
  const [selectedRequest, setSelectedRequest] = useState<TransportRequest | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [bidDialogOpen, setBidDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [bidFormData, setBidFormData] = useState<Partial<Bid>>({
    VendorCode: '',
    BidSendDate: new Date().toISOString().split('T')[0],
    OneWayTripCost: 0,
    RoundTripCost: 0,
    SharedRideCost: undefined,
    SharedRideWith: '',
    BidComments: ''
  })

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Add API call here
      toast.success("Bid submitted successfully")
      setBidDialogOpen(false)
    } catch (error) {
      toast.error("Failed to submit bid")
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
            <Tabs defaultValue="active" className="space-y-4">
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
                            <SelectItem value="SUBMITTED">Submitted</SelectItem>
                            <SelectItem value="AWARDED">Awarded</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
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
                        {MOCK_REQUESTS.map(request => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">
                              {request.clientName}
                              <div className="text-sm text-muted-foreground">
                                #{request.id}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(request.startDate).toLocaleDateString()} - 
                              {new Date(request.endDate).toLocaleDateString()}
                              <div className="text-sm text-muted-foreground">
                                Deadline: {new Date(request.bidDeadline).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              {request.schedule.days.join(', ')}
                              <div className="text-sm text-muted-foreground">
                                {request.schedule.arrivalTime} - {request.schedule.departureTime}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                request.status === 'AWARDED' ? 'default' :
                                request.status === 'REJECTED' ? 'destructive' : 'secondary'
                              }>
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
                                  Submit Bid
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Additional TabsContent components for "submitted" and "awarded" tabs */}
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
                  <Button type="submit">Submit Bid</Button>
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
                    <p className="text-sm">Days: {selectedRequest.schedule.days.join(', ')}</p>
                    <p className="text-sm">Time: {selectedRequest.schedule.arrivalTime} - {selectedRequest.schedule.departureTime}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Vehicle Type: {selectedRequest.specialRequirements.vehicleType}</li>
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
                    Submit Bid
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