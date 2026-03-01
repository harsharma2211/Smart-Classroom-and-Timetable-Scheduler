// src/components/shared/SearchBar.tsx
// Pill search input — Google-style, matches .input-search styles in globals.css.
'use client'

import { useRef } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
}: SearchBarProps) {
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div className={`relative flex-1 min-w-0 ${className}`}>
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <Search size={16} />
      </span>

      <input
        ref={ref}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-search pr-9"
      />

      {value && (
        <button
          type="button"
          onClick={() => { onChange(''); ref.current?.focus() }}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}
