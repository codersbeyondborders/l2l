"use client"

import { useState, type FormEvent } from "react"
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  CalendarClock,
  Lock,
  MailCheck,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  formatCampaignDate,
  type Campaign,
  type CampaignPhase,
} from "@/lib/mock-data"
import { submitContribution } from "@/lib/actions"
import { COUNTRIES } from "@/lib/countries"

const VERSE_MAX = 100
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Status = "idle" | "submitting" | "success" | "error"
type OtpStatus =
  | "idle"
  | "sending"
  | "sent"
  | "verifying"
  | "verified"
  | "error"

interface FieldErrors {
  fullName?: string
  email?: string
  country?: string
  otp?: string
  verseOne?: string
  verseTwo?: string
  consent?: string
}

export function CampaignSubmission({
  campaign,
  phase,
}: {
  campaign: Campaign
  phase: CampaignPhase
}) {
  if (phase === "upcoming") {
    return (
      <PhaseNotice
        icon={
          <CalendarClock className="size-10 text-primary" aria-hidden="true" />
        }
        title={`Starts on ${formatCampaignDate(campaign.startDate)}`}
        body="This campaign hasn't opened yet. Check back when it begins to add your two lines."
      />
    )
  }

  if (phase === "completed") {
    return (
      <PhaseNotice
        icon={
          <Lock
            className="size-10 text-muted-foreground"
            aria-hidden="true"
          />
        }
        title="This campaign has concluded"
        body="Submissions are now closed, but the poem below remains here to read and revisit."
      />
    )
  }

  return <ActiveForm campaign={campaign} />
}

function PhaseNotice({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <Card className="mx-auto max-w-xl text-center" size="default">
      <CardContent className="flex flex-col items-center gap-4 py-10">
        {icon}
        <div className="space-y-2">
          <h3 className="font-serif text-2xl font-semibold text-balance">
            {title}
          </h3>
          <p
            className="leading-relaxed text-muted-foreground text-pretty"
            aria-live="polite"
          >
            {body}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function ActiveForm({ campaign }: { campaign: Campaign }) {
  const requiresVerification = campaign.requireEmailVerification

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [country, setCountry] = useState("")
  const [otp, setOtp] = useState("")
  const [emailVerified, setEmailVerified] = useState(false)
  const [otpStatus, setOtpStatus] = useState<OtpStatus>("idle")
  const [otpError, setOtpError] = useState<string | null>(null)
  const [mockCode, setMockCode] = useState<string | null>(null)
  const [verseOne, setVerseOne] = useState("")
  const [verseTwo, setVerseTwo] = useState("")
  const [consent, setConsent] = useState(false)

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState<Status>("idle")
  const [serverError, setServerError] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<
    "approved" | "rejected" | "pending" | null
  >(null)

  const emailIsValid = EMAIL_RE.test(email.trim())

  function validate(): FieldErrors {
    const errors: FieldErrors = {}
    if (!fullName.trim()) errors.fullName = "Please tell us your name."
    if (!email.trim()) errors.email = "An email is required."
    else if (!emailIsValid) errors.email = "Enter a valid email address."
    if (!country.trim()) errors.country = "Please select your country."
    if (requiresVerification && !emailVerified)
      errors.otp = "Please verify your email before submitting."
    if (!verseOne.trim()) errors.verseOne = "Your first line cannot be empty."
    else if (verseOne.length > VERSE_MAX)
      errors.verseOne = `Keep it under ${VERSE_MAX} characters.`
    if (!verseTwo.trim()) errors.verseTwo = "Your second line cannot be empty."
    else if (verseTwo.length > VERSE_MAX)
      errors.verseTwo = `Keep it under ${VERSE_MAX} characters.`
    if (!consent) errors.consent = "Please accept the terms to continue."
    return errors
  }

  const errors = validate()
  const isValid = Object.keys(errors).length === 0

  function showError(field: keyof FieldErrors) {
    return touched[field] ? errors[field] : undefined
  }

  // ── OTP helpers ──────────────────────────────────────────────────────────

  async function sendOtp() {
    if (!emailIsValid) {
      setTouched((t) => ({ ...t, email: true }))
      return
    }
    setOtpStatus("sending")
    setOtpError(null)
    setEmailVerified(false)
    setOtp("")
    setMockCode(null)

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          campaignId: campaign.id,
          campaignTitle: campaign.title,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setOtpStatus("error")
        setOtpError(data.error ?? "Failed to send verification code.")
        return
      }
      if (data.mock && data.mockCode) {
        setMockCode(data.mockCode)
      }
      setOtpStatus("sent")
    } catch {
      setOtpStatus("error")
      setOtpError("Could not reach the server. Please try again.")
    }
  }

  async function verifyOtp() {
    if (otp.trim().length !== 6) {
      setOtpError("Enter the 6-digit code from your email.")
      return
    }
    setOtpStatus("verifying")
    setOtpError(null)

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          campaignId: campaign.id,
          code: otp.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setOtpStatus("sent") // allow retry
        setOtpError(data.error ?? "Incorrect code. Please try again.")
        return
      }
      setOtpStatus("verified")
      setEmailVerified(true)
    } catch {
      setOtpStatus("sent")
      setOtpError("Could not reach the server. Please try again.")
    }
  }

  // ── Form submit ───────────────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTouched({
      fullName: true,
      email: true,
      country: true,
      otp: true,
      verseOne: true,
      verseTwo: true,
      consent: true,
    })
    if (!isValid) return

    setStatus("submitting")
    setServerError(null)

    try {
      const result = await submitContribution({
        campaignId: campaign.id,
        fullName: fullName.trim(),
        email: email.trim(),
        country: country.trim() || null,
        lineOne: verseOne.trim(),
        lineTwo: verseTwo.trim(),
        consent,
        emailVerified,
      })

      if (!result.ok) {
        setStatus("error")
        setServerError(
          result.error ??
            "Something went wrong while weaving your lines. Please try again.",
        )
        return
      }

      setStatus("success")
      setOutcome(result.status ?? "pending")
      setFullName("")
      setEmail("")
      setCountry("")
      setOtp("")
      setEmailVerified(false)
      setOtpStatus("idle")
      setVerseOne("")
      setVerseTwo("")
      setConsent(false)
      setTouched({})
    } catch {
      setStatus("error")
      setServerError(
        "Something went wrong while weaving your lines. Please try again.",
      )
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────

  if (status === "success") {
    const success = {
      approved: {
        title: "Your lines are now part of the poem",
        body: "Our AI moderation check approved your couplet and it has been stitched into the living poem below.",
      },
      rejected: {
        title: "Your couplet wasn't approved",
        body: "Our AI moderation check flagged this submission as outside the campaign guidelines, so it wasn't added to the poem. You're welcome to revise and try again.",
      },
      pending: {
        title: "Your lines are on their way",
        body: campaign.aiModeration
          ? "Our AI moderation check wasn't fully certain, so your couplet has been queued for a human reviewer. Once approved, it will join the living poem."
          : "Your couplet is queued for review. Once approved, it will be stitched into the living poem.",
      },
    }[outcome ?? "pending"]

    const rejected = outcome === "rejected"

    return (
      <Card className="mx-auto max-w-xl text-center" size="default">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          {rejected ? (
            <AlertCircle
              className="size-12 text-muted-foreground"
              aria-hidden="true"
            />
          ) : (
            <CheckCircle2
              className="size-12 text-primary"
              aria-hidden="true"
            />
          )}
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-semibold text-balance">
              {success.title}
            </h3>
            <p
              className="leading-relaxed text-muted-foreground text-pretty"
              aria-live="polite"
            >
              {success.body}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setStatus("idle")
              setOutcome(null)
            }}
          >
            {rejected ? "Try another couplet" : "Write another couplet"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <Card className="mx-auto max-w-xl" size="default">
      <CardHeader className="border-b px-6 pb-5">
        <CardTitle className="font-serif text-2xl font-semibold">
          Write Your Two Lines
        </CardTitle>
        <CardDescription className="leading-relaxed text-pretty">
          Add your couplet to {campaign.title}. Exactly two lines, up to{" "}
          {VERSE_MAX} characters each.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6">
        <form
          noValidate
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >
          {/* Full name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              autoComplete="name"
              placeholder="Maya Rahman"
              value={fullName}
              aria-required="true"
              aria-invalid={!!showError("fullName")}
              aria-describedby={
                showError("fullName") ? "fullName-error" : undefined
              }
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
            />
            <FieldError id="fullName-error" message={showError("fullName")} />
          </div>

          {/* Email + OTP */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>

            {/* Email row */}
            <div className="flex gap-2">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                aria-required="true"
                aria-invalid={!!showError("email")}
                aria-describedby={
                  showError("email") ? "email-error" : undefined
                }
                disabled={emailVerified}
                onChange={(e) => {
                  setEmail(e.target.value)
                  // Reset verification if email changes
                  if (emailVerified) {
                    setEmailVerified(false)
                    setOtpStatus("idle")
                    setOtp("")
                    setMockCode(null)
                  }
                }}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                className={cn(emailVerified && "opacity-60")}
              />
              {requiresVerification && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-9 self-start"
                  disabled={
                    !emailIsValid ||
                    otpStatus === "sending" ||
                    otpStatus === "verifying" ||
                    emailVerified
                  }
                  onClick={sendOtp}
                  aria-label={
                    otpStatus === "sent" || otpStatus === "error"
                      ? "Resend verification code"
                      : "Send verification code"
                  }
                >
                  {otpStatus === "sending" ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : emailVerified ? (
                    <MailCheck className="size-3.5 text-primary" />
                  ) : otpStatus === "sent" || otpStatus === "error" ? (
                    "Resend code"
                  ) : (
                    "Send code"
                  )}
                </Button>
              )}
            </div>

            <FieldError id="email-error" message={showError("email")} />

            {/* Verified badge */}
            {emailVerified && (
              <p
                className="flex items-center gap-1.5 text-xs font-medium text-primary"
                aria-live="polite"
              >
                <MailCheck className="size-3.5" aria-hidden="true" />
                Email verified
              </p>
            )}

            {/* OTP input row — shown after code sent */}
            {requiresVerification &&
              (otpStatus === "sent" ||
                otpStatus === "verifying" ||
                otpStatus === "error") && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      id="otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="6-digit code"
                      value={otp}
                      autoComplete="one-time-code"
                      aria-label="Verification code"
                      aria-describedby={otpError ? "otp-error" : undefined}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className="max-w-[160px] font-mono tracking-widest"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="h-9 shrink-0"
                      disabled={
                        otp.length !== 6 || otpStatus === "verifying"
                      }
                      onClick={verifyOtp}
                    >
                      {otpStatus === "verifying" ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                  {otpError && (
                    <p
                      id="otp-error"
                      role="alert"
                      aria-live="polite"
                      className="text-xs font-medium text-destructive"
                    >
                      {otpError}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Check your inbox for the 6-digit code. It expires in 15
                    minutes.
                  </p>
                  {mockCode && (
                    <p
                      role="status"
                      aria-live="polite"
                      className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-mono font-semibold text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    >
                      Dev mode — use code: {mockCode}
                    </p>
                  )}
                </div>
              )}

            {/* Validation error when user tries to submit without verifying */}
            {requiresVerification && !emailVerified && showError("otp") && (
              <FieldError id="otp-error" message={showError("otp")} />
            )}
          </div>

          {/* Country */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="country">Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger
                id="country"
                aria-required="true"
                aria-invalid={!!showError("country")}
                aria-describedby={showError("country") ? "country-error" : undefined}
              >
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id="country-error" message={showError("country")} />
          </div>

          <VerseField
            id="verseOne"
            label="First verse"
            placeholder="The glaciers keep a diary in blue,"
            value={verseOne}
            error={showError("verseOne")}
            onChange={setVerseOne}
            onBlur={() => setTouched((t) => ({ ...t, verseOne: true }))}
          />

          <VerseField
            id="verseTwo"
            label="Second verse"
            placeholder="and every page we burn, they read aloud."
            value={verseTwo}
            error={showError("verseTwo")}
            onChange={setVerseTwo}
            onBlur={() => setTouched((t) => ({ ...t, verseTwo: true }))}
          />

          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={consent}
                aria-required="true"
                aria-invalid={!!showError("consent")}
                aria-describedby={
                  showError("consent") ? "consent-error" : undefined
                }
                onCheckedChange={(checked) => {
                  setConsent(Boolean(checked))
                  setTouched((t) => ({ ...t, consent: true }))
                }}
                className="mt-0.5 shrink-0"
              />
              <label
                htmlFor="consent"
                className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
              >
                I acknowledge and accept the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                >
                  Terms and Conditions.
                </a>{" "}
                and I willingly entrust AI moderation for my poetic
                contribution.
              </label>
            </div>
            <FieldError id="consent-error" message={showError("consent")} />
          </div>

          {status === "error" && serverError ? (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            >
              <AlertCircle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>{serverError}</span>
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full text-base"
            disabled={!isValid || status === "submitting"}
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Weaving your lines&hellip;
              </>
            ) : (
              "Submit to the Poem"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function VerseField({
  id,
  label,
  placeholder,
  value,
  error,
  onChange,
  onBlur,
}: {
  id: string
  label: string
  placeholder: string
  value: string
  error?: string
  onChange: (v: string) => void
  onBlur: () => void
}) {
  const remaining = VERSE_MAX - value.length
  const isOver = remaining < 0
  const isNear = remaining <= 15 && remaining >= 0

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <span
          aria-live="polite"
          className={cn(
            "text-xs tabular-nums",
            isOver
              ? "font-medium text-destructive"
              : isNear
                ? "text-foreground"
                : "text-muted-foreground",
          )}
        >
          <span className="sr-only">{label} characters used: </span>
          {value.length}/{VERSE_MAX}
        </span>
      </div>
      <Input
        id={id}
        name={id}
        placeholder={placeholder}
        value={value}
        maxLength={VERSE_MAX}
        aria-required="true"
        aria-invalid={!!error || isOver}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className="text-xs font-medium text-destructive"
    >
      {message}
    </p>
  )
}
