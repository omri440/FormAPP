import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {
  private auth = inject(Auth);

  user = this.auth.currentUser;
  isSidebarOpen = signal(true);

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  logout(): void {
    this.auth.logout();
  }
}
