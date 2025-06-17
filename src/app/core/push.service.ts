import { inject, Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  private zone = inject(NgZone);
  private messageSubject = new Subject<any>();
  readonly message = this.messageSubject.asObservable();

  constructor() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.zone.run(() => {
          this.messageSubject.next(event.data);
        });
      });
    }
  }
}
