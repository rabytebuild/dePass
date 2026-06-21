import { useEffect, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Plus, Pencil, Trash2, Ticket, Lock, Unlock, ArrowUpDown } from "lucide-react"

interface Event {
  id: number
  name: string
  description: string
  date: string
  location: string
  is_locked: boolean
  passes_count?: number
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Event | null>(null)
  const [form, setForm] = useState({ name: "", description: "", date: "", location: "" })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const loadEvents = () => {
    setLoading(true)
    api.get<{ data: Event[] }>("/events")
      .then((res) => setEvents(res.data))
      .catch((err) => {
        setError(err.message)
        toast({ title: "Error", description: err.message, variant: "destructive" })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadEvents() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: "", description: "", date: "", location: "" })
    setDialogOpen(true)
  }

  const openEdit = (event: Event) => {
    setEditing(event)
    setForm({
      name: event.name,
      description: event.description || "",
      date: event.date?.split("T")[0] || "",
      location: event.location || "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/events/${editing.id}`, form)
        toast({ title: "Event updated", variant: "success" })
      } else {
        await api.post("/events", form)
        toast({ title: "Event created", variant: "success" })
      }
      setDialogOpen(false)
      loadEvents()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return
    try {
      await api.delete(`/events/${id}`)
      toast({ title: "Event deleted", variant: "success" })
      loadEvents()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed"
      toast({ title: "Error", description: msg, variant: "destructive" })
    }
  }

  const toggleLock = async (event: Event) => {
    try {
      await api.put(`/events/${event.id}/lock`, {})
      toast({ title: event.is_locked ? "Event unlocked" : "Event locked", variant: "success" })
      loadEvents()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Toggle failed"
      toast({ title: "Error", description: msg, variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Events</h1>
          <Button disabled><Plus className="h-4 w-4 mr-2" />Create Event</Button>
        </div>
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Event" : "Create Event"}</DialogTitle>
                <DialogDescription>
                  {editing ? "Update event details" : "Add a new event"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Passes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.name}</TableCell>
                <TableCell>{event.date ? new Date(event.date).toLocaleDateString() : "-"}</TableCell>
                <TableCell>{event.location || "-"}</TableCell>
                <TableCell>
                  <Badge variant={event.is_locked ? "destructive" : "success"}>
                    {event.is_locked ? "Locked" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{event.passes_count ?? 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/events/${event.id}/passes`}>
                        <Ticket className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => toggleLock(event)}>
                      {event.is_locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(event)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {events.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No events found. Create your first event to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
