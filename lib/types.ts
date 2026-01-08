export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  bio?: string;
  joinedAt: number;
  balance: number;
  isBanned: boolean;
  isCreator: boolean; // Approved for monetization
  monetizationFrozen: boolean;
  paymentPin?: string; // Encrypted ideally, but plain for this demo scope
}

export type GroupStatus = 'pending' | 'approved' | 'rejected';

export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  inviteLink: string;
  iconUrl?: string; // Base64 or URL
  isVerified: boolean;
  status: GroupStatus;
  memberCount: number;
  tags: string[];
  createdBy: string;
  createdAt: number;
  // Monetization fields (Views/Clicks)
  views: number;
  clicks: number;
  // Monetization config
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
  iconUrl?: string; // Base64
  memberCount: number;
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

export type PaymentMethod = 'EVC Plus' | 'Zaad' | 'Sahal';

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