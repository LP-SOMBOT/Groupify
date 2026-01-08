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

export function generateMockGroups(count: number): any[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: `mock-${i}`,
    name: `Group ${i + 1}`,
    description: `This is a description for group ${i + 1}. It is a great place to connect.`,
    category: ['Technology', 'Social', 'Business'][i % 3],
    inviteLink: '#',
    isVerified: i % 3 === 0,
    memberCount: Math.floor(Math.random() * 500) + 10,
    tags: ['react', 'community', 'tech'],
    createdBy: 'mock-user',
    createdAt: new Date(),
    iconUrl: `https://picsum.photos/seed/${i}/200`
  }));
}