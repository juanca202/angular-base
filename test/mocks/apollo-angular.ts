export class Apollo {
  mutate() {
    return { toPromise: async () => ({}) } as any;
  }
  query() {
    return { toPromise: async () => ({}) } as any;
  }
  watchQuery() {
    return { valueChanges: { subscribe: () => ({ unsubscribe() {} }) } } as any;
  }
}
export const gql = (literals: TemplateStringsArray) => literals[0];
