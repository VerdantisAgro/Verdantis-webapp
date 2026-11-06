"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/src/lib/session"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (getToken()) {
      setAllowed(true)
    } else {
      router.replace("/")
    }
  }, [router])

  if (!allowed) return null
  return <>{children}</>
}
