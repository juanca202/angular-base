import { Component, inject, signal } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AvatarComponent, IconComponent } from '@factor_ec/ui';

import { AuthService } from 'app/auth/auth-service';

@Component({
  selector: 'app-main-layout',
  imports: [AvatarComponent, IconComponent, MatButtonModule, RouterModule, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
  host: {
    class: 'ft-main-layout',
  },
})
export class MainLayout {
  // Dependency injection
  public readonly authService = inject(AuthService);
  public readonly bottomSheet = inject(MatBottomSheet);

  // Properties
  public navigationOptions = signal([
    {
      url: '/home',
      icon: 'home',
      label: $localize`Home`,
    },
    {
      url: '/customer-list',
      icon: 'task',
      label: $localize`My tasks`,
    },
    {
      url: '/sample1',
      icon: 'money',
      label: $localize`Payment & Collections`,
      children: [
        {
          url: '/sample1',
          icon: 'money',
          label: $localize`Payment`,
        },
        {
          url: '/sample3',
          icon: 'money',
          label: $localize`Collections`,
        },
      ],
    },
    {
      url: '/sample4',
      icon: 'building',
      label: $localize`Business partners`,
      children: [
        {
          url: '/sample4',
          icon: 'building',
          label: $localize`Business partners`,
        },
        {
          url: '/sample6',
          icon: 'building',
          label: $localize`Business partners`,
        },
      ],
    },
    {
      url: '/sample7',
      icon: 'sales-order',
      label: $localize`Sales`,
      children: [
        {
          url: '/sample7',
          icon: 'sales-order',
          label: $localize`Sales`,
        },
      ],
    },
    {
      url: '/sample9',
      icon: 'list',
      label: $localize`Operations`,
      children: [
        {
          url: '/sample9',
          icon: 'list',
          label: $localize`Operations`,
        },
      ],
    },
    {
      url: '/sample11',
      icon: 'execute',
      label: $localize`Tools`,
      children: [
        {
          url: '/sample11',
          icon: 'execute',
          label: $localize`Tools`,
        },
      ],
    },
  ]);
  selectedOption = signal<any>(null);
  collapsed = signal<boolean>(false);

  toggleCollapse(): void {
    this.collapsed.set(!this.collapsed());
  }
}
