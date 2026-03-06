import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-user-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserLayout {
  private auth = inject(Auth);

  user = this.auth.currentUser;
  isMenuOpen = signal(false);

  get userInitials(): string {
    const email = this.user()?.email ?? '';
    return email.slice(0, 2).toUpperCase();
  }

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  logout(): void {
    this.auth.logout();
  }
}
