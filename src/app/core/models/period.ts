type GroupByType = 'week' | 'month' | 'year' | 'none';
export interface Period {
  label?: string;
  after: string;
  before: string;
  groupBy?: GroupByType;
  metadata?: any;
}
