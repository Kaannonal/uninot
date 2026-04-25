export type UserRole = 'user' | 'admin'
export type UserStatus = 'active' | 'banned'
export type NoteStatus = 'pending' | 'approved' | 'rejected' | 'under_review' | 'removed'
export type NoteType = 'vize' | 'final' | 'ozet' | 'formul' | 'diger'
export type EarningStatus = 'estimated' | 'confirmed' | 'paid' | 'withheld'
export type ReportStatus = 'open' | 'resolved' | 'dismissed'

export interface University { id: string; name: string; city: string; slug: string }
export interface Faculty { id: string; university_id: string; name: string }
export interface Department { id: string; faculty_id: string; name: string; code: string }
export interface Course { id: string; department_id: string; code: string; name: string; language: string }

export interface Note {
  id: string; user_id: string; course_id: string; title: string; description: string
  file_url: string; note_type: NoteType; term: string; page_count: number
  status: NoteStatus; avg_rating: number; view_count: number; download_count: number
  created_at: string
}

export interface NoteView { id: string; note_id: string; user_id: string; duration_seconds: number; is_valid: boolean; viewed_at: string }
export interface NoteDownload { id: string; note_id: string; user_id: string; is_valid: boolean; downloaded_at: string }
export interface Review { id: string; note_id: string; user_id: string; rating: number; comment: string; created_at: string }

export interface Earning {
  id: string; user_id: string; note_id: string; month: string
  valid_views: number; valid_downloads: number; performance_score: number
  creator_net_earning: number; status: EarningStatus
}

export interface Report { id: string; note_id: string; reporter_id: string; reason: string; status: ReportStatus; created_at: string }

export interface Profile {
  id: string; full_name: string | null; university_id: string | null
  department_id: string | null; role: UserRole; status: UserStatus; created_at: string
}

export interface Favorite { id: string; note_id: string; user_id: string; created_at: string }
