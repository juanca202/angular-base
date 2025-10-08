import { Component, inject, OnInit } from '@angular/core';

import { ObserveIntersectingDirective } from '@factor_ec/ui';

import { LayoutManager } from 'app/core/layout-manager';
import { CustomerManager } from 'app/samples/managers/customer-manager';
import { CustomerRepository } from 'app/samples/repositories/customer-repository';

@Component({
  selector: 'app-customer-list',
  imports: [ObserveIntersectingDirective],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.scss',
  host: {
    class: 'ft-page',
  },
})
export class CustomerList implements OnInit {
  // Injección de dependencias
  private readonly customerRepository = inject(CustomerRepository);
  public readonly customerManager = inject(CustomerManager);
  public readonly layoutManager = inject(LayoutManager);

  // Propiedades
  public readonly customers = this.customerRepository.findByFilter();

  ngOnInit(): void {
    this.customers.load();
  }

  // Getter para exponer los customers al template
  get customersData() {
    return this.customers.value();
  }
}
