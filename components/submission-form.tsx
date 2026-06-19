"use client"

import { useState, type FormEvent } from "react"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"
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
import { cn } from "@/lib/utils"

const VERSE_MAX = 100
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Status = "idle" | "submitting" | "success" | "error"

interface FieldErrors {
  fullName?: string
  email?: string
  verseOne?: string
  verseTwo?: string
  consent?: string
}

export function SubmissionForm() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [verseOne, setVerseOne] = useState("")
  const [verseTwo, setVerseTwo] = useState("")
  const [consent, setConsent] = useState(false)

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState<Status>("idle")
  const [serverError, setServerError] = useState<string | null>(null)

  function validate(): FieldErrors {
    const errors: FieldErrors = {}
    if (!fullName.trim()) errors.fullName = "Please tell us your name."
    if (!email.trim()) errors.email = "An email is required."
    else if (!EMAIL_RE.test(email.trim()))
      errors.email = "Enter a valid email address."
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTouched({
      fullName: true,
      email: true,
      verseOne: true,
      verseTwo: true,
      consent: true,
    })
    if (!isValid) return

    setStatus("submitting")
    setServerError(null)

    // Phase 1: simulate the server + AI moderation round-trip with mock data.
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setStatus("success")
      setFullName("")
      setEmail("")
      setVerseOne("")
      setVerseTwo("")
      setConsent(false)
      setTouched({})
    } catch {
      setStatus("error")
      setServerError("Something went wrong while weaving your lines. Please try again.")
    }
  }

  if (status === "success") {
    return (
      <Card className="mx-auto max-w-xl text-center" size="default">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <CheckCircle2
            className="size-12 text-primary"
            aria-hidden="true"
          />
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-semibold">
              Your lines are on their way
            </h3>
            <p
              className="leading-relaxed text-muted-foreground text-pretty"
              aria-live="polite"
            >
              Our AI moderation check is reviewing your couplet for the campaign
              theme. Once approved, it will be stitched into the living poem.
            </p>
          </div>
          <Button variant="outline" onClick={() => setStatus("idle")}>
            Write another couplet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-xl" size="default">
      <CardHeader className="border-b px-6 pb-5">
        <CardTitle className="font-serif text-2xl font-semibold">
          Write Your Two Lines
        </CardTitle>
        <CardDescription className="leading-relaxed text-pretty">
          Add your couplet to the poem. Exactly two lines, up to{" "}
          {VERSE_MAX} characters each.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6">
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
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
              aria-describedby={showError("fullName") ? "fullName-error" : undefined}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
            />
            <FieldError id="fullName-error" message={showError("fullName")} />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              aria-required="true"
              aria-invalid={!!showError("email")}
              aria-describedby={showError("email") ? "email-error" : undefined}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            />
            <FieldError id="email-error" message={showError("email")} />
          </div>

          {/* First verse */}
          <VerseField
            id="verseOne"
            label="First verse"
            placeholder="The glaciers keep a diary in blue,"
            value={verseOne}
            error={showError("verseOne")}
            onChange={setVerseOne}
            onBlur={() => setTouched((t) => ({ ...t, verseOne: true }))}
          />

          {/* Second verse */}
          <VerseField
            id="verseTwo"
            label="Second verse"
            placeholder="and every page we burn, they read aloud."
            value={verseTwo}
            error={showError("verseTwo")}
            onChange={setVerseTwo}
            onBlur={() => setTouched((t) => ({ ...t, verseTwo: true }))}
          />

          {/* Consent */}
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={consent}
                aria-required="true"
                aria-invalid={!!showError("consent")}
                aria-describedby={showError("consent") ? "consent-error" : undefined}
                onCheckedChange={(checked) => {
                  setConsent(Boolean(checked))
                  setTouched((t) => ({ ...t, consent: true }))
                }}
                className="mt-0.5"
              />
              <Label
                htmlFor="consent"
                className="text-sm leading-relaxed text-muted-foreground font-normal"
              >
                I accept the Terms &amp; Conditions and consent to an{" "}
                <span className="font-medium text-foreground">
                  AI automated moderation check
                </span>{" "}
                of my submission.
              </Label>
            </div>
            <FieldError id="consent-error" message={showError("consent")} />
          </div>

          {status === "error" && serverError ? (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
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
                Weaving your lines…
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
