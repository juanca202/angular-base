import { OPERATION_TYPE } from '../constants/operation-type';

export interface Operation<TEntity = unknown> {
  type: OperationType;
  entity: TEntity;
}

export type OperationType = (typeof OPERATION_TYPE)[keyof typeof OPERATION_TYPE];
