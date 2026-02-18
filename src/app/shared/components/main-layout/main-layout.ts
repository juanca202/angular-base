import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, RouterOutlet } from '@angular/router';

import { AvatarComponent, IconComponent } from '@factor_ec/ui';

import { AuthProvider } from '@/core/models/auth.provider';
import { Session } from '@/core/services/session';
import { MenuItem } from '@/shared/models/menu-item';

/**
 * Provides the primary shell layout, handling navigation links and user profile
 * affordances across the authenticated experience.
 */
@Component({
  selector: 'app-main-layout',
  imports: [AvatarComponent, IconComponent, MatButtonModule, RouterModule, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ft-main-layout'
  }
})
export class MainLayout implements OnInit {
  // Dependency injection
  public readonly authService = inject(AuthProvider);
  public readonly bottomSheet = inject(MatBottomSheet);
  public readonly session = inject(Session);

  // Properties
  public readonly navigationOptions = signal<MenuItem[]>([]);
  public readonly selectedOption = signal<MenuItem | null>(null);
  public readonly collapsed = signal<boolean>(false);

  ngOnInit(): void {
    // @todo implements navigationOptions filling
  }
  public toggleCollapse(): void {
    this.collapsed.set(!this.collapsed());
  }
}
