import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { LayoutManager } from '@/core/services/layout-manager';
import { ContactManager } from '@/features/contacts/managers/contact-manager';
import { ContactRepository } from '@/features/contacts/repositories/contact-repository';
import { MatButtonModule } from '@angular/material/button';
import { IconComponent } from '@factor_ec/ui';

/**
 * Displays the contacts catalog using the reusable table layout.
 *
 * @remarks
 * The component loads data through {@link ContactRepository} and delegates detail
 * presentation to {@link ContactManager}, keeping the template free of business logic.
 */
@Component({
  selector: 'app-contact-list',
  imports: [MatButtonModule, IconComponent],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
  host: {
    class: 'ft-page'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactList implements OnInit, OnDestroy {
  // Dependency injection
  private readonly contactRepository = inject(ContactRepository);
  public readonly contactManager = inject(ContactManager);
  public readonly layoutManager = inject(LayoutManager);

  // Properties
  public readonly contacts = this.contactRepository.findBy();

  ngOnInit(): void {
    this.contacts.load();
  }

  ngOnDestroy(): void {
    this.contacts.destroy();
  }
}
