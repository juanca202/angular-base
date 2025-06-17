import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { lastValueFrom } from 'rxjs';
import { GoogleTagManagerService } from '@factor_ec/utils';
import { MessageService } from '@factor_ec/ui';

import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth.service';

declare let PaymentRequest: any;
declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private authService = inject(AuthService);
  private httpClient = inject(HttpClient);
  private googleTagManagerService = inject(GoogleTagManagerService);
  private messageService = inject(MessageService);

  async getDetails(): Promise<any> {
    if ('getDigitalGoodsService' in window) {
      const service = await window.getDigitalGoodsService(
        'https://play.google.com/billing'
      );
      const details = await service.getDetails(['tplus']);
      console.log(details);
      return details[0];
    } else {
      console.log('getDigitalGoodsService is not available.');
      return null;
    }
  }
  async pay(sku: string): Promise<boolean> {
    let paymentResponse;
    this.googleTagManagerService.addVariable({ event: 'subscribe_start' });
    try {
      const request: PaymentRequest = new PaymentRequest([
        {
          supportedMethods: 'https://play.google.com/billing',
          data: {
            sku
          }
        }
      ]);
      paymentResponse = await request.show();
      const response = await this.activate(sku, 'google-play', paymentResponse);
      if (response.status === 'active') {
        paymentResponse.complete('success');
        this.messageService.show(
          $localize`Your subscription has been processed and is active, we appreciate your trust.`,
          {
            type: 'modal',
            icon: {
              name: 'check--circle',
              collection: 'factoricons-slim',
              class: 'ft-tc-success ft-mbe-3 ft-icon--5'
            },
            actions: [
              {
                label: $localize`Accept`,
                value: 1,
                type: 'stroked',
                metadata: { color: 'primary' }
              }
            ]
          }
        );
        this.authService.getSettings(true);
        this.googleTagManagerService.addVariable({
          event: 'subscribe_success'
        });
        return true;
      } else {
        paymentResponse.complete('fail');
        this.messageService.show(
          $localize`There was an error, please try again later.`,
          {
            type: 'modal',
            icon: {
              name: 'warning',
              collection: 'factoricons-slim',
              class: 'ft-tc-danger ft-mbe-3 ft-icon--5'
            },
            actions: [
              {
                label: $localize`Accept`,
                value: 1,
                type: 'stroked',
                metadata: { color: 'primary' }
              }
            ]
          }
        );
        this.googleTagManagerService.addVariable({ event: 'subscribe_failed' });
        return false;
      }
    } catch (err) {
      if (paymentResponse) {
        paymentResponse.complete('fail');
      }
      console.error(err);
      return false;
    }
  }
  async activate(
    planCode: string,
    paymentGateway: string,
    payment: any
  ): Promise<{ status: string; subscription: any }> {
    const response = (await lastValueFrom(
      this.httpClient.post(
        `${environment.restEndpoint}/subscription/${paymentGateway}/${planCode}/activate`,
        payment
      )
    )) as any;
    console.log(response);
    return response;
  }
}
