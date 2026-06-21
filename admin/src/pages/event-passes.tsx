import { useEffect, useState, type FormEvent } from "react"
import { useParams, Link } from "react-router-dom"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import { ArrowLeft, Plus, Download, FileSpreadsheet } from "lucide-react"

interface Pass {
  id: number
  code: string
  pass_uid?: string
  status: string
  holder_name?: string
  attendee_name?: string
  created_at: string
}

interface Event {
  id: number
  name: string
}

interface PassType {
  id: number
  name: string
}

export default function EventPassesPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [passes, setPasses] = useState<Pass[]>([])
  const [passTypes, setPassTypes] = useState<PassType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()

  const [singleForm, setSingleForm] = useState({
    pass_type_id: "",
    attendee_name: "",
    company: "",
  })

  const [bulkForm, setBulkForm] = useState({
    count: 10,
    prefix: "",
    pass_type_id: "",
  })

  const loadData = () => {
    setLoading(true)
    Promise.all([
      api.get<{ data: Event }>(`/events/${id}`),
      api.get<{ data: Pass[] }>(`/events/${id}/passes`),
      api.get<{ data: PassType[] }>(`/events/${id}/pass-types`),
    ])
      .then(([ev, ps, pts]) => {
        setEvent(ev.data)
        setPasses(ps.data)
        setPassTypes(pts.data)
        if (pts.data.length > 0 && !singleForm.pass_type_id) {
          setSingleForm((f) => ({ ...f, pass_type_id: String(pts.data[0].id) }))
          setBulkForm((f) => ({ ...f, pass_type_id: String(pts.data[0].id) }))
        }
      })
      .catch((err) => {
        setError(err.message)
        toast({ title: "Error", description: err.message, variant: "destructive" })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post(`/events/${id}/passes`, {
        pass_type_id: Number(singleForm.pass_type_id),
        attendee_name: singleForm.attendee_name,
        company: singleForm.company || undefined,
      })
      toast({ title: "Pass created", variant: "success" })
      setCreateOpen(false)
      setSingleForm({ ...singleForm, attendee_name: "", company: "" })
      loadData()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Creation failed"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setCreating(false)
    }
  }

  const handleBulkGenerate = async (e: FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    try {
      await api.post(`/events/${id}/passes/bulk-generate`, {
        count: bulkForm.count,
        prefix: bulkForm.prefix,
        pass_type_id: Number(bulkForm.pass_type_id),
      })
      toast({ title: "Passes generated", description: `${bulkForm.count} passes created`, variant: "success" })
      setBulkOpen(false)
      loadData()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadManifest = async () => {
    try {
      const token = api.getToken()
      const base = import.meta.env.VITE_API_URL || "http://localhost:8000/api"
      const url = `${base}/events/${id}/print-manifest`
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : {},
      })
      if (!res.ok) throw new Error("Download failed")
      const blob = await res.blob()
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `manifest-event-${id}.pdf`
      a.click()
      URL.revokeObjectURL(a.href)
      toast({ title: "Manifest downloaded", variant: "success" })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Download failed"
      toast({ title: "Error", description: msg, variant: "destructive" })
    }
  }

  const getPassCode = (pass: Pass) => pass.code || pass.pass_uid || "-"
  const getHolderName = (pass: Pass) => pass.holder_name || pass.attendee_name || "-"

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled><ArrowLeft className="h-4 w-4" /></Button>
          <Skeleton className="h-8 w-64" />
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/events">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {event?.name || `Event #${id}`} - Passes
          </h1>
        </div>
        <Button variant="outline" onClick={handleDownloadManifest}>
          <Download className="h-4 w-4 mr-2" />
          Manifest
        </Button>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary">
              <Plus className="h-4 w-4 mr-2" />
              Create Pass
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Pass</DialogTitle>
                <DialogDescription>Create a single pass for an attendee</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-pass-type">Pass Type</Label>
                  <Select
                    value={singleForm.pass_type_id}
                    onValueChange={(v) => setSingleForm({ ...singleForm, pass_type_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {passTypes.map((pt) => (
                        <SelectItem key={pt.id} value={String(pt.id)}>
                          {pt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendee_name">Attendee Name</Label>
                  <Input
                    id="attendee_name"
                    value={singleForm.attendee_name}
                    onChange={(e) => setSingleForm({ ...singleForm, attendee_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company (optional)</Label>
                  <Input
                    id="company"
                    value={singleForm.company}
                    onChange={(e) => setSingleForm({ ...singleForm, company: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
          <DialogTrigger asChild>
            <Button>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Bulk Generate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleBulkGenerate}>
              <DialogHeader>
                <DialogTitle>Bulk Generate Passes</DialogTitle>
                <DialogDescription>Generate multiple passes at once</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk-pass-type">Pass Type</Label>
                  <Select
                    value={bulkForm.pass_type_id}
                    onValueChange={(v) => setBulkForm({ ...bulkForm, pass_type_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {passTypes.map((pt) => (
                        <SelectItem key={pt.id} value={String(pt.id)}>
                          {pt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="count">Number of passes</Label>
                  <Input
                    id="count"
                    type="number"
                    min={1}
                    max={1000}
                    value={bulkForm.count}
                    onChange={(e) => setBulkForm({ ...bulkForm, count: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prefix">Code prefix (optional)</Label>
                  <Input
                    id="prefix"
                    value={bulkForm.prefix}
                    onChange={(e) => setBulkForm({ ...bulkForm, prefix: e.target.value })}
                    placeholder="e.g. VIP-"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={generating}>
                  {generating ? "Generating..." : "Generate"}
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
              <TableHead>Code</TableHead>
              <TableHead>Holder</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passes.map((pass) => (
              <TableRow key={pass.id}>
                <TableCell className="font-mono text-sm">{getPassCode(pass)}</TableCell>
                <TableCell>{getHolderName(pass)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      pass.status === "active"
                        ? "success"
                        : pass.status === "used"
                          ? "warning"
                          : "secondary"
                    }
                  >
                    {pass.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(pass.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {passes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No passes found for this event
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
