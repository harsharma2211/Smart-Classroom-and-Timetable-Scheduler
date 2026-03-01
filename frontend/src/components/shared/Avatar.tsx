// src/components/shared/Avatar.tsx
// Google Contacts–style seeded avatar with optional image override.

const PALETTE = [
  '#d32f2f','#c2185b','#7b1fa2','#512da8',
  '#1976d2','#0288d1','#00796b','#388e3c',
  '#f57c00','#5d4037',
]

function seedColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

function initials(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase()
}

type AvatarSize = 'sm' | 'md' | 'lg'

const SIZE_MAP: Record<AvatarSize, string> = {
  sm: 'var(--avatar-size-sm)',
  md: 'var(--avatar-size-md)',
  lg: 'var(--avatar-size-lg)',
}

const FONT_MAP: Record<AvatarSize, string> = {
  sm: '13px',
  md: '16px',
  lg: '20px',
}

interface AvatarProps {
  name: string
  size?: AvatarSize
  imageUrl?: string
  className?: string
}

export default function Avatar({ name, size = 'md', imageUrl, className = '' }: AvatarProps) {
  const dim = SIZE_MAP[size]

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: dim, height: dim }}
      />
    )
  }

  return (
    <div
      aria-label={name}
      className={`rounded-full shrink-0 flex items-center justify-center select-none ${className}`}
      style={{
        width: dim,
        height: dim,
        backgroundColor: seedColor(name),
        color: '#ffffff',
        fontSize: FONT_MAP[size],
        fontWeight: 500,
      }}
    >
      {initials(name)}
    </div>
  )
}
