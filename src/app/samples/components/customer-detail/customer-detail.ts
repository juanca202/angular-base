import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { IconComponent, ProgressComponent, ObserveIntersectingDirective } from '@factor_ec/ui';
import { LayoutManager } from 'app/core/services/layout-manager';
import { CustomerRepository } from 'app/samples/repositories/customer-repository';

@Component({
  selector: 'ft-customer-detail',
  imports: [
    CommonModule,
    IconComponent,
    ProgressComponent,
    ObserveIntersectingDirective,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormField,
    MatInputModule
  ],
  templateUrl: './customer-detail.html',
  styleUrl: './customer-detail.scss'
})
export class CustomerDetail implements OnInit {
  // Dependency injection
  private readonly customerRepository = inject(CustomerRepository);
  public readonly data = inject(MAT_DIALOG_DATA);
  private readonly formBuilder = inject(FormBuilder);
  public readonly layoutManager = inject(LayoutManager);

  // Variables
  public customer = this.customerRepository.find();
  public customerMutations = this.customerRepository.mutations();
  public form: FormGroup = new FormGroup({});

  async ngOnInit(): Promise<void> {
    if (this.data.customer?.id) {
      // await this.customer.load(this.data.customer.id);
    }
    this.initForm();
    this.form.patchValue(this.customer?.value() ?? {});
  }
  initForm(): void {
    this.form = this.formBuilder.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      phone: ['']
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formData = this.form.value;
      if (this.data.customer?.id) {
        // Update existing customer
        this.customerMutations.update(formData);
      } else {
        // Create new customer
        this.customerMutations.create(formData);
      }
    }
  }
}
