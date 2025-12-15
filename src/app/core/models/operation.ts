import { OperationType } from '../constants/operation-type';

export interface Operation {
  type: OperationType;
  entity: any;
}
