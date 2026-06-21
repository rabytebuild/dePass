import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import { Save, Settings } from "lucide-react"

interface Configuration {
  id: number
  key: string
  value: string
  type: string
  description: string
}

export default function ConfigPage() {
  const [configs, setConfigs] = useState<Configuration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const loadConfigs = () => {
    setLoading(true)
    api.get<{ data: Configuration[] }>("/configurations")
      .then((res) => {
        setConfigs(res.data)
        const vals: Record<string, string> = {}
        res.data.forEach((c) => { vals[c.key] = c.value })
        setValues(vals)
      })
      .catch((err) => {
        setError(err.message)
        toast({ title: "Error", description: err.message, variant: "destructive" })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadConfigs() }, [])

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      for (const config of configs) {
        if (values[config.key] !== config.value) {
          await api.put(`/configurations/${config.id}`, { value: values[config.key] })
        }
      }
      toast({ title: "Configuration saved", variant: "success" })
      loadConfigs()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const isFeatureFlag = (config: Configuration) =>
    config.value === "true" || config.value === "false" || config.type === "boolean"

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Configuration</h1>
          <Button disabled><Save className="h-4 w-4 mr-2" />Save Changes</Button>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Configuration</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-4">
        {configs.map((config) => (
          <Card key={config.id}>
            <CardHeader>
              <CardTitle className="text-base font-mono text-sm">{config.key}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {isFeatureFlag(config) ? (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={values[config.key] === "true"}
                    onCheckedChange={(checked) =>
                      setValues({ ...values, [config.key]: checked ? "true" : "false" })
                    }
                  />
                  <span className="text-sm">
                    {values[config.key] === "true" ? "Enabled" : "Disabled"}
                  </span>
                </div>
              ) : (
                <Input
                  value={values[config.key] || ""}
                  onChange={(e) =>
                    setValues({ ...values, [config.key]: e.target.value })
                  }
                />
              )}
            </CardContent>
          </Card>
        ))}
        {configs.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No configurations found</p>
        )}
      </div>
    </div>
  )
}
