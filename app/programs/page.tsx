'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, CheckCircle2, Users, DollarSign, Filter, Search, FileText, Briefcase } from "lucide-react"
import { MOCK_TRIPS, MOCK_VENDORS, MOCK_BIDS, Bid } from '@/lib/shared-data'
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/Header"
import { AppSidebar } from "@/components/Sidebar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { SidebarProvider } from "@/components/ui/sidebar"
import { toast, Toaster } from "sonner"

interface MRCTransForm {
  id: string
  ClientFName: string
  ClientLName: string
  StartDate: string
  FormStatus: string
}

interface Trip extends MRCTransForm {
  memberName: string
  tripDate: string
  status: 'PENDING' | 'AWARDED' | 'EXPIRED'
  bids: Bid[]
}

export default function MemberTripsPage() {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [bidDialogOpen, setBidDialogOpen] = useState(false)
  const [localTrips, setLocalTrips] = useState<Trip[]>([])

  const getVendorName = (vendorId: string) => {
    return MOCK_VENDORS.find(v => v.id === vendorId)?.name || 'Unknown Vendor'
  }

  // Initialize trips once when component mounts
  useEffect(() => {
    const initialTrips: Trip[] = MOCK_TRIPS.map(trip => ({
      ...trip,
      id: trip.MRCTransFormID,
      memberName: `${trip.ClientFName} ${trip.ClientLName}`,
      tripDate: trip.StartDate,
      status: trip.FormStatus as 'PENDING' | 'AWARDED' | 'EXPIRED',
      bids: MOCK_BIDS[trip.MRCTransFormID] || []
    }))
    setLocalTrips(initialTrips)
  }, [])

  const handleBidAction = (tripId: string, vendorId: string, action: 'APPROVED' | 'REJECTED') => {
    setLocalTrips(prevTrips => {
      const updatedTrips = prevTrips.map(trip => {
        if (trip.id !== tripId) return trip

        const updatedBids = trip.bids.map(bid => ({
          ...bid,
          status: bid.vendorId === vendorId ? action : 
                 action === 'APPROVED' ? 'REJECTED' : bid.status
        }))

        const updatedTrip = {
          ...trip,
          status: action === 'APPROVED' ? 'AWARDED' : trip.status,
          bids: updatedBids
        }

        // Update selected trip if this is the one being modified
        if (selectedTrip?.id === tripId) {
          setSelectedTrip(updatedTrip)
        }

        return updatedTrip
      })

      // Show toast notification
      if (action === 'APPROVED') {
        toast.success(`Trip awarded to ${getVendorName(vendorId)}`)
      } else {
        toast.info(`Bid from ${getVendorName(vendorId)} rejected`)
      }

      return updatedTrips
    })
  }

  // Filter and sort trips using localTrips instead of trips
  const filteredTrips = localTrips
    .filter(trip => 
      trip.memberName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusFilter === "all" || trip.status === statusFilter)
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.memberName.localeCompare(b.memberName)
      if (sortBy === "status") return a.status.localeCompare(b.status)
      return new Date(b.tripDate).getTime() - new Date(a.tripDate).getTime()
    })

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex flex-1 pt-16">
          <AppSidebar />
          <div className="p-8 flex flex-col flex-1 md:ml-64">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white mb-6 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="h-7 w-7 text-blue-300" />
                <h1 className="text-2xl md:text-3xl font-bold">Member Trip Management</h1>
              </div>
              <p className="text-gray-300">
                Manage transportation requests, track vendor bids, and coordinate services all in one place.
              </p>
            </div>
            
            {/* Tabs Section */}
            <Tabs defaultValue="active" className="mb-6">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="active">Active Trips</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              {/* Active Trips Tab */}
              <TabsContent value="active">
                <Card>
                  <CardHeader className="border-b bg-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <CardTitle>Active Transportation Requests</CardTitle>
                      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Input 
                            placeholder="Search members..." 
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Select onValueChange={setStatusFilter} defaultValue="all">
                            <SelectTrigger className="w-full md:w-36">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="AWARDED">Awarded</SelectItem>
                              <SelectItem value="EXPIRED">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select onValueChange={setSortBy} defaultValue="date">
                            <SelectTrigger className="w-full md:w-36">
                              <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="name">Member Name</SelectItem>
                              <SelectItem value="status">Status</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="w-[250px]">Member</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTrips.length > 0 ? (
                            filteredTrips.map(trip => (
                              <TableRow 
                                key={trip.id} 
                                className="hover:bg-gray-50"
                              >
                                <TableCell className="font-medium">{trip.memberName}</TableCell>
                                <TableCell>{new Date(trip.tripDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Badge variant={
                                    trip.status === 'AWARDED' ? 'default' :
                                    trip.status === 'EXPIRED' ? 'destructive' : 'secondary'
                                  }>
                                    {trip.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedTrip(trip)
                                      setBidDialogOpen(true)
                                    }}
                                  >
                                    View Bids
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="h-24 text-center">
                                <div className="flex flex-col items-center justify-center text-gray-500">
                                  <Filter className="h-8 w-8 mb-2 opacity-40" />
                                  <p>No trips match your filters</p>
                                  <Button 
                                    variant="link" 
                                    onClick={() => {
                                      setSearchQuery("")
                                      setStatusFilter("all")
                                    }}
                                  >
                                    Reset filters
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Completed Trips Tab */}
              <TabsContent value="completed">
                <Card>
                  <CardHeader>
                    <CardTitle>Completed Trips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                      <CheckCircle2 className="h-12 w-12 mb-4 text-green-500 opacity-80" />
                      <h3 className="text-xl font-medium mb-2">No completed trips yet</h3>
                      <p>Completed trips will appear here once they're finalized</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Analytics Tab */}
              <TabsContent value="analytics">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-gray-800">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span>Member Statistics</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Total Members</span>
                          <span className="font-semibold">{localTrips.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Active Requests</span>
                          <span className="font-semibold">{localTrips.filter(t => t.status === 'PENDING').length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Awarded Trips</span>
                          <span className="font-semibold">{localTrips.filter(t => t.status === 'AWARDED').length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-gray-800">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span>Financial Overview</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Average Bid</span>
                          <span className="font-semibold">$1,245.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Monthly Volume</span>
                          <span className="font-semibold">$45,250.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">YTD Savings</span>
                          <span className="font-semibold text-green-600">$12,450.00</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-gray-800">
                        <Clock className="h-5 w-5 text-amber-500" />
                        <span>Timeline Metrics</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Avg. Response Time: </span>
                          <span className="font-semibold">(1.2 days)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">On-time Rate: </span>
                          <span className="font-semibold">94%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Vendor Compliance</span>
                          <span className="font-semibold">98%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Bid Details Dialog */}
        {selectedTrip && (
          <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
            <DialogContent className="min-w-[80vw] w-[80vw] h-[800px] max-h-[90vh] overflow-y-auto p-8">
              <DialogHeader className="pb-6 border-b">
                <DialogTitle className="text-2xl font-semibold">Bids for {selectedTrip.memberName}</DialogTitle>
                <div className="flex items-center gap-8 mt-6 text-base text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{new Date(selectedTrip.tripDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>{selectedTrip.bids.length || 0} bids</span>
                  </div>
                  <Badge variant={
                    selectedTrip.status === 'AWARDED' ? 'default' :
                    selectedTrip.status === 'EXPIRED' ? 'destructive' : 'secondary'
                  } className="ml-auto text-base px-4 py-1">
                    {selectedTrip.status}
                  </Badge>
                </div>
              </DialogHeader>
              
              <div className="py-6">
                {selectedTrip.bids.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[400px] py-5 text-base">Vendor</TableHead>
                        <TableHead className="w-[200px] py-5 text-base">Amount</TableHead>
                        <TableHead className="w-[200px] py-5 text-base">Status</TableHead>
                        <TableHead className="w-[200px] py-5 text-base">Submitted</TableHead>
                        <TableHead className="text-right py-5 text-base w-[300px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTrip.bids.map(bid => (
                        <TableRow key={bid.vendorId} className="hover:bg-muted/50">
                          <TableCell className="font-medium text-base py-4">{getVendorName(bid.vendorId)}</TableCell>
                          <TableCell className="font-medium text-base py-4">${bid.amount}</TableCell>
                          <TableCell className="py-4">
                            <Badge variant={
                              bid.status === 'APPROVED' ? 'default' :
                              bid.status === 'REJECTED' ? 'destructive' : 'secondary'
                            } className="text-base px-3 py-0.5">
                              {bid.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-base py-4">
                            {new Date(bid.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right py-4">
                            {bid.status === 'PENDING' && selectedTrip.status === 'PENDING' ? (
                              <div className="flex justify-end gap-4">
                                <Button
                                  className="text-base h-10 px-8"
                                  variant="default"
                                  onClick={() => handleBidAction(selectedTrip.id, bid.vendorId, 'APPROVED')}
                                >
                                  Accept
                                </Button>
                                <Button
                                  className="text-base h-10 px-8 text-destructive hover:bg-destructive/10"
                                  variant="outline"
                                  onClick={() => handleBidAction(selectedTrip.id, bid.vendorId, 'REJECTED')}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground pr-2">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-16 text-muted-foreground bg-muted/50 rounded-lg text-lg">
                    No bids received yet
                  </div>
                )}
              </div>

              <DialogFooter className="border-t pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setBidDialogOpen(false)}
                  className="text-base h-10 px-8"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Toaster />
    </SidebarProvider>
  )
} 