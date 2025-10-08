import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CustomerDetail } from '../components/customer-detail/customer-detail';
import { Customer } from '../models/customer';

@Injectable({
  providedIn: 'root',
})
export class CustomerManager {
  private readonly dialog = inject(MatDialog);

  public open(customer: Customer) {
    this.dialog.open(CustomerDetail, {
      data: {
        customer,
      },
    });
  }
}
