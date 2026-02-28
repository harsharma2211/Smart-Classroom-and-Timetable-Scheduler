'use client'

import { Skeleton, TimetableGridSkeleton } from '@/components/LoadingSkeletons'

export default function StatusLoading() {
  return (
    <div className="space-y-6 py-2">
      <Skeleton style={{ height: '24px', width: '200px' }} />
      <Skeleton style={{ height: '120px', borderRadius: '12px' }} />
      <TimetableGridSkeleton />
    </div>
  )
}
