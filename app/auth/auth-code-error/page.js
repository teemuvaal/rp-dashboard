'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function AuthError() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            There was a problem authenticating your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This could happen for several reasons:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
            <li>The authentication session expired</li>
            <li>There was a problem with the Discord authentication</li>
            <li>The connection was interrupted</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/login">
              Try Again
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 