/**
 * RequirementDTO - Representación de un Requirement (Solicitud de Desarrollo de Producto) en el sistema.
 *
 * Source: docs/contracts/dtos/requirements/requirement.dto.md
 */

// Related DTOs (simplified - these should ideally be imported from a shared DTOs location)
export interface ItemCatalogDTO {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface DivisionDTO {
  id: number;
  name: string;
}

export interface CustomerDTO {
  id: number;
  name: string;
  clientMargin: number;
  divisions: DivisionDTO[];
}

export interface RequirementDTO {
  id: number;
  name: string;
  customer: CustomerDTO;
  divisions: DivisionDTO[];
  sellByDate: string;
  type: ItemCatalogDTO;
  salesProbability: ItemCatalogDTO;
  salesPriority: ItemCatalogDTO;
  description: string;
  customerStrategy: ItemCatalogDTO;
  entryDate: string;
  startDate: string;
  dueDate: string;
  updatedAt: string;
  estimatedDevelopmentTime: number;
  remainingTime: number;
  status: ItemCatalogDTO;
  approvalStatus: ItemCatalogDTO;
  requestedBy: UserDTO;
  items?: RequirementItemDTO[];
}

export interface RequirementItemDTO {
  id: number;
  name: string;
  status: ItemCatalogDTO;
  category: ItemCatalogDTO;
  recipesCount: number;
  clientMargin: number;
  retailMaxPrice: number;
  retailMinPrice: number;
  quantityPerWeek: number;
  season: ItemCatalogDTO;
  isWet: boolean;
  tags: ItemCatalogDTO[];
  specialInstructions: NoteDTO[];
  createdAt: string;
  updatedAt: string;
  assignedTo: UserDTO;
  recipes?: RecipeDTO[];
}

export interface NoteDTO {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  files: FileDTO[];
  createdBy: UserDTO;
  replies: NoteDTO[];
}

export interface FileDTO {
  id: number;
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface RecipeDTO {
  id: number;
  category: ItemCatalogDTO;
  construction: ItemCatalogDTO;
  bouquetType: ItemCatalogDTO;
  bouquetLength: number;
  bouquetPhotos: FileDTO[];
  flowers: FlowerDTO[];
  seasonCases: SeasonCaseDTO[];
  agreements: AgreementDTO[];
  name: string;
  origin: ItemCatalogDTO;
  originCase: CaseDTO | null;
  description: string;
  waste: number;
  laborCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface FlowerDTO {
  id: number;
  name: string;
  // Add other fields as needed
}

export interface SeasonCaseDTO {
  id: number;
  name: string;
  // Add other fields as needed
}

export interface AgreementDTO {
  id: number;
  name: string;
  // Add other fields as needed
}

export interface CaseDTO {
  id: number;
  name: string;
  // Add other fields as needed
}

// Request/Response types
import { CollectionQueryParams } from '@/core/models/collection-query-params';

export interface RequirementFilters {
  name?: string;
  status?: string;
  customerId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export type RequirementSearchParams = CollectionQueryParams<RequirementFilters>;

export type RequirementRequestCreate = Omit<RequirementDTO, 'id' | 'updatedAt'> & { id?: number };
export type RequirementRequestUpdate = Pick<RequirementDTO, 'id'> &
  Partial<Omit<RequirementDTO, 'id' | 'updatedAt'>>;

export interface RequirementItemFilters {
  requirementId: number;
  name?: string;
  status?: string;
}

export type RequirementItemSearchParams = CollectionQueryParams<RequirementItemFilters>;

export type RequirementItemRequestCreate = Omit<
  RequirementItemDTO,
  'id' | 'createdAt' | 'updatedAt'
> & { id?: number };
export type RequirementItemRequestUpdate = Pick<RequirementItemDTO, 'id'> &
  Partial<Omit<RequirementItemDTO, 'id' | 'createdAt' | 'updatedAt'>>;

export interface RecipeRequestCreate {
  requirementItemId: number;
  name: string;
  category: ItemCatalogDTO;
  construction: ItemCatalogDTO;
  bouquetType: ItemCatalogDTO;
  bouquetLength: number;
  origin: ItemCatalogDTO;
  description?: string;
  waste?: number;
  laborCost?: number;
  bouquetPhotos?: FileDTO[];
  flowers?: FlowerDTO[];
  seasonCases?: SeasonCaseDTO[];
  agreements?: AgreementDTO[];
  originCase?: CaseDTO | null;
}

export type RecipeRequestUpdate = Pick<RecipeDTO, 'id'> &
  Partial<Omit<RecipeDTO, 'id' | 'createdAt' | 'updatedAt'>>;
