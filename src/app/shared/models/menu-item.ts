export interface MenuItem {
  url: string;
  icon: string;
  label: string;
  children?: MenuItem[];
}
