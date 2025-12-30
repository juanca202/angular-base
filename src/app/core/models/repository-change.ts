export interface RepositoryChange {
  type: 'create' | 'update' | 'delete';
  ids: string[];
}
