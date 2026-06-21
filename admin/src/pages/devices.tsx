import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import { Check, X, Smartphone } from "lucide-react"

interface Device {
  id: number
  name: string
  uuid?: string
  device_id?: string
  platform: string
  status?: string
  is_approved?: boolean
  last_active_at: string
  created_at: string
  user?: { id: number; name: string; username: string }
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const loadDevices = () => {
    setLoading(true)
    api.get<{ data: Device[] }>("/devices")
      .then((res) => setDevices(res.data))
      .catch((err) => {
        setError(err.message)
        toast({ title: "Error", description: err.message, variant: "destructive" })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadDevices() }, [])

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/devices/${id}/approve`)
      toast({ title: "Device approved", variant: "success" })
      loadDevices()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Approve failed"
      toast({ title: "Error", description: msg, variant: "destructive" })
    }
  }

  const handleRevoke = async (id: number) => {
    try {
      await api.post(`/devices/${id}/revoke`)
      toast({ title: "Device revoked", variant: "default" })
      loadDevices()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Revoke failed"
      toast({ title: "Error", description: msg, variant: "destructive" })
    }
  }

  const isApproved = (device: Device) => {
    if (device.status !== undefined) return device.status === "approved"
    return device.is_approved === true
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Devices</h1>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Smartphone className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Devices</h1>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Identifier</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device.id}>
                <TableCell className="font-medium">{device.name || "Unnamed Device"}</TableCell>
                <TableCell className="font-mono text-xs max-w-[120px] truncate">
                  {device.uuid || device.device_id || "-"}
                </TableCell>
                <TableCell>{device.platform || "Android"}</TableCell>
                <TableCell className="text-sm">
                  {device.user?.username || "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={isApproved(device) ? "success" : "warning"}>
                    {isApproved(device) ? "Approved" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {device.last_active_at
                    ? new Date(device.last_active_at).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {isApproved(device) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevoke(device.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Revoke
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(device.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {devices.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No devices registered
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
