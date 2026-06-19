"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Trash2,
  Loader2,
  Check,
  AlertCircle,
  Calendar,
} from "lucide-react"
import {
  type Campaign,
  type CampaignStatus,
  type ModerationLevel,
} from "@/lib/mock-data"
import { createCampaign, updateCampaign } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUpload } from "@/components/image-upload"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS: { value: CampaignStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
]

const LEVEL_OPTIONS: { value: ModerationLevel; label: string; hint: string }[] =
  [
    { value: "lenient", label: "Lenient", hint: "Only blocks clear abuse." },
    {
      value: "standard",
      label: "Standard",
      hint: "Balances openness and on-theme quality.",
    },
    {
      value: "strict",
      label: "Strict",
      hint: "Enforces tight theme relevance.",
    },
  ]

interface SeedCouplet {
  id: string
  lineOne: string
  lineTwo: string
  author: string
}

export function CampaignForm({ campaign, seedCouplets }: { campaign?: Campaign; seedCouplets?: { lineOne: string; lineTwo: string; author: string }[] }) {
  const router = useRouter()
  const isEdit = Boolean(campaign)

  const [title, setTitle] = useState(campaign?.title ?? "")
  const [tagline, setTagline] = useState(campaign?.tagline ?? "")
  const [description, setDescription] = useState(campaign?.description ?? "")
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(
    campaign?.backgroundImageUrl ?? "",
  )
  const [videoLink, setVideoLink] = useState(campaign?.videoLink ?? "")
  const [donationLink, setDonationLink] = useState(
    campaign?.donationLink ?? "",
  )
  const [startDate, setStartDate] = useState(
    campaign?.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : "",
  )
  const [closeDate, setCloseDate] = useState(
    campaign?.closeDate ? new Date(campaign.closeDate).toISOString().split('T')[0] : "",
  )
  const [status, setStatus] = useState<CampaignStatus>(
    campaign?.status === "archived" ? "draft" : (campaign?.status ?? "draft"),
  )
  const [aiModeration, setAiModeration] = useState(
    campaign?.aiModeration ?? true,
  )
  const [aiLevel, setAiLevel] = useState<ModerationLevel>(
    campaign?.aiLevel ?? "standard",
  )
  const [requireEmailVerification, setRequireEmailVerification] = useState(
    campaign?.requireEmailVerification ?? false,
  )
  const [autoEmailOnPublish, setAutoEmailOnPublish] = useState(
    campaign?.autoEmailOnPublish ?? false,
  )
  const [seeds, setSeeds] = useState<SeedCouplet[]>(
    seedCouplets?.map((s, i) => ({
      id: `seed_${i}`,
      lineOne: s.lineOne,
      lineTwo: s.lineTwo,
      author: s.author,
    })) ?? [],
  )

  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const titleError = touched && !title.trim() ? "Title is required." : null
  const startDateError = touched && !startDate ? "Start date is required." : null
  const closeDateError = touched && !closeDate ? "Close date is required." : null
  const dateRangeError = touched && startDate && closeDate && new Date(startDate) >= new Date(closeDate) ? "Close date must be after start date." : null
  const isValid = title.trim().length > 0 && startDate && closeDate && new Date(startDate) < new Date(closeDate)

  function addSeed() {
    setSeeds((prev) => [
      ...prev,
      { id: `seed_${Date.now()}`, lineOne: "", lineTwo: "", author: "" },
    ])
  }

  function updateSeed(id: string, patch: Partial<SeedCouplet>) {
    setSeeds((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  function removeSeed(id: string) {
    setSeeds((prev) => prev.filter((s) => s.id !== id))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    setError(null)
    if (!isValid) return

    setSubmitting(true)
    const payload = {
      title: title.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      backgroundImageUrl: backgroundImageUrl.trim() || null,
      status: status as "draft" | "active" | "paused" | "completed",
      aiModeration,
      aiLevel,
      videoLink: videoLink.trim() || null,
      donationLink: donationLink.trim() || null,
      requireEmailVerification,
      autoEmailOnPublish,
      startDate: new Date(startDate).toISOString(),
      closeDate: new Date(closeDate).toISOString(),
      seedCouplets: seeds.map((s) => ({
        lineOne: s.lineOne,
        lineTwo: s.lineTwo,
        author: s.author,
      })),
    }
    const result =
      isEdit && campaign
        ? await updateCampaign(campaign.id, payload)
        : await createCampaign(payload)

    if (!result.ok) {
      setSubmitting(false)
      setError(result.error ?? "Something went wrong. Please try again.")
      return
    }
    setSubmitting(false)
    setDone(true)
    router.push("/dashboard/campaigns")
    router.refresh()
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

      {/* Basic Info */}
      <FormSection
        title="Basic info"
        description="The name and story behind this campaign."
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={Boolean(titleError)}
            aria-describedby={titleError ? "title-error" : undefined}
            placeholder="Two Lines for the Earth"
            className={cn(titleError && "border-destructive")}
          />
          {titleError ? (
            <p
              id="title-error"
              role="alert"
              aria-live="polite"
              className="text-sm text-destructive"
            >
              {titleError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="A living poem written by the world, for the world."
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the cause and what contributors are writing toward."
          />
        </div>
      </FormSection>

      {/* Date Range */}
      <FormSection
        title="Campaign dates"
        description="Set when submissions can be received. Contributions outside this window are automatically locked."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <Label htmlFor="start-date">
              Start date <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={Boolean(startDateError)}
                aria-describedby={startDateError ? "start-date-error" : undefined}
                className={cn("pl-9", startDateError && "border-destructive")}
              />
            </div>
            {startDateError ? (
              <p
                id="start-date-error"
                role="alert"
                aria-live="polite"
                className="text-sm text-destructive"
              >
                {startDateError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <Label htmlFor="close-date">
              Close date <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <Input
                id="close-date"
                type="date"
                value={closeDate}
                onChange={(e) => setCloseDate(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={Boolean(closeDateError || dateRangeError)}
                aria-describedby={closeDateError || dateRangeError ? "close-date-error" : undefined}
                className={cn("pl-9", (closeDateError || dateRangeError) && "border-destructive")}
              />
            </div>
            {closeDateError ? (
              <p
                id="close-date-error"
                role="alert"
                aria-live="polite"
                className="text-sm text-destructive"
              >
                {closeDateError}
              </p>
            ) : null}
            {dateRangeError ? (
              <p
                id="close-date-error"
                role="alert"
                aria-live="polite"
                className="text-sm text-destructive"
              >
                {dateRangeError}
              </p>
            ) : null}
          </div>
        </div>
      </FormSection>

      {/* Media Uploads */}
      <FormSection
        title="Media"
        description="A background image shown on campaign cards and the campaign hero."
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="background-image">Background image</Label>
          <ImageUpload
            value={backgroundImageUrl}
            onUploadComplete={(url) => setBackgroundImageUrl(url)}
          />
        </div>
      </FormSection>

      {/* Links */}
      <FormSection
        title="Links"
        description="Optional video and donation links surfaced on the campaign page."
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="video">Video link</Label>
          <Input
            id="video"
            type="url"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            placeholder="https://"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="donation">Donation link</Label>
          <Input
            id="donation"
            type="url"
            value={donationLink}
            onChange={(e) => setDonationLink(e.target.value)}
            placeholder="https://"
          />
        </div>
      </FormSection>

      {/* Configuration */}
      <FormSection
        title="Configuration"
        description="Publication status and how submissions are moderated."
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as CampaignStatus)}
          >
            <SelectTrigger id="status" className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="ai-moderation" className="cursor-pointer">
              AI moderation
            </Label>
            <p className="text-sm text-muted-foreground text-pretty">
              When on, the AI auto-approves on-theme couplets. Turn off to send
              every submission to the manual queue.
            </p>
          </div>
          <Switch
            id="ai-moderation"
            checked={aiModeration}
            onCheckedChange={(v) => setAiModeration(Boolean(v))}
          />
        </div>

        {aiModeration ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="ai-level">AI moderation level</Label>
            <Select
              value={aiLevel}
              onValueChange={(v) => setAiLevel(v as ModerationLevel)}
            >
              <SelectTrigger id="ai-level" className="w-full sm:w-64">
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
            <p className="text-sm text-muted-foreground">
              {LEVEL_OPTIONS.find((o) => o.value === aiLevel)?.hint}
            </p>
          </div>
        ) : null}
      </FormSection>

      {/* Email Settings */}
      <FormSection
        title="Email settings"
        description="Configure how email is handled for contributions."
      >
        <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="email-verification" className="cursor-pointer">
              Require email verification
            </Label>
            <p className="text-sm text-muted-foreground text-pretty">
              Contributors must verify their email address before their couplet is submitted.
            </p>
          </div>
          <Switch
            id="email-verification"
            checked={requireEmailVerification}
            onCheckedChange={(v) => setRequireEmailVerification(Boolean(v))}
          />
        </div>

        <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="auto-email" className="cursor-pointer">
              Auto-send emails on publish
            </Label>
            <p className="text-sm text-muted-foreground text-pretty">
              When a couplet is approved and published, automatically send a confirmation email to the contributor.
            </p>
          </div>
          <Switch
            id="auto-email"
            checked={autoEmailOnPublish}
            onCheckedChange={(v) => setAutoEmailOnPublish(Boolean(v))}
          />
        </div>
      </FormSection>

      {/* Seed Data */}
      <FormSection
        title="Seed couplets"
        description="Optional opening lines that kickstart the poem before contributions arrive."
      >
        {seeds.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No seed couplets yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {seeds.map((s, i) => (
              <li
                key={s.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Couplet {i + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove couplet ${i + 1}`}
                    onClick={() => removeSeed(s.id)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`${s.id}-1`} className="sr-only">
                    Couplet {i + 1} line one
                  </Label>
                  <Input
                    id={`${s.id}-1`}
                    value={s.lineOne}
                    maxLength={100}
                    onChange={(e) =>
                      updateSeed(s.id, { lineOne: e.target.value })
                    }
                    placeholder="First line"
                  />
                  <Label htmlFor={`${s.id}-2`} className="sr-only">
                    Couplet {i + 1} line two
                  </Label>
                  <Input
                    id={`${s.id}-2`}
                    value={s.lineTwo}
                    maxLength={100}
                    onChange={(e) =>
                      updateSeed(s.id, { lineTwo: e.target.value })
                    }
                    placeholder="Second line"
                  />
                  <Label htmlFor={`${s.id}-author`} className="sr-only">
                    Couplet {i + 1} author
                  </Label>
                  <Input
                    id={`${s.id}-author`}
                    value={s.author}
                    maxLength={100}
                    onChange={(e) =>
                      updateSeed(s.id, { author: e.target.value })
                    }
                    placeholder="Author name"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        <div>
          <Button type="button" variant="outline" size="sm" onClick={addSeed}>
            <Plus className="size-4" aria-hidden="true" />
            Add couplet
          </Button>
        </div>
      </FormSection>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/campaigns")}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid || submitting || done}>
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
          ) : isEdit ? (
            "Save changes"
          ) : (
            "Create campaign"
          )}
        </Button>
      </div>
    </form>
  )
}

function FormSection({
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
