'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home, RefreshCw, User, Menu } from "lucide-react"
import logo from "@/public/mart.png"
import { useSidebar } from '@/components/ui/sidebar'

export function Header() {
  const { toggleSidebar } = useSidebar()
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <header className="fixed top-0 left-0 right-0 border-b bg-background md:ml-64 z-50">
      <div className="container h-16 px-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/">
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Button>
            </Link>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh}
              className="hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>

          <Button 
            variant="ghost" 
            className="flex items-center gap-3 px-4 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <User className="h-5 w-5" />
            <span className="text-sm font-medium">User Example Name</span>
          </Button>
        </div>
      </div>
    </header>
  )
} 