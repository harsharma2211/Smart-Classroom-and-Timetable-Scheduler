'use client'

import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertTriangle, Users, Clock, Lightbulb, CheckCircle2, Loader2 } from 'lucide-react'
import { GoogleSpinner } from '@/components/ui/GoogleSpinner'
import apiClient from '@/lib/api'
import { useToast } from '@/components/Toast'
import type { ConflictItem, ConflictDetectionResult } from '@/types/timetable'

// ── Group metadata ───────────────────────────────────────────────────────────
const GROUP_META: Record<string, { label: string; icon: ComponentType<{ className?: string }>; color: string }> = {
  room:    { label: 'Room Conflicts',    icon: AlertTriangle, color: '#FBBC04' },
  faculty: { label: 'Faculty Conflicts', icon: Users,         color: '#1a73e8' },
  time:    { label: 'Time Conflicts',    icon: Clock,         color: '#9c27b0' },
  other:   { label: 'Other Conflicts',   icon: AlertTriangle, color: 'var(--color-text-muted)' },
}

function conflictGroup(type: string): string {
  const t = type.toLowerCase()
  if (t.includes('room') || t.includes('classroom')) return 'room'
  if (t.includes('faculty') || t.includes('teacher') || t.includes('instructor')) return 'faculty'
  if (t.includes('time') || t.includes('slot') || t.includes('schedule')) return 'time'
  return 'other'
}

// ── Severity styles ──────────────────────────────────────────────────────────
const SEVERITY_STYLES: Record<string, { border: string; badge: string }> = {
  critical: { border: 'var(--color-danger)',  badge: 'var(--color-danger)'  },
  high:     { border: '#ea580c',              badge: '#ea580c'              },
  medium:   { border: 'var(--color-warning)', badge: 'var(--color-warning)' },
  low:      { border: 'var(--color-primary)', badge: 'var(--color-primary)' },
}
const getSeverityStyle = (s: string) =>
  SEVERITY_STYLES[s] ?? { border: 'var(--color-border)', badge: 'var(--color-bg-surface-3)' }

// ── Suggestion infobox with Apply button ─────────────────────────────────────
interface SuggestionBoxProps {
  conflict: ConflictItem
  originalIndex: number
  acknowledged: boolean
  onApply: (originalIndex: number) => Promise<void>
  applying: boolean
}

function SuggestionBox({ conflict, originalIndex, acknowledged, onApply, applying }: SuggestionBoxProps) {
  if (!conflict.suggestion) return null

  return (
    <div
      className="rounded-xl p-4 mt-4 transition-opacity duration-200"
      style={{
        background: acknowledged ? 'var(--color-success-subtle)' : 'var(--color-info-subtle)',
        borderLeft: `4px solid ${acknowledged ? 'var(--color-success)' : '#FBBC04'}`,
        opacity: acknowledged ? 0.75 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        <Lightbulb
          className="w-4 h-4 flex-shrink-0 mt-0.5"
          style={{ color: acknowledged ? 'var(--color-success)' : '#FBBC04' }}
        />
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: acknowledged ? 'var(--color-success-text)' : 'var(--color-text-primary)' }}
          >
            {acknowledged ? 'Suggestion acknowledged' : 'Suggested Resolution'}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {conflict.suggestion}
          </p>
        </div>
        {!acknowledged && (
          <button
            onClick={() => onApply(originalIndex)}
            disabled={applying}
            className="shrink-0 rounded-full px-4 py-1.5 text-xs font-medium text-white transition-opacity duration-200 disabled:opacity-50 flex items-center gap-1.5"
            style={{ background: '#1a73e8' }}
          >
            {applying ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            Apply
          </button>
        )}
        {acknowledged && (
          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--color-success)' }} />
        )}
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ConflictsPage() {
  const params = useParams()
  const router = useRouter()
  const { showSuccessToast, showErrorToast } = useToast()
  const timetableId = params.timetableId as string

  const [result, setResult] = useState<ConflictDetectionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null)

  const fetchConflicts = useCallback(async () => {
    setLoading(true)
    const res = await apiClient.getConflicts(timetableId, 0)
    if (res.data) {
      setResult(res.data as ConflictDetectionResult)
    } else {
      showErrorToast('Failed to load conflicts')
    }
    setLoading(false)
  }, [timetableId, showErrorToast])

  useEffect(() => { fetchConflicts() }, [fetchConflicts])

  const conflicts = result?.conflicts ?? []
  const summary = result?.summary ?? null
  const acknowledgedIndices: number[] = result?.acknowledged_indices ?? []

  const filteredConflicts = useMemo(
    () => conflicts.map((c, i) => ({ conflict: c, originalIndex: i }))
                   .filter(({ conflict }) => filter === 'all' || conflict.severity === filter),
    [conflicts, filter]
  )

  // Group filtered conflicts by type (preserving original indices)
  const groupedConflicts = useMemo(() => {
    const groups: Record<string, Array<{ conflict: ConflictItem; originalIndex: number }>> = {}
    for (const item of filteredConflicts) {
      const g = conflictGroup(item.conflict.type)
      if (!groups[g]) groups[g] = []
      groups[g].push(item)
    }
    return groups
  }, [filteredConflicts])

  const handleApply = useCallback(async (originalIndex: number) => {
    setApplyingIndex(originalIndex)
    const res = await apiClient.applySuggestion(timetableId, 0, originalIndex)
    setApplyingIndex(null)
    if (res.error) {
      showErrorToast(`Could not acknowledge: ${res.error}`)
    } else {
      // Merge acknowledged index into local state so UI updates immediately
      setResult(prev => prev ? {
        ...prev,
        acknowledged_indices: [...(prev.acknowledged_indices ?? []), originalIndex],
      } : prev)
      showSuccessToast('Suggestion acknowledged')
    }
  }, [timetableId, showErrorToast, showSuccessToast])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <GoogleSpinner size={48} className="mx-auto" />
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Loading conflicts...
          </p>
        </div>
      </div>
    )
  }

  const totalConflicts = conflicts.length
  const acknowledgedCount = acknowledgedIndices.length

  return (
    <div className="space-y-6">

      {/* Header with conflict count badge */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="btn-ghost text-sm flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Conflict Detection
            </h1>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: totalConflicts === 0 ? 'var(--color-success-subtle)' : 'var(--color-danger-subtle)',
                color: totalConflicts === 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)',
              }}
            >
              Conflicts ({totalConflicts - acknowledgedCount})
            </span>
            {acknowledgedCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--color-success-subtle)', color: 'var(--color-success-text)' }}>
                {acknowledgedCount} resolved
              </span>
            )}
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Identify and resolve timetable conflicts
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {([
            { label: 'Total',    value: summary.total,    color: 'var(--color-text-primary)'   },
            { label: 'Critical', value: summary.critical, color: 'var(--color-danger-text)'    },
            { label: 'High',     value: summary.high,     color: '#ea580c'                     },
            { label: 'Medium',   value: summary.medium,   color: 'var(--color-warning-text)'   },
            { label: 'Low',      value: summary.low,      color: 'var(--color-primary)'        },
          ] as const).map(({ label, value, color }) => (
            <div key={label} className="card">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <div className="card py-3">
        <div className="flex flex-wrap gap-2">
          {([
            { key: 'all',      label: `All (${conflicts.length})` },
            { key: 'critical', label: `Critical (${summary?.critical ?? 0})` },
            { key: 'high',     label: `High (${summary?.high ?? 0})` },
            { key: 'medium',   label: `Medium (${summary?.medium ?? 0})` },
            { key: 'low',      label: `Low (${summary?.low ?? 0})` },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={filter === key ? 'btn-primary text-sm py-1.5 px-3' : 'btn-secondary text-sm py-1.5 px-3'}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Conflict list — grouped by type */}
      {filteredConflicts.length === 0 ? (
        <div className="card py-12 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--color-success-subtle)' }}
          >
            <svg className="w-6 h-6" style={{ color: 'var(--color-success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>No Conflicts Found</h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            The timetable has no conflicts at this severity level.
          </p>
        </div>
      ) : (
        Object.entries(groupedConflicts).map(([group, items]) => {
          const meta = GROUP_META[group]
          const GroupIcon = meta.icon
          return (
            <div key={group} className="space-y-3">
              {/* Group header */}
              <div className="flex items-center gap-2 px-1">
                <GroupIcon className="w-4 h-4" style={{ color: meta.color }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  {meta.label}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: 'var(--color-bg-surface-2)', color: 'var(--color-text-muted)' }}
                >
                  {items.length}
                </span>
              </div>

              {items.map(({ conflict, originalIndex }) => {
                const s = getSeverityStyle(conflict.severity)
                const isAcknowledged = acknowledgedIndices.includes(originalIndex)
                return (
                  <div
                    key={originalIndex}
                    className="card overflow-hidden transition-opacity duration-200"
                    style={{
                      borderLeft: `4px solid ${s.border}`,
                      opacity: isAcknowledged ? 0.6 : 1,
                    }}
                  >
                    <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge text-xs font-semibold text-white" style={{ background: s.badge }}>
                          {conflict.severity.toUpperCase()}
                        </span>
                        <span className="badge badge-neutral text-xs">
                          {conflict.type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        {isAcknowledged && (
                          <span className="badge text-xs" style={{ background: 'var(--color-success-subtle)', color: 'var(--color-success-text)' }}>
                            Resolved
                          </span>
                        )}
                      </div>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {conflict.day} · {conflict.time_slot}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                      {conflict.message}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-1 text-sm">
                      {conflict.faculty && (
                        <div>
                          <span style={{ color: 'var(--color-text-muted)' }}>Faculty: </span>
                          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{conflict.faculty}</span>
                        </div>
                      )}
                      {conflict.room && (
                        <div>
                          <span style={{ color: 'var(--color-text-muted)' }}>Room: </span>
                          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{conflict.room}</span>
                        </div>
                      )}
                      {conflict.courses && (
                        <div className="sm:col-span-2">
                          <span style={{ color: 'var(--color-text-muted)' }}>Courses: </span>
                          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {conflict.courses.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <SuggestionBox
                      conflict={conflict}
                      originalIndex={originalIndex}
                      acknowledged={isAcknowledged}
                      onApply={handleApply}
                      applying={applyingIndex === originalIndex}
                    />
                  </div>
                )
              })}
            </div>
          )
        })
      )}
    </div>
  )
}
