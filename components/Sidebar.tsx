'use client'

import { Home, Settings, Users, FileText, HelpCircle, Percent, DollarSign, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useSidebar } from '@/components/ui/sidebar'
import Image from 'next/image'
import logo from '@/public/mart.png'
import {
  Sidebar,
  SidebarContent as UISidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { StatsCard } from '@/components/StatsCard'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Coming Soon Dialog Component
interface ComingSoonDialogProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
}

function ComingSoonDialog({ isOpen, onClose }: ComingSoonDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Coming Soon!</DialogTitle>
          <DialogDescription>
            Development will be in correspondance of user review.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

function SidebarContents() {
  const { open } = useSidebar()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleComingSoonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setDialogOpen(true)
  }

  return (
    <Sidebar>
      <UISidebarContent>
        <SidebarHeader>
          <div className="flex items-center justify-center p-4 w-[150px] mx-auto">
            <Image 
              src={logo} 
              alt="Logo" 
              width={75} 
              height={25} 
              className="object-contain w-auto h-auto"
              priority
            />
          </div>
        </SidebarHeader>
        
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleComingSoonClick}
            >
              <Users className="mr-2 h-4 w-4" />
              View Account
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleComingSoonClick}
            >
              <FileText className="mr-2 h-4 w-4" />
              Personal Analytics
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleComingSoonClick}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleComingSoonClick}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Help
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarFooter className="border-t p-4">
          <div className="grid grid-cols-2 gap-4">
            <StatsCard icon={<Users className="h-5 w-5" />} title="Active Vendors" value={15} />
            <StatsCard icon={<Percent className="h-5 w-5" />} title="Success Rate" value="89%" />
            <StatsCard icon={<FileText className="h-5 w-5" />} title="Active Programs" value={2} />
            <StatsCard icon={<DollarSign className="h-5 w-5" />} title="Monthly Volume" value="$45.2K" />
            <StatsCard icon={<Users className="h-5 w-5" />} title="Total Clients" value={225} />
            <StatsCard icon={<Clock className="h-5 w-5" />} title="On-Time Rate" value="95%" />
          </div>
        </SidebarFooter>
      </UISidebarContent>
      
      {/* Coming Soon Dialog */}
      <ComingSoonDialog 
        isOpen={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
      />
    </Sidebar>
  )
}

export function AppSidebar() {
  return <SidebarContents />
} 