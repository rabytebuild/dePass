import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Ticket, Smartphone, Users, Activity, AlertTriangle, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DashboardData {
  total_events: number
  total_passes: number
  total_devices: number
  total_users: number
  pending_devices?: number
  recent_scans?: number
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    api.get<DashboardData>("/stats")
      .then((res) => setData(res))
      .catch((err) => {
        api.get<DashboardData>("/admin/dashboard")
          .then(setData)
          .catch((e) => setError(e.message))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = [
    { label: "Total Events", value: data?.total_events ?? 0, icon: Calendar },
    { label: "Total Passes", value: data?.total_passes ?? 0, icon: Ticket },
    { label: "Active Devices", value: data?.total_devices ?? 0, icon: Smartphone },
    { label: "Total Users", value: data?.total_users ?? 0, icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          System Online
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pending Approvals</span>
                  <Badge variant="warning">{data.pending_devices ?? 0}</Badge>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Dashboard auto-refreshes on navigation
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Create events to manage passes</p>
              <p>Approve pending device registrations</p>
              <p>Monitor scan activity in real-time</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
