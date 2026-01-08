export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  bio?: string;
  joinedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  inviteLink: string;
  iconUrl?: string;
  isVerified: boolean;
  memberCount: number;
  tags: string[];
  createdBy: string;
  createdAt: number; // Storing as millis for easier serialization
}

export type Category = 'Technology' | 'Education' | 'Entertainment' | 'Business' | 'Social' | 'Other';

export const CATEGORIES: Category[] = [
  'Technology', 'Education', 'Entertainment', 'Business', 'Social', 'Other'
];

export interface CreateGroupData {
  name: string;
  description: string;
  category: Category;
  inviteLink: string;
  tags: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'update' | 'alert';
  createdAt: number;
}