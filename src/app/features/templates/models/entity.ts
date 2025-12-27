import { CollectionQueryParams } from '@/core/models/collection-query-params';

export interface Entity {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type EntityRequestCreate = Omit<Entity, 'id'> & { id?: string };
export type EntityRequestUpdate = Pick<Entity, 'id'> & Partial<Omit<Entity, 'id'>>;

export interface EntityFilters {
  email?: string;
  company?: string;
  isActive?: boolean;
}

export type EntitySearchParams = CollectionQueryParams<EntityFilters>;
