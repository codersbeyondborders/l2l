"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Feather, Loader2, AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/dashboard"

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push(next)
      router.refresh()
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to sign in. Try again.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Feather className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight">
              Last2Lines Admin
            </h1>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              Sign in to manage campaigns and moderation.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Enter your admin credentials to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@last2lines.org"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error ? (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                >
                  <AlertCircle
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{error}</span>
                </div>
              ) : null}

              <Button
                type="submit"
                className="h-11 w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
          <Loader2
            className="size-6 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
          <span className="sr-only">Loading sign in form</span>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
