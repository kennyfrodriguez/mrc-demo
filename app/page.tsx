import { Header } from "@/components/Header"
import { AppSidebar } from "@/components/Sidebar"
import { DashboardCard } from "@/components/DashboardCard"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <AppSidebar />
        <div className="p-8 flex flex-col items-center justify-center flex-1 md:ml-64">
          <main className="w-full max-w-5xl">
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold mb-3 text-primary">Welcome</h1>
              <p className="text-muted-foreground text-lg">Please select a portal/screen to get started.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <DashboardCard
                href="/vendor"
                title="Vendor Portal"
                description="The vendor portal allows setting bids, selected trips to review, and organizing data."
              />

              <DashboardCard
                href="/programs"
                title="Programs Management"
                description="Overview our current bids, engage with vendor data, and adhere to management."
              />

              <DashboardCard
                href="/other"
                title="HST Management"
                description="Access tools for member management, processing, and help resources."
              />
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground">
                Select a portal above to get started
              </p>
            </div>
          </main> 
        </div>
      </div>
    </div>
  )
}
