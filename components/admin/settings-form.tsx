"use client"

import { useState } from "react"
import { Loader2, Check, AlertCircle } from "lucide-react"
import {
  MOCK_MODERATION_SETTINGS,
  type ModerationLevel,
} from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const LEVEL_OPTIONS: { value: ModerationLevel; label: string }[] = [
  { value: "lenient", label: "Lenient" },
  { value: "standard", label: "Standard" },
  { value: "strict", label: "Strict" },
]

export function SettingsForm() {
  const [level, setLevel] = useState<ModerationLevel>(
    MOCK_MODERATION_SETTINGS.level,
  )
  const [profanityFilter, setProfanityFilter] = useState(
    MOCK_MODERATION_SETTINGS.profanityFilter,
  )
  const [enforceTheme, setEnforceTheme] = useState(
    MOCK_MODERATION_SETTINGS.enforceTheme,
  )
  const [threshold, setThreshold] = useState(
    Math.round(MOCK_MODERATION_SETTINGS.confidenceThreshold * 100),
  )

  const [orgName, setOrgName] = useState("Last 2 Lines")
  const [contactEmail, setContactEmail] = useState("hello@last2lines.org")

  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)
  const thresholdValid = threshold >= 0 && threshold <= 100
  const isValid = orgName.trim().length > 0 && emailValid && thresholdValid

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!isValid) {
      setError("Please fix the highlighted fields before saving.")
      return
    }
    setDone(false)
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      setDone(true)
      window.setTimeout(() => setDone(false), 2000)
    }, 900)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error ? (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      <Section
        title="Organization"
        description="Details shown across the public campaign pages."
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="org-name">Organization name</Label>
          <Input
            id="org-name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            aria-invalid={orgName.trim().length === 0}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-email">Contact email</Label>
          <Input
            id="contact-email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            aria-invalid={!emailValid}
            aria-describedby={!emailValid ? "email-error" : undefined}
          />
          {!emailValid ? (
            <p
              id="email-error"
              role="alert"
              aria-live="polite"
              className="text-sm text-destructive"
            >
              Enter a valid email address.
            </p>
          ) : null}
        </div>
      </Section>

      <Section
        title="Default AI moderation"
        description="The baseline moderation behavior applied to new campaigns."
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="default-level">Default level</Label>
          <Select
            value={level}
            onValueChange={(v) => setLevel(v as ModerationLevel)}
          >
            <SelectTrigger id="default-level" className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ToggleRow
          id="profanity"
          label="Profanity filter"
          description="Automatically reject submissions containing explicit language."
          checked={profanityFilter}
          onChange={setProfanityFilter}
        />
        <ToggleRow
          id="enforce-theme"
          label="Enforce campaign theme"
          description="Require submissions to stay on the campaign's subject."
          checked={enforceTheme}
          onChange={setEnforceTheme}
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="threshold">Auto-approval confidence (%)</Label>
          <Input
            id="threshold"
            type="number"
            min={0}
            max={100}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            aria-invalid={!thresholdValid}
            className="w-full sm:w-40"
          />
          <p className="text-sm text-muted-foreground text-pretty">
            Couplets scoring at or above this confidence are auto-approved;
            anything lower is sent to the manual queue.
          </p>
        </div>
      </Section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="submit" disabled={submitting || !isValid}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : done ? (
            <>
              <Check className="size-4" aria-hidden="true" />
              Saved
            </>
          ) : (
            "Save settings"
          )}
        </Button>
      </div>
    </form>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card size="default">
      <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-lg font-semibold tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="text-sm text-muted-foreground text-pretty">
              {description}
            </p>
          ) : null}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id} className="cursor-pointer">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground text-pretty">
          {description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={(v) => onChange(Boolean(v))}
      />
    </div>
  )
}
