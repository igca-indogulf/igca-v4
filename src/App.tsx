import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/layout/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'

import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import Home from '@/pages/Home'
import Learn from '@/pages/Learn'
import ResearchListing from '@/pages/ResearchListing'
import ResearchDetail from '@/pages/ResearchDetail'
import SnapshotsListing from '@/pages/SnapshotsListing'
import SnapshotView from '@/pages/SnapshotView'
import VideosListing from '@/pages/VideosListing'
import CoursesListing from '@/pages/CoursesListing'
import CourseDetail from '@/pages/CourseDetail'
import Network from '@/pages/Network'
import Clients from '@/pages/Clients'
import Messages from '@/pages/Messages'
import Notifications from '@/pages/Notifications'
import ProfilePage from '@/pages/ProfilePage'
import Settings from '@/pages/Settings'
import NotFound from '@/pages/NotFound'

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/home" element={<Protected><Home /></Protected>} />

      <Route path="/learn" element={<Protected><Learn /></Protected>} />
      <Route path="/learn/research" element={<Protected><ResearchListing /></Protected>} />
      <Route path="/learn/research/:slug" element={<Protected><ResearchDetail /></Protected>} />
      <Route path="/learn/snapshots" element={<Protected><SnapshotsListing /></Protected>} />
      <Route path="/learn/snapshots/:id" element={<Protected><SnapshotView /></Protected>} />
      <Route path="/learn/videos" element={<Protected><VideosListing /></Protected>} />
      <Route path="/learn/courses" element={<Protected><CoursesListing /></Protected>} />
      <Route path="/learn/courses/:id" element={<Protected><CourseDetail /></Protected>} />

      <Route path="/network" element={<Protected><Network /></Protected>} />
      <Route path="/network/:id" element={<Protected><Network /></Protected>} />
      <Route path="/clients" element={<Protected><Clients /></Protected>} />

      <Route path="/messages" element={<Protected><Messages /></Protected>} />
      <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
      <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
      <Route path="/settings" element={<Protected><Settings /></Protected>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
