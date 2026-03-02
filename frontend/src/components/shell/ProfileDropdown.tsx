'use client'

/**
 * ProfileDropdown — Google Account–style profile panel.
 *
 * Dimensions (matching Google's exact layout):
 *   • Outer: fixed top-[70px] right-[11px], width 420px, rounded-[28px]
 *   • Header (non-scrollable): email row + avatar section
 *   • Scrollable cards: max-height 280px, styled 6px scrollbar
 *
 * Background: #eaf0f6 (Google's Alice-Blue surface) / #202124 dark
 * Loading: thin progress bar at top while user data is pending
 */

import Link from 'next/link'
import { useTheme } from 'next-themes'
import {
  X,
  LogOut,
  Sun,
  Moon,
  User as UserIcon,
  ShieldCheck,
  Settings,
  Globe,
  HelpCircle,
} from 'lucide-react'
import Avatar from '@/components/shared/Avatar'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileUser {
  email?: string
  first_name?: string
}

interface ProfileDropdownProps {
  user: ProfileUser | null
  displayName: string
  role: 'admin' | 'faculty' | 'student'
  rolePill: string
  mounted: boolean
  onClose: () => void
  onSignOut: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfileDropdown({
  user,
  displayName,
  role,
  rolePill,
  mounted,
  onClose,
  onSignOut,
}: ProfileDropdownProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const isLoading = !user

  return (
    /*
     * Fixed position matching the user's requested CSS:
     *   position: absolute; top: 0; margin-top: 70px;
     *   right: 0; margin-right: 11px; width: 420px; z-index: 991;
     * We implement this as fixed top-[70px] right-[11px] which is equivalent
     * for a full-viewport context.
     */
    <div
      className="fixed top-[70px] right-[11px] w-[420px] rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.20)] bg-[#eaf0f6] dark:bg-[#202124] border border-[#cdd3de] dark:border-[#3c4043] overflow-hidden z-[991] flex flex-col"
    >
      {/* ── Loading bar — visible while user data is pending ── */}
      <div
        className="h-[3px] w-full overflow-hidden shrink-0"
        aria-hidden="true"
      >
        {isLoading && (
          <div className="h-full w-full bg-[#4285f4] origin-left animate-[profileLoad_1.4s_ease-in-out_infinite]" />
        )}
      </div>

      {/* ── Row 1: centered email + X ── */}
      <div className="relative flex items-center justify-center h-12 px-12 shrink-0">
        {isLoading ? (
          <div className="h-4 w-44 rounded-full bg-[#c8d0da] dark:bg-[#3c4043] animate-pulse" />
        ) : (
          <span className="text-[15px] font-normal text-[#1f1f1f] dark:text-[#e8eaed] truncate select-none">
            {user?.email ?? ''}
          </span>
        )}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 w-8 h-8 flex items-center justify-center rounded-full text-[#5f6368] dark:text-[#9aa0a6] hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Row 2: avatar + Hi + full name (NOT in scroll area) ── */}
      <div className="flex flex-col items-center px-6 pt-5 pb-4 shrink-0">
        <div className="relative">
          <Avatar name={displayName} size={72} />
          {/* Camera overlay — matching Google's edit-photo hint */}
          <span className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full bg-[#1f1f1f]/70 dark:bg-white/20 flex items-center justify-center pointer-events-none">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
              <path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8a3.2 3.2 0 0 1 3.2 3.2 3.2 3.2 0 0 1-3.2 3.2m7-10.2h-1.8l-1.5-2H8.3L6.8 5H5C3.9 5 3 5.9 3 7v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/>
            </svg>
          </span>
        </div>
        {isLoading ? (
          <div className="mt-4 h-6 w-28 rounded-full bg-[#c8d0da] dark:bg-[#3c4043] animate-pulse" />
        ) : (
          <p className="mt-4 text-[22px] font-normal text-[#202124] dark:text-[#e8eaed] leading-snug">
            Hi, {user?.first_name || displayName.split(' ')[0]}!
          </p>
        )}
        <p className="mt-0.5 mb-4 text-[13px] text-[#5f6368] dark:text-[#9aa0a6]">
          {displayName}
        </p>
      </div>

      {/* ── Scrollable cards section — max-height 280px ── */}
      <div className="profile-scroll overflow-y-auto px-3 pb-3 flex flex-col gap-2">

        {/* Role badge */}
        <div className="bg-white dark:bg-[#2d2f31] rounded-[20px] px-4 py-3 flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#5f6368] dark:text-[#9aa0a6] shrink-0" />
          <span className="text-[13px] text-[#5f6368] dark:text-[#9aa0a6] flex-1">Logged in as</span>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#c2e7ff] dark:bg-[#1C2B4A] text-[#001d35] dark:text-[#8AB4F8] uppercase tracking-wider">
            {rolePill}
          </span>
        </div>

        {/* Profile | Sign out */}
        <div className="flex rounded-full border border-[#c5ccd8] dark:border-[#5f6368] bg-white dark:bg-[#2d2f31] overflow-hidden">
          <Link
            href={`/${role}/profile`}
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-[14px] font-medium text-[#1f1f1f] dark:text-[#e8eaed] hover:bg-[#eaf0f6] dark:hover:bg-[#3c4043] transition-colors"
          >
            <UserIcon size={15} className="shrink-0" />
            Profile
          </Link>
          <div className="w-px my-2 bg-[#c5ccd8] dark:bg-[#5f6368]" />
          <button
            onClick={onSignOut}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-[14px] font-medium text-[#1f1f1f] dark:text-[#e8eaed] hover:bg-[#eaf0f6] dark:hover:bg-[#3c4043] transition-colors"
          >
            <LogOut size={15} className="shrink-0" />
            Sign out
          </button>
        </div>

        {/* Settings + Theme */}
        <div className="bg-white dark:bg-[#2d2f31] rounded-[20px] overflow-hidden">
          <Link
            href={`/${role}/settings`}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3.5 text-[14px] text-[#1f1f1f] dark:text-[#e8eaed] hover:bg-[#dde5ef] dark:hover:bg-[#3c4043] transition-colors"
          >
            <Settings size={18} className="text-[#5f6368] dark:text-[#9aa0a6] shrink-0" />
            <span className="flex-1">Settings</span>
          </Link>
          <div className="h-px mx-4 bg-[#dde2eb] dark:bg-[#3c4043]" />
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-[14px] text-[#1f1f1f] dark:text-[#e8eaed] hover:bg-[#dde5ef] dark:hover:bg-[#3c4043] transition-colors text-left"
          >
            {mounted && resolvedTheme === 'dark'
              ? <Sun  size={18} className="text-[#5f6368] dark:text-[#9aa0a6] shrink-0" />
              : <Moon size={18} className="text-[#5f6368] dark:text-[#9aa0a6] shrink-0" />
            }
            <span className="flex-1">
              {mounted && resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
            </span>
          </button>
        </div>

        {/* Language | Help */}
        <div className="bg-white dark:bg-[#2d2f31] rounded-[20px] overflow-hidden flex">
          <button className="flex-1 flex items-center gap-2 px-4 py-3.5 text-[14px] text-[#1f1f1f] dark:text-[#e8eaed] hover:bg-[#dde5ef] dark:hover:bg-[#3c4043] transition-colors">
            <Globe      size={17} className="text-[#5f6368] dark:text-[#9aa0a6] shrink-0" />
            <span>Language</span>
          </button>
          <div className="w-px my-3 bg-[#dde2eb] dark:bg-[#3c4043]" />
          <button className="flex-1 flex items-center gap-2 px-4 py-3.5 text-[14px] text-[#1f1f1f] dark:text-[#e8eaed] hover:bg-[#dde5ef] dark:hover:bg-[#3c4043] transition-colors">
            <HelpCircle size={17} className="text-[#5f6368] dark:text-[#9aa0a6] shrink-0" />
            <span>Help</span>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-[12px] text-[#5f6368] dark:text-[#9aa0a6] pt-1 pb-1">
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          <span className="mx-1.5">&bull;</span>
          <a href="/terms" className="hover:underline">Terms of Service</a>
        </p>

      </div>
    </div>
  )
}
