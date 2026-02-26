import { z } from 'zod';

export const ParameterSchema = z.object({
  no3: z.number().nonnegative(),
  po4: z.number().nonnegative(),
  alk: z.number().nonnegative(),
  ca: z.number().nonnegative(),
  mg: z.number().nonnegative(),
  ph: z.number().min(6).max(9),
  salinity: z.number().min(1.018).max(1.03),
  temperature: z.number().min(70).max(86),
  ammonia: z.number().nonnegative(),
  nitrite: z.number().nonnegative(),
});

export type ParameterInput = z.infer<typeof ParameterSchema>;
export type Role = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface ApiListQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TankOverview {
  id: string;
  name: string;
  volumeGallons: number;
  tankType: string;
  livestockCount: number;
  riskScore: number;
}
