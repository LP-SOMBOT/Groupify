export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  bio?: string;
  joinedAt: number;
  balance: number;
  isBanned: boolean;
  isCreator: boolean;
  isBetaTester: boolean;
  monetizationFrozen: boolean;
  paymentPin?: string;
  creatorWelcomeSeen?: boolean;
}

export type GroupStatus = 'pending' | 'approved' | 'rejected';

export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  inviteLink: string;
  iconUrl?: string; 
  isVerified: boolean;
  isGuidelineViolation: boolean;
  status: GroupStatus;
  memberCount: number;
  tags: string[];
  createdBy: string;
  creatorName?: string; // Snapshot
  creatorPhoto?: string; // Snapshot
  createdAt: number;
  views: number;
  clicks: number;
  accessType?: 'Free' | 'Paid';
  price?: number;
  currency?: string;
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
  accessType?: 'Free' | 'Paid';
  price?: number;
  iconUrl?: string;
  memberCount: number;
  creatorName?: string;
  creatorPhoto?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'update' | 'alert';
  timestamp: number;
  isBroadcast: boolean; 
  targetUserId?: string; 
  read: boolean;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  provider: string; // e.g. "EVC Plus"
  instruction: string; // e.g. "Send to 61xxxxxx"
  isEnabled: boolean;
}

export type PaymentMethod = string; // Dynamic now

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: PaymentMethod;
  accountNumber: string;
  status: 'pending' | 'paid' | 'rejected';
  timestamp: number;
}