import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChangePassword } from '../components/change-password/change-password';
import { DeleteUser } from '../components/delete-user/delete-user';

@Injectable({
  providedIn: 'root'
})
export class AuthManager {
  // Dependency injection
  private readonly dialog = inject(MatDialog);

  public changePassword(): void {
    this.dialog.open(ChangePassword, {
      panelClass: 'ft-dialog',
      width: '400px'
    });
  }
  public confirmDeleteUser(): void {
    this.dialog.open(DeleteUser, {
      panelClass: 'ft-dialog',
      width: '400px'
    });
  }
}
