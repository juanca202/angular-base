import { Component, inject, OnInit } from '@angular/core';

import { ObserveIntersectingDirective } from '@factor_ec/ui';

import { LayoutManager } from 'app/core/services/layout-manager';
import { CustomerManager } from 'app/samples/managers/customer-manager';
import { CustomerRepository } from 'app/samples/repositories/customer-repository';

@Component({
  selector: 'ft-customer-list',
  imports: [ObserveIntersectingDirective],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.scss',
  host: {
    class: 'ft-page'
  }
})
export class CustomerList implements OnInit {
  // Dependency injection
  private readonly customerRepository = inject(CustomerRepository);
  public readonly customerManager = inject(CustomerManager);
  public readonly layoutManager = inject(LayoutManager);

  // Properties
  public readonly customers = this.customerRepository.findBy();

  ngOnInit(): void {
    this.customers.load();
  }

  // Getter to expose customers to the template
  get customersData() {
    return this.customers.value();
  }
}
