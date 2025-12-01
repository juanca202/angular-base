import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { IconComponent, ObserveIntersectingDirective } from '@factor_ec/ui';

import { AppManager } from 'app/core/services/app-manager';
import { LayoutManager } from 'app/core/services/layout-manager';

@Component({
  selector: 'ft-page',
  imports: [MatButtonModule, MatDialogModule, IconComponent, ObserveIntersectingDirective],
  templateUrl: './page.html',
  styleUrl: './page.scss'
})
export class Page implements OnInit {
  public readonly appManager = inject(AppManager);
  public readonly data = inject(MAT_DIALOG_DATA);
  private readonly httpClient = inject(HttpClient);
  public readonly layoutManager = inject(LayoutManager);

  page = signal<any>(undefined);
  loading = signal<boolean>(false);

  ngOnInit(): void {
    this.httpClient.get(this.data.url).subscribe((response) => {
      this.page.set(response);
    });
  }
}
