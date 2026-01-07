import { OPERATION_TYPE } from '../constants/operation-type';

export interface Operation {
  type: OperationType;
  entity: any;
}

export type OperationType = (typeof OPERATION_TYPE)[keyof typeof OPERATION_TYPE];
