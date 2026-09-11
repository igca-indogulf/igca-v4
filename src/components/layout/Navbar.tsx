import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  GraduationCap, Home, Users, Briefcase, MessageSquare, Bell,
  Settings, LogOut, Menu, X, ChevronDown, User as UserIcon
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotificationCount } from '@/hooks/useNotificationCount'
import { Avatar } from '@/components/ui/Avatar'

const mainNav = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/learn', label: 'Learn & Grow', icon: GraduationCap, emphasize: true },
  { to: '/network', label: 'Connect & Network', icon: Users },
  { to: '/clients', label: 'Find New Clients', icon: Briefcase }
]

export function Navbar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const unread = useNotificationCount()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-ink-900/5">
      <div className="container-app flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link to="/home" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-ink-900 flex items-center justify-center text-gold-400 font-display font-semibold text-sm">IG</div>
            <span className="font-display font-semibold text-lg tracking-tight text-ink-900">IGCA</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {mainNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : item.emphasize
                      ? 'text-ink-900 hover:bg-surface-100'
                      : 'text-ink-700 hover:bg-surface-100'
                  }`
                }
              >
                <item.icon className="h-4 w-4" strokeWidth={2.2} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <Link to="/messages" className="p-2.5 rounded-lg hover:bg-surface-100 text-ink-700" aria-label="Messages">
            <MessageSquare className="h-5 w-5" />
          </Link>
          <Link to="/notifications" className="relative p-2.5 rounded-lg hover:bg-surface-100 text-ink-700" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full bg-gold-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-lg hover:bg-surface-100"
            >
              <Avatar url={profile?.avatar_url} name={profile?.full_name ?? 'U'} size={32} />
              <ChevronDown className="h-4 w-4 text-ink-700" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 card p-1.5" onMouseLeave={() => setMenuOpen(false)}>
                <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-100 text-ink-800">
                  <UserIcon className="h-4 w-4" /> Profile
                </Link>
                <Link to="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-100 text-ink-800">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-100 text-red-600">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        <button className="lg:hidden p-2 text-ink-800" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-ink-900/5 bg-white">
          <nav className="container-app py-2 flex flex-col">
            {mainNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold ${isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-800'}`
                }
              >
                <item.icon className="h-5 w-5" /> {item.label}
              </NavLink>
            ))}
            <div className="h-px bg-ink-900/5 my-2" />
            <Link to="/messages" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-ink-800">
              <MessageSquare className="h-5 w-5" /> Messages
            </Link>
            <Link to="/notifications" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-ink-800">
              <Bell className="h-5 w-5" /> Notifications {unread > 0 && `(${unread})`}
            </Link>
            <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-ink-800">
              <UserIcon className="h-5 w-5" /> Profile
            </Link>
            <Link to="/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-ink-800">
              <Settings className="h-5 w-5" /> Settings
            </Link>
            <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-red-600 text-left">
              <LogOut className="h-5 w-5" /> Sign out
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
