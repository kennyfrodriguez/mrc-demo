'use client'

import { Users, CheckCircle, FileText, DollarSign, Clock, Percent } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface StatsCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
}

function StatsCard({ icon, title, value }: StatsCardProps) {
  return (
    <Card className="p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors">
      <div className="p-2 bg-primary/10 rounded-lg text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </Card>
  )
}

export { StatsCard } 