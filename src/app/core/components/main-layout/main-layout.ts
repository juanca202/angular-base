import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconComponent } from '@factor_ec/ui';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, IconComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {

}
