export interface Badge {
  id: number;
  course_id: number;
  name: string;
  description: string;
  image: string;
  lessons_required: number;
  created_at: string;
  updated_at: string;
  course?: {
    id: number;
    title: string;
  };
}

export interface UserBadge {
  id: number;
  badge_id: number;
  user_id: number;
  earned_at: string;
  badge: Badge;
}

export interface BadgeFormData {
  course_id: number;
  name: string;
  description: string;
  image: File | string | null;
  lessons_required: number;
}
