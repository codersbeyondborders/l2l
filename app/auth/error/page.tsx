import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-serif text-2xl font-semibold">
          Authentication error
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
          We couldn&apos;t complete your sign-in. The link may have expired.
          Please try again.
        </p>
        <Button
          className="mt-6"
          nativeButton={false}
          render={<Link href="/auth/login">Back to sign in</Link>}
        />
      </div>
    </main>
  )
}
