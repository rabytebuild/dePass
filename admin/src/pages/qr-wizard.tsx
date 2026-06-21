import { useEffect, useState, type FormEvent } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import { QRCodeCanvas } from "qrcode.react"
import { QrCode, Download, Package, Sparkles } from "lucide-react"

interface Theme {
  id: string
  name: string
  description: string
  colors: [string, string]
}

interface Event {
  id: number
  name: string
}

interface PassType {
  id: number
  name: string
}

interface GenerateResult {
  message: string
  pass: { id: number; pass_uid: string; attendee_name: string | null }
  gpid: string
  qr_data: string
  qr_image: string
  theme: string
}

export default function QrWizardPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [passTypes, setPassTypes] = useState<PassType[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [activeTab, setActiveTab] = useState("single")
  const { toast } = useToast()

  const [singleForm, setSingleForm] = useState({
    event_id: "",
    pass_type_id: "",
    attendee_name: "",
    phone: "",
    theme: "classic",
  })

  const [bulkForm, setBulkForm] = useState({
    event_id: "",
    pass_type_id: "",
    count: 10,
    prefix: "GPX",
    theme: "classic",
  })

  useEffect(() => {
    Promise.all([
      api.get<{ data: Event[] }>("/events"),
      api.get<{ themes: Theme[] }>("/qr-wizard/themes"),
    ])
      .then(([evRes, thRes]) => {
        setEvents(evRes.data)
        setThemes(thRes.themes)
      })
      .catch((err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" })
      })
      .finally(() => setLoading(false))
  }, [])

  const loadPassTypes = (eventId: string) => {
    if (!eventId) { setPassTypes([]); return }
    api.get<{ data: PassType[] }>(`/events/${eventId}/pass-types`)
      .then((res) => setPassTypes(res.data))
      .catch(() => setPassTypes([]))
  }

  const handleEventChange = (value: string, form: "single" | "bulk") => {
    if (form === "single") {
      setSingleForm((f) => ({ ...f, event_id: value, pass_type_id: "" }))
    } else {
      setBulkForm((f) => ({ ...f, event_id: value, pass_type_id: "" }))
    }
    loadPassTypes(value)
  }

  const handleSingleGenerate = async (e: FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    setResult(null)
    try {
      const res = await api.post<GenerateResult>("/qr-wizard/generate", {
        event_id: Number(singleForm.event_id),
        pass_type_id: Number(singleForm.pass_type_id),
        attendee_name: singleForm.attendee_name || undefined,
        phone: singleForm.phone || undefined,
        theme: singleForm.theme,
      })
      setResult(res)
      toast({ title: "QR code generated", description: `GPID: ${res.gpid}`, variant: "success" })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setGenerating(false)
    }
  }

  const handleBulkGenerate = async (e: FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    setResult(null)
    try {
      const token = api.getToken()
      const base = import.meta.env.VITE_API_URL || "http://localhost:8000/api"
      const url = `${base}/qr-wizard/bulk-generate`
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          event_id: Number(bulkForm.event_id),
          pass_type_id: Number(bulkForm.pass_type_id),
          count: bulkForm.count,
          prefix: bulkForm.prefix || undefined,
          theme: bulkForm.theme,
        }),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || "Bulk generation failed")
      }
      const blob = await res.blob()
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `${bulkForm.prefix}_qrcodes.zip`
      a.click()
      URL.revokeObjectURL(a.href)
      toast({ title: "ZIP downloaded", description: `${bulkForm.count} QR codes generated`, variant: "success" })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bulk generation failed"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setGenerating(false)
    }
  }

  const downloadSingleQr = () => {
    if (!result) return
    const link = document.createElement("a")
    link.href = result.qr_image
    link.download = `${result.gpid}.png`
    link.click()
  }

  const themeCard = (t: Theme, selected: string, onSelect: (id: string) => void) => (
    <button
      key={t.id}
      type="button"
      onClick={() => onSelect(t.id)}
      className={`relative flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
        selected === t.id
          ? "border-primary bg-primary/5"
          : "border-muted hover:border-muted-foreground/30"
      }`}
    >
      <div className="flex gap-0.5">
        <div className="h-8 w-4 rounded-l" style={{ backgroundColor: t.colors[0] }} />
        <div className="h-8 w-4 rounded-r" style={{ backgroundColor: t.colors[1] }} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{t.name}</div>
        <div className="text-xs text-muted-foreground">{t.description}</div>
      </div>
      {selected === t.id && (
        <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
          ✓
        </Badge>
      )}
    </button>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <QrCode className="h-6 w-6" />
        <h1 className="text-3xl font-bold">QR Wizard</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="single">Single QR</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Generation</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Generate Single QR</CardTitle>
                <CardDescription>Create a single QR-coded pass with attendee details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSingleGenerate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="single-event">Event</Label>
                    <Select
                      value={singleForm.event_id}
                      onValueChange={(v) => handleEventChange(v, "single")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((ev) => (
                          <SelectItem key={ev.id} value={String(ev.id)}>{ev.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="single-pass-type">Pass Type</Label>
                    <Select
                      value={singleForm.pass_type_id}
                      onValueChange={(v) => setSingleForm((f) => ({ ...f, pass_type_id: v }))}
                      disabled={!singleForm.event_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={singleForm.event_id ? "Select pass type" : "Select event first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {passTypes.map((pt) => (
                          <SelectItem key={pt.id} value={String(pt.id)}>{pt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="single-name">Attendee Name</Label>
                    <Input
                      id="single-name"
                      value={singleForm.attendee_name}
                      onChange={(e) => setSingleForm((f) => ({ ...f, attendee_name: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="single-phone">Phone (optional)</Label>
                    <Input
                      id="single-phone"
                      value={singleForm.phone}
                      onChange={(e) => setSingleForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="+234800000000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {themes.map((t) => themeCard(t, singleForm.theme, (id) => setSingleForm((f) => ({ ...f, theme: id }))))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={generating || !singleForm.event_id || !singleForm.pass_type_id}>
                    {generating ? (
                      <>Generating...</>
                    ) : (
                      <><Sparkles className="h-4 w-4 mr-2" /> Generate QR</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Preview</CardTitle>
                <CardDescription>{result ? `GPID: ${result.gpid}` : "Generate a QR code to preview"}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                {result ? (
                  <>
                    <div className="rounded-lg border bg-white p-4">
                      <img src={result.qr_image} alt={`QR for ${result.gpid}`} className="h-48 w-48" />
                    </div>
                    <div className="w-full space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">GPID</span><span className="font-mono">{result.gpid}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{result.pass.attendee_name || "-"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Theme</span><span className="capitalize">{result.theme}</span></div>
                    </div>
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" className="flex-1" onClick={downloadSingleQr}>
                        <Download className="h-4 w-4 mr-2" /> Download PNG
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <QrCode className="h-16 w-16 mb-4 opacity-30" />
                    <p>Fill in the form and generate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bulk QR Generation</CardTitle>
                <CardDescription>Generate multiple QR-coded passes and download as ZIP</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBulkGenerate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-event">Event</Label>
                    <Select
                      value={bulkForm.event_id}
                      onValueChange={(v) => handleEventChange(v, "bulk")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((ev) => (
                          <SelectItem key={ev.id} value={String(ev.id)}>{ev.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-pass-type">Pass Type</Label>
                    <Select
                      value={bulkForm.pass_type_id}
                      onValueChange={(v) => setBulkForm((f) => ({ ...f, pass_type_id: v }))}
                      disabled={!bulkForm.event_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={bulkForm.event_id ? "Select pass type" : "Select event first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {passTypes.map((pt) => (
                          <SelectItem key={pt.id} value={String(pt.id)}>{pt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-count">Number of QR Codes</Label>
                    <Input
                      id="bulk-count"
                      type="number"
                      min={1}
                      max={500}
                      value={bulkForm.count}
                      onChange={(e) => setBulkForm((f) => ({ ...f, count: Number(e.target.value) }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-prefix">GPID Prefix</Label>
                    <Input
                      id="bulk-prefix"
                      value={bulkForm.prefix}
                      onChange={(e) => setBulkForm((f) => ({ ...f, prefix: e.target.value }))}
                      placeholder="GPX"
                    />
                    <p className="text-xs text-muted-foreground">GPIDs will be generated as {bulkForm.prefix}-000001, {bulkForm.prefix}-000002, etc.</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {themes.map((t) => themeCard(t, bulkForm.theme, (id) => setBulkForm((f) => ({ ...f, theme: id }))))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={generating || !bulkForm.event_id || !bulkForm.pass_type_id}>
                    {generating ? (
                      <>Generating...</>
                    ) : (
                      <><Package className="h-4 w-4 mr-2" /> Generate & Download ZIP</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bulk Output</CardTitle>
                <CardDescription>The ZIP will contain individual PNG files + manifest.json</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-center">
                  Configure and generate to download<br />
                  a ZIP archive of all QR codes
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
