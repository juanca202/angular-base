import { Component, input, OnInit, signal, inject } from '@angular/core';

import { IconComponent } from '@factor_ec/ui';

import { SubscriptionService } from 'app/core/subscription.service';

import { GoogleTagManagerService } from '@factor_ec/utils';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subscription-detail',
  imports: [CommonModule, IconComponent],
  templateUrl: './subscription-detail.html',
  styleUrl: './subscription-detail.scss',
  standalone: true
})
export class SubscriptionDetail implements OnInit {
  private readonly googleTagManagerService = inject(GoogleTagManagerService);
  private readonly subscriptionService = inject(SubscriptionService);

  message = input<string>();
  subscriptionDetail = signal<any>(undefined);
  features = signal<string[]>([]);

  async ngOnInit(): Promise<void> {
    this.googleTagManagerService.addVariable({ event: 'subscription_detail' });
    this.subscriptionDetail.set(await this.subscriptionService.getDetails());
  }
}
