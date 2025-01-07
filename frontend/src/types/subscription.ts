import { z } from 'zod';

export interface SubscriptionType {
  id: number;
  name: string;
  duration: number;
  availabilityStartDate: string;
  availabilityEndDate: string;
  price: number;
  discount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: number;
  userId: string;
  startDate: string;
  subscriptionType: SubscriptionType;
  createdAt: string;
  updatedAt: string;
}

export const subscriptionTypeSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  duration: z.number().int().positive('Duration must be a positive number'),
  availabilityStartDate: z.string().min(1, 'Start date is required'),
  availabilityEndDate: z.string().min(1, 'End date is required'),
  price: z.number().positive('Price must be greater than 0'),
  discount: z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
});

export type SubscriptionTypeFormData = z.infer<typeof subscriptionTypeSchema>;