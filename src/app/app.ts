import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconComponent } from '@factor_ec/ui';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IconComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'angular-base-project';
  public authService = inject(AuthService);
}
