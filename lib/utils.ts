import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCompactNumber(number: number) {
  return Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(number);
}

export function getDeviceId() {
  let id = localStorage.getItem('unique_device_id');
  if (!id) {
    // Fallback if crypto.randomUUID is not available in some older mobile browsers
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
       id = crypto.randomUUID();
    } else {
       id = 'device_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }
    localStorage.setItem('unique_device_id', id);
  }
  return id;
}

export function getNameInitials(name: string | null) {
  if (!name) return 'U';
  return name.trim().split(' ')[0].charAt(0).toUpperCase();
}

export function generateMockGroups(count: number): any[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: `mock-${i}`,
    name: `Group ${i + 1}`,
    description: `This is a description for group ${i + 1}.`,
    category: ['Technology', 'Social', 'Business'][i % 3],
    inviteLink: '#',
    isVerified: i % 3 === 0,
    memberCount: Math.floor(Math.random() * 500) + 10,
    tags: ['react', 'community', 'tech'],
    createdBy: 'mock-user',
    createdAt: new Date(),
    iconUrl: `https://picsum.photos/seed/${i}/200`,
    views: 0,
    clicks: 0
  }));
}