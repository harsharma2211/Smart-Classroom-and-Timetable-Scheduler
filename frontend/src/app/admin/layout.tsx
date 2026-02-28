'use client'

import { useEffect } from 'react'
import { AppShellSkeleton } from '@/components/shell/AppShellSkeleton'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AppShell from '@/components/shell/AppShell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
      } else {
        const role = user.role.toLowerCase()
        if (role !== 'admin' && role !== 'org_admin' && role !== 'super_admin') {
          router.push('/unauthorized')
        }
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <AppShellSkeleton />
  }

  if (!user) {
    return null
  }

  const role = user.role.toLowerCase()
  if (role !== 'admin' && role !== 'org_admin' && role !== 'super_admin') {
    return null
  }

  return <AppShell>{children}</AppShell>
}
