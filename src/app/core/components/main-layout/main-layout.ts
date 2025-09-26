import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { IconComponent } from '@factor_ec/ui';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, IconComponent, MatButtonModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
