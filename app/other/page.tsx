'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/Header"
import { AppSidebar } from "@/components/Sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Users, ScanLine, HelpCircle } from "lucide-react"
import Link from "next/link"
import ForumPage from '@/components/ForumPage'

function ToolCard({ 
  icon: Icon, 
  title, 
  description, 
  href 
}: { 
  icon: any
  title: string
  description: string
  href: string 
}) {
  return (
    <Link href={href}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <p className="text-muted-foreground mt-1">
                {description}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}

export default function ResourcesPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex flex-1 pt-16">
          <AppSidebar />
          <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto md:ml-64">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white mb-6 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <HelpCircle className="h-7 w-7 text-blue-300" />
                <h1 className="text-2xl md:text-3xl font-bold">HST Management</h1>
              </div>
              <p className="text-gray-300">
                Access tools and resources to help manage members and processes
              </p>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ToolCard
                icon={Users}
                title="View Members"
                description="Access and manage member information and profiles"
                href="/tools/submissions"
              />
              
              <ToolCard
                icon={ScanLine}
                title="Process Member"
                description="Process and update member information and status"
                href="/tools/scanner"
              />
              
              <ToolCard
                icon={HelpCircle}
                title="Help Needed?"
                description="Access support resources and documentation"
                href="/forum"
              />
            </div>

            {/* Quick Tips Section */}
            <div className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Quick Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Use the View Members tool to quickly search and filter member records
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Process Member helps you update information and manage member status
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Access the Help section for detailed guides and support resources
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
} 