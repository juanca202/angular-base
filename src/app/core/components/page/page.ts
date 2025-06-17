import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { IconComponent, ObserveIntersectingDirective } from '@factor_ec/ui';

import { AppService } from 'app/core/app.service';

@Component({
  selector: 'app-page',
  imports: [
    MatButtonModule,
    MatDialogModule,
    IconComponent,
    ObserveIntersectingDirective
  ],
  templateUrl: './page.html',
  styleUrl: './page.scss'
})
export class Page implements OnInit {
  appService = inject(AppService);
  data = inject(MAT_DIALOG_DATA);
  private httpClient = inject(HttpClient);

  page = signal<any>(undefined);
  loading = signal<boolean>(false);

  ngOnInit(): void {
    this.httpClient.get(this.data.url).subscribe((response) => {
      this.page.set(response);
    });
  }
}
