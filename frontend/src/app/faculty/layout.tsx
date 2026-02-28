'use client'

import { useEffect } from 'react'
import { AppShellSkeleton } from '@/components/shell/AppShellSkeleton'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AppShell from '@/components/shell/AppShell'

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
      } else if (user.role.toLowerCase() !== 'faculty') {
        router.push('/unauthorized')
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <AppShellSkeleton />
  }

  if (!user || user.role.toLowerCase() !== 'faculty') {
    return null
  }

  return <AppShell>{children}</AppShell>
}
