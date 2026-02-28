import os

BASE = "d:/GitHub/Smart-Classroom-and-Timetable-Scheduler/frontend/src"

scorebar = """'use client'

/**
 * ScoreBar - compact horizontal progress bar with label + value.
 * Used inside VariantCard for each quality dimension.
 */

interface ScoreBarProps {
  label: string
  /** 0-100. Pass -1 to show N/A. */
  value: number
  color?: string
  compact?: boolean
}

function scoreColor(value: number, override?: string): string {
  if (override) return override
  if (value >= 80) return 'var(--color-success, #34a853)'
  if (value >= 55) return 'var(--color-warning, #fbbc04)'
  return 'var(--color-danger, #ea4335)'
}

export function ScoreBar({ label, value, color, compact = false }: ScoreBarProps) {
  const isNA = value < 0
  const fillColor = isNA ? 'var(--color-bg-surface-3)' : scoreColor(value, color)
  const fillWidth = isNA ? 0 : Math.min(100, Math.max(0, value))
  const displayValue = isNA ? 'N/A' : `${Math.round(value)}%`

  return (
    <div className="flex flex-col gap-[3px]">
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] font-medium uppercase tracking-[0.04em]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {label}
        </span>
        {!compact && (
          <span
            className="text-[12px] font-bold"
            style={{ color: isNA ? 'var(--color-text-muted)' : fillColor }}
          >
            {displayValue}
          </span>
        )}
      </div>
      <div
        className="h-[5px] rounded-full overflow-hidden relative"
        style={{ background: 'var(--color-bg-surface-3, #f1f3f4)' }}
      >
        <div
          role="progressbar"
          aria-label={`${label}: ${displayValue}`}
          aria-valuenow={fillWidth}
          aria-valuemin={0}
          aria-valuemax={100}
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
          style={{ width: `${fillWidth}%`, background: fillColor }}
        />
      </div>
    </div>
  )
}
"""

slot_panel = """'use client'

/**
 * SlotDetailPanel - right slide-in panel showing full details for a timetable cell.
 * Slides in with translateX animation (280ms).
 */

import { X, User, MapPin, BookOpen, AlertCircle, CheckCircle, Users } from 'lucide-react'
import type { TimetableSlotDetailed } from '@/types/timetable'

interface SlotDetailPanelProps {
  slot: TimetableSlotDetailed | null
  onClose: () => void
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-[10px]">
      <span className="shrink-0 mt-[1px] text-[--color-text-muted]">{icon}</span>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.05em] mb-[2px] text-[--color-text-muted]">
          {label}
        </p>
        <p className="text-[13px] font-medium text-[--color-text-primary]">{children}</p>
      </div>
    </div>
  )
}

function TeacherAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 bg-[#e8f0fe] text-[#1a73e8]">
      {initials || <User size={14} />}
    </div>
  )
}

export function SlotDetailPanel({ slot, onClose }: SlotDetailPanelProps) {
  const isOpen = slot !== null

  return (
    <div
      className="fixed top-0 right-0 h-full flex flex-col z-[200]"
      style={{
        width: 320,
        background: 'var(--color-bg-surface)',
        borderLeft: '1px solid var(--color-border)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.10)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 280ms cubic-bezier(.4,0,.2,1)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-[18px] py-4"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Slot Details
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close slot details"
          title="Close"
          className="flex items-center p-1 rounded border-0 bg-transparent cursor-pointer"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      {slot && (
        <div
          className="flex-1 overflow-y-auto px-[18px] py-5 flex flex-col gap-5"
        >
          {/* Conflict banner */}
          {slot.has_conflict ? (
            <div className="flex items-start gap-2 px-3 py-[10px] rounded-lg border border-[#ea4335] bg-[#fce8e6]">
              <AlertCircle size={15} color="#ea4335" className="shrink-0 mt-[1px]" />
              <p className="text-xs font-medium text-[#c5221f]">
                {slot.conflict_description || 'Scheduling conflict detected for this slot.'}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-[6px] px-[10px] py-[6px] rounded-md border border-[#34a853] bg-[#e6f4ea] w-fit">
              <CheckCircle size={13} color="#34a853" />
              <span className="text-[11px] font-semibold text-[#137333]">No conflicts</span>
            </div>
          )}

          {/* Time */}
          <div>
            <p className="text-[11px] font-medium uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>
              Schedule
            </p>
            <p className="text-[15px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {DAY_NAMES[slot.day] ?? `Day ${slot.day}`}
            </p>
            <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
              {slot.time_slot}
            </p>
          </div>

          {/* Course */}
          <InfoRow icon={<BookOpen size={15} />} label="Course">
            <span className="font-bold">{slot.subject_name}</span>
            {slot.subject_code && (
              <span className="text-[11px] ml-[6px]" style={{ color: 'var(--color-text-muted)' }}>
                {slot.subject_code}
              </span>
            )}
          </InfoRow>

          {/* Faculty */}
          <InfoRow icon={<TeacherAvatar name={slot.faculty_name} />} label="Faculty">
            {slot.faculty_name || '\u2014'}
          </InfoRow>

          {/* Room */}
          <InfoRow icon={<MapPin size={15} />} label="Room">
            <>
              {slot.room_number || '\u2014'}
              {slot.room_capacity > 0 && (
                <span className="text-[11px] ml-[6px]" style={{ color: 'var(--color-text-muted)' }}>
                  (capacity {slot.room_capacity})
                </span>
              )}
            </>
          </InfoRow>

          {/* Enrollment */}
          {slot.enrolled_count > 0 && (
            <InfoRow icon={<Users size={15} />} label="Enrolled">
              <>
                <span
                  className="font-bold"
                  style={{ color: slot.enrolled_count > slot.room_capacity ? '#ea4335' : 'inherit' }}
                >
                  {slot.enrolled_count}
                </span>
                {slot.room_capacity > 0 && (
                  <span style={{ color: 'var(--color-text-muted)' }}> / {slot.room_capacity}</span>
                )}
              </>
            </InfoRow>
          )}

          {/* Year / Section chips */}
          {(slot.section || slot.year) && (
            <div className="flex gap-2 flex-wrap">
              {slot.year && (
                <span
                  className="text-[11px] font-semibold px-2 py-[3px] rounded"
                  style={{
                    background: ['#e8f0fe', '#e6f4ea', '#fef7e0', '#fce8e6'][slot.year - 1] || '#f3e8fd',
                    color: ['#1a73e8', '#34a853', '#f9ab00', '#ea4335'][slot.year - 1] || '#9334ea',
                  }}
                >
                  Year {slot.year}
                </span>
              )}
              {slot.section && (
                <span
                  className="text-[11px] font-medium px-2 py-[3px] rounded"
                  style={{ background: 'var(--color-bg-surface-2)', color: 'var(--color-text-secondary)' }}
                >
                  Section {slot.section}
                </span>
              )}
            </div>
          )}

          {/* Batch */}
          {slot.batch_name && (
            <InfoRow icon={<Users size={15} />} label="Batch">
              {slot.batch_name}
            </InfoRow>
          )}
        </div>
      )}
    </div>
  )
}
"""

dept_tree = """'use client'

/**
 * DepartmentTree - collapsible department selector for the variant detail view.
 * Desktop: 240px left sidebar. Mobile: compact dropdown.
 */

import { useState } from 'react'
import { ChevronDown, ChevronRight, BookOpen, Building2 } from 'lucide-react'
import type { DepartmentOption } from '@/types/timetable'

interface DepartmentTreeProps {
  departments: DepartmentOption[]
  selectedDeptId: string
  onSelect: (deptId: string) => void
  loading?: boolean
}

function DeptRow({ dept, isActive, onClick }: { dept: DepartmentOption; isActive: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={dept.name}
      className="flex items-center gap-2 w-full px-[10px] py-[7px] rounded-lg border-0 cursor-pointer text-[13px] text-left"
      style={{
        background: isActive ? '#c2e7ff' : 'transparent',
        color: isActive ? '#1a1a1a' : 'var(--color-text-secondary)',
        fontWeight: isActive ? 600 : 400,
        transition: 'background 100ms',
      }}
    >
      <Building2
        size={14}
        className="shrink-0"
        style={{ color: isActive ? '#1a73e8' : 'var(--color-text-muted)' }}
      />
      <span className="truncate flex-1">{dept.name}</span>
      {dept.total_entries !== undefined && (
        <span
          className="text-[10px] shrink-0 px-[5px] py-[1px] rounded"
          style={{ color: 'var(--color-text-muted)', background: 'var(--color-bg-surface-3)' }}
        >
          {dept.total_entries}
        </span>
      )}
    </button>
  )
}

function TreeSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="animate-pulse h-8 rounded-lg"
          style={{ background: 'var(--color-bg-surface-3)' }}
        />
      ))}
    </div>
  )
}

function NoDepts() {
  return (
    <div className="flex flex-col items-center py-6 gap-2">
      <BookOpen size={28} color="var(--color-text-muted)" />
      <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
        No departments found
      </p>
    </div>
  )
}

function MobileDropdown({ departments, selectedDeptId, onSelect }: Omit<DepartmentTreeProps, 'loading'>) {
  return (
    <select
      value={selectedDeptId}
      onChange={(e) => onSelect(e.target.value)}
      aria-label="Filter by department"
      title="Filter by department"
      className="w-full px-3 py-2 rounded-lg text-[13px] border"
      style={{
        background: 'var(--color-bg-surface)',
        color: 'var(--color-text-primary)',
        borderColor: 'var(--color-border)',
      }}
    >
      <option value="all">All Departments</option>
      {departments.map((d) => (
        <option key={d.id} value={d.id}>{d.name}</option>
      ))}
    </select>
  )
}

export function DepartmentTree({ departments, selectedDeptId, onSelect, loading = false }: DepartmentTreeProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <>
      {/* Desktop sidebar tree */}
      <div className="hidden md:flex flex-col gap-[2px] w-[240px] shrink-0">
        <button
          type="button"
          className="flex items-center justify-between w-full px-[10px] py-[7px] rounded-lg border-0 cursor-pointer text-[13px] text-left"
          style={{
            background: selectedDeptId === 'all' ? '#c2e7ff' : 'transparent',
            color: selectedDeptId === 'all' ? '#1a1a1a' : 'var(--color-text-secondary)',
            fontWeight: selectedDeptId === 'all' ? 700 : 500,
            transition: 'background 100ms',
          }}
          onClick={() => { onSelect('all'); setExpanded(true) }}
        >
          <span className="flex items-center gap-[6px]">
            <Building2 size={14} className="shrink-0" />
            All Departments
          </span>
          <span
            className="flex cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        </button>

        {expanded && (
          <div className="pl-2 flex flex-col gap-[1px]">
            {loading
              ? <TreeSkeleton />
              : departments.length === 0
                ? <NoDepts />
                : departments.map((dept) => (
                    <DeptRow
                      key={dept.id}
                      dept={dept}
                      isActive={selectedDeptId === dept.id}
                      onClick={() => onSelect(dept.id)}
                    />
                  ))}
          </div>
        )}
      </div>

      {/* Mobile dropdown */}
      <div className="flex md:hidden w-full">
        <MobileDropdown departments={departments} selectedDeptId={selectedDeptId} onSelect={onSelect} />
      </div>
    </>
  )
}
"""

files = {
    f"{BASE}/components/timetables/ScoreBar.tsx": scorebar,
    f"{BASE}/components/timetables/SlotDetailPanel.tsx": slot_panel,
    f"{BASE}/components/timetables/DepartmentTree.tsx": dept_tree,
}

for path, content in files.items():
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
    print(f"Written {path.split('/')[-1]}: {content.count(chr(10))+1} lines")
