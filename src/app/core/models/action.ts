export interface Action {
  id?: string;
  uuid: string;
  type: string;
  selected: string;
  selectedObject?: any;
  options: {
    label: string;
    value: string;
    queryParams: any;
  }[];
  payload?: any;
}
