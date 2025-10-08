import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { getMutations, getResource, SignalGet } from 'app/core/rest-api';
import { Customer, CustomerRequest } from '../models/customer';
import { delay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomerRepository {
  private readonly httpClient = inject(HttpClient);
  // private readonly baseUrl = getApiUrl('v1/customers');
  private readonly baseUrl = 'samples/customers.json';

  public mutations() {
    return getMutations({
      create: (customer: CustomerRequest) =>
        this.httpClient.post<Customer>(`${this.baseUrl}`, customer),
      update: (customer: CustomerRequest) =>
        this.httpClient.put<Customer>(`${this.baseUrl}`, customer),
    });
  }
  public find(): SignalGet<string, Customer> {
    return getResource<string, Customer>((id: string) => {
      return this.httpClient.get<Customer>(`${this.baseUrl}/${id}`);
    });
  }
  public findByFilter(): SignalGet<void, Customer[]> {
    return getResource<void, Customer[]>(() => {
      return this.httpClient.get<Customer[]>(`${this.baseUrl}`).pipe(delay(2000));
    });
  }
}
