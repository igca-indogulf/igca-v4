// Hand-written types matching supabase/schema.sql.
// In production, regenerate with: supabase gen types typescript --project-id <id>

export type UUID = string

export type AccountType =
  | 'investor' | 'founder' | 'professional' | 'business_owner'
  | 'advisor' | 'industry_expert' | 'student' | 'other'

export interface Profile {
  id: UUID
  full_name: string
  username: string
  account_type: AccountType
  headline: string | null
  bio: string | null
  avatar_url: string | null
  location: string | null
  industry_id: UUID | null
  country_id: UUID | null
  expertise: string[] | null
  interests: string[] | null
  company_name: string | null
  website: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Industry { id: UUID; name: string; slug: string }
export interface Country { id: UUID; name: string; code: string }
export interface Topic { id: UUID; name: string; slug: string }

export interface ResearchItem {
  id: UUID
  title: string
  slug: string
  summary: string
  executive_summary: string
  category: string
  industry_id: UUID | null
  country_id: UUID | null
  topic_id: UUID | null
  featured: boolean
  published: boolean
  published_at: string
  cover_image: string | null
  reading_time: number
  source: string | null
  created_at: string
}

export interface ResearchHighlight {
  id: UUID
  research_id: UUID
  title: string
  description: string
  metric_value: string | null
  sort_order: number
}

export interface ResearchSnapshot {
  id: UUID
  research_id: UUID
  headline: string
  executive_summary: string
  key_findings: string[]
  key_opportunity: string | null
  key_risk: string | null
  conclusion: string
  created_at: string
}

export interface LearningVideo {
  id: UUID
  title: string
  description: string
  thumbnail_url: string | null
  video_url: string
  duration_seconds: number
  category: 'industry' | 'country' | 'network'
  industry_id: UUID | null
  country_id: UUID | null
  published_at: string
}

export interface Course {
  id: UUID
  title: string
  description: string
  instructor: string
  thumbnail_url: string | null
  level: 'beginner' | 'intermediate' | 'advanced'
  total_modules: number
  offers_certification: boolean
  created_at: string
}

export interface CourseModule {
  id: UUID
  course_id: UUID
  title: string
  sort_order: number
  duration_minutes: number
}

export type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed'

export interface CourseEnrollment {
  id: UUID
  user_id: UUID
  course_id: UUID
  status: EnrollmentStatus
  progress_percent: number
  enrolled_at: string
  completed_at: string | null
}

export interface LearningProgress {
  id: UUID
  user_id: UUID
  module_id: UUID
  completed: boolean
  completed_at: string | null
}

export interface Certification {
  id: UUID
  user_id: UUID
  course_id: UUID
  title: string
  issued_at: string
  credential_code: string
}

export type ConnectionRequestStatus = 'pending' | 'accepted' | 'rejected'

export interface ConnectionRequest {
  id: UUID
  sender_id: UUID
  receiver_id: UUID
  status: ConnectionRequestStatus
  created_at: string
}

export interface Connection {
  id: UUID
  user_a: UUID
  user_b: UUID
  created_at: string
}

export interface Conversation {
  id: UUID
  created_at: string
  last_message_at: string | null
}

export interface Message {
  id: UUID
  conversation_id: UUID
  sender_id: UUID
  content: string
  created_at: string
  seen_at: string | null
}

export type NotificationType =
  | 'connection_request' | 'connection_accepted' | 'research_published'
  | 'course_update' | 'system'

export interface AppNotification {
  id: UUID
  user_id: UUID
  type: NotificationType
  title: string
  body: string | null
  link: string | null
  read: boolean
  created_at: string
}

export interface WhatsAppPreferences {
  user_id: UUID
  phone_number: string | null
  opted_in: boolean
  allow_research_updates: boolean
  allow_snapshot_shares: boolean
  allow_learning_updates: boolean
  allow_account_updates: boolean
}

export type WhatsAppStatus = 'pending' | 'queued' | 'sent' | 'delivered' | 'failed' | 'retry'

export interface WhatsAppMessage {
  id: UUID
  user_id: UUID
  category: 'research' | 'snapshot_share' | 'learning' | 'account'
  payload: Record<string, unknown>
  status: WhatsAppStatus
  attempts: number
  created_at: string
}

export interface ShareEvent {
  id: UUID
  user_id: UUID
  snapshot_id: UUID
  channel: 'whatsapp' | 'link' | 'copy'
  created_at: string
}

// Minimal Database generic so supabase-js typing compiles without full codegen.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any
